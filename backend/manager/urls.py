from django.urls import path
from manager.views import (
    ManagerDetailView,
    ManagerListCreateView,
    ManagerOrderListView,
    ManagerOrderStatusUpdateView,
    ManagerProductDetailView,
    ManagerProductListCreateView,
)

urlpatterns = [
    path("managers/", ManagerListCreateView.as_view(), name="manager-list-create"),
    path("managers/<int:pk>/", ManagerDetailView.as_view(), name="manager-detail"),
    path("manager/products/", ManagerProductListCreateView.as_view(), name="manager-product-list-create"),
    path("manager/products/<int:product_id>/", ManagerProductDetailView.as_view(), name="manager-product-detail"),
    path("manager/orders/", ManagerOrderListView.as_view(), name="manager-order-list"),
    path("manager/orders/<int:order_id>/status/", ManagerOrderStatusUpdateView.as_view(), name="manager-order-status-update"),
]
