from django.urls import path

from product.views import ProductDetailAPIView, ProductListAPIView


urlpatterns = [
    path('products/', ProductListAPIView.as_view()),
    path('products/<int:product_id>', ProductDetailAPIView.as_view()),
    path('products/<int:product_id>/', ProductDetailAPIView.as_view()),
]
