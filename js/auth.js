// Authentication Manager

const Auth = {
    STORAGE_KEY: 'agz_users',
    SESSION_KEY: 'agz_current_user',
    currentUser: null,

    init() {
        // Create demo account if no users exist
        this.createDemoAccountIfNeeded();
        
        // Check if user is logged in
        const session = localStorage.getItem(this.SESSION_KEY);
        if (session) {
            this.currentUser = JSON.parse(session);
            this.showApp();
        } else {
            this.showAuthPage();
            // Ensure only login form is visible initially
            this.showLogin();
        }

        this.setupEventListeners();
    },
    
    // Create demo account for easy testing
    createDemoAccountIfNeeded() {
        const users = this.getUsers();
        
        // Check if demo account already exists
        const demoExists = users.find(u => u.email.toLowerCase() === 'demo@agz.com');
        
        if (!demoExists) {
            const demoUser = {
                id: 'demo-user-001',
                name: 'Agazthiya',
                email: 'demo@agz.com',
                password: this.hashPassword('Demo@123'), // Demo@123
                createdAt: new Date().toISOString()
            };
            users.push(demoUser);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
            console.log('✅ Demo account created: demo@agz.com / Demo@123');
        }
    },

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });

            // Password strength indicator
            const registerPassword = document.getElementById('registerPassword');
            if (registerPassword) {
                registerPassword.addEventListener('input', () => {
                    this.checkPasswordStrength(registerPassword.value, 'passwordStrength');
                });
            }
        }

        // Password reset forms
        const resetEmailForm = document.getElementById('resetEmailForm');
        if (resetEmailForm) {
            resetEmailForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendResetCode();
            });
        }

        const resetCodeForm = document.getElementById('resetCodeForm');
        if (resetCodeForm) {
            resetCodeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.verifyResetCode();
            });
        }

        const resetPasswordForm = document.getElementById('resetPasswordForm');
        if (resetPasswordForm) {
            resetPasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.resetPassword();
            });

            const newPassword = document.getElementById('newPassword');
            if (newPassword) {
                newPassword.addEventListener('input', () => {
                    this.checkPasswordStrength(newPassword.value, 'newPasswordStrength');
                });
            }
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    },

    showAuthPage() {
        const authPage = document.getElementById('authPage');
        const appWrapper = document.getElementById('appWrapper');
        if (authPage) authPage.classList.remove('hidden');
        if (appWrapper) appWrapper.classList.add('hidden');
        this.animateAvatar();
    },

    showApp() {
        const authPage = document.getElementById('authPage');
        const appWrapper = document.getElementById('appWrapper');
        if (authPage) authPage.classList.add('hidden');
        if (appWrapper) appWrapper.classList.remove('hidden');
        
        // Update user name in header
        const userName = document.getElementById('userName');
        if (userName && this.currentUser) {
            userName.textContent = this.currentUser.name || 'User';
        }
        
        // Apply avatar image in header (if available)
        this.applyHeaderAvatar();

        // Initialize main app
        if (typeof App !== 'undefined' && App.init) {
            App.init();
        }
    },

    handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showNotification('Please fill all fields', 'error');
            return;
        }

        const users = this.getUsers();
        console.log('Attempting login for:', email);
        console.log('Total registered users:', users.length);
        
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            this.showNotification('❌ User not found. Please create an account first!', 'error');
            console.log('User not found. Registered emails:', users.map(u => u.email));
            return;
        }

        const hashedPassword = this.hashPassword(password);
        console.log('Password hash match:', user.password === hashedPassword);
        
        if (user.password !== hashedPassword) {
            this.showNotification('❌ Invalid password. Please try again.', 'error');
            return;
        }

        // Login successful
        this.currentUser = { email: user.email, name: user.name };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentUser));
        this.showNotification('✅ Welcome back, ' + user.name + '!', 'success');
        console.log('Login successful!');
        setTimeout(() => this.showApp(), 1000);
    },

    handleRegister() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!name || !email || !password || !confirmPassword) {
            this.showNotification('Please fill all fields', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        const passwordValidation = this.validatePassword(password);
        if (!passwordValidation.valid) {
            this.showNotification(passwordValidation.message, 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        const users = this.getUsers();
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            this.showNotification('Email already registered. Please login.', 'error');
            return;
        }

        // Register user
        const newUser = {
            id: this.generateId(),
            name: name,
            email: email,
            password: this.hashPassword(password),
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
        console.log('✅ User registered successfully:', email);

        this.showNotification('✅ Account created successfully! Please login.', 'success');
        setTimeout(() => this.showLogin(), 1500);
    },

    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) {
            return { valid: false, message: 'Password must be at least 8 characters long' };
        }

        if (!hasUpperCase) {
            return { valid: false, message: 'Password must contain at least one uppercase letter' };
        }

        if (!hasLowerCase) {
            return { valid: false, message: 'Password must contain at least one lowercase letter' };
        }

        if (!hasNumber) {
            return { valid: false, message: 'Password must contain at least one number' };
        }

        if (!hasSpecial) {
            return { valid: false, message: 'Password must contain at least one special character' };
        }

        return { valid: true };
    },

    checkPasswordStrength(password, strengthId) {
        const strengthContainer = document.getElementById(strengthId);
        if (!strengthContainer) return;

        const bar = strengthContainer.querySelector('.strength-bar');
        const text = strengthContainer.querySelector('.strength-text');

        let strength = 0;
        let strengthText = '';
        let color = '';

        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

        switch (strength) {
            case 0:
            case 1:
                strengthText = 'Very Weak';
                color = '#e74c3c';
                break;
            case 2:
                strengthText = 'Weak';
                color = '#e67e22';
                break;
            case 3:
                strengthText = 'Fair';
                color = '#f39c12';
                break;
            case 4:
                strengthText = 'Good';
                color = '#2ecc71';
                break;
            case 5:
                strengthText = 'Strong';
                color = '#27ae60';
                break;
        }

        bar.style.width = (strength * 20) + '%';
        bar.style.backgroundColor = color;
        text.textContent = strengthText;
        text.style.color = color;
    },

    sendResetCode() {
        const email = document.getElementById('resetEmail').value.trim();

        if (!email || !this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        const users = this.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            this.showNotification('Email not found', 'error');
            return;
        }

        // Generate and store reset code (6 digits)
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem('reset_code', resetCode);
        localStorage.setItem('reset_email', email);

        // Simulate sending email
        console.log('Reset code:', resetCode); // In real app, send via email
        this.showNotification('Verification code sent to your email! (Check console for demo)', 'success');

        // Show step 2
        document.getElementById('resetStep1').classList.add('hidden');
        document.getElementById('resetStep2').classList.remove('hidden');
    },

    verifyResetCode() {
        const code = document.getElementById('resetCode').value.trim();
        const storedCode = localStorage.getItem('reset_code');

        if (code !== storedCode) {
            this.showNotification('Invalid verification code', 'error');
            return;
        }

        this.showNotification('Code verified successfully!', 'success');

        // Show step 3
        document.getElementById('resetStep2').classList.add('hidden');
        document.getElementById('resetStep3').classList.remove('hidden');
    },

    resetPassword() {
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (!newPassword || !confirmNewPassword) {
            this.showNotification('Please fill all fields', 'error');
            return;
        }

        const passwordValidation = this.validatePassword(newPassword);
        if (!passwordValidation.valid) {
            this.showNotification(passwordValidation.message, 'error');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        const email = localStorage.getItem('reset_email');
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

        if (userIndex !== -1) {
            users[userIndex].password = this.hashPassword(newPassword);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
            this.showNotification('Password reset successfully! Please login.', 'success');

            // Clean up
            localStorage.removeItem('reset_code');
            localStorage.removeItem('reset_email');

            setTimeout(() => {
                this.closePasswordReset();
                this.showLogin();
            }, 1500);
        }
    },

    showLogin() {
        const loginBox = document.getElementById('loginBox');
        const registerBox = document.getElementById('registerBox');
        const greeting = document.getElementById('avatarGreeting');
        
        if (loginBox) loginBox.classList.remove('hidden');
        if (registerBox) registerBox.classList.add('hidden');
        if (greeting) greeting.textContent = 'Welcome back!';
    },

    showRegister() {
        const loginBox = document.getElementById('loginBox');
        const registerBox = document.getElementById('registerBox');
        const greeting = document.getElementById('avatarGreeting');
        
        if (loginBox) loginBox.classList.add('hidden');
        if (registerBox) registerBox.classList.remove('hidden');
        if (greeting) greeting.textContent = 'Join us today!';
    },

    showPasswordReset() {
        document.getElementById('passwordResetModal').classList.add('show');
        document.getElementById('resetStep1').classList.remove('hidden');
        document.getElementById('resetStep2').classList.add('hidden');
        document.getElementById('resetStep3').classList.add('hidden');
    },

    closePasswordReset() {
        document.getElementById('passwordResetModal').classList.remove('show');
        document.getElementById('resetEmailForm').reset();
        document.getElementById('resetCodeForm').reset();
        document.getElementById('resetPasswordForm').reset();
    },

    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(inputId + 'Toggle');
        
        if (input.type === 'password') {
            input.type = 'text';
            toggle.classList.remove('fa-eye');
            toggle.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            toggle.classList.remove('fa-eye-slash');
            toggle.classList.add('fa-eye');
        }
    },
    
    // Profile modal handlers
    openProfileModal() {
        const modal = document.getElementById('profileModal');
        const preview = document.getElementById('profilePhotoPreview');
        if (preview) {
            // Load current avatar if set
            const user = this.getUsers().find(u => this.currentUser && u.email.toLowerCase() === this.currentUser.email.toLowerCase());
            if (user && user.avatar) {
                preview.src = user.avatar;
            } else {
                preview.src = '';
            }
        }
        if (modal) modal.classList.add('show');
    },

    saveProfilePhoto() {
        const fileInput = document.getElementById('profilePhotoInput');
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            this.showNotification('Please select an image file', 'error');
            return;
        }
        const file = fileInput.files[0];
        if (!file.type.startsWith('image/')) {
            this.showNotification('Only image files are allowed', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            // Update user record
            const users = this.getUsers();
            const idx = users.findIndex(u => this.currentUser && u.email.toLowerCase() === this.currentUser.email.toLowerCase());
            if (idx !== -1) {
                users[idx].avatar = dataUrl;
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
                // Reflect in header
                this.applyHeaderAvatar();
                this.showNotification('Profile photo updated', 'success');
                const modal = document.getElementById('profileModal');
                if (modal) modal.classList.remove('show');
            }
        };
        reader.readAsDataURL(file);
    },

    applyHeaderAvatar() {
        const img = document.getElementById('userAvatarImg');
        const defaultHead = document.getElementById('userAvatarDefault');
        const users = this.getUsers();
        const user = users.find(u => this.currentUser && u.email.toLowerCase() === this.currentUser.email.toLowerCase());
        const avatar = user && user.avatar ? user.avatar : null;
        if (img && defaultHead) {
            if (avatar) {
                img.src = avatar;
                img.style.display = 'block';
                defaultHead.style.display = 'none';
            } else {
                img.style.display = 'none';
                defaultHead.style.display = 'block';
            }
        }
    },

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem(this.SESSION_KEY);
            this.currentUser = null;
            this.showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    },

    animateAvatar() {
        const greetings = [
            'Welcome back!',
            'Hello there!',
            'Nice to see you!',
            'Ready to track expenses?'
        ];
        
        let index = 0;
        const greetingEl = document.getElementById('avatarGreeting');
        
        if (greetingEl) {
            setInterval(() => {
                index = (index + 1) % greetings.length;
                greetingEl.textContent = greetings[index];
            }, 5000);
        }
    },

    // Utility functions
    getUsers() {
        const users = localStorage.getItem(this.STORAGE_KEY);
        return users ? JSON.parse(users) : [];
    },

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    hashPassword(password) {
        // Simple hash for demo - in production use proper hashing
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type} show`;
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    }
};

// Initialize Auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
    // Wire up profile modal buttons if present
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) profileBtn.addEventListener('click', () => Auth.openProfileModal());
    const saveProfilePhotoBtn = document.getElementById('saveProfilePhotoBtn');
    if (saveProfilePhotoBtn) saveProfilePhotoBtn.addEventListener('click', () => Auth.saveProfilePhoto());
});
