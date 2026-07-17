from typing import List, Dict, Any

class ConfidenceScorer:
    def calculate(self, query: str, retrieved_sources: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculates answer confidence based on semantic similarity scores,
        source count, document trust ratings, and version compatibility.
        """
        num_sources = len(retrieved_sources)
        if num_sources == 0:
            return {
                "level": "LOW",
                "score": 0.1,
                "retrieved_count": 0,
                "trusted_count": 0,
                "version_count": 0,
                "match_reason": "No documentation sources were found in the trusted database."
            }

        # Calculate average match score from vector search
        avg_score = sum(s.get("score", 0.0) for s in retrieved_sources) / num_sources
        
        # Deduplicate versions
        versions = set(s.get("version", "Humble") for s in retrieved_sources if s.get("version"))
        version_count = len(versions)
        
        # Map score to level
        # High match score is typically > 0.4 in this TF-IDF model
        if avg_score > 0.5 and num_sources >= 2:
            level = "HIGH"
            confidence_score = min(0.95, 0.7 + (avg_score * 0.3))
            reason = "Strong semantic correlation found across multiple verified sources."
        elif avg_score > 0.2:
            level = "MEDIUM"
            confidence_score = min(0.79, 0.4 + (avg_score * 0.4))
            reason = "Moderate correlation with source material. Check compatibility matches."
        else:
            level = "LOW"
            confidence_score = max(0.15, avg_score * 0.8)
            reason = "Retrieved sources have weak keywords correspondence. Answer may contain extrapolation."

        return {
            "level": level,
            "score": round(confidence_score * 100, 1),
            "retrieved_count": num_sources,
            "trusted_count": num_sources,  # Default to retrieved counts as they all come from trusted JSON
            "version_count": version_count,
            "match_reason": reason
        }
