document.addEventListener('DOMContentLoaded', () => {
    console.log('Profile.js script started. DOMContentLoaded fired.'); // Log script start

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }

    // API Configuration
    const API_URL = 'http://localhost:5000/api';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // DOM Elements
    const usernameElement = document.getElementById('username');
    const emailElement = document.getElementById('email');
    const recipesCountElement = document.getElementById('recipes-count');
    const favoritesCountElement = document.getElementById('favorites-count');
    const pantryCountElement = document.getElementById('pantry-count');
    const preferencesForm = document.getElementById('preferences-form');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const changePasswordModal = document.getElementById('change-password-modal');
    const changePasswordForm = document.getElementById('change-password-form');
    const closeModalBtn = document.querySelector('#change-password-modal .close-modal'); // More specific selector

    console.log('Change Password Button:', changePasswordBtn); // Log button element
    console.log('Logout Button:', logoutBtn); // Log button element
    console.log('Change Password Modal:', changePasswordModal); // Log modal element
    console.log('Change Password Form:', changePasswordForm); // Log form element
    console.log('Close Modal Button:', closeModalBtn); // Log close button element

    // Dietary preferences options
    const dietaryRestrictions = [
        'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free',
        'Halal', 'Kosher', 'Pescatarian', 'Keto', 'Paleo', 'Low-Carb',
        'Low-Fat', 'Low-Sodium', 'Sugar-Free', 'Raw Food'
    ];

    const preferredCuisines = [
        'Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese',
        'Thai', 'Mediterranean', 'American', 'French', 'Korean',
        'Vietnamese', 'Greek', 'Spanish', 'German', 'Brazilian',
        'Caribbean', 'Middle Eastern', 'African', 'Russian', 'British'
    ];

    // Initialize checkboxes
    function initializeCheckboxes() {
        const dietaryRestrictionsContainer = document.getElementById('dietary-restrictions');
        const preferredCuisinesContainer = document.getElementById('preferred-cuisines');

        if (dietaryRestrictionsContainer) {
             dietaryRestrictions.forEach(restriction => {
                const label = createCheckboxLabel(restriction, 'dietary');
                dietaryRestrictionsContainer.appendChild(label);
            });
        }

        if (preferredCuisinesContainer) {
            preferredCuisines.forEach(cuisine => {
                const label = createCheckboxLabel(cuisine, 'cuisines');
                preferredCuisinesContainer.appendChild(label);
            });
        }
    }

    function createCheckboxLabel(value, name) {
        const label = document.createElement('label');
        label.className = 'checkbox-label';
        label.innerHTML = `
            <input type="checkbox" name="${name}" value="${value}">
            ${value}
        `;
        return label;
    }

    // Load user profile
    async function loadUserProfile() {
        console.log('Loading user profile...'); // Log loading start
        try {
            const response = await axios.get(`${API_URL}/users/profile`, { headers });
            const user = response.data;

            console.log('User profile loaded:', user); // Log loaded user data

            // Update profile information
            if (usernameElement) usernameElement.textContent = user.username || 'Not set';
            if (emailElement) emailElement.textContent = user.email || 'Not set';

            // Update preferences
            if (user.preferences) {
                const skillLevelSelect = document.getElementById('skill-level');
                const mealPlanningSelect = document.getElementById('meal-planning');

                if (skillLevelSelect) skillLevelSelect.value = user.preferences.cookingSkillLevel || 'beginner';
                if (mealPlanningSelect) mealPlanningSelect.value = user.preferences.mealPlanningPreferences || 'weekly';

                // Update checkboxes
                updateCheckboxes('dietary', user.preferences.dietaryRestrictions || []);
                updateCheckboxes('cuisines', user.preferences.preferredCuisines || []);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            if (error.response?.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            } else {
                showNotification(error.response?.data?.msg || 'Error loading profile. Please try again.', 'error');
            }
        }
    }

    function updateCheckboxes(name, selectedValues) {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]`);
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectedValues.includes(checkbox.value);
        });
    }

    // Save preferences
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Preferences form submitted.'); // Log form submission

            const formData = {
                cookingSkillLevel: document.getElementById('skill-level').value,
                mealPlanningPreferences: document.getElementById('meal-planning').value,
                dietaryRestrictions: getSelectedValues('dietary'),
                preferredCuisines: getSelectedValues('cuisines')
            };

            console.log('Saving preferences:', formData); // Log data being saved

            try {
                const response = await axios.put(`${API_URL}/users/preferences`, formData, { headers });
                console.log('Preferences updated successfully:', response.data); // Log success
                showNotification('Preferences updated successfully', 'success');
            } catch (error) {
                console.error('Error updating preferences:', error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                } else {
                    showNotification(error.response?.data?.msg || 'Error updating preferences. Please try again.', 'error');
                }
            }
        });
    }

    function getSelectedValues(name) {
        return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
            .map(checkbox => checkbox.value);
    }

    // Change password
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            console.log('Change Password button clicked.'); // Log button click
            if (changePasswordModal) changePasswordModal.style.display = 'block';
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            console.log('Close modal button clicked.'); // Log button click
            if (changePasswordModal) changePasswordModal.style.display = 'none';
        });
    }

    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Change Password form submitted.'); // Log form submission

            const currentPasswordInput = document.getElementById('current-password');
            const newPasswordInput = document.getElementById('new-password');
            const confirmPasswordInput = document.getElementById('confirm-password');

            const currentPassword = currentPasswordInput ? currentPasswordInput.value : '';
            const newPassword = newPasswordInput ? newPasswordInput.value : '';
            const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';


            if (newPassword !== confirmPassword) {
                showNotification('New passwords do not match', 'error');
                console.warn('New passwords do not match.'); // Log warning
                return;
            }

            console.log('Attempting to change password...'); // Log attempt

            try {
                await axios.put(`${API_URL}/users/password`, {
                    currentPassword,
                    newPassword
                }, { headers });

                console.log('Password updated successfully.'); // Log success
                showNotification('Password updated successfully', 'success');
                if (changePasswordModal) changePasswordModal.style.display = 'none';
                changePasswordForm.reset();
            } catch (error) {
                console.error('Error changing password:', error); // Log error
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                } else if (error.response?.status === 400) {
                    showNotification(error.response.data.msg || 'Current password is incorrect', 'error');
                } else {
                    showNotification('Error changing password. Please try again.', 'error');
                }
            }
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log('Logout button clicked.'); // Log button click
            localStorage.removeItem('token');
            console.log('Token removed, redirecting to login.'); // Log redirection
            window.location.href = 'login.html';
        });
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        const container = document.getElementById('notification-container');
        container.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.classList.add('notification-slide-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('notification-slide-out');
            setTimeout(() => notification.remove(), 300);
        });
    }

    // Initializations
    initializeCheckboxes();
    loadUserProfile();
}); 