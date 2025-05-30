import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Checkbox,
    IconButton,
    InputAdornment,
    Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import { mockIngredients } from '../mockData';

const Ingredients = ({ showNotification, setLoading }) => {
    const [ingredients, setIngredients] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [newIngredient, setNewIngredient] = useState({
        name: '',
        quantity: 1,
        is_vegetable_or_fruit: false
    });

    const API_URL = 'http://localhost:8000/api';

    useEffect(() => {
        // Simulate loading data
        setTimeout(() => {
            setIngredients(mockIngredients);
        }, 500);
    }, []);

    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        setNewIngredient({
            ...newIngredient,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleDeleteIngredient = async () => {
        if (!selectedIngredient) return;
        
        setLoading(true);
        try {
            const response = await axios.delete(`${API_URL}/delete-ingredient/${selectedIngredient._id}`);
            if (response.data.success) {
                showNotification('Ingredient deleted successfully', 'success');
                fetchIngredients();
            } else {
                showNotification('Failed to delete ingredient', 'error');
            }
        } catch (error) {
            console.error('Error deleting ingredient:', error);
            showNotification('Failed to delete ingredient', 'error');
        } finally {
            setLoading(false);
            setDeleteDialogOpen(false);
            setSelectedIngredient(null);
        }
    };

    const handleAddIngredient = async () => {
        if (!newIngredient.name.trim()) {
            showNotification('Please enter an ingredient name', 'warning');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/add-ingredient`, {
                ...newIngredient,
                quantity: Number(newIngredient.quantity)
            });

            fetchIngredients();
            setDialogOpen(false);
            setNewIngredient({
                name: '',
                quantity: 1,
                is_vegetable_or_fruit: false
            });
            showNotification('Ingredient added successfully', 'success');
        } catch (error) {
            console.error('Error adding ingredient:', error);
            showNotification('Failed to add ingredient', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredIngredients = ingredients.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const groupedIngredients = {
        vegetablesFruits: filteredIngredients.filter(item => item.is_vegetable_or_fruit),
        other: filteredIngredients.filter(item => !item.is_vegetable_or_fruit)
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">Ingredients</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setDialogOpen(true)}
                >
                    Add Ingredient
                </Button>
            </Box>

            <Box mb={4}>
                <TextField
                    fullWidth
                    placeholder="Search ingredients..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: searchText && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearchText('')}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Available Ingredients
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <List>
                                {ingredients.map((ingredient, index) => (
                                    <div key={ingredient.id}>
                                        <ListItem>
                                            <ListItemText
                                                primary={ingredient.name}
                                                secondary={`Quantity: ${ingredient.quantity} • Added: ${new Date(ingredient.itemAdded).toLocaleDateString()}`}
                                            />
                                            <Chip
                                                label={ingredient.is_vegetable_or_fruit ? 'Vegetable/Fruit' : 'Other'}
                                                color={ingredient.is_vegetable_or_fruit ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </ListItem>
                                        {index < ingredients.length - 1 && <Divider />}
                                    </div>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Add Ingredient Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Ingredient</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Ingredient Name"
                        type="text"
                        fullWidth
                        value={newIngredient.name}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="quantity"
                        label="Quantity"
                        type="number"
                        fullWidth
                        value={newIngredient.quantity}
                        onChange={handleInputChange}
                        inputProps={{ min: 1 }}
                        sx={{ mb: 2 }}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={newIngredient.is_vegetable_or_fruit}
                                onChange={handleInputChange}
                                name="is_vegetable_or_fruit"
                                color="primary"
                            />
                        }
                        label="Is this a vegetable or fruit?"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddIngredient} color="primary" variant="contained">
                        Add Ingredient
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setSelectedIngredient(null);
                }}
            >
                <DialogTitle>Delete Ingredient</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete {selectedIngredient?.name}?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setDeleteDialogOpen(false);
                            setSelectedIngredient(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteIngredient}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Ingredients;
