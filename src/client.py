from dotenv import load_dotenv
import os
import streamlit as st
from openai import OpenAI

class OrionClient:
    def __init__(self):
        load_dotenv()

        self.api_key = (
            st.secrets.get("OPENROUTER_API_KEY")
            or os.getenv("OPENROUTER_API_KEY")
        )

        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is not configured.")

        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=self.api_key
        )

        self.model = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"
    def chat(self,messages,temperature=0.7,max_tokens=1000):
            response = self.client.chat.completions.create(
                model=self.model ,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
    def chat_with_tools(self,messages,tools,temperature=0.7,max_tokens=1000):
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            tools=tools,
            temperature=temperature,
            max_tokens=max_tokens
            )
        return response.choices[0].message
