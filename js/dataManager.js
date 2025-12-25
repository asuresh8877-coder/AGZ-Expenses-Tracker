// Data Manager - Handles all localStorage operations

const DataManager = {
    // Storage keys
    STORAGE_KEYS: {
        EXPENSES: 'agz_expenses',
        BUDGET: 'agz_monthly_budget',
        BUDGET_HISTORY: 'agz_budget_history',
        SETTINGS: 'agz_settings'
    },

    // Initialize data structure
    init() {
        if (!localStorage.getItem(this.STORAGE_KEYS.EXPENSES)) {
            localStorage.setItem(this.STORAGE_KEYS.EXPENSES, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.BUDGET)) {
            localStorage.setItem(this.STORAGE_KEYS.BUDGET, JSON.stringify(0));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.BUDGET_HISTORY)) {
            localStorage.setItem(this.STORAGE_KEYS.BUDGET_HISTORY, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.SETTINGS)) {
            localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify({
                language: 'english',
                reminders: [],
                customIcons: {}
            }));
        }
        // Cleanup old expenses (keep only 2 months)
        this.cleanupOldExpenses();
    },

    // Expense operations
    saveExpense(date, category, amount, comments = '', status = 'paid') {
        const expenses = this.getAllExpenses();
        const now = new Date();
        const plusOneHour = new Date(now.getTime() + 60 * 60 * 1000);
        const newExpense = {
            id: this.generateId(),
            date: date,
            time: plusOneHour.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }),
            category: category,
            amount: parseFloat(amount),
            comments: comments || '',
            status: status || 'paid',
            createdAt: plusOneHour.toISOString()
        };
        expenses.push(newExpense);
        localStorage.setItem(this.STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
        return newExpense;
    },

    getAllExpenses() {
        const expenses = localStorage.getItem(this.STORAGE_KEYS.EXPENSES);
        return expenses ? JSON.parse(expenses) : [];
    },

    getExpensesByCategory(category) {
        const expenses = this.getAllExpenses();
        return expenses.filter(expense => expense.category === category);
    },

    getMonthlyExpenses(month, year) {
        const expenses = this.getAllExpenses();
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
        });
    },

    getCurrentMonthExpenses() {
        const now = new Date();
        return this.getMonthlyExpenses(now.getMonth(), now.getFullYear());
    },

    deleteExpense(id) {
        const expenses = this.getAllExpenses();
        const filtered = expenses.filter(expense => expense.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));
        return true;
    },

    updateExpense(id, data) {
        const expenses = this.getAllExpenses();
        const index = expenses.findIndex(expense => expense.id === id);
        if (index !== -1) {
            expenses[index] = { ...expenses[index], ...data };
            if (data.amount) {
                expenses[index].amount = parseFloat(data.amount);
            }
            // Update time if date is changed
            if (data.date && !data.time) {
                const now = new Date();
                const plusOneHour = new Date(now.getTime() + 60 * 60 * 1000);
                expenses[index].time = plusOneHour.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
            }
            localStorage.setItem(this.STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
            return expenses[index];
        }
        return null;
    },

    getExpenseById(id) {
        const expenses = this.getAllExpenses();
        return expenses.find(expense => expense.id === id);
    },

    // Clean up expenses older than 2 months
    cleanupOldExpenses() {
        const expenses = this.getAllExpenses();
        const now = new Date();
        const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        
        const filtered = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= twoMonthsAgo;
        });
        
        if (filtered.length !== expenses.length) {
            localStorage.setItem(this.STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));
            console.log(`Cleaned up ${expenses.length - filtered.length} old expenses`);
        }
    },

    // Budget operations
    saveMonthlyBudget(amount) {
        const parsedAmount = parseFloat(amount);
        const oldBudget = this.getMonthlyBudget();
        
        // Add to history if budget changed
        if (oldBudget !== parsedAmount) {
            this.addBudgetHistory({
                previousBudget: oldBudget,
                newBudget: parsedAmount,
                amountAdded: parsedAmount - oldBudget,
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleDateString('en-IN'),
                time: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })
            });
        }
        
        localStorage.setItem(this.STORAGE_KEYS.BUDGET, JSON.stringify(parsedAmount));
        return parsedAmount;
    },

    getMonthlyBudget() {
        const budget = localStorage.getItem(this.STORAGE_KEYS.BUDGET);
        return budget ? parseFloat(JSON.parse(budget)) : 0;
    },

    // Budget history operations
    addBudgetHistory(historyEntry) {
        const history = this.getBudgetHistory();
        history.push(historyEntry);
        localStorage.setItem(this.STORAGE_KEYS.BUDGET_HISTORY, JSON.stringify(history));
        return historyEntry;
    },

    getBudgetHistory() {
        const history = localStorage.getItem(this.STORAGE_KEYS.BUDGET_HISTORY);
        return history ? JSON.parse(history) : [];
    },

    // Get monthly summary (budget, spent, saved for each month)
    getMonthlySummary() {
        const expenses = this.getAllExpenses();
        const allMonths = new Map();
        
        // Collect all months from expenses
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!allMonths.has(monthKey)) {
                allMonths.set(monthKey, { month: date.getMonth(), year: date.getFullYear() });
            }
        });
        
        // Generate summary for each month
        const summary = Array.from(allMonths.values()).map(monthData => {
            const monthExpenses = this.getMonthlyExpenses(monthData.month, monthData.year);
            const totalSpent = this.calculateTotalSpent(monthExpenses);
            
            // Get budget for that month (use current budget as fallback)
            const budget = this.getMonthlyBudget();
            const saved = budget - totalSpent;
            
            return {
                month: monthData.month,
                year: monthData.year,
                monthName: new Date(monthData.year, monthData.month, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
                budget: budget,
                spent: totalSpent,
                saved: saved,
                status: saved >= 0 ? 'positive' : 'negative'
            };
        });
        
        // Sort by date (newest first)
        return summary.sort((a, b) => {
            const dateA = new Date(a.year, a.month);
            const dateB = new Date(b.year, b.month);
            return dateB - dateA;
        });
    },

    // Settings operations
    getSettings() {
        const settings = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
        return settings ? JSON.parse(settings) : {
            language: 'english',
            reminders: [],
            customIcons: {}
        };
    },

    saveSettings(settings) {
        localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    },

    updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        this.saveSettings(settings);
    },

    // Reminder operations
    addReminder(reminder) {
        const settings = this.getSettings();
        const newReminder = {
            id: this.generateId(),
            ...reminder,
            createdAt: new Date().toISOString()
        };
        settings.reminders.push(newReminder);
        this.saveSettings(settings);
        return newReminder;
    },

    getReminders() {
        const settings = this.getSettings();
        return settings.reminders || [];
    },

    updateReminder(id, data) {
        const settings = this.getSettings();
        const index = settings.reminders.findIndex(r => r.id === id);
        if (index !== -1) {
            settings.reminders[index] = { ...settings.reminders[index], ...data };
            this.saveSettings(settings);
            return settings.reminders[index];
        }
        return null;
    },

    deleteReminder(id) {
        const settings = this.getSettings();
        settings.reminders = settings.reminders.filter(r => r.id !== id);
        this.saveSettings(settings);
        return true;
    },

    // Icon customization
    saveCustomIcon(category, icon) {
        const settings = this.getSettings();
        if (!settings.customIcons) {
            settings.customIcons = {};
        }
        settings.customIcons[category] = icon;
        this.saveSettings(settings);
    },

    getCustomIcon(category) {
        const settings = this.getSettings();
        return settings.customIcons && settings.customIcons[category] ? settings.customIcons[category] : null;
    },

    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Calculate totals
    calculateTotalSpent(expenses) {
        return expenses.reduce((total, expense) => total + (expense.amount || 0), 0);
    },

    calculateCategoryTotal(expenses, category) {
        const categoryExpenses = expenses.filter(exp => exp.category === category);
        return this.calculateTotalSpent(categoryExpenses);
    },

    // Get expenses grouped by category
    getExpensesGroupedByCategory(expenses) {
        const grouped = {};
        expenses.forEach(expense => {
            if (!grouped[expense.category]) {
                grouped[expense.category] = [];
            }
            grouped[expense.category].push(expense);
        });
        return grouped;
    }
};

// Initialize on load
DataManager.init();

