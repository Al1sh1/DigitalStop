from django.db import models

from api.models import BaseModel
from django.contrib.auth.models import User


class Customer(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer')
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    address = models.CharField(max_length=64)


    def __str__(self):
        return f"{self.first_name} {self.last_name}"