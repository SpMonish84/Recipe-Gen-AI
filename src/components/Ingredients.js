class Ingredients {
    constructor() {
        // Initialize ingredients from localStorage or use mock data
        const storedIngredients = localStorage.getItem('ingredients');
        if (storedIngredients) {
            this.ingredients = JSON.parse(storedIngredients);
        } else {
            // Mock data for development with unique _id and expiry_date as Date objects
            this.ingredients = [
                {
                    _id: this.generateUniqueId(),
                    name: 'Tomatoes',
                    quantity: 5,
                    unit: 'pieces',
                    expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Store as YYYY-MM-DD string
                },
                {
                    _id: this.generateUniqueId(),
                    name: 'Onions',
                    quantity: 3,
                    unit: 'pieces',
                    expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                },
                {
                    _id: this.generateUniqueId(),
                    name: 'Garlic',
                    quantity: 2,
                    unit: 'heads',
                    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                }
            ];
             localStorage.setItem('ingredients', JSON.stringify(this.ingredients));
        }

        this.searchText = '';
        this.container = document.getElementById('ingredients-container');
        this.addIngredientDialog = null; // To hold the dialog element

        this.units = [
            'pieces',
            'kg',
            'g',
            'l',
            'ml',
            'cups',
            'tablespoons',
            'teaspoons',
            'pinch'
        ];

        this.render(); // Initial render
        this.initEventListeners();
    }

    generateUniqueId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    saveIngredientsToLocalStorage() {
        localStorage.setItem('ingredients', JSON.stringify(this.ingredients));
    }

    initEventListeners() {
         if (!this.container) return; // Ensure container exists

        // Search input event listener
        const searchInput = this.container.querySelector('#ingredient-search');
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
                const searchInput = this.container.querySelector('#ingredient-search');
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
        const ingredientsListEl = this.container.querySelector('.ingredients-list');
        if(ingredientsListEl) {
            ingredientsListEl.addEventListener('click', (event) => {
                const target = event.target;
                const deleteButton = target.closest('.delete-item');

                if(deleteButton) {
                    const ingredientId = deleteButton.dataset.ingredientId;
                    this.handleDeleteIngredient(ingredientId);
                }
            });
        }
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

             if(nameInput) nameInput.value = '';
             if(quantityInput) quantityInput.value = '';
             if(unitSelect) unitSelect.value = this.units[0] || ''; // Reset to first unit
             if(expiryInput) expiryInput.value = '';
        }
    }

    handleAddIngredient() {
         if (!this.addIngredientDialog) return;

        const nameInput = this.addIngredientDialog.querySelector('#new-ingredient-name');
        const quantityInput = this.addIngredientDialog.querySelector('#new-ingredient-quantity');
        const unitSelect = this.addIngredientDialog.querySelector('#new-ingredient-unit');
        const expiryInput = this.addIngredientDialog.querySelector('#new-ingredient-expiry');

        const name = nameInput ? nameInput.value.trim() : '';
        const quantity = quantityInput ? parseInt(quantityInput.value, 10) : NaN;
        const unit = unitSelect ? unitSelect.value : '';
        const expiry_date = expiryInput ? expiryInput.value : ''; // YYYY-MM-DD string

        if (!name || isNaN(quantity) || quantity < 0 || !unit) {
            this.showNotification('Please fill in all required fields correctly', 'warning');
            return;
        }

        const newIngredient = {
            _id: this.generateUniqueId(),
            name: name,
            quantity: quantity,
            unit: unit,
            expiry_date: expiry_date // Store as string
        };

        this.ingredients.push(newIngredient);
        this.saveIngredientsToLocalStorage();
        this.renderIngredientsList(); // Re-render the list
        this.closeAddIngredientDialog(); // Close the dialog
        this.showNotification('Ingredient added successfully', 'success');
    }

    handleDeleteIngredient(id) {
        this.ingredients = this.ingredients.filter(ingredient => ingredient._id !== id);
        this.saveIngredientsToLocalStorage();
        this.renderIngredientsList(); // Re-render the list
        this.showNotification('Ingredient deleted successfully', 'success');
    }

    renderIngredientsList() {
        const ingredientsListEl = this.container.querySelector('.ingredients-list');
         if (!ingredientsListEl) return;

        const filteredIngredients = this.ingredients.filter(ingredient =>
            ingredient.name.toLowerCase().includes(this.searchText.toLowerCase())
        );

        ingredientsListEl.innerHTML = filteredIngredients.map(ingredient => {
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
        }).join('');

         if (filteredIngredients.length === 0) {
             ingredientsListEl.innerHTML = `
                 <li class="empty-message">
                     ${this.searchText ? 'No matching ingredients found.' : 'No ingredients added yet.'}
                 </li>
             `;
         }
    }

    render() {
        if (!this.container) {
            console.error('Ingredients container not found');
            return;
        }

        // Render the main structure of the ingredients page
        this.container.innerHTML = `
            <div class="ingredients-content">
                <div class="search-bar">
                    <i class="fas fa-search"></i>
                    <input type="text" id="ingredient-search" placeholder="Search ingredients...">
                    <button class="clear-search" id="clear-search"><i class="fas fa-times"></i></button>
                </div>

                <button class="btn btn-primary" id="add-ingredient-btn">
                    <i class="fas fa-plus"></i> Add Ingredient
                </button>

                <ul class="ingredients-list"></ul>
            </div>
        `;

        // Initial render of the ingredients list
        this.renderIngredientsList();
    }
}

// Initialize the component when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
     // Ensure the element for the component exists before initializing
    if (document.getElementById('ingredients-container')) {
        window.ingredients = new Ingredients();
    }
}); 