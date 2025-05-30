class Recipes {
    constructor() {
        // Initialize recipes from localStorage or use mock data if none exists
        const storedRecipes = localStorage.getItem('allRecipes');
        if (storedRecipes) {
            // Ensure mock data has is_fav property if not present and recipes have _id
            this.recipes = JSON.parse(storedRecipes).map(recipe => ({
                _id: recipe._id || this.generateUniqueId(), // Ensure unique _id
                name: recipe.name,
                description: recipe.description,
                ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
                instructions: recipe.instructions,
                is_fav: recipe.is_fav !== undefined ? recipe.is_fav : false
            }));
        } else {
            // Mock data for development with unique _id and is_fav property
            this.recipes = [
                {
                    _id: this.generateUniqueId(),
                    name: 'Masala-Spiced Banana & Coriander Pizza',
                    description: 'An unusual but surprisingly delicious pizza.',
                    ingredients: ['1 Modern Medium Crust Pizza Base', '2 Bananas, sliced', '100g Coriander leaves, chopped', 'Masala spice blend', 'Cheese', 'Tomato base', 'Red onion', 'Chilli flakes'],
                    instructions: '1. Spread tomato base on pizza base.\n2. Sprinkle with cheese and masala spice.\n3. Arrange banana slices and chopped coriander.\n4. Add sliced red onion and chilli flakes.\n5. Bake in a hot oven until crust is golden and cheese is melted.',
                    is_fav: true
                },
                {
                    _id: this.generateUniqueId(),
                    name: 'Vegetable Stir Fry',
                    description: 'Quick and healthy vegetable stir fry with rice.',
                    ingredients: ['rice', 'broccoli', 'carrots', 'bell peppers', 'soy sauce', 'ginger', 'garlic', 'sesame oil'],
                    instructions: '1. Cook rice according to package instructions.\n2. Heat sesame oil in a wok or large pan.\n3. Add chopped ginger and garlic, stir-fry for 30 seconds.\n4. Add vegetables and stir-fry until tender-crisp.\n5. Pour in soy sauce and stir to combine.\n6. Serve over rice.',
                    is_fav: false
                },
                 {
                    _id: this.generateUniqueId(),
                    name: 'Simple Pasta with Tomato Sauce',
                    description: 'A quick and easy weeknight pasta dish.',
                    ingredients: ['pasta', 'canned crushed tomatoes', 'onion', 'garlic', 'olive oil', 'dried oregano', 'salt', 'pepper'],
                    instructions: '1. Cook pasta according to package directions.\n2. While pasta cooks, heat olive oil in a pan.\n3. Sauté chopped onion and garlic until softened.\n4. Add crushed tomatoes, oregano, salt, and pepper.\n5. Simmer sauce for 15-20 minutes.\n6. Drain pasta and add to the sauce. Toss to coat.\n7. Serve hot.',
                    is_fav: true
                }
            ];
             // Save initial mock data to localStorage if not already present
             localStorage.setItem('allRecipes', JSON.stringify(this.recipes));
        }


        this.searchText = '';
        this.selectedRecipe = null;
        this.recipeToDelete = null;
        this.initEventListeners();
        this.render();
    }

    generateUniqueId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    initEventListeners() {
        // Set up event listeners for search
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

        // Modal event listeners
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (event) => {
                const modalId = event.target.dataset.modalId;
                const modal = modalId ? document.getElementById(modalId) : event.target.closest('.modal');
                if(modal) modal.style.display = 'none';
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

        // Event listener for Create Recipe button
        const createRecipeBtn = document.getElementById('create-recipe-btn');
        if (createRecipeBtn) {
            createRecipeBtn.addEventListener('click', () => {
                const createModal = document.getElementById('create-recipe-modal');
                if (createModal) {
                    createModal.style.display = 'block';
                     // Clear the form when opening
                    const form = document.getElementById('create-recipe-form');
                    if (form) form.reset();
                }
            });
        }

        // Event listener for Create Recipe form submission
        const createRecipeForm = document.getElementById('create-recipe-form');
        if (createRecipeForm) {
            createRecipeForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.handleCreateRecipe();
            });
        }

         // Event delegation for recipe card buttons
         this.attachRecipeCardEventListeners();
    }

    saveRecipesToLocalStorage() {
        localStorage.setItem('allRecipes', JSON.stringify(this.recipes));
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

        if(favoriteBtn) {
            favoriteBtn.innerHTML = `<i class="fas fa-heart${recipe.is_fav ? '' : '-o'}"></i>`;
             // Re-attach event listener to the updated button to prevent duplicates
             const newFavoriteBtn = favoriteBtn.cloneNode(true);
             favoriteBtn.parentNode.replaceChild(newFavoriteBtn, favoriteBtn);
             newFavoriteBtn.addEventListener('click', () => this.handleToggleFavorite(recipe));
        }

        modal.style.display = 'block';
    }

    handleToggleFavorite(recipeToToggle) {
        this.recipes = this.recipes.map(recipe => 
            recipe._id === recipeToToggle._id ? { ...recipe, is_fav: !recipe.is_fav } : recipe
        );
        this.saveRecipesToLocalStorage();
        this.render();

        // Update modal if open and it's the same recipe
        const recipeModal = document.getElementById('recipe-modal');
         if (recipeModal && this.selectedRecipe && this.selectedRecipe._id === recipeToToggle._id) {
            const favoriteBtn = document.getElementById('modal-favorite-btn');
            if(favoriteBtn) {
                 favoriteBtn.innerHTML = `<i class="fas fa-heart${!recipeToToggle.is_fav ? '-o' : ''}"></i>`; // Note the logic reversal here
                  // Re-attach event listener to the updated button
                const newFavoriteBtn = favoriteBtn.cloneNode(true);
                favoriteBtn.parentNode.replaceChild(newFavoriteBtn, favoriteBtn);
                 newFavoriteBtn.addEventListener('click', () => this.handleToggleFavorite(recipeToToggle));
            }
        }

        this.showNotification(`Recipe ${!recipeToToggle.is_fav ? 'removed from' : 'added to'} favorites`, 'success');
    }

    handleEditRecipe(recipe) {
        // This functionality is not fully implemented in this vanilla JS version
        this.showNotification('Edit functionality not available in this demo', 'info');
         console.log('Attempting to edit recipe:', recipe);
        // If you were implementing edit modals, you would populate an edit form here
        // const editModal = document.getElementById('edit-modal');
        // if(editModal) editModal.style.display = 'block';
    }

    handleDeleteRecipe() {
        if (!this.recipeToDelete) return;

        this.recipes = this.recipes.filter(recipe => recipe._id !== this.recipeToDelete._id);
        this.saveRecipesToLocalStorage();
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

    handleCreateRecipe() {
        const form = document.getElementById('create-recipe-form');
        if (!form) return;

        const nameInput = document.getElementById('recipe-name');
        const descriptionInput = document.getElementById('recipe-description');
        const ingredientsInput = document.getElementById('ingredients');
        const instructionsInput = document.getElementById('instructions');

        const newRecipe = {
            _id: this.generateUniqueId(),
            name: nameInput.value.trim() || 'Unnamed Recipe',
            description: descriptionInput.value.trim(),
            ingredients: ingredientsInput.value.split('\n').map(item => item.trim()).filter(item => item !== ''),
            instructions: instructionsInput.value.trim(),
            is_fav: false // New recipes are not favorited by default
        };

        if (!newRecipe.name || !newRecipe.ingredients.length || !newRecipe.instructions) {
            this.showNotification('Please fill out all required fields (Name, Ingredients, Instructions)', 'error');
            return;
        }

        this.recipes.push(newRecipe);
        this.saveRecipesToLocalStorage();
        this.render();

        const createModal = document.getElementById('create-recipe-modal');
        if(createModal) createModal.style.display = 'none';

        this.showNotification('Recipe created successfully!', 'success');
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
                            <i class="fas fa-heart${recipe.is_fav ? '' : '-o'}"></i>
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

            // Find the recipe object for this card
            const recipeId = button.dataset.recipeId;
             const recipe = this.recipes.find(r => r._id === recipeId);
            if (!recipe) return; // Recipe not found (shouldn't happen if data-recipe-id is correct)

            if (button.classList.contains('favorite-btn')) {
                this.handleToggleFavorite(recipe);
            } else if (button.classList.contains('btn-danger')) {
                this.handleDeleteConfirmation(recipe);
            } else if (button.classList.contains('btn-primary')) {
                 this.handleViewRecipeDetails(recipe);
            }
             // Add other button handlers here (e.g., edit)
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
                    <h3>No recipes found</h3>
                    <p>${this.searchText ? 'Try a different search term' : 'Add some recipes to get started'}</p>
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
         window.recipes = new Recipes();
    }
}); 