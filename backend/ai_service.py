from sentence_transformers import SentenceTransformer
import json
import numpy as np

class AIService:
    _model = None
    # BAAI/bge-m3 produces 1024-dimensional vectors
    EMBEDDING_DIM = 1024

    @classmethod
    def get_model(cls):
        if cls._model is None:
            print("Loading BAAI/bge-m3 model (this may take a while on first run)...")
            # Using cpu as default for compatibility, can be changed to 'cuda' if available
            cls._model = SentenceTransformer('BAAI/bge-m3')
        return cls._model

    @classmethod
    def generate_embedding(cls, text: str) -> str:
        model = cls.get_model()
        # Generate embedding
        embedding = model.encode(text)
        # Convert to list and then JSON string for SQLite storage
        return json.dumps(embedding.tolist())

    @classmethod
    def get_embedding_list(cls, embedding_str: str) -> list:
        return json.loads(embedding_str)

    @classmethod
    def calculate_similarity(cls, embedding1: list, embedding2: list) -> float:
        # Using numpy for cosine similarity
        e1 = np.array(embedding1)
        e2 = np.array(embedding2)
        
        # Cosine Similarity = (A . B) / (||A|| * ||B||)
        dot_product = np.dot(e1, e2)
        norm_e1 = np.linalg.norm(e1)
        norm_e2 = np.linalg.norm(e2)
        
        if norm_e1 == 0 or norm_e2 == 0:
            return 0.0
            
        return float(dot_product / (norm_e1 * norm_e2))

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
            "Other": "other items, general objects"
        }
        
        categories = list(category_seeds.keys())
        seeds = list(category_seeds.values())
        
        content = f"{item_name}: {description}"
        content_embedding = cls.get_model().encode(content)
        
        # Compare against the descriptive seeds instead of just the single word label
        seed_embeddings = cls.get_model().encode(seeds)
        
        # Calculate cosine similarity for each seed
        similarities = [cls.calculate_similarity(content_embedding.tolist(), seed_emb.tolist()) for seed_emb in seed_embeddings]
        
        # Return the category with highest similarity
        best_match_idx = np.argmax(similarities)
        return categories[best_match_idx]
