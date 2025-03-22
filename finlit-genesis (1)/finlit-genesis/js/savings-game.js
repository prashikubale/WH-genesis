class SavingsGame {
    constructor() {
        this.savings = 0;
        this.score = 0;
        this.currentWeek = 1;
        this.goals = {
            emergency: { target: 1000, current: 0 },
            vacation: { target: 2000, current: 0 },
            education: { target: 5000, current: 0 }
        };
        this.transactions = [];
        this.currentChallenge = null;
        this.challenges = [
            {
                title: "Coffee Budget Challenge",
                description: "Skip your daily coffee purchase and save the money instead.",
                potentialSavings: 25,
                bonusPoints: 100,
                duration: 7
            },
            {
                title: "Lunch Prep Challenge",
                description: "Pack your lunch instead of eating out this week.",
                potentialSavings: 50,
                bonusPoints: 150,
                duration: 7
            },
            {
                title: "No-Spend Weekend",
                description: "Avoid discretionary spending this weekend.",
                potentialSavings: 100,
                bonusPoints: 200,
                duration: 2
            }
        ];
        this.tips = [
            "Set up automatic transfers to your savings account",
            "Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings",
            "Track every expense to identify spending patterns",
            "Build an emergency fund covering 3-6 months of expenses",
            "Look for free entertainment options in your area"
        ];
        this.initializeGame();
    }

    initializeGame() {
        this.setupEventListeners();
        this.updateDisplay();
        this.setNewChallenge();
        this.startTipsCarousel();
        this.checkAchievements();
    }

    setupEventListeners() {
        document.getElementById('acceptChallenge').addEventListener('click', () => this.acceptChallenge());
        document.getElementById('addTransaction').addEventListener('click', () => this.addTransaction());
    }

    updateDisplay() {
        document.getElementById('savingsAmount').textContent = this.savings.toFixed(2);
        document.getElementById('score').textContent = this.score;
        document.getElementById('currentWeek').textContent = this.currentWeek;

        // Update progress bars
        Object.entries(this.goals).forEach(([goal, data]) => {
            const progress = (data.current / data.target) * 100;
            document.getElementById(`${goal}Progress`).style.width = `${Math.min(100, progress)}%`;
        });

        this.updateTransactionsList();
    }

    addTransaction() {
        const type = document.getElementById('transactionType').value;
        const description = document.getElementById('transactionDescription').value;
        const amount = parseFloat(document.getElementById('transactionAmount').value);

        if (!description || isNaN(amount) || amount <= 0) {
            this.showNotification('Please enter valid transaction details', 'error');
            return;
        }

        const transaction = {
            type,
            description,
            amount,
            date: new Date()
        };

        this.transactions.push(transaction);

        if (type === 'income') {
            this.savings += amount;
            this.distributeToGoals(amount * 0.2); // Automatically save 20% of income
        } else {
            this.savings -= amount;
        }

        this.updateDisplay();
        this.showNotification('Transaction added successfully', 'success');
        this.checkAchievements();
    }

    distributeToGoals(amount) {
        const goals = Object.entries(this.goals);
        const totalRemaining = goals.reduce((sum, [_, data]) => 
            sum + (data.target - data.current), 0);

        goals.forEach(([goal, data]) => {
            const remaining = data.target - data.current;
            const share = (remaining / totalRemaining) * amount;
            data.current += share;
        });
    }

    setNewChallenge() {
        this.currentChallenge = this.challenges[Math.floor(Math.random() * this.challenges.length)];
        document.getElementById('challengeTitle').textContent = this.currentChallenge.title;
        document.getElementById('challengeDescription').textContent = this.currentChallenge.description;
        document.getElementById('potentialSavings').textContent = this.currentChallenge.potentialSavings;
        document.getElementById('bonusPoints').textContent = this.currentChallenge.bonusPoints;
    }

    acceptChallenge() {
        if (!this.currentChallenge) return;

        this.savings += this.currentChallenge.potentialSavings;
        this.score += this.currentChallenge.bonusPoints;
        this.distributeToGoals(this.currentChallenge.potentialSavings * 0.2);

        this.showNotification(`Challenge completed! Earned ${this.currentChallenge.bonusPoints} points`, 'success');
        this.currentWeek++;
        
        if (this.currentWeek > 52) {
            this.gameComplete();
        } else {
            this.setNewChallenge();
            this.updateDisplay();
            this.checkAchievements();
        }
    }

    updateTransactionsList() {
        const list = document.getElementById('transactionsList');
        list.innerHTML = '';

        this.transactions.slice(-5).reverse().forEach(transaction => {
            const item = document.createElement('div');
            item.className = `transaction-item ${transaction.type}`;
            item.innerHTML = `
                <span class="transaction-description">${transaction.description}</span>
                <span class="transaction-amount">
                    ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                </span>
            `;
            list.appendChild(item);
        });
    }

    startTipsCarousel() {
        let currentTip = 0;
        const carousel = document.getElementById('tipsCarousel');

        const showTip = () => {
            carousel.innerHTML = `<div class="tip">${this.tips[currentTip]}</div>`;
            currentTip = (currentTip + 1) % this.tips.length;
        };

        showTip();
        setInterval(showTip, 5000);
    }

    checkAchievements() {
        const achievements = {
            'Savings Starter': this.savings >= 100,
            'Goal Setter': Object.values(this.goals).some(goal => goal.current >= goal.target * 0.5),
            'Challenge Champion': this.score >= 1000
        };

        const achievementsGrid = document.querySelector('.achievements-grid');
        achievementsGrid.innerHTML = '';

        Object.entries(achievements).forEach(([name, achieved]) => {
            const achievement = document.createElement('div');
            achievement.className = `achievement ${achieved ? 'achieved' : ''}`;
            achievement.innerHTML = `
                <i class="fas fa-trophy"></i>
                <span>${name}</span>
            `;
            achievementsGrid.appendChild(achievement);
        });
    }

    showNotification(message, type) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        setTimeout(() => notification.className = 'notification', 3000);
    }

    gameComplete() {
        this.showNotification('Congratulations! You\'ve completed the 52-week challenge!', 'success');
        this.saveProgress();
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
                    description: `Completed Savings Challenge with $${this.savings.toFixed(2)} saved`,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SavingsGame();
});