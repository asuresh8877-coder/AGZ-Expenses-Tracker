// Language Manager - Handles Tamil/English translations

const LanguageManager = {
    currentLanguage: 'english',

    translations: {
        english: {
            title: 'AGZ Monthly Expenses',
            monthlyBudget: 'Monthly Budget',
            totalSpent: 'Total Spent',
            remainingBalance: 'Remaining Balance',
            expenseCategories: 'Expense Categories',
            addExpense: 'Add Expense',
            date: 'Date',
            category: 'Category',
            amount: 'Amount',
            categoryTotal: 'Category Total',
            save: 'Save',
            cancel: 'Cancel',
            spendingBreakdown: 'Spending Breakdown',
            filter: 'Filter',
            settings: 'Settings',
            iconCustomization: 'Icon Customization',
            billReminders: 'Bill Reminders',
            expenseTracking: 'Expense Tracking',
            customizeIcons: 'Customize Category Icons',
            manageReminders: 'Manage Bill Reminders',
            addReminder: 'Add Reminder',
            reminders: 'Reminders',
            reminderDate: 'Reminder Date',
            expectedAmount: 'Expected Amount',
            manageCategories: 'Manage Categories',
            exportPdf: 'Export PDF',
            viewBreakdown: 'View Breakdown',
            addCategory: 'Add Category',
            editCategory: 'Edit Category',
            categoryName: 'Category Name',
            icon: 'Icon',
            edit: 'Edit',
            delete: 'Delete',
            comments: 'Comments',
            time: 'Time',
            actions: 'Actions',
            dashboard: 'Dashboard',
            transactions: 'Transactions',
            categories: 'Categories',
            pdfPreview: 'PDF Preview',
            downloadPdf: 'Download PDF',
            close: 'Close',
            noExpenses: 'No expenses found',
            expenseSaved: 'Expense saved successfully',
            expenseDeleted: 'Expense deleted successfully',
            expenseUpdated: 'Expense updated successfully',
            categoryAdded: 'Category added successfully',
            categoryUpdated: 'Category updated successfully',
            categoryDeleted: 'Category deleted successfully',
            reminderAdded: 'Reminder added successfully',
            reminderUpdated: 'Reminder updated successfully',
            reminderDeleted: 'Reminder deleted successfully',
            budgetUpdated: 'Budget updated successfully',
            noReminders: 'No active reminders',
            // Monthly History translations
            monthlyHistory: 'Monthly History',
            budgetHistory: 'Budget History',
            totalSaved: 'Total Saved',
            summary: 'Summary',
            amountAdded: 'Amount Added',
            updateBudget: 'Updated Budget',
            dateTime: 'Date & Time',
            // Additional translations
            total: 'Total',
            entries: 'Entries',
            average: 'Average',
            viewDetails: 'View Details',
            // Category names
            'Grocery': 'Grocery',
            'Celebrations': 'Celebrations',
            'Child Savings': 'Child Savings',
            'House Repair': 'House Repair',
            'Money Given (Loan)': 'Money Given (Loan)',
            'Electric Bills': 'Electric Bills',
            'Non-Veg Food': 'Non-Veg Food',
            'Auto Fees': 'Auto Fees',
            'Ornaments': 'Ornaments',
            'Milk': 'Milk',
            'Gas Cylinder': 'Gas Cylinder',
            'Vegetables': 'Vegetables',
            'Miscellaneous': 'Miscellaneous',
            'Phone Bill': 'Phone Bill',
            'Fruits': 'Fruits',
            'TV/Cable Bill': 'TV/Cable Bill',
            'Dining Out': 'Dining Out',
            'School Fees': 'School Fees'
        },
        tamil: {
            title: 'AGZ மாதாந்திர செலவுகள்',
            monthlyBudget: 'மாதாந்திர பட்ஜெட்',
            totalSpent: 'மொத்த செலவு',
            remainingBalance: 'மீதமுள்ள இருப்பு',
            expenseCategories: 'செலவு வகைகள்',
            addExpense: 'செலவு சேர்க்க',
            date: 'தேதி',
            category: 'வகை',
            amount: 'தொகை',
            categoryTotal: 'வகை மொத்தம்',
            save: 'சேமிக்க',
            cancel: 'ரத்துசெய்',
            spendingBreakdown: 'செலவு பிரித்தல்',
            filter: 'வடிகட்டு',
            settings: 'அமைப்புகள்',
            iconCustomization: 'ஐகான் தனிப்பயனாக்கம்',
            billReminders: 'பில் நினைவூட்டல்கள்',
            expenseTracking: 'செலவு கண்காணிப்பு',
            customizeIcons: 'வகை ஐகான்களை தனிப்பயனாக்கு',
            manageReminders: 'நினைவூட்டல்களை நிர்வகிக்க',
            addReminder: 'நினைவூட்டல் சேர்க்க',
            reminders: 'நினைவூட்டல்கள்',
            reminderDate: 'நினைவூட்டல் தேதி',
            expectedAmount: 'எதிர்பார்க்கப்படும் தொகை',
            manageCategories: 'வகைகளை நிர்வகிக்க',
            exportPdf: 'PDF ஏற்றுமதி',
            viewBreakdown: 'பிரித்தல் காண்க',
            addCategory: 'வகை சேர்க்க',
            editCategory: 'வகை திருத்த',
            categoryName: 'வகை பெயர்',
            icon: 'ஐகான்',
            edit: 'திருத்த',
            delete: 'நீக்க',
            comments: 'கருத்துகள்',
            time: 'நேரம்',
            actions: 'செயல்கள்',
            dashboard: 'டாஷ்போர்டு',
            transactions: 'பரிவர்த்தனைகள்',
            categories: 'வகைகள்',
            pdfPreview: 'PDF முன்னோட்டம்',
            downloadPdf: 'PDF பதிவிறக்க',
            close: 'மூடு',
            noExpenses: 'செலவுகள் எதுவும் கிடைக்கவில்லை',
            expenseSaved: 'செலவு வெற்றிகரமாக சேமிக்கப்பட்டது',
            expenseDeleted: 'செலவு வெற்றிகரமாக நீக்கப்பட்டது',
            expenseUpdated: 'செலவு வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
            categoryAdded: 'வகை வெற்றிகரமாக சேர்க்கப்பட்டது',
            categoryUpdated: 'வகை வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
            categoryDeleted: 'வகை வெற்றிகரமாக நீக்கப்பட்டது',
            reminderAdded: 'நினைவூட்டல் வெற்றிகரமாக சேர்க்கப்பட்டது',
            reminderUpdated: 'நினைவூட்டல் வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
            reminderDeleted: 'நினைவூட்டல் வெற்றிகரமாக நீக்கப்பட்டது',
            budgetUpdated: 'பட்ஜெட் வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
            noReminders: 'செயலில் உள்ள நினைவூட்டல்கள் இல்லை',
            // Monthly History translations
            monthlyHistory: 'மாதாந்திர வரலாறு',
            budgetHistory: 'பட்ஜெட் வரலாறு',
            totalSaved: 'மொத்த சேமிப்பு',
            summary: 'சுருக்கம்',
            amountAdded: 'சேர்க்கப்பட்ட தொகை',
            updateBudget: 'புதுப்பிக்கப்பட்ட பட்ஜெட்',
            dateTime: 'தேதி & நேரம்',
            // Additional translations
            total: 'மொத்தம்',
            entries: 'உள்ளீடுகள்',
            average: 'சராசரி',
            viewDetails: 'விவரங்களைக் காண்க',
            // Category names in Tamil
            'Grocery': 'கிராகரி',
            'Celebrations': 'விழாக்கள்',
            'Child Savings': 'குழந்தை சேமிப்பு',
            'House Repair': 'வீடு பழுது',
            'Money Given (Loan)': 'கொடுத்த பணம் (கடன்)',
            'Electric Bills': 'மின்சார பில்',
            'Non-Veg Food': 'இறைச்சி உணவு',
            'Auto Fees': 'ஆட்டோ கட்டணம்',
            'Ornaments': 'நகைகள்',
            'Milk': 'பால்',
            'Gas Cylinder': 'கேஸ் சிலிண்டர்',
            'Vegetables': 'காய்கறிகள்',
            'Miscellaneous': 'பல்வேறு',
            'Phone Bill': 'தொலைபேசி பில்',
            'Fruits': 'பழங்கள்',
            'TV/Cable Bill': 'டிவி/கேபிள் பில்',
            'Dining Out': 'வெளியே சாப்பிடுதல்',
            'School Fees': 'பள்ளி கட்டணம்'
        }
    },

    // Initialize language from settings
    init() {
        const settings = DataManager.getSettings();
        this.currentLanguage = settings.language || 'english';
        console.log(`🌍 Initializing language: ${this.currentLanguage}`);
        console.log(`📦 Settings from localStorage:`, settings);
        this.applyLanguage();
        this.setupToggleButton();
        console.log(`✅ Language manager initialized with: ${this.currentLanguage}`);
    },

    // Setup language toggle button
    setupToggleButton() {
        const langBtn = document.getElementById('languageToggle');
        if (langBtn) {
            // Remove any existing listener to avoid duplicates
            const newBtn = langBtn.cloneNode(true);
            langBtn.parentNode.replaceChild(newBtn, langBtn);
            
            // Add click listener
            newBtn.addEventListener('click', () => {
                console.log('🔄 Language button clicked');
                this.toggleLanguage();
            });
            console.log('✅ Language toggle button setup complete');
        } else {
            console.warn('⚠️ Language toggle button not found');
        }
    },

    // Set language
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            DataManager.updateSetting('language', lang);
            this.applyLanguage();
            return true;
        }
        return false;
    },

    // Get translated text
    translate(key) {
        const translation = this.translations[this.currentLanguage];
        if (translation && translation[key]) {
            return translation[key];
        }
        // Fallback to English if translation not found
        return this.translations.english[key] || key;
    },

    // Apply language to all elements with data-translate attribute
    applyLanguage() {
        // Update body class for Tamil font support
        if (this.currentLanguage === 'tamil') {
            document.body.classList.add('tamil');
        } else {
            document.body.classList.remove('tamil');
        }

        // Update all elements with data-translate attribute
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.translate(key);
            
            if ((element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'number' || element.type === 'password')) || 
                (element.tagName === 'TEXTAREA')) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update language toggle button - make sure it shows current state
        const langToggle = document.getElementById('currentLang');
        if (langToggle) {
            langToggle.textContent = this.currentLanguage === 'english' ? 'EN' : 'TA';
        }

        // Update all buttons and spans with data-translate inside
        document.querySelectorAll('button span[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            const translated = this.translate(key);
            el.textContent = translated;
        });
        
        // Also update any spans with data-translate even if not in buttons
        document.querySelectorAll('span[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            const translated = this.translate(key);
            el.textContent = translated;
        });

        // Update category names in dropdowns and lists
        this.updateCategoryNames();
        
        // Update any labels that don't have data-translate
        this.updatePageLabels();
    },

    // Update page labels dynamically
    updatePageLabels() {
        // Update section titles
        const sectionTitles = document.querySelectorAll('.section-title, .modal-header h2, .page-title');
        sectionTitles.forEach(title => {
            const text = title.textContent.trim();
            // Try to find a matching translation key
            const keys = Object.keys(this.translations[this.currentLanguage]);
            keys.forEach(key => {
                if (this.translate(key).toLowerCase() === text.toLowerCase()) {
                    title.textContent = this.translate(key);
                }
            });
        });
        
        // Update all h2 and h3 tags
        document.querySelectorAll('h2, h3').forEach(heading => {
            const text = heading.textContent.trim();
            const keys = Object.keys(this.translations[this.currentLanguage]);
            keys.forEach(key => {
                if (this.translate(key).toLowerCase() === text.toLowerCase()) {
                    heading.textContent = this.translate(key);
                }
            });
        });

        // Update labels
        document.querySelectorAll('label').forEach(label => {
            const text = label.textContent.trim();
            const keys = Object.keys(this.translations[this.currentLanguage]);
            keys.forEach(key => {
                if (this.translate(key).toLowerCase() === text.toLowerCase()) {
                    label.textContent = this.translate(key);
                }
            });
        });
    },

    // Update category names in select dropdowns and category cards
    updateCategoryNames() {
        const categories = CategoryManager.getAllCategories();
        
        // Update category select dropdowns
        const categorySelects = document.querySelectorAll('#expenseCategory, #reminderCategory, #transactionsCategory');
        categorySelects.forEach(select => {
            if (select.options && select.options.length > 0) {
                Array.from(select.options).forEach(option => {
                    if (option.value && option.value !== '') {
                        const category = categories.find(cat => cat.name === option.value || cat.id === option.value);
                        if (category) {
                            option.textContent = this.translate(category.name);
                        }
                    }
                });
            }
        });

        // Update category cards
        const categoryCards = document.querySelectorAll('.category-name, .category-name-large, .manage-category-name');
        categoryCards.forEach(card => {
            const categoryName = card.textContent.trim();
            // Try to find the category in our list
            const category = categories.find(c => c.name === categoryName || this.translate(c.name) === categoryName);
            if (category) {
                card.textContent = this.translate(category.name);
            }
        });

        // Update all expense category displays
        const expenseCategories = document.querySelectorAll('.expense-category, .reminder-category');
        expenseCategories.forEach(el => {
            const text = el.textContent.trim().replace(/^[\s\S]*?\s/, ''); // Remove icon if present
            const category = categories.find(c => c.name === text || this.translate(c.name) === text);
            if (category) {
                const icon = el.innerHTML.match(/<i[^>]*>/);
                el.innerHTML = (icon ? icon[0] : '') + ' ' + this.translate(category.name);
            }
        });
    },

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    },

    // Toggle between languages
    toggleLanguage() {
        const newLang = this.currentLanguage === 'english' ? 'tamil' : 'english';
        this.setLanguage(newLang);
        
        // Ensure the button text updates immediately
        const langToggle = document.getElementById('currentLang');
        if (langToggle) {
            langToggle.textContent = newLang === 'english' ? 'EN' : 'TA';
        }
        
        console.log(`🌍 Language switched to: ${newLang.toUpperCase()}`);
        
        // Refresh UI to reflect language changes - with multiple retries for better coverage
        if (typeof App !== 'undefined') {
            setTimeout(() => {
                // First pass - immediate updates
                App.renderCategories();
                App.renderCategoriesPage();
                App.loadDashboard();
                this.applyLanguage(); // Reapply to catch any missed elements
                
                // Second pass - update visible modals and lists
                setTimeout(() => {
                    if (document.getElementById('breakdownList') && !document.getElementById('breakdownModal').classList.contains('hidden')) {
                        App.renderBreakdown();
                    }
                    if (document.getElementById('settingsModal').classList.contains('show')) {
                        App.renderRemindersList();
                    }
                    if (document.getElementById('reminderModal').classList.contains('show')) {
                        App.renderRemindersDisplay();
                    }
                    
                    // Final pass - apply language one more time to catch dynamically added content
                    this.applyLanguage();
                    
                    console.log(`✅ Language update complete`);
                }, 100);
            }, 50);
        }
        
        return newLang;
    }
};

// Initialize on load - wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Ensure DataManager is initialized first
        if (typeof DataManager !== 'undefined') {
            DataManager.init();
        }
        // Then initialize LanguageManager
        LanguageManager.init();
    });
} else {
    // DOM is already loaded
    if (typeof DataManager !== 'undefined') {
        DataManager.init();
    }
    LanguageManager.init();
}

