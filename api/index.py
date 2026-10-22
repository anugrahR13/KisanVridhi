import sys
import os

# Add the backend directory to sys.path so that 'from app....' imports resolve cleanly
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
backend_dir = os.path.join(project_root, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

if project_root not in sys.path:
    sys.path.append(project_root)

from app.main import app

# Export for ASGI serverless runtime
handler = app
