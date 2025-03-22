class QuizGame {
    constructor() {
        this.questions = [
            {
                question: "What is a budget?",
                options: [
                    "A plan for managing money",
                    "A type of bank account",
                    "A credit card limit",
                    "A loan application"
                ],
                correct: 0,
                explanation: "A budget is a financial plan that helps you track income and expenses to manage your money effectively."
            },
            {
                question: "What is compound interest?",
                options: [
                    "Interest only on the principal amount",
                    "Interest on both principal and accumulated interest",
                    "A fixed interest rate",
                    "A type of loan"
                ],
                correct: 1,
                explanation: "Compound interest is when you earn interest on both your initial investment and previously earned interest."
            },
            {
                question: "What is an emergency fund?",
                options: [
                    "A retirement account",
                    "Money saved for unexpected expenses",
                    "A type of investment",
                    "A credit card reserve"
                ],
                correct: 1,
                explanation: "An emergency fund is money set aside for unexpected expenses or financial emergencies."
            },
            {
                question: "What is a credit score?",
                options: [
                    "Your bank account balance",
                    "A measure of creditworthiness",
                    "Monthly income",
                    "Savings amount"
                ],
                correct: 1,
                explanation: "A credit score is a number that represents your creditworthiness based on your credit history."
            },
            {
                question: "Which is a good saving habit?",
                options: [
                    "Spending all monthly income",
                    "Saving only when extra money is available",
                    "Paying yourself first",
                    "Taking frequent loans"
                ],
                correct: 2,
                explanation: "'Pay yourself first' means saving a portion of your income before spending on other things."
            }
        ];

        this.currentQuestion = 0;
        this.score = 0;
        this.lives = 3;
        this.isAnswered = false;

        this.initializeGame();
    }

    initializeGame() {
        this.updateUI();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('optionsContainer').addEventListener('click', (e) => {
            if (e.target.classList.contains('option-btn') && !this.isAnswered) {
                this.checkAnswer(parseInt(e.target.dataset.index));
            }
        });
    }

    updateUI() {
        const question = this.questions[this.currentQuestion];
        document.getElementById('questionText').textContent = question.question;
        
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = question.options.map((option, index) => `
            <button class="option-btn" data-index="${index}">${option}</button>
        `).join('');

        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        
        const progress = ((this.currentQuestion) / this.questions.length) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
        
        document.getElementById('nextBtn').disabled = !this.isAnswered;
        document.getElementById('feedbackContainer').classList.remove('show');
    }

    checkAnswer(selectedIndex) {
        const question = this.questions[this.currentQuestion];
        const options = document.querySelectorAll('.option-btn');
        const feedbackContainer = document.getElementById('feedbackContainer');
        
        this.isAnswered = true;
        
        if (selectedIndex === question.correct) {
            options[selectedIndex].classList.add('correct');
            this.score += 100;
            document.getElementById('feedbackText').textContent = "Correct! +100 points";
        } else {
            options[selectedIndex].classList.add('wrong');
            options[question.correct].classList.add('correct');
            this.lives--;
            document.getElementById('feedbackText').textContent = "Incorrect!";
        }

        document.getElementById('explanationText').textContent = question.explanation;
        feedbackContainer.classList.add('show');
        document.getElementById('nextBtn').disabled = false;

        if (this.lives <= 0) {
            this.endGame();
        }
    }

    nextQuestion() {
        this.currentQuestion++;
        this.isAnswered = false;

        if (this.currentQuestion >= this.questions.length) {
            this.endGame();
        } else {
            this.updateUI();
        }
    }

    endGame() {
        const resultsModal = document.getElementById('resultsModal');
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('correctAnswers').textContent = 
            Math.floor(this.score / 100);
        resultsModal.classList.add('show');
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
                    description: `Completed Financial Quiz with score ${this.score}`,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
        }
    }
}

function restartQuiz() {
    document.getElementById('resultsModal').classList.remove('show');
    new QuizGame();
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizGame();
});