import uuid
from datetime import datetime, timedelta
from typing import Optional
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from app.core.config import settings
from app.models.repositories import UserRepository


class GoogleCalendarService:
    """Service for interacting with Google Calendar API."""
    
    CALENDAR_SCOPES = settings.GOOGLE_SCOPES
    
    @staticmethod
    def get_credentials(user_id: int) -> Optional[Credentials]:
        """Get valid Google credentials for a user, refreshing if needed."""
        tokens = UserRepository.get_decrypted_tokens(user_id)
        if not tokens or not tokens.get('access_token'):
            return None
        
        creds = Credentials(
            token=tokens['access_token'],
            refresh_token=tokens.get('refresh_token'),
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scopes=GoogleCalendarService.CALENDAR_SCOPES
        )
        
        # Refresh if expired
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            # Update stored tokens
            UserRepository.update_google_tokens(
                user_id=user_id,
                access_token=creds.token,
                refresh_token=creds.refresh_token,
                token_expiry=creds.expiry
            )
        
        return creds
    
    @staticmethod
    def create_calendar_event(
        user_id: int,
        summary: str,
        start_time: datetime,
        end_time: datetime,
        attendee_email: str,
        description: str = ""
    ) -> dict:
        """
        Create a Google Calendar event with Google Meet link.
        
        Returns:
            dict with 'event_id' and 'meet_link'
        """
        creds = GoogleCalendarService.get_credentials(user_id)
        if not creds:
            raise ValueError("User has no valid Google credentials")
        
        service = build('calendar', 'v3', credentials=creds)
        
        # Build event with conference data request for Google Meet
        event = {
            'summary': summary,
            'description': description,
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'UTC',
            },
            'attendees': [
                {'email': attendee_email},
            ],
            'conferenceData': {
                'createRequest': {
                    'requestId': str(uuid.uuid4()),
                    'conferenceSolutionKey': {
                        'type': 'hangoutsMeet'
                    }
                }
            },
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 60},
                    {'method': 'popup', 'minutes': 10},
                ],
            },
        }
        
        # Create event with conferenceDataVersion=1 to enable Meet link generation
        created_event = service.events().insert(
            calendarId='primary',
            body=event,
            conferenceDataVersion=1,
            sendUpdates='all'  # Send email invites to attendees
        ).execute()
        
        # Extract the Meet link from the created event
        meet_link = created_event.get('hangoutLink')
        if not meet_link:
            raise ValueError("Failed to generate Google Meet link")
        
        return {
            'event_id': created_event['id'],
            'meet_link': meet_link,
            'html_link': created_event.get('htmlLink')
        }
    
    @staticmethod
    def get_busy_times(user_id: int, start_time: datetime, end_time: datetime) -> list:
        """
        Get busy time slots from Google Calendar.
        
        Returns:
            List of busy time periods
        """
        creds = GoogleCalendarService.get_credentials(user_id)
        if not creds:
            return []
        
        service = build('calendar', 'v3', credentials=creds)
        
        # Query free/busy information
        body = {
            'timeMin': start_time.isoformat() + 'Z',
            'timeMax': end_time.isoformat() + 'Z',
            'items': [{'id': 'primary'}]
        }
        
        result = service.freebusy().query(body=body).execute()
        busy_times = result['calendars']['primary']['busy']
        
        return busy_times
    
    @staticmethod
    def delete_calendar_event(user_id: int, event_id: str) -> bool:
        """Delete a calendar event."""
        creds = GoogleCalendarService.get_credentials(user_id)
        if not creds:
            return False
        
        service = build('calendar', 'v3', credentials=creds)
        
        try:
            service.events().delete(
                calendarId='primary',
                eventId=event_id,
                sendUpdates='all'
            ).execute()
            return True
        except Exception:
            return False
