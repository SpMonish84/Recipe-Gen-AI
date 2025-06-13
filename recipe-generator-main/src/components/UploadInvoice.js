// Vanilla JS Upload Invoice Component
class UploadInvoice {
    constructor() {
        this.selectedFile = null;
        this.uploadedItems = [];
        this.uploading = false;
        this.error = '';
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.type === 'application/pdf' || file.type === 'image/jpeg' || file.type === 'image/png') {
                this.selectedFile = file;
                this.error = '';
            } else {
                this.error = 'Please select a PDF, JPEG, or PNG file';
                this.selectedFile = null;
            }
        }
        this.render();
    }

    handleUpload() {
        if (!this.selectedFile) {
            this.error = 'Please select a file first';
            this.render();
            return;
        }
        this.uploading = true;
        this.error = '';
        this.render();
        setTimeout(() => {
            // Mock detected items
            this.uploadedItems = [
                { name: 'Tomatoes', quantity: 5 },
                { name: 'Onions', quantity: 3 },
                { name: 'Garlic', quantity: 2 },
                { name: 'Olive Oil', quantity: 1 }
            ];
            this.uploading = false;
            alert('Invoice processed successfully!');
            this.render();
        }, 1500);
    }

    handleSaveItems() {
        if (this.uploadedItems.length === 0) {
            this.error = 'No items to save';
            this.render();
            return;
        }
        setTimeout(() => {
            this.uploadedItems = [];
            this.selectedFile = null;
            alert('Items saved successfully!');
            this.render();
        }, 1000);
    }

    handleRemoveItem(index) {
        this.uploadedItems.splice(index, 1);
        this.render();
    }

    render() {
        const container = document.getElementById('upload-invoice-container');
        if (!container) return;
        container.innerHTML = `
            <div class="upload-invoice-grid">
                <div class="upload-section">
                    <h2>Upload Invoice File</h2>
                    <div class="upload-box">
                        <input type="file" id="invoice-file" accept=".pdf,.jpg,.jpeg,.png" style="display:none">
                        <label for="invoice-file" class="btn btn-primary">
                            <i class="fas fa-cloud-upload-alt"></i> Select File
                        </label>
                        ${this.selectedFile ? `<div class="selected-file">Selected file: ${this.selectedFile.name}</div>` : ''}
                    </div>
                    ${this.error ? `<div class="error-message">${this.error}</div>` : ''}
                    <button class="btn btn-success" id="process-invoice-btn" ${this.uploading ? 'disabled' : ''}>
                        ${this.uploading ? '<span class="spinner"></span> Processing...' : '<i class="fas fa-file-invoice"></i> Process Invoice'}
                    </button>
                </div>
                <div class="items-section">
                    <h2>Detected Items</h2>
                    ${this.uploadedItems.length > 0 ? `
                        <ul class="items-list">
                            ${this.uploadedItems.map((item, idx) => `
                                <li>
                                    <span>${item.name} (Quantity: ${item.quantity})</span>
                                    <button class="delete-btn" onclick="uploadInvoice.handleRemoveItem(${idx})"><i class="fas fa-trash"></i></button>
                                </li>
                            `).join('')}
                        </ul>
                        <button class="btn btn-success" id="save-items-btn">Save Items</button>
                    ` : `<div class="empty-message">No items detected yet. Upload an invoice to get started.</div>`}
                </div>
            </div>
        `;
        // Add event listeners
        const fileInput = document.getElementById('invoice-file');
        if (fileInput) {
            fileInput.onchange = (e) => this.handleFileSelect(e);
        }
        const processBtn = document.getElementById('process-invoice-btn');
        if (processBtn) {
            processBtn.onclick = () => this.handleUpload();
        }
        const saveBtn = document.getElementById('save-items-btn');
        if (saveBtn) {
            saveBtn.onclick = () => this.handleSaveItems();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('upload-invoice-container')) {
        window.uploadInvoice = new UploadInvoice();
        uploadInvoice.render();
    }
}); 