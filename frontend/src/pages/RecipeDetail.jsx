import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Image,
  Text,
  VStack,
  HStack,
  Badge,
  List,
  ListItem,
  ListIcon,
  Button,
  useToast,
  Textarea,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Divider,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';
import { CheckCircleIcon, StarIcon, TimeIcon, FireIcon } from '@chakra-ui/icons';
import { Clock, Gauge, ChefHat, BookPlus, LeafyGreen } from 'lucide-react';
import { useRecipe } from '../context/RecipeContext';
import { fetchRecipeDetails, submitRating } from '../api';

function RecipeDetail() {
  const { id } = useParams();
  const { state, dispatch } = useRecipe();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const getRecipeDetails = async () => {
      try {
        const data = await fetchRecipeDetails(id);
        setRecipe(data);
      } catch (error) {
        toast({
          title: 'Failed to Load Recipe',
          description: 'Unable to fetch recipe details. Please try again later.',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      } finally {
        setLoading(false);
      }
    };

    getRecipeDetails();
  }, [id, toast]);

  const handleRating = async () => {
    if (userRating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a rating before submitting',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    try {
      setLoading(true)
      await submitRating(id, userRating, comment);
      toast({
        title: 'Thank You!',
        description: 'Your rating has been submitted successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
    } catch (error) {
      toast({
        title: 'Already Rated',
        description: 'Unable to submit your rating as you have already rated.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
    setUserRating(0);
    setComment('');
    setLoading(false);
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <Skeleton height="300px" width="100%" />
          <Skeleton height="40px" width="60%" />
          <Skeleton height="20px" width="40%" />
          <Skeleton height="200px" width="100%" />
        </VStack>
      </Container>
    );
  }

  if (!recipe) {
    return (
      <Box textAlign="center" py={10}>
        <Heading size="lg">Recipe Not Found</Heading>
        <Text mt={4}>The recipe you're looking for doesn't exist or has been removed.</Text>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        {/* Hero Image */}
        <Box
          borderRadius="xl"
          overflow="hidden"
          boxShadow="xl"
          mb={8}
          position="relative"
        >
          <Image
            src={recipe.image_url || "/placeholder.svg"}
            alt={recipe.title}
            w="100%"
            h="400px"
            objectFit="cover"
          />
        </Box>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
          <VStack align="stretch" spacing={8}>
            {/* Title and Badges */}
            <Box
              bg={cardBg}
              p={6}
              borderRadius="lg"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
            >
              <Heading as="h1" size="xl" mb={4}>
                {recipe.title}
              </Heading>
              <HStack spacing={4} flexWrap="wrap">
                <Badge colorScheme="green" p={2} borderRadius="md">
                  <HStack>
                    <ChefHat size={16} />
                    <Text>{recipe.difficulty}</Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="purple" p={2} borderRadius="md">
                  <HStack>
                    <Clock size={16} />
                    <Text>{recipe.cooking_time} mins</Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="blue" p={2} borderRadius="md">
                  <HStack>
                    <Gauge size={16} />
                    <Text>{recipe.servings} servings</Text>
                  </HStack>
                </Badge>
                {recipe.is_gluten_free &&
                  <Badge colorScheme="orange" p={2} borderRadius="md">
                    <HStack>
                      <BookPlus size={16} />
                      <Text>Gluten Free</Text>
                    </HStack>
                  </Badge>
                }
                {recipe.is_vegetarian &&
                  <Badge colorScheme="yellow" p={2} borderRadius="md">
                    <HStack>
                      <LeafyGreen size={16} />
                      <Text>Vegetarian</Text>
                    </HStack>
                  </Badge>
                }
              </HStack>
            </Box>

            {/* Description */}
            <Box
              bg={cardBg}
              p={6}
              borderRadius="lg"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
            >
              <Text fontSize="lg">{recipe.description}</Text>
            </Box>

            {/* Ingredients */}
            <Box
              bg={cardBg}
              p={6}
              borderRadius="lg"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
            >
              <Heading as="h2" size="lg" mb={4}>
                Ingredients
              </Heading>
              <List spacing={3}>
                {recipe.ingredients.map((ingredient, index) => (
                  <ListItem key={index} display="flex" alignItems="center">
                    <ListIcon as={CheckCircleIcon} color="green.500" />
                    <Text fontWeight="bold" mr={2}>
                      {ingredient.quantity} {ingredient.unit}
                    </Text>
                    <Text>{ingredient.ingredient_name}</Text>
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Instructions */}
            <Box
              bg={cardBg}
              p={6}
              borderRadius="lg"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
            >
              <Heading as="h2" size="lg" mb={4}>
                Instructions
              </Heading>
              <VStack align="stretch" spacing={4}>
                {recipe.instructions.split('\n').map((step, index) => (
                  <HStack key={index} align="start" spacing={4}>
                    <Badge
                      colorScheme="teal"
                      fontSize="lg"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {index + 1}
                    </Badge>
                    <Text flex={1}>{step}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          </VStack>

          {/* Sidebar */}
          <VStack spacing={8}>
            {/* Nutritional Information */}
            <Box
              bg={cardBg}
              p={6}
              borderRadius="lg"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
              w="100%"
            >
              <Heading as="h2" size="md" mb={4}>
                Nutrition Facts
              </Heading>
              <StatGroup>
                <Grid templateColumns="repeat(2, 1fr)" gap={4} width="100%">
                  <Stat>
                    <StatLabel>Calories</StatLabel>
                    <StatNumber>{recipe.calories_per_serving}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Protein</StatLabel>
                    <StatNumber>{recipe.protein_per_serving}g</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Carbs</StatLabel>
                    <StatNumber>{recipe.nutrients.carbohydrates}g</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Fat</StatLabel>
                    <StatNumber>{recipe.nutrients.fat}g</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Fiber</StatLabel>
                    <StatNumber>{recipe.nutrients.fiber}g</StatNumber>
                  </Stat>
                </Grid>
              </StatGroup>
            </Box>
            <Box
              bg={cardBg}
              p={6}
              borderRadius="lg"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
              w="100%"
              mt={6}
              mb={6}
            >
              <Heading as="h3" size="md" mb={4}>
                Recipe Rating
              </Heading>
              <HStack spacing={4} align="center">
                <Text fontSize="3xl" fontWeight="bold" lineHeight="1">
                  {recipe.average_rating ? recipe.average_rating.toFixed(1) : 'N/A'}
                </Text>
                <VStack align="start" spacing={0}>
                  <HStack spacing={1}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        boxSize={4}
                        color={star <= Math.round(recipe.average_rating || 0) ? "yellow.400" : "gray.300"}
                      />
                    ))}
                  </HStack>
                  <Text color="gray.500" fontSize="sm">
                    {recipe.rating_count || 0} {recipe.rating_count === 1 ? 'rating' : 'ratings'}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Rating Section */}
            <Box
              bg={cardBg}
              p={6}
              borderRadius="lg"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
              w="100%"
            >
              <Heading as="h3" size="md" mb={4}>
                Rate this Recipe
              </Heading>
              <VStack spacing={4} align="stretch">
                <HStack spacing={2} justify="center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      boxSize={8}
                      color={star <= userRating ? "yellow.400" : "gray.300"}
                      onClick={() => setUserRating(star)}
                      cursor="pointer"
                      _hover={{ transform: "scale(1.1)" }}
                      transition="transform 0.2s"
                    />
                  ))}
                </HStack>
                <Textarea
                  placeholder="Share your experience with this recipe (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  minH="100px"
                />
                <Button
                  colorScheme="teal"
                  size="lg"
                  onClick={handleRating}
                  width="100%"
                >
                  Submit Review
                </Button>
              </VStack>
            </Box>
          </VStack>
        </Grid>
      </Container>
    </Box>
  );
}

export default RecipeDetail;