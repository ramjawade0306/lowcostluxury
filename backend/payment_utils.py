import os
import httpx
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

PHONEPE_SANDBOX_BASE = "https://api-preprod.phonepe.com"
PHONEPE_PROD_BASE = "https://api.phonepe.com"
USE_SANDBOX = os.getenv("PHONEPE_SANDBOX") == "true"

CLIENT_ID = os.getenv("PHONEPE_CLIENT_ID")
CLIENT_SECRET = os.getenv("PHONEPE_CLIENT_SECRET")
CLIENT_VERSION = os.getenv("PHONEPE_CLIENT_VERSION", "1")

async def get_phonepe_token() -> str:
    base_url = PHONEPE_SANDBOX_BASE if USE_SANDBOX else PHONEPE_PROD_BASE
    token_path = "/apis/pg-sandbox/v1/oauth/token" if USE_SANDBOX else "/apis/identity-manager/v1/oauth/token"
    
    if not CLIENT_ID or not CLIENT_SECRET:
        raise Exception("PhonePe client credentials not configured")

    payload = {
        "client_id": CLIENT_ID,
        "client_version": CLIENT_VERSION,
        "client_secret": CLIENT_SECRET,
        "grant_type": "client_credentials",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{base_url}{token_path}",
            data=payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        data = response.json()
        if "access_token" not in data:
            raise Exception(f"Failed to get PhonePe token: {data.get('message', 'Unknown error')}")
        return data["access_token"]

async def create_phonepe_payment(order_id: str, amount: float, redirect_url: str):
    token = await get_phonepe_token()
    base_url = PHONEPE_SANDBOX_BASE if USE_SANDBOX else PHONEPE_PROD_BASE
    pay_path = "/apis/pg-sandbox/checkout/v2/pay" if USE_SANDBOX else "/apis/pg/checkout/v2/pay"
    
    amount_paisa = int(round(amount * 100))
    
    body = {
        "merchantOrderId": order_id,
        "amount": amount_paisa,
        "expireAfter": 1200,
        "paymentFlow": {
            "type": "PG_CHECKOUT",
            "merchantUrls": {
                "redirectUrl": redirect_url,
            },
        },
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{base_url}{pay_path}",
            json=body,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"O-Bearer {token}"
            }
        )
        return response.json()

async def get_phonepe_status(merchant_order_id: str):
    token = await get_phonepe_token()
    base_url = PHONEPE_SANDBOX_BASE if USE_SANDBOX else PHONEPE_PROD_BASE
    status_path = "/apis/pg-sandbox" if USE_SANDBOX else "/apis/pg"
    status_url = f"{base_url}{status_path}/checkout/v2/order/{merchant_order_id}/status"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            status_url,
            headers={"Authorization": f"O-Bearer {token}"}
        )
        return response.json()
