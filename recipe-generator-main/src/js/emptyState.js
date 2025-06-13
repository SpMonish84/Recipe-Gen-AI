// Empty state messages
export const EMPTY_STATES = {
    recipes: {
        title: 'No Recipes Yet',
        message: 'Start by creating your first recipe!',
        icon: 'utensils'
    },
    favorites: {
        title: 'No Favorites Yet',
        message: 'Add recipes to your favorites to see them here.',
        icon: 'heart'
    },
    pantry: {
        title: 'Empty Pantry',
        message: 'Add ingredients to your pantry to get started.',
        icon: 'carrot'
    },
    dashboard: {
        title: 'Welcome to Your Dashboard',
        message: 'Your cooking journey starts here!',
        icon: 'chart-line'
    }
};

// Handle empty state display
export function handleEmptyState(container, items, type) {
    if (!container) return false;

    if (!items || items.length === 0) {
        const state = EMPTY_STATES[type.toLowerCase()] || {
            title: `No ${type} found`,
            message: 'No items available.',
            icon: 'info-circle'
        };

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-content">
                    <i class="fas fa-${state.icon}"></i>
                    <h3>${state.title}</h3>
                    <p>${state.message}</p>
                </div>
            </div>
        `;
        return true;
    }
    return false;
} 