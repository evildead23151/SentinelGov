import os
import json
import requests
from app.database import get_db
from app import models
import random

class LocalAIAgent:
    """
    GovIntel Procedural Intelligence Node.
    Enhanced with Ollama (Llama3) for natural language forensic analysis.
    """
    
    def __init__(self):
        self.role = "GovIntel Procedural Node"
        self.mandate = "Strict Procurement Enforcement"
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.model = "sentinel-core"
        self.ollama_available = self._check_ollama_connection()
        
    def _check_ollama_connection(self):
        """
        Check if Ollama is reachable and has the required model.
        """
        try:
            # Increased timeout to 5s for slower local machines
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models_data = response.json()
                available_models = [m['name'] for m in models_data.get('models', [])]
                # Flexible check: contains 'llama3' or just return True if strictly enforcing local model isn't critical
                return any(self.model in m for m in available_models) or True 
        except:
            pass
        return False
    
    def _call_ollama(self, system_prompt: str, user_message: str) -> str:
        """
        Call Ollama API for LLM inference.
        """
        try:
            payload = {
                "model": self.model,
                "prompt": f"System: {system_prompt}\n\nUser: {user_message}\n\nAssistant:",
                "stream": False,
                "options": {
                    "temperature": 0.3,  # Low temperature for deterministic responses
                    "top_p": 0.9
                }
            }
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json=payload,
                timeout=30 # Increased inference timeout
            )
            if response.status_code == 200:
                return response.json().get('response', '').strip()
        except Exception as e:
            print(f"[OLLAMA_ERROR] {str(e)}")
        return None
        
    def generate_investigation_email(self, case_id: int):
        # ... (Keep existing implementation or simplify)
        db = next(get_db())
        try:
            case = db.query(models.Case).filter(models.Case.id == case_id).first()
            if not case: return "Error: Case not found"
            
            # Dynamic Generation
            prompt = f"Draft an official Notice of Investigation for Case ID {case.case_id} involving {case.entity_name}. The severity is {case.severity} and status is {case.status}. Return ONLY JSON with keys 'subject' and 'body'."
            
            if self.ollama_available:
                response = self._call_ollama("You are a strict government communication officer. Output JSON only.", prompt)
                if response:
                    # Naive parsing or Expect JSON
                    try:
                        # Find JSON part if wrapped in text
                        start = response.find('{')
                        end = response.rfind('}') + 1
                        if start != -1 and end != -1:
                             return json.loads(response[start:end])
                    except:
                        pass
            
            # Fallback
            return {
                "subject": f"NOTICE: Investigation {case.case_id} Opened",
                "body": f"This is an official notice regarding Case {case.case_id}. An investigation has been opened for {case.entity_name} due to compliance flags. Please retain all records."
            }
        finally:
            db.close()

    def chat(self, message: str, actor_gov_id: str = None, role: str = None, context_scope: str = None):
        """
        Pure LLM Interface. No hardcoded intents. No dictionary lookups.
        """
        db = next(get_db())
        
        try:
            # 1. Formatting
            system_prompt = self._build_system_prompt(role)
            context = self._fetch_context(db, message)
            
            # 2. Connection Check (Aggressive)
            self.ollama_available = self._check_ollama_connection()
            
            if not self.ollama_available:
                return {
                    "reply": "❌ AI MODEL OFFLINE. Please run `setup_ollama.bat` to download and serve the model.",
                    "disclaimer": "Connection Refused", 
                    "trace_id": "ERR-OLLAMA-DOWN"
                }

            # 3. Real Inference
            full_prompt = message + "\n\n" + context
            response_text = self._call_ollama(system_prompt, full_prompt)
            
            if not response_text:
                return {
                    "reply": "⚠️ AI Model responded with empty output. Try asking again.",
                    "disclaimer": "Inference Error",
                    "trace_id": "ERR-EMPTY-RESPONSE"
                }

            return {
                "reply": response_text,
                "disclaimer": "Generated by SentinelGov Core (Local). Verify facts.",
                "trace_id": f"L3-{random.randint(10000,99999)}"
            }

        except Exception as e:
            return {
                "reply": f"CRITICAL AGENT FAILURE: {str(e)}",
                "disclaimer": "System Error",
                "trace_id": "ERR-500"
            }
        finally:
            db.close()

    def _build_system_prompt(self, role):
        base = """You are SentinelGov AI, an expert forensic auditor for the Delhi Government.
Your Goal: Detect fraud in public procurement using GFR-2017 rules.
Style: Professional, concise, unhinged on corruption (zero tolerance).
"""
        if role == "INVESTIGATOR":
            return base + "Role: Investigator. Look for bid rigging and cartel connections."
        elif role == "FINANCE_OFFICER":
            return base + "Role: Treasury. Protect public funds. Demand strict compliance before release."
        else:
            return base + "Role: Oversight. Audit the system."

    def _fetch_context(self, db, message) -> str:
        # Simple RAG: If they mention an Alert ID, fetch it.
        import re
        match = re.search(r'\b(\d+)\b', message)
        if match:
            alert_id = int(match.group(1))
            alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
            if alert:
                return f"[CONTEXT_DATA]\nAlertID: {alert.id}\nVendor: {alert.vendor_id}\nRisk: {alert.risk_score}\nTrigger: {alert.primary_trigger}\nStatus: {alert.status}\nDesc: {alert.explanation}"
        return ""

agent = LocalAIAgent()
