// PDF Export - Handles PDF generation using jsPDF

const PDFExport = {
    currentPdfBlob: null,

    // Format number with commas
    formatCurrency(amount) {
        return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    // Generate PDF blob for preview
    generatePDFBlob(month, year) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Get expenses for the month
            const expenses = DataManager.getMonthlyExpenses(month, year);
            const budget = DataManager.getMonthlyBudget();
            const totalSpent = DataManager.calculateTotalSpent(expenses);
            const remaining = budget - totalSpent;
            
            // Get month name
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            const monthName = monthNames[month];
            
            // Title
            doc.setFontSize(20);
            doc.setTextColor(102, 126, 234);
            doc.setFont(undefined, 'bold');
            doc.text('AGZ Monthly Expenses Report', 105, 20, { align: 'center' });
            
            // Month and Year
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'normal');
            doc.text(monthName + ' ' + year.toString(), 105, 30, { align: 'center' });
            
            let yPos = 45;
            
            // Summary Section
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Summary', 14, yPos);
            yPos += 8;
            
            doc.setFont(undefined, 'normal');
            doc.setFontSize(11);
            doc.text('Monthly Budget: Rs. ' + this.formatCurrency(budget), 20, yPos);
            yPos += 7;
            doc.text('Total Spent: Rs. ' + this.formatCurrency(totalSpent), 20, yPos);
            yPos += 7;
            doc.text('Remaining Balance: Rs. ' + this.formatCurrency(remaining), 20, yPos);
            yPos += 12;
            
            // Category Breakdown
            if (expenses.length > 0) {
                doc.setFont(undefined, 'bold');
                doc.setFontSize(12);
                doc.text('Category Breakdown', 14, yPos);
                yPos += 8;
                
                const grouped = DataManager.getExpensesGroupedByCategory(expenses);
                const categories = Object.keys(grouped).sort();
                
                doc.setFont(undefined, 'normal');
                doc.setFontSize(10);
                
                categories.forEach(category => {
                    const categoryExpenses = grouped[category];
                    const categoryTotal = DataManager.calculateTotalSpent(categoryExpenses);
                    
                    if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    doc.setFont(undefined, 'bold');
                    doc.text(category, 20, yPos);
                    doc.setFont(undefined, 'normal');
                    doc.text('Rs. ' + this.formatCurrency(categoryTotal), 180, yPos);
                    yPos += 6;
                });
                
                yPos += 8;
                
                // Daily Breakdown Section
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.text('Daily Expense Breakdown', 14, yPos);
                yPos += 8;
                
                // Table Header
                doc.setFontSize(9);
                doc.setFont(undefined, 'bold');
                doc.text('Date', 14, yPos);
                doc.text('Time', 35, yPos);
                doc.text('Category', 55, yPos);
                doc.text('Amount', 115, yPos);
                doc.text('Status', 150, yPos);
                doc.text('Comments', 170, yPos);
                yPos += 5;
                
                // Draw line
                doc.line(14, yPos - 2, 196, yPos - 2);
                yPos += 4;
                
                // Sort expenses by date and time
                const sortedExpenses = [...expenses].sort((a, b) => {
                    const dateA = new Date(a.date + ' ' + (a.time || '00:00'));
                    const dateB = new Date(b.date + ' ' + (b.time || '00:00'));
                    return dateA - dateB;
                });
                
                doc.setFont(undefined, 'normal');
                doc.setFontSize(8);
                
                sortedExpenses.forEach(expense => {
                    if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                        // Redraw header
                        doc.setFont(undefined, 'bold');
                        doc.setFontSize(9);
                        doc.text('Date', 14, yPos);
                        doc.text('Time', 35, yPos);
                        doc.text('Category', 55, yPos);
                        doc.text('Amount', 115, yPos);
                        doc.text('Status', 150, yPos);
                        doc.text('Comments', 170, yPos);
                        yPos += 5;
                        doc.line(14, yPos - 2, 196, yPos - 2);
                        yPos += 4;
                        doc.setFont(undefined, 'normal');
                        doc.setFontSize(8);
                    }
                    
                    const date = new Date(expense.date);
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    const dateStr = day + '/' + month + '/' + year;
                    
                    // Get time - use stored time or generate from createdAt
                    let timeStr = expense.time || '';
                    if (!timeStr || timeStr === 'N/A') {
                        if (expense.createdAt) {
                            const createdDate = new Date(expense.createdAt);
                            timeStr = createdDate.toLocaleTimeString('en-US', { 
                                hour12: true, 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            });
                        } else {
                            // Fallback: use current time or default
                            const now = new Date();
                            timeStr = now.toLocaleTimeString('en-US', { 
                                hour12: true, 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            });
                        }
                    }
                    
                    const category = expense.category.length > 12 ? expense.category.substring(0, 9) + '...' : expense.category;
                    const amount = 'Rs. ' + this.formatCurrency(expense.amount);
                    const status = expense.status === 'paid' ? 'Paid' : 'Pending';
                    const comments = expense.comments || '-';
                    const commentsDisplay = comments.length > 15 ? comments.substring(0, 12) + '...' : comments;
                    
                    doc.text(dateStr, 14, yPos);
                    doc.text(timeStr, 35, yPos);
                    doc.text(category, 55, yPos);
                    doc.text(amount, 115, yPos);
                    doc.text(status, 150, yPos);
                    doc.text(commentsDisplay, 170, yPos);
                    yPos += 6;
                });
            } else {
                doc.setFont(undefined, 'normal');
                doc.setFontSize(11);
                doc.text('No expenses recorded for this month.', 14, yPos);
            }
            
            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(128, 128, 128);
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    105,
                    285,
                    { align: 'center' }
                );
                doc.text(
                    `Generated on ${new Date().toLocaleDateString()}`,
                    105,
                    290,
                    { align: 'center' }
                );
            }
            
            // Generate blob
            const pdfBlob = doc.output('blob');
            this.currentPdfBlob = pdfBlob;
            return pdfBlob;
        } catch (error) {
            console.error('Error generating PDF:', error);
            if (typeof App !== 'undefined' && App.showNotification) {
                App.showNotification('Error generating PDF. Please try again.', 'error');
            } else {
                alert('Error generating PDF. Please try again.');
            }
            return null;
        }
    },
    
    // Export monthly expenses to PDF (downloads directly)
    exportToPDF(month, year) {
        const pdfBlob = this.generatePDFBlob(month, year);
        
        if (pdfBlob) {
            // Generate filename
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            const monthName = monthNames[month];
            const filename = `AGZ_Expenses_${monthName}_${year}.pdf`;
            
            // Create download link
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }
    },
    
    // Export current month
    exportCurrentMonth() {
        const now = new Date();
        return this.exportToPDF(now.getMonth(), now.getFullYear());
    }
};
