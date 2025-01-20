import React, { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';

const initialState = {
  ingredients: [],
  dietaryPreferences: [],
  recipes: {
    count: 0,
    results: [],
    request_info: null
  },
  savedRecipes: [],
  filters: {
    difficulty: null,
    cookingTime: {
      min: 0,
      max: 180
    }
  }
};

function recipeReducer(state, action) {
  switch (action.type) {
    case 'SET_INGREDIENTS':
      return { ...state, ingredients: action.payload };
    case 'SET_DIETARY_PREFERENCES':
      return { ...state, dietaryPreferences: action.payload };
    case 'SET_RECIPES':
      return { ...state, recipes: action.payload };
    case 'SAVE_RECIPE':
      return {
        ...state,
        savedRecipes: [...state.savedRecipes, action.payload],
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: action.payload
      };
    default:
      return state;
  }
}

const RecipeContext = createContext();

export function RecipeProvider({ children }) {
  const [state, dispatch] = useReducer(recipeReducer, initialState);

  return (
    <RecipeContext.Provider value={{ state, dispatch }}>
      {children}
    </RecipeContext.Provider>
  );
}

RecipeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useRecipe() {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipe must be used within a RecipeProvider');
  }
  return context;
}

