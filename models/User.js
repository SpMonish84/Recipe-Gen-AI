const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    avatar: {
        type: String,
        default: '/uploads/avatars/default.png'
    },
    preferences: {
        dietaryRestrictions: {
            type: [String],
            default: []
        },
        favoriteCategories: {
            type: [String],
            default: []
        },
        allergies: [{
            type: String
        }],
        cookingSkillLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'expert'],
            default: 'beginner'
        },
        preferredCuisines: [{
            type: String
        }],
        mealPlanningPreferences: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            default: 'weekly'
        }
    },
    recipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    }],
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    }],
    savedRecipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    }],
    mealPlans: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MealPlan'
    }],
    shoppingLists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShoppingList'
    }],
    pantry: [{
        name: String,
        quantity: String,
        unit: String,
        category: String,
        expiryDate: Date
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true
});

// Indexes
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'preferences.dietaryRestrictions': 1 });
userSchema.index({ 'preferences.favoriteCategories': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    // Check if password is already hashed
    if (this.password.startsWith('$2')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = async function() {
    this.lastLogin = new Date();
    await this.save();
};

// Get user profile (public data)
userSchema.methods.getPublicProfile = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.__v;
    return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 