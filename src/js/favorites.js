import { handleEmptyState } from './utils.js';

// API Configuration
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
const token = localStorage.getItem('token');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

// DOM Elements
const favoritesContainer = document.getElementById('favorites-container');

// Load Favorites
async function loadFavorites() {
    try {
        const response = await axios.get(`${API_URL}/users/profile`, { headers });
        const user = response.data;

        // Check for empty state
        if (handleEmptyState(favoritesContainer, user.favorites, 'favorites')) {
            return;
        }

        // Display favorites
        favoritesContainer.innerHTML = '';
        user.favorites.forEach(recipe => {
            const recipeCard = createRecipeCard(recipe);
            favoritesContainer.appendChild(recipeCard);
        });
    } catch (error) {
        console.error('Error loading favorites:', error);
        handleEmptyState(favoritesContainer, [], 'favorites');
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
            <button class="btn-remove-favorite" data-id="${recipe._id}">
                <i class="fas fa-heart"></i> Remove from Favorites
            </button>
        </div>
    `;

    // Add event listener for remove button
    const removeBtn = card.querySelector('.btn-remove-favorite');
    removeBtn.addEventListener('click', () => removeFromFavorites(recipe._id));

    return card;
}

// Remove from Favorites
async function removeFromFavorites(recipeId) {
    try {
        await axios.delete(`${API_URL}/users/favorites/${recipeId}`, { headers });
        loadFavorites(); // Reload the list
    } catch (error) {
        console.error('Error removing from favorites:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', loadFavorites); 