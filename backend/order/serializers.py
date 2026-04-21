from decimal import Decimal

from rest_framework import serializers

from customer.models import Customer
from order.models import Order
from product.models import Product


class OrderSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField(read_only=True)
    product = serializers.SerializerMethodField(read_only=True)

    user_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
        source="user",
        write_only=True,
        required=False,
    )
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
        write_only=True,
    )

    total_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Order
        fields = (
            "id",
            "status",
            "quantity",
            "total_price",
            "user",
            "user_id",
            "product",
            "product_id",
        )

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "first_name": obj.user.first_name,
            "last_name": obj.user.last_name,
            "address": obj.user.address,
        }

    def get_product(self, obj):
        return {
            "id": obj.product.id,
            "name": obj.product.name,
            "price": str(obj.product.price),
        }

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        return value

    def _calc_total(self, product, quantity):
        return (Decimal(product.price) * Decimal(quantity)).quantize(Decimal("0.01"))

    def create(self, validated_data):
        product = validated_data["product"]
        quantity = validated_data["quantity"]
        validated_data["total_price"] = self._calc_total(product, quantity)
        return Order.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.status = validated_data.get("status", instance.status)
        instance.quantity = validated_data.get("quantity", instance.quantity)
        instance.product = validated_data.get("product", instance.product)
        instance.total_price = self._calc_total(instance.product, instance.quantity)
        instance.save()
        return instance


