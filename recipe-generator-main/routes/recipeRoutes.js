const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Get all recipes
router.get('/', protect, async (req, res) => {
    try {
        const recipes = await Recipe.find({});
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single recipe
router.get('/:id', protect, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (recipe) {
            res.json(recipe);
        } else {
            res.status(404).json({ message: 'Recipe not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create recipe (Protected Route)
router.post('/', protect, async (req, res) => {
    try {
        // Log the user ID from the protect middleware
        console.log('Creating recipe for user ID:', req.user.id);

        // Check if user has reached the recipe limit
        const user = await User.findById(req.user.id);
        if (user.recipes.length >= 50) {
            return res.status(400).json({ 
                message: 'Maximum recipe limit reached (50 recipes). Please delete some recipes before adding new ones.' 
            });
        }

        // Create a new recipe instance including the author (logged-in user)
        const recipe = new Recipe({
            ...req.body,
            author: req.user.id, // Assign the logged-in user as the author
            isFavorite: false // Initialize isFavorite as false
        });

        // Log the recipe object before saving
        console.log('Recipe object before saving:', recipe);

        const savedRecipe = await recipe.save();

        // Add the recipe to user's recipes array
        user.recipes.push(savedRecipe._id);
        await user.save();

        // Log the saved recipe object
        console.log('Recipe saved successfully:', savedRecipe);

        res.status(201).json(savedRecipe);
    } catch (error) {
        console.error('Error creating recipe:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update recipe
router.put('/:id', protect, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Update the recipe with the new data
        Object.assign(recipe, req.body);
        const updatedRecipe = await recipe.save();

        res.json(updatedRecipe);
    } catch (error) {
        console.error('Error updating recipe:', error);
        res.status(400).json({ message: error.message });
    }
});

// Delete recipe
router.delete('/:id', protect, async (req, res) => {
    try {
        const recipe = await Recipe.findByIdAndDelete(req.params.id);
        if (recipe) {
            // Remove recipe from user's recipes array
            const user = await User.findById(req.user.id);
            if (user) {
                user.recipes = user.recipes.filter(id => id.toString() !== recipe._id.toString());
                await user.save();
            }
            res.json({ message: 'Recipe deleted' });
        } else {
            res.status(404).json({ message: 'Recipe not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 