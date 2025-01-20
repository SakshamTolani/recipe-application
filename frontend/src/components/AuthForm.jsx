import React, { useState } from 'react';
import {
  VStack,
  Input,
  Button,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  IconButton,
  Link,
  Text,
  FormErrorMessage,
} from '@chakra-ui/react';
import { Eye, EyeOff } from 'lucide-react';

const AuthForm = ({ isLoginMode, onSubmit, isLoading, switchMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setFormData({ email: '', password: '', password2: '' });
      setFormError('');
    } catch (error) {
      setFormError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired isInvalid={!!formError}>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </FormControl>
        
        <FormControl isRequired isInvalid={!!formError}>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            <InputRightElement>
              <IconButton
                size="sm"
                variant="ghost"
                icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              />
            </InputRightElement>
          </InputGroup>
          {formError && <FormErrorMessage>{formError}</FormErrorMessage>}
        </FormControl>

        {!isLoginMode && (
          <FormControl isRequired isInvalid={!!formError}>
            <FormLabel>Confirm Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword2 ? 'text' : 'password'}
                value={formData.password2}
                onChange={(e) => handleChange('password2', e.target.value)}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              <InputRightElement>
                <IconButton
                  size="sm"
                  variant="ghost"
                  icon={showPassword2 ? <EyeOff size={16} /> : <Eye size={16} />}
                  onClick={() => setShowPassword2(!showPassword2)}
                  aria-label={showPassword2 ? 'Hide password' : 'Show password'}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
        )}

        <Button
          type="submit"
          colorScheme="teal"
          width="full"
          isLoading={isLoading}
          loadingText={isLoginMode ? 'Logging in...' : 'Signing up...'}
        >
          {isLoginMode ? 'Login' : 'Sign Up'}
        </Button>

        <Text fontSize="sm">
          {isLoginMode ? "Don't have an account?" : "Already have an account?"}{' '}
          <Link color="teal.500" onClick={switchMode}>
            {isLoginMode ? 'Sign up' : 'Login'}
          </Link>
        </Text>
      </VStack>
    </form>
  );
};

export default AuthForm;