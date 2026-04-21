from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework import status

from customer.models import Customer
from customer.serializers import CustomerAuthSerializer, CustomerSerializer, LoginSerializer, RegisterSerializer, UpdateProfileSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
@transaction.atomic
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    customer = serializer.save()
    token, _ = Token.objects.get_or_create(user=customer.user)

    return Response(
        {
            "token": token.key,
            "user": CustomerAuthSerializer(customer).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = serializer.validated_data["user"]
    token, _ = Token.objects.get_or_create(user=user)

    try:
        customer = Customer.objects.get(user=user)
    except Customer.DoesNotExist:
        return Response(
            {"success": False, "error": "customer profile not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(
        {
            "token": token.key,
            "user": CustomerAuthSerializer(customer).data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    Token.objects.filter(user=request.user).delete()
    return Response(
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    try:
        customer = Customer.objects.get(user=request.user)
    except Customer.DoesNotExist:
        return Response(
            {"error": "customer profile not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(
        {"user": CustomerAuthSerializer(customer).data},
        status=status.HTTP_200_OK,
    )


@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    try:
        customer = Customer.objects.get(user=request.user)
    except Customer.DoesNotExist:
        return Response(
            {"success": False, "error": "customer profile not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = UpdateProfileSerializer(customer, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(
        {
            "user": CustomerAuthSerializer(customer).data,
        },
        status=status.HTTP_200_OK,
    )