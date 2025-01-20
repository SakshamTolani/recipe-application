import React from 'react';
import {
  VStack,
  Grid,
  Heading,
  Text,
  Button,
  useMediaQuery,
  Container,
  Box,
  useColorModeValue,
  Flex,
  Icon,
  ScaleFade,
  Badge,
  Skeleton,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { BookMarked, ChefHat, ArrowLeft } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import { useRecipe } from '../context/RecipeContext';

function SavedRecipes() {
  const { state } = useRecipe();
  const navigate = useNavigate();
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const headerBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const EmptyState = () => (
    <ScaleFade initialScale={0.9} in={true}>
      <VStack
        spacing={8}
        py={16}
        px={4}
        borderRadius="xl"
        bg={headerBg}
        borderWidth="1px"
        borderColor={borderColor}
        shadow="sm"
        maxW="lg"
        mx="auto"
      >
        <Icon as={BookMarked} boxSize={12} color="teal.500" />
        <VStack spacing={3}>
          <Heading size="lg" textAlign="center">
            No Saved Recipes Yet
          </Heading>
          <Text color="gray.500" textAlign="center">
            Your culinary journey starts here! Save your favorite recipes and access them anytime.
          </Text>
        </VStack>
        <Button
          leftIcon={<ChefHat size={20} />}
          colorScheme="teal"
          size="lg"
          onClick={() => navigate('/')}
          shadow="md"
          _hover={{
            transform: 'translateY(-2px)',
            shadow: 'lg',
          }}
          transition="all 0.2s"
        >
          Discover Recipes
        </Button>
      </VStack>
    </ScaleFade>
  );

  if (state.savedRecipes.length === 0) {
    return (
      <Container maxW="container.xl" py={8}>
        <EmptyState />
      </Container>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Box
            bg={headerBg}
            p={6}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            shadow="sm"
          >
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align={{ base: 'start', md: 'center' }}
              gap={4}
            >
              <VStack align="start" spacing={2}>
                <Flex align="center" gap={3}>
                  <Button
                    variant="ghost"
                    leftIcon={<ArrowLeft size={20} />}
                    onClick={() => navigate('/')}
                    size="sm"
                  >
                    Back
                  </Button>
                  <Heading size="lg">Saved Recipes</Heading>
                </Flex>
                <Badge colorScheme="teal" fontSize="sm">
                  {state.savedRecipes.length} {state.savedRecipes.length === 1 ? 'Recipe' : 'Recipes'} Saved
                </Badge>
              </VStack>
            </Flex>
          </Box>

          <ScaleFade initialScale={0.9} in={true}>
            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
                xl: 'repeat(4, 1fr)',
              }}
              gap={6}
              width="100%"
            >
              {state.savedRecipes.map((recipe, index) => (
                <Skeleton isLoaded={true} key={recipe.id} fadeDuration={0.5 + index * 0.1}>
                  <RecipeCard
                    recipe={recipe}
                    isMobile={isSmallerThan768}
                  />
                </Skeleton>
              ))}
            </Grid>
          </ScaleFade>
        </VStack>
      </Container>
    </Box>
  );
}

export default SavedRecipes;