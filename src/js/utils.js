// Empty state messages
const EMPTY_STATES = {
    recipes: {
        title: 'No Recipes Yet',
        message: 'Start by creating your first recipe!',
        icon: 'fa-utensils'
    },
    favorites: {
        title: 'No Favorites Yet',
        message: 'Add recipes to your favorites to see them here.',
        icon: 'fa-heart'
    },
    pantry: {
        title: 'Empty Pantry',
        message: 'Add ingredients to your pantry to get started.',
        icon: 'fa-carrot'
    },
    dashboard: {
        title: 'Welcome to Your Dashboard',
        message: 'Your cooking journey starts here!',
        icon: 'fa-chart-line'
    }
};

// Create empty state element
function createEmptyState(type) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    
    const state = EMPTY_STATES[type];
    emptyState.innerHTML = `
        <div class="empty-state-content">
            <i class="fas ${state.icon}"></i>
            <h3>${state.title}</h3>
            <p>${state.message}</p>
        </div>
    `;
    
    return emptyState;
}

// Show empty state
function showEmptyState(container, type) {
    // Clear container
    container.innerHTML = '';
    
    // Add empty state
    const emptyState = createEmptyState(type);
    container.appendChild(emptyState);
}

// Check if data is empty and show appropriate state
function handleEmptyState(container, data, type) {
    if (!data || data.length === 0) {
        showEmptyState(container, type);
        return true;
    }
    return false;
}

// Export functions
export {
    createEmptyState,
    showEmptyState,
    handleEmptyState,
    EMPTY_STATES
}; 