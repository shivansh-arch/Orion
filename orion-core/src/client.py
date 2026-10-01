from dotenv import load_dotenv
import os
from openai import OpenAI


class OrionClient:
    def __init__(self):
        load_dotenv()

        api_key = os.getenv("GROQ_API_KEY") or os.getenv("YOUR_GROQ_API_KEY")

        if not api_key:
            raise ValueError(
                "GROQ_API_KEY is not configured. Add it to .env before running Orion."
            )

        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
        )

        self.model = "openai/gpt-oss-20b"

    def chat(self, messages, temperature=0.7, max_tokens=1000):
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            extra_body={"include_reasoning": False},
        )

        content = response.choices[0].message.content
        if content is None:
            content = ""

        return content

    def chat_with_tools(self, messages, tools, temperature=0.7, max_tokens=1000):
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            tools=tools,
            temperature=temperature,
            max_tokens=max_tokens,
            extra_body={"include_reasoning": False},
        )

        return response.choices[0].message
