from scheduling.models import TaskLog

def log_task(task_name, status="SUCCESS", message=None):
    TaskLog.objects.create(task_name=task_name, status=status, message=message)
