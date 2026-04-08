from django.contrib import admin

from api.models import Brand
from api.models import Product
from api.models import Order
from api.models import Customer

admin.site.register(Brand)
admin.site.register(Product)
admin.site.register(Order)
admin.site.register(Customer)
