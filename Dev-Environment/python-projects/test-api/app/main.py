from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="test-api",
    description="Sabir's test-api API",
    version="1.0.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4728", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "project": "test-api",
        "status": "running",
        "port": 4728,
        "developer": "Sabir Asheed",
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
