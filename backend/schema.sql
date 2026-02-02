-- Database initialization script for Meeting Scheduler
-- Run this in PostgreSQL to set up the database

-- Create database (run as superuser)
-- CREATE DATABASE meets_db;

-- Connect to meets_db and run the following:

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    google_access_token TEXT,
    google_refresh_token TEXT,
    token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meetings table
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
);

-- Index for faster availability queries
CREATE INDEX IF NOT EXISTS idx_meetings_host_time 
ON meetings(host_id, start_ts, end_ts);

-- Index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username 
ON users(username);

-- SMTP accounts table (user-managed)
CREATE TABLE IF NOT EXISTS smtp_accounts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    smtp_host TEXT NOT NULL,
    smtp_port INT NOT NULL CHECK (smtp_port IN (465, 587, 25, 2525)),
    smtp_user TEXT NOT NULL,
    smtp_password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster user SMTP lookups
CREATE INDEX IF NOT EXISTS idx_smtp_accounts_user 
ON smtp_accounts(user_id);

-- Ensure only one active SMTP per user (enforced via trigger)
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_single_active_smtp ON smtp_accounts;
CREATE TRIGGER trigger_single_active_smtp
    BEFORE INSERT OR UPDATE ON smtp_accounts
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_active_smtp();
