from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    email: str
    username: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    has_google_connected: bool
    booking_link: str


class BookingRequest(BaseModel):
    host_id: int
    customer_email: str
    customer_name: str
    start_time: datetime
    end_time: datetime
    title: Optional[str] = "Meeting"
    
    @field_validator('start_time', 'end_time', mode='before')
    @classmethod
    def parse_datetime(cls, v):
        if isinstance(v, str):
            return datetime.fromisoformat(v.replace('Z', '+00:00'))
        return v
    
    @field_validator('end_time')
    @classmethod
    def end_after_start(cls, v, info):
        if 'start_time' in info.data and v <= info.data['start_time']:
            raise ValueError('end_time must be after start_time')
        return v


class BookingResponse(BaseModel):
    id: int
    host_email: str
    customer_email: str
    start_time: datetime
    end_time: datetime
    meet_link: str
    title: str


class MeetingItem(BaseModel):
    id: int
    title: str
    customer_name: str
    customer_email: str
    start_ts: datetime
    end_ts: datetime
    meet_link: str


class MeetingListResponse(BaseModel):
    meetings: list[MeetingItem]


class TimeSlot(BaseModel):
    start: datetime
    end: datetime


class AvailabilityResponse(BaseModel):
    host_id: int
    host_email: str
    available_slots: list[TimeSlot]


class ErrorResponse(BaseModel):
    detail: str


# SMTP Account Schemas
class SMTPAccountCreate(BaseModel):
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    is_active: bool = False
    
    @field_validator('smtp_host')
    @classmethod
    def validate_host(cls, v):
        if not v or not v.strip():
            raise ValueError('SMTP host cannot be empty')
        return v.strip()
    
    @field_validator('smtp_port')
    @classmethod
    def validate_port(cls, v):
        allowed_ports = [25, 465, 587, 2525]
        if v not in allowed_ports:
            raise ValueError(f'SMTP port must be one of: {allowed_ports}')
        return v
    
    @field_validator('smtp_user')
    @classmethod
    def validate_user(cls, v):
        if not v or not v.strip():
            raise ValueError('SMTP user cannot be empty')
        return v.strip()


class SMTPAccountResponse(BaseModel):
    id: int
    smtp_host: str
    smtp_port: int
    smtp_user_masked: str
    is_active: bool
    created_at: datetime


class SMTPAccountListResponse(BaseModel):
    accounts: list[SMTPAccountResponse]


class SMTPTestRequest(BaseModel):
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    
    @field_validator('smtp_port')
    @classmethod
    def validate_port(cls, v):
        allowed_ports = [25, 465, 587, 2525]
        if v not in allowed_ports:
            raise ValueError(f'SMTP port must be one of: {allowed_ports}')
        return v


class SMTPTestResponse(BaseModel):
    success: bool
    message: str
