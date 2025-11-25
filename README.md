# Prompt-Driven Email Productivity Agent

An intelligent, prompt-driven Email Productivity Agent capable of processing an inbox and performing automated tasks such as categorization, action-item extraction, and auto-drafting replies.

## Setup Instructions

### Backend
1.  Navigate to `backend/`:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Configure environment variables in `.env` (add your API keys).
4.  Run the server:
    ```bash
    uvicorn app.main:app --reload
    ```

### Frontend
1.  Navigate to `frontend/`:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

## Usage
1.  Open the frontend at `http://localhost:3000`.
2.  Click "Load Inbox" to ingest mock emails.
3.  Go to "Prompt Brain" to configure your agent's behavior.
4.  Use the "Email Agent" chat to interact with your emails.
