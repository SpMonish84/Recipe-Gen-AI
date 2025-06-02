import { handleEmptyState } from './utils.js';

// API Configuration
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
const token = localStorage.getItem('token');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

// DOM Elements
const recipesContainer = document.getElementById('recipes-container');

// Load Recipes
async function loadRecipes() {
    try {
        const response = await axios.get(`${API_URL}/users/profile`, { headers });
        const user = response.data;

        // Check for empty state
        if (handleEmptyState(recipesContainer, user.recipes, 'recipes')) {
            return;
        }

        // Display recipes
        recipesContainer.innerHTML = '';
        user.recipes.forEach(recipe => {
            const recipeCard = createRecipeCard(recipe);
            recipesContainer.appendChild(recipeCard);
        });
    } catch (error) {
        console.error('Error loading recipes:', error);
        handleEmptyState(recipesContainer, [], 'recipes');
    }
}

// Create Recipe Card
function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
        <div class="recipe-image">
            <img src="${recipe.image || 'placeholder.jpg'}" alt="${recipe.title}">
        </div>
        <div class="recipe-content">
            <h3>${recipe.title}</h3>
            <p>${recipe.description}</p>
            <div class="recipe-meta">
                <span><i class="fas fa-clock"></i> ${recipe.cookingTime} mins</span>
                <span><i class="fas fa-utensils"></i> ${recipe.servings} servings</span>
            </div>
        </div>
    `;
    return card;
}

// Initialize
document.addEventListener('DOMContentLoaded', loadRecipes); 