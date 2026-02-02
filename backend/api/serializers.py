from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Dataset


class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = ['id', 'file_name', 'uploaded_at', 'summary']


class UploadCSVSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        name = (value.name or '').lower()
        if not name.endswith('.csv'):
            raise serializers.ValidationError('Only .csv files are allowed.')
        return value


class SignupSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True)

    def validate_email(self, value):
        User = get_user_model()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        User = get_user_model()

        full_name = (validated_data.get('name') or '').strip()
        email = validated_data['email'].strip().lower()
        password = validated_data['password']

        # Create a simple unique username derived from the email prefix.
        base_username = email.split('@')[0][:30] or 'user'
        username = base_username
        suffix = 1
        while User.objects.filter(username__iexact=username).exists():
            suffix += 1
            username = f"{base_username[:25]}{suffix}"

        first_name = full_name
        last_name = ''
        if ' ' in full_name:
            parts = full_name.split()
            first_name = parts[0]
            last_name = ' '.join(parts[1:])

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        return user
