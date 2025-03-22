let gameState = {
    score: 0,
    month: 1,
    balance: 1000,
    monthlyIncome: 2000,
    expenses: {
      rent: 0,
      food: 0,
      utilities: 0,
      savings: 0
    },
    timeLeft: 900 // 15 minutes in seconds
  };
  
  // Initialize game
  document.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
    startTimer();
    setupExpenseListeners();
  });
  
  function setupExpenseListeners() {
    ['rent', 'food', 'utilities', 'savings'].forEach(expense => {
      const slider = document.getElementById(`${expense}Expense`);
      slider.addEventListener('input', () => {
        gameState.expenses[expense] = parseInt(slider.value);
        document.getElementById(`${expense}Value`).textContent = slider.value;
        calculateBalance();
      });
    });
  
    document.getElementById('nextMonth').addEventListener('click', nextMonth);
  }
  
  function calculateBalance() {
    const totalExpenses = Object.values(gameState.expenses).reduce((a, b) => a + b, 0);
    const newBalance = gameState.balance + gameState.monthlyIncome - totalExpenses;
    document.getElementById('currentBalance').textContent = newBalance;
  }
  
  function nextMonth() {
    const totalExpenses = Object.values(gameState.expenses).reduce((a, b) => a + b, 0);
    
    // Calculate score based on savings and balanced budget
    if (gameState.expenses.savings >= gameState.monthlyIncome * 0.2) {
      gameState.score += 100; // Bonus for good savings
    }
    if (totalExpenses <= gameState.monthlyIncome) {
      gameState.score += 50; // Bonus for balanced budget
    }
  
    gameState.balance += gameState.monthlyIncome - totalExpenses;
    gameState.month++;
  
    if (gameState.month > 12) {
      endGame();
      return;
    }
  
    updateDisplay();
  }
  
  function updateDisplay() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('currentMonth').textContent = gameState.month;
    document.getElementById('currentBalance').textContent = gameState.balance;
    document.getElementById('monthlyIncome').textContent = gameState.monthlyIncome;
  }
  
  function startTimer() {
    const timerElement = document.getElementById('timer');
    
    const timer = setInterval(() => {
      gameState.timeLeft--;
      const minutes = Math.floor(gameState.timeLeft / 60);
      const seconds = gameState.timeLeft % 60;
      timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
      if (gameState.timeLeft <= 0) {
        clearInterval(timer);
        endGame();
      }
    }, 1000);
  }
  
  function endGame() {
    // Save score to Firebase
    const user = firebase.auth().currentUser;
    if (user) {
      firebase.firestore().collection('scores').add({
        userId: user.uid,
        points: gameState.score,
        game: 'budget',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  
    alert(`Game Over! Final Score: ${gameState.score}`);
    window.location.href = '../game.html';
  }