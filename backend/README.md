# Low price luxury - FastAPI Backend

This is the separated Python backend for the Deal Store application.

## Prerequisites

- Python 3.9+
- pip

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

## Running the Server

Run the server with Uvicorn:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
You can view the interactive API documentation at `http://localhost:8000/docs`.

## Project Structure

- `main.py`: Entry point and router registration.
- `database.py`: SQLAlchemy setup.
- `models.py`: Database models (matches Prisma schema).
- `schemas.py`: Pydantic models for request/response.
- `auth_utils.py`: JWT and Password hashing logic.
- `routers/`: Directory containing all API endpoints.
