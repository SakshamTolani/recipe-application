The recipe application demonstrates a comprehensive solution for recipe management with several key technical approaches:

## Ingredient Recognition:

- Utilizes Google's Gemini AI API for image analysis
- Implements caching with Redis to optimize repeated scans
- Validates images for format and size constraints
- Matches detected ingredients against a database for standardization

## Recipe Matching Algorithm:

- Uses a percentage-based matching system (minimum 30% ingredient match)
- Considers dietary restrictions (vegetarian/gluten-free) as primary filters
- Implements difficulty and cooking time as secondary filters
- Sorts results by match percentage for relevance

## Dietary Handling & Substitutions:

- Manages dietary preferences through UserPreference model
- Stores substitutions in Substitution model with ratio information
- Filters recipes based on dietary restrictions automatically
- Provides alternative ingredients through a substitution system


## Database Structure

- Created User model for storing user preferences and providing suggestions.
- Setup Recipes Schema and Ingredients Schema and created a RecipeIngredient Schema to create Many-to-Many mapping.
- UserPreferences Schema is used to save the preference of the user based on which suggestions are provided.
- Suggestions are provided on the basis of preference or types of recipes being liked by the user. (More than 3 star rating)

## Backend & Frontend:

- Contains 20+ detailed recipes with nutritional information
- Uses Django models for structured data management
- Implements responsive design using Chakra UI components
- Features real-time ingredient search with debouncing

## Error Handling:

- Implements comprehensive error handling for API requests
- Provides user-friendly error messages
- Includes fallback states for failed operations
- Validates user inputs on both frontend and backend

The implementation prioritizes user experience with fast search, clear feedback, and intuitive interface design.