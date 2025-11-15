document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // הדבק כאן את ה-Production URL של ה-Webhook שיצרת ב-n8n
    const N8N_LOGIN_WEBHOOK_URL = 'https://n8n.idone.co.il/webhook/admin-login'; 

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none'; // הסתר הודעת שגיאה קודמת

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(N8N_LOGIN_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();

            if (response.ok && result.success === true) {
                // --- ההתחברות הצליחה! ---

                // 1. שמור "אישור כניסה" ב-Session Storage
                //    (זה נמחק אוטומטית כשהדפדפן נסגר)
                sessionStorage.setItem('adminAuthenticated', 'true');

                // 2. העבר את המשתמש לעמוד הניהול האמיתי
                //    (ניצור את העמוד הזה בשלב הבא)
                window.location.href = 'admin-dashboard.html';

            } else {
                // --- ההתחברות נכשלה ---
                errorMessage.style.display = 'block';
            }
        } catch (err) {
            console.error('Error during login:', err);
            errorMessage.textContent = 'אירעה שגיאה בתקשורת עם השרת.';
            errorMessage.style.display = 'block';
        }
    });
});