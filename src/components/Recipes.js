console.log('Recipes.js script started.'); // Log script start
class Recipes {
    constructor() {
        // Initialize recipes from user data
        this.recipes = [];
        this.searchText = '';
        this.selectedRecipe = null;
        this.recipeToDelete = null;
        this.API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
        this.initEventListeners();
        this.loadUserRecipes();
        this.render();
        this.renderPantryModal();
        this.initPantryModalEventListener();
    }

    async loadUserRecipes() {
        console.log('Attempting to load user recipes from backend.'); // Log start of fetch
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.API_URL}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Check if the response is OK (status code 200-299)
            if (!response.ok) {
                const errorText = await response.text(); // Read response as text to see the error HTML
                console.error('API response not OK:', response.status, response.statusText, errorText);
                 // Attempt to parse JSON even if not OK, as some APIs might return error JSON
                let errorData = null;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    // If parsing fails, the response is likely HTML
                    console.error('Response is not valid JSON, likely HTML error page.');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const userData = await response.json();
            console.log('User data fetched successfully:', userData); // Log fetched user data
            this.recipes = userData.recipes || [];
            console.log('Recipes updated in local state:', this.recipes); // Log recipes array after update
            this.render();
        } catch (error) {
            console.error('Error loading user recipes:', error);
            this.recipes = [];
            this.render();
        }
    }

    generateUniqueId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    initEventListeners() {
        console.log('Initializing Recipes component event listeners.'); // Log initialization
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

         // Event listener for Generate from Pantry button
         const generateFromPantryBtn = document.getElementById('generate-from-pantry-btn');
         if (generateFromPantryBtn) {
             console.log('Attaching click listener to Generate from Pantry button.'); // Log attaching listener
             generateFromPantryBtn.addEventListener('click', () => {
                 this.handleGenerateFromPantry();
             });
         }
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
        // Determine the action (add or remove) based on the current favorite status
        const isCurrentlyFavorite = this.recipes.find(recipe => recipe._id === recipeToToggle._id)?.is_fav;
        const method = isCurrentlyFavorite ? 'DELETE' : 'POST'; // Although the backend uses PUT, we can conceptually think of it as add/remove
        const endpoint = `${this.API_URL}/users/favorites`;
        const recipeId = recipeToToggle._id;

        const token = localStorage.getItem('token');

        // Optimistically update the UI
        this.recipes = this.recipes.map(recipe => 
            recipe._id === recipeToToggle._id ? { ...recipe, is_fav: !isCurrentlyFavorite } : recipe
        );
        this.render();

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

        // Send the request to the backend
        fetch(endpoint, {
            method: 'PUT', // Use PUT as defined in the backend route
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ recipeId })
        })
        .then(async response => {
            if (!response.ok) {
                // Revert optimistic UI update on error
                this.recipes = this.recipes.map(recipe => 
                    recipe._id === recipeToToggle._id ? { ...recipe, is_fav: isCurrentlyFavorite } : recipe
                );
                this.render();
                const errorText = await response.text();
                console.error('Error updating favorites on backend:', response.status, response.statusText, errorText);
                this.showNotification(`Failed to ${isCurrentlyFavorite ? 'remove from' : 'add to'} favorites.`, 'error');
                return;
            }
            const result = await response.json();
            console.log('Backend response for favorite update:', result);
            // Show success notification based on backend response message
            this.showNotification(result.msg, 'success');
             
            // Re-fetch user recipes to ensure local state is in sync with backend after favorite update
            this.loadUserRecipes();

        })
        .catch(error => {
            // Revert optimistic UI update on network error
             this.recipes = this.recipes.map(recipe => 
                 recipe._id === recipeToToggle._id ? { ...recipe, is_fav: isCurrentlyFavorite } : recipe
             );
             this.render();
            console.error('Network error updating favorites:', error);
            this.showNotification('An error occurred while updating favorites.', 'error');
        });
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

        const titleInput = document.getElementById('recipe-name');
        const descriptionInput = document.getElementById('recipe-description');
        const ingredientsInput = document.getElementById('ingredients');
        const instructionsInput = document.getElementById('instructions');
        const cookingTimeInput = document.getElementById('cooking-time');
        const difficultyInput = document.getElementById('difficulty');
        const servingsInput = document.getElementById('servings');
        const categoryInput = document.getElementById('category');

        // Parse ingredients into the required format
        const ingredients = ingredientsInput.value.split('\n')
            .map(item => item.trim())
            .filter(item => item !== '')
            .map(item => {
                // Split by comma and ensure we have all three parts
                const parts = item.split(',').map(part => part.trim());
                if (parts.length !== 3) {
                    throw new Error(`Invalid ingredient format: ${item}. Please use format: name, quantity, unit`);
                }
                const [name, quantity, unit] = parts;
                if (!name || !quantity || !unit) {
                    throw new Error(`Missing required fields for ingredient: ${item}. Please provide name, quantity, and unit.`);
                }
                const parsedQuantity = parseFloat(quantity);
                if (isNaN(parsedQuantity) || parsedQuantity < 0) {
                    throw new Error(`Invalid quantity for ingredient: ${item}. Please provide a valid number.`);
                }
                return {
                    name: name,
                    quantity: parsedQuantity,
                    unit: unit
                };
            });

        try {
            const newRecipe = {
                title: titleInput.value.trim(),
                description: descriptionInput.value.trim(),
                ingredients: ingredients,
                instructions: instructionsInput.value.split('\n').map(step => step.trim()).filter(step => step !== ''),
                cookingTime: parseInt(cookingTimeInput.value) || 0,
                difficulty: difficultyInput.value,
                servings: parseInt(servingsInput.value) || 0,
                category: categoryInput.value
            };

            // Validate required fields
            if (!newRecipe.title || !newRecipe.description || !newRecipe.ingredients.length || 
                !newRecipe.instructions.length || !newRecipe.cookingTime || !newRecipe.difficulty || 
                !newRecipe.servings || !newRecipe.category) {
                this.showNotification('Please fill out all required fields', 'error');
                return;
            }

            // Validate description length
            if (newRecipe.description.length < 10) {
                this.showNotification('Description must be at least 10 characters long', 'error');
                return;
            }

            // Save the new recipe to the backend
            this.setLoading(true);
            const token = localStorage.getItem('token');

            console.log('Sending new recipe to backend:', newRecipe); // Add this line

            fetch(`${this.API_URL}/recipes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newRecipe)
            })
            .then(async response => {
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error saving manually created recipe to backend:', response.status, response.statusText, errorText);
                    this.showNotification(`Failed to save recipe: ${response.statusText}`, 'error');
                    return;
                }
                const savedRecipe = await response.json();
                console.log('Manually created recipe saved to backend:', savedRecipe);

                // Re-fetch user recipes to ensure local state is in sync with backend
                this.loadUserRecipes();

                const createModal = document.getElementById('create-recipe-modal');
                if(createModal) createModal.style.display = 'none';

                this.showNotification('Recipe created successfully!', 'success');
                form.reset();

            })
            .catch(error => {
                console.error('Network error saving manually created recipe:', error);
                this.showNotification('An error occurred while saving the recipe.', 'error');
            })
            .finally(() => {
                this.setLoading(false);
            });
        } catch (error) {
            this.showNotification(error.message, 'error');
            console.error('Error processing recipe:', error);
        }
    }

     // Assuming showNotification and setLoading are available globally or passed in constructor
     showNotification(message, type = 'info') {
        const notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.classList.add('notification-slide-in');
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        notificationContainer.appendChild(notification);

        // Add close button functionality
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.classList.add('notification-slide-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('notification-slide-out');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
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
        const description = recipe.description || 'A delicious recipe created with your selected ingredients.';

        return `
            <div class="recipe-card">
                <div class="recipe-card-header">
                    <h3>${recipe.name || 'Unnamed Recipe'}</h3>
                </div>
                <div class="recipe-card-body">
                    <p class="recipe-description">${description}</p>
                    <h4>Ingredients Preview:</h4>
                    <ul>
                        ${ingredients.slice(0, 3).map(ing => `<li>${ing}</li>`).join('')}
                        ${ingredients.length > 3 ? `<li>... and ${ingredients.length - 3} more</li>` : ''}
                    </ul>
                    <h4>Instructions Preview:</h4>
                    <p class="recipe-instructions-preview">${recipe.instructions.split('\n')[0]}...</p>
                </div>
                <div class="recipe-card-footer">
                    <div class="footer-actions">
                        <div class="icon-actions">
                            <button class="btn btn-danger" data-recipe-id="${recipe._id}">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="favorite-btn" data-recipe-id="${recipe._id}">
                                <i class="fas fa-heart${recipe.is_fav ? '' : '-o'}"></i>
                            </button>
                        </div>
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
        console.log('Rendering recipes grid with data:', this.recipes); // Log data being rendered
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

    renderPantryModal() {
       // Create the modal element if it doesn't exist
       if (!document.getElementById('pantry-selection-modal')) {
            const modal = document.createElement('div');
            modal.id = 'pantry-selection-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Select Ingredients from Pantry</h2>
                        <button class="close-modal" data-modal-id="pantry-selection-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                       <div id="pantry-ingredients-list"></div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary close-modal" data-modal-id="pantry-selection-modal">Cancel</button>
                        <button class="btn btn-primary" id="generate-recipe-from-pantry-btn">Generate Recipe</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
       }
    }

    handleGenerateFromPantry() {
        console.log('Generate from Pantry button clicked.'); // Log button click
        const pantryModal = document.getElementById('pantry-selection-modal');
        const pantryIngredientsListEl = pantryModal ? pantryModal.querySelector('#pantry-ingredients-list') : null;

        if (!pantryModal || !pantryIngredientsListEl) {
            console.error('Pantry selection modal or ingredients list element not found.');
            this.showNotification('Error opening pantry selection.', 'error');
            return;
        }

        // Clear previous items
        pantryIngredientsListEl.innerHTML = '';

        // Get pantry ingredients from localStorage (assuming Pantry component saves them here)
        const storedIngredients = localStorage.getItem('pantryIngredients');
        const pantryIngredients = storedIngredients ? JSON.parse(storedIngredients) : [];

        if (pantryIngredients.length === 0) {
            pantryIngredientsListEl.innerHTML = '<p class="empty-message">Your pantry is empty. Add items in the Pantry page first.</p>';
        } else {
            // Group ingredients by category (optional, but good for organization)
            const ingredientsByCategory = pantryIngredients.reduce((acc, ingredient) => {
                const category = ingredient.category || 'Other';
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(ingredient);
                return acc;
            }, {});

            // Render grouped ingredients
            const sortedCategories = Object.keys(ingredientsByCategory).sort(); // Sort categories alphabetically

            sortedCategories.forEach(category => {
                const categoryHtml = `
                    <div class="pantry-category-section">
                        <h4>${category}</h4>
                        <div class="pantry-ingredients-grid">
                            ${ingredientsByCategory[category].map(ingredient => `
                                <div class="pantry-ingredient-item">
                                    <input type="checkbox" id="pantry-item-${ingredient._id}" value="${ingredient.name}" data-id="${ingredient._id}">
                                    <label for="pantry-item-${ingredient._id}">
                                        <span class="ingredient-name">${ingredient.name}</span>
                                        <span class="ingredient-details">${ingredient.quantity} ${ingredient.unit || ''}</span>
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                pantryIngredientsListEl.innerHTML += categoryHtml;
            });
        }

        // Show the modal
        pantryModal.style.display = 'block';
    }

    initPantryModalEventListener() {
        console.log('Initializing pantry modal event listeners.'); // Log initialization
        // Use event delegation for the generate button
        document.addEventListener('click', (event) => {
            if (event.target && event.target.id === 'generate-recipe-from-pantry-btn') {
                console.log('Generate Recipe button clicked');
                this.handleGenerateRecipeFromSelected();
            }
        });
        
        // Also attach listener to close buttons for the modal
        document.querySelectorAll('#pantry-selection-modal .close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = document.getElementById('pantry-selection-modal');
                if (modal) modal.style.display = 'none';
                console.log('Pantry selection modal closed.'); // Log modal close
            });
        });
    }

    handleGenerateRecipeFromSelected() {
        console.log('Generate Recipe button in modal clicked.'); // Log button click
        // Get selected ingredients from the modal
        const selectedIngredients = [];
        const checkboxes = document.querySelectorAll('#pantry-ingredients-list input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            selectedIngredients.push(checkbox.value);
        });

        console.log('Selected ingredients:', selectedIngredients); // Log selected ingredients
        if (selectedIngredients.length === 0) {
            this.showNotification('Please select at least one ingredient.', 'warning');
            console.warn('No ingredients selected.'); // Log warning if no ingredients selected
            return;
        }

        // Format ingredients for the API prompt
        const ingredientsString = selectedIngredients.join(', ');
        const prompt = `Create a detailed recipe using these ingredients: ${ingredientsString}. Include:
        1. A creative name for the recipe
        2. A brief description
        3. A complete list of ingredients with quantities
        4. Step-by-step cooking instructions
        Make it easy to follow and delicious!`;

        this.setLoading(true); // Show loading indicator
        console.log('Calling SheCodes AI API with prompt:', prompt); // Log API prompt
        const apiKey = "16t1b3fa04b8866116ccceb0d2do3a04"; // SheCodes API Key
        const context = "You are a professional chef and recipe expert. Format the recipe in HTML with clear sections for name, description, ingredients, and step-by-step instructions. Make the instructions detailed and easy to follow. Sign the recipe at the end with '<strong>SheCodes AI</strong>' in bold";
        const apiUrl = `https://api.shecodes.io/ai/v1/generate?prompt=${encodeURIComponent(prompt)}&context=${encodeURIComponent(context)}&key=${apiKey}`;

        axios.get(apiUrl)
            .then(async response => {
                this.setLoading(false); // Hide loading indicator
                console.log('API Response:', response.data); // Log API response
                const generatedHtml = response.data.answer; // Assuming the recipe is in response.data.answer
                console.log('Parsing and saving recipe.'); // Log before parsing
                await this.parseAndSaveRecipe(generatedHtml);
            })
            .catch(error => {
                this.setLoading(false); // Hide loading indicator on error
                console.error('API Error:', error);
                this.showNotification('Failed to generate recipe. Please try again.', 'warning');
            });
    }

    async parseAndSaveRecipe(htmlContent) {
        console.log('Attempting to parse HTML content:', htmlContent); // Log the HTML content being parsed
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        // Extract details based on the expected HTML structure
        const nameElement = tempDiv.querySelector('h1, h2'); // Look for either h1 or h2 for recipe name
        const ingredientsList = tempDiv.querySelector('ul');
        const instructionsElement = tempDiv.querySelector('ol') || tempDiv.querySelector('p'); // Prefer ordered list for instructions

        const name = nameElement ? nameElement.textContent.trim() : 'Unnamed Recipe';
        // Try to find description - it's usually in a paragraph after the title
        const descriptionElement = nameElement ? nameElement.nextElementSibling : null;
        const description = descriptionElement && descriptionElement.tagName === 'P' ? 
            descriptionElement.textContent.trim() : 
            'A delicious recipe created with your selected ingredients.';

        const ingredients = [];
        let instructions = '';

        if (ingredientsList) {
            ingredientsList.querySelectorAll('li').forEach(li => {
                ingredients.push(li.textContent.trim());
            });
        }

        if (instructionsElement) {
            if (instructionsElement.tagName === 'OL') {
                const instructionSteps = [];
                instructionsElement.querySelectorAll('li').forEach(li => {
                    instructionSteps.push(li.textContent.trim());
                });
                instructions = instructionSteps.map((step, index) => `${index + 1}. ${step}`).join('\n'); // Number the steps
            } else {
                instructions = instructionsElement.textContent.trim();
            }
        }

        console.log('Parsed details - Name:', name, 'Ingredients:', ingredients, 'Instructions:', instructions); // Log parsed details
        
        // Basic validation
        if (!name || ingredients.length === 0 || !instructions) {
            console.error('Failed to parse recipe details from API response.', { name, ingredients, instructions });
            this.showNotification('Could not parse generated recipe. It might not be in the expected format.', 'error');
            return;
        }

        const newRecipe = {
            name: name,
            description: description,
            ingredients: ingredients,
            instructions: instructions,
        };

        console.log('New recipe object to save to backend:', newRecipe); // Log the new recipe object
        
        // Save the new recipe to the backend
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.API_URL}/recipes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newRecipe)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error saving recipe to backend:', response.status, response.statusText, errorText);
                this.showNotification(`Failed to save recipe: ${response.statusText}`, 'error');
                this.setLoading(false); // Hide loading on error
                return;
            }

            const savedRecipe = await response.json();
            console.log('Recipe saved to backend:', savedRecipe); // Log saved recipe from backend

            // Re-fetch user recipes to ensure local state is in sync with backend after saving
            console.log('Re-fetching all user recipes after saving.'); // Log before re-fetching
            this.loadUserRecipes();

            // No longer saving to local storage for the main recipe list
            // this.saveRecipesToLocalStorage();

            // The render call is handled by loadUserRecipes after fetching
            // console.log('Re-rendering recipes grid after saving.'); // Log before rendering
            // this.render(); // Re-render the recipes grid with the new recipe
            
            // Show success notification
            this.showNotification('Recipe generated and saved successfully!', 'success');

            // Close the modal and scroll to the new recipe
             const modal = document.getElementById('pantry-selection-modal');
             if (modal) { modal.style.display = 'none'; }

             // Note: Scrolling to the new recipe is now less straightforward
             // because loadUserRecipes fetches the whole list. We could potentially
             // find the savedRecipe in the re-fetched list after loadUserRecipes completes.
             // For now, the notification confirms saving.
             // setTimeout(() => {
             //     const newRecipeCard = document.querySelector(`[data-recipe-id="${savedRecipe._id}"]`);
             //     if (newRecipeCard) {
             //         newRecipeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
             //     }
             // }, 100);

        } catch (error) {
            console.error('Error saving recipe:', error);
            this.showNotification('An error occurred while saving the recipe.', 'error');
        } finally {
             this.setLoading(false); // Ensure loading is hidden
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