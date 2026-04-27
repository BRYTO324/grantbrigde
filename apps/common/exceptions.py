from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        errors = response.data
        message = "An error occurred"

        if isinstance(errors, dict):
            # Pull a readable top-level message
            first_key = next(iter(errors), None)
            if first_key == "detail":
                message = str(errors["detail"])
                errors = {}
            elif first_key:
                message = f"{first_key}: {errors[first_key][0]}" if isinstance(errors[first_key], list) else str(errors[first_key])
        elif isinstance(errors, list):
            message = str(errors[0]) if errors else message

        response.data = {
            "success": False,
            "message": message,
            "errors": errors if isinstance(errors, dict) else {},
        }

    return response
