from datetime import datetime
from typing import Optional
from app.core.database import get_db
from app.core.security import encrypt_token, decrypt_token


class UserRepository:
    @staticmethod
    def create_user(email: str, username: str) -> dict:
        """Create a new user."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO users (email, username)
                VALUES (%s, %s)
                ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
                RETURNING id, email, username, google_access_token IS NOT NULL as has_google
                """,
                (email, username)
            )
            result = cursor.fetchone()
            cursor.close()
            return dict(result)
    
    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[dict]:
        """Get user by ID."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM users WHERE id = %s",
                (user_id,)
            )
            result = cursor.fetchone()
            cursor.close()
            if result:
                return dict(result)
            return None
    
    @staticmethod
    def get_user_by_username(username: str) -> Optional[dict]:
        """Get user by username."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM users WHERE username = %s",
                (username,)
            )
            result = cursor.fetchone()
            cursor.close()
            if result:
                return dict(result)
            return None
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[dict]:
        """Get user by email."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM users WHERE email = %s",
                (email,)
            )
            result = cursor.fetchone()
            cursor.close()
            if result:
                return dict(result)
            return None
    
    @staticmethod
    def update_google_tokens(
        user_id: int,
        access_token: str,
        refresh_token: str,
        token_expiry: datetime
    ) -> bool:
        """Update user's Google OAuth tokens (encrypted)."""
        encrypted_access = encrypt_token(access_token)
        encrypted_refresh = encrypt_token(refresh_token) if refresh_token else None
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE users 
                SET google_access_token = %s,
                    google_refresh_token = COALESCE(%s, google_refresh_token),
                    token_expiry = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                """,
                (encrypted_access, encrypted_refresh, token_expiry, user_id)
            )
            cursor.close()
            return cursor.rowcount > 0
    
    @staticmethod
    def get_decrypted_tokens(user_id: int) -> Optional[dict]:
        """Get user's decrypted Google tokens."""
        user = UserRepository.get_user_by_id(user_id)
        if not user or not user.get('google_access_token'):
            return None
        
        return {
            'access_token': decrypt_token(user['google_access_token']),
            'refresh_token': decrypt_token(user['google_refresh_token']) if user.get('google_refresh_token') else None,
            'token_expiry': user.get('token_expiry')
        }


class MeetingRepository:
    @staticmethod
    def check_slot_available(conn, host_id: int, start_ts: datetime, end_ts: datetime) -> bool:
        """Check if a time slot is available (with row lock)."""
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id FROM meetings 
            WHERE host_id = %s 
            AND (
                (start_ts < %s AND end_ts > %s) OR
                (start_ts < %s AND end_ts > %s) OR
                (start_ts >= %s AND end_ts <= %s)
            )
            FOR UPDATE
            """,
            (host_id, end_ts, start_ts, end_ts, start_ts, start_ts, end_ts)
        )
        result = cursor.fetchone()
        cursor.close()
        return result is None
    
    @staticmethod
    def create_meeting(
        conn,
        host_id: int,
        customer_email: str,
        customer_name: str,
        title: str,
        start_ts: datetime,
        end_ts: datetime,
        meet_link: str,
        google_event_id: str
    ) -> dict:
        """Create a new meeting record."""
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO meetings (host_id, customer_email, customer_name, title, start_ts, end_ts, meet_link, google_event_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (host_id, customer_email, customer_name, title, start_ts, end_ts, meet_link, google_event_id)
        )
        result = cursor.fetchone()
        cursor.close()
        return dict(result)
    
    @staticmethod
    def get_meetings_for_host(host_id: int, start_date: datetime, end_date: datetime) -> list:
        """Get all meetings for a host within a date range."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT * FROM meetings 
                WHERE host_id = %s AND start_ts >= %s AND end_ts <= %s
                ORDER BY start_ts
                """,
                (host_id, start_date, end_date)
            )
            results = cursor.fetchall()
            cursor.close()
            return [dict(r) for r in results]
    
    @staticmethod
    def get_meeting_by_id(meeting_id: int) -> Optional[dict]:
        """Get a meeting by ID."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM meetings WHERE id = %s",
                (meeting_id,)
            )
            result = cursor.fetchone()
            cursor.close()
            if result:
                return dict(result)
            return None


class SMTPAccountRepository:
    """Repository for SMTP account operations."""
    
    @staticmethod
    def create_smtp_account(
        user_id: int,
        smtp_host: str,
        smtp_port: int,
        smtp_user: str,
        encrypted_password: str,
        is_active: bool = False
    ) -> dict:
        """Create a new SMTP account for a user."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO smtp_accounts (user_id, smtp_host, smtp_port, smtp_user, smtp_password, is_active)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, user_id, smtp_host, smtp_port, smtp_user, is_active, created_at
                """,
                (user_id, smtp_host, smtp_port, smtp_user, encrypted_password, is_active)
            )
            result = cursor.fetchone()
            cursor.close()
            return dict(result)
    
    @staticmethod
    def get_smtp_accounts_for_user(user_id: int) -> list:
        """Get all SMTP accounts for a user (without passwords)."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, user_id, smtp_host, smtp_port, smtp_user, is_active, created_at
                FROM smtp_accounts
                WHERE user_id = %s
                ORDER BY created_at DESC
                """,
                (user_id,)
            )
            results = cursor.fetchall()
            cursor.close()
            return [dict(r) for r in results]
    
    @staticmethod
    def get_active_smtp_for_user(user_id: int) -> Optional[dict]:
        """Get the active SMTP account for a user (with encrypted password)."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, user_id, smtp_host, smtp_port, smtp_user, smtp_password, is_active, created_at
                FROM smtp_accounts
                WHERE user_id = %s AND is_active = true
                """,
                (user_id,)
            )
            result = cursor.fetchone()
            cursor.close()
            if result:
                return dict(result)
            return None
    
    @staticmethod
    def get_smtp_account_by_id(smtp_id: int, user_id: int) -> Optional[dict]:
        """Get SMTP account by ID (ensuring it belongs to the user)."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, user_id, smtp_host, smtp_port, smtp_user, is_active, created_at
                FROM smtp_accounts
                WHERE id = %s AND user_id = %s
                """,
                (smtp_id, user_id)
            )
            result = cursor.fetchone()
            cursor.close()
            if result:
                return dict(result)
            return None
    
    @staticmethod
    def set_smtp_active(smtp_id: int, user_id: int) -> bool:
        """Set an SMTP account as active (trigger handles deactivating others)."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE smtp_accounts
                SET is_active = true
                WHERE id = %s AND user_id = %s
                """,
                (smtp_id, user_id)
            )
            affected = cursor.rowcount
            cursor.close()
            return affected > 0
    
    @staticmethod
    def delete_smtp_account(smtp_id: int, user_id: int) -> bool:
        """Delete an SMTP account."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                DELETE FROM smtp_accounts
                WHERE id = %s AND user_id = %s
                """,
                (smtp_id, user_id)
            )
            affected = cursor.rowcount
            cursor.close()
            return affected > 0
