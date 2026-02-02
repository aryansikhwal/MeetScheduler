from datetime import datetime, timedelta
from typing import List
from app.models.repositories import MeetingRepository, UserRepository
from app.services.google_calendar import GoogleCalendarService


class AvailabilityService:
    """Service for calculating available time slots."""
    
    # Default working hours (9 AM - 5 PM UTC)
    DEFAULT_START_HOUR = 9
    DEFAULT_END_HOUR = 17
    
    # Default slot duration in minutes
    DEFAULT_SLOT_DURATION = 30
    
    @staticmethod
    def get_available_slots(
        host_id: int,
        start_date: datetime,
        end_date: datetime,
        slot_duration_minutes: int = DEFAULT_SLOT_DURATION
    ) -> List[dict]:
        """
        Calculate available slots for a host within a date range.
        
        Considers:
        1. Existing meetings in database
        2. Google Calendar busy times
        3. Working hours
        
        Returns:
            List of available time slots
        """
        # Verify host exists and has Google connected
        user = UserRepository.get_user_by_id(host_id)
        if not user:
            raise ValueError("Host not found")
        
        if not user.get('google_access_token'):
            raise ValueError("Host has not connected Google Calendar")
        
        # Get existing meetings from DB
        existing_meetings = MeetingRepository.get_meetings_for_host(
            host_id, start_date, end_date
        )
        
        # Get busy times from Google Calendar
        try:
            google_busy = GoogleCalendarService.get_busy_times(
                host_id, start_date, end_date
            )
        except Exception:
            google_busy = []
        
        # Combine all busy periods
        busy_periods = []
        
        for meeting in existing_meetings:
            busy_periods.append({
                'start': meeting['start_ts'],
                'end': meeting['end_ts']
            })
        
        for busy in google_busy:
            busy_periods.append({
                'start': datetime.fromisoformat(busy['start'].replace('Z', '+00:00')).replace(tzinfo=None),
                'end': datetime.fromisoformat(busy['end'].replace('Z', '+00:00')).replace(tzinfo=None)
            })
        
        # Generate available slots
        available_slots = []
        current_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        
        while current_date < end_date:
            # Set working hours for this day
            day_start = current_date.replace(
                hour=AvailabilityService.DEFAULT_START_HOUR,
                minute=0
            )
            day_end = current_date.replace(
                hour=AvailabilityService.DEFAULT_END_HOUR,
                minute=0
            )
            
            # Skip past times
            if day_start < datetime.utcnow():
                day_start = datetime.utcnow().replace(second=0, microsecond=0)
                # Round up to next slot
                minutes = day_start.minute
                remainder = minutes % slot_duration_minutes
                if remainder != 0:
                    day_start += timedelta(minutes=slot_duration_minutes - remainder)
            
            # Generate slots for this day
            slot_start = day_start
            while slot_start + timedelta(minutes=slot_duration_minutes) <= day_end:
                slot_end = slot_start + timedelta(minutes=slot_duration_minutes)
                
                # Check if slot conflicts with any busy period
                is_available = True
                for busy in busy_periods:
                    if (slot_start < busy['end'] and slot_end > busy['start']):
                        is_available = False
                        break
                
                if is_available and slot_start >= datetime.utcnow():
                    available_slots.append({
                        'start': slot_start,
                        'end': slot_end
                    })
                
                slot_start = slot_end
            
            current_date += timedelta(days=1)
        
        return available_slots
