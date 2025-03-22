class DebtGame {
    constructor() {
        this.debts = [
            { name: 'Credit Card', balance: 5000, interest: 0.18, minimumPayment: 150, initialBalance: 5000 },
            { name: 'Car Loan', balance: 15000, interest: 0.06, minimumPayment: 300, initialBalance: 15000 },
            { name: 'Student Loan', balance: 25000, interest: 0.045, minimumPayment: 250, initialBalance: 25000 }
        ];
        this.monthlyIncome = 4000;
        this.currentMonth = 1;
        this.score = 0;
        this.selectedStrategy = null;
        this.initializeEventListeners();
        this.updateDisplay();
    }

    initializeEventListeners() {
        document.getElementById('avalanche').addEventListener('click', () => {
            this.selectedStrategy = 'avalanche';
            this.showFeedback('Avalanche strategy selected: Focusing on highest interest debt', 'success');
        });

        document.getElementById('snowball').addEventListener('click', () => {
            this.selectedStrategy = 'snowball';
            this.showFeedback('Snowball strategy selected: Focusing on smallest debt', 'success');
        });

        document.getElementById('makePayments').addEventListener('click', () => this.makeMonthlyPayments());
        document.getElementById('extraPayment').addEventListener('click', () => this.makeExtraPayment());
    }

    updateDisplay() {
        const debtList = document.getElementById('debtList');
        debtList.innerHTML = '';
        
        this.debts.forEach(debt => {
            if (debt.balance > 0) {
                const debtEl = document.createElement('div');
                debtEl.className = 'debt-item';
                debtEl.innerHTML = `
                    <div class="debt-details">
                        <h3>${debt.name}</h3>
                        <p>Balance: $${debt.balance.toFixed(2)}</p>
                        <p>Interest: ${(debt.interest * 100).toFixed(1)}%</p>
                        <p>Minimum: $${debt.minimumPayment}</p>
                    </div>
                    <div class="debt-progress">
                        <div class="progress-bar" style="width: ${(debt.balance / debt.initialBalance) * 100}%"></div>
                    </div>
                `;
                debtList.appendChild(debtEl);
            }
        });

        document.getElementById('month').textContent = this.currentMonth;
        document.getElementById('score').textContent = this.score;
        document.getElementById('available').textContent = 
            (this.monthlyIncome - this.debts.reduce((sum, debt) => sum + debt.minimumPayment, 0)).toFixed(2);
    }

    makeMonthlyPayments() {
        if (!this.selectedStrategy) {
            this.showFeedback('Please select a payment strategy first!', 'error');
            return;
        }

        // Apply monthly interest
        this.debts.forEach(debt => {
            debt.balance += debt.balance * (debt.interest / 12);
        });

        // Make minimum payments
        let availableMoney = this.monthlyIncome;
        this.debts.forEach(debt => {
            if (debt.balance > 0) {
                const payment = Math.min(debt.minimumPayment, debt.balance);
                debt.balance -= payment;
                availableMoney -= payment;
            }
        });

        // Apply strategy for extra money
        const activeDebts = this.debts.filter(d => d.balance > 0);
        if (this.selectedStrategy === 'avalanche') {
            activeDebts.sort((a, b) => b.interest - a.interest);
        } else {
            activeDebts.sort((a, b) => a.balance - b.balance);
        }

        activeDebts.forEach(debt => {
            if (availableMoney > 0) {
                const extraPayment = Math.min(availableMoney, debt.balance);
                debt.balance -= extraPayment;
                availableMoney -= extraPayment;
                this.score += Math.floor(extraPayment * 0.1);
            }
        });

        this.currentMonth++;
        this.updateDisplay();
        this.checkGameProgress();
    }

    makeExtraPayment() {
        const extraAmount = Math.min(1000, this.monthlyIncome * 0.25);
        
        if (!this.selectedStrategy) {
            this.showFeedback('Please select a payment strategy first!', 'error');
            return;
        }

        const activeDebts = this.debts.filter(d => d.balance > 0);
        if (activeDebts.length === 0) return;

        let targetDebt;
        if (this.selectedStrategy === 'avalanche') {
            targetDebt = activeDebts.reduce((a, b) => a.interest > b.interest ? a : b);
        } else {
            targetDebt = activeDebts.reduce((a, b) => a.balance < b.balance ? a : b);
        }

        targetDebt.balance -= extraAmount;
        this.score += Math.floor(extraAmount * 0.2);
        this.showFeedback(`Made extra payment of $${extraAmount} to ${targetDebt.name}`, 'success');
        
        this.updateDisplay();
        this.checkGameProgress();
    }

    checkGameProgress() {
        const totalDebt = this.debts.reduce((sum, debt) => sum + debt.balance, 0);
        if (totalDebt <= 0) {
            this.showFeedback('Congratulations! You\'ve paid off all debts!', 'success');
            this.saveProgress();
        }
    }

    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `feedback ${type}`;
    }

    saveProgress() {
        const user = firebase.auth().currentUser;
        if (user) {
            firebase.firestore().collection('users').doc(user.uid).update({
                'points': firebase.firestore.FieldValue.increment(this.score),
                'gamesCompleted': firebase.firestore.FieldValue.increment(1)
            });

            firebase.firestore().collection('users').doc(user.uid)
                .collection('activities').add({
                    description: `Completed Debt Destroyer with score ${this.score}`,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DebtGame();
});