// PaginationControls.jsx
import React from 'react';
import { HStack, Button, Text, useColorModeValue } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  return (
    <HStack spacing={4} justify="center" w="full" mt={6}>
      <Button
        size="md"
        variant="outline"
        colorScheme="teal"
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={currentPage === 1}
        leftIcon={<ChevronLeft size={18} />}
      >
        Previous
      </Button>
      
      <Text color={textColor} fontSize="sm">
        Page {currentPage} of {totalPages}
      </Text>
      
      <Button
        size="md"
        variant="outline"
        colorScheme="teal"
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages}
        rightIcon={<ChevronRight size={18} />}
      >
        Next
      </Button>
    </HStack>
  );
};

export default PaginationControls;