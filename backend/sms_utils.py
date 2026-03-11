from datetime import datetime, timedelta
import random

def generate_otp():
    """Generates a 6-digit random code"""
    return str(random.randint(100000, 999999))

def send_otp(phone: str, code: str):
    """
    Mock utility to send OTP. 
    In production, this would call an SMS API like Twilio, Msg91, etc.
    """
    print("\n" + "="*50)
    print(f"SMS SENT TO: {phone}")
    print(f"MESSAGE: Your verification code is {code}")
    print("="*50 + "\n")
    return True
