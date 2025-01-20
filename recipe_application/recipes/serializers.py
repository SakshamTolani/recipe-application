from rest_framework import serializers
from recipes.models import *
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password


User = get_user_model()

class UserPreferenceSerializer(serializers.ModelSerializer):
    preferred_cuisines = serializers.ListField(
        child=serializers.CharField(max_length=100),
        allow_empty=True,
        help_text="List of preferred cuisines as strings"
    )

    class Meta:
        model = UserPreference
        fields = ['vegetarian', 'gluten_free', 'preferred_cuisines']
    
    def validate_preferred_cuisines(self, value):
        if not all(isinstance(cuisine, str) for cuisine in value):
            raise serializers.ValidationError("All cuisines must be strings.")
        return value

        

class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        # user = User.objects.create_user(**validated_data)
        user = User.objects.create_user(username=validated_data['email'], email=validated_data['email'], password=validated_data['password'])
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'date_joined')
        read_only_fields = ('date_joined',)

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = '__all__'

class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(source='ingredient.name', read_only=True)

    class Meta:
        model = RecipeIngredient
        fields = ['ingredient', 'ingredient_name', 'quantity', 'unit']

class RecipeSerializer(serializers.ModelSerializer):
    ingredients = RecipeIngredientSerializer(
        source='recipeingredient_set',
        many=True,
        required=False
    )
    average_rating = serializers.FloatField(read_only=True)
    rating_count = serializers.IntegerField(read_only=True)
    substitutes = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = '__all__'

    def get_substitutes(self, obj):
        substitutes = {}
        for recipe_ingredient in obj.recipeingredient_set.all():
            ingredient_subs = recipe_ingredient.ingredient.substitutions.all()
            if ingredient_subs:
                substitutes[recipe_ingredient.ingredient.name] = [
                    {
                        'name': sub.substitute.name,
                        'ratio': sub.ratio,
                        'notes': sub.notes
                    }
                    for sub in ingredient_subs
                ]
        return substitutes

class UserPreferenceSerializer(serializers.ModelSerializer):
    preferred_cuisines = serializers.ListField(
        child=serializers.CharField(max_length=100),
        allow_empty=True,
        required=False,
        default=list
    )

    class Meta:
        model = UserPreference
        fields = ['vegetarian', 'gluten_free', 'preferred_cuisines']
    
    def validate_preferred_cuisines(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Preferred cuisines must be a list.")
        if not all(isinstance(cuisine, str) for cuisine in value):
            raise serializers.ValidationError("All cuisines must be strings.")
        return value
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data.pop('user', None)  # Ensure 'user' is not in validated_data
        return UserPreference.objects.create(user=user, **validated_data)

    def update(self, instance, validated_data):
        instance.vegetarian = validated_data.get('vegetarian', instance.vegetarian)
        instance.gluten_free = validated_data.get('gluten_free', instance.gluten_free)
        instance.preferred_cuisines = validated_data.get('preferred_cuisines', instance.preferred_cuisines)
        instance.save()
        return instance

class RecipeRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeRating
        fields = '__all__'
        read_only_fields = ['user']