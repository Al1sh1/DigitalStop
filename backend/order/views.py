from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from customer.models import Customer
from order.models import Order
from order.serializers import OrderSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def order_list(request):
    try:
        customer = Customer.objects.get(user=request.user)
    except Customer.DoesNotExist:
        return Response({"detail": "Customer profile not found."}, status=404)

    if request.method == "GET":
        orders = Order.objects.filter(user=customer).order_by("-id")
        return Response({"orders": OrderSerializer(orders, many=True).data})

    data = request.data.copy()
    data["user_id"] = customer.id
    data["status"] = "PENDING"
    serializer = OrderSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    order = serializer.save()
    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id):
    try:
        customer = Customer.objects.get(user=request.user)
    except Customer.DoesNotExist:
        return Response({"detail": "Customer profile not found."}, status=404)

    try:
        order = Order.objects.get(id=order_id, user=customer)
    except Order.DoesNotExist:
        return Response({"detail": "Order not found."}, status=404)

    if request.method == "GET":
        return Response(OrderSerializer(order).data)

    order.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
