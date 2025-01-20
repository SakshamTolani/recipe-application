import React, { useState } from 'react';
import {
  Box,
  Image,
  Heading,
  Text,
  Badge,
  Button,
  Stack,
  useToast,
  Skeleton,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useRecipe } from '../context/RecipeContext';

function RecipeCard({ recipe }) {
  const navigate = useNavigate();
  const { dispatch, state } = useRecipe();
  const toast = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleSaveRecipe = () => {
    dispatch({ type: 'SAVE_RECIPE', payload: recipe });
    toast({
      title: 'Recipe Saved',
      description: `${recipe.title} has been saved to your favorites`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const isSaved = state.savedRecipes.some((saved) => saved.id === recipe.id);

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      transition="transform 0.2s"
      _hover={{ transform: 'scale(1.02)' }}
      position="relative"
      height={imageLoaded ? 'auto' : '460px'} // Set a fixed height while loading
    >
      <Skeleton
        isLoaded={imageLoaded}
        height="200px"
        width="100%"
        borderRadius="lg"
        startColor="gray.100"
        endColor="gray.300"
      >
        <Image
          src={recipe.image_url}
          alt={recipe.title}
          height="200px"
          width="100%"
          objectFit="cover"
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0 }}
          transition="opacity 0.3s ease-in-out"
        />
      </Skeleton>

      <Box p={4}>
        <Skeleton isLoaded={imageLoaded}>
          <Heading size="md" mb={2}>
            {recipe.title}
          </Heading>
        </Skeleton>

        <Skeleton isLoaded={imageLoaded} mb={2}>
          <Stack direction="row" mb={2}>
            <Badge colorScheme="green">{recipe.cooking_time} mins</Badge>
            <Badge colorScheme="purple">{recipe.difficulty}</Badge>
            {recipe.dietary_restrictions.map((tag) => (
              <Badge key={tag} colorScheme="blue">
                {tag}
              </Badge>
            ))}
          </Stack>
        </Skeleton>

        <Skeleton isLoaded={imageLoaded} mb={4}>
          <Text noOfLines={2}>
            {recipe.description}
          </Text>
        </Skeleton>

        <Skeleton isLoaded={imageLoaded}>
          <Stack direction="row" spacing={2}>
            <Button
              colorScheme="teal"
              variant="outline"
              onClick={() => navigate(`/recipe/${recipe.id}`)}
            >
              View Details
            </Button>
            <Button
              colorScheme="pink"
              variant={isSaved ? "solid" : "outline"}
              onClick={handleSaveRecipe}
              isDisabled={isSaved}
            >
              {isSaved ? 'Saved' : 'Save Recipe'}
            </Button>
          </Stack>
        </Skeleton>
      </Box>
    </Box>
  );
}

export default RecipeCard;