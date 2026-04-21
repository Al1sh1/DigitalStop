from rest_framework import serializers

from backend.customer.models import Customer
from backend.order.models import Order
from backend.product.models import Product


class OrderSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    status = serializers.CharField(choices=['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    quantity = serializers.IntegerField(min_value=1)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2)

    user_id = serializers.IntegerField(write_only=True)
    product_id = serializers.IntegerField(write_only=True)

    def validate_quanity(self, value):
        if value <= 0:
            raise serializers.ValidationError("quantity should be positive")
        return value
    
    def validate_user_id(self, value):
        if not Customer.objects.filter(id=value).exists():
            raise serializers.ValidationError("user not found")
        return value
    
    def validate_product_id(self, value):
        if not Product.objects.filter(id=value).exists():
            raise serializers.ValidationError("product not found")
        return value
    
    def create(self, validated_data):
        order = Order(
            status=validated_data['status'],
            quantity=validated_data['quantity'],
            total_price=validated_data['total_price'],
            user_id=validated_data['user_id'],
            product_id=validated_data['product_id']
        )
        order.save()
        return order
    
    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.quantity = validated_data.get('quantity', instance.quantity)
        instance.total_price = validated_data.get('total_price', instance.total_price)

        instance.save()
        return instance


