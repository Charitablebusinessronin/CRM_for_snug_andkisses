from fastapi.testclient import TestClient
from app.main import app
ECHO is off.
client = TestClient(app)
ECHO is off.
def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "running"
