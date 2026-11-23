import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv


# Load values from .env
load_dotenv()


SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


def send_registration_email(
    recipient_email: str,
    user_name: str
):
    message = EmailMessage()

    message["Subject"] = "Registration Successful"
    message["From"] = SMTP_USERNAME
    message["To"] = recipient_email

    message.set_content(
        f"""
Hello {user_name},

Your registration has been completed successfully.

Thank you for registering with us.

Registration details:

Name: {user_name}

Your account has been successfully created.

Regards,
User Registration System
"""
    )

    try:

        with smtplib.SMTP(
            SMTP_SERVER,
            SMTP_PORT
        ) as server:

            server.starttls()

            server.login(
                SMTP_USERNAME,
                SMTP_PASSWORD
            )

            server.send_message(message)

        print(
            f"Registration email sent to {recipient_email}"
        )

    except Exception as e:

        print(
            f"Failed to send email: {e}"
        )