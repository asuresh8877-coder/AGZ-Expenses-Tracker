// Main Application Controller

const App = {
    currentEditingExpenseId: null,
    currentEditingCategoryId: null,
    currentEditingReminderId: null,
    selectedMonth: new Date().getMonth(),
    selectedYear: new Date().getFullYear(),
    selectedCategory: '',
    audioContext: null,
    audioReady: false,

    // Initialize application
    init() {
        // Initialize DataManager first to clean up old expenses
        DataManager.init();
        
        this.setupEventListeners();
        this.setupAudioUnlock();
        this.loadDashboard();
        this.renderCategories();
        this.setupDateDefaults();
        this.populateMonthYearDropdowns();
        this.populateTransactionsDropdowns();
        this.checkReminders();
        
        // Set initial budget value
        const budget = DataManager.getMonthlyBudget();
        const budgetInput = document.getElementById('monthlyBudget');
        if (budgetInput && budget > 0) {
            budgetInput.value = budget;
        }
    },

    setupAudioUnlock() {
        const unlock = () => {
            try {
                const Ctx = window.AudioContext || window.webkitAudioContext;
                if (!Ctx) return;
                this.audioContext = this.audioContext || new Ctx();
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                this.audioReady = true;
                document.removeEventListener('pointerdown', unlock);
                document.removeEventListener('touchstart', unlock);
            } catch (_) {}
        };
        document.addEventListener('pointerdown', unlock, { once: true });
        document.addEventListener('touchstart', unlock, { once: true });
    },

    // Setup all event listeners
    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                if (page) {
                    this.switchPage(page);
                } else if (item.id === 'reminderNavItem') {
                    this.openReminders();
                } else if (item.id === 'settingsNavItem') {
                    this.openSettings();
                }
            });
        });

        // Language toggle is handled by LanguageManager.setupToggleButton() in init
        // No need to call it here as it's already set up

        // Budget input (inline)
        const budgetInput = document.getElementById('monthlyBudget');
        if (budgetInput) {
            budgetInput.addEventListener('blur', (e) => {
                const budget = parseFloat(e.target.value) || 0;
                DataManager.saveMonthlyBudget(budget);
                this.loadDashboard();
                this.showNotification(LanguageManager.translate('budgetUpdated'), 'success');
            });
            budgetInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.target.blur();
                }
            });
        }

        // Add expense button
        const addExpenseBtn = document.getElementById('addExpenseBtn');
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => this.openExpenseModal());
        }

        // Modal close buttons
        document.getElementById('closeExpenseModal').addEventListener('click', () => this.closeModal('expenseModal'));
        document.getElementById('closeBreakdownModal').addEventListener('click', () => this.closeModal('breakdownModal'));
        document.getElementById('closeSettingsModal').addEventListener('click', () => this.closeModal('settingsModal'));
        document.getElementById('closeReminderModal').addEventListener('click', () => this.closeModal('reminderModal'));
        document.getElementById('closeCategoryModal').addEventListener('click', () => this.closeModal('categoryModal'));
        document.getElementById('closeAddCategoryModal').addEventListener('click', () => this.closeModal('addCategoryModal'));
        document.getElementById('closeAddReminderModal').addEventListener('click', () => this.closeModal('addReminderModal'));
        document.getElementById('closePdfPreviewModal').addEventListener('click', () => this.closeModal('pdfPreviewModal'));
        document.getElementById('closePdfPreviewBtn').addEventListener('click', () => this.closeModal('pdfPreviewModal'));
        document.getElementById('closeMonthlyHistoryModal').addEventListener('click', () => this.closeModal('monthlyHistoryModal'));
        document.getElementById('closeBudgetHistoryModal').addEventListener('click', () => this.closeModal('budgetHistoryModal'));

        // Cancel buttons
        document.getElementById('cancelExpense').addEventListener('click', () => this.closeModal('expenseModal'));
        document.getElementById('cancelCategory').addEventListener('click', () => this.closeModal('addCategoryModal'));
        document.getElementById('cancelReminder').addEventListener('click', () => this.closeModal('addReminderModal'));

        // Expense form
        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveExpense();
        });

        // Category form
        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });

        // Reminder form
        document.getElementById('reminderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveReminder();
        });

        // Action buttons
        const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
        if (manageCategoriesBtn) {
            manageCategoriesBtn.addEventListener('click', () => this.openCategoryManagement());
        }
        
        const manageCategoriesPageBtn = document.getElementById('manageCategoriesPageBtn');
        if (manageCategoriesPageBtn) {
            manageCategoriesPageBtn.addEventListener('click', () => this.openAddCategory());
        }
        
        document.getElementById('exportPdfBtn').addEventListener('click', () => this.previewPDF());
        document.getElementById('viewBreakdownBtn').addEventListener('click', () => this.openBreakdown());
        document.getElementById('monthlyHistoryBtn').addEventListener('click', () => this.openMonthlyHistory());
        document.getElementById('budgetHistoryBtn').addEventListener('click', () => this.openBudgetHistory());
        
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }
        const reminderBtn = document.getElementById('reminderBtn');
        if (reminderBtn) {
            reminderBtn.addEventListener('click', () => this.openReminders());
        }

        // Transactions filter
        const filterTransactions = document.getElementById('filterTransactions');
        if (filterTransactions) {
            filterTransactions.addEventListener('click', () => {
                const categorySelect = document.getElementById('transactionsCategory');
                const monthSelect = document.getElementById('transactionsMonth');
                const yearSelect = document.getElementById('transactionsYear');
                this.selectedCategory = categorySelect ? categorySelect.value : '';
                const month = parseInt(monthSelect ? monthSelect.value : '', 10);
                const year = parseInt(yearSelect ? yearSelect.value : '', 10);
                this.selectedMonth = Number.isNaN(month) ? new Date().getMonth() : month;
                this.selectedYear = Number.isNaN(year) ? new Date().getFullYear() : year;
                this.renderTransactions();
            });
        }

        // PDF download button
        document.getElementById('downloadPdfBtn').addEventListener('click', () => {
            this.downloadPDF();
        });

        // Settings tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.switchSettingsTab(tab);
            });
        });

        // Breakdown filter
        document.getElementById('filterBreakdown').addEventListener('click', () => {
            const month = parseInt(document.getElementById('breakdownMonth').value);
            const year = parseInt(document.getElementById('breakdownYear').value);
            this.selectedMonth = month;
            this.selectedYear = year;
            this.renderBreakdown();
        });

        // Add buttons
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.openAddCategory());
        document.getElementById('addReminderBtn').addEventListener('click', () => this.openAddReminder());

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Category amount display update
        document.getElementById('expenseCategory').addEventListener('change', () => {
            this.updateCategoryTotal();
        });
    },

    // Setup date defaults
    setupDateDefaults() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expenseDate').value = today;
    },

    // Load and update dashboard
    loadDashboard() {
        const budget = DataManager.getMonthlyBudget();
        const expenses = DataManager.getCurrentMonthExpenses();
        const totalSpent = DataManager.calculateTotalSpent(expenses);
        const remaining = budget - totalSpent;

        document.getElementById('totalSpent').textContent = `₹${totalSpent.toFixed(2)}`;
        document.getElementById('remainingBalance').textContent = `₹${remaining.toFixed(2)}`;
        
        // Color code remaining balance
        const remainingEl = document.getElementById('remainingBalance');
        if (remaining < 0) {
            remainingEl.style.color = 'var(--danger-color)';
        } else if (remaining < budget * 0.2) {
            remainingEl.style.color = 'var(--warning-color)';
        } else {
            remainingEl.style.color = 'var(--primary-color)';
        }
        
        // Check and display low balance alert (if remaining <= 1000)
        this.checkLowBalanceAlert(remaining);
    },

    // Check low balance alert
    checkLowBalanceAlert(remaining) {
        const ALERT_THRESHOLD = 1000;
        
        if (remaining <= ALERT_THRESHOLD && remaining >= 0) {
            // Show warning notification (triangle icon handled via CSS)
            const message = `Warning: Remaining balance is below ₹${ALERT_THRESHOLD}. Current balance: ₹${remaining.toFixed(2)}`;
            this.showNotification(message, 'warning');
            
            // Play notification sound
            this.playAlertSound();
        } else if (remaining < 0) {
            // Budget exceeded
            const message = `🚨 Alert: Budget exceeded by ₹${Math.abs(remaining).toFixed(2)}`;
            this.showNotification(message, 'danger');
            this.playAlertSound();
        }
    },

    // Play alert sound
    playAlertSound() {
        try {
            if (!this.audioReady) {
                this.showNotification('🔊 Tap anywhere once to enable sound', 'info');
                return;
            }
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            this.audioContext = this.audioContext || new Ctx();
            const audioContext = this.audioContext;
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.28);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (_) {}
    },

    // Render categories grid
    renderCategories() {
        const grid = document.getElementById('categoriesGrid');
        grid.innerHTML = '';
        
        const categories = CategoryManager.getAllCategories();
        const expenses = DataManager.getCurrentMonthExpenses();

        categories.forEach(category => {
            const categoryTotal = DataManager.calculateCategoryTotal(expenses, category.name);
            const icon = CategoryManager.getCategoryIcon(category.id);
            
            const card = document.createElement('div');
            card.className = 'category-card';
            card.setAttribute('data-category-id', category.id);
            card.setAttribute('data-category', category.name.toLowerCase().replace(/\s+/g, '-'));
            card.addEventListener('click', () => this.openExpenseModal(category.name));
            
            card.innerHTML = `
                <div class="category-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="category-name" data-translate="${category.name}">${LanguageManager.translate(category.name)}</div>
                <div class="category-total">₹${categoryTotal.toFixed(2)}</div>
            `;
            
            grid.appendChild(card);
        });
    },

    // Render categories page with detailed view
    renderCategoriesPage() {
        const grid = document.getElementById('categoriesGridPage');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const categories = CategoryManager.getAllCategories();
        const expenses = DataManager.getCurrentMonthExpenses();

        if (categories.length === 0) {
            grid.innerHTML = `<div style="text-align: center; padding: 40px; color: #7f8c8d;">⚠️ ${LanguageManager.translate('noCategories') || 'No categories found. Please add or refresh.'}</div>`;
            return;
        }

        categories.forEach(category => {
            const categoryTotal = DataManager.calculateCategoryTotal(expenses, category.name);
            const icon = CategoryManager.getCategoryIcon(category.id);
            const categoryExpenses = expenses.filter(e => e.category === category.name);
            
            const card = document.createElement('div');
            card.className = 'category-card-detail';
            card.setAttribute('data-category-id', category.id);
            card.innerHTML = `
                <div class="category-card-header" style="background: linear-gradient(135deg, ${this.getCategoryColor(category.id)} 0%, ${this.getCategoryColor(category.id)}dd 100%);">
                    <div class="category-icon-large">
                        <i class="fas ${icon}"></i>
                    </div>
                </div>
                <div class="category-card-body">
                    <div class="category-name-large" data-translate="${category.name}">${LanguageManager.translate(category.name)}</div>
                    <div class="category-stats">
                        <div class="stat">
                            <span class="stat-label">${LanguageManager.translate('total')}</span>
                            <span class="stat-value">₹${categoryTotal.toFixed(2)}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">${LanguageManager.translate('entries')}</span>
                            <span class="stat-value">${categoryExpenses.length}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">${LanguageManager.translate('average')}</span>
                            <span class="stat-value">₹${categoryExpenses.length > 0 ? (categoryTotal / categoryExpenses.length).toFixed(2) : '0'}</span>
                        </div>
                    </div>
                    <button class="btn-view-details" onclick="App.viewCategoryDetails('${category.name}')">
                        ${LanguageManager.translate('viewDetails')}
                    </button>
                    <div class="category-actions">
                        <button class="btn-edit-category" onclick="App.editCategory('${category.id}')" title="${LanguageManager.translate('edit')}">
                            <i class="fas fa-edit"></i>
                            <span>${LanguageManager.translate('edit')}</span>
                        </button>
                        <button class="btn-delete-category" onclick="App.deleteCategory('${category.id}')" title="${LanguageManager.translate('delete')}">
                            <i class="fas fa-trash"></i>
                            <span>${LanguageManager.translate('delete')}</span>
                        </button>
                    </div>
                </div>
            `;
            
            grid.appendChild(card);
        });
    },

    // Get color for category
    getCategoryColor(categoryId) {
        const colors = {
            'grocery': '#FF6B6B',
            'celebrations': '#FF8C42',
            'child-savings': '#FFA500',
            'house-repair': '#FFD93D',
            'money-given': '#6BCF7F',
            'electric-bills': '#4ECDC4',
            'non-veg-food': '#FF6348',
            'auto-fees': '#95E1D3',
            'ornaments': '#FFB6C1',
            'milk': '#FFF8DC',
            'gas-cylinder': '#87CEEB',
            'vegetables': '#90EE90',
            'miscellaneous': '#DDA0DD',
            'phone-bill': '#20B2AA',
            'fruits': '#FFD700',
            'tv-cable-bill': '#87CEFA',
            'dining-out': '#FF7F50',
            'school-fees': '#DEB887'
        };
        return colors[categoryId] || '#9B9B9B';
    },

    // View category details
    viewCategoryDetails(categoryName) {
        const expenses = DataManager.getCurrentMonthExpenses().filter(e => e.category === categoryName);
        const category = CategoryManager.getCategoryByName(categoryName);
        
        if (expenses.length === 0) {
            this.showNotification(`${LanguageManager.translate('noExpenses')} for ${categoryName}`, 'info');
            return;
        }
        
        // Show in breakdown modal
        this.openBreakdown();
        
        // Filter to show only this category
        const list = document.getElementById('breakdownList');
        list.innerHTML = '';
        
        const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sorted.forEach(expense => {
            const icon = category ? CategoryManager.getCategoryIcon(category.id) : 'fa-circle';
            const date = new Date(expense.date);
            const dateStr = date.toLocaleDateString();
            const statusDisplay = expense.status === 'paid' ? '✅ Paid' : '⏳ Pending';
            
            const item = document.createElement('div');
            item.className = 'expense-item';
            item.innerHTML = `
                <div class="expense-info">
                    <div class="expense-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="expense-details">
                        <div class="expense-category">${LanguageManager.translate(expense.category)}</div>
                        <div class="expense-meta">
                            <span class="expense-date">${dateStr}</span>
                            <span class="expense-time">${expense.time || 'N/A'}</span>
                            <span class="expense-status">${statusDisplay}</span>
                        </div>
                    </div>
                </div>
                <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
                <div class="expense-actions">
                    <button class="btn-edit" onclick="App.editExpense('${expense.id}')" title="${LanguageManager.translate('edit')}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="App.deleteExpense('${expense.id}')" title="${LanguageManager.translate('delete')}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            list.appendChild(item);
        });
    },

    // Open expense entry modal
    openExpenseModal(categoryName = null) {
        this.currentEditingExpenseId = null;
        const modal = document.getElementById('expenseModal');
        const form = document.getElementById('expenseForm');
        
        // Reset form
        form.reset();
        this.setupDateDefaults();
        
        // Populate category dropdown
        this.populateCategoryDropdown();
        
        // Set category if provided
        if (categoryName) {
            document.getElementById('expenseCategory').value = categoryName;
        }
        
        // Set default status to "paid"
        document.getElementById('expenseStatus').value = 'paid';
        
        // Update category total
        this.updateCategoryTotal();
        
        // Show modal
        modal.classList.add('show');
    },

    // Populate category dropdown
    populateCategoryDropdown() {
        const select = document.getElementById('expenseCategory');
        select.innerHTML = '';
        
        const categories = CategoryManager.getAllCategories();
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = LanguageManager.translate(category.name);
            select.appendChild(option);
        });
    },

    // Update category total display
    updateCategoryTotal() {
        const category = document.getElementById('expenseCategory').value;
        const expenses = DataManager.getCurrentMonthExpenses();
        const categoryTotal = DataManager.calculateCategoryTotal(expenses, category);
        document.getElementById('categoryTotalDisplay').textContent = `₹${categoryTotal.toFixed(2)}`;
    },

    // Save expense (auto-save)
    saveExpense() {
        const date = document.getElementById('expenseDate').value;
        const category = document.getElementById('expenseCategory').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const comments = document.getElementById('expenseComments').value.trim();
        const status = document.getElementById('expenseStatus').value || 'paid';

        if (!date || !category || !amount || amount <= 0) {
            this.showNotification('Please fill all fields correctly', 'error');
            return;
        }

        if (this.currentEditingExpenseId) {
            // Update existing expense - preserve time if not changing date
            const existingExpense = DataManager.getExpenseById(this.currentEditingExpenseId);
            const updateData = { date, category, amount, comments, status };
            // Only update time if date changed
            if (existingExpense && existingExpense.date !== date) {
                const now = new Date();
                const plusOneHour = new Date(now.getTime() + 60 * 60 * 1000);
                updateData.time = plusOneHour.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
            }
            DataManager.updateExpense(this.currentEditingExpenseId, updateData);
            this.showNotification(LanguageManager.translate('expenseUpdated'), 'success');
        } else {
            // Save new expense - time is automatically set in saveExpense
            DataManager.saveExpense(date, category, amount, comments, status);
            this.showNotification(LanguageManager.translate('expenseSaved'), 'success');
        }

        // Reset form and close modal
        document.getElementById('expenseForm').reset();
        this.setupDateDefaults();
        this.closeModal('expenseModal');
        
        // Refresh UI
        this.loadDashboard();
        this.renderCategories();
        this.renderCategoriesPage();
        if (document.getElementById('transactionsPage').classList.contains('hidden') === false) {
            this.renderTransactions();
        }
    },

    // Open breakdown modal
    openBreakdown() {
        const modal = document.getElementById('breakdownModal');
        this.renderBreakdown();
        modal.classList.add('show');
    },

    // Render spending breakdown
    renderBreakdown() {
        const expenses = DataManager.getMonthlyExpenses(this.selectedMonth, this.selectedYear);
        const list = document.getElementById('breakdownList');
        
        if (expenses.length === 0) {
            list.innerHTML = `<div style="text-align: center; padding: 20px; color: #7f8c8d;">${LanguageManager.translate('noExpenses')}</div>`;
            return;
        }

        // Sort by date (newest first)
        const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        list.innerHTML = '';
        
        sorted.forEach(expense => {
            const category = CategoryManager.getCategoryByName(expense.category);
            const icon = category ? CategoryManager.getCategoryIcon(category.id) : 'fa-circle';
            const date = new Date(expense.date);
            const dateStr = date.toLocaleDateString();
            const timeStr = expense.time || 'N/A';
            const statusDisplay = expense.status === 'paid' ? '✅ Paid' : '⏳ Pending';
            const statusClass = expense.status === 'paid' ? 'status-paid' : 'status-pending';
            
            const item = document.createElement('div');
            item.className = 'expense-item';
            item.innerHTML = `
                <div class="expense-info">
                    <div class="expense-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="expense-details">
                        <div class="expense-category">${LanguageManager.translate(expense.category)}</div>
                        <div class="expense-meta">
                            <span class="expense-date">${dateStr}</span>
                            <span class="expense-time">${timeStr}</span>
                            <span class="status-badge ${statusClass}">${statusDisplay}</span>
                        </div>
                        ${expense.comments ? `<div class="expense-comments">${expense.comments}</div>` : ''}
                    </div>
                </div>
                <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
                <div class="expense-actions">
                    <button class="btn-edit" onclick="App.editExpense('${expense.id}')" title="${LanguageManager.translate('edit')}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="App.deleteExpense('${expense.id}')" title="${LanguageManager.translate('delete')}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            list.appendChild(item);
        });
    },

    // Edit expense
    editExpense(id) {
        const expense = DataManager.getExpenseById(id);
        if (!expense) return;

        this.currentEditingExpenseId = id;
        document.getElementById('expenseDate').value = expense.date;
        document.getElementById('expenseCategory').value = expense.category;
        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('expenseComments').value = expense.comments || '';
        document.getElementById('expenseStatus').value = expense.status || 'paid';
        this.updateCategoryTotal();
        
        document.getElementById('expenseModal').classList.add('show');
    },

    // Delete expense
    deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            DataManager.deleteExpense(id);
            this.showNotification(LanguageManager.translate('expenseDeleted'), 'success');
            this.loadDashboard();
            this.renderCategories();
            this.renderBreakdown();
        }
    },

    // Open settings modal
    openSettings() {
        const modal = document.getElementById('settingsModal');
        this.renderIconCustomization();
        this.renderRemindersList();
        this.renderExpenseTracking();
        modal.classList.add('show');
    },

    // Switch settings tab
    switchSettingsTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tab) {
                btn.classList.add('active');
            }
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tab}Tab`) {
                content.classList.add('active');
            }
        });
        
        // Render tracking data when tab is switched
        if (tab === 'tracking') {
            this.renderExpenseTracking();
        }
    },

    // Render icon customization
    renderIconCustomization() {
        const grid = document.getElementById('iconGrid');
        grid.innerHTML = '';
        
        const categories = CategoryManager.getAllCategories();
        const availableIcons = CategoryManager.getAvailableIcons();

        categories.forEach(category => {
            const currentIcon = CategoryManager.getCategoryIcon(category.id);
            const customIcon = DataManager.getCustomIcon(category.name);
            
            const item = document.createElement('div');
            item.className = 'icon-item';
            if (customIcon) {
                item.classList.add('selected');
            }
            
            item.innerHTML = `
                <div class="icon-preview">
                    <i class="fas ${currentIcon}"></i>
                </div>
                <div class="icon-name">${LanguageManager.translate(category.name)}</div>
            `;
            
            item.addEventListener('click', () => {
                this.openIconSelector(category);
            });
            
            grid.appendChild(item);
        });
    },

    // Open icon selector (simplified - using first available icon as example)
    openIconSelector(category) {
        const icons = CategoryManager.getAvailableIcons();
        const selectedIcon = prompt(`Enter icon class (e.g., fa-shopping-cart) for ${category.name}:`, CategoryManager.getCategoryIcon(category.id));
        
        if (selectedIcon) {
            DataManager.saveCustomIcon(category.name, selectedIcon);
            this.renderIconCustomization();
            this.renderCategories();
            this.showNotification('Icon updated successfully', 'success');
        }
    },

    // Render reminders list
    renderRemindersList() {
        const list = document.getElementById('remindersList');
        const reminders = DataManager.getReminders();
        
        list.innerHTML = '';
        
        if (reminders.length === 0) {
            list.innerHTML = `<div style="text-align: center; padding: 20px; color: #7f8c8d;">${LanguageManager.translate('noReminders')}</div>`;
            return;
        }

        reminders.forEach(reminder => {
            const category = CategoryManager.getCategoryByName(reminder.category);
            const icon = category ? CategoryManager.getCategoryIcon(category.id) : 'fa-bell';
            const date = new Date(reminder.date);
            const dateStr = date.toLocaleDateString();
            
            const item = document.createElement('div');
            item.className = 'reminder-item';
            item.innerHTML = `
                <div class="reminder-info">
                    <div class="reminder-category">
                        <i class="fas ${icon}"></i> ${LanguageManager.translate(reminder.category)}
                    </div>
                    <div class="reminder-date">${dateStr}</div>
                    ${reminder.amount ? `<div class="reminder-amount">₹${reminder.amount.toFixed(2)}</div>` : ''}
                </div>
                <div class="expense-actions">
                    <button class="btn-edit" onclick="App.editReminder('${reminder.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="App.deleteReminder('${reminder.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            list.appendChild(item);
        });
    },

    // Render expense tracking report
    renderExpenseTracking() {
        const yearSelect = document.getElementById('trackingYear');
        const summary = document.getElementById('trackingSummary');
        
        if (!yearSelect || !summary) return;
        
        // Populate year dropdown
        const currentYear = new Date().getFullYear();
        yearSelect.innerHTML = '';
        for (let year = currentYear; year >= currentYear - 2; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
        
        // Year change handler
        yearSelect.removeEventListener('change', this.handleTrackingYearChange);
        this.handleTrackingYearChange = () => this.renderTrackingData(parseInt(yearSelect.value));
        yearSelect.addEventListener('change', this.handleTrackingYearChange);
        
        // Initial render
        this.renderTrackingData(currentYear);
    },
    
    // Render tracking data for selected year
    renderTrackingData(year) {
        const summary = document.getElementById('trackingSummary');
        if (!summary) return;
        
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        
        let yearTotal = 0;
        let monthlyData = [];
        
        // Calculate monthly totals
        months.forEach((monthName, index) => {
            const expenses = DataManager.getMonthlyExpenses(index, year);
            const total = DataManager.calculateTotalSpent(expenses);
            yearTotal += total;
            monthlyData.push({ month: monthName, total, count: expenses.length });
        });
        
        // Build summary HTML
        let html = `
            <div class="tracking-year-summary">
                <h4>Year ${year} Summary</h4>
                <div class="tracking-stat-large">
                    <span class="stat-label">Total Spent:</span>
                    <span class="stat-value">₹${yearTotal.toFixed(2)}</span>
                </div>
            </div>
            <div class="tracking-monthly-breakdown">
                <h4>Monthly Breakdown</h4>
                <div class="tracking-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Expenses</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        monthlyData.forEach(data => {
            html += `
                <tr>
                    <td>${data.month}</td>
                    <td>${data.count}</td>
                    <td style="font-weight: 600; color: var(--primary-color);">₹${data.total.toFixed(2)}</td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        summary.innerHTML = html;
    },

    // Open add reminder modal
    openAddReminder(id = null) {
        this.currentEditingReminderId = id;
        const modal = document.getElementById('addReminderModal');
        const form = document.getElementById('reminderForm');
        const title = document.getElementById('addReminderTitle');
        
        form.reset();
        
        if (id) {
            title.textContent = LanguageManager.translate('editCategory');
            const reminder = DataManager.getReminders().find(r => r.id === id);
            if (reminder) {
                document.getElementById('reminderCategory').value = reminder.category;
                document.getElementById('reminderDate').value = reminder.date;
                document.getElementById('reminderAmount').value = reminder.amount || '';
            }
        } else {
            title.textContent = LanguageManager.translate('addReminder');
        }
        
        // Populate category dropdown
        const select = document.getElementById('reminderCategory');
        select.innerHTML = '';
        const categories = CategoryManager.getAllCategories();
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = LanguageManager.translate(category.name);
            select.appendChild(option);
        });
        
        modal.classList.add('show');
    },

    // Save reminder
    saveReminder() {
        const category = document.getElementById('reminderCategory').value;
        const date = document.getElementById('reminderDate').value;
        const amount = parseFloat(document.getElementById('reminderAmount').value) || null;

        if (!category || !date) {
            this.showNotification('Please fill required fields', 'error');
            return;
        }

        if (this.currentEditingReminderId) {
            DataManager.updateReminder(this.currentEditingReminderId, { category, date, amount });
            this.showNotification(LanguageManager.translate('reminderUpdated'), 'success');
        } else {
            DataManager.addReminder({ category, date, amount });
            this.showNotification(LanguageManager.translate('reminderAdded'), 'success');
        }

        document.getElementById('reminderForm').reset();
        this.closeModal('addReminderModal');
        this.renderRemindersList();
        this.renderRemindersDisplay();
    },

    // Edit reminder
    editReminder(id) {
        this.openAddReminder(id);
    },

    // Delete reminder
    deleteReminder(id) {
        if (confirm('Are you sure you want to delete this reminder?')) {
            DataManager.deleteReminder(id);
            this.showNotification(LanguageManager.translate('reminderDeleted'), 'success');
            this.renderRemindersList();
            this.renderRemindersDisplay();
        }
    },

    // Open reminders display
    openReminders() {
        const modal = document.getElementById('reminderModal');
        this.renderRemindersDisplay();
        modal.classList.add('show');
    },

    // Render reminders display
    renderRemindersDisplay() {
        const display = document.getElementById('remindersDisplay');
        const reminders = DataManager.getReminders();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter upcoming reminders (within next 7 days)
        const upcoming = reminders.filter(r => {
            const reminderDate = new Date(r.date);
            reminderDate.setHours(0, 0, 0, 0);
            const diffTime = reminderDate - today;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays >= 0 && diffDays <= 7;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        display.innerHTML = '';
        
        if (upcoming.length === 0) {
            display.innerHTML = `<div style="text-align: center; padding: 20px; color: #7f8c8d;">${LanguageManager.translate('noReminders')}</div>`;
            return;
        }

        upcoming.forEach(reminder => {
            const category = CategoryManager.getCategoryByName(reminder.category);
            const icon = category ? CategoryManager.getCategoryIcon(category.id) : 'fa-bell';
            const date = new Date(reminder.date);
            const dateStr = date.toLocaleDateString();
            const diffTime = date - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            const item = document.createElement('div');
            item.className = 'reminder-item';
            item.innerHTML = `
                <div class="reminder-info">
                    <div class="reminder-category">
                        <i class="fas ${icon}"></i> ${LanguageManager.translate(reminder.category)}
                    </div>
                    <div class="reminder-date">${dateStr} (${diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `${diffDays} days`})</div>
                    ${reminder.amount ? `<div class="reminder-amount">₹${reminder.amount.toFixed(2)}</div>` : ''}
                </div>
            `;
            display.appendChild(item);
        });
    },

    // Check reminders on load
    checkReminders() {
        // This could be enhanced to show browser notifications
        const reminders = DataManager.getReminders();
        const today = new Date().toISOString().split('T')[0];
        
        const todayReminders = reminders.filter(r => r.date === today);
        if (todayReminders.length > 0) {
            // Could show a notification here
        }
    },

    // Open category management
    openCategoryManagement() {
        const modal = document.getElementById('categoryModal');
        this.renderCategoriesList();
        modal.classList.add('show');
    },

    // Render categories list for management
    renderCategoriesList() {
        const list = document.getElementById('categoriesList');
        const categories = CategoryManager.getAllCategories();
        
        list.innerHTML = '';
        
        categories.forEach(category => {
            const icon = CategoryManager.getCategoryIcon(category.id);
            
            const item = document.createElement('div');
            item.className = `manage-category-item ${category.isDefault ? 'default' : ''}`;
            item.innerHTML = `
                <div class="manage-category-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="manage-category-name">${LanguageManager.translate(category.name)}</div>
                ${!category.isDefault ? `
                    <div class="manage-category-actions">
                        <button class="btn-edit" onclick="App.editCategory('${category.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="App.deleteCategory('${category.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : '<div style="font-size: 0.8rem; color: #7f8c8d;">Default</div>'}
            `;
            list.appendChild(item);
        });
    },

    // Open add category modal
    openAddCategory(id = null) {
        this.currentEditingCategoryId = id;
        const modal = document.getElementById('addCategoryModal');
        const form = document.getElementById('categoryForm');
        const title = document.getElementById('addCategoryTitle');
        
        form.reset();
        
        if (id) {
            title.textContent = LanguageManager.translate('editCategory');
            const category = CategoryManager.getCategoryById(id);
            if (category) {
                document.getElementById('categoryName').value = category.name;
                document.getElementById('categoryIcon').value = category.icon;
            }
        } else {
            title.textContent = LanguageManager.translate('addCategory');
        }
        
        // Populate icon dropdown
        const select = document.getElementById('categoryIcon');
        select.innerHTML = '';
        const icons = CategoryManager.getAvailableIcons();
        icons.forEach(icon => {
            const option = document.createElement('option');
            option.value = icon;
            option.textContent = icon.replace('fa-', '').replace(/-/g, ' ');
            select.appendChild(option);
        });
        
        modal.classList.add('show');
    },

    // Save category
    saveCategory() {
        const name = document.getElementById('categoryName').value.trim();
        const icon = document.getElementById('categoryIcon').value;

        if (!name || !icon) {
            this.showNotification('Please fill all fields', 'error');
            return;
        }

        if (this.currentEditingCategoryId) {
            CategoryManager.updateCategory(this.currentEditingCategoryId, { name, icon });
            this.showNotification(LanguageManager.translate('categoryUpdated'), 'success');
        } else {
            CategoryManager.addCustomCategory(name, icon);
            this.showNotification(LanguageManager.translate('categoryAdded'), 'success');
        }

        document.getElementById('categoryForm').reset();
        this.closeModal('addCategoryModal');
        this.renderCategoriesList();
        this.renderCategories();
        this.populateCategoryDropdown();
    },

    // Edit category
    editCategory(id) {
        this.openAddCategory(id);
    },

    // Delete category
    deleteCategory(id) {
        if (confirm('Are you sure you want to delete this category?')) {
            try {
                CategoryManager.deleteCategory(id);
                this.showNotification(LanguageManager.translate('categoryDeleted'), 'success');
                this.renderCategoriesList();
                this.renderCategories();
                this.populateCategoryDropdown();
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }
    },

    // Switch page
    switchPage(page) {
        // Hide all pages
        document.querySelectorAll('.page-content').forEach(p => {
            p.classList.add('hidden');
        });
        
        // Show selected page
        const pageElement = document.getElementById(`${page}Page`);
        if (pageElement) {
            pageElement.classList.remove('hidden');
        }
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === page) {
                item.classList.add('active');
            }
        });
        
        // Load page-specific data
        if (page === 'transactions') {
            this.populateTransactionsDropdowns();
            this.renderTransactions();
        } else if (page === 'dashboard') {
            this.loadDashboard();
            this.renderCategories();
        } else if (page === 'categories') {
            this.renderCategoriesPage();
        }
    },

    // Populate transactions dropdowns
    populateTransactionsDropdowns() {
        const categorySelect = document.getElementById('transactionsCategory');
        const monthSelect = document.getElementById('transactionsMonth');
        const yearSelect = document.getElementById('transactionsYear');
        
        if (!monthSelect || !yearSelect) return;
        
        // Populate category dropdown
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">All Categories</option>';
            const categories = CategoryManager.getAllCategories();
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = LanguageManager.translate(category.name);
                if (category.name === this.selectedCategory) {
                    option.selected = true;
                }
                categorySelect.appendChild(option);
            });
        }
        
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        
        monthSelect.innerHTML = '';
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = month;
            if (index === this.selectedMonth) {
                option.selected = true;
            }
            monthSelect.appendChild(option);
        });
        
        yearSelect.innerHTML = '';
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 2; year <= currentYear + 1; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === this.selectedYear) {
                option.selected = true;
            }
            yearSelect.appendChild(option);
        }
    },

    // Render transactions table
    renderTransactions() {
        const tbody = document.getElementById('transactionsTableBody');
        if (!tbody) return;
        
        let expenses = DataManager.getMonthlyExpenses(this.selectedMonth, this.selectedYear);
        
        // Filter by category if selected
        if (this.selectedCategory) {
            expenses = expenses.filter(expense => expense.category === this.selectedCategory);
        }
        
        if (expenses.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: #7f8c8d;">${LanguageManager.translate('noExpenses')}</td></tr>`;
            return;
        }
        
        // Sort by date and time (newest first)
        const sorted = [...expenses].sort((a, b) => {
            const dateA = new Date(a.date + ' ' + (a.time || '00:00'));
            const dateB = new Date(b.date + ' ' + (b.time || '00:00'));
            return dateB - dateA;
        });
        
        tbody.innerHTML = '';
        
        sorted.forEach(expense => {
            const category = CategoryManager.getCategoryByName(expense.category);
            const icon = category ? CategoryManager.getCategoryIcon(category.id) : 'fa-circle';
            const date = new Date(expense.date);
            const dateStr = date.toLocaleDateString();
            const timeStr = expense.time || 'N/A';
            const statusDisplay = expense.status === 'paid' ? '✅ Paid' : '⏳ Pending';
            const statusClass = expense.status === 'paid' ? 'status-paid' : 'status-pending';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dateStr}</td>
                <td>${timeStr}</td>
                <td>
                    <i class="fas ${icon}" style="margin-right: 8px; color: var(--primary-color);"></i>
                    ${LanguageManager.translate(expense.category)}
                </td>
                <td style="font-weight: 600; color: var(--primary-color);">₹${expense.amount.toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}">${statusDisplay}</span></td>
                <td>${expense.comments || '-'}</td>
                <td class="actions-cell">
                    <div class="actions-inner">
                        <button class="btn-edit" onclick="App.editExpense('${expense.id}')" title="${LanguageManager.translate('edit')}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="App.deleteExpense('${expense.id}')" title="${LanguageManager.translate('delete')}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    // Preview PDF
    previewPDF() {
        const now = new Date();
        const pdfBlob = PDFExport.generatePDFBlob(now.getMonth(), now.getFullYear());
        
        if (pdfBlob) {
            const url = URL.createObjectURL(pdfBlob);
            const previewFrame = document.getElementById('pdfPreviewFrame');
            previewFrame.src = url;
            
            const modal = document.getElementById('pdfPreviewModal');
            modal.classList.add('show');
            
            // Store blob URL for download
            this.currentPdfBlobUrl = url;
        }
    },

    // Download PDF
    downloadPDF() {
        if (this.currentPdfBlobUrl) {
            const link = document.createElement('a');
            link.href = this.currentPdfBlobUrl;
            link.download = `AGZ_Expenses_${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.pdf`;
            link.click();
        } else {
            // Fallback to direct export
            const now = new Date();
            PDFExport.exportToPDF(now.getMonth(), now.getFullYear());
        }
    },

    // Export PDF (legacy method)
    exportPDF() {
        const now = new Date();
        PDFExport.exportToPDF(now.getMonth(), now.getFullYear());
    },

    // Populate month/year dropdowns
    populateMonthYearDropdowns() {
        const monthSelect = document.getElementById('breakdownMonth');
        const yearSelect = document.getElementById('breakdownYear');
        
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        
        monthSelect.innerHTML = '';
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = month;
            if (index === this.selectedMonth) {
                option.selected = true;
            }
            monthSelect.appendChild(option);
        });
        
        yearSelect.innerHTML = '';
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 2; year <= currentYear + 1; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === this.selectedYear) {
                option.selected = true;
            }
            yearSelect.appendChild(option);
        }
    },

    // Close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
        
        // Reset editing states
        if (modalId === 'expenseModal') {
            this.currentEditingExpenseId = null;
        } else if (modalId === 'addCategoryModal') {
            this.currentEditingCategoryId = null;
        } else if (modalId === 'addReminderModal') {
            this.currentEditingReminderId = null;
        }
    },

    // Open monthly history modal
    openMonthlyHistory() {
        const modal = document.getElementById('monthlyHistoryModal');
        this.renderMonthlyHistory();
        modal.classList.add('show');
    },

    // Render monthly history
    renderMonthlyHistory() {
        const container = document.getElementById('monthlyHistoryContent');
        const monthlySummary = DataManager.getMonthlySummary();

        if (monthlySummary.length === 0) {
            container.innerHTML = `<div style="text-align: center; padding: 40px; color: #7f8c8d;">📊 ${LanguageManager.translate('noExpenses')}</div>`;
            return;
        }

        container.innerHTML = '';
        
        monthlySummary.forEach(month => {
            const savedClass = month.saved >= 0 ? 'positive' : 'negative';
            const savedIcon = month.saved >= 0 ? '📈' : '📉';
            
            const card = document.createElement('div');
            card.className = 'history-card';
            card.style.cssText = `
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                padding: 20px;
                margin: 15px 0;
                border-radius: 10px;
                border-left: 5px solid ${month.saved >= 0 ? '#27ae60' : '#e74c3c'};
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            `;
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; font-size: 18px; color: #2c3e50;">${month.monthName}</h3>
                    <span style="font-size: 24px;">${savedIcon}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center;">
                    <div>
                        <div style="color: #7f8c8d; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">${LanguageManager.translate('monthlyBudget')}</div>
                        <div style="font-size: 18px; font-weight: bold; color: #3498db;">₹${month.budget.toFixed(2)}</div>
                    </div>
                    <div>
                        <div style="color: #7f8c8d; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">${LanguageManager.translate('totalSpent')}</div>
                        <div style="font-size: 18px; font-weight: bold; color: #e74c3c;">₹${month.spent.toFixed(2)}</div>
                    </div>
                    <div>
                        <div style="color: #7f8c8d; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">${LanguageManager.translate('totalSaved')}</div>
                        <div style="font-size: 18px; font-weight: bold; color: ${savedClass === 'positive' ? '#27ae60' : '#e74c3c'};">₹${Math.abs(month.saved).toFixed(2)}</div>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
    },

    // Open budget history modal
    openBudgetHistory() {
        const modal = document.getElementById('budgetHistoryModal');
        this.renderBudgetHistory();
        modal.classList.add('show');
    },

    // Render budget history
    renderBudgetHistory() {
        const container = document.getElementById('budgetHistoryContent');
        const history = DataManager.getBudgetHistory();

        if (history.length === 0) {
            container.innerHTML = `<div style="text-align: center; padding: 40px; color: #7f8c8d;">💰 ${LanguageManager.translate('noExpenses')}</div>`;
            return;
        }

        container.innerHTML = '';
        
        // Sort by timestamp (newest first)
        const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        sortedHistory.forEach(entry => {
            const amountChange = entry.amountAdded;
            const isIncrease = amountChange >= 0;
            const changeIcon = isIncrease ? '⬆️' : '⬇️';
            const changeColor = isIncrease ? '#27ae60' : '#e74c3c';
            
            const item = document.createElement('div');
            item.className = 'budget-history-item';
            item.style.cssText = `
                background: #fff;
                padding: 15px;
                margin: 10px 0;
                border-radius: 8px;
                border-left: 4px solid ${changeColor};
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            `;
            
            item.innerHTML = `
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <span style="font-size: 20px;">${changeIcon}</span>
                        <div>
                            <div style="font-weight: 600; color: #2c3e50;">${entry.date} ${entry.time}</div>
                            <div style="font-size: 12px; color: #7f8c8d;">
                                ${LanguageManager.translate('dateTime')}: ${entry.date} at ${entry.time}
                            </div>
                        </div>
                    </div>
                </div>
                <div style="text-align: right; min-width: 200px;">
                    <div style="margin-bottom: 8px;">
                        <div style="font-size: 11px; color: #7f8c8d; text-transform: uppercase;">${LanguageManager.translate('amountAdded')}</div>
                        <div style="font-size: 16px; font-weight: bold; color: ${changeColor};">
                            ${isIncrease ? '+' : ''}₹${Math.abs(amountChange).toFixed(2)}
                        </div>
                    </div>
                    <div style="padding-top: 8px; border-top: 1px solid #ecf0f1;">
                        <div style="font-size: 11px; color: #7f8c8d; text-transform: uppercase;">${LanguageManager.translate('updateBudget')}</div>
                        <div style="font-size: 16px; font-weight: bold; color: #3498db;">₹${entry.newBudget.toFixed(2)}</div>
                    </div>
                </div>
            `;
            
            container.appendChild(item);
        });
    },

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        // Force red text color for warning notifications
        if (type === 'warning') {
            notification.style.color = '#ff3b30';
        } else {
            notification.style.color = '';
        }
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    
    // Initialize responsive features for mobile
    if (typeof ResponsiveManager !== 'undefined') {
        ResponsiveManager.init();
    }
    
    // Apply language translations after everything is loaded
    setTimeout(() => {
        if (typeof LanguageManager !== 'undefined') {
            LanguageManager.applyLanguage();
        }
    }, 100);
});

