from django.urls import path

from brand.views import BrandDetailAPIView, BrandListAPIView


urlpatterns = [
    path('brands/', BrandListAPIView.as_view()),
    path('brands/<int:brand_id>', BrandDetailAPIView.as_view())
]