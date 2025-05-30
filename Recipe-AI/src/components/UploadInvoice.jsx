import { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    List,
    ListItem,
    Divider,
    Paper,
    Alert,
    AlertTitle,
    Checkbox,
    FormControlLabel,
    Snackbar
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Check as CheckIcon
} from '@mui/icons-material';

const UploadInvoice = () => {
    const [file, setFile] = useState(null);
    const [fileSelected, setFileSelected] = useState(false);
    const [extractedItems, setExtractedItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, loading, success, error
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setFileSelected(true);
            setUploadStatus('idle');
            setExtractedItems([]);
            setSelectedItems({});
        } else if (selectedFile) {
            showNotification('Please upload a PDF file', 'error');
            setFile(null);
            setFileSelected(false);
        }
    };

    const handleUpload = () => {
        if (!file) {
            showNotification('Please select a file to upload', 'warning');
            return;
        }

        setUploadStatus('loading');

        // Simulate processing
        setTimeout(() => {
            // Mock extracted items
            const mockExtractedItems = [
                { id: 1, name: 'Tomatoes', quantity: 5, category: 'vegetable' },
                { id: 2, name: 'Onions', quantity: 3, category: 'vegetable' },
                { id: 3, name: 'Chicken', quantity: 2, category: 'meat' },
                { id: 4, name: 'Rice', quantity: 1, category: 'grain' }
            ];

            setExtractedItems(mockExtractedItems);

            // Initialize all items as selected
            const initialSelectedState = {};
            mockExtractedItems.forEach(item => {
                initialSelectedState[item.id] = true;
            });
            setSelectedItems(initialSelectedState);

            setUploadStatus('success');
            showNotification('Invoice processed successfully', 'success');
        }, 1500);
    };

    const toggleItemSelection = (itemId) => {
        setSelectedItems({
            ...selectedItems,
            [itemId]: !selectedItems[itemId]
        });
    };

    const handleAddToInventory = () => {
        const selectedItemsList = extractedItems.filter(
            item => selectedItems[item.id]
        );

        if (selectedItemsList.length === 0) {
            showNotification('Please select at least one item', 'warning');
            return;
        }

        // Simulate adding to inventory
        setTimeout(() => {
            showNotification('Items added to inventory successfully', 'success');

            // Reset form
            setFile(null);
            setFileSelected(false);
            setExtractedItems([]);
            setSelectedItems({});
            setUploadStatus('idle');
        }, 1000);
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
                Upload Invoice
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Upload Receipt or Invoice
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <Box
                                sx={{
                                    border: '2px dashed #ccc',
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        bgcolor: 'action.hover'
                                    }
                                }}
                                onClick={() => document.getElementById('invoice-upload').click()}
                            >
                                <input
                                    type="file"
                                    id="invoice-upload"
                                    style={{ display: 'none' }}
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                />
                                <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="body1" gutterBottom>
                                    Click to upload or drag and drop
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Supported format: PDF
                                </Typography>

                                {fileSelected && (
                                    <Alert severity="success" sx={{ mt: 2, textAlign: 'left' }}>
                                        <AlertTitle>Selected File</AlertTitle>
                                        {file.name}
                                    </Alert>
                                )}
                            </Box>

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ mt: 3 }}
                                onClick={handleUpload}
                                disabled={!fileSelected || uploadStatus === 'loading'}
                            >
                                Process Invoice
                            </Button>

                            {uploadStatus === 'error' && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    <AlertTitle>Error</AlertTitle>
                                    Failed to process the invoice. Please try again or check the file format.
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Extracted Items
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            {uploadStatus === 'success' && extractedItems.length > 0 ? (
                                <>
                                    <Paper variant="outlined" sx={{ maxHeight: 350, overflow: 'auto', mb: 3 }}>
                                        <List dense>
                                            {extractedItems.map((item, index) => (
                                                <ListItem key={index} divider={index < extractedItems.length - 1}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={!!selectedItems[item.id]}
                                                                onChange={() => toggleItemSelection(item.id)}
                                                                color="primary"
                                                            />
                                                        }
                                                        label={
                                                            <Box>
                                                                <Typography variant="subtitle1">{item.name}</Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Quantity: {item.quantity || 1}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                        sx={{ width: '100%', margin: 0 }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Paper>

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        startIcon={<CheckIcon />}
                                        onClick={handleAddToInventory}
                                    >
                                        Add Selected Items to Inventory
                                    </Button>
                                </>
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {uploadStatus === 'loading'
                                            ? 'Processing invoice...'
                                            : 'Upload and process an invoice to see extracted items here'}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UploadInvoice;
