from rest_framework import serializers

from brand.models import Brand
from product.models import Product
from brand.serializers import BrandSerializer


class ProductSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)

    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(),
        source='brand',
        write_only=True
    )

    class Meta:
        model = Product
        fields = ('id', 'name', 'description', 'price', 'brand', 'brand_id')