# image_processing.py
import google.generativeai as genai
from PIL import Image
import io
import hashlib
from django.core.cache import cache
from django.conf import settings
from typing import List, Optional, Dict, Union
import logging

logger = logging.getLogger(__name__)


class IngredientExtractor:
    def __init__(self):
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel("gemini-1.5-flash")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini API: {str(e)}")
            raise RuntimeError(f"Gemini API initialization failed: {str(e)}")

    def _get_image_hash(self, image_data: bytes) -> str:
        """Generate a hash for the image data to use as cache key."""
        return hashlib.md5(image_data).hexdigest()

    def _validate_image(self, image_data: bytes) -> tuple[bool, str]:
        """Validate image format and size."""
        try:
            img = Image.open(io.BytesIO(image_data))

            # Check file size
            if len(image_data) > 4 * 1024 * 1024:
                return False, "Image size exceeds 4MB limit"

            # Check image format
            if img.format not in ["JPEG", "PNG", "JPG"]:
                return False, f"Unsupported image format: {img.format}"

            # Convert to RGB if needed
            if img.mode != "RGB":
                img = img.convert("RGB")

            return True, "Image validation successful"
        except Exception as e:
            return False, f"Image validation failed: {str(e)}"

    def extract_ingredients(
        self, image_data: bytes
    ) -> Dict[str, Union[List[str], str, None]]:
        """Extract ingredients from image with detailed error handling."""
        try:
            # Check cache first
            image_hash = self._get_image_hash(image_data)
            cached_result = cache.get(f"ingredient_scan_{image_hash}")
            if cached_result:
                return {
                    "status": "success",
                    "ingredients": cached_result,
                    "error": None,
                }

            # Validate image
            is_valid, validation_message = self._validate_image(image_data)
            if not is_valid:
                logger.error(f"Image validation failed: {validation_message}")
                return {
                    "status": "error",
                    "ingredients": None,
                    "error": validation_message,
                }

            # Prepare the prompt
            prompt = """
            Please analyze this image and list only the visible food ingredients.
            Format the response as a simple comma-separated list of ingredients.
            Only include clearly visible ingredients.
            """

            # Process image with Gemini
            img = Image.open(io.BytesIO(image_data))
            response = self.model.generate_content([prompt, img])

            if not response or not response.text:
                logger.error("Gemini API returned empty response")
                return {
                    "status": "error",
                    "ingredients": None,
                    "error": "Failed to extract ingredients from image",
                }

            # Parse response
            ingredients = [
                ingredient.strip().lower()
                for ingredient in response.text.split(",")
                if ingredient.strip()
            ]

            if not ingredients:
                return {
                    "status": "error",
                    "ingredients": None,
                    "error": "No ingredients detected in the image",
                }

            # Cache the result for 24 hours
            cache.set(f"ingredient_scan_{image_hash}", ingredients, timeout=86400)

            return {"status": "success", "ingredients": ingredients, "error": None}

        except Exception as e:
            logger.exception("Error in ingredient extraction:")
            return {
                "status": "error",
                "ingredients": None,
                "error": f"Ingredient extraction failed: {str(e)}",
            }
