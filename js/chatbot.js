// js/chatbot.js

document.addEventListener('DOMContentLoaded', function () {

    // --- הגדרות API ---
    const API_URL = 'https://n8n.idone.co.il/webhook/chat'; // <-- שים כאן את הכתובת שלך

    // --- 0. הזרקת ה-HTML של הבוט לדף ---
    function injectChatWidget() {
        const chatHTML = `
      <div id="idone-chat-widget">
        <button id="chat-toggle-btn" aria-label="פתח צ'אט">
          <img src="assets/images/logos/robot-only.svg" alt="iDone Bot">
        </button>

        <div id="chat-window" class="hidden">
          <div class="chat-header">
            <div class="chat-header-info">
              <img src="assets/images/logos/robot-only.svg" alt="Bot Avatar">
              <div>
                <h3>iDone Assistant</h3>
                <span>זמין כעת</span>
              </div>
            </div>
            <button id="chat-close-btn">&times;</button>
          </div>
          
          <div id="chat-messages">
            </div>

          <div class="chat-input-area">
            <input type="text" id="chat-input" placeholder="כתוב הודעה..." autocomplete="off">
            <button id="chat-send-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      </div>
    `;

        // הוספת ה-HTML לגוף הדף (Body)
        const divContainer = document.createElement('div');
        divContainer.innerHTML = chatHTML;
        document.body.appendChild(divContainer.firstElementChild);
    }

    // הפעלת ההזרקה לפני שמחפשים אלמנטים
    injectChatWidget();


    // --- כעת האלמנטים קיימים בדף, אפשר לבחור אותם ---
    const chatWidget = document.getElementById('idone-chat-widget');
    const chatWindow = document.getElementById('chat-window');
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const closeBtn = document.getElementById('chat-close-btn');
    const sendBtn = document.getElementById('chat-send-btn');
    const inputField = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');


    // --- 1. ניהול מזהה משתמש והיסטוריה ---
    function getUserId() {
        let userId = localStorage.getItem('idone_chat_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('idone_chat_user_id', userId);
        }
        return userId;
    }

    function saveMessageToHistory(text, sender) {
        let history = JSON.parse(localStorage.getItem('idone_chat_history') || '[]');
        history.push({ text: text, sender: sender, timestamp: Date.now() });
        if (history.length > 20) history = history.slice(history.length - 20);
        localStorage.setItem('idone_chat_history', JSON.stringify(history));
    }

    function loadChatHistory() {
        let history = JSON.parse(localStorage.getItem('idone_chat_history') || '[]');

        // אם אין היסטוריה, הצג הודעת פתיחה
        if (history.length === 0) {
            appendMessage('היי! אני הבוט של iDone. איך אני יכול לעזור לך לייעל את העסק היום? 🤖', 'bot', false);
        } else {
            // אם יש היסטוריה, טען את 5 האחרונות
            const messagesToShow = history.slice(-5);
            messagesToShow.forEach(msg => {
                appendMessage(msg.text, msg.sender, false);
            });
        }
    }

    const currentUserId = getUserId();

    // --- 2. פונקציות ממשק (UI) ---
    function toggleChat() {
        chatWindow.classList.toggle('hidden');
        if (!chatWindow.classList.contains('hidden')) {
            setTimeout(() => inputField.focus(), 100);
        }
    }

    function appendMessage(text, sender, saveToStorage = true) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message');
        msgDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');

        if (sender === 'bot') {
            if (typeof marked !== 'undefined') {
                msgDiv.innerHTML = marked.parse(text);
            } else {
                msgDiv.textContent = text;
            }
        } else {
            msgDiv.textContent = text;
        }

        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        if (saveToStorage) {
            saveMessageToHistory(text, sender);
        }
    }

    function addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.classList.add('typing-indicator');
        indicator.innerHTML = '<span>.</span><span>.</span><span>.</span> iDone מקליד';
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    // --- 3. לוגיקת שליחה ---
    async function sendMessage() {
        const text = inputField.value.trim();
        if (!text) return;

        appendMessage(text, 'user', true);
        inputField.value = '';

        addTypingIndicator();

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    user_id: currentUserId
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            removeTypingIndicator();

            const botReply = data.response || data.output || "קיבלתי תשובה ריקה";
            appendMessage(botReply, 'bot', true);

        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator();
            appendMessage('שגיאת תקשורת, נסה שוב.', 'bot', false);
        }
    }

    // --- 4. אירועים והפעלות ---

    // טעינת היסטוריה (או הודעת פתיחה אם ריק)
    loadChatHistory();

    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);
    sendBtn.addEventListener('click', sendMessage);

    inputField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });
});