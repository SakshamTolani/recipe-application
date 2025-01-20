import React, { useState, useEffect } from 'react';
import {
  VStack,
  Heading,
  Button,
  Grid,
  useToast,
  Container,
  Box,
  Text,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Collapse,
  IconButton,
  HStack,
  Flex
} from '@chakra-ui/react';
import { Search, Camera, Filter, ChevronDown, ChevronUp, Utensils, ChevronRight, ChevronLeft } from 'lucide-react';
import IngredientInput from '../components/IngredientInput';
import DietaryPreferences from '../components/DietaryPreferences';
import RecipeCard from '../components/RecipeCard';
import RecipeFilters from '../components/RecipeFilters';
import ImageUpload from '../components/ImageUpload';
import { useRecipe } from '../context/RecipeContext';
import { searchRecipes, detectIngredients } from '../api';
import PaginationControls from '../components/PaginationControls';

const Home = () => {
  const { state, dispatch } = useRecipe();
  const [loading, setLoading] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const toast = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 8;

  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = state.recipes?.results?.slice(indexOfFirstRecipe, indexOfLastRecipe) || [];
  const totalPages = Math.ceil((state.recipes?.results?.length || 0) / recipesPerPage);

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headerBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const grayBg = useColorModeValue('gray.600', 'gray.400')
  const accentColor = useColorModeValue('teal.500', 'teal.300');
  const tabBg = useColorModeValue('gray.100', 'gray.700');
  const selectedTabBg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  // Clear state when component mounts and unmounts
  useEffect(() => {
    // Only clear state if it's not the initial mount
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    // Clear state when component mounts (returning to page)
    clearState();

    // Cleanup function for when component unmounts
    return () => {
      clearState();
    };
  }, []); // Empty dependency array means this runs once on mount and cleanup on unmount

  const clearState = () => {
    dispatch({ type: 'SET_INGREDIENTS', payload: [] });
    dispatch({ type: 'SET_RECIPES', payload: { results: [] } });
    dispatch({ type: 'SET_DIETARY_PREFERENCES', payload: [] });
  };

  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [state.recipes]);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (!isInitialMount) {
      localStorage.setItem('recipeFinderState', JSON.stringify({
        ingredients: state.ingredients,
        dietaryPreferences: state.dietaryPreferences,
        recipes: state.recipes
      }));
    }
  }, [state.ingredients, state.dietaryPreferences, state.recipes, isInitialMount]);

  // Load state from localStorage on initial mount
  useEffect(() => {
    const savedState = localStorage.getItem('recipeFinderState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      dispatch({ type: 'SET_INGREDIENTS', payload: parsedState.ingredients || [] });
      dispatch({ type: 'SET_DIETARY_PREFERENCES', payload: parsedState.dietaryPreferences || [] });
      dispatch({ type: 'SET_RECIPES', payload: parsedState.recipes || { results: [] } });
    }
  }, []);

  const handleSearch = async () => {
    if (state.ingredients.length === 0) {
      toast({
        title: 'Missing Ingredients',
        description: 'Please add at least one ingredient to get started',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
      return;
    }

    setLoading(true);
    try {
      const recipes = await searchRecipes(state.ingredients, state.dietaryPreferences, state.filters);
      dispatch({ type: 'SET_RECIPES', payload: recipes });

      toast({
        title: 'Recipes Found!',
        description: `Found ${recipes.results?.length || 0} recipes with your ingredients`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
    } catch (error) {
      toast({
        title: 'Search Failed',
        description: 'Unable to fetch recipes. Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
      // Clear recipes on error
      dispatch({ type: 'SET_RECIPES', payload: { results: [] } });
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientsDetected = async (file) => {
    try {
      const result = await detectIngredients(file);
      if (result.matched_ingredients && result.unmatched_ingredients) {
        const detectedIngredients = [
          ...result.matched_ingredients.map((ing) => ing.name),
          ...result.unmatched_ingredients,
        ];
        dispatch({ type: 'SET_INGREDIENTS', payload: detectedIngredients });

        toast({
          title: 'Ingredients Detected',
          description: `Successfully identified ${detectedIngredients.length} ingredients. Go back to Ingredients Tab`,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top'
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error detecting ingredients:', error);
      toast({
        title: 'Detection Failed',
        description: 'Unable to detect ingredients from the image. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
    }
  };

  const handleClearAll = () => {
    clearState();
    localStorage.removeItem('recipeFinderState');
    toast({
      title: 'All Clear!',
      description: 'All ingredients, preferences, and recipes have been cleared.',
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top'
    });
  };

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header Section */}
          <Box
            bg={headerBgColor}
            p={8}
            borderRadius="xl"
            boxShadow="lg"
            border="1px"
            borderColor={borderColor}
          >
            <VStack spacing={4}>
              <HStack spacing={3}>
                <Utensils size={32} color={accentColor} />
                <Heading
                  as="h1"
                  size="xl"
                  bgGradient="linear(to-r, teal.400, teal.600)"
                  bgClip="text"
                >
                  Recipe Finder
                </Heading>
              </HStack>
              <Text
                color={useColorModeValue('gray.600', 'gray.300')}
                textAlign="center"
                maxW="2xl"
                fontSize="lg"
              >
                Transform your available ingredients into delicious recipes.
                ontat by adding ingredients or uploading a photo of your pantry.
              </Text>
            </VStack>
          </Box>

          {/* Main Content Section */}
          <Box
            bg={headerBgColor}
            borderRadius="xl"
            boxShadow="lg"
            border="1px"
            borderColor={borderColor}
            overflow="hidden"
          >
            <Tabs variant="soft-rounded" colorScheme="teal" p={6}>
              <TabList mb={4}>
                <Tab>
                  <HStack spacing={2}>
                    <Search size={18} />
                    <Text display={{ base: "none", md: "inline" }}>Add Ingredients</Text>
                  </HStack>
                </Tab>

                <Tab>
                  <HStack spacing={2}>
                    <Camera size={18} />
                    <Text display={{ base: "none", md: "inline" }}>Upload Photo</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack spacing={6}>
                    <IngredientInput />
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack spacing={6}>
                    <ImageUpload onIngredientsDetected={handleIngredientsDetected} />
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

            <Divider />

            {/* Collapsible Filters Section */}
            <Box p={6}>
              <Button
                variant="ghost"
                width="full"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<Filter size={18} />}
                rightIcon={showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                mb={showFilters ? 4 : 0}
              >
                Dietary Preferences & Filters
              </Button>

              <Collapse in={showFilters}>
                <Grid
                  templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                  gap={6}
                  mt={4}
                >
                  <DietaryPreferences />
                  <RecipeFilters />
                </Grid>
              </Collapse>

              <VStack spacing={4} mt={6}>
                <Button
                  colorScheme="teal"
                  size="lg"
                  onClick={handleSearch}
                  isLoading={loading}
                  loadingText="Finding Recipes..."
                  w="full"
                  maxW="md"
                  leftIcon={<Search />}
                >
                  Find Recipes
                </Button>

                {(state.ingredients.length > 0 || state.dietaryPreferences.length > 0 || state.recipes?.results?.length > 0) && (
                  <Button
                    variant="ghost"
                    colorScheme="red"
                    size="md"
                    onClick={handleClearAll}
                    w="full"
                    maxW="md"
                  >
                    Clear All
                  </Button>
                )}
              </VStack>
            </Box>
          </Box>

          {/* Results Section */}
          {state.recipes?.results?.length > 0 && (
            <Box
              bg={headerBgColor}
              p={6}
              borderRadius="xl"
              boxShadow="lg"
              border="1px"
              borderColor={borderColor}
            >
              <Flex justify="space-between" align="center" mb={6}>
                <Heading size="md">
                  Found Recipes ({state.recipes.results.length})
                </Heading>
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
                {currentRecipes.map((recipe) => (
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
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};


export default Home;