from rest_framework.response import Response


def success_response(data=None, message="Success", status_code=200):
    """
    Standard success response
    """
    return Response({
        "status": "success",
        "message": message,
        "data": data
    }, status=status_code)


def error_response(message="Error", errors=None, status_code=400):
    """
    Standard error response
    """
    return Response({
        "status": "error",
        "message": message,
        "errors": errors
    }, status=status_code)
