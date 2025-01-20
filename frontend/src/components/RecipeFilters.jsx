import React from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  Select,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  Divider,
  Fade,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRecipe } from '../context/RecipeContext';

function RecipeFilters() {
  const { state, dispatch } = useRecipe();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const difficulties = ['Easy', 'Medium', 'Hard'];

  const handleDifficultyChange = (e) => {
    dispatch({
      type: 'SET_FILTERS',
      payload: {
        ...state.filters,
        difficulty: e.target.value || null
      }
    });
  };

  const handleCookingTimeChange = (values) => {
    dispatch({
      type: 'SET_FILTERS',
      payload: {
        ...state.filters,
        cookingTime: {
          min: values[0],
          max: values[1]
        }
      }
    });
  };

  return (
    <Fade in>
      <Container maxW="container.sm" p={6}>
        <Box
          bg={bg}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          p={6}
          shadow="sm"
        >
          <Heading size="md" mb={4}>
            Recipe Filters
          </Heading>
          <Divider mb={4} />
          <VStack spacing={6} align="stretch">
            {/* Difficulty Filter */}
            <Box>
              <Text mb={2} fontWeight="medium">Difficulty Level</Text>
              <Select 
                placeholder="Any difficulty"
                value={state.filters?.difficulty || ''}
                onChange={handleDifficultyChange}
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </Select>
            </Box>

            {/* Cooking Time Filter */}
            <Box>
              <Text mb={2} fontWeight="medium">Cooking Time (minutes)</Text>
              <RangeSlider
                aria-label={['min', 'max']}
                defaultValue={[0, 120]}
                min={0}
                max={180}
                step={15}
                onChange={handleCookingTimeChange}
              >
                <RangeSliderTrack>
                  <RangeSliderFilledTrack />
                </RangeSliderTrack>
                <RangeSliderThumb index={0} />
                <RangeSliderThumb index={1} />
              </RangeSlider>
              <Text fontSize="sm" color="gray.500" mt={2}>
                {state.filters?.cookingTime?.min || 0} - {state.filters?.cookingTime?.max || 180} minutes
              </Text>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Fade>
  );
}

export default RecipeFilters;