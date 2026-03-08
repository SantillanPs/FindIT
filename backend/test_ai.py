from ai_service import AIService

print("Testing Classification...")
category = AIService.classify_item("iPhone 14 Pro", "Silver color, has a clear case. Found in the library.")
print(f"Result: {category}")

print("Testing Generation...")
embedding = AIService.generate_embedding("This is a simple test item.")
print(f"Generated Vector Length: {len(AIService.get_embedding_list(embedding))}")
