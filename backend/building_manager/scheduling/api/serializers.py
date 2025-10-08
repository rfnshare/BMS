# scheduling/api/serializers.py
from rest_framework import serializers
from scheduling.models import TaskLog

class TaskLogSerializer(serializers.ModelSerializer):
    executed_by_name = serializers.CharField(source="executed_by.username", read_only=True)

    class Meta:
        model = TaskLog
        fields = [
            "id", "task_name", "status", "message",
            "executed_by", "executed_by_name", "executed_at"
        ]
        read_only_fields = ["status", "executed_at"]
