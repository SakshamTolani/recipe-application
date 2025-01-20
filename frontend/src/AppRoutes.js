// src/AppRoutes.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import SavedRecipes from './pages/SavedRecipes';
import RecipeSuggestions from './components/RecipeSuggestions';
import UserPreferences from './components/UserPreferences';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/recipe/:id" element={<RecipeDetail />} />
      <Route path="/saved" element={<SavedRecipes />} />
      <Route path="/suggestions" element={<RecipeSuggestions />} />
      <Route path="/preferences" element={<UserPreferences />} />
    </Routes>
  );
}

export default AppRoutes;