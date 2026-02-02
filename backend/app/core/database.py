import psycopg
from psycopg.rows import dict_row
from contextlib import contextmanager
from typing import Generator
from app.core.config import settings


def get_connection():
    """Create a new database connection."""
    return psycopg.connect(settings.DATABASE_URL, row_factory=dict_row)


@contextmanager
def get_db() -> Generator:
    """Context manager for database connections with automatic commit/rollback."""
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


@contextmanager
def get_db_cursor() -> Generator:
    """Context manager that yields a cursor for simpler queries."""
    with get_db() as conn:
        cursor = conn.cursor()
        try:
            yield cursor
        finally:
            cursor.close()


def init_db():
    """Initialize database tables."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                username TEXT UNIQUE NOT NULL,
                google_access_token TEXT,
                google_refresh_token TEXT,
                token_expiry TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create meetings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS meetings (
                id SERIAL PRIMARY KEY,
                host_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                customer_email TEXT NOT NULL,
                customer_name TEXT,
                title TEXT NOT NULL,
                start_ts TIMESTAMP NOT NULL,
                end_ts TIMESTAMP NOT NULL,
                meet_link TEXT NOT NULL,
                google_event_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT no_overlapping_meetings UNIQUE (host_id, start_ts, end_ts)
            )
        """)
        
        # Create index for faster availability queries
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_meetings_host_time 
            ON meetings(host_id, start_ts, end_ts)
        """)
        
        # Create SMTP accounts table (user-managed)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS smtp_accounts (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                smtp_host TEXT NOT NULL,
                smtp_port INT NOT NULL,
                smtp_user TEXT NOT NULL,
                smtp_password TEXT NOT NULL,
                is_active BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create index for faster user SMTP lookups
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_smtp_accounts_user 
            ON smtp_accounts(user_id)
        """)
        
        # Create trigger function to ensure only one active SMTP per user
        cursor.execute("""
            CREATE OR REPLACE FUNCTION ensure_single_active_smtp()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.is_active = true THEN
                    UPDATE smtp_accounts 
                    SET is_active = false 
                    WHERE user_id = NEW.user_id AND id != NEW.id;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql
        """)
        
        # Create trigger
        cursor.execute("""
            DROP TRIGGER IF EXISTS trigger_single_active_smtp ON smtp_accounts
        """)
        cursor.execute("""
            CREATE TRIGGER trigger_single_active_smtp
                BEFORE INSERT OR UPDATE ON smtp_accounts
                FOR EACH ROW
                EXECUTE FUNCTION ensure_single_active_smtp()
        """)
        
        cursor.close()
        print("Database tables initialized successfully.")


if __name__ == "__main__":
    init_db()
