from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """Custom exception handler with detailed error reporting."""
    response = exception_handler(exc, context)
    
    if response is None:
        logger.exception("Unhandled exception occurred:")
        return Response({
            'error': str(exc) if settings.DEBUG else 'An unexpected error occurred',
            'detail': str(exc) if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response