from fastmcp import FastMCP
from app.database import get_db
from app import models
import pandas as pd
import json

# Initialize FastMCP Server
mcp = FastMCP("GovIntel SOC")

def get_session():
    """Helper to get a database session."""
    db_gen = get_db()
    return next(db_gen)

@mcp.resource("govintel://alerts")
def list_alerts() -> str:
    """Returns a JSON string of all active alerts in the system."""
    db = get_session()
    try:
        alerts = db.query(models.Alert).filter(models.Alert.status != "RESOLVED").all()
        results = []
        for a in alerts:
            results.append({
                "id": a.id,
                "title": a.title,
                "severity": a.severity,
                "status": a.status,
                "risk_score": a.risk_score,
                "timestamp": str(a.timestamp)
            })
        return json.dumps(results, indent=2)
    finally:
        db.close()

@mcp.resource("govintel://cases")
def list_cases() -> str:
    """Returns a JSON string of all investigation cases."""
    db = get_session()
    try:
        cases = db.query(models.Case).all()
        results = []
        for c in cases:
            results.append({
                "id": c.id,
                "title": c.title,
                "department": c.department,
                "status": c.status,
                "created_at": str(c.created_at)
            })
        return json.dumps(results, indent=2)
    finally:
        db.close()

@mcp.tool()
def query_metrics(sql_query: str) -> str:
    """
    Executes a READ-ONLY SQL query against the GovIntel database to fetch analytics.
    Only SELECT statements are allowed.
    """
    if "DROP" in sql_query.upper() or "DELETE" in sql_query.upper() or "UPDATE" in sql_query.upper():
        return "Error: Only SELECT queries are permitted for safety."
        
    db = get_session()
    try:
        df = pd.read_sql(sql_query, db.bind)
        return df.to_json(orient="records")
    except Exception as e:
        return f"Query Error: {str(e)}"
    finally:
        db.close()

@mcp.tool()
def get_case_brief(case_id: int) -> str:
    """
    Retrieves full context for a case to generate reports or emails.
    """
    db = get_session()
    try:
        case = db.query(models.Case).filter(models.Case.id == case_id).first()
        if not case:
            return "Case not found."
            
        alerts = db.query(models.Alert).filter(models.Alert.case_id == case_id).all()
        
        details = {
            "case_id": case.id,
            "title": case.title,
            "department": case.department,
            "description": case.description,
            "status": case.status,
            "alert_count": len(alerts),
            "alerts": [{"id": a.id, "title": a.title, "risk": a.risk_score} for a in alerts]
        }
        return json.dumps(details, indent=2)
    finally:
        db.close()

if __name__ == "__main__":
    mcp.run()
