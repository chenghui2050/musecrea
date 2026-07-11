import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger(__name__)


def send_reset_email(to_email: str, username: str, reset_token: str, base_url: str = "http://localhost:8000") -> bool:
    """Send password reset email with reset link."""
    reset_url = f"{base_url}/#/reset-password?token={reset_token}"

    subject = "MuseCrea - 密码重置 / Password Reset"
    html_body = f"""\
<html>
<body style="font-family: 'Microsoft YaHei', 'Segoe UI', sans-serif; background: #1a1a2e; color: #e0e0e0; padding: 40px;">
  <div style="max-width: 500px; margin: 0 auto; background: #16213e; border: 2px solid #209cee; padding: 32px; border-radius: 0;">
    <h2 style="color: #209cee; text-align: center; font-family: monospace;">MuseCrea</h2>
    <p>你好 {username}，</p>
    <p>你正在重置密码。请点击下方链接设置新密码：</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="{reset_url}" style="background: #209cee; color: #0f0f23; padding: 12px 28px; text-decoration: none; font-weight: bold; font-family: monospace; display: inline-block;">
        重置密码 / Reset Password
      </a>
    </p>
    <p style="color: #999; font-size: 13px;">此链接将在 {settings.RESET_TOKEN_EXPIRE_HOURS} 小时后失效。</p>
    <p style="color: #999; font-size: 13px;">如果你没有请求重置密码，请忽略此邮件。</p>
    <hr style="border-color: #209cee33; margin: 24px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">MuseCrea - 文创产品创意评价系统</p>
  </div>
</body>
</html>
"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        if settings.SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM_EMAIL, to_email, msg.as_string())
        server.quit()
        logger.info(f"Password reset email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send reset email to {to_email}: {e}")
        return False


def send_feedback_email(username: str, evaluation_id: int, sentiment: str, feedback_text: str) -> bool:
    """Send report feedback email to admin."""
    sentiment_label = "👍 点赞" if sentiment == "up" else "👎 点踩"
    subject = f"MuseCrea 报告反馈 - {sentiment_label} (评价#{evaluation_id})"

    html_body = f"""\
<html>
<body style="font-family: 'Microsoft YaHei', 'Segoe UI', sans-serif; background: #1a1a2e; color: #e0e0e0; padding: 40px;">
  <div style="max-width: 600px; margin: 0 auto; background: #16213e; border: 2px solid #209cee; padding: 32px;">
    <h2 style="color: #209cee; text-align: center; font-family: monospace;">MuseCrea 报告反馈</h2>
    <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 8px 12px; color: #888; border-bottom: 1px solid #2a2a4a;">用户</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #2a2a4a;">{username}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; color: #888; border-bottom: 1px solid #2a2a4a;">评价 ID</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #2a2a4a;">#{evaluation_id}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; color: #888; border-bottom: 1px solid #2a2a4a;">反馈态度</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #2a2a4a;">{sentiment_label}</td>
      </tr>
    </table>
    <h3 style="color: #f7d51d;">反馈内容</h3>
    <div style="background: #1a1a2e; padding: 16px; border-left: 3px solid #209cee; white-space: pre-wrap; line-height: 1.6;">
{feedback_text if feedback_text else '<span style="color:#888;">（无文字反馈）</span>'}
    </div>
    <hr style="border-color: #209cee33; margin: 24px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">MuseCrea - 文创产品创意评价系统</p>
  </div>
</body>
</html>
"""

    m = MIMEMultipart("alternative")
    m["Subject"] = subject
    m["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    m["To"] = settings.SMTP_FROM_EMAIL  # send to admin
    m.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        if settings.SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM_EMAIL, settings.SMTP_FROM_EMAIL, m.as_string())
        server.quit()
        logger.info(f"Feedback email sent for evaluation #{evaluation_id} by {username}")
        return True
    except Exception as e:
        logger.error(f"Failed to send feedback email: {e}")
        return False
