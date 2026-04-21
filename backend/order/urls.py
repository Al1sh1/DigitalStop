from django.urls import path

from backend.order.views import order_detail, order_list


urlpatterns = [
    path('order/', order_list, name='order-list'),
    path('order/<int:order_id>', order_detail, name='order-detail')
]