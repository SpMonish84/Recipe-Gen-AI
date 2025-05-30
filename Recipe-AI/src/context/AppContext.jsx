import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [recipes, setRecipes] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [ingredients, setIngredients] = useState([]);

    const addRecipe = (recipe) => {
        setRecipes([...recipes, recipe]);
    };

    const toggleFavorite = (recipeId) => {
        if (favorites.includes(recipeId)) {
            setFavorites(favorites.filter(id => id !== recipeId));
        } else {
            setFavorites([...favorites, recipeId]);
        }
    };

    const addIngredient = (ingredient) => {
        setIngredients([...ingredients, ingredient]);
    };

    const value = {
        recipes,
        favorites,
        ingredients,
        addRecipe,
        toggleFavorite,
        addIngredient
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
} 