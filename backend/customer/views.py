from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

from backend.customer.models import Customer
from backend.customer.serializers import CustomerSerializer


@api_view(['GET', 'POST'])
def customer_list(request):
    if request.method =='GET':
        customers = Customer.objects.all()
        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data)
