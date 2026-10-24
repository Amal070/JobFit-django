from django.http import JsonResponse
from django.db import connection


def health_check(request):
    """
    Production health-check endpoint for Render and monitoring probes.
    Verifies application liveness and database connectivity.
    """
    db_ok = True
    db_error = None
    try:
        connection.ensure_connection()
    except Exception as e:
        db_ok = False
        db_error = str(e)

    status_code = 200 if db_ok else 503
    return JsonResponse(
        {
            "status": "ok" if db_ok else "degraded",
            "service": "jobfit-ai-backend",
            "database": "connected" if db_ok else f"error: {db_error}",
        },
        status=status_code,
    )
