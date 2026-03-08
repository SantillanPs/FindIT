import json
import os
import math
from google import genai
from dotenv import load_dotenv

load_dotenv()

class AIService:
    # Google gemini-embedding-001 produces 3072-dimensional vectors
    EMBEDDING_DIM = 3072
    
    @classmethod
    def get_client(cls):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("WARNING: GOOGLE_API_KEY environment variable is not set. AI features will fail.")
        return genai.Client(api_key=api_key)

    @classmethod
    def _fetch_embeddings(cls, inputs):
        """
        Sends text to Google Gemini to generate embeddings using text-embedding-004.
        'inputs' can be a single string or a list of strings.
        Returns a list of floats (if single string) or a list of lists of floats.
        """
        try:
            client = cls.get_client()
            
            # Gemini API requires a list of strings natively, or it handles single strings
            input_list = [inputs] if isinstance(inputs, str) else inputs
            
            result = client.models.embed_content(
                model='gemini-embedding-001',
                contents=input_list,
            )
            
            # The modern Google GenAI library returns embeddings as an attribute on the result objects
            embeddings = [emb.values for emb in result.embeddings]
            
            return embeddings[0] if isinstance(inputs, str) else embeddings
            
        except Exception as e:
            print(f"Gemini API Error: {e}")
            # Fail gracefully with zero vectors if the API fails
            if isinstance(inputs, str):
                return [0.0] * cls.EMBEDDING_DIM
            else:
                return [[0.0] * cls.EMBEDDING_DIM for _ in inputs]

    @classmethod
    def generate_embedding(cls, text: str) -> str:
        # Generate embedding via API
        embedding = cls._fetch_embeddings(text)
        # Convert to JSON string for SQLite/Postgres storage
        return json.dumps(embedding)

    @classmethod
    def get_embedding_list(cls, embedding_str: str) -> list:
        if not embedding_str:
            return [0.0] * cls.EMBEDDING_DIM
        return json.loads(embedding_str)

    @classmethod
    def calculate_similarity(cls, embedding1: list, embedding2: list) -> float:
        """
        Pure Python implementation of Cosine Similarity (no numpy required).
        """
        if len(embedding1) != len(embedding2):
             return 0.0
             
        dot_product = sum(a * b for a, b in zip(embedding1, embedding2))
        norm_e1 = math.sqrt(sum(a * a for a in embedding1))
        norm_e2 = math.sqrt(sum(b * b for b in embedding2))
        
        if norm_e1 == 0 or norm_e2 == 0:
            return 0.0
            
        return float(dot_product / (norm_e1 * norm_e2))

    @classmethod
    def calculate_item_value(cls, category: str, description: str) -> int:
        """
        Calculates the integrity point value of an item based on its category 
        and descriptive importance.
        """
        base_values = {
            "Cellphone": 100,
            "Laptop": 150,
            "Tablet": 80,
            "ID Card": 40,
            "Wallet": 60,
            "Bag / Backpack": 50,
            "Keys": 30,
            "Headphones / Earbuds": 50,
            "Watch / Wearable": 70,
            "Water Bottle": 10,
            "Umbrella": 10,
            "Eyewear": 40,
            "Book": 20,
            "Notebook": 10,
            "Stationery": 5,
            "Clothing": 15,
            "Accessories": 25,
            "Electronics Accessories": 30,
            "Computer Peripheral": 35,
            "Other": 10
        }

        # Get base value
        points = base_values.get(category, 10)

        # Value Boosters (Keyword analysis)
        high_value_keywords = [
            "iphone", "macbook", "ipad", "samsung", "cash", "money", "wallet", 
            "gold", "silver", "jewelry", "expensive", "brand new", "important",
            "medical", "prescriptions", "luxury"
        ]
        
        desc_lower = description.lower()
        boost_count = sum(1 for kw in high_value_keywords if kw in desc_lower)
        
        # Add 10 points for each high-value keyword found, capped at 50 extra points
        points += min(boost_count * 10, 50)

        return points

    @classmethod
    def classify_item(cls, item_name: str, description: str) -> str:
        # Define internal descriptive seeds for better zero-shot accuracy
        category_seeds = {
            "Cellphone": "smartphones, iphones, android phones, mobile devices, cellphones",
            "Laptop": "laptops, macbooks, gaming laptops, computers",
            "Tablet": "tablets, ipads, surface pro, galaxy tab",
            "ID Card": "school ids, student license, id cards, registration cards",
            "Wallet": "wallets, coin purses, card holders",
            "Bag / Backpack": "backpacks, sling bags, tote bags, handbags, pouches",
            "Keys": "door keys, car keys, fobs, keychains",
            "Headphones / Earbuds": "airpods, headphones, earbuds, bluetooth headsets",
            "Watch / Wearable": "smartwatches, apple watch, fitbit, bracelets",
            "Water Bottle": "tumblers, hydroflask, water bottles, flasks",
            "Umbrella": "umbrellas, parasols",
            "Eyewear": "eye glasses, sunglasses, reading glasses",
            "Book": "textbooks, novels, hardbound books",
            "Notebook": "spiral notebooks, journals, binders, diaries",
            "Stationery": "pens, pencils, rulers, erasers, highlighters",
            "Clothing": "shirts, jackets, hoodies, pants, shoes, caps, hats",
            "Accessories": "jewelry, rings, necklaces, watches, scarves",
            "Electronics Accessories": "chargers, cables, power banks, adapters, cases",
            "Computer Peripheral": "computer mouse, keyboard, monitor, usb hub, mousepad",
            "Other": "other items, general objects"
        }
        
        categories = list(category_seeds.keys())
        seeds = list(category_seeds.values())
        
        content = f"{item_name}: {description}"
        
        # Batch API call: send the item content AND all the category seeds at once
        texts_to_embed = [content] + seeds
        
        try:
             embeddings = cls._fetch_embeddings(texts_to_embed)
             content_embedding = embeddings[0]
             seed_embeddings = embeddings[1:]
             
             # Calculate cosine similarity purely in Python
             similarities = [cls.calculate_similarity(content_embedding, seed_emb) for seed_emb in seed_embeddings]
             
             # Return the category with highest similarity
             best_match_idx = similarities.index(max(similarities))
             return categories[best_match_idx]
        except Exception as e:
             print(f"Classification failed, falling back to 'Other'. Error: {e}")
             return "Other"
