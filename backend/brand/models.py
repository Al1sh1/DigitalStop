from django.db import models

from api.models import BaseModel


class Brand(BaseModel):
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.name