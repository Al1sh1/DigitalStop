from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from order.models import Order
from order.serializers import OrderSerializer


@api_view(['GET', 'POST'])
def order_list(request):
    if request.method == 'GET':
        orders = Order.objects.all()
        serializer = OrderSerializer(orders, many=True)
        return Response({
            'count': len(serializer.data),
            'data': serializer.data
        })
    
    elif request.method == 'POST':
        serializer = OrderSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response({
                'data': serializer.data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET', 'PUT', 'DELETE'])
def order_detail(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"message": "order not found"}, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'GET':
        serializer = OrderSerializer(order)
        return Response({
            'data': order 
        })
    
    elif request.method == 'PUT':
        serializer = OrderSerializer(order, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({
                'data': serializer.data
            })
        
        return Response({
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        order.delete()
        return Response(status=status.HTTP_200_OK)