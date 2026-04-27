from rest_framework.response import Response
from rest_framework import status


def success_response(data=None, message="Request successful", status_code=status.HTTP_200_OK, meta=None):
    payload = {"success": True, "message": message, "data": data or {}}
    if meta:
        payload["meta"] = meta
    return Response(payload, status=status_code)


def error_response(message="An error occurred", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({
        "success": False,
        "message": message,
        "errors": errors or {},
    }, status=status_code)
