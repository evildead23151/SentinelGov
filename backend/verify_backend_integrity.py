"""
Backend Integrity Verification Script
Ensures no duplicate routes exist and validates critical endpoints.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app
from fastapi.routing import APIRoute

def check_duplicate_routes():
    """Check for duplicate route definitions"""
    routes = {}
    duplicates = []
    
    for route in app.routes:
        if isinstance(route, APIRoute):
            key = f"{','.join(route.methods)} {route.path}"
            if key in routes:
                duplicates.append({
                    "path": route.path,
                    "methods": route.methods,
                    "existing": routes[key],
                    "duplicate": route.name
                })
            else:
                routes[key] = route.name
    
    return duplicates

def verify_critical_endpoints():
    """Verify that all critical endpoints exist exactly once"""
    critical_endpoints = [
        ("POST", "/api/alerts/{alert_id}/acknowledge"),
        ("POST", "/api/alerts/{alert_id}/resolve"),
        ("POST", "/api/transactions/{tx_id}/release"),
        ("GET", "/api/graph"),
        ("GET", "/api/alerts/{alert_id}/export-brief"),
        ("POST", "/api/ai/chat"),
    ]
    
    routes = [(route.path, list(route.methods)) for route in app.routes if isinstance(route, APIRoute)]
    
    results = []
    for method, path in critical_endpoints:
        count = sum(1 for r_path, r_methods in routes if r_path == path and method in r_methods)
        results.append({
            "endpoint": f"{method} {path}",
            "count": count,
            "status": "✓" if count == 1 else "✗"
        })
    
    return results

def main():
    print("=" * 60)
    print("BACKEND INTEGRITY VERIFICATION")
    print("=" * 60)
    
    # Check for duplicates
    print("\n[1] Checking for duplicate routes...")
    duplicates = check_duplicate_routes()
    
    if duplicates:
        print(f"   ✗ FOUND {len(duplicates)} DUPLICATE ROUTES:")
        for dup in duplicates:
            print(f"   - {dup['methods']} {dup['path']}: {dup['existing']} vs {dup['duplicate']}")
        success = False
    else:
        print("   ✓ No duplicate routes found")
        success = True
    
    # Verify critical endpoints
    print("\n[2] Verifying critical endpoints...")
    results = verify_critical_endpoints()
    
    for result in results:
        print(f"   {result['status']} {result['endpoint']}: {result['count']} definition(s)")
        if result['count'] != 1:
            success = False
    
    # Summary
    print("\n" + "=" * 60)
    if success:
        print("✓ BACKEND INTEGRITY CHECK PASSED")
        print("=" * 60)
        return 0
    else:
        print("✗ BACKEND INTEGRITY CHECK FAILED")
        print("=" * 60)
        return 1

if __name__ == "__main__":
    sys.exit(main())
