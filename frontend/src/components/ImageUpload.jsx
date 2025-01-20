import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Image,
  Input,
  VStack,
  Text,
  useToast,
  Progress,
  Center,
  Container,
  Heading,
  Icon,
  useColorModeValue,
  Flex,
  AnimatePresence,
  ScaleFade,
} from '@chakra-ui/react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

function ImageUpload({ onIngredientsDetected }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const toast = useToast();

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const dragBorderColor = useColorModeValue('teal.300', 'teal.500');
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const dragBgColor = useColorModeValue('gray.100', 'gray.600');

  const handleImageUpload = async (file) => {
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      setError('Please upload an image file');
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSelectedImage(URL.createObjectURL(file));
    setLoading(true);
    setError(null);

    try {
      await onIngredientsDetected(file);
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error processing image:', error);
      const errorMessage = error.response?.data?.error || 'Failed to process image';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6}>
        <Heading size="lg" textAlign="center">
          Upload Your Image
        </Heading>
        
        <Box
          w="full"
          position="relative"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Center
            borderWidth={2}
            borderStyle="dashed"
            borderRadius="xl"
            borderColor={isDragging ? dragBorderColor : borderColor}
            bg={isDragging ? dragBgColor : bgColor}
            p={8}
            transition="all 0.2s"
            cursor="pointer"
            _hover={{
              borderColor: dragBorderColor,
              bg: dragBgColor,
            }}
          >
            <VStack spacing={4}>
              <Icon as={Upload} boxSize={8} color="teal.500" />
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                display="none"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button
                  as="span"
                  colorScheme="teal"
                  size="lg"
                  leftIcon={<Icon as={ImageIcon} />}
                >
                  Choose Image
                </Button>
              </label>
              <Text color="gray.500">
                or drag and drop your image here
              </Text>
            </VStack>
          </Center>
        </Box>

        {loading && (
          <Box w="full">
            <Progress size="sm" isIndeterminate colorScheme="teal" />
          </Box>
        )}

        {selectedImage && (
          <ScaleFade in={true}>
            <Box
              borderRadius="xl"
              overflow="hidden"
              boxShadow="lg"
              maxW="400px"
              w="full"
            >
              <Image
                src={selectedImage}
                alt="Uploaded food"
                w="full"
                h="300px"
                objectFit="cover"
              />
            </Box>
          </ScaleFade>
        )}

        {error && (
          <Flex align="center" color="red.500" fontSize="sm">
            <Icon as={AlertCircle} mr={2} />
            <Text>{error}</Text>
          </Flex>
        )}
      </VStack>
    </Container>
  );
}

ImageUpload.propTypes = {
  onIngredientsDetected: PropTypes.func.isRequired,
};

export default ImageUpload;