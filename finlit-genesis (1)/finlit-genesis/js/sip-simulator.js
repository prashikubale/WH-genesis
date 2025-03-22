document.addEventListener('DOMContentLoaded', function() {
    // Initialize elements
    const monthlyAmount = document.getElementById('monthlyAmount');
    const duration = document.getElementById('duration');
    const expectedReturn = document.getElementById('expectedReturn');
    const calculateBtn = document.getElementById('calculateBtn');
    let sipChart;

    // Update display values for range inputs
    function updateDisplayValues() {
        document.getElementById('monthlyAmountValue').textContent = `₹${numberWithCommas(monthlyAmount.value)}`;
        document.getElementById('durationValue').textContent = `${duration.value} years`;
        document.getElementById('expectedReturnValue').textContent = `${expectedReturn.value}%`;
    }

    // Format numbers with commas
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Calculate SIP returns
    function calculateSIP() {
        const P = parseFloat(monthlyAmount.value);
        const t = parseFloat(duration.value);
        const r = parseFloat(expectedReturn.value) / 100 / 12;
        const n = t * 12;

        const totalInvestment = P * n;
        const futureValue = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        const estimatedReturns = futureValue - totalInvestment;

        updateResults(totalInvestment, estimatedReturns, futureValue);
        updateChart(totalInvestment, estimatedReturns);
        checkChallenges(totalInvestment, futureValue);
    }

    // Update result displays
    function updateResults(investment, returns, total) {
        document.getElementById('totalInvestment').textContent = `₹${numberWithCommas(Math.round(investment))}`;
        document.getElementById('estimatedReturns').textContent = `₹${numberWithCommas(Math.round(returns))}`;
        document.getElementById('totalValue').textContent = `₹${numberWithCommas(Math.round(total))}`;
    }

    // Update chart visualization
    function updateChart(investment, returns) {
        if (sipChart) {
            sipChart.destroy();
        }

        const ctx = document.getElementById('sipChart').getContext('2d');
        sipChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Total Investment', 'Estimated Returns'],
                datasets: [{
                    data: [investment, returns],
                    backgroundColor: ['#3b82f6', '#10b981'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    }

    // Define challenges
    const challenges = [
        {
            id: 'longTerm',
            title: 'Long-term Investor',
            description: 'Set investment duration to 20+ years',
            points: 50,
            check: () => duration.value >= 20
        },
        {
            id: 'highSaver',
            title: 'High Saver',
            description: 'Set monthly investment to ₹20,000+',
            points: 75,
            check: () => monthlyAmount.value >= 20000
        },
        {
            id: 'millionaire',
            title: 'Future Millionaire',
            description: 'Achieve total value of ₹1 Crore+',
            points: 100,
            check: (investment, total) => total >= 10000000
        }
    ];

    // Check challenges completion
    function checkChallenges(investment, totalValue) {
        let totalPoints = 0;
        const challengeCards = document.getElementById('challengeCards');
        challengeCards.innerHTML = '';

        challenges.forEach(challenge => {
            const completed = challenge.check(investment, totalValue);
            if (completed) {
                totalPoints += challenge.points;
            }

            const card = createChallengeCard(challenge, completed);
            challengeCards.appendChild(card);
        });

        updateScore(totalPoints);
    }

    // Create challenge card element
    function createChallengeCard(challenge, completed) {
        const card = document.createElement('div');
        card.className = `challenge-card ${completed ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="challenge-icon">
                <i class="fas ${completed ? 'fa-check-circle' : 'fa-circle'}"></i>
            </div>
            <div class="challenge-info">
                <h3>${challenge.title}</h3>
                <p>${challenge.description}</p>
            </div>
            <div class="challenge-points">+${challenge.points}</div>
        `;
        return card;
    }

    // Update score and save to Firebase
    function updateScore(points) {
        document.getElementById('score').textContent = points;
        saveScore(points);
    }

    // Save score to Firebase
    function saveScore(points) {
        const user = firebase.auth().currentUser;
        if (user) {
            firebase.firestore().collection('scores').add({
                userId: user.uid,
                game: 'sip',
                points: points,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }

    // Event listeners
    monthlyAmount.addEventListener('input', updateDisplayValues);
    duration.addEventListener('input', updateDisplayValues);
    expectedReturn.addEventListener('input', updateDisplayValues);
    calculateBtn.addEventListener('click', calculateSIP);

    // Initialize
    updateDisplayValues();
    calculateSIP();
});