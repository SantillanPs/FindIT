import sys
import os

# Mimic the environment where api/index.py is run
sys.path.insert(0, os.getcwd())

try:
    from api.index import app
    print("SUCCESS: App loaded successfully from api/index.py")
    print(f"App instance: {app}")
except Exception as e:
    import traceback
    print(f"FAILURE: {e}")
    traceback.print_exc()
    sys.exit(1)
