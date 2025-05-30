export const mockIngredients = [
    {
        _id: '1',
        name: 'Tomatoes',
        quantity: '5',
        itemAdded: '2024-03-10',
        is_vegetable_or_fruit: true
    },
    {
        _id: '2',
        name: 'Chicken',
        quantity: '1kg',
        itemAdded: '2024-03-12',
        is_vegetable_or_fruit: false
    },
    {
        _id: '3',
        name: 'Onions',
        quantity: '3',
        itemAdded: '2024-03-08',
        is_vegetable_or_fruit: true
    },
    {
        _id: '4',
        name: 'Rice',
        quantity: '2kg',
        itemAdded: '2024-03-01',
        is_vegetable_or_fruit: false
    }
];

export const mockRecipes = [
    {
        _id: '1',
        name: 'Chicken Curry',
        description: 'A delicious Indian curry made with chicken and spices',
        ingredients: ['Chicken', 'Onions', 'Tomatoes', 'Spices'],
        instructions: '1. Cook chicken\n2. Add spices\n3. Simmer with tomatoes'
    },
    {
        _id: '2',
        name: 'Vegetable Stir Fry',
        description: 'Quick and healthy vegetable stir fry',
        ingredients: ['Onions', 'Tomatoes', 'Bell Peppers'],
        instructions: '1. Chop vegetables\n2. Stir fry with oil\n3. Add seasonings'
    }
];

export const mockSuggestions = [
    {
        name: 'Chicken Curry',
        description: 'Perfect for using your expiring chicken and tomatoes'
    },
    {
        name: 'Vegetable Stir Fry',
        description: 'Quick way to use up your vegetables'
    }
]; 