from dotenv import load_dotenv
import os
import streamlit as st
from streamlit.errors import StreamlitSecretNotFoundError
from openai import OpenAI


class OrionClient:
    def __init__(self):
        load_dotenv()

        # Try Streamlit secrets first
        try:
            api_key = st.secrets["OPENROUTER_API_KEY"]
        except (KeyError, StreamlitSecretNotFoundError):
            api_key = os.getenv("OPENROUTER_API_KEY")

        if not api_key:
            raise ValueError(
                "OPENROUTER_API_KEY is not configured. "
                "Add it to .env or .streamlit/secrets.toml."
            )

        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )

        self.model = "tencent/hy3:free"

    def chat(self, messages, temperature=0.7, max_tokens=1000):
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content

    def chat_with_tools(self, messages, tools, temperature=0.7, max_tokens=1000):
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            tools=tools,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message
