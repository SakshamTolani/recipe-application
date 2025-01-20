import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Switch,
  Button,
  useToast,
  useColorModeValue,
  Container,
  FormControl,
  FormLabel,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  Wrap,
  WrapItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from '@chakra-ui/react';
import { Settings, Save } from 'lucide-react';
import { getUserPreferences, updateUserPreferences } from '../api';

const AVAILABLE_CUISINES = [
  'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 
  'Thai', 'French', 'Mediterranean', 'American', 'Korean'
];

const UserPreferences = () => {
  const [preferences, setPreferences] = useState({
    vegetarian: false,
    gluten_free: false,
    preferred_cuisines: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState('');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const data = await getUserPreferences();
      setPreferences(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load preferences',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserPreferences(preferences);
      toast({
        title: 'Success',
        description: 'Preferences saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preferences',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCuisine = () => {
    if (selectedCuisine && !preferences.preferred_cuisines.includes(selectedCuisine)) {
      setPreferences(prev => ({
        ...prev,
        preferred_cuisines: [...prev.preferred_cuisines, selectedCuisine]
      }));
      setSelectedCuisine('');
    }
  };

  const handleRemoveCuisine = (cuisine) => {
    setPreferences(prev => ({
      ...prev,
      preferred_cuisines: prev.preferred_cuisines.filter(c => c !== cuisine)
    }));
  };

  const handleReset = () => {
    onClose();
    setPreferences({
      vegetarian: false,
      gluten_free: false,
      preferred_cuisines: []
    });
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box
          bg={bgColor}
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <VStack spacing={6} align="stretch">
            <Heading size="lg" display="flex" alignItems="center" gap={2}>
              <Settings />
              Dietary Preferences
            </Heading>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="vegetarian" mb="0">
                Vegetarian
              </FormLabel>
              <Switch
                id="vegetarian"
                isChecked={preferences.vegetarian}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  vegetarian: e.target.checked
                }))}
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="gluten-free" mb="0">
                Gluten-Free
              </FormLabel>
              <Switch
                id="gluten-free"
                isChecked={preferences.gluten_free}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  gluten_free: e.target.checked
                }))}
              />
            </FormControl>

            <VStack align="stretch" spacing={4}>
              <Text fontWeight="medium">Preferred Cuisines</Text>
              <HStack>
                <Select
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  placeholder="Select cuisine"
                >
                  {AVAILABLE_CUISINES
                    .filter(cuisine => !preferences.preferred_cuisines.includes(cuisine))
                    .map(cuisine => (
                      <option key={cuisine} value={cuisine}>
                        {cuisine}
                      </option>
                    ))
                  }
                </Select>
                <Button
                  onClick={handleAddCuisine}
                  isDisabled={!selectedCuisine}
                  colorScheme="teal"
                >
                  Add
                </Button>
              </HStack>

              <Wrap spacing={2}>
                {preferences.preferred_cuisines.map(cuisine => (
                  <WrapItem key={cuisine}>
                    <Tag size="lg" borderRadius="full" variant="subtle" colorScheme="teal">
                      <TagLabel>{cuisine}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveCuisine(cuisine)} />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </VStack>

            <HStack spacing={4} justify="space-between">
              <Button
                colorScheme="red"
                variant="ghost"
                onClick={onOpen}
              >
                Reset Preferences
              </Button>
              <Button
                colorScheme="teal"
                onClick={handleSave}
                isLoading={saving}
                leftIcon={<Save size={18} />}
              >
                Save Preferences
              </Button>
            </HStack>
          </VStack>
        </Box>
      </VStack>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>
              Reset Preferences?
            </AlertDialogHeader>
            <AlertDialogBody>
              This will reset all your dietary preferences and cuisine selections. 
              This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleReset} ml={3}>
                Reset
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default UserPreferences;