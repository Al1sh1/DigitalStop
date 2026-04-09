from rest_framework import generics
from django.shortcuts import render

from brand.serializers import BrandSerializer
from brand.models import Brand


class BrandAPIView(generics.ListAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer