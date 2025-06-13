console.log('Recipes.js script started.'); // Log script start
class Recipes {
    constructor() {
        this.container = null;
        this.recipes = [];
        this.searchText = '';
        this.selectedRecipe = null;
        this.recipeToDelete = null;
        this.API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
        this.isInitialized = false;
        this.init();
    }

    async init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            await this.initialize();
        }
    }

    async initialize() {
        try {
            console.log('Initializing Recipes component...');
            this.container = document.querySelector('.recipes-container');
            
            if (!this.container) {
                console.error('Recipes container not found, retrying in 100ms...');
                // Retry after a short delay
                setTimeout(() => this.initialize(), 100);
                return;
            }

            // Initialize modal elements
            this.modal = document.getElementById('recipe-modal');
            if (this.modal) {
                this.modalContent = this.modal.querySelector('.modal-content');
                if (!this.modalContent) {
                    console.error('Recipe modal content not found within #recipe-modal');
                } else {
                    console.log('Recipe modal and content found.');
                }
            } else {
                console.error('#recipe-modal element not found.');
            }

            console.log('Recipes container found, proceeding with initialization');
        this.initEventListeners();
            await this.loadUserRecipes();
        this.render();
            this.isInitialized = true;
            console.log('Recipes component initialized successfully');
        } catch (error) {
            console.error('Error initializing Recipes component:', error);
        }
    }

    createContainer() {
        // Create the container if it doesn't exist
        this.container = document.createElement('div');
        this.container.id = 'recipes-container';
        this.container.className = 'recipes-container';
        
        // Create the header section
        const header = document.createElement('div');
        header.className = 'recipes-header';
        header.innerHTML = `
            <h1>My Recipes</h1>
            <div class="recipes-actions">
                <div class="search-container">
                    <input type="text" id="recipe-search" placeholder="Search recipes...">
                </div>
                <button id="create-recipe-btn" class="btn btn-primary">Create New Recipe</button>
                <button id="generate-from-pantry-btn" class="btn btn-secondary">Generate from Pantry</button>
            </div>
        `;
        
        // Create the recipes grid
        const grid = document.createElement('div');
        grid.id = 'recipes-grid';
        grid.className = 'recipes-grid';
        
        // Append elements to container
        this.container.appendChild(header);
        this.container.appendChild(grid);
        
        // Append container to the main content area
        const mainContent = document.querySelector('main') || document.body;
        mainContent.appendChild(this.container);
        
        console.log('Created recipes container and structure');
    }

    async loadUserRecipes() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                return;
            }

            console.log('Loading user recipes...');
            const response = await fetch(`${this.API_URL}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load user recipes');
            }

            const userData = await response.json();
            console.log('User data received:', userData);

            if (userData && Array.isArray(userData.recipes)) {
                // Map over recipes and set is_fav based on user's favorites
                const favoriteRecipeIds = new Set(userData.favorites ? userData.favorites.map(fav => fav._id || fav) : []);
                console.log('Favorite Recipe IDs from user data:', Array.from(favoriteRecipeIds)); // Log the set
                this.recipes = userData.recipes.map(recipe => ({
                    ...recipe,
                    is_fav: favoriteRecipeIds.has(recipe._id)
                }));
                console.log('Recipes loaded from server (with favorite status):', this.recipes);
            } else {
                console.warn('No recipes found in user data or data format incorrect');
                this.recipes = [];
            }

            // Re-render the recipes list
            this.render();
        } catch (error) {
            console.error('Error loading user recipes:', error);
            this.showNotification('Failed to load recipes. Please try again.', 'error');
            this.recipes = [];
        }
    }

    generateUniqueId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    initEventListeners() {
        console.log('Initializing event listeners...');
        
        // Create New Recipe button
        const createRecipeBtn = document.getElementById('create-recipe-btn');
        if (createRecipeBtn) {
            console.log('Create Recipe button found, adding click listener');
            createRecipeBtn.addEventListener('click', () => {
                console.log('Create Recipe button clicked');
                this.handleCreateRecipe();
            });
        } else {
            console.error('Create Recipe button not found');
        }

        // Generate from Pantry button
        const generateFromPantryBtn = document.getElementById('generate-from-pantry-btn');
        if (generateFromPantryBtn) {
            console.log('Generate from Pantry button found, adding click listener');
            generateFromPantryBtn.addEventListener('click', () => {
                console.log('Generate from Pantry button clicked');
                this.handleGenerateFromPantry();
            });
        } else {
            console.error('Generate from Pantry button not found');
        }

        // Search functionality
        const searchInput = document.getElementById('recipe-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchText = e.target.value;
                this.render();
            });
        }

        // Clear search button
        const clearSearchBtn = document.getElementById('clear-search');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                this.searchText = '';
                this.render();
                }
            });
        }

        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
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

    saveRecipesToLocalStorage() {
        localStorage.setItem('allRecipes', JSON.stringify(this.recipes));
    }

    showRecipeModal(recipe) {
        const modal = document.getElementById('recipe-modal');
        if (!modal) {
            console.error('#recipe-modal element not found.');
            return;
        }

        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent) {
            console.error('Modal content not found within #recipe-modal');
            return;
        }

        // Format ingredients list
        const ingredientsList = (Array.isArray(recipe.ingredients) ? recipe.ingredients : []).map(ing => {
            // Check if ing is an object with name, quantity, unit, otherwise treat as plain string
            if (typeof ing === 'object' && ing !== null && ing.name) {
                const quantity = ing.quantity ? `${ing.quantity} ` : '';
                const unit = ing.unit ? `${ing.unit} ` : '';
                return `<li>${quantity}${unit}${ing.name}</li>`;
            } else {
                return `<li>${ing}</li>`; // Fallback for simple string ingredients (e.g., from AI response if not fully parsed)
            }
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
        const modalDescription = modal.querySelector('.recipe-description');
        const modalIngredients = modal.querySelector('.recipe-ingredients');
        const modalInstructions = modal.querySelector('.recipe-instructions');
        const favoriteBtn = document.getElementById('modal-favorite-btn');

        if(modalName) modalName.textContent = recipe.title || 'Unnamed Recipe'; // Use recipe.title here
        if(modalDescription) modalDescription.innerHTML = `<h3>Description</h3><p>${recipe.description || 'No description available.'}</p>`;

        if(modalIngredients) {
             modalIngredients.innerHTML = `
                <h3>Ingredients</h3>
                <ul>
                    ${ingredientsList || '<li>No ingredients available</li>'}
                </ul>
            `;
        }

        if(modalInstructions) {
            // Ensure instructions are an array before mapping
            const instructionsToDisplay = Array.isArray(recipe.instructions) ? recipe.instructions : 
                                          (typeof recipe.instructions === 'string' ? recipe.instructions.split('\n') : []);
            modalInstructions.innerHTML = `
                <h3>Instructions</h3>
                <ol>
                    ${instructionsToDisplay.filter(instr => instr.trim() !== '').map(instr => `<li>${instr}</li>`).join('')}
                </ol>
            `;
        }

        if(favoriteBtn) {
            favoriteBtn.innerHTML = `<i class="fas fa-heart${recipe.is_fav ? '' : '-o'}"></i>`;
             // Re-attach event listener to the updated button to prevent duplicates
             const newFavoriteBtn = favoriteBtn.cloneNode(true);
             favoriteBtn.parentNode.replaceChild(newFavoriteBtn, favoriteBtn);
             newFavoriteBtn.addEventListener('click', () => this.handleToggleFavorite(recipe));
        }

        modal.style.display = 'flex'; // Use flex for centering
    }

    async handleToggleFavorite(recipeToToggle) {
        console.log('handleToggleFavorite called for recipe:', recipeToToggle);
        try {
        const isCurrentlyFavorite = this.recipes.find(recipe => recipe._id === recipeToToggle._id)?.is_fav;
            console.log('Current favorite status (is_fav) before toggle:', isCurrentlyFavorite);

            const recipeId = recipeToToggle._id;
        const token = localStorage.getItem('token');

            if (!token) {
                this.showNotification('Please log in to add/remove favorites.', 'error');
                return;
            }

        // Optimistically update the UI
        this.recipes = this.recipes.map(recipe => 
            recipe._id === recipeToToggle._id ? { ...recipe, is_fav: !isCurrentlyFavorite } : recipe
        );
        this.render();
            console.log('Recipes array after optimistic UI update:', this.recipes);

        // Update modal if open and it's the same recipe
        const recipeModal = document.getElementById('recipe-modal');
         if (recipeModal && this.selectedRecipe && this.selectedRecipe._id === recipeToToggle._id) {
            const favoriteBtn = document.getElementById('modal-favorite-btn');
            if(favoriteBtn) {
                 favoriteBtn.innerHTML = `<i class="fas fa-heart${!isCurrentlyFavorite ? '' : '-o'}"></i>`;
                  // Re-attach event listener to the updated button
                const newFavoriteBtn = favoriteBtn.cloneNode(true);
                favoriteBtn.parentNode.replaceChild(newFavoriteBtn, favoriteBtn);
                 newFavoriteBtn.addEventListener('click', () => this.handleToggleFavorite(recipeToToggle));
            }
        }

            console.log(`Sending PUT request to ${this.API_URL}/users/favorites with recipeId: ${recipeId}, action: ${isCurrentlyFavorite ? 'remove' : 'add'}`);
            const response = await fetch(`${this.API_URL}/users/favorites`, {
                method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ recipeId })
            });

            console.log('Backend response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                // Revert optimistic UI update on error
                this.recipes = this.recipes.map(recipe => 
                    recipe._id === recipeToToggle._id ? { ...recipe, is_fav: isCurrentlyFavorite } : recipe
                );
                this.render();
                console.error('Error updating favorites on backend:', errorData);
                throw new Error(errorData.message || `Failed to ${isCurrentlyFavorite ? 'remove from' : 'add to'} favorites.`);
            }

            const result = await response.json();
            console.log('Backend response for favorite update:', result);
            this.showNotification(result.msg || `Recipe ${isCurrentlyFavorite ? 'removed from' : 'added to'} favorites successfully!`, 'success');
             
            // Re-fetch user recipes to ensure local state is in sync with backend after favorite update
            await this.loadUserRecipes();
            console.log('Recipes array after final loadUserRecipes call:', this.recipes); // Log after final refresh

        } catch (error) {
            console.error('Error updating favorites:', error);
            this.showNotification(error.message || 'An error occurred while updating favorites.', 'error');
        }
    }

    handleEditRecipe(recipe) {
        // This functionality is not fully implemented in this vanilla JS version
        this.showNotification('Edit functionality not available in this demo', 'info');
         console.log('Attempting to edit recipe:', recipe);
        // If you were implementing edit modals, you would populate an edit form here
        // const editModal = document.getElementById('edit-modal');
        // if(editModal) editModal.style.display = 'block';
    }

    async handleDeleteRecipe() {
        if (!this.recipeToDelete) return;

        const recipeIdToDelete = this.recipeToDelete._id;
        const token = localStorage.getItem('token');

        if (!token) {
            this.showNotification('Please log in to delete recipes.', 'error');
            return;
        }

        try {
            // Optimistically update the UI
            this.recipes = this.recipes.filter(recipe => recipe._id !== recipeIdToDelete);
            this.saveRecipesToLocalStorage(); // Update local storage immediately
            this.render();

            // Close the delete confirmation modal
        const deleteModal = document.getElementById('delete-modal');
        if(deleteModal) deleteModal.style.display = 'none';

         // Close details modal if the deleted recipe was open
         const recipeModal = document.getElementById('recipe-modal');
            if(recipeModal && this.selectedRecipe && this.selectedRecipe._id === recipeIdToDelete) {
             recipeModal.style.display = 'none';
             this.selectedRecipe = null;
         }

            console.log(`Sending DELETE request for recipe ID: ${recipeIdToDelete}`);
            const response = await fetch(`${this.API_URL}/recipes/${recipeIdToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Revert optimistic UI update on error
                await this.loadUserRecipes(); // Re-fetch all recipes to restore state
                throw new Error(errorData.message || 'Failed to delete recipe on server');
            }

            console.log('Recipe deleted successfully from backend');
            this.showNotification('Recipe deleted successfully!', 'success');

            this.recipeToDelete = null; // Clear the recipe to delete
            await this.loadUserRecipes(); // Re-fetch recipes to ensure consistency, even after optimistic update

        } catch (error) {
            console.error('Error deleting recipe:', error);
            this.showNotification(error.message || 'An error occurred while deleting the recipe.', 'error');
            await this.loadUserRecipes(); // Always re-fetch on error to ensure consistency
        }
    }

    handleDeleteConfirmation(recipe) {
        this.recipeToDelete = recipe;
        const deleteModal = document.getElementById('delete-modal');
         if(deleteModal) deleteModal.style.display = 'block';
    }

    handleCreateRecipe() {
        const modal = document.getElementById('create-recipe-modal');
        if (modal) {
            modal.style.display = 'flex';
            const form = modal.querySelector('#create-recipe-form');
            if (form) {
                form.reset(); // Reset form when modal is opened
                // Add a submit listener to the form to handle data extraction before calling handleCreateRecipeSubmit
                form.onsubmit = async (e) => {
                    e.preventDefault();
                    try {
                        const formData = new FormData(form);
                        const name = formData.get('name');
                        const description = formData.get('description');
                        const ingredientsText = formData.get('ingredients') || '';
                        const instructionsText = formData.get('instructions') || '';
                        const cookingTime = parseInt(formData.get('cooking-time')) || 0;
                        const difficulty = formData.get('difficulty') || 'Medium';
                        const servings = parseInt(formData.get('servings')) || 1;
                        const category = formData.get('category') || 'Other';

                        // Parse ingredients flexibly
                        const ingredients = ingredientsText
                            .split('\n')
                            .map(line => line.trim())
                            .filter(line => line)
                            .map(line => {
                                const parts = line.split(',').map(item => item.trim());
                                let name = '';
                                let quantity = 0;
                                let unit = 'item';

                                if (parts.length > 0) {
                                    name = parts[0];
                                }
                                if (parts.length > 1 && parseFloat(parts[1])) {
                                    quantity = parseFloat(parts[1]);
                                }
                                if (parts.length > 2) {
                                    unit = parts[2];
                                }

                                if (!name) {
                                    console.warn(`Ingredient line without a name, defaulting to "${line}"`);
                                    name = line; // Fallback to full line if name is missing
                                }

                return {
                                    name,
                                    quantity,
                                    unit
                };
            });

                        // Parse instructions
                        const instructions = instructionsText
                            .split('\n')
                            .map(line => line.trim())
                            .filter(line => line);

                        const recipeData = {
                            title: name,
                            description,
                            ingredients,
                            instructions,
                            cookingTime,
                            difficulty,
                            servings,
                            category
                        };

                        await this.handleCreateRecipeSubmit(recipeData); // Call the refactored method

                    } catch (error) {
                        console.error('Error during manual recipe creation form submission:', error);
                        this.showNotification(error.message || 'Failed to create recipe. Please check your input.', 'error');
                    }
                };
            }
        }
    }

    async handleCreateRecipeSubmit(recipeData) {
        console.log('handleCreateRecipeSubmit called with recipeData:', recipeData);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Validate required fields
            if (!recipeData.title || recipeData.title.trim() === '') {
                throw new Error('Recipe Title is required');
            }
            if (!recipeData.description || recipeData.description.trim() === '') {
                throw new Error('Recipe Description is required');
            }

            if (!recipeData.ingredients || recipeData.ingredients.length === 0) {
                throw new Error('At least one ingredient is required. Format: name, quantity, unit (e.g., "Flour, 2, cups")');
            }

            if (!recipeData.instructions || recipeData.instructions.length === 0) {
                throw new Error('At least one instruction is required');
            }

            console.log('Sending recipe data:', recipeData);

            const response = await fetch(`${this.API_URL}/recipes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(recipeData)
            });

                if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create recipe');
            }

            const newRecipe = await response.json();
            console.log('Recipe created successfully:', newRecipe);

            // Add the new recipe to the local array
            this.recipes = [...this.recipes, newRecipe];
            
            // Re-render the recipes list
            this.render();
            
            // Close the modal (assuming it's always called from a modal context)
            const modal = document.getElementById('create-recipe-modal');
            if (modal) {
                modal.style.display = 'none';
                const form = modal.querySelector('#create-recipe-form');
                if(form) form.reset(); // Reset the form after successful submission
            }

                this.showNotification('Recipe created successfully!', 'success');

            // Refresh the recipes list from the server
            await this.loadUserRecipes();
        } catch (error) {
            console.error('Error creating recipe:', error);
            this.showNotification(error.message || 'Failed to create recipe. Please try again.', 'error');
        }
    }

     showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
        `;

        container.appendChild(notification);
            setTimeout(() => {
                notification.remove();
        }, 3000);
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
                            <button class="favorite-btn" aria-label="Toggle favorite" data-recipe-id="${recipe._id}">
                                <i class="fas fa-heart${recipe.is_fav ? '' : '-o'}"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

     attachRecipeCardEventListeners() {
        const recipesGrid = this.container.querySelector('#recipes-grid');
        if (!recipesGrid) {
            console.error('Recipes grid not found for event listeners');
            return;
        }

        // Remove any existing listeners to prevent duplicates
        const oldRecipesGrid = recipesGrid.cloneNode(true);
        recipesGrid.parentNode.replaceChild(oldRecipesGrid, recipesGrid);
        this.container.querySelector('#recipes-grid').replaceWith(oldRecipesGrid); // Update the reference properly

        // Re-select the recipesGrid after replacement
        this.recipesGrid = this.container.querySelector('#recipes-grid');

        if (!this.recipesGrid) {
            console.error('Recipes grid not found after replacement');
            return;
        }

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
            } else if (button.classList.contains('delete-recipe')) {
                this.handleDeleteConfirmation(recipe);
            } else if (button.classList.contains('view-recipe-details')) {
                this.showRecipeModal(recipe);
            }
        });
     }

    render() {
        if (!this.container) {
            console.error('Container not found for rendering');
            return;
        }

        const recipesGrid = this.container.querySelector('#recipes-grid');
        if (!recipesGrid) {
            console.error('Recipes grid not found');
            return;
        }

        console.log('Rendering recipes:', this.recipes);

        // Filter recipes based on search text
        const filteredRecipes = this.recipes.filter(recipe => {
            if (!recipe || typeof recipe !== 'object') return false;
            const name = recipe.name || '';
            const description = recipe.description || '';
            const searchLower = this.searchText.toLowerCase();
            return name.toLowerCase().includes(searchLower) || 
                   description.toLowerCase().includes(searchLower);
        });

        if (filteredRecipes.length === 0) {
            recipesGrid.innerHTML = `
                <div class="empty-state">
                    <p>${this.searchText ? 'No recipes match your search.' : 'No recipes yet. Create your first recipe!'}</p>
                </div>
            `;
            return;
        }

        // Render recipes
        recipesGrid.innerHTML = filteredRecipes.map(recipe => {
            if (!recipe || !recipe._id) return '';
            return this.createRecipeCard(recipe);
        }).join('');

        // Attach event listeners to the recipe cards
        this.attachRecipeCardEventListeners();
    }

    handleGenerateFromPantry() {
        console.log('Opening pantry selection modal');
        // Remove existing modal if it exists
        const existingModal = document.getElementById('pantry-selection-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create new modal
            const modal = document.createElement('div');
            modal.id = 'pantry-selection-modal';
            modal.className = 'modal';
        modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Select Ingredients from Pantry</h2>
                    <button class="close-modal" aria-label="Close modal">&times;</button>
                    </div>
                    <div class="modal-body">
                    <div id="pantry-ingredients-list" class="pantry-ingredients-grid">
                        <p>Loading pantry ingredients...</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancel-pantry-selection">Cancel</button>
                        <button class="btn btn-primary" id="generate-recipe-btn">Generate Recipe</button>
                    </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

        // Load pantry ingredients
        const pantryIngredients = JSON.parse(localStorage.getItem('pantry_ingredients') || '[]');
        const ingredientsList = modal.querySelector('#pantry-ingredients-list');
        
        if (pantryIngredients.length === 0) {
            ingredientsList.innerHTML = '<p>No ingredients in your pantry. Add some ingredients first!</p>';
            return;
        }

        // Group ingredients by category
            const ingredientsByCategory = pantryIngredients.reduce((acc, ingredient) => {
                const category = ingredient.category || 'Other';
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(ingredient);
                return acc;
            }, {});

        // Create HTML for ingredients
        let ingredientsHtml = '';
        Object.entries(ingredientsByCategory).forEach(([category, ingredients]) => {
            ingredientsHtml += `
                <div class="pantry-category">
                    <h3>${category}</h3>
                    <div class="pantry-items">
                        ${ingredients.map(ingredient => `
                            <div class="pantry-item">
                                <input type="checkbox" id="pantry-${ingredient._id}" value="${ingredient._id}">
                                <label for="pantry-${ingredient._id}">
                                    ${ingredient.name} (${ingredient.quantity} ${ingredient.unit || ''})
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
        });

        ingredientsList.innerHTML = ingredientsHtml;

        // Add event listeners
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        const cancelBtn = modal.querySelector('#cancel-pantry-selection');
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });

        const generateBtn = modal.querySelector('#generate-recipe-btn');
        generateBtn.addEventListener('click', () => {
            this.handleGenerateRecipeFromSelected();
            modal.remove();
        });
    }

    async handleGenerateRecipeFromSelected() {
        try {
            const selectedIngredients = Array.from(document.querySelectorAll('#pantry-ingredients-list input[type="checkbox"]:checked'))
                .map(checkbox => {
                    const label = checkbox.nextElementSibling;
                    return label.textContent.trim();
                });

        if (selectedIngredients.length === 0) {
                this.showNotification('Please select at least one ingredient', 'warning');
            return;
        }

            // Updated prompt to encourage structured HTML output
            const prompt = `Create a recipe using these ingredients: ${selectedIngredients.join(', ')}. Provide the recipe title in an <h1> tag, a description in a <p> tag, ingredients in a <ul>, and instructions in an <ol>.`;
            const apiKey = "16t1b3fa04b8866116ccceb0d2do3a04";
            const context = "You are an expert at recipes. Your mission is to generate a short and easy recipe in basic HTML. Make sure to follow user instructions. Sign the recipe at the end with '<strong>SheCodes AI</strong>' in bold";

            const response = await fetch(`https://api.shecodes.io/ai/v1/generate?prompt=${encodeURIComponent(prompt)}&context=${encodeURIComponent(context)}&key=${apiKey}`);
            
            if (!response.ok) {
                throw new Error('Failed to generate recipe');
            }

            const data = await response.json();
            const recipeHtml = data.answer;
            console.log('AI Generated Recipe HTML:', recipeHtml); // Log AI response

            // Parse the generated HTML to extract recipe details
            const parser = new DOMParser();
            const doc = parser.parseFromString(recipeHtml, 'text/html');

            const generatedTitleElement = doc.querySelector('h1, h2, h3'); // Look for the first heading
            const generatedTitle = generatedTitleElement ? generatedTitleElement.textContent.trim() : 'Unnamed AI Recipe';

            const generatedDescriptionElement = doc.querySelector('p');
            const generatedDescription = generatedDescriptionElement ? generatedDescriptionElement.textContent.trim() : 'A delicious recipe generated with AI assistance.';

            const generatedIngredients = Array.from(doc.querySelectorAll('ul li')).map(li => {
                const text = li.textContent.trim();
                // Attempt to parse "quantity unit name" or "name, quantity, unit" or just "name"
                // This is a more robust parsing attempt based on common recipe formats
                const match = text.match(/^(\d+\.?\d*)\s*([a-zA-Z]*)\s*(.*)$/); // Matches: quantity unit name
                if (match && match[1] && match[3]) {
                    return {
                        name: match[3],
                        quantity: parseFloat(match[1]) || 0,
                        unit: match[2] || 'item'
                    };
            } else {
                    // Fallback for "name, quantity, unit" or just "name"
                    const parts = text.split(',').map(item => item.trim());
                    if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
                         return {
                             name: parts[0],
                             quantity: parseFloat(parts[1]) || 0,
                             unit: parts[2]
                         };
                    } else if (parts.length >= 2 && parts[0] && parts[1]) {
                        // Assuming "name, quantity" or "quantity name"
                        const maybeQuantity = parseFloat(parts[0]);
                        if (!isNaN(maybeQuantity) && parts[1]) { // If first part is a number, assume "quantity name"
                             return {
                                 name: parts[1],
                                 quantity: maybeQuantity,
                                 unit: 'item' // Default unit
                             };
                        } else { // Assume "name, quantity"
                             return {
                                 name: parts[0],
                                 quantity: parseFloat(parts[1]) || 0,
                                 unit: 'item' // Default unit
                             };
                        }
                    }
                    return { name: text, quantity: 0, unit: 'item' }; // Default for simple names or unparsable lines
                }
            });

            const generatedInstructions = Array.from(doc.querySelectorAll('ol li')).map(li => li.textContent.trim());

            // Create modal to display generated recipe
            const modal = document.createElement('div');
            modal.id = 'generated-recipe-modal';
            modal.className = 'modal';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${generatedTitle}</h2>  <!-- Use the extracted title here -->
                        <button class="close-modal" aria-label="Close modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="generated-recipe-content">
                            ${recipeHtml} <!-- Display the original AI HTML for now, it should contain the structured data -->
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" id="save-generated-recipe">Save Recipe</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Add event listeners
            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });

            const saveBtn = modal.querySelector('#save-generated-recipe');
            saveBtn.addEventListener('click', () => {
                // Use the already parsed details
                const recipeToSave = {
                    title: generatedTitle,
                    description: generatedDescription,
                    ingredients: generatedIngredients,
                    instructions: generatedInstructions,
                    cookingTime: 30, // Default value
                    difficulty: 'Medium', // Default value
                    servings: 4, // Default value
                    category: 'Other' // Default value
                };

                console.log('Recipe to save (generated from AI parse):', recipeToSave); // Add this log

                this.handleCreateRecipeSubmit(recipeToSave); // Call the refactored method

                modal.remove();
            });

        } catch (error) {
            console.error('Error generating recipe:', error);
            this.showNotification('Failed to generate recipe. Please try again.', 'error');
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

// Export the Recipes class
export default Recipes; 