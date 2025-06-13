import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Paper,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';

class CreateRecipe {
    constructor() {
        this.recipe = {
            name: '',
            description: '',
            ingredients: [],
            instructions: []
        };
        this.availableIngredients = [
            'pasta',
            'tomato sauce',
            'garlic',
            'basil',
            'olive oil',
            'rice',
            'vegetables',
            'soy sauce',
            'ginger',
            'chicken',
            'beef',
            'pork',
            'fish',
            'eggs',
            'milk',
            'cheese',
            'butter',
            'flour',
            'sugar',
            'salt',
            'pepper'
        ];
        this.container = document.getElementById('create-recipe-container');
        this.render(); // Initial render
    }

    handleInputChange(e) {
        const { name, value } = e.target;
        this.recipe[name] = value;
        // Optional: Rerender specific parts if needed, but for inputs direct changes are fine
    }

    handleAddIngredient() {
        const ingredientInput = this.container.querySelector('#new-ingredient');
        const newIngredient = ingredientInput.value.trim();
        if (!newIngredient) return;

        this.recipe.ingredients.push(newIngredient);
        ingredientInput.value = '';
        this.renderIngredients();
        this.showNotification('Ingredient added', 'success');
    }

    handleRemoveIngredient(index) {
        this.recipe.ingredients.splice(index, 1);
        this.renderIngredients();
        this.showNotification('Ingredient removed', 'success');
    }

    handleAddInstruction() {
        const instructionInput = this.container.querySelector('#new-instruction');
        const newInstruction = instructionInput.value.trim();
        if (!newInstruction) return;

        this.recipe.instructions.push(newInstruction);
        instructionInput.value = '';
        this.renderInstructions();
        this.showNotification('Instruction added', 'success');
    }

    handleRemoveInstruction(index) {
        this.recipe.instructions.splice(index, 1);
        this.renderInstructions();
        this.showNotification('Instruction removed', 'success');
    }

    handleMoveInstruction(index, direction) {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === this.recipe.instructions.length - 1)
        ) return;

        const newInstructions = [...this.recipe.instructions];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newInstructions[index], newInstructions[newIndex]] = [newInstructions[newIndex], newInstructions[index]];

        this.recipe.instructions = newInstructions;
        this.renderInstructions();
    }

    handleSubmit(event) {
        event.preventDefault(); // Prevent default form submission

        if (!this.recipe.name.trim()) {
            this.showNotification('Please enter a recipe name', 'error'); // Use error type
            return;
        }

        if (this.recipe.ingredients.length === 0) {
            this.showNotification('Please add at least one ingredient', 'error'); // Use error type
            return;
        }

        if (this.recipe.instructions.length === 0) {
            this.showNotification('Please add at least one instruction', 'error'); // Use error type
            return;
        }

        // For development, just show a success message and log the recipe
        console.log('Recipe Submitted:', this.recipe);
        this.showNotification('Recipe created successfully', 'success');

        // Reset form
        this.recipe = {
            name: '',
            description: '',
            ingredients: [],
            instructions: []
        };
        this.render(); // Rerender the form to clear fields
    }

    showNotification(message, type) {
        const notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) {
             console.error('Notification container not found');
             return;
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        notificationContainer.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    renderIngredients() {
        const ingredientsListEl = this.container.querySelector('.ingredients-list');
        ingredientsListEl.innerHTML = this.recipe.ingredients.map((ingredient, index) => `
            <li class="ingredient-item">
                <span>${ingredient}</span>
                <button class="remove-item" onclick="createRecipe.handleRemoveIngredient(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </li>
        `).join('');
    }

    renderInstructions() {
         const instructionsListEl = this.container.querySelector('.instructions-list');
         instructionsListEl.innerHTML = this.recipe.instructions.map((instruction, index) => `
             <li class="instruction-item">
                 <span>Step ${index + 1}: ${instruction}</span>
                 <div class="instruction-actions">
                    <button class="move-up" onclick="createRecipe.handleMoveInstruction(${index}, 'up')" ${index === 0 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="move-down" onclick="createRecipe.handleMoveInstruction(${index}, 'down')" ${index === this.recipe.instructions.length - 1 ? 'disabled' : ''}>
                         <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="remove-item" onclick="createRecipe.handleRemoveInstruction(${index})">
                         <i class="fas fa-trash"></i>
                    </button>
                 </div>
             </li>
         `).join('');
    }

    render() {
        if (!this.container) {
            console.error('Create Recipe container not found');
            return;
        }

        // Use innerHTML to set the form structure
        this.container.innerHTML = `
            <div class="create-recipe-form">
                <h2>Create New Recipe</h2>
                <form id="create-recipe-form">
                    <div class="form-group">
                        <label for="name">Recipe Name</label>
                        <input type="text" id="name" name="name" value="${this.recipe.name}" required>
                    </div>

                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea id="description" name="description" rows="4">${this.recipe.description}</textarea>
                    </div>

                    <div class="form-group">
                        <label>Ingredients</label>
                        <div class="add-item-group">
                            <input type="text" id="new-ingredient" placeholder="Enter ingredient">
                            <button type="button" class="add-item-btn" id="add-ingredient-btn"><i class="fas fa-plus"></i> Add Ingredient</button>
                        </div>
                        <ul class="ingredients-list"></ul>
                    </div>

                    <div class="form-group">
                        <label>Instructions</label>
                         <div class="add-item-group">
                            <input type="text" id="new-instruction" placeholder="Enter instruction step">
                             <button type="button" class="add-item-btn" id="add-instruction-btn"><i class="fas fa-plus"></i> Add Instruction</button>
                         </div>
                        <ol class="instructions-list"></ol> <!-- Use ol for ordered list -->
                    </div>

                    <button type="submit" class="submit-recipe-btn">Create Recipe</button>
                </form>
            </div>
        `;

        // Attach event listeners AFTER rendering the HTML
        this.container.querySelector('#name').addEventListener('input', this.handleInputChange.bind(this));
        this.container.querySelector('#description').addEventListener('input', this.handleInputChange.bind(this));
        this.container.querySelector('#add-ingredient-btn').addEventListener('click', this.handleAddIngredient.bind(this));
        this.container.querySelector('#add-instruction-btn').addEventListener('click', this.handleAddInstruction.bind(this));
        this.container.querySelector('#create-recipe-form').addEventListener('submit', this.handleSubmit.bind(this));

        // Initial render of lists if there's initial data (though currently dummy data is empty initally)
        this.renderIngredients();
        this.renderInstructions();
    }
}

// Initialize the component when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.createRecipe = new CreateRecipe();
});

const CreateRecipe = ({ showNotification, setLoading }) => {
    const [recipe, setRecipe] = useState({
        name: '',
        description: '',
        ingredients: [],
        instructions: []
    });
    const [availableIngredients, setAvailableIngredients] = useState([]);
    const [newIngredient, setNewIngredient] = useState('');
    const [newInstruction, setNewInstruction] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        // Mock data for development
        setAvailableIngredients([
            'pasta',
            'tomato sauce',
            'garlic',
            'basil',
            'olive oil',
            'rice',
            'vegetables',
            'soy sauce',
            'ginger',
            'chicken',
            'beef',
            'pork',
            'fish',
            'eggs',
            'milk',
            'cheese',
            'butter',
            'flour',
            'sugar',
            'salt',
            'pepper'
        ]);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRecipe(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddIngredient = () => {
        if (!newIngredient.trim()) return;

        setRecipe(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, newIngredient.trim()]
        }));
        setNewIngredient('');
    };

    const handleRemoveIngredient = (index) => {
        setRecipe(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index)
        }));
    };

    const handleAddInstruction = () => {
        if (!newInstruction.trim()) return;

        setRecipe(prev => ({
            ...prev,
            instructions: [...prev.instructions, newInstruction.trim()]
        }));
        setNewInstruction('');
    };

    const handleRemoveInstruction = (index) => {
        setRecipe(prev => ({
            ...prev,
            instructions: prev.instructions.filter((_, i) => i !== index)
        }));
    };

    const handleMoveInstruction = (index, direction) => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === recipe.instructions.length - 1)
        ) return;

        const newInstructions = [...recipe.instructions];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newInstructions[index], newInstructions[newIndex]] = [newInstructions[newIndex], newInstructions[index]];

        setRecipe(prev => ({
            ...prev,
            instructions: newInstructions
        }));
    };

    const handleSubmit = () => {
        if (!recipe.name.trim()) {
            showNotification('Please enter a recipe name', 'warning');
            return;
        }

        if (recipe.ingredients.length === 0) {
            showNotification('Please add at least one ingredient', 'warning');
            return;
        }

        if (recipe.instructions.length === 0) {
            showNotification('Please add at least one instruction', 'warning');
            return;
        }

        // For development, just show a success message
        showNotification('Recipe created successfully', 'success');
        
        // Reset form
        setRecipe({
            name: '',
            description: '',
            ingredients: [],
            instructions: []
        });
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Create New Recipe
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <TextField
                            fullWidth
                            label="Recipe Name"
                            name="name"
                            value={recipe.name}
                            onChange={handleInputChange}
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={recipe.description}
                            onChange={handleInputChange}
                            multiline
                            rows={3}
                            sx={{ mb: 3 }}
                        />

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Ingredients
                            </Typography>
                            <Box display="flex" gap={1} mb={2}>
                                <Autocomplete
                                    freeSolo
                                    options={availableIngredients}
                                    value={newIngredient}
                                    onChange={(_, value) => setNewIngredient(value || '')}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            label="Add Ingredient"
                                            variant="outlined"
                                        />
                                    )}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleAddIngredient}
                                    startIcon={<AddIcon />}
                                >
                                    Add
                                </Button>
                            </Box>
                            <List>
                                {recipe.ingredients.map((ingredient, index) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={ingredient} />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleRemoveIngredient(index)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Instructions
                            </Typography>
                            <Box display="flex" gap={1} mb={2}>
                                <TextField
                                    fullWidth
                                    label="Add Instruction"
                                    value={newInstruction}
                                    onChange={(e) => setNewInstruction(e.target.value)}
                                    multiline
                                    rows={2}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleAddInstruction}
                                    startIcon={<AddIcon />}
                                >
                                    Add
                                </Button>
                            </Box>
                            <List>
                                {recipe.instructions.map((instruction, index) => (
                                    <ListItem key={index}>
                                        <ListItemText
                                            primary={`Step ${index + 1}`}
                                            secondary={instruction}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleMoveInstruction(index, 'up')}
                                                disabled={index === 0}
                                            >
                                                <ArrowUpwardIcon />
                                            </IconButton>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleMoveInstruction(index, 'down')}
                                                disabled={index === recipe.instructions.length - 1}
                                            >
                                                <ArrowDownwardIcon />
                                            </IconButton>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleRemoveInstruction(index)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        <Box mt={4} display="flex" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleSubmit}
                                disabled={!recipe.name.trim() || recipe.ingredients.length === 0 || recipe.instructions.length === 0}
                            >
                                Create Recipe
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CreateRecipe; 