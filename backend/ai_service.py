from sentence_transformers import SentenceTransformer
import json
import numpy as np

class AIService:
    _model = None

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
