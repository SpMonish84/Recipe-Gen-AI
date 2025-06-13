# AI Recipe Generator 🍳

A modern web application that helps you manage your ingredients and generate delicious recipes using artificial intelligence.

## 🌟 Features

- **AI-Powered Recipe Generation**: Get instant recipes for any dish you can imagine using OpenAI's GPT model.
- **Pantry-Based Recipe Generation**: Generate recipes based on ingredients you already have in your pantry.
- **User Authentication**: Secure user registration and login system with JWT.
- **Recipe Management**: Create, read, update, and delete recipes with a 50-recipe limit per user.
- **User Profiles**: Manage your profile and preferences.
- **Interactive Typewriter Effect**: Watch generated recipes appear with a satisfying typing animation.
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices.
- **User-Friendly Interface**: Clean and intuitive design with consistent styling across pages.
- **Real-time Notifications**: Get feedback on actions like saving or generating recipes.

## 🚀 Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/SpMonish84/Recipe-Gen-AI
   cd recipe-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the server:
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. Open your web browser and visit: http://localhost:5000

## 🛠️ Technologies Used

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Typewriter.js for animations
  - Axios for API requests
  - CSS Grid and Flexbox for layouts
  - CSS Variables for theming
  - CSS Animations and Transitions
  - Font Awesome for icons

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - JWT for authentication
  - bcryptjs for password hashing
  - multer for file uploads
  - She Codes AI API for recipe generation

- **Development Tools:**
  - Git for version control
  - VS Code (recommended IDE)
  - Nodemon for development
  - Jest for testing

## 📁 Project Structure

```
recipe-generator/
├── server.js           # Main server file
├── config/            # Configuration files
│   └── db.js         # Database configuration
├── models/           # Database models
│   ├── User.js      # User model
│   └── Recipe.js    # Recipe model
├── routes/           # API routes
│   ├── userRoutes.js
│   └── recipeRoutes.js
├── middleware/       # Custom middleware
│   └── authMiddleware.js
├── src/             # Frontend source
│   ├── styles.css   # Global styling
│   ├── script.js    # Core application logic
│   ├── components/  # Reusable components
│   ├── pages/       # HTML pages
│   └── assets/      # Static assets
├── uploads/         # File upload directory
├── package.json     # Project dependencies
└── README.md        # Project documentation
```

## 💡 How to Use

- **Authentication:**
  - Register a new account
  - Login with your credentials
  - Manage your profile and preferences

- **Recipe Generation:**
  - Enter ingredients or a dish you want to cook
  - Click "Generate" to get an AI-powered recipe
  - Save generated recipes to your collection

- **Recipe Management:**
  - View all your saved recipes
  - Edit or delete existing recipes
  - Search and filter recipes
  - Mark recipes as favorites

## 🔧 Configuration

1. **Environment Variables:**
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT token generation
   - `PORT`: Server port (default: 5000)
   - `SheCodes_API_KEY`: Your She Codes API key for recipe generation

2. **API Keys:**
   - She Codes AI API key is required for recipe generation
   - Configure in the environment variables

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- CORS configuration
- Secure file uploads
- Environment variable protection
- Rate limiting for API endpoints

## 🧪 Testing

Run tests using Jest:
```bash
npm test