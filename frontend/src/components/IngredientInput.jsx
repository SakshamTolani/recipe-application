import React, { useState, useEffect } from 'react';
import {
  Box,
  Input,
  Button,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  useToast,
  Flex,
  List,
  ListItem
} from '@chakra-ui/react';
import { useRecipe } from '../context/RecipeContext';
import { searchIngredients } from '../api';

function IngredientInput() {
  const [ingredient, setIngredient] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { state, dispatch } = useRecipe();
  const toast = useToast();

  // Fetch ingredient suggestions when user types
  const fetchSuggestions = async (searchTerm) => {
    if (!searchTerm) {
      setSuggestions([]);
      return;
    }
    
    try {
      setLoading(true);
      const data = await searchIngredients(searchTerm);
      setSuggestions(data.results || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch ingredient suggestions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (ingredient) {
        fetchSuggestions(ingredient);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [ingredient]);

  const handleAddIngredient = (ingredientName = ingredient.trim()) => {
    if (ingredientName && !state.ingredients.includes(ingredientName)) {
      dispatch({
        type: 'SET_INGREDIENTS',
        payload: [...state.ingredients, ingredientName],
      });
      setIngredient('');
      setSuggestions([]);
    } else if (!ingredientName) {
      toast({
        title: 'Error',
        description: 'Please enter a valid ingredient',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Warning',
        description: 'This ingredient is already in your list',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemoveIngredient = (ingredientToRemove) => {
    dispatch({
      type: 'SET_INGREDIENTS',
      payload: state.ingredients.filter((ing) => ing !== ingredientToRemove),
    });
  };

  const handleSuggestionClick = (suggestedIngredient) => {
    handleAddIngredient(suggestedIngredient.name);
  };

  return (
    <Box position="relative">
      <Wrap spacing={4} mb={4}>
        {state.ingredients.map((ing) => (
          <WrapItem key={ing}>
            <Tag size="lg" borderRadius="full" variant="solid" colorScheme="blue">
              <TagLabel>{ing}</TagLabel>
              <TagCloseButton onClick={() => handleRemoveIngredient(ing)} />
            </Tag>
          </WrapItem>
        ))}
      </Wrap>

      <Flex gap={4}>
        <Box position="relative" flex="1">
          <Input
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            placeholder="Type to search or enter a new ingredient"
            onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
          />
          
          {/* Suggestions dropdown */}
          {suggestions.length > 0 && ingredient && (
            <List
              position="absolute"
              top="100%"
              left={0}
              right={0}
              bg="white"
              boxShadow="md"
              borderRadius="md"
              maxH="200px"
              overflowY="auto"
              zIndex={10}
              border="1px solid"
              borderColor="gray.200"
            >
              {suggestions.map((suggestion) => (
                <ListItem
                  key={suggestion.id}
                  px={4}
                  py={2}
                  cursor="pointer"
                  _hover={{ bg: 'gray.100' }}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.name}
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Button
          colorScheme="blue"
          onClick={() => handleAddIngredient()}
          isLoading={loading}
        >
          Add
        </Button>
      </Flex>
    </Box>
  );
}

export default IngredientInput;