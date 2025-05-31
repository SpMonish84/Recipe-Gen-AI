# AI Recipe Generator 🍳

A modern web application that helps you manage your ingredients and generate delicious recipes using artificial intelligence.

## 🌟 Features

- **AI-Powered Recipe Generation**: Get instant recipes for any dish you can imagine.
- **Generate from Pantry**: Create recipes using the ingredients you currently have in your pantry.
- **Upload Recipe/Ingredients**: Upload images or documents to extract recipes and ingredients automatically using AI.
- **Pantry Management**: Organize and track your pantry items with categories.
- **Interactive Dashboard**: Get an overview of your recipes, pantry, expiring ingredients, and AI-powered recipe suggestions.
- **Interactive Typewriter Effect**: Watch generated recipes appear with a satisfying typing animation.
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices.
- **User-Friendly Interface**: Clean and intuitive design with consistent styling across pages.
- **Recipe Management**: Save, view, and manage your recipe collection.
- **Favorites System**: Mark and filter your favorite recipes.
- **Local Storage**: All recipe and pantry data is saved locally in your browser.
- **Notifications**: Get feedback on actions like saving or generating recipes.

## 🚀 Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/SpMonish84/Recipe-Gen-AI
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

3. Open your web browser and start managing your pantry and generating recipes!

## 🛠️ Technologies Used

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Typewriter.js for animations
  - Axios for API requests
  - Chart.js for data visualization
  - LocalStorage API for data persistence
  - CSS Grid and Flexbox for layouts
  - CSS Variables for theming
  - CSS Animations and Transitions
  - Font Awesome for icons

- **Backend:**
  - SheCodes AI API for recipe generation and content analysis

- **Development Tools:**
  - Git for version control
  - VS Code (recommended IDE)
  - Live Server for development

## 📁 Project Structure

```
recipe-generator/
├── index.html          # Main entry point
├── src/
│   ├── styles.css     # Global styling
│   ├── script.js      # Core application logic / shared functions
│   ├── components/    # Reusable JavaScript components
│   │   ├── Dashboard.js
│   │   ├── Recipes.js
│   │   ├── Pantry.js
│   │   ├── Upload.js
│   │   ├── FavoriteRecipes.js
│   │   └── CreateRecipe.js
│   └── pages/         # HTML files for each page
│       ├── home.html
│       ├── dashboard.html
│       ├── recipes.html
│       ├── favorites.html
│       ├── pantry.html
│       └── upload.html
└── README.md          # Project documentation
```

## 💡 How to Use

- **Home:** Enter ingredients or a dish you want to cook and click "Generate" to get a recipe from AI.
- **Recipes:** View your saved recipes. Use the search bar to find recipes, mark favorites, or delete recipes. Generate recipes from your pantry items.
- **Favorites:** See only your favorited recipes.
- **Pantry:** Manage your ingredient inventory, categorized for easy tracking. Add new items and their expiry dates.
- **Upload:** Upload images or documents containing recipes or ingredient lists to have the AI extract and save them.
- **Dashboard:** Get an overview of your recipe and pantry stats, see expiring ingredients, and get AI recipe suggestions.

## 🔧 Configuration

The application uses the SheCodes AI API. Ensure your API key is correctly configured in the application's JavaScript files where API calls are made.

## 📱 Responsive Design

The application is designed to be responsive and provide a good user experience on various devices.