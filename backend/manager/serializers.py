from django.contrib.auth.models import User
from rest_framework import serializers
from manager.models import Manager


# manager/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from manager.models import Manager


class ManagerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = Manager
        fields = ("id", "user_id", "username", "email", "first_name", "last_name", "department")


class ManagerCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True, write_only=True)
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    department = serializers.CharField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return Manager.objects.create(
            user=user,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            department=validated_data.get("department", ""),
        )


class ManagerUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manager
        fields = ("first_name", "last_name", "department")