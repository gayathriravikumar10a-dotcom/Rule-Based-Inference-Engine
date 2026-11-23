
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from inference.knowledge_base import INITIAL_FACTS, RULES
from inference.forward_chaining import forward_chain
from inference.backward_chaining import backward_chain


app = FastAPI(
    title="Rule-Based Inference Engine",
    description="A propositional logic inference engine for network fault diagnosis.",
    version="1.0.0",
)


# Allow React frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Rule-Based Inference Engine API is running",
        "status": "online",
        "version": "1.0.0",
    }


@app.get("/api/knowledge-base")
def get_knowledge_base():
    return {
        "initial_facts": sorted(INITIAL_FACTS),
        "rules": RULES,
        "total_facts": len(INITIAL_FACTS),
        "total_rules": len(RULES),
    }


@app.post("/api/forward")
def run_forward_chaining(payload: dict):
    facts = payload.get("facts", [])

    result = forward_chain(
        initial_facts=set(facts),
        rules=RULES,
    )

    return result


@app.post("/api/backward")
def run_backward_chaining(payload: dict):
    facts = payload.get("facts", [])
    goal = payload.get("goal", "").strip()

    if not goal:
        return {
            "goal": goal,
            "proven": False,
            "answer": "NO",
            "trace": [
                {
                    "action": "ERROR",
                    "message": "A goal must be provided.",
                }
            ],
        }

    result = backward_chain(
        goal=goal,
        facts=set(facts),
        rules=RULES,
    )

    return result
