from django.db import models

from django.db import models
from django.contrib.auth.models import User


class Manager(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="manager_profile")
    first_name = models.CharField(max_length=255, blank=True, default="")
    last_name = models.CharField(max_length=255, blank=True, default="")
    department = models.CharField(max_length=255, blank=True, default="")

    def __str__(self):
        return f"Manager: {self.user.username}"