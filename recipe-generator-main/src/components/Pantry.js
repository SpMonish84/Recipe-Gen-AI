import { showNotification, getApiUrl, getAuthHeaders } from '../js/utils.js';

export class Pantry {
    constructor() {
        console.log('Pantry constructor called');
        this.ingredients = [];
        this.searchText = '';
        this.container = document.getElementById('pantry-container');
        this.addIngredientDialog = null;
        this.isInitialized = false;

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

        this.API_URL = getApiUrl();

        console.log('Container element:', this.container);
        this.initialize();
    }

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            await this.loadUserPantry();
            this.render();
            this.isInitialized = true;
            console.log('Pantry component initialized successfully');
        } catch (error) {
            console.error('Error initializing Pantry component:', error);
        }
    }

    async loadUserPantry() {
        try {
            console.log('Loading user pantry...');
            const response = await fetch(`${this.API_URL}/users/pantry`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to load pantry items');
            }

            const data = await response.json();
            console.log('loadUserPantry: Raw data from backend', data);

            if (data.pantry && Array.isArray(data.pantry)) {
                this.ingredients = data.pantry;
                this.saveIngredientsToLocalStorage();
                console.log('loadUserPantry: Final ingredients array after loading', this.ingredients);
            } else {
                console.warn('No items found in pantry data or invalid format');
                this.ingredients = [];
            }
        } catch (error) {
            console.error('Error loading pantry:', error);
            showNotification('Failed to load pantry items. Please try again.', 'error');
            // Try to load from localStorage as fallback
            this.loadFromLocalStorage();
        }
    }

    loadFromLocalStorage() {
        try {
            const savedIngredients = localStorage.getItem('pantry_ingredients');
            if (savedIngredients) {
                this.ingredients = JSON.parse(savedIngredients);
                console.log('loadFromLocalStorage: Final ingredients array after loading', this.ingredients);
            } else {
                console.log('No saved ingredients found in localStorage');
                this.ingredients = [];
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.ingredients = [];
        }
    }

    generateUniqueId() {
        return 'ing_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    saveIngredientsToLocalStorage() {
        try {
            localStorage.setItem('pantry_ingredients', JSON.stringify(this.ingredients));
            console.log('saveIngredientsToLocalStorage: Ingredients saved to localStorage', this.ingredients);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    initEventListeners() {
        console.log('Initializing event listeners');
        
        // Search input and clear button
        const searchInput = this.container.querySelector('#pantry-search');
        const clearSearchBtn = this.container.querySelector('#clear-pantry-search');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchText = e.target.value;
                this.renderIngredientsList(); // Re-render when search input changes
                // Show/hide clear button based on input value
                if (clearSearchBtn) {
                    clearSearchBtn.style.display = this.searchText ? 'block' : 'none';
                }
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    this.searchText = '';
                    this.renderIngredientsList(); // Re-render after clearing search
                    clearSearchBtn.style.display = 'none'; // Hide clear button
                }
            });
             // Initialize visibility based on current search text
             clearSearchBtn.style.display = this.searchText ? 'block' : 'none';
        }

        // Add Pantry Item button
        const addPantryItemBtn = this.container.querySelector('#add-pantry-item');
        if (addPantryItemBtn) {
            console.log('Add button found, attaching click listener');
            addPantryItemBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openAddIngredientDialog();
            });
        }

        // Delete buttons
        this.container.querySelectorAll('.delete-item').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const ingredientId = button.dataset.ingredientId;
                if (ingredientId) {
                    this.handleDeleteIngredient(ingredientId);
                }
            });
        });
    }

    openAddIngredientDialog() {
        console.log('Opening add ingredient dialog');
        
        // Remove existing dialog if it exists
        if (this.addIngredientDialog) {
            this.addIngredientDialog.remove();
            this.addIngredientDialog = null;
        }

        // Create new dialog
        console.log('Creating new dialog');
        this.addIngredientDialog = document.createElement('div');
        this.addIngredientDialog.className = 'modal';
        this.addIngredientDialog.style.display = 'none';
        this.addIngredientDialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Add New Ingredient</h2>
                    <button type="button" class="close-modal" aria-label="Close modal" title="Close modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="add-ingredient-form">
                        <div class="form-group">
                            <label for="new-ingredient-name">Name</label>
                            <input type="text" id="new-ingredient-name" name="name" required placeholder="Enter ingredient name">
                        </div>
                        <div class="form-group">
                            <label for="new-ingredient-quantity">Quantity</label>
                            <input type="number" id="new-ingredient-quantity" name="quantity" required min="0" placeholder="Enter quantity">
                        </div>
                        <div class="form-group">
                            <label for="new-ingredient-unit">Unit</label>
                            <select id="new-ingredient-unit" name="unit" required>
                                <option value="">Select a unit</option>
                                ${this.units.map(unit => `<option value="${unit}">${unit}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="new-ingredient-expiry">Expiry Date</label>
                            <input type="date" id="new-ingredient-expiry" name="expiry_date">
                        </div>
                        <div class="form-group">
                            <label for="new-ingredient-category">Category</label>
                            <select id="new-ingredient-category" name="category" required>
                                <option value="">Select a category</option>
                                ${this.categories.map(category => `<option value="${category}">${category}</option>`).join('')}
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary close-modal" aria-label="Cancel adding ingredient" title="Cancel adding ingredient">Cancel</button>
                    <button type="button" class="btn btn-primary" id="save-ingredient-btn" aria-label="Add new ingredient" title="Add new ingredient">Add</button>
                </div>
            </div>
        `;

        // Append to body
        document.body.appendChild(this.addIngredientDialog);

        // Attach dialog specific event listeners
        const closeButtons = this.addIngredientDialog.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.closeAddIngredientDialog());
        });

        const saveButton = this.addIngredientDialog.querySelector('#save-ingredient-btn');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                const form = this.addIngredientDialog.querySelector('#add-ingredient-form');
                if (form.checkValidity()) {
                    this.handleAddIngredient();
                } else {
                    form.reportValidity();
                }
            });
        }

        // Add click outside to close
        this.addIngredientDialog.addEventListener('click', (e) => {
            if (e.target === this.addIngredientDialog) {
                this.closeAddIngredientDialog();
            }
        });

        // Add form submission handler
        const form = this.addIngredientDialog.querySelector('#add-ingredient-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddIngredient();
            });
        }

        // Show the dialog
        requestAnimationFrame(() => {
            console.log('Setting dialog display to flex');
            this.addIngredientDialog.style.display = 'flex';
            
            // Focus the first input
            const firstInput = this.addIngredientDialog.querySelector('#new-ingredient-name');
            if (firstInput) {
                firstInput.focus();
            }
        });
    }

    closeAddIngredientDialog() {
        console.log('Closing add ingredient dialog');
        if (this.addIngredientDialog) {
            // Reset form
            const form = this.addIngredientDialog.querySelector('#add-ingredient-form');
            if (form) {
                form.reset();
            }

            // Hide dialog
            this.addIngredientDialog.style.display = 'none';
            
            // Remove dialog after animation
            setTimeout(() => {
                if (this.addIngredientDialog) {
                    this.addIngredientDialog.remove();
                    this.addIngredientDialog = null;
                }
            }, 300); // Match the animation duration
        }
    }

    async handleAddIngredient() {
        console.log('Handling add ingredient');
        if (!this.addIngredientDialog) return;

        const form = this.addIngredientDialog.querySelector('#add-ingredient-form');
        if (!form) {
            console.error('Form not found in dialog');
            return;
        }

        const nameInput = form.querySelector('#new-ingredient-name');
        const quantityInput = form.querySelector('#new-ingredient-quantity');
        const unitSelect = form.querySelector('#new-ingredient-unit');
        const expiryInput = form.querySelector('#new-ingredient-expiry');
        const categorySelect = form.querySelector('#new-ingredient-category');

        if (!nameInput || !quantityInput || !unitSelect || !categorySelect) {
            console.error('Required form elements not found');
            return;
        }

        const name = nameInput.value.trim();
        const quantity = parseInt(quantityInput.value, 10);
        const unit = unitSelect.value;
        const expiry_date = expiryInput ? expiryInput.value : '';
        const category = categorySelect.value;

        console.log('handleAddIngredient: expiryInput element', expiryInput);
        console.log('handleAddIngredient: expiryInput.value', expiryInput ? expiryInput.value : 'N/A - expiryInput not found');
        console.log('handleAddIngredient: expiry_date variable', expiry_date);

        if (!name || isNaN(quantity) || quantity < 0 || !unit || !category) {
            showNotification('Please fill in all required fields correctly', 'warning');
            return;
        }

        try {
            const newIngredient = {
                name: name,
                quantity: quantity,
                unit: unit,
                expiry_date: expiry_date,
                category: category
            };
            console.log('handleAddIngredient: New ingredient data to send to server', newIngredient);

            const response = await fetch(`${this.API_URL}/users/pantry`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ items: [newIngredient] })
            });

            console.log('handleAddIngredient: Server response status', response.status);
            const responseText = await response.text();
            console.log('handleAddIngredient: Server response text', responseText);

            if (!response.ok) {
                throw new Error(responseText || 'Failed to save ingredient to server');
            }

            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                console.warn('handleAddIngredient: Could not parse response as JSON:', e);
                responseData = { success: true };
            }

            console.log('handleAddIngredient: Server response data', responseData);

            // Update local state
            this.ingredients.push({
                ...newIngredient,
                _id: responseData._id || this.generateUniqueId()
            });
            this.saveIngredientsToLocalStorage();
            this.renderIngredientsList();
            this.closeAddIngredientDialog();
            showNotification(`${name} added successfully to ${category} category`, 'success');
        } catch (error) {
            console.error('Error saving ingredient:', error);
            showNotification(error.message || 'Failed to save ingredient. Please try again.', 'error');
        }
    }

    async handleDeleteIngredient(id) {
        try {
            const response = await fetch(`${this.API_URL}/users/pantry/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete ingredient from server');
            }

            this.ingredients = this.ingredients.filter(ingredient => ingredient._id !== id);
            this.saveIngredientsToLocalStorage();
            this.renderIngredientsList(); // Re-render the list
            this.showNotification('Ingredient deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting ingredient:', error);
            this.showNotification('Failed to delete ingredient. Please try again.', 'error');
        }
    }

    render() {
        console.log('Render method called');
        if (!this.container) {
            console.error('Container not found in render method');
            return;
        }

        // Create the initial structure
        this.container.innerHTML = `
            <div class="pantry-header">
                <div class="search-container">
                    <input type="text" id="pantry-search" placeholder="Search ingredients..." value="${this.searchText}" aria-label="Search ingredients">
                    <i class="fas fa-search"></i>
                    <button class="clear-search" id="clear-pantry-search" aria-label="Clear search">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <button id="add-pantry-item" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Add Pantry Item
                </button>
            </div>
            <div class="pantry-cards-container"></div>
        `;

        // Initialize event listeners after creating the structure
        this.initEventListeners();
        
        // Render the ingredients list
        this.renderIngredientsList();
    }

    renderIngredientsList() {
        console.log('Rendering ingredients list');
        const cardsContainer = this.container.querySelector('.pantry-cards-container');
        if (!cardsContainer) {
            console.error('Cards container not found');
            return;
        }

        // Filter ingredients based on search text
        const filteredIngredients = this.ingredients.filter(ingredient => 
            ingredient.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
            ingredient.category.toLowerCase().includes(this.searchText.toLowerCase())
        );

        if (filteredIngredients.length === 0) {
            cardsContainer.innerHTML = `
                <div class="empty-state">
                    <p>${this.searchText ? 'No ingredients match your search.' : 'No ingredients added yet. Add your first ingredient!'}</p>
                </div>
            `;
            return;
        }

        // Group ingredients by category
        const ingredientsByCategory = filteredIngredients.reduce((acc, ingredient) => {
            const category = ingredient.category || 'Other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(ingredient);
            return acc;
        }, {});

        // Sort categories alphabetically
        const sortedCategories = Object.keys(ingredientsByCategory).sort();

        // Create HTML for each category
        let ingredientsHtml = '';
        sortedCategories.forEach(category => {
            ingredientsHtml += `
                <div class="pantry-category-section">
                    <h3 class="category-title">${category}</h3>
                    <div class="pantry-cards-grid">
                        ${ingredientsByCategory[category].map(ingredient => {
                            console.log('Rendering ingredient object:', ingredient);
                            // Ensure expiry_date is treated as a string, even if null/undefined
                            const rawExpiryDate = String(ingredient.expiry_date || '');
                            const expiryDate = new Date(rawExpiryDate);
                            const isValidDate = !isNaN(expiryDate.getTime());
                            const today = new Date();
                            let expiryDateDisplay = 'N/A';
                            let expiryClass = '';
                            let expiryMessage = '';

                            console.log(`Rendering ingredient: ${ingredient.name}, rawExpiryDate: '${rawExpiryDate}', isValidDate: ${isValidDate}`);

                            if (isValidDate) {
                                expiryDateDisplay = expiryDate.toLocaleDateString();
                                const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                                
                                if (daysUntilExpiry < 0) {
                                    expiryClass = 'expiry-warning';
                                    expiryMessage = 'Expired';
                                } else if (daysUntilExpiry === 0) {
                                     expiryClass = 'expiry-warning'; // Still warning if today
                                     expiryMessage = 'Expires today';
                                } else if (daysUntilExpiry <= 3) {
                                    expiryClass = 'expiry-warning';
                                    expiryMessage = `Expires in ${daysUntilExpiry} days`;
                                } else if (daysUntilExpiry <= 7) {
                                    expiryClass = 'expiry-caution';
                                    expiryMessage = `Expires in ${daysUntilExpiry} days`;
                                } else {
                                    expiryClass = 'expiry-good';
                                    expiryMessage = `Expires in ${daysUntilExpiry} days`;
                                }
                            } else {
                                expiryClass = 'expiry-info-unavailable';
                                expiryMessage = 'No expiry date';
                                expiryDateDisplay = 'N/A';
                            }

                            return `
                                <div class="pantry-card" data-ingredient-id="${ingredient._id}">
                                    <div class="card-header">
                                        <h4>${ingredient.name}</h4>
                                        <button class="delete-item" aria-label="Delete ${ingredient.name}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                    <div class="card-body">
                                        <div class="quantity-info">
                                            <span class="quantity">${ingredient.quantity}</span>
                                            <span class="unit">${ingredient.unit || ''}</span>
                                        </div>
                                        <div class="expiry-info ${expiryClass}">
                                            <i class="fas fa-clock"></i>
                                            <span>${expiryMessage}</span>
                                            <span class="expiry-date">${expiryDateDisplay}</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });

        cardsContainer.innerHTML = ingredientsHtml;

        // Add event listeners to delete buttons
        this.initDeleteEventListeners();
    }

    initDeleteEventListeners() {
        const deleteButtons = this.container.querySelectorAll('.delete-item');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const card = event.target.closest('.pantry-card');
                if (card) {
                    const ingredientId = card.dataset.ingredientId;
                    this.handleDeleteIngredient(ingredientId);
                }
            });
        });
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