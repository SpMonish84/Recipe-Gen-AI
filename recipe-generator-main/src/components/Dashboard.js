// Vanilla JS Dashboard for dashboard.html

class Dashboard {
    constructor() {
        this.API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
        this.stats = {
            totalRecipes: 0,
            favoriteRecipes: 0,
            totalIngredients: 0,
            expiringSoonCount: 0,
            categoryBreakdown: {}
        };
        this.expiringIngredients = [];
        this.recentRecipes = [];

        // DOM Elements - these are now in the HTML, so we just need to get references
        this.totalRecipesElement = document.getElementById('total-recipes');
        this.totalIngredientsElement = document.getElementById('total-ingredients');
        this.totalFavoritesElement = document.getElementById('total-favorites');
        this.expiringSoonCountElement = document.getElementById('expiring-soon-count');
        this.expiringIngredientsListElement = document.getElementById('expiring-ingredients-list');

        // No longer calling initializeStats or render here, loadAndRenderData will handle it
    }

    async loadAndRenderData() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('No authentication token found. Redirecting to login.');
                window.location.href = 'login.html';
                return;
            }

            // Fetch user profile (for recipes and favorites)
            const userResponse = await fetch(`${this.API_URL}/users/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userData = await userResponse.json();
            console.log('Dashboard: User Data', userData);

            // Fetch pantry items
            const pantryResponse = await fetch(`${this.API_URL}/users/pantry`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const pantryData = await pantryResponse.json();
            console.log('Dashboard: Raw Pantry Data', pantryData);
            console.log('Dashboard: Pantry Items (from raw data)', pantryData.pantry); // Corrected to pantryData.pantry

            // Update stats based on fetched data
            this.updateStats(userData, pantryData.pantry || []); // Corrected to pantryData.pantry
            this.renderDashboard(); // Render the dashboard with updated stats

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Optionally show a notification
            // showNotification('Failed to load dashboard data.', 'error');
        }
    }

    updateStats(userData, pantryItems) {
        console.log('updateStats: Received pantryItems', pantryItems);
        console.log('updateStats: pantryItems.length', pantryItems.length);

        // Total Recipes
        this.stats.totalRecipes = userData.recipes ? userData.recipes.length : 0;

        // Favorite Recipes
        this.stats.favoriteRecipes = userData.favorites ? userData.favorites.length : 0;

        // Total Ingredients
        this.stats.totalIngredients = pantryItems.length;
        console.log('updateStats: Calculated totalIngredients', this.stats.totalIngredients);

        // Category Breakdown for Ingredients
        const categoryBreakdown = {};
        pantryItems.forEach(item => {
            const category = item.category || 'Other';
            categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
        });
        this.stats.categoryBreakdown = categoryBreakdown;
        console.log('updateStats: Calculated categoryBreakdown', this.stats.categoryBreakdown);

        // Expiring Soon Ingredients
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);

        this.expiringIngredients = pantryItems.filter(item => {
            if (!item.expiry_date) return false;
            const expiryDate = new Date(item.expiry_date);
            // Check if it's a valid date and within the next 7 days or already expired
            return !isNaN(expiryDate.getTime()) && expiryDate <= sevenDaysFromNow;
        }).sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date)); // Sort by closest expiry
        
        this.stats.expiringSoonCount = this.expiringIngredients.length;

        console.log('updateStats: Final Calculated stats object', this.stats);
        console.log('updateStats: Expiring Ingredients', this.expiringIngredients);
    }

    renderDashboard() {
        console.log('renderDashboard: Updating UI elements...');
        // Update stat cards
        if (this.totalRecipesElement) this.totalRecipesElement.textContent = this.stats.totalRecipes;
        if (this.totalIngredientsElement) {
            console.log('renderDashboard: Attempting to update totalIngredientsElement with value', this.stats.totalIngredients);
            this.totalIngredientsElement.textContent = this.stats.totalIngredients;
        }
        if (this.totalFavoritesElement) this.totalFavoritesElement.textContent = this.stats.favoriteRecipes;
        if (this.expiringSoonCountElement) this.expiringSoonCountElement.textContent = this.stats.expiringSoonCount;

        console.log('renderDashboard: Total Ingredients Text Content after update', this.totalIngredientsElement?.textContent);

        // Update expiring ingredients list
        if (this.expiringIngredientsListElement) {
            if (this.expiringIngredients.length > 0) {
                this.expiringIngredientsListElement.innerHTML = this.expiringIngredients.map(item => {
                    const expiryDate = new Date(item.expiry_date);
                    const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
                    let expiryText = '';
                    if (daysLeft < 0) {
                        expiryText = 'Expired';
                    } else if (daysLeft === 0) {
                        expiryText = 'Expires today';
                    } else if (daysLeft === 1) {
                        expiryText = 'Expires in 1 day';
                    } else {
                        expiryText = `Expires in ${daysLeft} days`;
                    }
                    return `<li>${item.name} (${expiryText})</li>`;
                }).join('');
            } else {
                this.expiringIngredientsListElement.innerHTML = '<li>No ingredients expiring soon.</li>';
            }
        }

        // Render Ingredients Chart
        this.renderIngredientsChart();
    }

    renderIngredientsChart() {
        const canvas = document.getElementById('ingredientsChart');
        if (!canvas) {
            console.error('renderIngredientsChart: Canvas for ingredients chart not found.');
            return;
        }
        console.log('renderIngredientsChart: Canvas element found.', canvas);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('renderIngredientsChart: 2D context for canvas not available.');
            return;
        }
        console.log('renderIngredientsChart: Canvas 2D context obtained.');

        // Destroy existing chart instance if it exists
        if (this.ingredientsChartInstance) {
            this.ingredientsChartInstance.destroy();
            console.log('renderIngredientsChart: Destroyed existing chart instance.');
        }

        // Get all categories and their counts
        const categories = Object.entries(this.stats.categoryBreakdown)
            .sort((a, b) => b[1] - a[1]); // Sort by count descending
        
        console.log('renderIngredientsChart: Chart categories data', categories);

        // If there are no categories with counts, don't render the chart
        if (categories.length === 0) {
            console.warn('renderIngredientsChart: No ingredient categories found to render chart.');
            const chartContainer = canvas.closest('.chart-container');
            if (chartContainer) {
                chartContainer.innerHTML = '<p style="text-align: center; color: #888; padding-top: 50px;">No ingredients to display in chart.</p>';
            }
            return;
        }

        // Define a set of visually distinct colors
        const predefinedColors = [
            '#FF6384', // Pink
            '#36A2EB', // Blue
            '#FFCE56', // Yellow
            '#4BC0C0', // Teal
            '#9966FF', // Purple
            '#FF9F40', // Orange
            '#E67E22', // Dark Orange
            '#2ECC71', // Green
            '#3498DB', // Light Blue
            '#9B59B6', // Dark Purple
            '#1ABC9C', // Turquoise
            '#F1C40F', // Gold
            '#C0392B', // Red
            '#27AE60', // Dark Green
            '#D35400', // Dark Orange
            '#8E44AD', // Dark Purple
            '#2C3E50', // Dark Blue
            '#7F8C8D'  // Gray
        ];

        // Prepare data for the chart
        const labels = categories.map(([category]) => category);
        const data = categories.map(([_, count]) => count);
        const backgroundColors = labels.map((_, index) => 
            predefinedColors[index % predefinedColors.length]
        );

        // Create the chart
        this.ingredientsChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 20,
                            padding: 15,
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Ingredients Breakdown by Category',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} items (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });

        console.log('renderIngredientsChart: Chart rendered successfully');
    }
}

export { Dashboard }; // Export the Dashboard class

document.addEventListener('DOMContentLoaded', () => {
    // Only run on dashboard page
    if (document.getElementById('dashboard-container')) {
        const dashboard = new Dashboard();
        dashboard.loadAndRenderData();
    }
}); 