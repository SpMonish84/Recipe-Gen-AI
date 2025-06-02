import { handleEmptyState } from './utils.js';

// API Configuration
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
const token = localStorage.getItem('token');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

// DOM Elements
const pantryContainer = document.getElementById('pantry-container');
const addItemForm = document.getElementById('add-item-form');

// Load Pantry Items
async function loadPantryItems() {
    try {
        const response = await axios.get(`${API_URL}/users/profile`, { headers });
        const user = response.data;

        // Check for empty state
        if (handleEmptyState(pantryContainer, user.pantry, 'pantry')) {
            return;
        }

        // Display pantry items
        pantryContainer.innerHTML = '';
        user.pantry.forEach(item => {
            const itemCard = createPantryItemCard(item);
            pantryContainer.appendChild(itemCard);
        });
    } catch (error) {
        console.error('Error loading pantry items:', error);
        handleEmptyState(pantryContainer, [], 'pantry');
    }
}

// Create Pantry Item Card
function createPantryItemCard(item) {
    const card = document.createElement('div');
    card.className = 'pantry-item-card';
    card.innerHTML = `
        <div class="pantry-item-content">
            <h3>${item.name}</h3>
            <p>${item.quantity} ${item.unit}</p>
            <p class="category">${item.category}</p>
            ${item.expiryDate ? `<p class="expiry">Expires: ${new Date(item.expiryDate).toLocaleDateString()}</p>` : ''}
        </div>
        <button class="btn-remove-item" data-id="${item._id}">
            <i class="fas fa-trash"></i>
        </button>
    `;

    // Add event listener for remove button
    const removeBtn = card.querySelector('.btn-remove-item');
    removeBtn.addEventListener('click', () => removePantryItem(item._id));

    return card;
}

// Add Pantry Item
addItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('item-name').value,
        quantity: document.getElementById('item-quantity').value,
        unit: document.getElementById('item-unit').value,
        category: document.getElementById('item-category').value,
        expiryDate: document.getElementById('item-expiry').value
    };

    try {
        await axios.post(`${API_URL}/users/pantry`, formData, { headers });
        addItemForm.reset();
        loadPantryItems();
    } catch (error) {
        console.error('Error adding pantry item:', error);
    }
});

// Remove Pantry Item
async function removePantryItem(itemId) {
    try {
        await axios.delete(`${API_URL}/users/pantry/${itemId}`, { headers });
        loadPantryItems();
    } catch (error) {
        console.error('Error removing pantry item:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', loadPantryItems); 