// import axios from 'axios';

// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// const api = axios.create({
//   baseURL: API_BASE_URL,
// });

// export const searchRecipes = async (ingredients, dietaryPreferences) => {
//   try {
//     const response = await api.post('/recipes/match_ingredients/', {
//       ingredients,
//       dietary_preferences: {
//         vegetarian: dietaryPreferences.includes('Vegetarian'),
//         gluten_free: dietaryPreferences.includes('Gluten-Free'),
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('API Error:', error);
//     throw error;
//   }
// };

// export const fetchRecipeDetails = async (recipeId) => {
//   try {
//     const response = await api.get(`/recipes/${recipeId}/`);
//     return response.data;
//   } catch (error) {
//     console.error('API Error:', error);
//     throw error;
//   }
// };

// export const submitRating = async (recipeId, rating, comment = '') => {
//   console.log(recipeId + rating + comment);
//   try {
//     const response = await api.post('/ratings/', {
//       recipe: recipeId,
//       rating,
//       comment,
//     });
//     return response.data;
//   } catch (error) {
//     console.error('API Error:', error);
//     throw error;
//   }
// };

// export const detectIngredients = async (imageFile) => {
//   try {
//     const formData = new FormData();
//     formData.append('image', imageFile);

//     const response = await api.post('/ingredients/scan_image/', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('API Error:', error);
//     if (error.response) {
//       throw new Error(error.response.data.error || 'Failed to process image');
//     } else if (error.request) {
//       throw new Error('No response received from the server');
//     } else {
//       throw new Error('Error setting up the request');
//     }
//   }
// };

// export const saveUserPreferences = async (preferences) => {
//   try {
//     const response = await api.post('/preferences/', preferences);
//     return response.data;
//   } catch (error) {
//     console.error('API Error:', error);
//     throw error;
//   }
// };

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Token management
const getStoredTokens = () => {
  const tokens = localStorage.getItem('tokens');
  return tokens ? JSON.parse(tokens) : null;
};

const storeTokens = (tokens) => {
  localStorage.setItem('tokens', JSON.stringify(tokens));
};

const removeTokens = () => {
  localStorage.removeItem('tokens');
};

// Add auth header interceptor
api.interceptors.request.use(
  (config) => {
    const tokens = getStoredTokens();
    if (tokens?.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication endpoints
export const signup = async (userData) => {
  try {
    const response = await api.post('/auth/signup/', {
      username: userData.email,
      email: userData.email,
      password: userData.password,
      password2: userData.password2
    });
    const { tokens, user } = response.data;
    storeTokens(tokens);
    return { tokens, user };
  } catch (error) {
    console.error('Signup Error:', error);
    if (error.response?.data) {
      throw new Error(Object.values(error.response.data).flat().join(' '));
    }
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login/', {
      username: credentials.email,
      password: credentials.password,
    });
    const { tokens, user } = response.data;
    storeTokens(tokens);
    return { tokens, user };
  } catch (error) {
    console.error('Login Error:', error);
    if (error.response?.status === 401) {
      throw new Error('Invalid email or password');
    }
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Login failed. Please try again.');
  }
};

export const logout = () => {
  removeTokens();
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const tokens = getStoredTokens();
  return !!tokens?.access;
};

// Get current auth state
export const getCurrentAuthState = () => {
  const tokens = getStoredTokens();
  return {
    isAuthenticated: !!tokens?.access,
    tokens,
  };
};

// Existing API endpoints
// export const searchRecipes = async (ingredients, dietaryPreferences) => {
//   try {
//     const response = await api.post('/recipes/match_ingredients/', {
//       ingredients,
//       dietary_preferences: {
//         vegetarian: dietaryPreferences.includes('Vegetarian'),
//         gluten_free: dietaryPreferences.includes('Gluten-Free'),
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('API Error:', error);
//     throw error;
//   }
// };

export const searchRecipes = async (ingredients, dietaryPreferences, filters = {}) => {
  try {
    const params = {
      ingredients,
      dietary_preferences: {
        vegetarian: dietaryPreferences.includes('Vegetarian'),
        gluten_free: dietaryPreferences.includes('Gluten-Free'),
      },
      filters: {},
    };

    // Add filters to params if they exist
    if (filters.difficulty) {
      params.filters['difficulty'] = filters.difficulty;
    }
    if (filters.cookingTime?.min !== undefined || filters.cookingTime?.max !== undefined) {
      // Initialize cooking_time object if it doesn't exist
      params.filters['cooking_time'] = params.filters['cooking_time'] || {};

      if (filters.cookingTime?.min !== undefined) {
        params.filters['cooking_time']['min'] = filters.cookingTime.min;
      }
      if (filters.cookingTime?.max !== undefined) {
        params.filters['cooking_time']['max'] = filters.cookingTime.max;
      }
    }

    const response = await api.post('/recipes/match_ingredients/', params);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const fetchRecipeDetails = async (recipeId) => {
  try {
    const response = await api.get(`/recipes/${recipeId}/`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const submitRating = async (recipeId, rating, comment = '') => {
  if (!isAuthenticated()) {
    throw new Error('Please login to submit ratings');
  }
  
  try {
    const response = await api.post('/ratings/', {
      recipe: recipeId,
      rating,
      comment,
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const searchIngredients = async (searchTerm) => {
  try {
    const response = await api.get(`/ingredients/?search=${searchTerm}`);
    return response.data;
  } catch (error) {
    console.error('Error searching ingredients:', error);
    handleApiError(error);
  }
};



export const detectIngredients = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/ingredients/scan_image/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to process image');
    } else if (error.request) {
      throw new Error('No response received from the server');
    } else {
      throw new Error('Error setting up the request');
    }
  }
};

export const saveUserPreferences = async (preferences) => {
  if (!isAuthenticated()) {
    throw new Error('Please login to save preferences');
  }

  try {
    const response = await api.post('/preferences/', preferences);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Error handler helper
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    if (error.response.status === 401) {
      removeTokens(); // Clear invalid tokens
      throw new Error('Session expired. Please login again.');
    }
    throw new Error(error.response.data.error || 'An error occurred');
  } else if (error.request) {
    // Request made but no response
    throw new Error('No response from server. Please check your connection.');
  } else {
    // Request setup error
    throw new Error('Request failed. Please try again.');
  }
};

export const getSuggestions = async () => {
  try {
    const response = await api.get('/recipes/suggestions/');
    return response.data;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    handleApiError(error);
  }
};

export const getUserPreferences = async () => {
  try {
    const response = await api.get('/preferences/current/');
    return response.data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    handleApiError(error);
  }
};

export const updateUserPreferences = async (preferences) => {
  try {
    console.log(preferences);
    const response = await api.post('/preferences/', preferences);
    return response.data;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    handleApiError(error);
  }
};



export default api;
