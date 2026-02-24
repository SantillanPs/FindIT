from ai_service import AIService
import json

def test_embedding_generation():
    print("Testing AIService embedding generation...")
    text = "Cellphone: Blue wireless earbuds in a black case"
    
    try:
        embedding_json = AIService.generate_embedding(text)
        embedding = json.loads(embedding_json)
        
        print(f"Embedding generated successfully!")
        print(f"Type: {type(embedding)}")
        print(f"Length: {len(embedding)}")
        print(f"First 5 values: {embedding[:5]}")
        
        if len(embedding) == 1024:
            print("SUCCESS: Embedding length is 1024.")
        else:
            print(f"WARNING: Unexpected embedding length: {len(embedding)}")
            
        # Test classification
        category = AIService.classify_item("iPhone 15", "Blue colored smartphone")
        print(f"Classification test: iPhone 15 -> {category}")
        if category == "Cellphone":
            print("SUCCESS: Classified as Cellphone.")
        else:
            print(f"FAILED: Expected Cellphone, got {category}")
            
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    test_embedding_generation()
