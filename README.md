# Meeting Scheduler

A production-ready meeting scheduling application with Google Calendar integration, Google Meet link generation, and customizable SMTP email notifications.

## Features

- **Meeting Scheduling** - Book meetings with automatic confirmation emails
- **Real-Time Availability** - Check free slots directly from Google Calendar
- **Google Meet Integration** - Automatic video meeting link generation
- **Personal Booking Links** - Shareable `/book/{username}` URLs for easy scheduling
- **Custom SMTP Configuration** - Users can configure their own email providers
- **Rate Limiting** - Built-in protection against abuse
- **Secure Token Storage** - Encrypted storage for OAuth and SMTP credentials

## Tech Stack

### Backend
- **Framework**: FastAPI 1.0.0
- **Database**: PostgreSQL
- **Authentication**: Google OAuth 2.0
- **APIs**: Google Calendar API
- **Rate Limiting**: SlowAPI
- **Security**: Cryptography (Fernet encryption)

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS

## Project Structure

```
meets/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py           # Google OAuth endpoints
│   │   │   ├── booking.py        # Booking and availability endpoints
│   │   │   └── smtp.py           # SMTP account management
│   │   ├── core/
│   │   │   ├── config.py         # Configuration settings
│   │   │   ├── database.py       # PostgreSQL connection
│   │   │   └── security.py       # Token encryption
│   │   ├── models/
│   │   │   ├── repositories.py   # Database operations
│   │   │   └── schemas.py        # Pydantic models
│   │   ├── services/
│   │   │   ├── availability.py      # Slot calculation logic
│   │   │   ├── email_service.py     # SMTP email handling
│   │   │   └── google_calendar.py   # Google Calendar API client
│   │   └── main.py               # FastAPI application entry point
│   ├── schema.sql                # Database schema
│   └── requirements.txt
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   └── Topbar.jsx
    │   ├── layouts/
    │   │   └── AppLayout.jsx
    │   ├── pages/
    │   │   ├── AuthSuccess.jsx      # OAuth callback handler
    │   │   ├── BookingPage.jsx      # Public booking interface
    │   │   ├── BookingSettings.jsx  # Booking preferences
    │   │   ├── Calendar.jsx         # Calendar view
    │   │   ├── ConnectGoogle.jsx    # Google account connection
    │   │   ├── Dashboard.jsx        # Main dashboard
    │   │   ├── Landing.jsx          # Landing page
    │   │   ├── Meetings.jsx         # Meeting list view
    │   │   ├── Profile.jsx          # User profile
    │   │   └── SmtpSettings.jsx     # SMTP configuration
    │   ├── App.js
    │   └── index.js
    ├── tailwind.config.js
    └── package.json
```

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - OAuth callback handler

### Booking
- `GET /availability/{host_id}` - Get available time slots by host ID
- `GET /availability/username/{username}` - Get availability by username
- `POST /book` - Book a meeting slot (rate limited: 5/minute)
- `GET /meetings` - Get meetings for a user

### SMTP Management
- `POST /smtp/add` - Add SMTP account
- `POST /smtp/test` - Test SMTP connection
- `GET /smtp/list` - List user SMTP accounts
- `DELETE /smtp/{account_id}` - Remove SMTP account
- `PUT /smtp/{account_id}/activate` - Set active SMTP account

### Health
- `GET /` - Service health check
- `GET /health` - Detailed health status

## Database Schema

The application uses three main tables:

- **users** - User accounts with Google OAuth tokens
- **meetings** - Scheduled meetings with overlap prevention
- **smtp_accounts** - User-configured SMTP credentials (encrypted)

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Google Cloud Console project with Calendar API enabled

### 1. Database Setup

```sql
CREATE DATABASE meets_db;
```

Then run the schema file:
```bash
psql -d meets_db -f backend/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Create .env file with required variables
# DATABASE_URL=postgresql://user:password@localhost:5432/meets_db
# GOOGLE_CLIENT_ID=your_client_id
# GOOGLE_CLIENT_SECRET=your_client_secret
# GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
# ENCRYPTION_KEY=your_32_character_encryption_key
# FRONTEND_URL=http://localhost:3000

# Run the server
uvicorn app.main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Google Cloud Console Configuration

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials
6. Add authorized redirect URI: `http://localhost:8000/auth/google/callback`
7. Add test users if the app is in testing mode

### 5. SMTP Configuration

Users can configure their own SMTP accounts through the application interface. For Gmail:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: Google Account > Security > App Passwords
3. Use the App Password (16 characters) as the SMTP password
4. Configure via the SMTP Settings page in the application

Supported ports: 465 (SSL), 587 (STARTTLS), 25, 2525

## Booking Flow

1. Host connects Google Calendar via the Connect page
2. Host receives a personal booking link (`/book/{username}`)
3. Customer opens the booking link and views available time slots
4. Customer selects a slot and submits booking details
5. Backend processes the booking:
   - Validates and locks the slot using `SELECT FOR UPDATE`
   - Creates a Google Calendar event with Google Meet link
   - Saves the meeting to the database
   - Sends confirmation emails to both parties
6. Both host and customer receive email confirmation with the Meet link

## Security

- OAuth refresh tokens encrypted with Fernet symmetric encryption
- SMTP passwords encrypted before database storage
- UTC timestamps for all time-related operations
- Rate limiting on booking endpoint (5 requests/minute)
- Input validation with Pydantic schemas
- SQL injection protection via parameterized queries
- CORS configuration for frontend origin

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL |
| `ENCRYPTION_KEY` | 32+ character key for token encryption |
| `APP_URL` | Backend application URL |
| `FRONTEND_URL` | Frontend application URL |

## License

This project is personal property of a cool guy.
