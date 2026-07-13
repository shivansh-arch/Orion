
import os
import dotenv 
class Orionclinet:
    def __init__(self):
        dotenv.load_dotenv()
        self.api_key=os.getenv("OPENROUTER_API_KEY")
        
        self.client=OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=self.api_key
        )
        self.model = "openrouter/auto"
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