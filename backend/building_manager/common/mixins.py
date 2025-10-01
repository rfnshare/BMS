import logging
from rest_framework import status
from rest_framework.response import Response

logger = logging.getLogger(__name__)


class SaveUserMixin:
    """
    Handles create/update/delete actions with audit + logging.
    Works best with models inheriting BaseAuditModel.
    """

    def perform_create(self, serializer):
        obj = serializer.save(created_by=self.request.user)
        logger.info(f"[CREATE] {self.request.user} created {obj}")
        return obj

    def perform_update(self, serializer):
        obj = serializer.save(updated_by=self.request.user)
        logger.info(f"[UPDATE] {self.request.user} updated {obj}")
        return obj

    def perform_destroy(self, instance):
        if hasattr(instance, "soft_delete"):
            instance.soft_delete(user=self.request.user)
            logger.warning(f"[SOFT DELETE] {self.request.user} soft-deleted {instance}")
        else:
            instance.delete()
            logger.warning(f"[DELETE] {self.request.user} deleted {instance}")
        return Response(status=status.HTTP_204_NO_CONTENT)
