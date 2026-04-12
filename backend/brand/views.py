from rest_framework.views import APIView, Http404, Response
from rest_framework import status
from django.shortcuts import render

from brand.models import Brand
from brand.serializers import BrandSerializer


class BrandListAPIView(APIView):
    def post(self, request):
        serializer = BrandSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def get(self, request):
        brands = Brand.objects.all()
        serializer = BrandSerializer(brands, many=True)
        return Response({'brands': serializer.data})
    

class BrandDetailAPIView(APIView):
    def get_object(self, brand_id):
        try:
            return Brand.objects.get(pk=brand_id)
        except Brand.DoesNotExist:
            raise Http404
        
    def get(self, request, brand_id):
        brand = self.get_object(brand_id=brand_id)
        serializer = BrandSerializer(brand)
        return Response(serializer.data)
    
    def patch(self, request, brand_id):
        brand = self.get_object(brand_id=brand_id)
        serializer = BrandSerializer(brand, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        return Response(serializer.data)
    
    def delete(self, request, brand_id):
        brand = self.get_object(brand_id=brand_id)
        brand.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
