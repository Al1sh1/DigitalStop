from django.db import models

from api.models import BaseModel
from brand.models import Brand


class Product(BaseModel):
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(max_length=1000, blank=True, default='')
    specs = models.JSONField(default=dict, blank=True)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
