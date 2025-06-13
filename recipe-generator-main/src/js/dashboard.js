import { handleEmptyState } from './utils.js';

// API Configuration
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
const token = localStorage.getItem('token');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

// DOM Elements
const dashboardContainer = document.getElementById('dashboard-container');
const statsContainer = document.getElementById('stats-container');

// Load Dashboard Data
async function loadDashboardData() {
    try {
        const response = await axios.get(`${API_URL}/users/profile`, { headers });
        const user = response.data;

        // Update stats
        updateStats(user);

        // Check if user has any data
        const hasData = user.recipes?.length > 0 || user.favorites?.length > 0 || user.pantry?.length > 0;
        
        if (!hasData) {
            handleEmptyState(dashboardContainer, [], 'dashboard');
            return;
        }

        // Display recent activity
        displayRecentActivity(user);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        handleEmptyState(dashboardContainer, [], 'dashboard');
    }
}

// Update Stats
function updateStats(user) {
    const stats = {
        recipes: user.recipes?.length || 0,
        favorites: user.favorites?.length || 0,
        pantry: user.pantry?.length || 0
    };

    statsContainer.innerHTML = `
        <div class="stat-card">
            <i class="fas fa-utensils"></i>
            <h3>${stats.recipes}</h3>
            <p>Recipes</p>
        </div>
        <div class="stat-card">
            <i class="fas fa-heart"></i>
            <h3>${stats.favorites}</h3>
            <p>Favorites</p>
        </div>
        <div class="stat-card">
            <i class="fas fa-carrot"></i>
            <h3>${stats.pantry}</h3>
            <p>Pantry Items</p>
        </div>
    `;
}

// Display Recent Activity
function displayRecentActivity(user) {
    const recentActivity = document.createElement('div');
    recentActivity.className = 'recent-activity';
    recentActivity.innerHTML = `
        <h2>Recent Activity</h2>
        <div class="activity-list">
            ${getRecentActivityItems(user)}
        </div>
    `;

    dashboardContainer.innerHTML = '';
    dashboardContainer.appendChild(recentActivity);
}

// Get Recent Activity Items
function getRecentActivityItems(user) {
    const activities = [];

    // Add recent recipes
    if (user.recipes?.length > 0) {
        const recentRecipes = user.recipes.slice(0, 3);
        recentRecipes.forEach(recipe => {
            activities.push(`
                <div class="activity-item">
                    <i class="fas fa-utensils"></i>
                    <div class="activity-content">
                        <h4>${recipe.title}</h4>
                        <p>Added to your recipes</p>
                    </div>
                </div>
            `);
        });
    }

    // Add recent favorites
    if (user.favorites?.length > 0) {
        const recentFavorites = user.favorites.slice(0, 3);
        recentFavorites.forEach(recipe => {
            activities.push(`
                <div class="activity-item">
                    <i class="fas fa-heart"></i>
                    <div class="activity-content">
                        <h4>${recipe.title}</h4>
                        <p>Added to your favorites</p>
                    </div>
                </div>
            `);
        });
    }

    // Add recent pantry items
    if (user.pantry?.length > 0) {
        const recentPantry = user.pantry.slice(0, 3);
        recentPantry.forEach(item => {
            activities.push(`
                <div class="activity-item">
                    <i class="fas fa-carrot"></i>
                    <div class="activity-content">
                        <h4>${item.name}</h4>
                        <p>Added to your pantry</p>
                    </div>
                </div>
            `);
        });
    }

    return activities.join('') || '<p>No recent activity</p>';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Only run on dashboard page
    if (document.getElementById('dashboard-container')) {
        const dashboard = new Dashboard();
        dashboard.loadAndRenderData(); // Call the method that fetches and renders data
    }
}); 