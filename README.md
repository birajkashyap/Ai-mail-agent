# Prompt-Driven Email Productivity Agent

> [!IMPORTANT]
> **Backend Cold Start**: This application uses the free tier of Render. It may take **1-2 minutes** for the backend to spin up.
> **[Watch the Demo Video](https://drive.google.com/file/d/1exFRx6GpeACAvHssw6qQEReNPyi6DF4C/view?usp=drive_link)** or set up locally to avoid the wait.

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

## Deployment

- **Frontend (Vercel)**: [https://ai-mail-agent.vercel.app](https://ai-mail-agent.vercel.app)
- **Backend (Render)**: [https://ai-mail-agent-gby4.onrender.com](https://ai-mail-agent-gby4.onrender.com)

## Usage

1.  **Local**: Open `http://localhost:3000`.
2.  **Production**: Open [https://ai-mail-agent.vercel.app](https://ai-mail-agent.vercel.app).
3.  **Refresh Inbox**: Click the refresh button to load emails (from backend or mock data).
4.  **Prompt Brain**: Configure AI behavior in the "Brain" tab.
    -   *Note*: If the database is empty, click the **"Initialize Brain"** button to seed default prompts.
5.  **AI Chat**: Click any email and use the chat interface to:
    -   Summarize the email.
    -   Draft a reply.
    -   Extract action items.
    -   Ask specific questions (e.g., "What is the deadline?").
