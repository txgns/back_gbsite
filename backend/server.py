import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Import the Flask app from the main module
from src.main import app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)