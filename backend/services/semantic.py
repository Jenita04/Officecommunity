import faiss
import numpy as np
from typing import List, Tuple

class SemanticEngine:
    def __init__(self, dimension: int = 384):
        # Using a simple index for demo. Replace with HNSW for production.
        self.dimension = dimension
        self.index = faiss.IndexFlatL2(dimension)
        self.post_mapping = {} # maps FAISS index id -> Post ID
        self.current_id = 0
        
    def _mock_embedding(self, text: str) -> np.ndarray:
        # MOCK IMPLEMENTATION: Returns random vector
        # In production, use sentence-transformers or OpenAI here.
        np.random.seed(hash(text) % (2**32))
        return np.random.rand(1, self.dimension).astype('float32')

    def add_post(self, post_id: int, text: str):
        vector = self._mock_embedding(text)
        self.index.add(vector)
        self.post_mapping[self.current_id] = post_id
        self.current_id += 1
        
    def search(self, query: str, top_k: int = 3) -> List[Tuple[int, float]]:
        if self.current_id == 0:
            return []
            
        vector = self._mock_embedding(query)
        distances, indices = self.index.search(vector, min(top_k, self.current_id))
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx != -1:
                results.append((self.post_mapping[idx], float(distances[0][i])))
                
        return results

semantic_engine = SemanticEngine()
