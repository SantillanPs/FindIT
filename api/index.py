import sys
import os

# Add the 'backend' folder to the Python path
# This allows 'from main import app' to work correctly
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, '..'))
backend_path = os.path.join(project_root, 'backend')

if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Vercel looks for a top-level 'app' instance in 'api/index.py'
from main import app
