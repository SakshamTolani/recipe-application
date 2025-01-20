from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'ingredients', views.IngredientViewSet)
router.register(r'recipes', views.RecipeViewSet)
router.register(r'preferences', views.UserPreferenceViewSet, basename='preferences')
router.register(r'ratings', views.RecipeRatingViewSet)
router.register(r'auth', views.AuthViewSet, basename='auth')

urlpatterns = [
    path('', include(router.urls)),
    path('recipes/match_ingredients/', views.RecipeViewSet.as_view({'post': 'match_ingredients'})),
]