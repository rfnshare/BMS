from django.db import models
from django.utils import timezone
from django.conf import settings


class BaseAuditModel(models.Model):
    """
    Abstract model with audit fields + soft delete
    Every model can inherit this for tracking
    """

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        related_name="%(class)s_created",
        on_delete=models.SET_NULL,
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        related_name="%(class)s_updated",
        on_delete=models.SET_NULL,
    )

    # Soft delete
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        related_name="%(class)s_deleted",
        on_delete=models.SET_NULL,
    )

    class Meta:
        abstract = True

    def soft_delete(self, user=None):
        """Mark as deleted without removing from DB"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        if user:
            self.deleted_by = user
        self.save()

    def restore(self):
        """Restore a previously soft-deleted record"""
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.save()
