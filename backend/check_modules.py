import schemas
import os
import routers.lost as lost
import inspect

print(f"Schemas file: {schemas.__file__}")
print(f"Lost router file: {lost.__file__}")

try:
    from schemas import AdminMatchSuggestion
    print("AdminMatchSuggestion found in schemas")
    print(f"Item type in AdminMatchSuggestion: {AdminMatchSuggestion.model_fields['item'].annotation}")
except ImportError:
    print("AdminMatchSuggestion NOT found in schemas")
except Exception as e:
    print(f"Error checking AdminMatchSuggestion: {e}")
