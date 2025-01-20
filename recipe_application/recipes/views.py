from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Q, Count
from django_filters.rest_framework import DjangoFilterBackend
from recipes.models import *
from recipes.serializers import *
from django.contrib.auth import authenticate
from django.core.files.uploadedfile import InMemoryUploadedFile
# ENABLE WHEN USING REDIS
# from django_ratelimit.decorators import ratelimit
from recipes.utils.image_processing import IngredientExtractor
from recipe_application import settings
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
import logging

logger = logging.getLogger(__name__)

class AuthViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def signup(self, request):
        serializer = SignUpSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            response_data = {
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            if user:
                refresh = RefreshToken.for_user(user)
                response_data = {
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }
                return Response(response_data)
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]

    @action(detail=False, methods=["POST"])
    # ENABLE WHEN USING REDIS
    # @method_decorator(
    #     ratelimit(key="user", rate=settings.INGREDIENT_SCAN_RATE_LIMIT, method=["POST"])
    # )
    def scan_image(self, request, *args, **kwargs):
        try:
            if "image" not in request.FILES:
                return Response(
                    {"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST
                )

            image_file = request.FILES["image"]
            image_data = image_file.read()

            # Extract ingredients using the updated extractor
            extractor = IngredientExtractor()
            result = extractor.extract_ingredients(image_data)

            if result["status"] == "error":
                return Response(
                    {"error": result["error"]},
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                )

            # Match ingredients with database
            matched_ingredients = Ingredient.objects.filter(
                name__in=result["ingredients"]
            ).values("id", "name")

            # Find unmatched ingredients
            matched_names = {ing["name"] for ing in matched_ingredients}
            unmatched_ingredients = [
                ing for ing in result["ingredients"] if ing not in matched_names
            ]

            return Response(
                {
                    "matched_ingredients": list(matched_ingredients),
                    "unmatched_ingredients": unmatched_ingredients,
                    "total_detected": len(result["ingredients"]),
                }
            )

        except Exception as e:
            logger.exception("Error in scan_image endpoint:")
            return Response(
                {"error": str(e) if settings.DEBUG else "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.annotate(
        average_rating=Avg("ratings__rating"), rating_count=Count("ratings")
    )
    serializer_class = RecipeSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = {
        "difficulty": ["exact"],
        "cuisine": ["exact"],
        "is_vegetarian": ["exact"],
        "is_gluten_free": ["exact"],
        "cooking_time": ["lte", "gte"],
        "total_time": ["lte", "gte"],
        "calories_per_serving": ["lte", "gte"],
    }
    search_fields = ["title", "description", "ingredients__name"]
    ordering_fields = ["average_rating", "cooking_time", "calories_per_serving"]

    def normalize_ingredient_name(self,name):
        # Convert to lowercase
        name = name.lower()
        
        # Remove plurals (basic handling)
        if name.endswith('es'):
            name = name[:-2]
        elif name.endswith('s'):
            name = name[:-1]
            
        # Remove common variations/suffixes
        name = name.replace(' pieces', '')
        name = name.replace(' piece', '')
        
        return name.strip()

    @action(detail=False, methods=["POST"])
    def match_ingredients(self, request):
        ingredients = request.data.get("ingredients", [])
        dietary_prefs = request.data.get("dietary_preferences", {})
        filters = request.data.get("filters", {})

        # Debug logging
        logger.info(f"Received ingredients: {ingredients}")
        logger.info(f"Received dietary preferences: {dietary_prefs}")
        logger.info(f"Received filters: {filters}")

        # Base queryset with dietary preferences if specified
        queryset = self.get_queryset()
        if dietary_prefs.get("vegetarian"):
            queryset = queryset.filter(is_vegetarian=True)
        if dietary_prefs.get("gluten_free"):
            queryset = queryset.filter(is_gluten_free=True)

        logger.info(f"Queryset: {queryset}")
        # Apply difficulty filter if specified
        if filters.get("difficulty"):
            queryset = queryset.filter(difficulty__iexact=filters["difficulty"])

        logger.info(f"Filtered Queryset: {queryset}")
        # Apply cooking time filters if specified
        if filters.get("cooking_time"):
            if filters["cooking_time"].get("min") is not None:
                queryset = queryset.filter(cooking_time__gte=filters["cooking_time"]["min"])
            if filters["cooking_time"].get("max") is not None:
                queryset = queryset.filter(cooking_time__lte=filters["cooking_time"]["max"])

        # Match recipes based on ingredients
        recipes = []
        for recipe in queryset:
            # Get ingredients through RecipeIngredient model
            recipe_ingredients = RecipeIngredient.objects.filter(recipe=recipe).select_related('ingredient')
            recipe_ingredient_names = {self.normalize_ingredient_name(ri.ingredient.name) for ri in recipe_ingredients}
            available_ingredients = {self.normalize_ingredient_name(i) for i in ingredients}
            
            if not recipe_ingredient_names:
                logger.warning(f"Recipe {recipe.id} has no ingredients")
                continue

            # Calculate match percentage
            matching_ingredients = recipe_ingredient_names.intersection(available_ingredients)
            match_percentage = len(matching_ingredients) / len(recipe_ingredient_names)
            
            if match_percentage > 0.3:  # At least 30% ingredients match
                recipe_dict = {
                    "id": recipe.pk,
                    "title": recipe.title,
                    "description": recipe.description,
                    "instructions": recipe.instructions,
                    "cooking_time": recipe.cooking_time,
                    "preparation_time": recipe.preparation_time,
                    "total_time": recipe.total_time,
                    "difficulty": recipe.difficulty,
                    "servings": recipe.servings,
                    "serving_size": recipe.serving_size,
                    "calories_per_serving": recipe.calories_per_serving,
                    "protein_per_serving": recipe.protein_per_serving,
                    "is_vegetarian": recipe.is_vegetarian,
                    "is_gluten_free": recipe.is_gluten_free,
                    "image_url": recipe.image_url,
                    "cuisine": recipe.cuisine,
                    "dietary_restrictions": recipe.dietary_restrictions,
                    "nutrients": recipe.nutrients,
                    "is_featured": recipe.is_featured,
                    "match_percentage": round(match_percentage * 100, 1),
                    "matching_ingredients": list(matching_ingredients),
                    "missing_ingredients": list(recipe_ingredient_names - available_ingredients),
                    "total_ingredients": len(recipe_ingredient_names),
                    "matched_count": len(matching_ingredients)
                }
                recipes.append(recipe_dict)

        # Sort by match percentage
        recipes.sort(key=lambda x: x["match_percentage"], reverse=True)

        return Response({
            "count": len(recipes),
            "results": recipes,
            "request_info": {
                "ingredients_provided": len(ingredients),
                "ingredients_list": ingredients,
                "dietary_preferences": dietary_prefs,
                "filters": filters
            }
        })

    @action(detail=False, methods=["GET"])
    def suggestions(self, request):
        """Get personalized recipe suggestions based on user preferences and ratings"""
        try:
            # Get user's dietary preferences
            user_prefs = UserPreference.objects.filter(user=request.user).first()
            
            # Base queryset
            queryset = self.get_queryset()
            # Apply dietary preferences if they exist
            if user_prefs:
                if user_prefs.vegetarian:
                    queryset = queryset.filter(is_vegetarian=True)
                if user_prefs.gluten_free:
                    queryset = queryset.filter(is_gluten_free=True)
            # Get user's highly rated recipes (4+ stars)
            liked_recipes = RecipeRating.objects.filter(
                user=request.user,
                rating__gte=3
            ).values_list('recipe__cuisine', flat=True)
            

            # Get most common cuisines from liked recipes
            preferred_cuisines = list(set(liked_recipes))

            if user_prefs and user_prefs.preferred_cuisines:
                logger.info(f"Preferred cuisines: {user_prefs.preferred_cuisines}")
                preferred_cuisines.extend(user_prefs.preferred_cuisines)
            
            preferred_cuisines = list(set(preferred_cuisines))

            if preferred_cuisines:
                filters = Q()
                for cuisine in preferred_cuisines:
                    filters |= Q(cuisine__iexact=cuisine)  # Case-insensitive match
                queryset = queryset.filter(filters)


            # Build final suggestions
            suggestions = queryset.exclude(
                ratings__user=request.user
            ).annotate(
                rating_count_annotation=Count('ratings')
            ).order_by(
                '-average_rating',
                '-rating_count_annotation'
            )[:15]


            logger.info(f"Final Preferred Cuisines: {preferred_cuisines}")
            logger.info(f"Final suggestions count: {suggestions.count()}")

            # If no suggestions, try an even more relaxed query
            if suggestions.count() == 0:
                suggestions = queryset.filter(
                    Q(cuisine__in=preferred_cuisines) |
                    Q(average_rating__gte=3.0)
                ).exclude(
                    ratings__user=request.user
                ).order_by('?')[:10]
            
            logger.info(f"Final suggestions count updated: {suggestions.count()}")
            serializer = self.get_serializer(suggestions, many=True)
            
            return Response({
                "results": serializer.data,
                "preference_info": {
                    "preferred_cuisines": preferred_cuisines,
                    "dietary_preferences": {
                        "vegetarian": user_prefs.vegetarian if user_prefs else False,
                        "gluten_free": user_prefs.gluten_free if user_prefs else False
                    } if user_prefs else None
                }
            })
        except Exception as e:
            logger.exception("Error in recipe suggestions:")
            return Response(
                {"error": str(e) if settings.DEBUG else "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class UserPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = UserPreferenceSerializer
    
    def get_queryset(self):
        return UserPreference.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        try:
            preference = UserPreference.objects.filter(user=request.user).first()
            if preference:
                serializer = self.get_serializer(preference, data=request.data, partial=True)
            else:
                serializer = self.get_serializer(data=request.data)
            
            serializer.is_valid(raise_exception=True)
            
            if preference:
                serializer.save()  # Update
            else:
                serializer.save(user=request.user)  # Create new
            
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error updating preferences: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['GET'])
    def current(self, request):
        """Get current user's preferences"""
        try:
            preference = UserPreference.objects.filter(user=request.user).first()
            if preference:
                serializer = self.get_serializer(preference)
                return Response(serializer.data)
            return Response({
                'vegetarian': False,
                'gluten_free': False,
                'preferred_cuisines': []
            })
        except Exception as e:
            logger.error(f"Error fetching user preferences: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class RecipeRatingViewSet(viewsets.ModelViewSet):
    queryset = RecipeRating.objects.all()
    serializer_class = RecipeRatingSerializer

    def perform_create(self, serializer):
        # Automatically associate the current user with the rating
        serializer.save(user=self.request.user)

    def get_queryset(self):
        # Optionally, restrict to user's own ratings
        return RecipeRating.objects.filter(user=self.request.user)



