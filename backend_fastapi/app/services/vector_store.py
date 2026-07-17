import os
import json
import re
import math
from typing import List, Dict, Any

# Dynamic imports fallback for sentence-transformers
CROSS_ENCODER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"
HAS_TRANSFORMERS = False
try:
    from sentence_transformers import CrossEncoder
    HAS_TRANSFORMERS = True
except ImportError:
    pass

class VectorStore:
    INTENT_DOMAINS = {
        "GENERAL_ROBOTICS": ["GENERAL_ROBOTICS", "ROBOTICS_REFERENCE", "ROBOT_HARDWARE"],
        "ROS2_QOS": ["ROS2", "ROS2_QOS"],
        "ROS2": ["ROS2", "ROS2_QOS"],
        "NAV2": ["NAV2"],
        "SLAM": ["SLAM"],
        "MOVEIT": ["MOVEIT", "ROS2_CONTROL", "JOINT_LIMITS"],
        "ROS2_CONTROL": ["MOVEIT", "ROS2_CONTROL", "JOINT_LIMITS"],
        "JOINT_LIMITS": ["MOVEIT", "ROS2_CONTROL", "JOINT_LIMITS"],
        "ROBOT_SAFETY": ["ROBOT_SAFETY", "AGRICULTURAL_ROBOTICS"],
        "SPECIFIC_ROBOT_MODEL": ["AGRICULTURAL_ROBOTICS", "ROBOT_SAFETY", "ROBOT_HARDWARE"],
        "AGRICULTURAL_ROBOTICS": ["AGRICULTURAL_ROBOTICS", "ROBOT_SAFETY"],
        "ROBOT_HARDWARE": ["ROBOT_HARDWARE", "GENERAL_ROBOTICS"],
        "INDUSTRIAL_ROBOTICS": ["INDUSTRIAL_ROBOTICS"],
        "UNKNOWN": []
    }

    def __init__(self, knowledge_path: str = None):
        if knowledge_path is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            knowledge_path = os.path.abspath(os.path.join(current_dir, "..", "..", "data", "docs", "default_knowledge.json"))
        
        self.knowledge_path = knowledge_path
        self.documents = []
        self.vocab = set()
        self.idf = {}
        self.doc_vectors = []
        self.doc_tokens = []
        self.avg_doc_len = 1.0

        # Load cross-encoder if available
        self.encoder = None
        if HAS_TRANSFORMERS:
            try:
                self.encoder = CrossEncoder(CROSS_ENCODER_MODEL)
                print(f"Loaded Cross-Encoder Reranker model: {CROSS_ENCODER_MODEL}")
            except Exception as e:
                print(f"Failed to load sentence-transformers model. Falling back: {e}")

        self.load_documents()

    def load_documents(self):
        if not os.path.exists(self.knowledge_path):
            print(f"Knowledge file not found at: {self.knowledge_path}. Initializing empty store.")
            return
        
        try:
            with open(self.knowledge_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.documents = data.get("documents", [])
            self._build_index()
        except Exception as e:
            print(f"Error loading knowledge database: {e}")

    def add_document(self, doc: Dict[str, Any]):
        self.documents.append(doc)
        try:
            os.makedirs(os.path.dirname(self.knowledge_path), exist_ok=True)
            with open(self.knowledge_path, "w", encoding="utf-8") as f:
                json.dump({"documents": self.documents}, f, indent=2)
            self._build_index()
        except Exception as e:
            print(f"Error saving document to database: {e}")

    def delete_document(self, doc_id: str) -> bool:
        initial_count = len(self.documents)
        self.documents = [d for d in self.documents if d.get("id") != doc_id]
        if len(self.documents) < initial_count:
            try:
                with open(self.knowledge_path, "w", encoding="utf-8") as f:
                    json.dump({"documents": self.documents}, f, indent=2)
                self._build_index()
                return True
            except Exception as e:
                print(f"Error deleting document: {e}")
        return False

    def _tokenize(self, text: str) -> List[str]:
        text = text.lower()
        tokens = re.findall(r'[a-z0-9_]+', text)
        return tokens

    def _build_index(self):
        self.vocab = set()
        doc_tfs = []
        self.doc_tokens = []
        doc_lengths = []
        
        for doc in self.documents:
            content = doc.get("content", "")
            title = doc.get("title", "")
            full_text = f"{title} {content}"
            
            tokens = self._tokenize(full_text)
            self.doc_tokens.append(tokens)
            doc_lengths.append(len(tokens))
            
            tf = {}
            for t in tokens:
                tf[t] = tf.get(t, 0) + 1
            
            doc_tfs.append(tf)
            self.vocab.update(tf.keys())
        
        num_docs = len(self.documents)
        self.avg_doc_len = sum(doc_lengths) / max(num_docs, 1)
        
        self.idf = {}
        for term in self.vocab:
            containing_docs = sum(1 for tf in doc_tfs if term in tf)
            self.idf[term] = math.log((1 + num_docs) / (1 + containing_docs)) + 1
        
        # Build TF-IDF vectors
        self.doc_vectors = []
        for tf in doc_tfs:
            vector = {}
            length = 0
            for term, val in tf.items():
                tfidf_val = val * self.idf.get(term, 0)
                vector[term] = tfidf_val
                length += tfidf_val ** 2
            
            length = math.sqrt(length)
            if length > 0:
                for term in vector:
                    vector[term] /= length
            self.doc_vectors.append((vector, length))

    def search(self, query: str, intent: str = "UNKNOWN", top_k: int = 3) -> List[Dict[str, Any]]:
        if not self.documents:
            return []
        
        query_tokens = self._tokenize(query)
        
        # 1. Domain-Aware Filter
        target_domains = self.INTENT_DOMAINS.get(intent, [])
        candidate_indices = []
        for idx, doc in enumerate(self.documents):
            doc_domain = doc.get("domain", "")
            # If target_domains is empty (e.g. UNKNOWN) or document matches allowed list
            if not target_domains or doc_domain in target_domains:
                candidate_indices.append(idx)
        
        # Fallback: if domain filter returned nothing, evaluate all documents
        if not candidate_indices:
            candidate_indices = list(range(len(self.documents)))

        # 2. Vector Semantic Similarity score
        query_tf = {}
        for t in query_tokens:
            if t in self.vocab:
                query_tf[t] = query_tf.get(t, 0) + 1
                
        query_vec = {}
        query_len = 0
        for term, val in query_tf.items():
            tfidf_val = val * self.idf.get(term, 0)
            query_vec[term] = tfidf_val
            query_len += tfidf_val ** 2
            
        query_len = math.sqrt(query_len)
        if query_len > 0:
            for term in query_vec:
                query_vec[term] /= query_len

        # 3. Compute raw BM25 keyword scores for matching candidate documents
        raw_bm25_scores = {}
        k1 = 1.5
        b = 0.75
        for idx in candidate_indices:
            score = 0.0
            doc_tokens = self.doc_tokens[idx]
            doc_len = len(doc_tokens)
            for term in query_tokens:
                if term in self.vocab:
                    idf_val = self.idf.get(term, 0.0)
                    tf = doc_tokens.count(term)
                    num = tf * (k1 + 1)
                    denom = tf + k1 * (1.0 - b + b * (doc_len / self.avg_doc_len))
                    score += idf_val * (num / denom)
            raw_bm25_scores[idx] = score

        max_bm25 = max(raw_bm25_scores.values()) if raw_bm25_scores and max(raw_bm25_scores.values()) > 0 else 1.0

        # 4. Compute combined Hybrid Scores for Top 10 candidate selection
        candidates = []
        for idx in candidate_indices:
            doc = self.documents[idx]
            doc_vec, doc_len = self.doc_vectors[idx]

            # Vector similarity
            if doc_len == 0 or query_len == 0:
                semantic_score = 0.0
            else:
                semantic_score = sum(query_vec.get(term, 0.0) * val for term, val in doc_vec.items())
            
            # Boost if query tokens match title words (substring stem-like matching)
            title_tokens = set(self._tokenize(doc.get("title", "")))
            matching_title = sum(1 for q_tok in query_tokens if any(q_tok in t_tok or t_tok in q_tok for t_tok in title_tokens))
            if matching_title > 0:
                semantic_score = min(1.0, semantic_score + 0.35 * matching_title)

            # Keyword BM25 score normalized
            keyword_score = raw_bm25_scores[idx] / max_bm25

            # Domain score
            doc_domain = doc.get("domain", "")
            domain_score = 1.0 if (not target_domains or doc_domain in target_domains) else 0.0

            # Trust score
            trust_score = float(doc.get("trust_score", 1.0))

            # Combine
            final_hybrid_score = (
                semantic_score * 0.50 +
                keyword_score * 0.20 +
                domain_score * 0.20 +
                trust_score * 0.10
            )
            
            # Apply domain alignment bonus if matched intent matches doc domain exactly
            if doc_domain.upper() == intent.upper():
                final_hybrid_score = min(1.0, final_hybrid_score + 0.15)

            candidates.append((final_hybrid_score, idx, semantic_score, keyword_score, domain_score, trust_score))

        # Sort by hybrid score and take top 10
        candidates.sort(key=lambda x: x[0], reverse=True)
        top_candidates = candidates[:10]

        # 5. Cross-Encoder / Fallback Reranking
        reranked_results = []
        for score, idx, sem, kw, dom, tr in top_candidates:
            doc = self.documents[idx]
            doc_content = doc.get("content", "")
            
            if self.encoder is not None:
                # Use sentence-transformers
                try:
                    rerank_score = float(self.encoder.predict([query, doc_content]))
                    # Scale MS-MARCO logit score roughly into [0.0, 1.0] for comparison
                    rerank_score = 1.0 / (1.0 + math.exp(-rerank_score))
                except Exception:
                    rerank_score = score
            else:
                # Fallback relevance-ranking: Evaluate token overlap + Bigram match
                STOP_WORDS = {"what", "is", "a", "an", "the", "of", "for", "in", "on", "at", "by", "to", "with", "and", "or", "how", "do", "does", "i", "my", "why", "are", "about"}
                clean_q_tokens = [t for t in query_tokens if t not in STOP_WORDS]
                if not clean_q_tokens:
                    clean_q_tokens = query_tokens
                
                doc_toks = self.doc_tokens[idx]
                doc_toks_set = set(doc_toks)
                q_toks = set(clean_q_tokens)
                
                overlap = len(q_toks.intersection(doc_toks_set)) / len(q_toks) if q_toks else 0.0
                
                q_bigrams = set(zip(clean_q_tokens[:-1], clean_q_tokens[1:])) if len(clean_q_tokens) > 1 else set()
                doc_bigrams = set(zip(doc_toks[:-1], doc_toks[1:])) if len(doc_toks) > 1 else set()
                bigram_overlap = len(q_bigrams.intersection(doc_bigrams)) / len(q_bigrams) if q_bigrams else 0.0
                
                rerank_score = score * 0.4 + (overlap * 0.45 + bigram_overlap * 0.15)

            # Combined absolute score
            final_score = round(rerank_score, 4)
            reranked_results.append((final_score, doc))

        # Sort by reranked score descending
        reranked_results.sort(key=lambda x: x[0], reverse=True)
        selected_results = reranked_results[:top_k]

        return [
            {
                "score": score,
                "id": doc.get("id"),
                "title": doc.get("title"),
                "organization": doc.get("organization") or doc.get("authority") or "Unknown",
                "section": doc.get("section") or "Documentation Section",
                "version": doc.get("version") or "1.0",
                "url": doc.get("url") or "#",
                "content": doc.get("content"),
                "domain": doc.get("domain", "UNKNOWN"),
                "source_type": doc.get("source_type", "DOCUMENTATION"),
                "authority": doc.get("authority") or doc.get("organization") or "Unknown",
                "trust_score": doc.get("trust_score", 1.0),
                "entity_id": doc.get("entity_id"),
                "entity_type": doc.get("entity_type"),
                "name": doc.get("name"),
                "category": doc.get("category"),
                "image_url": doc.get("image_url"),
                "short_description": doc.get("short_description"),
                "capabilities": doc.get("capabilities"),
                "sensors": doc.get("sensors"),
                "ai_technologies": doc.get("ai_technologies"),
                "navigation": doc.get("navigation"),
                "applications": doc.get("applications"),
                "specifications": doc.get("specifications")
            } for score, doc in selected_results
        ]

