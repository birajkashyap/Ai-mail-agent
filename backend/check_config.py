from app.config import settings
import sys

print(f"LLM_PROVIDER: {settings.LLM_PROVIDER}")
print(f"OPENAI_API_KEY: {'Set' if settings.OPENAI_API_KEY else 'Not Set'}")
print(f"GEMINI_API_KEY: {'Set' if settings.GEMINI_API_KEY else 'Not Set'}")
