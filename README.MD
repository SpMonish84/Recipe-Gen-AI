# AI Recipe Generator 🍳

A modern web application that generates delicious recipes using artificial intelligence. Simply tell the app what you'd like to cook, and it will provide you with a detailed, easy-to-follow recipe.

## 🌟 Features

- **AI-Powered Recipe Generation**: Get instant recipes for any dish you can imagine
- **Interactive Typewriter Effect**: Watch recipes appear with a satisfying typing animation
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **User-Friendly Interface**: Clean and intuitive design for the best user experience
- **Real-time Generation**: Get your recipe instantly without any waiting

## 🚀 Quick Start

1. Clone the repository:
   ```bash
   git clone 
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

- **Backend:**
  - SheCodes AI API for recipe generation

## 📁 Project Structure

```
recipe-generator/
├── index.html          # Main HTML file
├── src/
│   ├── styles.css     # Styling
│   └── script.js      # Application logic
└── README.md          # Documentation
```

## 💡 How to Use

1. Enter the type of recipe you want (e.g., "chocolate cake", "vegetarian pasta", "chicken curry")
2. Click the "Generate Recipe" button
3. Watch as the AI generates your recipe with a typewriter effect
4. Follow the recipe instructions to create your dish!

## 🔧 Configuration

The application uses the SheCodes AI API for recipe generation. The API key is already configured in the application.