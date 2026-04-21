from rest_framework import mixins, generics, permissions
from manager.models import Manager
from manager.serializers import (
    ManagerSerializer,
    ManagerCreateSerializer,
    ManagerUpdateSerializer,
)
from rest_framework.response import Response
from rest_framework import status


class IsSuperUserOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)

    def has_object_permission(self, request, view, obj):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)


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
    generics.GenericAPIView
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