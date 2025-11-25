import openai
import google.generativeai as genai
from app.config import settings
import json
import logging

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.openai_api_key = settings.OPENAI_API_KEY
        self.gemini_api_key = settings.GEMINI_API_KEY
        
        if self.provider == "openai" and self.openai_api_key:
            openai.api_key = self.openai_api_key
        elif self.provider == "gemini" and self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)

    async def generate_text(self, prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
        if not (self.openai_api_key or self.gemini_api_key):
            logger.warning("No API Key found. Returning mock response.")
            return "Mock LLM Response: Please configure API Key."

        try:
            if self.provider == "openai":
                response = await openai.ChatCompletion.acreate(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ]
                )
                return response.choices[0].message.content.strip()
            
            elif self.provider == "gemini":
                model_name = getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash")
                if not model_name.startswith("models/"):
                    model_name = f"models/{model_name}"
                model = genai.GenerativeModel(model_name)
                # Gemini doesn't have system prompts in the same way, usually prepended
                full_prompt = f"{system_prompt}\n\n{prompt}"
                response = await model.generate_content_async(full_prompt)
                return response.text.strip()
                
            return "Mock LLM Response: Provider not implemented."
        except Exception as e:
            logger.error(f"LLM Error: {e}")
            return f"Error generating response: {str(e)}"

    async def generate_json(self, prompt: str, system_prompt: str = "You are a helpful assistant.") -> dict:
        text_response = await self.generate_text(prompt, system_prompt)
        try:
            # Attempt to find JSON in the response
            if "```json" in text_response:
                text_response = text_response.split("```json")[1].split("```")[0].strip()
            elif "```" in text_response:
                text_response = text_response.split("```")[1].split("```")[0].strip()
            
            return json.loads(text_response)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON: {text_response}")
            return {}

    async def categorize_email(self, content: str, prompt_template: str, instructions: str = "") -> str:
        full_prompt = f"""
        Email Content:
        {content}
        
        Instructions:
        {instructions}
        
        {prompt_template}
        """
        return await self.generate_text(full_prompt, system_prompt="You are an email categorization assistant.")

    async def extract_action_items(self, content: str, prompt_template: str, instructions: str = "") -> dict:
        full_prompt = f"""
        Email Content:
        {content}
        
        Instructions:
        {instructions}
        
        {prompt_template}
        """
        return await self.generate_json(full_prompt, system_prompt="You are a task extraction assistant. Output valid JSON.")

    async def summarize_email(self, content: str, prompt_template: str, instructions: str = "") -> str:
        full_prompt = f"""
        Email Content:
        {content}
        
        Instructions:
        {instructions}
        
        {prompt_template}
        """
        return await self.generate_text(full_prompt, system_prompt="You are an email summarization assistant.")

    async def generate_draft(self, content: str, prompt_template: str, instructions: str = "") -> str:
        full_prompt = f"""
        Original Email:
        {content}
        
        User Instructions:
        {instructions}
        
        {prompt_template}
        """
        return await self.generate_text(full_prompt, system_prompt="You are an email drafting assistant.")

llm_service = LLMService()
