// Initialize Firebase Auth listener
firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        window.location.href = "auth.html";
    } else {
        document.getElementById('userName').textContent = user.displayName || 'Player';
        initializeDashboard(user);
    }
});

// Logout function
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "index.html";
    });
}

// Initialize dashboard components
function initializeDashboard(user) {
    updateUserScore(user);
    initializeProgressChart();
    loadRecentActivity(user);
    updateQuickStats(user);
}

// Update user score in real-time
function updateUserScore(user) {
    firebase.firestore()
        .collection('scores')
        .where('userId', '==', user.uid)
        .onSnapshot((snapshot) => {
            let totalPoints = 0;
            snapshot.forEach((doc) => {
                totalPoints += doc.data().points;
            });
            document.getElementById('userScore').textContent = totalPoints;
        });
}

// Initialize progress chart
function initializeProgressChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Learning Progress',
                data: [30, 45, 60, 85],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#e5e7eb'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#e5e7eb'
                    }
                }
            }
        }
    });
}

// Load recent activity
function loadRecentActivity(user) {
    const activityFeed = document.getElementById('activityFeed');
    activityFeed.innerHTML = '';

    firebase.firestore()
        .collection('scores')
        .where('userId', '==', user.uid)
        .orderBy('timestamp', 'desc')
        .limit(5)
        .onSnapshot((snapshot) => {
            snapshot.forEach((doc) => {
                const activity = doc.data();
                const div = document.createElement('div');
                div.className = 'activity-item';
                div.innerHTML = `
                    <i class="fas fa-circle"></i>
                    ${activity.description || `Earned ${activity.points} points in ${activity.game}`}
                `;
                activityFeed.appendChild(div);
            });
        });
}

// Update quick stats
function updateQuickStats(user) {
    firebase.firestore()
        .collection('scores')
        .where('userId', '==', user.uid)
        .get()
        .then((snapshot) => {
            const completedGames = new Set();
            let achievements = 0;

            snapshot.forEach((doc) => {
                const data = doc.data();
                completedGames.add(data.game);
                if (data.achievement) achievements++;
            });

            document.getElementById('completedGames').textContent = completedGames.size;
            document.getElementById('achievements').textContent = achievements;
            
            // Mock time played for now
            document.getElementById('timePlayed').textContent = '2h';
        });
}