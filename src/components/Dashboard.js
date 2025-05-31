// Vanilla JS Dashboard for dashboard.html

class Dashboard {
    constructor() {
        this.stats = {
            totalRecipes: 0,
            totalIngredients: 0,
            favoriteRecipes: 0,
            vegetableCount: 0,
            otherCount: 0
        };
        
        this.expiringIngredients = [];
        this.suggestions = [];
        
        this.initializeStats();
        this.getRecipeSuggestions();
    }

    initializeStats() {
        // Get recipes from localStorage using the correct key
        const storedRecipes = localStorage.getItem('allRecipes');
        const recipes = storedRecipes ? JSON.parse(storedRecipes) : [];
        
        // Get pantry items from localStorage using the correct key
        const storedPantry = localStorage.getItem('pantryIngredients');
        const pantryItems = storedPantry ? JSON.parse(storedPantry) : [];
        
        // Update stats based on actual data
        this.stats.totalRecipes = recipes.length;
        this.stats.favoriteRecipes = recipes.filter(recipe => recipe.is_fav).length;
        
        // Count ingredients by category
        let vegetableCount = 0;
        let otherCount = 0;
        let categoryBreakdown = {};
        
        pantryItems.forEach(item => {
            // Count by category for detailed breakdown
            if (!categoryBreakdown[item.category]) {
                categoryBreakdown[item.category] = 0;
            }
            categoryBreakdown[item.category]++;
            
            // Count for chart
            if (item.category === 'Vegetables & Fruits' || item.category === 'Vegetables' || item.category === 'Fruits') {
                vegetableCount++;
            } else {
                otherCount++;
            }
        });
        
        // Update total ingredients from pantry
        this.stats.totalIngredients = pantryItems.length;
        this.stats.vegetableCount = vegetableCount;
        this.stats.otherCount = otherCount;
        this.stats.categoryBreakdown = categoryBreakdown;
        
        // Get expiring ingredients (within 2 days)
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
        
        this.expiringIngredients = pantryItems
            .filter(item => {
                if (!item.expiry_date) return false;
                const expiryDate = new Date(item.expiry_date);
                const today = new Date();
                return expiryDate <= twoDaysFromNow && expiryDate >= today;
            })
            .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
    }

    async getRecipeSuggestions() {
        try {
            // Create a prompt for the AI to get random recipe suggestions
            const prompt = `Suggest 3 unique and creative recipe names. 
                Make them interesting and appetizing. 
                Only return the recipe names, one per line. 
                Do not include any ingredients or instructions.`;

            // Call SheCodes AI API
            const response = await axios.post('https://api.shecodes.io/ai/v1/chat/completions', {
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: prompt
                }],
                max_tokens: 100,
                temperature: 0.9
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.SHECODES_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            // Process the response to get exactly 3 recipe names
            const recipeNames = response.data.choices[0].message.content
                .split('\n')
                .filter(name => name.trim())
                .slice(0, 3);

            // If no recipes were generated, use default suggestions
            if (recipeNames.length === 0) {
                this.suggestions = [
                    { name: "Creamy Mushroom Risotto" },
                    { name: "Spicy Thai Basil Chicken" },
                    { name: "Mediterranean Grilled Salmon" }
                ];
            } else {
                // Update suggestions with just the names
                this.suggestions = recipeNames.map(name => ({
                    name: name.trim()
                }));
            }

            // Update the UI
            this.updateSuggestionsUI();

        } catch (error) {
            console.error('Error getting recipe suggestions:', error);
            // Use default suggestions if API call fails
            this.suggestions = [
                { name: "Creamy Mushroom Risotto" },
                { name: "Spicy Thai Basil Chicken" },
                { name: "Mediterranean Grilled Salmon" }
            ];
            this.updateSuggestionsUI();
        }
    }

    updateSuggestionsUI() {
        const suggestionsList = document.querySelector('.suggestions-list');
        if (suggestionsList) {
            suggestionsList.innerHTML = this.createSuggestionsList(this.suggestions);
        }
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
            return '<div class="empty-message">No ingredients expiring in the next 2 days</div>';
        }
        return ingredients.map(ingredient => `
            <div class="ingredient-item">
                <div class="ingredient-name">${ingredient.name}</div>
                <div class="ingredient-details">
                    <span class="ingredient-category">${ingredient.category}</span>
                    <span class="ingredient-expiry">
                        Expires in ${Math.ceil((new Date(ingredient.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))} days
                    </span>
                </div>
            </div>
        `).join('');
    }

    createSuggestionsList(suggestions) {
        if (!suggestions || !suggestions.length) {
            return '<div class="empty-message">No recipe suggestions available</div>';
        }
        return suggestions.map(suggestion => `
            <div class="suggestion-item">
                <div class="suggestion-name">${suggestion.name}</div>
            </div>
        `).join('');
    }

    createCategoryBreakdown() {
        const categories = Object.entries(this.stats.categoryBreakdown)
            .sort((a, b) => b[1] - a[1]); // Sort by count descending
        
        return `
            <div class="category-breakdown">
                ${categories.map(([category, count]) => `
                    <div class="category-item">
                        <span class="category-name">${category}</span>
                        <span class="category-count">${count} items</span>
                    </div>
                `).join('')}
            </div>
        `;
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
                        <h3>Ingredients Expiring Soon (Next 2 Days)</h3>
                        <div class="ingredients-list">
                            ${this.createIngredientsList(this.expiringIngredients)}
                        </div>
                    </div>
                    <div class="dashboard-card recipe-suggestions">
                        <h3>AI Recipe Suggestions</h3>
                        <div class="suggestions-list">
                            ${this.createSuggestionsList(this.suggestions)}
                        </div>
                    </div>
                    <div class="dashboard-card ingredients-breakdown" style="border: none;">
                        <h3>Ingredients Breakdown</h3>
                        <div class="chart-container">
                            <canvas id="ingredientsChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render Chart
        this.renderIngredientsChart();
    }

    renderIngredientsChart() {
        const canvas = document.getElementById('ingredientsChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get all categories and their counts
        const categories = Object.entries(this.stats.categoryBreakdown)
            .sort((a, b) => b[1] - a[1]); // Sort by count descending

        // Define unique colors for each category
        const categoryColors = {
            'Vegetables & Fruits': '#2ecc71', // Green
            'Vegetables': '#e74c3c', // Red
            'Fruits': '#f1c40f', // Yellow
            'Dairy': '#3498db', // Blue
            'Meat': '#c0392b', // Dark Red
            'Seafood': '#1abc9c', // Turquoise
            'Grains': '#d35400', // Orange
            'Spices': '#8e44ad', // Purple
            'Beverages': '#16a085', // Teal
            'Snacks': '#2980b9', // Dark Blue
            'Canned Goods': '#27ae60', // Dark Green
            'Frozen Foods': '#9b59b6', // Light Purple
            'Bakery': '#e67e22', // Light Orange
            'Condiments': '#34495e', // Dark Blue-Gray
            'Herbs': '#00b894', // Mint Green
            'Sauces': '#e84393', // Pink
            'Poultry': '#6c5ce7', // Lavender
            'Other': '#fd79a8' // Light Pink
        };

        // Prepare data for the chart
        const labels = categories.map(([category]) => category);
        const data = categories.map(([_, count]) => count);
        const backgroundColors = categories.map(([category]) => 
            categoryColors[category] || categoryColors['Other']
        );
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ingredients by Category',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: false
                    }
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Only run on dashboard page
    if (document.getElementById('dashboard-container')) {
        const dashboard = new Dashboard();
        dashboard.render();
    }
}); 