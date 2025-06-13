import { showNotification, getApiUrl, getAuthHeaders } from './utils.js';
import { handleEmptyState } from './emptyState.js';

export class Favorites {
    constructor() {
        this.recipes = [];
        this.recipesList = document.getElementById('recipes-grid');
        this.searchInput = document.getElementById('recipe-search');
        this.modal = document.getElementById('recipe-modal');
        this.modalContent = this.modal ? this.modal.querySelector('.modal-body') : null;

        // Verify all required elements are present
        if (!this.recipesList) console.error('Recipes grid container not found');
        if (!this.modal) console.error('Recipe modal not found');
        if (!this.modalContent) console.error('Modal content container not found');

        this.setupEventListeners();
        this.loadFavorites();
    }

    setupEventListeners() {
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.filterRecipes());
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

    async loadFavorites() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showNotification('Please log in to view your favorites.', 'error');
                return;
            }

            const response = await fetch(`${getApiUrl()}/users/profile`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to load favorites');
            }

            const userData = await response.json();
            this.recipes = userData.favorites || [];
            
            if (this.recipes.length === 0) {
                this.recipesList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-heart"></i>
                        <h3>No Favorite Recipes</h3>
                        <p>You haven't added any recipes to your favorites yet.</p>
                        <a href="recipes.html" class="btn btn-primary">Browse Recipes</a>
                    </div>
                `;
                return;
            }

            this.displayRecipes();
        } catch (error) {
            console.error('Error loading favorites:', error);
            showNotification('Failed to load favorites. Please try again.', 'error');
        }
    }

    displayRecipes(recipesToShow = this.recipes) {
        if (!this.recipesList) {
            console.error('Recipes container not found');
            return;
        }

        this.recipesList.innerHTML = recipesToShow.map(recipe => this.createRecipeCard(recipe)).join('');
        this.attachRecipeCardEventListeners();
    }

    createRecipeCard(recipe) {
        const description = recipe.description || 'A delicious recipe created with your selected ingredients.';

        return `
            <div class="recipe-card" data-recipe-id="${recipe._id}">
                <div class="recipe-card-header">
                    <h3>${recipe.title || 'Unnamed Recipe'}</h3>
                </div>
                <div class="recipe-card-body">
                    <p class="recipe-description">${description}</p>
                </div>
                <div class="recipe-card-footer">
                    <div class="footer-actions">
                        <button class="btn btn-primary view-recipe-details" aria-label="View recipe details" data-recipe-id="${recipe._id}">
                            VIEW RECIPE
                        </button>
                        <div class="icon-actions">
                            <button class="btn btn-icon delete-recipe" aria-label="Delete recipe" data-recipe-id="${recipe._id}">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="favorite-btn" aria-label="Remove from favorites" data-recipe-id="${recipe._id}">
                                <i class="fas fa-heart"></i>
                    </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachRecipeCardEventListeners() {
        const recipesGrid = this.recipesList;
        if (!recipesGrid) {
            console.error('Recipes grid not found for event listeners');
            return;
        }

        const oldRecipesGrid = recipesGrid.cloneNode(true);
        recipesGrid.parentNode.replaceChild(oldRecipesGrid, recipesGrid);
        this.recipesList = oldRecipesGrid;

        this.recipesList.addEventListener('click', (event) => {
            const target = event.target;
            const button = target.closest('button');
            
            if (!button) return;

            const recipeCard = button.closest('.recipe-card');
            if (!recipeCard) return;

            const recipeId = button.dataset.recipeId;
            const recipe = this.recipes.find(r => r._id === recipeId);
            if (!recipe) return;

            if (button.classList.contains('favorite-btn')) {
                this.toggleFavorite(recipe.favoriteId);
            } else if (button.classList.contains('delete-recipe')) {
                this.deleteRecipe(recipe._id);
            } else if (button.classList.contains('view-recipe-details')) {
                this.viewRecipe(recipe._id);
            }
        });
    }

    async toggleFavorite(favoriteId) {
        try {
            const response = await fetch(`${getApiUrl()}/users/favorites/${favoriteId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to remove from favorites');
            }

            this.recipes = this.recipes.filter(f => f.favoriteId !== favoriteId);
            this.displayRecipes();
            showNotification('Recipe removed from favorites!', 'success');

            if (this.recipes.length === 0) {
                this.recipesList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-heart"></i>
                        <h3>No Favorite Recipes</h3>
                        <p>You haven't added any recipes to your favorites yet.</p>
                        <a href="recipes.html" class="btn btn-primary">Browse Recipes</a>
                    </div>
                `;
            }
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

            if (this.recipes.length === 0) {
                this.recipesList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-heart"></i>
                        <h3>No Favorite Recipes</h3>
                        <p>You haven't added any recipes to your favorites yet.</p>
                        <a href="recipes.html" class="btn btn-primary">Browse Recipes</a>
                    </div>
                `;
            }
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

        const ingredientsList = recipe.ingredients.map(ing => {
            const quantity = ing.quantity || '';
            const unit = ing.unit || '';
            const name = ing.name || '';
            return `<li>${quantity} ${unit} ${name}</li>`;
        }).join('');

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

        const modalName = document.getElementById('modal-recipe-name');
        const modalDescription = this.modal.querySelector('.recipe-description');
        const modalIngredients = this.modal.querySelector('.recipe-ingredients');
        const modalInstructions = this.modal.querySelector('.recipe-instructions');
        const favoriteBtn = document.getElementById('modal-favorite-btn');

        if (modalName) modalName.textContent = recipe.title;
        if (modalDescription) modalDescription.innerHTML = `<p>${recipe.description || 'No description available'}</p>`;
        if (modalIngredients) {
            modalIngredients.innerHTML = `<h4>Ingredients:</h4><ul>${ingredientsList}</ul>`;
        }
        if (modalInstructions) {
            modalInstructions.innerHTML = `<h4>Instructions:</h4><ol>${instructionsList}</ol>`;
        }

        if (favoriteBtn) {
            if (recipe.is_fav) {
                favoriteBtn.classList.add('active');
            } else {
                favoriteBtn.classList.remove('active');
            }
            favoriteBtn.dataset.recipeId = recipe._id;
        }

        this.modal.style.display = 'flex';
    }

    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    filterRecipes() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const filtered = this.recipes.filter(recipe =>
            (recipe.title && recipe.title.toLowerCase().includes(searchTerm)) ||
            (recipe.description && recipe.description.toLowerCase().includes(searchTerm))
            );
        this.displayRecipes(filtered);
    }
}

// Make favorites instance globally available
window.favorites = new Favorites(); 