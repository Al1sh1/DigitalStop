from rest_framework import generics
from rest_framework.views import Response

from product.models import Product
from product.serializers import ProductSerializer


class ProductListAPIView(generics.ListCreateAPIView):
    queryset = Product.objects.select_related('brand').all().order_by('id')
    serializer_class = ProductSerializer

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        custom_data = {
            'products': response.data
        }

        return Response(custom_data)


class ProductDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related('brand').all()
    serializer_class = ProductSerializer
    lookup_url_kwarg = 'product_id'
