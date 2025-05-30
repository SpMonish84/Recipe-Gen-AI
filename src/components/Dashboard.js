// Vanilla JS Dashboard for dashboard.html

class Dashboard {
    constructor() {
        this.stats = {
            totalRecipes: 5,
            totalIngredients: 20,
            favoriteRecipes: 2,
            vegetableCount: 8,
            otherCount: 12
        };
        this.expiringIngredients = [
            { name: 'Milk', expiry_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
            { name: 'Yogurt', expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) }
        ];
        this.suggestions = [
            { name: 'Pasta with Tomato Sauce', ingredients: ['pasta', 'tomato sauce', 'garlic', 'basil'] },
            { name: 'Vegetable Stir Fry', ingredients: ['rice', 'vegetables', 'soy sauce', 'ginger'] }
        ];
    }

    createCard(title, value, icon, color = '#2563eb') {
        return `
            <div class="dashboard-card">
                <div class="card-header">
                    <i class="fas ${icon}" style="color: ${color}"></i>
                    <h3>${title}</h3>
                </div>
                <div class="card-value" style="color: ${color}">${value}</div>
            </div>
        `;
    }

    createIngredientsList(ingredients) {
        if (!ingredients.length) {
            return '<div class="empty-message">No ingredients expiring soon</div>';
        }
        return ingredients.map(ingredient => `
            <div class="ingredient-item">
                <div class="ingredient-name">${ingredient.name}</div>
                <div class="ingredient-expiry">
                    Expires in ${Math.ceil((ingredient.expiry_date - new Date()) / (1000 * 60 * 60 * 24))} days
                </div>
            </div>
        `).join('');
    }

    createSuggestionsList(suggestions) {
        if (!suggestions.length) {
            return '<div class="empty-message">No recipe suggestions available</div>';
        }
        return suggestions.map(suggestion => `
            <div class="suggestion-item">
                <div class="suggestion-name">${suggestion.name}</div>
                <div class="suggestion-ingredients">
                    ${suggestion.ingredients.join(', ')}
                </div>
            </div>
        `).join('');
    }

    render() {
        const container = document.getElementById('dashboard-container');
        if (!container) return;
        container.innerHTML = `
            <div class="dashboard-grid">
                <div class="stats-section">
                    ${this.createCard('Total Ingredients', this.stats.totalIngredients, 'fa-carrot')}
                    ${this.createCard('Total Recipes', this.stats.totalRecipes, 'fa-utensils')}
                    ${this.createCard('Favorites', this.stats.favoriteRecipes, 'fa-heart')}
                    ${this.createCard('Expiring Soon', this.expiringIngredients.length, 'fa-exclamation-triangle', '#ef4444')}
                </div>
                <div class="dashboard-content">
                    <div class="dashboard-card expiring-ingredients">
                        <h3>Ingredients Expiring Soon</h3>
                        <div class="ingredients-list">
                            ${this.createIngredientsList(this.expiringIngredients)}
                        </div>
                    </div>
                    <div class="dashboard-card recipe-suggestions">
                        <h3>Recipe Suggestions</h3>
                        <div class="suggestions-list">
                            ${this.createSuggestionsList(this.suggestions)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Only run on dashboard page
    if (document.getElementById('dashboard-container')) {
        const dashboard = new Dashboard();
        dashboard.render();
    }
}); 