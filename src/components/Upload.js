class Upload {
    constructor() {
        this.fileInput = document.getElementById('file-input');
        this.uploadBox = document.getElementById('upload-box');
        this.browseBtn = document.getElementById('browse-btn');
        this.processBtn = document.getElementById('process-btn');
        this.selectedFile = document.getElementById('selected-file');
        this.errorMessage = document.getElementById('error-message');
        this.extractedItems = document.getElementById('extracted-items');
        this.loadingModal = document.getElementById('loading-modal');
        
        this.initEventListeners();
    }

    initEventListeners() {
        // Browse button click
        this.browseBtn.addEventListener('click', () => {
            this.fileInput.click();
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Drag and drop events
        this.uploadBox.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadBox.classList.add('dragover');
        });

        this.uploadBox.addEventListener('dragleave', () => {
            this.uploadBox.classList.remove('dragover');
        });

        this.uploadBox.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadBox.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files[0]);
        });

        // Process button click
        this.processBtn.addEventListener('click', () => {
            this.processFile();
        });
    }

    handleFileSelect(file) {
        if (!file) return;

        // Check file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!validTypes.includes(file.type)) {
            this.showError('Please upload a valid file type (image, PDF, Word document, or text file)');
            return;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('File size should be less than 10MB');
            return;
        }

        // Clear previous error
        this.hideError();

        // Show selected file
        this.selectedFile.textContent = `Selected file: ${file.name}`;
        this.processBtn.style.display = 'block';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        this.processBtn.style.display = 'none';
        this.selectedFile.textContent = '';
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }

    showLoading() {
        this.loadingModal.style.display = 'flex';
    }

    hideLoading() {
        this.loadingModal.style.display = 'none';
    }

    showNotification(message, type = 'info') {
        const notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.classList.add('notification-slide-in');
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        notificationContainer.appendChild(notification);

        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.classList.add('notification-slide-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });

        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('notification-slide-out');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }

    async processFile() {
        const file = this.fileInput.files[0];
        if (!file) return;

        this.showLoading();

        try {
            // Convert file to base64
            const base64File = await this.fileToBase64(file);

            // Call SheCodes AI API
            const apiKey = "16t1b3fa04b8866116ccceb0d2do3a04";
            const prompt = `[RECIPE EXTRACTION TRAINING]
You are being trained to extract complete recipes from images. The image is provided in base64 format.

RECIPE EXTRACTION PROTOCOL:

1. INITIAL RECIPE SCAN
   - Look for recipe title/name
   - Identify recipe description
   - Find ingredient lists
   - Locate cooking instructions
   - Check for cooking time
   - Look for serving size
   - Note any special equipment needed

2. DETAILED RECIPE ANALYSIS
   a) Recipe Title and Description:
      - Extract the recipe name
      - Find any descriptive text
      - Note cuisine type
      - Look for difficulty level
      - Check for dietary information

   b) Ingredient List:
      - Extract all ingredients
      - Note exact quantities
      - Include measurements
      - List any substitutions
      - Check for optional ingredients

   c) Cooking Instructions:
      - Find step-by-step directions
      - Note cooking temperatures
      - Extract cooking times
      - List preparation steps
      - Include any tips or notes

3. RECIPE COMPONENTS TO EXTRACT
   * Recipe Header
     - Title
     - Description
     - Cuisine type
     - Difficulty level
     - Preparation time
     - Cooking time
     - Total time
     - Servings

   * Ingredients
     - Exact quantities
     - Measurements
     - Ingredient names
     - Optional items
     - Substitutions

   * Instructions
     - Preparation steps
     - Cooking steps
     - Temperature settings
     - Time requirements
     - Special techniques
     - Tips and notes

   * Additional Information
     - Equipment needed
     - Storage instructions
     - Serving suggestions
     - Nutritional information
     - Dietary notes

4. EXTRACTION FORMAT
Format your findings exactly like this example:
<h1>Classic Chocolate Chip Cookies</h1>
<p>A delicious, chewy cookie recipe that's perfect for any occasion. Makes about 24 cookies.</p>

<h2>Ingredients</h2>
<ul>
    <li>2 1/4 cups all-purpose flour</li>
    <li>1 teaspoon baking soda</li>
    <li>1 teaspoon salt</li>
    <li>1 cup (2 sticks) butter, softened</li>
    <li>3/4 cup granulated sugar</li>
    <li>3/4 cup packed brown sugar</li>
    <li>2 large eggs</li>
    <li>2 teaspoons vanilla extract</li>
    <li>2 cups chocolate chips</li>
</ul>

<h2>Instructions</h2>
<ol>
    <li>Preheat oven to 375°F (190°C).</li>
    <li>Mix flour, baking soda, and salt in a small bowl.</li>
    <li>Beat butter, granulated sugar, and brown sugar until creamy.</li>
    <li>Add eggs and vanilla; beat well.</li>
    <li>Gradually mix in flour mixture.</li>
    <li>Stir in chocolate chips.</li>
    <li>Drop rounded tablespoons onto ungreased baking sheets.</li>
    <li>Bake for 9 to 11 minutes or until golden brown.</li>
    <li>Cool on baking sheets for 2 minutes; remove to wire racks to cool completely.</li>
</ol>

<h2>Notes</h2>
<ul>
    <li>Preparation time: 15 minutes</li>
    <li>Cooking time: 11 minutes</li>
    <li>Total time: 26 minutes</li>
    <li>Servings: 24 cookies</li>
    <li>Storage: Keep in airtight container for up to 1 week</li>
</ul>

CRITICAL EXTRACTION RULES:
1. Extract EVERY component of the recipe
2. Be extremely precise with measurements
3. Include ALL cooking instructions
4. Note any special techniques
5. Include preparation and cooking times
6. List all required equipment
7. Extract any tips or notes
8. Include serving information
9. Note storage instructions
10. Include dietary information if available

Remember: Your goal is to extract a complete, usable recipe from the image. Every detail matters.`;

            const context = `You are an expert recipe extraction AI. Your primary mission is to identify and extract complete recipes from the provided image. The image is provided in base64 format.

Your advanced capabilities:
1. Recipe component identification
2. Text recognition and extraction
3. Measurement and quantity detection
4. Cooking instruction analysis
5. Time and temperature recognition
6. Ingredient list extraction
7. Equipment identification
8. Note and tip detection
9. Dietary information extraction
10. Recipe formatting

Extraction priorities:
- Recipe title and description
- Complete ingredient list
- Step-by-step instructions
- Cooking times and temperatures
- Equipment requirements
- Preparation steps
- Serving information
- Storage instructions
- Tips and notes
- Dietary information

Remember: Extract EVERY detail of the recipe. Accuracy is crucial for successful cooking.`;

            // Include the image data in the API call
            const response = await axios.get(`https://api.shecodes.io/ai/v1/generate?prompt=${encodeURIComponent(prompt)}&context=${encodeURIComponent(context)}&key=${apiKey}&image=${encodeURIComponent(base64File)}`);

            // Process the response
            const content = response.data.answer;
            
            if (!content || content.trim() === '') {
                throw new Error('No recipe was extracted from the image');
            }

            // Save as recipe
            this.saveAsRecipe(content);
            this.showNotification('Recipe extracted and added to your collection!', 'success');

            // Display extracted content
            this.displayExtractedContent(content, true);

        } catch (error) {
            console.error('Error processing image:', error);
            this.showNotification('Failed to extract recipe from the image. Please try again with a clearer image.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }

    saveAsRecipe(content) {
        // Parse the content to extract recipe details
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        const name = tempDiv.querySelector('h1')?.textContent.trim() || 'Extracted Recipe';
        const description = tempDiv.querySelector('p')?.textContent.trim() || 'A recipe extracted from your image.';
        
        const ingredients = [];
        const ingredientsList = tempDiv.querySelector('h2:contains("Ingredients")')?.nextElementSibling;
        if (ingredientsList && ingredientsList.tagName === 'UL') {
            ingredientsList.querySelectorAll('li').forEach(li => {
                ingredients.push(li.textContent.trim());
            });
        }

        let instructions = '';
        const instructionsElement = tempDiv.querySelector('h2:contains("Instructions")')?.nextElementSibling;
        if (instructionsElement && instructionsElement.tagName === 'OL') {
            const steps = [];
            instructionsElement.querySelectorAll('li').forEach(li => {
                steps.push(li.textContent.trim());
            });
            instructions = steps.join('\n');
        }

        // Create new recipe object
        const newRecipe = {
            _id: this.generateUniqueId(),
            name,
            description,
            ingredients,
            instructions,
            is_fav: false
        };

        // Save to localStorage
        const storedRecipes = localStorage.getItem('allRecipes');
        const recipes = storedRecipes ? JSON.parse(storedRecipes) : [];
        recipes.push(newRecipe);
        localStorage.setItem('allRecipes', JSON.stringify(recipes));
    }

    displayExtractedContent(content, isRecipe) {
        this.extractedItems.innerHTML = `
            <div class="extracted-content">
                <h3>Extracted Ingredients</h3>
                <div class="content-preview">
                    ${content}
                </div>
            </div>
        `;
    }

    generateUniqueId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}

// Initialize the component when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.upload = new Upload();
}); 