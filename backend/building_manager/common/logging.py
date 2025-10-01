import logging

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    return logging.getLogger("BM")


class APILoggingMiddleware:
    """
    Middleware to log every request/response
    """
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger("BM.API")

    def __call__(self, request):
        self.logger.info(f"REQUEST: {request.method} {request.path}")
        response = self.get_response(request)
        self.logger.info(f"RESPONSE: {response.status_code} for {request.path}")
        return response
