from ai_service import AIService

def test_categorization():
    test_cases = [
        ("Smartwatch", "Digital watch with rubber strap"),
        ("iPhone 13", "Found near the canteen with a cracked screen"),
        ("Blue Notebook", "Math notes inside, name on first page"),
        ("Honda Car Keys", "Found at the quadrangle"),
        ("Leather Wallet", "Contains some cash and a student ID"),
        ("Gold Necklace", "Very shiny, found in the gym")
    ]
    
    print("\n--- AI Categorization Test (Improved Seeds) ---")
    for name, desc in test_cases:
        category = AIService.classify_item(name, desc)
        print(f"Item: {name:15} | Derived Category: {category}")

if __name__ == "__main__":
    test_categorization()
