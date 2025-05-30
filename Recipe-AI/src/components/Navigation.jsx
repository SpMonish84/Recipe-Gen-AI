import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Navigation() {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Recipe AI
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button color="inherit" component={RouterLink} to="/">
                        Dashboard
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/create-recipe">
                        Create Recipe
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/recipes">
                        Recipes
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/favourite-recipe">
                        Favorites
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/ingredients">
                        Ingredients
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/upload-invoice">
                        Upload Invoice
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navigation; 