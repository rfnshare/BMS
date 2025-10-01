from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom error handler to standardize error responses
    """
    response = exception_handler(exc, context)

    if response is not None:
        return Response({
            "status": "error",
            "message": str(exc),
            "errors": response.data
        }, status=response.status_code)

    # Fallback for unhandled errors
    return Response({
        "status": "error",
        "message": "Internal server error",
        "errors": str(exc)
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
