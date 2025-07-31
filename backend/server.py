import os
import sys
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Import the FastAPI app from main module
from main import app

if __name__ == '__main__':
    # Seed initial data
    from seed_data import seed_database
    seed_database()
    
    print("🚀 Starting GBSite FastAPI Backend...")
    print("📍 Backend URL: http://127.0.0.1:8001")
    print("📚 API Docs: http://127.0.0.1:8001/docs")
    print("🔑 Admin Login: admin@gbsite.com / admin123")
    print("-" * 50)
    
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8001, 
        reload=True,
        log_level="info"
    )