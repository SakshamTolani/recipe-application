// src/App.js

import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import theme from './styles/theme';
import AppRoutes from './AppRoutes';
import { RecipeProvider } from './context/RecipeContext';
import Navbar from './components/Navbar';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <RecipeProvider>
        <Router>
          <Navbar />
          <AppRoutes />
        </Router>
      </RecipeProvider>
    </ChakraProvider>
  );
}

export default App;