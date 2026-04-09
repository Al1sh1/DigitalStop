

from django.urls import path

from brand.views import BrandAPIView


urlpatterns = [
    path('brands/', BrandAPIView.as_view())
]