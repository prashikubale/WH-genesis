let gameState = {
    score: 0,
    portfolioValue: 10000,
    stocks: [
      { symbol: 'TECH', price: 100, volatility: 0.1 },
      { symbol: 'FNCE', price: 75, volatility: 0.08 },
      { symbol: 'RETL', price: 50, volatility: 0.05 },
      { symbol: 'ENGY', price: 120, volatility: 0.12 }
    ],
    portfolio: {},
    timeLeft: 1200, // 20 minutes in seconds
    marketHistory: []
  };
  
  let marketChart;
  
  document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    startTimer();
    setupEventListeners();
    updateDisplay();
  });
  
  function initializeGame() {
    const ctx = document.getElementById('marketChart').getContext('2d');
    marketChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: gameState.stocks.map(stock => ({
          label: stock.symbol,
          data: [],
          borderColor: getRandomColor(),
          tension: 0.4
        }))
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: '#e5e7eb' }
          },
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: '#e5e7eb' }
          }
        },
        plugins: {
          legend: {
            labels: { color: '#e5e7eb' }
          }
        }
      }
    });
  
    const stockSelect = document.getElementById('stockSelect');
    gameState.stocks.forEach(stock => {
      const option = document.createElement('option');
      option.value = stock.symbol;
      option.textContent = `${stock.symbol} - $${stock.price}`;
      stockSelect.appendChild(option);
    });
  
    setInterval(updateMarket, 2000);
  }
  
  function setupEventListeners() {
    document.getElementById('buyBtn').addEventListener('click', buyStock);
    document.getElementById('sellBtn').addEventListener('click', sellStock);
  }
  
  function updateMarket() {
    gameState.stocks.forEach((stock, index) => {
      const change = (Math.random() - 0.5) * 2 * stock.volatility * stock.price;
      stock.price = Math.max(1, stock.price + change);
      
      if (marketChart.data.labels.length > 20) {
        marketChart.data.labels.shift();
        marketChart.data.datasets[index].data.shift();
      }
      
      const time = new Date().toLocaleTimeString();
      if (marketChart.data.labels.length === 0) {
        marketChart.data.labels.push(time);
      } else if (time !== marketChart.data.labels[marketChart.data.labels.length - 1]) {
        marketChart.data.labels.push(time);
      }
      
      marketChart.data.datasets[index].data.push(stock.price);
    });
    
    marketChart.update();
    updateStocksList();
    calculatePortfolioValue();
  }
  
  function buyStock() {
    const symbol = document.getElementById('stockSelect').value;
    const shares = parseInt(document.getElementById('shareAmount').value);
    const stock = gameState.stocks.find(s => s.symbol === symbol);
    
    if (!stock || !shares || shares <= 0) return;
    
    const cost = stock.price * shares;
    if (cost > gameState.portfolioValue) {
      alert('Insufficient funds!');
      return;
    }
    
    gameState.portfolioValue -= cost;
    gameState.portfolio[symbol] = (gameState.portfolio[symbol] || 0) + shares;
    
    updateDisplay();
    calculateScore();
  }
  
  function sellStock() {
    const symbol = document.getElementById('stockSelect').value;
    const shares = parseInt(document.getElementById('shareAmount').value);
    const stock = gameState.stocks.find(s => s.symbol === symbol);
    
    if (!stock || !shares || shares <= 0) return;
    if (!gameState.portfolio[symbol] || gameState.portfolio[symbol] < shares) {
      alert('Not enough shares to sell!');
      return;
    }
    
    const revenue = stock.price * shares;
    gameState.portfolioValue += revenue;
    gameState.portfolio[symbol] -= shares;
    
    if (gameState.portfolio[symbol] === 0) {
      delete gameState.portfolio[symbol];
    }
    
    updateDisplay();
    calculateScore();
  }
  
  function updateStocksList() {
    const stocksList = document.getElementById('stocksList');
    stocksList.innerHTML = gameState.stocks.map(stock => `
      <div class="stock-item">
        <span>${stock.symbol}</span>
        <span>$${stock.price.toFixed(2)}</span>
      </div>
    `).join('');
  }
  
  function calculatePortfolioValue() {
    let totalValue = gameState.portfolioValue;
    for (const [symbol, shares] of Object.entries(gameState.portfolio)) {
      const stock = gameState.stocks.find(s => s.symbol === symbol);
      totalValue += stock.price * shares;
    }
    document.getElementById('portfolioValue').textContent = totalValue.toFixed(2);
  }
  
  function calculateScore() {
    const initialValue = 10000;
    const currentValue = parseFloat(document.getElementById('portfolioValue').textContent);
    const percentageGain = ((currentValue - initialValue) / initialValue) * 100;
    gameState.score = Math.max(0, Math.floor(percentageGain * 10));
    document.getElementById('score').textContent = gameState.score;
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
    const user = firebase.auth().currentUser;
    if (user) {
      firebase.firestore().collection('scores').add({
        userId: user.uid,
        points: gameState.score,
        game: 'investment',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  
    alert(`Game Over! Final Score: ${gameState.score}`);
    window.location.href = '../game.html';
  }
  
  function getRandomColor() {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  function updateDisplay() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('portfolioValue').textContent = gameState.portfolioValue.toFixed(2);
    
    const portfolioList = document.getElementById('portfolioList');
    portfolioList.innerHTML = Object.entries(gameState.portfolio).map(([symbol, shares]) => `
      <div class="portfolio-item">
        <span>${symbol}</span>
        <span>${shares} shares</span>
      </div>
    `).join('');
  }