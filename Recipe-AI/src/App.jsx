import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box, Container } from '@mui/material';
import { AppProvider } from './context/AppContext';
import Navigation from './components/Navigation';
import CreateRecipe from './components/CreateRecipe';
import Dashboard from './components/Dashboard';
import FavouriteRecipe from './components/FavouriteRecipe';
import Ingredients from './components/Ingredients';
import Recipes from './components/Recipes';
import UploadInvoice from './components/UploadInvoice';

// Create a theme instance
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppProvider>
                <Router>
                    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                        <Navigation />
                        <Container maxWidth="lg" sx={{ py: 4 }}>
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/create-recipe" element={<CreateRecipe />} />
                                <Route path="/recipes" element={<Recipes />} />
                                <Route path="/favourite-recipe" element={<FavouriteRecipe />} />
                                <Route path="/ingredients" element={<Ingredients />} />
                                <Route path="/upload-invoice" element={<UploadInvoice />} />
                            </Routes>
                        </Container>
                    </Box>
                </Router>
            </AppProvider>
        </ThemeProvider>
    );
}

export default App;
