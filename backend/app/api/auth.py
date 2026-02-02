from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from google.auth.transport import requests
from datetime import datetime, timedelta
import json

from app.core.config import settings
from app.models.repositories import UserRepository
from app.models.schemas import UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


def create_oauth_flow(state: str = None) -> Flow:
    """Create Google OAuth flow."""
    client_config = {
        "web": {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
        }
    }
    
    flow = Flow.from_client_config(
        client_config,
        scopes=settings.GOOGLE_SCOPES,
        state=state
    )
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    return flow


@router.get("/google")
async def google_auth(username: str = Query(..., description="Username for booking link")):
    """
    Initiate Google OAuth flow.
    Pass username as query param to create/associate user.
    """
    flow = create_oauth_flow()
    
    # Store username in state for callback
    state_data = {"username": username}
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent',  # Force consent to get refresh token
        state=json.dumps(state_data)
    )
    
    return RedirectResponse(url=authorization_url)


@router.get("/google/callback")
async def google_callback(code: str, state: str):
    """
    Handle Google OAuth callback.
    Creates/updates user with tokens and returns booking link.
    """
    try:
        # Parse state to get username
        state_data = json.loads(state)
        username = state_data.get("username")
        
        if not username:
            raise HTTPException(status_code=400, detail="Missing username in state")
        
        # Exchange code for tokens
        flow = create_oauth_flow(state=state)
        flow.fetch_token(code=code)
        
        credentials = flow.credentials
        
        # Get user email from ID token with clock skew tolerance
        id_info = id_token.verify_oauth2_token(
            credentials.id_token,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=60  # Allow 60 seconds clock skew
        )
        
        user_email = id_info.get('email')
        if not user_email:
            raise HTTPException(status_code=400, detail="Could not get email from Google")
        
        # Create or update user
        user = UserRepository.get_user_by_email(user_email)
        
        if not user:
            user = UserRepository.create_user(email=user_email, username=username)
        
        # Calculate token expiry
        token_expiry = datetime.utcnow() + timedelta(seconds=3600)  # Default 1 hour
        if credentials.expiry:
            token_expiry = credentials.expiry
        
        # Update tokens (encrypted)
        UserRepository.update_google_tokens(
            user_id=user['id'],
            access_token=credentials.token,
            refresh_token=credentials.refresh_token,
            token_expiry=token_expiry
        )
        
        # Redirect to frontend with success - include all user info
        redirect_url = f"{settings.FRONTEND_URL}/auth/success?user_id={user['id']}&username={user['username']}&email={user_email}"
        
        return RedirectResponse(url=redirect_url)
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Token verification failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth callback failed: {str(e)}")


@router.get("/user/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """Get user details including booking link."""
    user = UserRepository.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=user['id'],
        email=user['email'],
        username=user['username'],
        has_google_connected=bool(user.get('google_access_token')),
        booking_link=f"{settings.APP_URL}/book/{user['username']}"
    )
