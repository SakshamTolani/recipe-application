import React from 'react';
import {
  Box,
  Checkbox,
  Heading,
  VStack,
  Text,
  useColorModeValue,
  Container,
  Fade,
  Badge,
  Divider
} from '@chakra-ui/react';
import { Leaf, Wheat } from 'lucide-react';
import { useRecipe } from '../context/RecipeContext';

function DietaryPreferences() {
  const { state, dispatch } = useRecipe();
  const grayBg = useColorModeValue('gray.50', 'gray.700');
  
  const preferences = [
    {
      name: 'Vegetarian',
      icon: Leaf,
      description: 'No meat or fish products',
      color: 'green'
    },
    {
      name: 'Gluten-Free',
      icon: Wheat,
      description: 'No wheat, rye, or barley',
      color: 'orange'
    }
  ];

  const handlePreferenceChange = (preference) => {
    const updatedPreferences = state.dietaryPreferences.includes(preference)
      ? state.dietaryPreferences.filter((p) => p !== preference)
      : [...state.dietaryPreferences, preference];
    dispatch({
      type: 'SET_DIETARY_PREFERENCES',
      payload: updatedPreferences,
    });
  };

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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
            Dietary Preferences
          </Heading>
          <Divider mb={4} />
          <VStack spacing={4} align="stretch">
            {preferences.map((preference) => {
              const Icon = preference.icon;
              const isSelected = state.dietaryPreferences.includes(preference.name);
              
              return (
                <Box
                  key={preference.name}
                  p={3}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={isSelected ? `${preference.color}.300` : borderColor}
                  _hover={{ bg: grayBg }}
                  transition="all 0.2s"
                >
                  <Checkbox
                    isChecked={isSelected}
                    onChange={() => handlePreferenceChange(preference.name)}
                    size="lg"
                  >
                    <Box display="flex" alignItems="center">
                      <Icon
                        size={20}
                        style={{
                          marginRight: '8px',
                          color: isSelected ? `var(--chakra-colors-${preference.color}-500)` : 'currentColor'
                        }}
                      />
                      <Box>
                        <Text fontWeight="medium">{preference.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {preference.description}
                        </Text>
                      </Box>
                      {isSelected && (
                        <Badge
                          ml="auto"
                          colorScheme={preference.color}
                          variant="subtle"
                        >
                          Selected
                        </Badge>
                      )}
                    </Box>
                  </Checkbox>
                </Box>
              );
            })}
          </VStack>
        </Box>
      </Container>
    </Fade>
  );
}

export default DietaryPreferences;