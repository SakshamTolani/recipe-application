from django.db import models
from django.contrib.auth.models import User,AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Add related_name to resolve the clash
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        verbose_name='groups',
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        verbose_name='user permissions',
        help_text='Specific permissions for this user.',
    )

    def __str__(self):
        return self.email
    

class Ingredient(models.Model):
    name = models.CharField(max_length=100, unique=True)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Recipe(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    CUISINE_CHOICES = [
        ('italian', 'Italian'),
        ('chinese', 'Chinese'),
        ('indian', 'Indian'),
        ('mexican', 'Mexican'),
        ('american', 'American'),
        ('japanese', 'Japanese'),
        ('thai', 'Thai'),
        ('mediterranean', 'Mediterranean'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    ingredients = models.ManyToManyField(
        Ingredient,
        through='RecipeIngredient',
        related_name='recipes'
    )
    instructions = models.TextField()
    cooking_time = models.PositiveIntegerField(help_text="Cooking time in minutes")
    difficulty = models.CharField(
        max_length=10,
        choices=DIFFICULTY_CHOICES,
        default='medium'
    )
    servings = models.PositiveIntegerField(default=4)
    calories_per_serving = models.PositiveIntegerField()
    protein_per_serving = models.FloatField()
    is_vegetarian = models.BooleanField(default=False)
    is_gluten_free = models.BooleanField(default=False)
    image_url = models.URLField(blank=True)
    cuisine = models.CharField(max_length=20, choices=CUISINE_CHOICES)
    preparation_time = models.PositiveIntegerField(help_text="Preparation time in minutes")
    total_time = models.PositiveIntegerField(
        help_text="Total time (prep + cooking) in minutes",
        null=True,
        blank=True
    )
    serving_size = models.CharField(max_length=50)
    dietary_restrictions = models.JSONField(default=list, blank=True)
    nutrients = models.JSONField(default=dict)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.total_time:
            self.total_time = self.preparation_time + self.cooking_time
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantity = models.CharField(max_length=50)
    unit = models.CharField(max_length=50)

    class Meta:
        unique_together = ['recipe', 'ingredient']

    def __str__(self):
        return f"{self.quantity} {self.unit} of {self.ingredient.name} for {self.recipe.title}"

class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    vegetarian = models.BooleanField(default=False)
    gluten_free = models.BooleanField(default=False)
    preferred_cuisines = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

class RecipeRating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ratings')
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user','recipe']

    def __str__(self):
        return f"{self.rating} stars for {self.recipe.title} by {self.user.username}"
    

class Substitution(models.Model):
    ingredient = models.ForeignKey(Ingredient, related_name='substitutions', on_delete=models.CASCADE)
    substitute = models.ForeignKey(Ingredient, related_name='substituted_for', on_delete=models.CASCADE)
    ratio = models.FloatField(help_text="Ratio of the substitute to the original ingredient")
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.substitute.name} for {self.ingredient.name} (Ratio: {self.ratio})"