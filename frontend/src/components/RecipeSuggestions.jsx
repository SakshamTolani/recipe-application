import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Grid,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Container,
  Button,
  useToast,
  HStack,
  Flex
} from '@chakra-ui/react';
import { ChefHat, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import RecipeCard from './RecipeCard';
import { getSuggestions } from '../api';
import { useRecipe } from '../context/RecipeContext';

const RecipeSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { state } = useRecipe();
  const [preferenceInfo, setPreferenceInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 8;

  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentSuggestions = suggestions.slice(indexOfFirstRecipe, indexOfLastRecipe);
  const totalPages = Math.ceil(suggestions.length / recipesPerPage);

  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const grayBg = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    setCurrentPage(1); // Reset to first page when refreshing
    try {
      const response = await getSuggestions();
      console.log(response);
      setSuggestions(response.results);
      setPreferenceInfo(response.preference_info);
    } catch (err) {
      setError(err.message || 'Failed to fetch suggestions');
      toast({
        title: 'Error',
        description: 'Failed to fetch recipe suggestions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleRefresh = () => {
    fetchSuggestions();
  };

  if (error) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
        borderRadius="lg"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Failed to Load Suggestions
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          {error}
          <Button
            colorScheme="red"
            variant="link"
            onClick={handleRefresh}
            mt={2}
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box
          bg={bgColor}
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <VStack spacing={4} align="stretch">
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Heading size="lg" display="flex" alignItems="center" gap={2}>
                <ChefHat />
                Recipe Suggestions
              </Heading>
              <Button
                leftIcon={<RefreshCcw size={18} />}
                onClick={handleRefresh}
                isLoading={loading}
                colorScheme="teal"
                variant="ghost"
              >
                Refresh
              </Button>
            </Box>

            {preferenceInfo && (
              <Box>
                <Text fontSize="sm" color="gray.500">
                  Based on your preferred cuisines: {" "}
                  {preferenceInfo.preferred_cuisines.join(", ") || "No preferences yet"}
                </Text>
                {preferenceInfo.dietary_preferences && (
                  <Text fontSize="sm" color="gray.500">
                    Filtered for: {" "}
                    {[
                      preferenceInfo.dietary_preferences.vegetarian && "Vegetarian",
                      preferenceInfo.dietary_preferences.gluten_free && "Gluten-Free"
                    ].filter(Boolean).join(", ")}
                  </Text>
                )}
              </Box>
            )}

            {loading ? (
              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                  xl: "repeat(4, 1fr)"
                }}
                gap={6}
              >
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} height="300px" borderRadius="lg" />
                ))}
              </Grid>
            ) : suggestions.length > 0 ? (
              <>
                <Flex justify="space-between" align="center" mb={4}>
                  <Text color={grayBg}>
                    Found {suggestions.length} Suggestions
                  </Text>
                  <Text color={grayBg}>
                    Page {currentPage} of {totalPages}
                  </Text>
                </Flex>

                <Grid
                  templateColumns={{
                    base: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                    xl: "repeat(4, 1fr)"
                  }}
                  gap={6}
                >
                  {currentSuggestions.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </Grid>

                {totalPages > 1 && (
                  <HStack spacing={4} justify="center" mt={8}>
                    <Button
                      leftIcon={<ChevronLeft size={20} />}
                      onClick={() => handlePageChange('prev')}
                      isDisabled={currentPage === 1}
                      colorScheme="teal"
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      rightIcon={<ChevronRight size={20} />}
                      onClick={() => handlePageChange('next')}
                      isDisabled={currentPage === totalPages}
                      colorScheme="teal"
                      variant="outline"
                    >
                      Next
                    </Button>
                  </HStack>
                )}
              </>
            ) : (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertDescription>
                  Rate more recipes to get personalized suggestions!
                </AlertDescription>
              </Alert>
            )}
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default RecipeSuggestions;