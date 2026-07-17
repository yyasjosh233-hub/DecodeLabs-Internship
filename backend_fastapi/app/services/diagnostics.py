from typing import List, Dict, Any

class DiagnosticsResolver:
    @staticmethod
    def calculate_status(parser_status: str, issues: List[Dict[str, Any]], insufficient_data: bool = False) -> str:
        """
        Calculates the overall analysis status based on the parsed issues and execution state.
        
        Parser Status can be: SUCCESS, FAILED, PARTIAL
        Overall Status can be: HEALTHY, ADVISORY, WARNING, ERROR, CRITICAL, INSUFFICIENT_DATA
        """
        if parser_status == "FAILED":
            return "ERROR"
            
        if insufficient_data or parser_status == "PARTIAL":
            return "INSUFFICIENT_DATA"
            
        severities = [issue.get("severity", "INFO").upper() for issue in issues]
        
        if "CRITICAL" in severities:
            return "CRITICAL"
        elif "ERROR" in severities:
            return "ERROR"
        elif "WARNING" in severities:
            return "WARNING"
        elif "SUGGESTION" in severities:
            return "ADVISORY"
        else:
            return "HEALTHY"

    @staticmethod
    def create_issue(
        issue_id: str,
        module: str,
        severity: str,
        category: str,
        title: str,
        message: str,
        impact: str = "",
        recommendation: str = "",
        context: str = "GENERAL",
        required_evidence: str = "OFFLINE_CONFIG",
        evidence_available: str = "YES",
        confidence: float = 1.0,
        observed: str = "",
        trusted_source: str = ""
    ) -> Dict[str, Any]:
        """
        Helper to construct a normalized diagnostic issue object.
        """
        return {
            "id": issue_id,
            "module": module,
            "severity": severity.upper(),
            "category": category,
            "title": title,
            "message": message,
            "impact": impact,
            "recommendation": recommendation,
            "context": context,
            "required_evidence": required_evidence,
            "evidence_available": evidence_available,
            "confidence": confidence,
            "observed": observed,
            "trusted_source": trusted_source
        }
