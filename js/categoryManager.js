// Category Manager - Handles category CRUD operations

const CategoryManager = {
    // Default categories with icons
    DEFAULT_CATEGORIES: [
        { id: 'grocery', name: 'Grocery', icon: 'fa-shopping-cart', isDefault: true },
        { id: 'celebrations', name: 'Celebrations', icon: 'fa-birthday-cake', isDefault: true },
        { id: 'child-savings', name: 'Child Savings', icon: 'fa-piggy-bank', isDefault: true },
        { id: 'house-repair', name: 'House Repair', icon: 'fa-hammer', isDefault: true },
        { id: 'money-given', name: 'Money Given (Loan)', icon: 'fa-hand-holding-usd', isDefault: true },
        { id: 'electric-bills', name: 'Electric Bills', icon: 'fa-bolt', isDefault: true },
        { id: 'non-veg-food', name: 'Non-Veg Food', icon: 'fa-drumstick-bite', isDefault: true },
        { id: 'auto-fees', name: 'Auto Fees', icon: 'fa-car', isDefault: true },
        { id: 'ornaments', name: 'Ornaments', icon: 'fa-gem', isDefault: true },
        { id: 'milk', name: 'Milk', icon: 'fa-mug-hot', isDefault: true },
        { id: 'gas-cylinder', name: 'Gas Cylinder', icon: 'fa-fire', isDefault: true },
        { id: 'vegetables', name: 'Vegetables', icon: 'fa-carrot', isDefault: true },
        { id: 'miscellaneous', name: 'Miscellaneous', icon: 'fa-ellipsis-h', isDefault: true },
        { id: 'phone-bill', name: 'Phone Bill', icon: 'fa-phone', isDefault: true },
        { id: 'fruits', name: 'Fruits', icon: 'fa-apple-alt', isDefault: true },
        { id: 'tv-cable-bill', name: 'TV/Cable Bill', icon: 'fa-tv', isDefault: true },
        { id: 'dining-out', name: 'Dining Out', icon: 'fa-utensils', isDefault: true },
        { id: 'school-fees', name: 'School Fees', icon: 'fa-graduation-cap', isDefault: true }
    ],

    STORAGE_KEY: 'agz_categories',

    // Initialize categories
    init() {
        const stored = this.getStoredCategories();
        if (!stored || stored.length === 0) {
            this.saveCategories(this.DEFAULT_CATEGORIES);
        } else {
            // Merge default categories with stored ones (in case new defaults are added)
            const defaultIds = this.DEFAULT_CATEGORIES.map(c => c.id);
            const storedIds = stored.map(c => c.id);
            const missingDefaults = this.DEFAULT_CATEGORIES.filter(c => !storedIds.includes(c.id));
            if (missingDefaults.length > 0) {
                const merged = [...stored, ...missingDefaults];
                this.saveCategories(merged);
            }
        }
    },

    // Get all categories (default + custom)
    getAllCategories() {
        const stored = this.getStoredCategories();
        return stored || this.DEFAULT_CATEGORIES;
    },

    // Get default categories only
    getDefaultCategories() {
        return this.DEFAULT_CATEGORIES;
    },

    // Get custom categories only
    getCustomCategories() {
        const all = this.getAllCategories();
        return all.filter(cat => !cat.isDefault);
    },

    // Get category by ID
    getCategoryById(id) {
        const categories = this.getAllCategories();
        return categories.find(cat => cat.id === id);
    },

    // Get category by name
    getCategoryByName(name) {
        const categories = this.getAllCategories();
        return categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
    },

    // Add custom category
    addCustomCategory(name, icon) {
        const categories = this.getAllCategories();
        const newCategory = {
            id: this.generateId(),
            name: name,
            icon: icon,
            isDefault: false
        };
        categories.push(newCategory);
        this.saveCategories(categories);
        return newCategory;
    },

    // Update category
    updateCategory(id, data) {
        const categories = this.getAllCategories();
        const index = categories.findIndex(cat => cat.id === id);
        if (index !== -1) {
            // Prevent updating default category properties if it's a default category
            const category = categories[index];
            if (category.isDefault) {
                // Only allow icon update for default categories
                if (data.icon) {
                    categories[index].icon = data.icon;
                }
            } else {
                // Allow full update for custom categories
                categories[index] = { ...categories[index], ...data };
            }
            this.saveCategories(categories);
            return categories[index];
        }
        return null;
    },

    // Delete category (only custom ones)
    deleteCategory(id) {
        const categories = this.getAllCategories();
        const category = categories.find(cat => cat.id === id);
        
        if (category && category.isDefault) {
            throw new Error('Cannot delete default category');
        }
        
        const filtered = categories.filter(cat => cat.id !== id);
        this.saveCategories(filtered);
        return true;
    },

    // Get icon for category (checks custom icons first)
    getCategoryIcon(categoryId) {
        const category = this.getCategoryById(categoryId);
        if (!category) return 'fa-circle';
        
        // Check for custom icon from settings
        const customIcon = DataManager.getCustomIcon(category.name);
        if (customIcon) {
            return customIcon;
        }
        
        return category.icon || 'fa-circle';
    },

    // Storage operations
    getStoredCategories() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    },

    saveCategories(categories) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
    },

    // Utility
    generateId() {
        return 'cat_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Get available Font Awesome icons for selection
    getAvailableIcons() {
        return [
            'fa-shopping-cart', 'fa-birthday-cake', 'fa-piggy-bank', 'fa-hammer',
            'fa-hand-holding-usd', 'fa-bolt', 'fa-drumstick-bite', 'fa-car',
            'fa-gem', 'fa-mug-hot', 'fa-fire', 'fa-carrot', 'fa-ellipsis-h',
            'fa-phone', 'fa-apple-alt', 'fa-tv', 'fa-utensils', 'fa-graduation-cap',
            'fa-home', 'fa-wallet', 'fa-credit-card', 'fa-money-bill-wave',
            'fa-coins', 'fa-receipt', 'fa-file-invoice-dollar', 'fa-chart-line',
            'fa-briefcase', 'fa-building', 'fa-store', 'fa-shopping-bag',
            'fa-basketball-ball', 'fa-futbol', 'fa-gamepad', 'fa-book',
            'fa-laptop', 'fa-tablet-alt', 'fa-mobile-alt', 'fa-headphones',
            'fa-camera', 'fa-video', 'fa-music', 'fa-film', 'fa-palette',
            'fa-dumbbell', 'fa-bicycle', 'fa-motorcycle', 'fa-bus',
            'fa-train', 'fa-plane', 'fa-ship', 'fa-hotel', 'fa-umbrella-beach',
            'fa-sun', 'fa-moon', 'fa-star', 'fa-heart', 'fa-gift', 'fa-envelope'
        ];
    }
};

// Initialize on load
CategoryManager.init();

