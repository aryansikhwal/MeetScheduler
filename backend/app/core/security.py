import base64
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from app.core.config import settings


def _get_fernet() -> Fernet:
    """Get Fernet cipher using the encryption key from settings."""
    key = settings.ENCRYPTION_KEY.encode()
    # Derive a proper 32-byte key using PBKDF2
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b"meets_scheduler_salt",  # Fixed salt for deterministic encryption
        iterations=100000,
    )
    derived_key = base64.urlsafe_b64encode(kdf.derive(key))
    return Fernet(derived_key)


def encrypt_token(token: str) -> str:
    """Encrypt a token for secure storage."""
    if not token:
        return ""
    fernet = _get_fernet()
    encrypted = fernet.encrypt(token.encode())
    return encrypted.decode()


def decrypt_token(encrypted_token: str) -> str:
    """Decrypt a stored token."""
    if not encrypted_token:
        return ""
    fernet = _get_fernet()
    decrypted = fernet.decrypt(encrypted_token.encode())
    return decrypted.decode()
