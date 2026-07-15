

Readme · MD
# 🛰️ Orion — Multi-Agent AI Assistant
 
Orion is a multi-agent AI system that thinks, plans, and delegates. Give it a query and it routes it to the right specialist — a researcher that searches the web, or a coder that writes and runs Python. For complex tasks, the Planner breaks the query into steps and executes each one independently.
 
---
 
## ✨ Features
 
- **LLM-based routing** — automatically decides whether a task needs research or code
- **Researcher Agent** — searches the web using Exa (with Wikipedia fallback)
- **Coder Agent** — writes and executes Python code in a secure sandbox
- **Planner Mode** — breaks complex queries into steps, executes each one
- **Memory** — auto-summarizes conversation history when it gets too long
- **Voice I/O** — speak your query, hear the response (local only)
- **Streamlit UI** — chat interface with sidebar showing active agent and thinking process
---
 
## 🗂️ Project Structure
 
```
orion/
├── src/
│   ├── client.py              # OpenRouter API wrapper
│   ├── memory.py              # Conversation memory with summarization
│   ├── planner.py             # Plan → Execute agent
│   ├── voice.py               # Speech input/output
│   ├── tools/
│   │   ├── search.py          # Exa search + Wikipedia fallback
│   │   ├── web.py             # Webpage fetcher
│   │   ├── calculator.py      # Safe math evaluator
│   │   └── code_runner.py     # Python code execution sandbox
│   └── agents/
│       ├── researcher.py      # Research agent (search + web tools)
│       ├── coder.py           # Coder agent (code runner tool)
│       └── orchestrator.py    # Routes queries to the right agent
├── app.py                     # Streamlit UI
├── main.py                    # Terminal interface with voice toggle
├── requirements.txt
└── README.md
```
 
---
 
## 🚀 Getting Started
 
**1. Clone the repo**
```bash
git clone https://github.com/shivansh-arch/orion.git
cd orion
```
 
**2. Create and activate virtual environment**
```bash
python -m venv venv
venv\Scripts\activate   # Windows
```
 
**3. Install dependencies**
```bash
pip install -r requirements.txt
```
 
**4. Set up API keys in `.env`**
```
OPENROUTER_API_KEY=sk-or-v1-...
EXA_API_KEY=your-exa-key
```
 
Get OpenRouter key free at [openrouter.ai/keys](https://openrouter.ai/keys)
Get Exa key at [exa.ai](https://exa.ai)
 
---
 
## 🖥️ Running Orion
 
**Streamlit UI:**
```bash
python -m streamlit run app.py
```
 
**Terminal with voice:**
```bash
python main.py
```
 
Terminal commands:
- `voice on` / `voice off` — toggle voice mode
- `plan: your query` — use planner mode
- `quit` — exit
---
 
## 🧠 How It Works
 
```
User Query
    │
    ▼
Orchestrator (LLM routing)
    │
    ├── "research" → Researcher Agent
    │       ├── search(query)        ← Exa / Wikipedia
    │       └── fetch_webpage(url)   ← BeautifulSoup
    │
    └── "code" → Coder Agent
            └── run_python_code(code) ← subprocess sandbox
 
Planner Mode:
User Query → Plan (N steps) → Each step → Orchestrator → Results
```
 
---
 
## 🛠️ Tech Stack
 
- Python
- OpenRouter API (LLM inference)
- Exa API (semantic web search)
- Wikipedia REST API (fallback search)
- BeautifulSoup (web scraping)
- SpeechRecognition + pyttsx3 (voice)
- Streamlit (UI)
---
 
## 📚 Concepts Implemented
 
- Native function calling (structured tool_calls)
- ReAct pattern (Thought → Action → Observation)
- LLM-based routing
- Multi-agent orchestration
- Plan → Execute pattern
- Context window management with summarization
- Secure code execution via subprocess sandbox
- Exa semantic search with fallback
---
 
## 👤 Author
 
**Shivansh Gupta**
B.Tech CSE (AI/ML) — Lovely Professional University
GitHub: [@shivansh-arch](https://github.com/shivansh-arch)
 












