import os
import sys
from dotenv import load_dotenv
from flask_cors import CORS

# Load environment variables
load_dotenv()

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Import the Flask app from the main module
from src.main import app

# Additional CORS configuration for development
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"], 
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    print("🚀 Starting GBSite Backend...")
    print("📍 Backend URL: http://127.0.0.1:8001")
    print("🏥 Health Check: http://127.0.0.1:8001/api/health")
    print("🔑 Admin Login: admin@gbsite.com / admin123")
    print("-" * 50)
    
    app.run(host='0.0.0.0', port=8001, debug=True)