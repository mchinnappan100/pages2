from mcp.server.fastmcp import FastMCP
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json
import os

mcp = FastMCP("gmail-email")

def get_gmail_password(email: str) -> str:
    """Read Gmail app password for the given email from ~/.gmail/access.json."""
    access_path = os.path.expanduser("~/.gmail/access.json")
    with open(access_path) as f:
        data = json.load(f)
    # access.json should be: { "user@gmail.com": "app-password-here", ... }
    if email not in data:
        raise ValueError(f"No password found for {email} in {access_path}")
    return data[email]

def send_gmail(
    sender_email: str,
    recipient_email: str,
    subject: str,
    body: str
) -> str:
    """Send an email using Gmail SMTP, reading password from ~/.gmail/access.json."""
    try:
        sender_password = get_gmail_password(sender_email)
        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = recipient_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient_email, msg.as_string())
        return f"Email sent to {recipient_email} with subject '{subject}'"
    except Exception as e:
        return f"Failed to send email: {e}"

@mcp.tool()
def send_email_via_gmail(
    sender_email: str,
    recipient_email: str,
    subject: str,
    body: str
) -> str:
    """Send an email using Gmail SMTP.

    Args:
        sender_email: Gmail address to send from.
        recipient_email: Recipient's email address.
        subject: Email subject.
        body: Email body.

    Returns:
        Status message.
    """
    return send_gmail(sender_email, recipient_email, subject, body)

if __name__ == "__main__":
    mcp.run(transport="stdio")