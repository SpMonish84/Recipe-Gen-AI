const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Recipe = require('../models/Recipe');
const mongoose = require('mongoose');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/avatars');
    },
    filename: function (req, file, cb) {
        cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
});

// Register user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Log the request body
        console.log('Registration request:', { username, email, password: '***' });

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('User already exists with email:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user with empty arrays for recipes, favorites, and pantry
        const user = await User.create({
            username,
            email,
            password,
            recipes: [],
            favorites: [],
            pantry: [],
            preferences: {
                dietaryRestrictions: [],
                favoriteCategories: [],
                allergies: [],
                cookingSkillLevel: 'beginner',
                preferredCuisines: [],
                mealPlanningPreferences: 'weekly'
            }
        });

        console.log('User created successfully:', { id: user._id, username: user.username, email: user.email });

        // Create token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token,
            recipes: [],
            favorites: [],
            pantry: []
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        console.log('Login route hit');
        const { email, password } = req.body;

        // Log the request body
        console.log('Login request received:', { email, password: '***' });

        // Check for user and explicitly select password
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        await user.updateLastLogin();

        // Create token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Get user's public profile
        const userProfile = user.getPublicProfile();

        console.log('Login successful for user:', { id: user._id, email: user.email });

        // Return user data
        res.json({
            ...userProfile,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get user profile (Protected Route)
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('recipes')
            .populate('favorites')
            .populate('savedRecipes');
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Return complete user data
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            recipes: user.recipes || [],
            favorites: user.favorites || [],
            pantry: user.pantry || [],
            preferences: user.preferences,
            avatar: user.avatar
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    const { username, email } = req.body;

    try {
        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if username is already taken
        if (username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ msg: 'Username already exists' });
            }
        }

        // Check if email is already taken
        if (email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ msg: 'Email already exists' });
            }
        }

        user.username = username;
        user.email = email;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update preferences with the request body
        user.preferences = {
            ...user.preferences,
            ...req.body
        };

        await user.save();
        res.json(user.preferences);
    } catch (err) {
        console.error('Error updating preferences:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   PUT api/users/password
// @desc    Change user password
// @access  Private
router.put('/password', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();
        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/users/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.avatar = `/uploads/avatars/${req.file.filename}`;
        await user.save();

        res.json({ avatarUrl: user.avatar });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users/export
// @desc    Export user data
// @access  Private
router.get('/export', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('recipes')
            .populate('favorites')
            .populate('savedRecipes');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/users/profile
// @desc    Delete user account
// @access  Private
router.delete('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Delete user's recipes
        await Recipe.deleteMany({ user: req.user.id });

        // Remove user from other users' favorites and saved recipes
        await User.updateMany(
            { $or: [{ favorites: req.user.id }, { savedRecipes: req.user.id }] },
            { $pull: { favorites: req.user.id, savedRecipes: req.user.id } }
        );

        // Delete user's avatar if exists
        if (user.avatar) {
            const avatarPath = path.join(__dirname, '..', user.avatar);
            fs.unlink(avatarPath, (err) => {
                if (err) console.error('Error deleting avatar:', err);
            });
        }

        // Delete user
        await user.remove();

        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/users/favorites
// @desc    Add or remove a recipe from user's favorites
// @access  Private
router.put('/favorites', protect, async (req, res) => {
    const { recipeId } = req.body;

    if (!recipeId) {
        return res.status(400).json({ msg: 'Recipe ID is required' });
    }

    try {
        const user = await User.findById(req.user.id).populate('favorites');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const recipeObjectId = new mongoose.Types.ObjectId(recipeId);

        // Check if the recipe is already in favorites
        const isFavorite = user.favorites.some(fav => fav._id.equals(recipeObjectId));

        if (isFavorite) {
            // Remove from favorites
            user.favorites = user.favorites.filter(fav => !fav._id.equals(recipeObjectId));
            await user.save();
            // Respond with the updated user data, populating favorites again for consistency
            const updatedUser = await User.findById(req.user.id).populate('favorites');
            res.json({ msg: 'Recipe removed from favorites', favorites: updatedUser.favorites });
        } else {
            // Add to favorites
            const recipeToAdd = await Recipe.findById(recipeId);
            if (!recipeToAdd) {
                return res.status(404).json({ msg: 'Recipe not found' });
            }
            user.favorites.push(recipeToAdd);
            await user.save();
            // Respond with the updated user data, populating favorites again
            const updatedUser = await User.findById(req.user.id).populate('favorites');
            res.json({ msg: 'Recipe added to favorites', favorites: updatedUser.favorites });
        }

    } catch (err) {
        console.error(err.message);
        // Check if the error is due to invalid ObjectId
        if (err.kind === 'ObjectId') {
             return res.status(400).json({ msg: 'Invalid Recipe ID format' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/users/pantry
// @desc    Add or update pantry items
// @access  Private
router.put('/pantry', protect, async (req, res) => {
    const { items } = req.body;

    if (!Array.isArray(items)) {
        return res.status(400).json({ msg: 'Items must be an array' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if adding new items would exceed the limit
        const newTotalItems = user.pantry.length + items.length;
        if (newTotalItems > 100) {
            return res.status(400).json({ 
                msg: `Cannot add items. Maximum pantry limit is 100 items. You currently have ${user.pantry.length} items.` 
            });
        }

        // Add new items to pantry
        user.pantry.push(...items);
        await user.save();

        res.json({ 
            msg: 'Pantry items added successfully',
            pantry: user.pantry,
            totalItems: user.pantry.length
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/users/pantry/:itemId
// @desc    Remove a pantry item
// @access  Private
router.delete('/pantry/:itemId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Remove the item from pantry
        user.pantry = user.pantry.filter(item => item._id.toString() !== req.params.itemId);
        await user.save();

        res.json({ 
            msg: 'Pantry item removed successfully',
            pantry: user.pantry,
            totalItems: user.pantry.length
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users/pantry
// @desc    Get user's pantry items
// @access  Private
router.get('/pantry', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({
            pantry: user.pantry,
            totalItems: user.pantry.length
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 