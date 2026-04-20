from rest_framework import serializers

from customer.models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    
    class Meta:
        model = Customer
        fields = ('user', 'first_name', 'last_name', 'address')