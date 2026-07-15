import streamlit as st

from src.client import OrionClient
from src.agents.orchestrator import Orchestrator
from src.planner import Planner

# --------------------------------------------------
# Page Config
# --------------------------------------------------

st.set_page_config(
    page_title="Orion",
    page_icon="🛰️",
    layout="wide",
)

st.title("🛰️ Orion")
st.caption("Think • Plan • Delegate")

# --------------------------------------------------
# Load Components
# --------------------------------------------------


@st.cache_resource
def load():
    client = OrionClient()
    orchestrator = Orchestrator(client)
    planner = Planner(client)
    return orchestrator, planner


orchestrator, planner = load()

# --------------------------------------------------
# Session State
# --------------------------------------------------

if "messages" not in st.session_state:
    st.session_state.messages = []

if "agent" not in st.session_state:
    st.session_state.agent = "None"

if "thinking" not in st.session_state:
    st.session_state.thinking = []

if "tools" not in st.session_state:
    st.session_state.tools = []

# --------------------------------------------------
# Sidebar
# --------------------------------------------------

with st.sidebar:

    st.title("⚙️ Orion")

    mode = st.radio(
        "Execution Mode",
        ["Direct", "Planner"],
    )

    st.divider()

    st.subheader("🤖 Active Agent")
    st.info(st.session_state.agent)

    st.divider()

    st.subheader("🧠 Thinking")

    if st.session_state.thinking:
        for i, step in enumerate(st.session_state.thinking, start=1):
            st.write(f"{i}. {step}")
    else:
        st.caption("Waiting for query...")

    st.divider()

    st.subheader("🛠 Tools Called")

    if st.session_state.tools:
        for tool in st.session_state.tools:
            st.success(tool)
    else:
        st.caption("No tools used.")

# --------------------------------------------------
# Chat History
# --------------------------------------------------

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# --------------------------------------------------
# Chat Input
# --------------------------------------------------

prompt = st.chat_input("Ask Orion anything...")

if prompt:

    st.session_state.messages.append({"role": "user", "content": prompt})

    with st.chat_message("user"):
        st.markdown(prompt)

    st.session_state.agent = "None"
    st.session_state.tools = []
    st.session_state.thinking = []

    with st.spinner("Orion is thinking..."):

        try:

            # ----------------------------
            # Planner Mode
            # ----------------------------

            if mode == "Planner":

                result = planner.run(prompt, orchestrator)
                result = planner.run(prompt, orchestrator)
                import json
                print("PLANNER RESULT:", json.dumps(result, default=str))

                tasks = result.get("tasks", [])
                results = result.get("results", [])

                response_parts = []

                for i, (task, res) in enumerate(zip(tasks, results), start=1):
                    if isinstance(res, dict):
                        answer = res.get("answer", str(res))
                    else:
                        answer = str(res)

                    response_parts.append(
                        f"### Task {i}\n**{task}**\n\n{answer}"
                    )

                response = "\n\n".join(response_parts)
                st.session_state.agent = "Planner"
                st.session_state.thinking = [f"{len(tasks)} tasks planned and executed"]

            # ----------------------------
            # Direct Mode
            # ----------------------------

            else:

                result = orchestrator.run(prompt)

                if result is None:
                    response = "Agent returned no response."

                elif isinstance(result, dict):
                    response = result.get("answer", result.get("error", str(result)))
                    st.session_state.thinking = [
                        f"Completed in {result.get('iterations', 0)} iteration(s)"
                    ]
                    if hasattr(orchestrator, "last_route"):
                        st.session_state.agent = orchestrator.last_route

                else:
                    response = str(result)
                    if hasattr(orchestrator, "last_route"):
                        st.session_state.agent = orchestrator.last_route

        except Exception as e:
            response = f"❌ Error:\n\n```text\n{e}\n```"

    with st.chat_message("assistant"):
        st.markdown(response)

    st.session_state.messages.append({"role": "assistant", "content": response})

    st.rerun()