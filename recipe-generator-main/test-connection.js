require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Recipe = require('./models/Recipe');

const testConnection = async () => {
    try {
        // Test database connection
        console.log('Testing database connection...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,
            maxPoolSize: 10,
            minPoolSize: 5,
            retryWrites: true,
            w: 'majority'
        });
        console.log('✅ Database connection successful!');

        // Generate unique test data
        const timestamp = Date.now();
        const testUsername = `testuser${timestamp}`;
        const testEmail = `test${timestamp}@example.com`;

        // Test creating a user
        console.log('\nTesting user creation...');
        const testUser = await User.create({
            username: testUsername,
            email: testEmail,
            password: 'testpassword123',
            preferences: {
                dietaryRestrictions: ['Vegetarian'],
                favoriteCategories: ['Dinner']
            }
        });
        console.log('✅ User created successfully:', testUser.username);

        // Test creating a recipe
        console.log('\nTesting recipe creation...');
        const testRecipe = await Recipe.create({
            title: `Test Recipe ${timestamp}`,
            description: 'A test recipe for connection testing',
            ingredients: [{
                name: 'Test Ingredient',
                quantity: 1,
                unit: 'cup'
            }],
            instructions: ['Test instruction'],
            cookingTime: 30,
            difficulty: 'Easy',
            servings: 2,
            category: 'Dinner',
            author: testUser._id
        });
        console.log('✅ Recipe created successfully:', testRecipe.title);

        // Test querying
        console.log('\nTesting queries...');
        const foundUser = await User.findOne({ email: testEmail });
        const foundRecipe = await Recipe.findOne({ title: `Test Recipe ${timestamp}` });
        console.log('✅ Queries successful!');

        // Clean up test data
        console.log('\nCleaning up test data...');
        await User.deleteOne({ email: testEmail });
        await Recipe.deleteOne({ title: `Test Recipe ${timestamp}` });
        console.log('✅ Test data cleaned up!');

        console.log('\n🎉 All tests passed successfully!');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
    }
};

testConnection(); 