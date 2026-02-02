import smtplib
from email.message import EmailMessage
from datetime import datetime
from ssl import create_default_context
from typing import Optional

from app.models.repositories import SMTPAccountRepository
from app.core.security import decrypt_token


class SMTPCredentials:
    """Container for SMTP credentials."""
    def __init__(self, host: str, port: int, user: str, password: str):
        self.host = host
        self.port = port
        self.user = user
        self.password = password


def get_user_smtp_credentials(user_id: int) -> SMTPCredentials:
    """
    Get the active SMTP credentials for a user.
    Raises ValueError if no active SMTP is configured.
    """
    smtp_account = SMTPAccountRepository.get_active_smtp_for_user(user_id)
    
    if not smtp_account:
        raise ValueError(
            f"No active SMTP account configured for user {user_id}. "
            "Please configure an SMTP account in Email Settings."
        )
    
    # Decrypt the password
    decrypted_password = decrypt_token(smtp_account['smtp_password'])
    
    return SMTPCredentials(
        host=smtp_account['smtp_host'],
        port=smtp_account['smtp_port'],
        user=smtp_account['smtp_user'],
        password=decrypted_password
    )


def send_email_with_credentials(
    credentials: SMTPCredentials,
    msg: EmailMessage
) -> bool:
    """
    Send an email using the provided SMTP credentials.
    Handles both SSL (465) and STARTTLS (587, 25, 2525) connections.
    """
    try:
        if credentials.port == 465:
            # SSL connection
            context = create_default_context()
            with smtplib.SMTP_SSL(credentials.host, credentials.port, timeout=30, context=context) as server:
                server.login(credentials.user, credentials.password)
                server.send_message(msg)
        else:
            # STARTTLS connection
            with smtplib.SMTP(credentials.host, credentials.port, timeout=30) as server:
                server.starttls()
                server.login(credentials.user, credentials.password)
                server.send_message(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False


class EmailService:
    """SMTP Email service for sending meeting confirmations using user's SMTP."""
    
    @staticmethod
    def send_confirmation_email(
        user_id: int,
        to_email: str,
        customer_name: str,
        host_email: str,
        meeting_title: str,
        start_time: datetime,
        end_time: datetime,
        meet_link: str
    ) -> bool:
        """
        Send meeting confirmation email to the customer.
        Uses the host user's active SMTP account.
        
        Args:
            user_id: Host user's ID (for SMTP lookup)
            to_email: Customer's email address
            customer_name: Customer's name
            host_email: Host's email address
            meeting_title: Title of the meeting
            start_time: Meeting start time (UTC)
            end_time: Meeting end time (UTC)
            meet_link: Google Meet link
            
        Returns:
            bool: True if email sent successfully
            
        Raises:
            ValueError: If no active SMTP is configured for the user
        """
        # Get user's SMTP credentials
        credentials = get_user_smtp_credentials(user_id)
        
        msg = EmailMessage()
        msg['Subject'] = f"Meeting Confirmed: {meeting_title}"
        msg['From'] = credentials.user
        msg['To'] = to_email
        
        # Format times for display
        start_formatted = start_time.strftime("%A, %B %d, %Y at %I:%M %p UTC")
        end_formatted = end_time.strftime("%I:%M %p UTC")
        duration_minutes = int((end_time - start_time).total_seconds() / 60)
        
        # Plain text content
        plain_content = f"""
Hello {customer_name},

Your meeting has been confirmed!

Meeting Details:
----------------
Title: {meeting_title}
Date & Time: {start_formatted} - {end_formatted}
Duration: {duration_minutes} minutes
Host: {host_email}

Join Link: {meet_link}

Please click the link above to join the meeting at the scheduled time.

If you need to reschedule or cancel, please contact the host at {host_email}.

Best regards,
Meeting Scheduler
        """
        
        # HTML content
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #4285f4; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }}
        .details {{ background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }}
        .details-row {{ display: flex; padding: 8px 0; border-bottom: 1px solid #eee; }}
        .details-label {{ font-weight: bold; width: 120px; color: #666; }}
        .join-button {{ display: inline-block; background-color: #34a853; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }}
        .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Meeting Confirmed ✓</h1>
        </div>
        <div class="content">
            <p>Hello {customer_name},</p>
            <p>Your meeting has been scheduled successfully!</p>
            
            <div class="details">
                <div class="details-row">
                    <span class="details-label">Title:</span>
                    <span>{meeting_title}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Date & Time:</span>
                    <span>{start_formatted}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Duration:</span>
                    <span>{duration_minutes} minutes</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Host:</span>
                    <span>{host_email}</span>
                </div>
            </div>
            
            <p style="text-align: center;">
                <a href="{meet_link}" class="join-button">Join Meeting</a>
            </p>
            
            <p style="font-size: 13px; color: #666;">
                Or copy this link: <a href="{meet_link}">{meet_link}</a>
            </p>
            
            <p style="font-size: 13px; color: #666;">
                If you need to reschedule or cancel, please contact the host at 
                <a href="mailto:{host_email}">{host_email}</a>.
            </p>
        </div>
        <div class="footer">
            <p>This is an automated message from Meeting Scheduler.</p>
        </div>
    </div>
</body>
</html>
        """
        
        msg.set_content(plain_content)
        msg.add_alternative(html_content, subtype='html')
        
        return send_email_with_credentials(credentials, msg)
    
    @staticmethod
    def send_host_notification(
        user_id: int,
        host_email: str,
        customer_name: str,
        customer_email: str,
        meeting_title: str,
        start_time: datetime,
        end_time: datetime,
        meet_link: str
    ) -> bool:
        """
        Send notification email to the host about new booking.
        Uses the host user's active SMTP account.
        """
        # Get user's SMTP credentials
        credentials = get_user_smtp_credentials(user_id)
        
        msg = EmailMessage()
        msg['Subject'] = f"New Booking: {meeting_title} with {customer_name}"
        msg['From'] = credentials.user
        msg['To'] = host_email
        
        start_formatted = start_time.strftime("%A, %B %d, %Y at %I:%M %p UTC")
        duration_minutes = int((end_time - start_time).total_seconds() / 60)
        
        plain_content = f"""
Hello,

You have a new meeting booked!

Meeting Details:
----------------
Title: {meeting_title}
Customer: {customer_name} ({customer_email})
Date & Time: {start_formatted}
Duration: {duration_minutes} minutes

Join Link: {meet_link}

The customer has also received a confirmation email with the meeting details.

Best regards,
Meeting Scheduler
        """
        
        msg.set_content(plain_content)
        
        return send_email_with_credentials(credentials, msg)
    
    @staticmethod
    def check_smtp_configured(user_id: int) -> bool:
        """Check if user has an active SMTP account configured."""
        smtp_account = SMTPAccountRepository.get_active_smtp_for_user(user_id)
        return smtp_account is not None
