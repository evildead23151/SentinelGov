import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

# Configure Logging
logger = logging.getLogger("GovIntel-EmailService")
logger.setLevel(logging.INFO)

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", None)
        self.smtp_pass = os.getenv("SMTP_PASS", None)
        self.mock_mode = not (self.smtp_user and self.smtp_pass)

    def send_email(self, to_email: str, subject: str, body: str):
        """
        Sends an email. If credentials are missing, logs it to console (Mock Mode).
        """
        if self.mock_mode:
            print(f"\n[📧 MOCK EMAIL SERVICE] --------------------------------")
            print(f"TO: {to_email}")
            print(f"SUBJECT: {subject}")
            print(f"BODY:\n{body}")
            print(f"-------------------------------------------------------\n")
            return True

        try:
            msg = MIMEMultipart()
            msg['From'] = self.smtp_user
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))

            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_pass)
            text = msg.as_string()
            server.sendmail(self.smtp_user, to_email, text)
            server.quit()
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            print(f"❌ Email Send Failed: {e}")
            return False

    def send_investigation_notice(self, to_email: str, case_title: str, case_id: int):
        subject = f"OFFICIAL NOTICE: Investigation Opened - Case #{case_id}"
        body = f"""
        Dear Officer,

        This is an automated notification from the GovIntel SOC.
        
        A new investigation file has been opened:
        Case ID: {case_id}
        Title: {case_title}
        
        Please log in to the secure portal to review the assigned artifacts.
        
        Regards,
        GovIntel System
        """
        return self.send_email(to_email, subject, body)

email_service = EmailService()
