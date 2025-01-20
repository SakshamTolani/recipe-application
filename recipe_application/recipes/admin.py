from django.contrib import admin
from recipes.models import *
# Register your models here.

admin.site.register(User)
admin.site.register(Ingredient)
admin.site.register(Recipe)
admin.site.register(RecipeIngredient)
admin.site.register(UserPreference)
admin.site.register(RecipeRating)
admin.site.register(Substitution)
