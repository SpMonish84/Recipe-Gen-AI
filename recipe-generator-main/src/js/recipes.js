import { showNotification, getApiUrl, getAuthHeaders } from './utils.js';
import { handleEmptyState } from './emptyState.js';

export class Recipes {
    constructor() {
        // Wait for DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeElements();
            this.setupEventListeners();
            this.loadRecipes();
        });
    }

    initializeElements() {
        this.recipesList = document.getElementById('recipes-grid');
        this.searchInput = document.getElementById('recipe-search');
        this.filterSelect = document.getElementById('filter-recipes');
        this.modal = document.getElementById('recipe-modal');
        this.modalContent = this.modal ? this.modal.querySelector('.modal-body') : null;

        // Verify all required elements are present
        if (!this.recipesList) console.error('Recipes grid container not found');
        if (!this.modal) console.error('Recipe modal not found');
        if (!this.modalContent) console.error('Modal content container not found');
    }

    setupEventListeners() {
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.filterRecipes());
        }

        // Filter functionality
        if (this.filterSelect) {
            this.filterSelect.addEventListener('change', () => this.filterRecipes());
        }

        // Modal close button
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal());
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    async loadRecipes() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showNotification('Please log in to view your recipes.', 'error');
                return;
            }

            const response = await fetch(`${getApiUrl()}/recipes`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to load recipes');
            }

            this.recipes = await response.json();
            this.displayRecipes();
        } catch (error) {
            console.error('Error loading recipes:', error);
            showNotification('Failed to load recipes. Please try again.', 'error');
        }
    }

    displayRecipes(recipesToShow = this.recipes) {
        if (!this.recipesList) {
            console.error('Recipes container not found');
            return;
        }

        if (handleEmptyState(this.recipesList, recipesToShow, 'recipes')) {
            return;
        }

        this.recipesList.innerHTML = recipesToShow.map(recipe => this.createRecipeCard(recipe)).join('');
    }

    createRecipeCard(recipe) {
        return `
            <div class="recipe-card" data-id="${recipe._id}">
                <div class="recipe-card-header">
                    <h3>${recipe.title}</h3>
                    <div class="recipe-actions">
                        <button class="favorite-btn ${recipe.isFavorite ? 'active' : ''}" onclick="recipes.toggleFavorite('${recipe._id}')">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="delete-btn" onclick="recipes.deleteRecipe('${recipe._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="recipe-card-body">
                    <p>${recipe.description}</p>
                </div>
                <div class="recipe-card-footer">
                    <button class="view-recipe-btn" onclick="recipes.viewRecipe('${recipe._id}')">
                        View Recipe
                    </button>
                </div>
            </div>
        `;
    }

    async toggleFavorite(recipeId) {
        try {
            const recipe = this.recipes.find(r => r._id === recipeId);
            if (!recipe) return;

            // Update the recipe's favorite status using the correct endpoint
            const response = await fetch(`${getApiUrl()}/users/favorites`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ recipeId })
            });

            if (!response.ok) {
                throw new Error('Failed to update favorite status');
            }

            const result = await response.json();
            
            // Update the recipe in our local array
            recipe.isFavorite = !recipe.isFavorite;
            this.displayRecipes();

            // If we're on the favorites page, reload it
            if (window.location.pathname.includes('favorites.html')) {
                window.location.reload();
            }

            showNotification(result.msg, 'success');
        } catch (error) {
            console.error('Error toggling favorite:', error);
            showNotification('Failed to update favorite status. Please try again.', 'error');
        }
    }

    async deleteRecipe(recipeId) {
        if (!confirm('Are you sure you want to delete this recipe?')) {
            return;
        }

        try {
            const response = await fetch(`${getApiUrl()}/recipes/${recipeId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to delete recipe');
            }

            this.recipes = this.recipes.filter(r => r._id !== recipeId);
            this.displayRecipes();
            showNotification('Recipe deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting recipe:', error);
            showNotification('Failed to delete recipe. Please try again.', 'error');
        }
    }

    async viewRecipe(recipeId) {
        try {
            const response = await fetch(`${getApiUrl()}/recipes/${recipeId}`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to load recipe details');
            }

            const recipe = await response.json();
            this.showRecipeModal(recipe);
        } catch (error) {
            console.error('Error loading recipe details:', error);
            showNotification('Failed to load recipe details. Please try again.', 'error');
        }
    }

    showRecipeModal(recipe) {
        if (!this.modal || !this.modalContent) {
            console.error('Modal or modal content not found');
            return;
        }

        // Format ingredients list
        const ingredientsList = recipe.ingredients.map(ing => {
            const quantity = ing.quantity || '';
            const unit = ing.unit || '';
            const name = ing.name || '';
            return `<li>${quantity} ${unit} ${name}</li>`;
        }).join('');

        // Format instructions list
        let instructionsList = '';
        if (Array.isArray(recipe.instructions)) {
            instructionsList = recipe.instructions
                .filter(instruction => instruction && instruction.trim())
                .map(instruction => `<li>${instruction.trim()}</li>`)
                .join('');
        } else if (typeof recipe.instructions === 'string') {
            instructionsList = recipe.instructions
                .split('\n')
                .filter(instruction => instruction.trim())
                .map(instruction => `<li>${instruction.trim()}</li>`)
                .join('');
        } else {
            instructionsList = '<li>No instructions available</li>';
        }

        // Update modal content
        const modalName = document.getElementById('modal-recipe-name');
        const modalDescription = this.modal.querySelector('.recipe-description');
        const modalIngredients = this.modal.querySelector('.recipe-ingredients');
        const modalInstructions = this.modal.querySelector('.recipe-instructions');
        const favoriteBtn = document.getElementById('modal-favorite-btn');

        if (modalName) modalName.textContent = recipe.title;
        if (modalDescription) modalDescription.innerHTML = `<p>${recipe.description || 'No description available'}</p>`;
        if (modalIngredients) {
            modalIngredients.innerHTML = `
                <h3>Ingredients</h3>
                <ul class="ingredients-list">
                    ${ingredientsList || '<li>No ingredients available</li>'}
                </ul>
            `;
        }
        if (modalInstructions) {
            modalInstructions.innerHTML = `
                <h3>Instructions</h3>
                <ol class="instructions-list">
                    ${instructionsList}
                </ol>
            `;
        }
        if (favoriteBtn) {
            favoriteBtn.className = `favorite-btn ${recipe.isFavorite ? 'active' : ''}`;
            favoriteBtn.onclick = () => this.toggleFavorite(recipe._id);
        }

        // Show the modal
        this.modal.style.display = 'block';
    }

    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    filterRecipes() {
        const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase() : '';
        const filterValue = this.filterSelect ? this.filterSelect.value : 'all';

        let filteredRecipes = this.recipes;

        // Apply search filter
        if (searchTerm) {
            filteredRecipes = filteredRecipes.filter(recipe =>
                recipe.title.toLowerCase().includes(searchTerm) ||
                recipe.description.toLowerCase().includes(searchTerm)
            );
        }

        // Apply category filter
        if (filterValue !== 'all') {
            switch (filterValue) {
                case 'favorites':
                    filteredRecipes = filteredRecipes.filter(recipe => recipe.isFavorite);
                    break;
                case 'recent':
                    filteredRecipes = [...filteredRecipes].sort((a, b) =>
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    break;
            }
        }

        this.displayRecipes(filteredRecipes);
    }

    // Convert fraction string to decimal number
    convertFractionToDecimal(fraction) {
        if (typeof fraction === 'number') return fraction;
        
        // Handle empty or invalid input
        if (!fraction || typeof fraction !== 'string') return 0;
        
        // Remove any whitespace
        fraction = fraction.trim();
        
        // If it's already a decimal number, return it
        if (!isNaN(parseFloat(fraction))) return parseFloat(fraction);
        
        // Handle fractions like "1/2", "3/4", etc.
        const parts = fraction.split('/');
        if (parts.length === 2) {
            const numerator = parseFloat(parts[0]);
            const denominator = parseFloat(parts[1]);
            if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
                return numerator / denominator;
            }
        }
        
        return 0;
    }

    // Parse ingredients from text
    parseIngredients(ingredientsText) {
        if (!ingredientsText) return [];
        
        return ingredientsText.split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .map(line => {
                const [name, quantity, unit] = line.split(',').map(part => part.trim());
                return {
                    name: name || '',
                    quantity: this.convertFractionToDecimal(quantity),
                    unit: unit || ''
                };
            });
    }

    // Create new recipe
    async createRecipe(recipeData) {
        try {
            // Parse ingredients
            const ingredients = this.parseIngredients(recipeData.ingredients);
            
            const recipe = {
                title: recipeData.title,
                description: recipeData.description,
                ingredients: ingredients,
                instructions: recipeData.instructions.split('\n').filter(step => step.trim()),
                cookingTime: parseInt(recipeData.cookingTime) || 0,
                difficulty: recipeData.difficulty,
                servings: parseInt(recipeData.servings) || 1,
                category: recipeData.category
            };

            const response = await fetch(`${getApiUrl()}/recipes`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(recipe)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create recipe');
            }

            showNotification('Recipe created successfully!', 'success');
            await this.loadRecipes();
            return true;
        } catch (error) {
            console.error('Error creating recipe:', error);
            showNotification(error.message || 'Failed to create recipe. Please try again.', 'error');
            return false;
        }
    }
}

// Make recipes instance globally available
window.recipes = new Recipes(); 