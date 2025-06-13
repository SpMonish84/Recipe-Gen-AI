const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Recipe title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters long'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Recipe description is required'],
        minlength: [10, 'Description must be at least 10 characters long'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    ingredients: [{
        name: {
            type: String,
            required: [true, 'Ingredient name is required'],
            trim: true
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [0, 'Quantity cannot be negative']
        },
        unit: {
            type: String,
            required: [true, 'Unit is required'],
            trim: true
        }
    }],
    instructions: [{
        type: String,
        required: [true, 'Instruction step is required'],
        trim: true
    }],
    cookingTime: {
        type: Number,
        required: [true, 'Cooking time is required'],
        min: [1, 'Cooking time must be at least 1 minute']
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: [true, 'Difficulty level is required']
    },
    servings: {
        type: Number,
        required: [true, 'Number of servings is required'],
        min: [1, 'Servings must be at least 1']
    },
    category: {
        type: String,
        required: [true, 'Recipe category is required'],
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage', 'Other']
    },
    imageUrl: {
        type: String,
        default: 'default-recipe.jpg'
    },
    tags: [{
        type: String,
        trim: true
    }],
    nutritionInfo: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
recipeSchema.index({ title: 'text', description: 'text' });
recipeSchema.index({ category: 1 });
recipeSchema.index({ author: 1 });
recipeSchema.index({ tags: 1 });

// Virtual for like count
recipeSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

// Virtual for comment count
recipeSchema.virtual('commentCount').get(function() {
    return this.comments.length;
});

// Ensure virtuals are included in JSON output
recipeSchema.set('toJSON', { virtuals: true });
recipeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Recipe', recipeSchema); 