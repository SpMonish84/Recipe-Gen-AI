import { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Divider,
    Paper,
    Chip,
    FormControlLabel,
    Checkbox,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

const CreateRecipe = () => {
    const [customRecipe, setCustomRecipe] = useState({
        name: '',
        ingredients: [],
        instructions: '',
        is_veg: true,
        is_fav: false
    });
    const [newIngredient, setNewIngredient] = useState('');
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    const handleCustomRecipeChange = (e) => {
        const { name, value } = e.target;
        setCustomRecipe({
            ...customRecipe,
            [name]: value
        });
    };

    const handleAddIngredient = () => {
        if (newIngredient.trim()) {
            setCustomRecipe({
                ...customRecipe,
                ingredients: [...customRecipe.ingredients, newIngredient.trim()]
            });
            setNewIngredient('');
        }
    };

    const handleRemoveIngredient = (index) => {
        const updatedIngredients = [...customRecipe.ingredients];
        updatedIngredients.splice(index, 1);
        setCustomRecipe({
            ...customRecipe,
            ingredients: updatedIngredients
        });
    };

    const saveCustomRecipe = () => {
        if (!customRecipe.name.trim()) {
            showNotification('Please enter a recipe name', 'warning');
            return;
        }

        if (customRecipe.ingredients.length === 0) {
            showNotification('Please add at least one ingredient', 'warning');
            return;
        }

        if (!customRecipe.instructions.trim()) {
            showNotification('Please add cooking instructions', 'warning');
            return;
        }

        // Simulate saving
        setTimeout(() => {
            showNotification('Recipe saved successfully!', 'success');
            
            // Reset form
            setCustomRecipe({
                name: '',
                ingredients: [],
                instructions: '',
                is_veg: true,
                is_fav: false
            });
        }, 500);
    };

    const showNotification = (message, severity = 'info') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Create Recipe
            </Typography>

            <Grid container spacing={3}>
                {/* Custom Recipe Creation */}
                <Grid item xs={12}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Create Custom Recipe
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <TextField
                                fullWidth
                                label="Recipe Name"
                                name="name"
                                value={customRecipe.name}
                                onChange={handleCustomRecipeChange}
                                margin="normal"
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={customRecipe.is_veg}
                                        onChange={(e) => setCustomRecipe(prev => ({ ...prev, is_veg: e.target.checked }))}
                                        name="is_veg"
                                    />
                                }
                                label="Vegetarian Recipe"
                                sx={{ mb: 2 }}
                            />

                            <Box mt={2} mb={2}>
                                <Typography variant="subtitle2" gutterBottom>Ingredients</Typography>
                                <Box display="flex">
                                    <TextField
                                        fullWidth
                                        label="Add Ingredient"
                                        value={newIngredient}
                                        onChange={(e) => setNewIngredient(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                                    />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        sx={{ ml: 1 }}
                                        onClick={handleAddIngredient}
                                    >
                                        <AddIcon />
                                    </Button>
                                </Box>

                                <Box mt={2} sx={{ maxHeight: 150, overflow: 'auto' }}>
                                    {customRecipe.ingredients.length > 0 ? (
                                        <List dense>
                                            {customRecipe.ingredients.map((ingredient, index) => (
                                                <ListItem
                                                    key={index}
                                                    secondaryAction={
                                                        <IconButton
                                                            edge="end"
                                                            aria-label="delete"
                                                            onClick={() => handleRemoveIngredient(index)}
                                                            size="small"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    }
                                                >
                                                    <Chip label={ingredient} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                                            No ingredients added yet
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            <TextField
                                fullWidth
                                label="Cooking Instructions"
                                name="instructions"
                                value={customRecipe.instructions}
                                onChange={handleCustomRecipeChange}
                                margin="normal"
                                multiline
                                rows={6}
                            />

                            <Box mt={3} display="flex" justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={saveCustomRecipe}
                                >
                                    Save Recipe
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CreateRecipe;
