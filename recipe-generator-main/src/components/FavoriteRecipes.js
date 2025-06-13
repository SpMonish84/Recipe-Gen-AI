class FavoriteRecipes {
    constructor() {
        this.recipes = [];
        this.searchText = '';
        this.selectedRecipe = null;
        this.recipeToDelete = null;
        this.initEventListeners();
        this.loadUserFavorites();
        this.render();
    }

    async loadUserFavorites() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const userData = await response.json();
            this.recipes = userData.favorites || [];
            this.render();
        } catch (error) {
            console.error('Error loading user favorites:', error);
            this.recipes = [];
            this.render();
        }
    }

    initEventListeners() {
        // Set up event listeners
        const searchInput = document.getElementById('recipe-search');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchText = e.target.value;
                this.render();
            });
        }

        const clearSearchButton = document.getElementById('clear-search');
        if(clearSearchButton) {
            clearSearchButton.addEventListener('click', () => {
                const searchInput = document.getElementById('recipe-search');
                if(searchInput) {
                    searchInput.value = '';
                }
                this.searchText = '';
                this.render();
            });
        }

        // Modal event listeners (assuming these modals exist in favorites.html)
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const recipeModal = document.getElementById('recipe-modal');
                if(recipeModal) recipeModal.style.display = 'none';
                const deleteModal = document.getElementById('delete-modal');
                if(deleteModal) deleteModal.style.display = 'none';
            });
        });

        const cancelDeleteButton = document.getElementById('cancel-delete');
        if(cancelDeleteButton) {
            cancelDeleteButton.addEventListener('click', () => {
                const deleteModal = document.getElementById('delete-modal');
                 if(deleteModal) deleteModal.style.display = 'none';
            });
        }

        const confirmDeleteButton = document.getElementById('confirm-delete');
        if(confirmDeleteButton) {
            confirmDeleteButton.addEventListener('click', () => {
                this.handleDeleteRecipe();
            });
        }

        // Event delegation for recipe card buttons
         this.attachRecipeCardEventListeners();
    }

    saveAllRecipesToLocalStorage(allRecipes) {
         localStorage.setItem('allRecipes', JSON.stringify(allRecipes));
    }

    handleViewRecipeDetails(recipe) {
        this.selectedRecipe = recipe;
        const modal = document.getElementById('recipe-modal');
        if (!modal) return;

        const modalName = document.getElementById('modal-recipe-name');
        const modalDescription = modal.querySelector('.recipe-description');
        const modalIngredients = modal.querySelector('.recipe-ingredients');
        const modalInstructions = modal.querySelector('.recipe-instructions');
        const favoriteBtn = document.getElementById('modal-favorite-btn');

        if(modalName) modalName.textContent = recipe.name || 'Unnamed Recipe';
        if(modalDescription) modalDescription.innerHTML = `<h3>Description</h3><p>${recipe.description || 'No description available.'}</p>`;

        if(modalIngredients) {
             modalIngredients.innerHTML = `
                <h3>Ingredients</h3>
                <ul>
                    ${(Array.isArray(recipe.ingredients) ? recipe.ingredients : []).map(ing => `<li>${ing}</li>`).join('')}
                </ul>
            `;
        }

        if(modalInstructions) {
            modalInstructions.innerHTML = `
                <h3>Instructions</h3>
                <p>${recipe.instructions || 'No instructions available.'}</p>
            `;
        }

        // Favorite button in modal should only remove from favorites on this page
        if(favoriteBtn) {
             favoriteBtn.innerHTML = `<i class="fas fa-heart"></i>`; // Always filled heart in favorites modal
             // Re-attach event listener to the updated button
             const newFavoriteBtn = favoriteBtn.cloneNode(true);
             favoriteBtn.parentNode.replaceChild(newFavoriteBtn, favoriteBtn);
             newFavoriteBtn.addEventListener('click', () => this.handleRemoveFavorite(recipe));
        }

        modal.style.display = 'block';
    }

    handleRemoveFavorite(recipeToRemove) {
        // Update the recipe in localStorage to set is_fav to false
        const allRecipes = JSON.parse(localStorage.getItem('allRecipes')) || [];
        const updatedAllRecipes = allRecipes.map(recipe => 
            recipe._id === recipeToRemove._id ? { ...recipe, is_fav: false } : recipe
        );
        this.saveAllRecipesToLocalStorage(updatedAllRecipes);

        // Update the local state for the favorites page
        this.recipes = this.recipes.filter(recipe => recipe._id !== recipeToRemove._id);
        this.render();

        const recipeModal = document.getElementById('recipe-modal');
        if(recipeModal) recipeModal.style.display = 'none';

        this.showNotification('Recipe removed from favorites', 'success');
    }

    handleDeleteRecipe() {
        if (!this.recipeToDelete) return;

        // Remove the recipe from all recipes in localStorage
        const allRecipes = JSON.parse(localStorage.getItem('allRecipes')) || [];
        const updatedAllRecipes = allRecipes.filter(recipe => recipe._id !== this.recipeToDelete._id);
        this.saveAllRecipesToLocalStorage(updatedAllRecipes);

        // Remove the recipe from the local state for the favorites page
        this.recipes = this.recipes.filter(recipe => recipe._id !== this.recipeToDelete._id);

        const deleteModal = document.getElementById('delete-modal');
        if(deleteModal) deleteModal.style.display = 'none';
        this.render();
        this.showNotification('Recipe deleted successfully', 'success');
        this.recipeToDelete = null; // Clear the recipe to delete

         // Close details modal if the deleted recipe was open
         const recipeModal = document.getElementById('recipe-modal');
         if(recipeModal && this.selectedRecipe && this.selectedRecipe._id === this.recipeToDelete?._id) {
             recipeModal.style.display = 'none';
             this.selectedRecipe = null;
         }
    }

    handleDeleteConfirmation(recipe) {
        this.recipeToDelete = recipe;
        const deleteModal = document.getElementById('delete-modal');
        if(deleteModal) deleteModal.style.display = 'block';
    }

     // Assuming showNotification and setLoading are available globally or passed in constructor
     showNotification(message, type) {
         // Placeholder for global showNotification function
         if (typeof window.showNotification === 'function') {
             window.showNotification(message, type);
         } else {
             console.warn('showNotification function not found', message);
         }
     }

     setLoading(isLoading) {
          // Placeholder for global setLoading function if needed for async operations
          if (typeof window.setLoading === 'function') {
             window.setLoading(isLoading, 'recipes-container'); // Pass container ID if needed
          } else {
              console.warn('setLoading function not found', isLoading);
          }
     }

    createRecipeCard(recipe) {
        // Ensure recipe has ingredients and instructions, provide defaults if not
        const ingredients = recipe.ingredients && Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

        return `
            <div class="recipe-card">
                <div class="recipe-card-header">
                    <h3>${recipe.name || 'Unnamed Recipe'}</h3>
                </div>
                <div class="recipe-card-body">
                    <h4>Ingredients Preview:</h4>
                    <ul>
                        ${ingredients.slice(0, 3).map(ing => `<li>${ing}</li>`).join('')}
                        ${ingredients.length > 3 ? `<li>... and ${ingredients.length - 3} more</li>` : ''}
                    </ul>
                </div>
                <div class="recipe-card-footer">
                    <div class="footer-actions">
                        <button class="btn btn-danger" data-recipe-id="${recipe._id}">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="favorite-btn" data-recipe-id="${recipe._id}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="btn btn-primary" data-recipe-id="${recipe._id}">
                            VIEW FULL RECIPE
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    attachRecipeCardEventListeners() {
        const recipesGrid = document.getElementById('recipes-grid');
        if (!recipesGrid) return;

        // Remove any existing listeners to prevent duplicates
        const oldRecipesGrid = recipesGrid.cloneNode(true);
        recipesGrid.parentNode.replaceChild(oldRecipesGrid, recipesGrid);
        this.recipesGrid = oldRecipesGrid; // Update the reference

        this.recipesGrid.addEventListener('click', (event) => {
            const target = event.target;
            const button = target.closest('button');
            
            if (!button) return; // Click was not on a button

            const recipeCard = button.closest('.recipe-card');
            if (!recipeCard) return; // Button is not within a recipe card

            // Find the recipe object for this card in the *currently displayed favorites*
            const recipeId = button.dataset.recipeId;
            const recipe = this.recipes.find(r => r._id === recipeId);
            if (!recipe) return; // Recipe not found

            if (button.classList.contains('favorite-btn')) {
                this.handleRemoveFavorite(recipe); // On favorites page, favorite button removes
            } else if (button.classList.contains('btn-danger')) {
                this.handleDeleteConfirmation(recipe);
            } else if (button.classList.contains('btn-primary')) {
                 this.handleViewRecipeDetails(recipe);
            }
        });
    }

    render() {
        const filteredRecipes = this.recipes.filter(recipe =>
            recipe.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
             (Array.isArray(recipe.ingredients) && recipe.ingredients.some(ing => ing.toLowerCase().includes(this.searchText.toLowerCase())))
        );

        const recipesGrid = document.getElementById('recipes-grid');

         if (!recipesGrid) {
            console.error('#recipes-grid element not found');
            return;
        }

        if (filteredRecipes.length > 0) {
            recipesGrid.innerHTML = filteredRecipes.map(recipe => this.createRecipeCard(recipe)).join('');
             // Re-attach event listeners after rendering new HTML
            this.attachRecipeCardEventListeners();
        } else {
            recipesGrid.innerHTML = `
                <div class="no-recipes">
                    <h3>No favorite recipes found</h3>
                    <p>${this.searchText ? 'Try a different search term' : 'Add some recipes to your favorites to see them here'}</p>
                </div>
            `;
             // Ensure no old listeners are active if grid is empty
            this.attachRecipeCardEventListeners(); // Re-attaching to an empty grid is safe
        }
    }
}

// Initialize the component when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
     // Ensure the element for the component exists before initializing
    if (document.getElementById('recipes-grid')) {
        window.favoriteRecipes = new FavoriteRecipes();
    }
}); 