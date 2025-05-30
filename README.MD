# AI Recipe Generator 🍳

A modern web application that generates delicious recipes using artificial intelligence. Simply tell the app what you'd like to cook, and it will provide you with a detailed, easy-to-follow recipe.

## 🌟 Features

- **AI-Powered Recipe Generation**: Get instant recipes for any dish you can imagine
- **Interactive Typewriter Effect**: Watch recipes appear with a satisfying typing animation
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **User-Friendly Interface**: Clean and intuitive design for the best user experience
- **Real-time Generation**: Get your recipe instantly without any waiting
- **Recipe Management**: Save and manage your favorite recipes locally
- **Dark/Light Mode**: Toggle between dark and light themes for comfortable viewing
- **Recipe Collection**: View all your saved recipes in one place
- **Favorites System**: Mark and filter your favorite recipes
- **Local Storage**: All recipes are saved locally in your browser

## 🚀 Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/recipe-generator.git
   cd recipe-generator
   ```

2. Run the application using one of these methods:

   **Using Python:**
   ```bash
   python -m http.server 5500
   ```
   Then visit: http://localhost:5500

   **Using Node.js:**
   ```bash
   npx http-server -p 5500
   ```
   Then visit: http://localhost:5500

3. Open your web browser and start generating recipes!

## 🛠️ Technologies Used

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Typewriter.js for animations
  - Axios for API requests
  - LocalStorage API for data persistence
  - CSS Grid and Flexbox for layouts
  - CSS Variables for theming
  - CSS Animations and Transitions
  - Font Awesome for icons

- **Backend:**
  - SheCodes AI API for recipe generation

- **Development Tools:**
  - Git for version control
  - VS Code (recommended IDE)
  - Live Server for development

## 📁 Project Structure

```
recipe-generator/
├── index.html          # Main HTML file
├── src/
│   ├── styles.css     # Styling
│   ├── script.js      # Application logic
│   ├── components/    # Reusable components
│   │   ├── Recipes.js
│   │   └── FavoriteRecipes.js
│   └── pages/         # Page components
│       ├── home.html
│       ├── recipes.html
│       └── favorites.html
└── README.md          # Documentation
```

## 💡 How to Use

1. Enter the type of recipe you want (e.g., "chocolate cake", "vegetarian pasta", "chicken curry")
2. Click the "Generate Recipe" button
3. Watch as the AI generates your recipe with a typewriter effect
4. Save the recipe to your collection if you like it
5. Access your saved recipes from the Recipes page
6. Mark recipes as favorites for quick access

## 🔧 Configuration

The application uses the SheCodes AI API for recipe generation. The API key is already configured in the application.

## 🎨 Theme Customization

The application supports both dark and light themes. The theme can be toggled using the theme switch in the navigation bar. The theme preference is saved in localStorage and persists across sessions.

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen sizes and orientations

## 🔒 Data Privacy

All recipe data is stored locally in your browser using localStorage. No data is sent to external servers except for the recipe generation API calls.