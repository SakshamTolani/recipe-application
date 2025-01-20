import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Link,
  Heading,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  useDisclosure,
  useToast,
  Avatar,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  User,
  LogIn,
  LogOut,
  BookMarked,
  Home,
  Heart,
  ChefHat,
  Settings,
} from 'lucide-react';
import { login, signup, logout, isAuthenticated } from '../api';
import AuthModal from './AuthModal';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const { isOpen: isAuthOpen, onOpen: onAuthOpen, onClose: onAuthClose } = useDisclosure();
  const { isOpen: isMobileOpen, onOpen: onMobileOpen, onClose: onMobileClose } = useDisclosure();

  const bgColor = useColorModeValue('teal.500', 'teal.600');
  const menuBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleAuthSubmit = async (formData) => {
    setIsLoading(true);
    try {
      if (isLoginMode) {
        await login(formData);
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
          status: 'success',
          duration: 3000,
        });
      } else {
        await signup(formData);
        toast({
          title: 'Account created!',
          description: 'Your account has been created successfully.',
          status: 'success',
          duration: 3000,
        });
      }

      setIsLoggedIn(true);
      onAuthClose();

      if (location.pathname === '/saved') {
        navigate('/saved');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
      status: 'info',
      duration: 3000,
    });

    if (location.pathname === '/saved') {
      navigate('/');
    }
  };

  const NavLink = ({ to, children, icon }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        as={RouterLink}
        to={to}
        display="flex"
        alignItems="center"
        gap={2}
        color="white"
        px={3}
        py={2}
        rounded="md"
        _hover={{ bg: 'teal.600' }}
        bg={isActive ? 'teal.600' : 'transparent'}
        onClick={isMobileOpen ? onMobileClose : undefined}
      >
        {icon}
        {children}
      </Link>
    );
  };

  return (
    <>
      <Box bg={bgColor} px={4} py={3} position="sticky" top={0} zIndex={1000}>
        <Flex maxW="container.xl" mx="auto" align="center" justify="space-between">
          <Flex align="center" gap={2}>
            <IconButton
              icon={<MenuIcon />}
              variant="ghost"
              color="white"
              display={{ base: 'flex', md: 'none' }}
              onClick={onMobileOpen}
              aria-label="Open menu"
              _hover={{ bg: 'teal.600' }}
            />
            <Heading size="md" color="white">
              <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
                <Flex align="center" gap={2}>
                  <ChefHat />
                  Recipe Finder
                </Flex>
              </Link>
            </Heading>
          </Flex>

          <Flex gap={4} display={{ base: 'none', md: 'flex' }} align="center">
            <NavLink to="/" icon={<Home size={18} />}>
              Home
            </NavLink>
            <NavLink to="/saved" icon={<BookMarked size={18} />}>
              Saved Recipes
            </NavLink>
            {isLoggedIn ? (
              <Menu>
                <MenuButton>
                  <Avatar size="sm" icon={<User />} bg="teal.600" />
                </MenuButton>
                <MenuList bg={menuBg}>
                  <MenuItem icon={<BookMarked size={18} />} onClick={()=>navigate("/saved")}>Saved Recipes</MenuItem>
                  <MenuItem icon={<ChefHat size={18} />} onClick={()=>navigate("/suggestions")}>Suggestions</MenuItem>
                  <MenuItem icon={<Settings size={18} />} onClick={()=>navigate("/preferences")}>Preference</MenuItem>
                  <MenuItem icon={<LogOut size={18} />} onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                leftIcon={<LogIn size={18} />}
                variant="outline"
                color="white"
                _hover={{ bg: 'teal.600' }}
                onClick={onAuthOpen}
              >
                Login
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      <Drawer isOpen={isMobileOpen} placement="left" onClose={onMobileClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={2}>
              <NavLink to="/" icon={<Home size={18} />}>
                Home
              </NavLink>
              <NavLink to="/saved" icon={<BookMarked size={18} />}>
                Saved Recipes
              </NavLink>
              {isLoggedIn ? (
                <Button
                  leftIcon={<LogOut size={18} />}
                  variant="ghost"
                  onClick={() => {
                    handleLogout();
                    onMobileClose();
                  }}
                  justifyContent="flex-start"
                >
                  Logout
                </Button>
              ) : (
                <Button
                  leftIcon={<LogIn size={18} />}
                  colorScheme="teal"
                  onClick={() => {
                    onAuthOpen();
                    onMobileClose();
                  }}
                >
                  Login
                </Button>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={onAuthClose}
        isLoginMode={isLoginMode}
        onSubmit={handleAuthSubmit}
        isLoading={isLoading}
        switchMode={() => setIsLoginMode(!isLoginMode)}
      />
    </>
  );
}

export default Navbar;