from fastapi import APIRouter, HTTPException, Query, Request
from datetime import datetime, timedelta
from typing import List
import traceback
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.models.schemas import (
    BookingRequest, BookingResponse, AvailabilityResponse, TimeSlot, MeetingListResponse, MeetingItem
)
from app.models.repositories import UserRepository, MeetingRepository
from app.services.google_calendar import GoogleCalendarService
from app.services.email_service import EmailService
from app.services.availability import AvailabilityService
from app.core.database import get_db

router = APIRouter(tags=["Booking"])
limiter = Limiter(key_func=get_remote_address)


@router.get("/meetings", response_model=MeetingListResponse)
async def get_meetings(
    user_id: int = Query(..., description="User ID to get meetings for"),
    days: int = Query(default=30, ge=1, le=90, description="Number of days to look back and forward")
):
    """Get all meetings for a user."""
    user = UserRepository.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    start_date = datetime.utcnow() - timedelta(days=days)
    end_date = datetime.utcnow() + timedelta(days=days)
    
    meetings = MeetingRepository.get_meetings_for_host(user_id, start_date, end_date)
    
    return MeetingListResponse(
        meetings=[
            MeetingItem(
                id=m['id'],
                title=m['title'],
                customer_name=m['customer_name'],
                customer_email=m['customer_email'],
                start_ts=m['start_ts'],
                end_ts=m['end_ts'],
                meet_link=m['meet_link']
            )
            for m in meetings
        ]
    )


@router.get("/availability/{host_id}", response_model=AvailabilityResponse)
async def get_availability(
    host_id: int,
    days: int = Query(default=7, ge=1, le=30, description="Number of days to check")
):
    """
    Get available time slots for a host.
    
    Returns available 30-minute slots within working hours (9 AM - 5 PM UTC)
    for the next N days.
    """
    user = UserRepository.get_user_by_id(host_id)
    if not user:
        raise HTTPException(status_code=404, detail="Host not found")
    
    if not user.get('google_access_token'):
        raise HTTPException(
            status_code=400,
            detail="Host has not connected their Google Calendar"
        )
    
    start_date = datetime.utcnow()
    end_date = start_date + timedelta(days=days)
    
    try:
        available_slots = AvailabilityService.get_available_slots(
            host_id=host_id,
            start_date=start_date,
            end_date=end_date
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get availability: {str(e)}")
    
    return AvailabilityResponse(
        host_id=host_id,
        host_email=user['email'],
        available_slots=[TimeSlot(start=s['start'], end=s['end']) for s in available_slots]
    )


@router.get("/availability/username/{username}", response_model=AvailabilityResponse)
async def get_availability_by_username(
    username: str,
    days: int = Query(default=7, ge=1, le=30)
):
    """Get availability by username for the booking page."""
    user = UserRepository.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return await get_availability(user['id'], days)


@router.post("/book", response_model=BookingResponse)
@limiter.limit("5/minute")
async def book_meeting(request: Request, booking: BookingRequest):
    """
    Book a meeting slot.
    
    This endpoint performs the following in order:
    1. Validates and locks the slot using SELECT FOR UPDATE
    2. Creates Google Calendar event with Meet link
    3. Saves meeting to database
    4. Sends confirmation email
    5. Returns booking confirmation
    
    All operations are within a transaction - any failure rolls back.
    """
    try:
        # Get host user
        host = UserRepository.get_user_by_id(booking.host_id)
        if not host:
            raise HTTPException(status_code=404, detail="Host not found")
        
        if not host.get('google_access_token'):
            raise HTTPException(
                status_code=400,
                detail="Host has not connected their Google Calendar"
            )
        
        # Check if host has SMTP configured
        if not EmailService.check_smtp_configured(booking.host_id):
            raise HTTPException(
                status_code=400,
                detail="Host has not configured email settings. Please ask the host to set up SMTP in Email Settings."
            )
        
        # Validate times - handle timezone-aware datetimes
        start_time = booking.start_time
        end_time = booking.end_time
        
        # Convert to naive UTC if timezone-aware
        if start_time.tzinfo is not None:
            start_time = start_time.replace(tzinfo=None)
        if end_time.tzinfo is not None:
            end_time = end_time.replace(tzinfo=None)
        
        if start_time < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Cannot book slots in the past")
        
        duration = (end_time - start_time).total_seconds() / 60
        if duration < 15 or duration > 480:
            raise HTTPException(
                status_code=400,
                detail="Meeting duration must be between 15 minutes and 8 hours"
            )
        
        # Start transaction
        with get_db() as conn:
            # Step 1: Lock and validate slot
            is_available = MeetingRepository.check_slot_available(
                conn=conn,
                host_id=booking.host_id,
                start_ts=start_time,
                end_ts=end_time
            )
            
            if not is_available:
                raise HTTPException(
                    status_code=409,
                    detail="This time slot is no longer available"
                )
            
            # Step 2: Create Google Calendar event with Meet link
            try:
                calendar_result = GoogleCalendarService.create_calendar_event(
                    user_id=booking.host_id,
                    summary=booking.title,
                    start_time=start_time,
                    end_time=end_time,
                    attendee_email=booking.customer_email,
                    description=f"Meeting with {booking.customer_name}"
                )
            except ValueError as e:
                raise HTTPException(status_code=400, detail=str(e))
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to create calendar event: {str(e)}"
                )
            
            meet_link = calendar_result['meet_link']
            event_id = calendar_result['event_id']
            
            # Step 3: Save meeting to database
            try:
                meeting = MeetingRepository.create_meeting(
                    conn=conn,
                    host_id=booking.host_id,
                    customer_email=booking.customer_email,
                    customer_name=booking.customer_name,
                    title=booking.title,
                    start_ts=start_time,
                    end_ts=end_time,
                    meet_link=meet_link,
                    google_event_id=event_id
                )
            except Exception as e:
                # Rollback: Delete the calendar event if DB save fails
                GoogleCalendarService.delete_calendar_event(booking.host_id, event_id)
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to save meeting: {str(e)}"
                )
            
            # Step 4: Send confirmation emails
            # Send to customer
            email_sent = EmailService.send_confirmation_email(
                user_id=booking.host_id,
                to_email=booking.customer_email,
                customer_name=booking.customer_name,
                host_email=host['email'],
                meeting_title=booking.title,
                start_time=start_time,
                end_time=end_time,
                meet_link=meet_link
            )
            
            # Send notification to host
            EmailService.send_host_notification(
                user_id=booking.host_id,
                host_email=host['email'],
                customer_name=booking.customer_name,
                customer_email=booking.customer_email,
                meeting_title=booking.title,
                start_time=start_time,
                end_time=end_time,
                meet_link=meet_link
            )
            
            if not email_sent:
                # Log warning but don't fail the booking
                print(f"Warning: Failed to send confirmation email to {booking.customer_email}")
            
            # Step 5: Return response
            return BookingResponse(
                id=meeting['id'],
                host_email=host['email'],
                customer_email=meeting['customer_email'],
                start_time=meeting['start_ts'],
                end_time=meeting['end_ts'],
                meet_link=meeting['meet_link'],
                title=meeting['title']
            )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Booking error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Booking failed: {str(e)}")
