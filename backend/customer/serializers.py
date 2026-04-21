from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

from customer.models import Customer


class CustomerAuthSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Customer
        fields = (
            "id",       
            "user_id",   
            "username",
            "email",
            "first_name",
            "last_name",
            "address",
        )


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=False)
    first_name = serializers.CharField(max_length=255)
    last_name = serializers.CharField(max_length=255)
    address = serializers.CharField(max_length=64)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('user with this username already exists')
        
        return value
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({
                'password': "The passwords don't match"
            })
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')

        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', '')
        )

        customer = Customer.objects.create(
            user=user,
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            address=validated_data['address']
        )

        return customer
    

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(
            username=data['username'],
            password=data['password']
        )

        if not user:
            raise serializers.ValidationError(
                'incorrect username or password'
            )
        
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password')


class CustomerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Customer
        fields = ('id', 'user', 'first_name', 'last_name', 'address')
        read_only_fields = ('id', 'user')


class UpdateProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', required=False)
    email = serializers.EmailField(source='user.email', required=False)

    class Meta:
        model = Customer
        fields = ("username", "email", "first_name", "last_name", "address")

    def validate_username(self, value):
        user = self.instance.user
        if User.objects.exclude(id=user.id).filter(username=value).exists():
            raise serializers.ValidationError("username already taken")
        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})

        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        if user_data:
            user = instance.user
            for attr, val in user_data.items():
                setattr(user, attr, val)
            user.save()

        return instance