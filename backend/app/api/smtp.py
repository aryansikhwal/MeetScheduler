from fastapi import APIRouter, HTTPException, Query, Request
import smtplib
from ssl import create_default_context
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import (
    SMTPAccountCreate,
    SMTPAccountResponse,
    SMTPAccountListResponse,
    SMTPTestRequest,
    SMTPTestResponse
)
from app.models.repositories import SMTPAccountRepository
from app.core.security import encrypt_token, decrypt_token

router = APIRouter(prefix="/smtp", tags=["SMTP Management"])
limiter = Limiter(key_func=get_remote_address)


def mask_email(email: str) -> str:
    """Mask email address for display (e.g., t***@gmail.com)."""
    if not email or '@' not in email:
        return '***'
    parts = email.split('@')
    local = parts[0]
    domain = parts[1]
    if len(local) <= 2:
        masked_local = local[0] + '***'
    else:
        masked_local = local[0] + '***' + local[-1]
    return f"{masked_local}@{domain}"


def test_smtp_connection(host: str, port: int, user: str, password: str) -> tuple[bool, str]:
    """
    Test SMTP connection with provided credentials.
    Returns (success, message).
    """
    try:
        if port == 465:
            # SSL connection
            context = create_default_context()
            with smtplib.SMTP_SSL(host, port, timeout=10, context=context) as server:
                server.login(user, password)
            return True, "SMTP connection successful (SSL)"
        else:
            # STARTTLS connection (587, 25, 2525)
            with smtplib.SMTP(host, port, timeout=10) as server:
                server.starttls()
                server.login(user, password)
            return True, "SMTP connection successful (STARTTLS)"
    except smtplib.SMTPAuthenticationError:
        return False, "Authentication failed. Check username and password."
    except smtplib.SMTPConnectError:
        return False, f"Could not connect to {host}:{port}"
    except smtplib.SMTPServerDisconnected:
        return False, "Server unexpectedly disconnected"
    except TimeoutError:
        return False, "Connection timed out"
    except Exception as e:
        return False, f"Connection failed: {str(e)}"


@router.post("/add", response_model=SMTPAccountResponse)
async def add_smtp_account(
    smtp_data: SMTPAccountCreate,
    user_id: int = Query(..., description="User ID")
):
    """
    Add a new SMTP account for a user.
    Password is encrypted before storage.
    """
    # Encrypt the password
    encrypted_password = encrypt_token(smtp_data.smtp_password)
    
    # Create the account
    try:
        account = SMTPAccountRepository.create_smtp_account(
            user_id=user_id,
            smtp_host=smtp_data.smtp_host,
            smtp_port=smtp_data.smtp_port,
            smtp_user=smtp_data.smtp_user,
            encrypted_password=encrypted_password,
            is_active=smtp_data.is_active
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create SMTP account: {str(e)}")
    
    return SMTPAccountResponse(
        id=account['id'],
        smtp_host=account['smtp_host'],
        smtp_port=account['smtp_port'],
        smtp_user_masked=mask_email(account['smtp_user']),
        is_active=account['is_active'],
        created_at=account['created_at']
    )


@router.post("/test", response_model=SMTPTestResponse)
@limiter.limit("3/minute")
async def test_smtp_credentials(request: Request, smtp_data: SMTPTestRequest):
    """
    Test SMTP credentials without saving.
    Rate limited to prevent abuse.
    """
    success, message = test_smtp_connection(
        host=smtp_data.smtp_host,
        port=smtp_data.smtp_port,
        user=smtp_data.smtp_user,
        password=smtp_data.smtp_password
    )
    
    return SMTPTestResponse(success=success, message=message)


@router.post("/set-active/{smtp_id}")
async def set_smtp_active(
    smtp_id: int,
    user_id: int = Query(..., description="User ID")
):
    """
    Set an SMTP account as the active one for sending emails.
    Only one account can be active per user.
    """
    # Verify account exists and belongs to user
    account = SMTPAccountRepository.get_smtp_account_by_id(smtp_id, user_id)
    if not account:
        raise HTTPException(status_code=404, detail="SMTP account not found")
    
    # Set as active
    success = SMTPAccountRepository.set_smtp_active(smtp_id, user_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to set SMTP account as active")
    
    return {"message": "SMTP account set as active", "smtp_id": smtp_id}


@router.get("/list", response_model=SMTPAccountListResponse)
async def list_smtp_accounts(user_id: int = Query(..., description="User ID")):
    """
    List all SMTP accounts for a user.
    Passwords are never returned, emails are masked.
    """
    accounts = SMTPAccountRepository.get_smtp_accounts_for_user(user_id)
    
    return SMTPAccountListResponse(
        accounts=[
            SMTPAccountResponse(
                id=acc['id'],
                smtp_host=acc['smtp_host'],
                smtp_port=acc['smtp_port'],
                smtp_user_masked=mask_email(acc['smtp_user']),
                is_active=acc['is_active'],
                created_at=acc['created_at']
            )
            for acc in accounts
        ]
    )


@router.delete("/{smtp_id}")
async def delete_smtp_account(
    smtp_id: int,
    user_id: int = Query(..., description="User ID")
):
    """Delete an SMTP account."""
    # Verify account exists and belongs to user
    account = SMTPAccountRepository.get_smtp_account_by_id(smtp_id, user_id)
    if not account:
        raise HTTPException(status_code=404, detail="SMTP account not found")
    
    success = SMTPAccountRepository.delete_smtp_account(smtp_id, user_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete SMTP account")
    
    return {"message": "SMTP account deleted", "smtp_id": smtp_id}
