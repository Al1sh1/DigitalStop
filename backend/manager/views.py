from rest_framework import generics, mixins, permissions, status
from rest_framework.response import Response

from manager.models import Manager
from manager.serializers import (
    ManagerCreateSerializer,
    ManagerSerializer,
    ManagerUpdateSerializer,
)
from order.models import Order
from order.serializers import OrderSerializer, OrderStatusUpdateSerializer
from product.models import Product
from product.serializers import ProductSerializer


class IsSuperUserOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )

    def has_object_permission(self, request, view, obj):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )


class IsManagerOrSuperUser(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False

        if request.user.is_superuser:
            return True

        return Manager.objects.filter(user=request.user).exists()

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class ManagerListCreateView(mixins.ListModelMixin, mixins.CreateModelMixin, generics.GenericAPIView):
    queryset = Manager.objects.select_related("user").all().order_by("-id")
    permission_classes = [IsSuperUserOnly]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ManagerCreateSerializer
        return ManagerSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        in_serializer = self.get_serializer(data=request.data)
        in_serializer.is_valid(raise_exception=True)
        manager = in_serializer.save()
        out_serializer = ManagerSerializer(manager, context=self.get_serializer_context())
        return Response(out_serializer.data, status=status.HTTP_201_CREATED)


class ManagerDetailView(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):
    queryset = Manager.objects.select_related("user").all()
    permission_classes = [IsSuperUserOnly]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return ManagerUpdateSerializer
        return ManagerSerializer

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class ManagerProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.select_related("brand").all().order_by("-id")
    serializer_class = ProductSerializer
    permission_classes = [IsManagerOrSuperUser]

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return Response({"products": response.data})


class ManagerProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related("brand").all()
    serializer_class = ProductSerializer
    permission_classes = [IsManagerOrSuperUser]
    lookup_url_kwarg = "product_id"


class ManagerOrderListView(generics.ListAPIView):
    queryset = Order.objects.select_related("user", "product").all().order_by("-id")
    serializer_class = OrderSerializer
    permission_classes = [IsManagerOrSuperUser]

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return Response({"orders": response.data})


class ManagerOrderStatusUpdateView(generics.UpdateAPIView):
    queryset = Order.objects.select_related("user", "product").all()
    serializer_class = OrderStatusUpdateSerializer
    permission_classes = [IsManagerOrSuperUser]
    lookup_url_kwarg = "order_id"

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(OrderSerializer(instance).data, status=status.HTTP_200_OK)
