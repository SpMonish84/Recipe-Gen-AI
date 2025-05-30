// Navigation handling
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active class from all links and pages
            navLinks.forEach(l => l.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));

            // Add active class to clicked link
            link.classList.add('active');

            // Show corresponding page
            const pageId = `${link.dataset.page}-page`;
            document.getElementById(pageId).classList.add('active');
        });
    });

    // Initialize components - Removed: Components now self-initialize.
    // initializeComponents(); // Removed
});

// Notification system
function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Add icon based on notification type
    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    notification.appendChild(icon);
    
    // Add message
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    notification.appendChild(messageSpan);

    container.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    }, 3000);
}

// Loading state management
function setLoading(isLoading, containerId = null) {
    const loadingSpinner = containerId 
        ? document.querySelector(`#${containerId} .loading-spinner`)
        : document.querySelector('.loading-spinner');
    
    if (loadingSpinner) {
        if (isLoading) {
            loadingSpinner.classList.remove('hidden');
        } else {
            loadingSpinner.classList.add('hidden');
        }
    }
}

// Recipe generator form handling
function displayRecipe(response) {
  console.log("recipe generated");
    // Use the recipeElement directly instead of re-selecting
    const recipeElement = document.querySelector("#recipe"); // Ensure recipeElement is accessible or re-select if needed

    // Clear previous content and hide loading
    recipeElement.innerHTML = ''; // Clear previous content
    setLoading(false); // Hide loading spinner

    // Assuming response.data.answer contains the generated text/HTML
    // We will use Typewriter on the text content. If the API returns HTML,
    // Typewriter will treat it as plain text, which might not be ideal
    // if complex formatting is expected via HTML. For a simple typing effect,
    // using the raw response is typical.

     new Typewriter(recipeElement, {
       strings: response.data.answer, // Assuming response.data.answer is the text to type
    autoStart: true,
       delay: 30, // Adjust typing speed if needed
       cursor: '', // Hide cursor after typing
  });

    // Show the save button after the recipe is displayed (after typing effect finishes is better, but harder to sync)
    // For simplicity, showing it immediately after the typewriter starts
    const saveButton = document.getElementById('save-recipe-btn');
    const generatedRecipeContainer = document.getElementById('generated-recipe-container');
    if (saveButton && generatedRecipeContainer) {
        // The container is initially hidden. Make it visible when a recipe starts generating.
        // This might be better placed at the start of generateRecipe function.
        // Let's move showing the container to generateRecipe.
        saveButton.classList.remove('hidden');
    }

    // Show success message
    showNotification('Recipe generated!', 'success');

}

function generateRecipe(event) {
  event.preventDefault();
  let instructions = document.querySelector("#user-instructions").value;
    let apiKey = "16t1b3fa04b8866116ccceb0d2do3a04"; // SheCodes API Key
  let prompt = `User instructions are: Generate a recipe for ${instructions}`;
  let context =
    "You are an expert at recipes. Your mission is to generate a short and easy recipe in basic HTML. Make sure to follow user instructions. Sign the recipe at the end with '<strong>SheCodes AI</strong>' in bold";

  let apiUrl = `https://api.shecodes.io/ai/v1/generate?prompt=${prompt
  }&context=${context}&key=${apiKey}`;

    let recipeElement = document.querySelector("#recipe");
    const generatedRecipeContainer = document.getElementById('generated-recipe-container');

    // Show the container and loading spinner
    if(generatedRecipeContainer) generatedRecipeContainer.classList.remove('hidden');
    if(recipeElement) recipeElement.innerHTML = `<div class="blink">👩🏽‍🍳 Generating recipe for ${instructions}..</div>`;
    setLoading(true); // Show loading spinner

    // Hide save button while generating
    const saveButton = document.getElementById('save-recipe-btn');
     if (saveButton) saveButton.classList.add('hidden');

  console.log("generating recipe");

    axios.get(apiUrl)
        .then(displayRecipe)
        .catch(error => {
            console.error('API Error:', error);
            showNotification('Failed to generate recipe. Please check your input and API key.', 'error');
            setLoading(false); // Hide loading spinner on error
        });
}

let recipeForm = document.querySelector("#recipe-generator-form");
if (recipeForm) { // Ensure form exists before adding listener
recipeForm.addEventListener("submit", generateRecipe);
}

// Add event listener for the Save Recipe button
const saveRecipeBtn = document.getElementById('save-recipe-btn');
if (saveRecipeBtn) {
    saveRecipeBtn.addEventListener('click', () => {
        // Extract recipe details from the generated HTML
        const recipeElement = document.getElementById('recipe');
        const typewriterSpan = recipeElement ? recipeElement.querySelector('.Typewriter__wrapper') : null;

        if (!typewriterSpan) {
            showNotification('Could not find generated recipe content to save.', 'error');
            console.warn('Typewriter span not found');
            return;
        }

        // Get the raw HTML content from the typewriter span
        let rawHtml = typewriterSpan.innerHTML;

        // Clean up markdown fences and comments
        // Remove ```html and ```
        rawHtml = rawHtml.replace(/^\s*```html\s*\n*/, '').replace(/\s*```\s*$/, '');
        // Remove HTML comments (<!-- ... -->)
        rawHtml = rawHtml.replace(/<!--[\s\S]*?-->/g, '');
        // Remove empty lines that might be left over
        rawHtml = rawHtml.replace(/^\s*\n/gm, '');


        // Create a temporary DOM element to parse the cleaned HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = rawHtml;

        // Extract details based on the actual structure (h1, ul, ol)
        const nameElement = tempDiv.querySelector('h1');
        // Get the first ul for ingredients
        const ingredientsList = tempDiv.querySelector('ul');
        // Get the ol for instructions
        const instructionsList = tempDiv.querySelector('ol');

        const name = nameElement ? nameElement.textContent.trim() : 'Unnamed Recipe';
        const description = ''; // Description is not provided in this format

        const ingredients = [];
        if (ingredientsList) {
            ingredientsList.querySelectorAll('li').forEach(li => {
                ingredients.push(li.textContent.trim());
            });
        }

        const instructions = [];
         if (instructionsList) {
            instructionsList.querySelectorAll('li').forEach(li => {
                instructions.push(li.textContent.trim());
            });
        }
        // Join instructions with newline for saving
        const instructionsText = instructions.join('\n');

        // Basic validation
        if (!name || ingredients.length === 0 || instructions.length === 0) {
             showNotification('Could not extract complete recipe details. Cannot save.', 'error');
             console.warn('Failed to extract recipe details:', { name, ingredients, instructions });
            return;
        }

        // Generate a unique ID (same logic as in Recipes.js)
        const generateUniqueId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const newRecipe = {
            _id: generateUniqueId(),
            name: name,
            description: description,
            ingredients: ingredients,
            instructions: instructionsText,
            is_fav: false // New recipes are not favorited by default
        };

        // Load existing recipes from localStorage
        const allRecipes = JSON.parse(localStorage.getItem('allRecipes')) || [];

        // Check if a recipe with the same name already exists to avoid duplicates (optional)
        const exists = allRecipes.some(recipe => recipe.name === newRecipe.name);
        if (exists) {
            showNotification('Recipe with this name already exists in your collection.', 'info');
            return;
        }

        // Add the new recipe
        allRecipes.push(newRecipe);

        // Save back to localStorage
        localStorage.setItem('allRecipes', JSON.stringify(allRecipes));

        showNotification('Recipe saved to your collection!', 'success');
    });
}

// The actual initialization logic for Recipes and FavoriteRecipes
// is now located at the end of their respective files (Recipes.js and FavoriteRecipes.js)
// using document.addEventListener('DOMContentLoaded', ...)

// The Type Error was caused by trying to append the component instance object itself,
// not a DOM node, to the container.
