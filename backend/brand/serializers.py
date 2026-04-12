from rest_framework import serializers

from brand.models import Brand


class BrandSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(min_length=2, max_length=255)
    description = serializers.CharField()
    country = serializers.CharField(min_length=2, max_length=255)

    def create(self, validated_data):
        return Brand.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.country = validated_data.get('country', instance.country)

        instance.save()

        return instance


