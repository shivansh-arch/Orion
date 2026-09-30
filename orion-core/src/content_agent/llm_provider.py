import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class OllamaProvider:
    def __init__(self, model="llama3.2:3b"):
        self.client = OpenAI(
            base_url="http://localhost:11434/v1",
            api_key="ollama",
        )
        self.model = model

    def chat(self, messages, temperature=0.7, max_tokens=1000):
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        content = response.choices[0].message.content
        return content if content is not None else ""


class GroqApiProvider:
    def __init__(self, model="openai/gpt-oss-20b"):
        api_key = os.environ.get("GROQ_API_KEY") or os.environ.get(
            "YOUR_GROQ_API_KEY"
        )
        if not api_key:
            raise ValueError(
                "GROQ_API_KEY is not configured. Add it to orion-core/.env or "
                "set it in the environment before running Orion."
            )

        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
        )
        self.model = model

    def chat(self, messages, temperature=0.7, max_tokens=1000):
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        content = response.choices[0].message.content
        return content if content is not None else ""


def get_provider(name: str):
    if name == "ollama":
        return OllamaProvider()
    if name == "groq":
        return GroqApiProvider()
    raise ValueError(f"Unknown provider: {name}")
