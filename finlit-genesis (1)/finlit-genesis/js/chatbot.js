// Chatbot knowledge base
const knowledgeBase = {
    "hello": "Hello! How can I help you with financial literacy today?",
    "hi": "Hi there! How can I assist you with your financial learning journey?",
    "help": "I can help you with information about budgeting, investing, debt management, and more. What would you like to learn about?",
    
    // Budgeting
    "budget": "Budgeting is the process of creating a plan for how you will spend your money. It helps you prioritize your spending and ensure you have enough for necessities. Would you like to learn more about budgeting methods?",
    "how to budget": "To create a budget: 1) Track your income, 2) List all expenses, 3) Categorize spending, 4) Set realistic goals, 5) Adjust as needed. Try our Budget Master game to practice!",
    "50/30/20": "The 50/30/20 rule suggests spending 50% of income on needs, 30% on wants, and 20% on savings and debt repayment. It's a simple way to budget without tracking every expense.",
    
    // Investing
    "investing": "Investing is putting money into assets with the expectation of generating income or profit. Common investments include stocks, bonds, mutual funds, and real estate. Would you like to learn about specific investment types?",
    "stocks": "Stocks represent ownership in a company. When you buy a stock, you own a small piece of that company and may receive dividends or sell at a higher price later. Try our Stock Trader game to practice!",
    "bonds": "Bonds are loans you make to a company or government. They typically pay fixed interest over time and return the principal at maturity. They're generally less risky than stocks.",
    "mutual funds": "Mutual funds pool money from many investors to buy a diversified portfolio of stocks, bonds, or other securities. They're managed by professionals and good for beginners.",
    "etf": "ETFs (Exchange-Traded Funds) are similar to mutual funds but trade like stocks. They often have lower fees and are more tax-efficient than mutual funds.",
    
    // SIP
    "sip": "SIP (Systematic Investment Plan) allows you to invest a fixed amount regularly in mutual funds or other investments. It helps build wealth through disciplined investing and dollar-cost averaging. Try our SIP Simulator to see how small regular investments grow over time!",
    "systematic investment plan": "A Systematic Investment Plan (SIP) is a method of investing a fixed amount at regular intervals. It helps in building wealth through the power of compounding and reduces the impact of market volatility. Check out our SIP Simulator!",
    
    // Debt
    "debt": "Debt is money borrowed that must be repaid, usually with interest. Not all debt is bad - some can help build credit or invest in your future. The key is managing it responsibly. Try our Debt Destroyer game to learn more!",
    "credit score": "A credit score is a number (usually 300-850) that represents your creditworthiness. Higher scores mean better loan terms. It's affected by payment history, amounts owed, length of credit history, new credit, and credit mix.",
    "how to improve credit score": "To improve your credit score: 1) Pay bills on time, 2) Reduce debt, 3) Don't close old accounts, 4) Limit new credit applications, 5) Check your credit report for errors.",
    
    // Cryptocurrency
    "cryptocurrency": "Cryptocurrency is digital or virtual currency that uses cryptography for security. Bitcoin and Ethereum are popular examples. It's highly volatile and speculative. Try our Crypto Quest game to learn more!",
    "bitcoin": "Bitcoin is the first and most valuable cryptocurrency. It operates on a decentralized network called blockchain. It's highly volatile and should be approached with caution for investing.",
    "blockchain": "Blockchain is a distributed ledger technology that records transactions across many computers. It's secure, transparent, and the foundation of cryptocurrencies.",
    
    // Games
    "games": "We offer several financial literacy games: Budget Master, Stock Trader, Debt Destroyer, Crypto Quest, and SIP Simulator. Each game teaches different financial concepts in an interactive way. Which one interests you?",
    
    // General financial advice
    "emergency fund": "An emergency fund should cover 3-6 months of expenses. Keep it in a liquid account like a high-yield savings account for easy access during unexpected situations.",
    "retirement": "Start saving for retirement as early as possible to benefit from compound interest. Consider tax-advantaged accounts like 401(k)s or IRAs. Aim to save 15% of your income for retirement.",
    "compound interest": "Compound interest is interest earned on both the initial principal and accumulated interest. It makes your money grow exponentially over time. The earlier you start investing, the more powerful it becomes.",
    
    // Navigation help
    "how to play": "To play our games, go to the Games tab in the dashboard and select any game that interests you. Each game has instructions and interactive elements to help you learn financial concepts.",
    "dashboard": "The dashboard shows your progress, available games, quick stats, and recent activity. It's your central hub for tracking your financial literacy journey.",
    "leaderboard": "The leaderboard shows top-performing users. Earn points by completing games and challenges to climb the rankings!",
    
    // Fallback
    "default": "I'm still learning about that topic. For now, try exploring our games to learn more about financial literacy concepts!"
};

// Load chatbot components
document.addEventListener('DOMContentLoaded', function() {
    // Load chatbot HTML
    fetch('/components/chatbot.html')
        .then(response => response.text())
        .then(html => {
            document.body.insertAdjacentHTML('beforeend', html);
            initChatbot();
        })
        .catch(error => {
            console.error('Error loading chatbot:', error);
            // Fallback: Insert chatbot HTML directly if fetch fails
            const chatbotHTML = `
                <div id="chatbot-container" class="chatbot-container">
                    <div class="chatbot-header">
                        <h3><i class="fas fa-robot"></i> FinLit Assistant</h3>
                        <button id="close-chatbot" class="close-btn"><i class="fas fa-times"></i></button>
                    </div>
                    <div id="chatbot-messages" class="chatbot-messages">
                        <div class="bot-message">
                            <div class="message-avatar"><i class="fas fa-robot"></i></div>
                            <div class="message-content">
                                <p>Hello! I'm your FinLit Assistant. How can I help you with financial literacy today?</p>
                            </div>
                        </div>
                    </div>
                    <div class="chatbot-input">
                        <input type="text" id="user-input" placeholder="Ask a question...">
                        <button id="send-message"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
                <button id="open-chatbot" class="chatbot-toggle">
                    <i class="fas fa-comment-dots"></i>
                </button>
            `;
            document.body.insertAdjacentHTML('beforeend', chatbotHTML);
            initChatbot();
        });
});

function initChatbot() {
    const chatbotContainer = document.getElementById('chatbot-container');
    const openChatbotBtn = document.getElementById('open-chatbot');
    const closeChatbotBtn = document.getElementById('close-chatbot');
    const userInput = document.getElementById('user-input');
    const sendMessageBtn = document.getElementById('send-message');
    const chatbotMessages = document.getElementById('chatbot-messages');

    // Toggle chatbot visibility
    openChatbotBtn.addEventListener('click', () => {
        chatbotContainer.classList.add('active');
        userInput.focus();
    });

    closeChatbotBtn.addEventListener('click', () => {
        chatbotContainer.classList.remove('active');
    });

    // Send message function
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;

        // Add user message to chat
        addMessage(message, 'user');
        userInput.value = '';

        // Get bot response
        setTimeout(() => {
            const response = getBotResponse(message);
            addMessage(response, 'bot');
            
            // Auto-scroll to bottom
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }, 500);
    }

    // Add message to chat
    function addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `<p>${message}</p>`;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        chatbotMessages.appendChild(messageDiv);
        
        // Auto-scroll to bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Get bot response based on user input
    function getBotResponse(input) {
        // Convert input to lowercase for matching
        const lowerInput = input.toLowerCase();
        
        // Check for exact matches first
        if (knowledgeBase[lowerInput]) {
            return knowledgeBase[lowerInput];
        }
        
        // Check for partial matches
        for (const key in knowledgeBase) {
            if (lowerInput.includes(key)) {
                return knowledgeBase[key];
            }
        }
        
        // Check for keywords
        if (lowerInput.includes('money') || lowerInput.includes('finance')) {
            return "Financial literacy is the ability to understand and effectively use various financial skills. Would you like to learn about budgeting, investing, or debt management?";
        }
        
        if (lowerInput.includes('thank')) {
            return "You're welcome! Feel free to ask if you have more questions about financial literacy.";
        }
        
        // Default response
        return knowledgeBase["default"];
    }

    // Event listeners
    sendMessageBtn.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Log chatbot usage for analytics
    function logChatbotInteraction(message) {
        const user = firebase.auth().currentUser;
        if (user) {
            firebase.firestore().collection('users').doc(user.uid)
                .collection('chatbot_interactions').add({
                    message: message,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
        }
    }
}