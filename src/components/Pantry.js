class Pantry {
    constructor() {
        this.ingredients = [];
        this.searchText = '';
        this.container = document.getElementById('pantry-container');
        this.addIngredientDialog = null;

        this.categories = ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Poultry', 'Fish', 'Grains', 'Spices', 'Herbs', 'Oils', 'Sauces', 'Other'];

        this.units = [
            'pieces',
            'kg',
            'g',
            'l',
            'ml',
            'cups',
            'tablespoons',
            'teaspoons',
            'pinch',
            'packets'
        ];

        this.API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

        this.loadUserPantry();
        this.render();
        this.initEventListeners();
    }

    async loadUserPantry() {
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
            this.ingredients = userData.pantry || [];
            this.render();
        } catch (error) {
            console.error('Error loading user pantry:', error);
            this.ingredients = [];
            this.render();
        }
    }

    generateUniqueId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    saveIngredientsToLocalStorage() {
        localStorage.setItem('pantryIngredients', JSON.stringify(this.ingredients));
    }

    initEventListeners() {
         if (!this.container) return; // Ensure container exists

        // Search input event listener
        const searchInput = this.container.querySelector('#pantry-search');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchText = e.target.value;
                this.renderIngredientsList(); // Only re-render list on search
            });
        }

        // Clear search button event listener
        const clearSearchButton = this.container.querySelector('#clear-search');
        if(clearSearchButton) {
            clearSearchButton.addEventListener('click', () => {
                const searchInput = this.container.querySelector('#pantry-search');
                 if(searchInput) searchInput.value = '';
                this.searchText = '';
                this.renderIngredientsList();
            });
        }

         // Add Ingredient button event listener (opens dialog)
         const addIngredientButton = this.container.querySelector('#add-ingredient-btn');
         if(addIngredientButton) {
             addIngredientButton.addEventListener('click', () => this.openAddIngredientDialog());
         }

        // Event delegation for delete buttons on the ingredients list
        this.container.addEventListener('click', (event) => {
            const target = event.target;
            const deleteButton = target.closest('.delete-item');

            if(deleteButton) {
                const ingredientId = deleteButton.dataset.ingredientId;
                this.handleDeleteIngredient(ingredientId);
            }
        });
    }

    openAddIngredientDialog() {
         // Render the dialog structure if it doesn't exist
         if (!this.addIngredientDialog) {
            this.addIngredientDialog = document.createElement('div');
            this.addIngredientDialog.className = 'modal'; // Use existing modal styles
            this.addIngredientDialog.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Add New Ingredient</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="new-ingredient-name">Name</label>
                            <input type="text" id="new-ingredient-name" required>
                        </div>
                        <div class="form-group">
                            <label for="new-ingredient-quantity">Quantity</label>
                            <input type="number" id="new-ingredient-quantity" required min="0">
                        </div>
                        <div class="form-group">
                             <label for="new-ingredient-unit">Unit</label>
                             <select id="new-ingredient-unit" required>
                                 ${this.units.map(unit => `<option value="${unit}">${unit}</option>`).join('')}
                             </select>
                        </div>
                        <div class="form-group">
                             <label for="new-ingredient-expiry">Expiry Date</label>
                             <input type="date" id="new-ingredient-expiry">
                         </div>
                        <div class="form-group">
                            <label for="new-ingredient-category">Category</label>
                            <select id="new-ingredient-category" required>
                                ${this.categories.map(category => `<option value="${category}">${category}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary close-modal">Cancel</button>
                        <button class="btn btn-primary" id="save-ingredient-btn">Add</button>
                    </div>
                </div>
            `;
            document.body.appendChild(this.addIngredientDialog);

             // Attach dialog specific event listeners
            this.addIngredientDialog.querySelector('.close-modal').addEventListener('click', () => this.closeAddIngredientDialog());
             this.addIngredientDialog.querySelector('#save-ingredient-btn').addEventListener('click', () => this.handleAddIngredient());
         }

        // Show the dialog
        this.addIngredientDialog.style.display = 'block';
    }

    closeAddIngredientDialog() {
        if(this.addIngredientDialog) {
             this.addIngredientDialog.style.display = 'none';
             // Clear form fields when closing
             const nameInput = this.addIngredientDialog.querySelector('#new-ingredient-name');
             const quantityInput = this.addIngredientDialog.querySelector('#new-ingredient-quantity');
             const unitSelect = this.addIngredientDialog.querySelector('#new-ingredient-unit');
             const expiryInput = this.addIngredientDialog.querySelector('#new-ingredient-expiry');
             const categorySelect = this.addIngredientDialog.querySelector('#new-ingredient-category');

             if(nameInput) nameInput.value = '';
             if(quantityInput) quantityInput.value = '';
             if(unitSelect) unitSelect.value = this.units[0] || ''; // Reset to first unit
             if(expiryInput) expiryInput.value = '';
             if(categorySelect) categorySelect.value = this.categories[0] || ''; // Reset to first category
        }
    }

    handleAddIngredient() {
         if (!this.addIngredientDialog) return;

        const nameInput = this.addIngredientDialog.querySelector('#new-ingredient-name');
        const quantityInput = this.addIngredientDialog.querySelector('#new-ingredient-quantity');
        const unitSelect = this.addIngredientDialog.querySelector('#new-ingredient-unit');
        const expiryInput = this.addIngredientDialog.querySelector('#new-ingredient-expiry');
        const categorySelect = this.addIngredientDialog.querySelector('#new-ingredient-category');

        const name = nameInput ? nameInput.value.trim() : '';
        const quantity = quantityInput ? parseInt(quantityInput.value, 10) : NaN;
        const unit = unitSelect ? unitSelect.value : '';
        const expiry_date = expiryInput ? expiryInput.value : ''; // YYYY-MM-DD string
        const category = categorySelect ? categorySelect.value : '';

        if (!name || isNaN(quantity) || quantity < 0 || !unit || !category) {
            this.showNotification('Please fill in all required fields correctly', 'warning');
            return;
        }

        const newIngredient = {
            _id: this.generateUniqueId(),
            name: name,
            quantity: quantity,
            unit: unit,
            expiry_date: expiry_date, // Store as string
            category: category
        };

        this.ingredients.push(newIngredient);
        this.saveIngredientsToLocalStorage();
        this.renderIngredientsList(); // Re-render the list
        this.closeAddIngredientDialog(); // Close the dialog
        this.showNotification(`${name} added successfully to ${category} category`, 'success');
    }

    handleDeleteIngredient(id) {
        this.ingredients = this.ingredients.filter(ingredient => ingredient._id !== id);
        this.saveIngredientsToLocalStorage();
        this.renderIngredientsList(); // Re-render the list
        this.showNotification('Ingredient deleted successfully', 'success');
    }

    renderIngredientsList() {
        const pantryCategoriesEl = this.container.querySelector('#pantry-categories');
        if (!pantryCategoriesEl) {
            console.error('Pantry categories container not found!');
            return;
        }

        const filteredIngredients = this.ingredients.filter(ingredient =>
            ingredient.name.toLowerCase().includes(this.searchText.toLowerCase())
        );

        // Group ingredients by category
        const ingredientsByCategory = filteredIngredients.reduce((acc, ingredient) => {
            const category = ingredient.category || 'Other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(ingredient);
            return acc;
        }, {});

        // Render ingredients by category
        let html = '';
        if (Object.keys(ingredientsByCategory).length === 0) {
            html = `
                <div class="empty-message">
                    ${this.searchText ? 'No matching ingredients found.' : 'No ingredients added yet.'}
                </div>
            `;
        } else {
            for (const category of this.categories) { // Render in a predefined order
                if (ingredientsByCategory[category]) {
                    html += `
                        <div class="pantry-category">
                            <h4>${category}</h4>
                            <ul>
                                ${ingredientsByCategory[category].map(ingredient => {
                                    const daysLeft = ingredient.expiry_date ? Math.ceil((new Date(ingredient.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                                    const expiryText = daysLeft !== null ? `${daysLeft} days left` : 'No expiry date';
                                    const expiryClass = daysLeft !== null && daysLeft <= 7 ? 'chip-danger' : (daysLeft !== null && daysLeft > 7 ? 'chip-success' : '');
                                    return `
                                        <li class="ingredient-item">
                                            <span>${ingredient.name} (${ingredient.quantity} ${ingredient.unit})</span>
                                            <div class="ingredient-actions">
                                                 <span class="chip ${expiryClass}">${expiryText}</span>
                                                 <button class="delete-item" data-ingredient-id="${ingredient._id}">
                                                     <i class="fas fa-trash"></i>
                                                 </button>
                                            </div>
                                        </li>
                                    `;
                                }).join('')}
                            </ul>
                        </div>
                    `;
                }
            }
            // Add 'Other' category if it has ingredients and wasn't explicitly listed
            if (ingredientsByCategory['Other'] && !this.categories.includes('Other')) {
                 html += `
                     <div class="pantry-category">
                         <h4>Other</h4>
                         <ul>
                             ${ingredientsByCategory['Other'].map(ingredient => {
                                 const daysLeft = ingredient.expiry_date ? Math.ceil((new Date(ingredient.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                                 const expiryText = daysLeft !== null ? `${daysLeft} days left` : 'No expiry date';
                                 const expiryClass = daysLeft !== null && daysLeft <= 7 ? 'chip-danger' : (daysLeft !== null && daysLeft > 7 ? 'chip-success' : '');
                                 return `
                                     <li class="ingredient-item">
                                         <span>${ingredient.name} (${ingredient.quantity} ${ingredient.unit})</span>
                                         <div class="ingredient-actions">
                                              <span class="chip ${expiryClass}">${expiryText}</span>
                                              <button class="delete-item" data-ingredient-id="${ingredient._id}">
                                                  <i class="fas fa-trash"></i>
                                              </button>
                                         </div>
                                     </li>
                                 `;
                            }).join('')}
                         </ul>
                     </div>
                 `;
            }
        }

        pantryCategoriesEl.innerHTML = html;
    }

    render() {
        if (!this.container) {
            console.error('Pantry container not found');
            return;
        }

        // Render the main structure of the ingredients page
        this.container.innerHTML = `
            <div class="pantry-content">
                <div class="search-bar">
                    <i class="fas fa-search"></i>
                    <input type="text" id="pantry-search" placeholder="Search pantry items...">
                    <button class="clear-search" id="clear-search"><i class="fas fa-times"></i></button>
                </div>

                <button class="btn btn-primary" id="add-ingredient-btn">
                    <i class="fas fa-plus"></i> Add Pantry Item
                </button>

                <div id="pantry-categories"></div>
            </div>
        `;

        // Initial render of the pantry items by category
        this.renderIngredientsList(); // This method will now render categories
    }

    showNotification(message, type = 'info') {
        const notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
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
            notification.remove();
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize the component when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
     // Ensure the element for the component exists before initializing
    if (document.getElementById('pantry-container')) {
        window.pantry = new Pantry();
    }
}); 