document.addEventListener('DOMContentLoaded', () => {

    // --- 1. לוגיקת התנתקות (Logout) ---
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        sessionStorage.removeItem('adminAuthenticated');
        alert('התנתקת בהצלחה.');
        window.location.href = 'admin-login.html';
    });

    // --- 2. לוגיקת טופס "תודה על השיחה" (גרסה משודרגת) ---
    const postCallForm = document.getElementById('form-post-call');
    const postCallFeedback = document.getElementById('feedback-post-call');

    // !!! החלף את ה-URL הבא ב-Production URL שלך
    // (זה אותו URL שרצית להשתמש בו קודם)
    const N8N_POST_CALL_WEBHOOK_URL = 'https://n8n.idone.co.il/webhook/admin-post-call-email';

    postCallForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('post-call-name').value;
        const email = document.getElementById('post-call-email').value;

        const submitButton = postCallForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'קורא תבנית...';
        showFeedback(postCallFeedback, 'מעבד בקשה...', 'pending');

        try {
            // --- כאן הקסם החדש ---
            // 1. קרא את קובץ תבנית המייל באמצעות fetch
            const response = await fetch('assets/emails/client/post-call-assessment-email.html');
            if (!response.ok) throw new Error('לא הצלחתי לטעון את תבנית המייל');

            let emailHtmlTemplate = await response.text();

            // 2. בצע את ההחלפה של שם הלקוח בתוך ה-JS
            const finalHtmlBody = emailHtmlTemplate.replace(/{שם לקוח}/g, name);
            // ----------------------

            submitButton.textContent = 'שולח מייל...';

            // 3. שלח ל-n8n את המייל המוכן לשליחה
            const n8nResponse = await fetch(N8N_POST_CALL_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,       // <-- שם הלקוח
                    email: email,       // <-- כתובת הלקוח
                    htmlBody: finalHtmlBody // <-- גוף המייל המוכן
                }),
            });

            if (!n8nResponse.ok) throw new Error('תגובת שרת n8n לא תקינה');

            const result = await n8nResponse.json();

            if (result.success === true) {
                showFeedback(postCallFeedback, 'המייל נשלח בהצלחה!', 'success');
                postCallForm.reset();
            } else {
                throw new Error(result.message || 'שגיאה שהגיעה מ-n8n');
            }

        } catch (err) {
            console.error('Error sending post-call email:', err);
            showFeedback(postCallFeedback, `אירעה שגיאה: ${err.message}`, 'error');

        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'שלח מייל';
            setTimeout(() => {
                postCallFeedback.style.display = 'none';
            }, 5000);
        }
    });

    // --- 3. לוגיקת טופס "שליחת הסכם שירות" ---
    const agreementForm = document.getElementById('form-send-agreement');
    const agreementFeedback = document.getElementById('feedback-agreement');

    // !!! החלף את ה-URL הבא ב-Production URL של ה-Workflow החדש שתייצר ב-n8n
    const N8N_AGREEMENT_WEBHOOK_URL = 'https://n8n.idone.co.il/webhook/admin-send-agreement'; // <--- שנה אותי!

    agreementForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. איסוף כל הנתונים מהטופס
        const formData = {
            name: document.getElementById('agreement-name').value,
            email: document.getElementById('agreement-email').value,
            phone: document.getElementById('agreement-phone').value,
            company: document.getElementById('agreement-company').value,
            id: document.getElementById('agreement-id').value,
            industry: document.getElementById('agreement-industry').value,
            price: document.getElementById('agreement-price').value
        };

        const submitButton = agreementForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'טוען תבניות...';
        showFeedback(agreementFeedback, 'מעבד בקשה...', 'pending');

        try {
            // 2. בניית הקישור הדינמי להסכם
            // הקישור משתמש בפרמטרים שקובץ agreement.html יודע לקבל
            const agreementURL = `https://www.idone.co.il/agreement.html?name=${encodeURIComponent(formData.name)}&id=${encodeURIComponent(formData.id)}&price=${encodeURIComponent(formData.price)}`;

            // 3. טעינת שתי תבניות המייל במקביל
            const [clientTemplateResponse, employeeTemplateResponse] = await Promise.all([
                fetch('assets/emails/client/send-service-agreement-email.html'),
                fetch('assets/emails/employee/send-service-agreement-email.html')
            ]);

            if (!clientTemplateResponse.ok || !employeeTemplateResponse.ok) {
                throw new Error('לא הצלחתי לטעון את תבניות המייל');
            }

            let clientHtml = await clientTemplateResponse.text();
            let employeeHtml = await employeeTemplateResponse.text();

            // 4. החלפת משתנים במייל ללקוח
            // (שים לב להחלפה של {{4.shortURL}} בתבנית שלך)
            const finalClientHtml = clientHtml
                .replace(/{שם לקוח}/g, formData.name)
                .replace('{{4.shortURL}}', agreementURL);

            // 5. החלפת משתנים במייל הפנימי (לעובד)
            const finalEmployeeHtml = employeeHtml
                .replace(/{שם לקוח}/g, formData.name)
                .replace(/{אימייל לקוח}/g, formData.email)
                .replace(/{טלפון לקוח}/g, formData.phone)
                .replace(/{שם חברה}/g, formData.company)
                .replace(/{תחום עיסוק}/g, formData.industry)
                .replace(/{ת.ז \/ ח.פ}/g, formData.id)
                .replace(/{תאריך שליחה}/g, new Date().toLocaleDateString('he-IL'))
                .replace(/{שעה שליחה}/g, new Date().toLocaleTimeString('he-IL'));

            // 6. שליחת *שני* המיילים המוכנים ל-n8n
            submitButton.textContent = 'שולח מיילים...';

            const n8nResponse = await fetch(N8N_AGREEMENT_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientEmail: formData.email, // כתובת הלקוח
                    clientHtmlBody: finalClientHtml, // המייל ללקוח
                    employeeHtmlBody: finalEmployeeHtml, // המייל אליך
                    employeeSubject: `📄 נשלח הסכם שירות ל-${formData.name}` // נושא המייל אליך
                }),
            });

            if (!n8nResponse.ok) {
                throw new Error('תגובת שרת n8n לא תקינה');
            }

            const result = await n8nResponse.json();

            if (result.success === true) {
                // 7. הצלחה!
                showFeedback(agreementFeedback, 'ההסכם נשלח בהצלחה!', 'success');
                agreementForm.reset();
            } else {
                throw new Error(result.message || 'שגיאה שהגיעה מ-n8n');
            }

        } catch (err) {
            console.error('Error sending agreement:', err);
            showFeedback(agreementFeedback, `אירעה שגיאת תקשורת: ${err.message}`, 'error');

        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'שלח הסכם ללקוח';
            setTimeout(() => {
                agreementFeedback.style.display = 'none';
            }, 5000);
        }
    });

    // (הפונקציה showFeedback כבר קיימת מהקוד הקודם, אין צורך להעתיק אותה שוב)

    // פונקציית עזר להצגת משוב
    function showFeedback(element, message, type) {
        element.textContent = message;
        element.className = 'feedback-message';
        element.classList.add(type);
        element.style.display = 'block';
    }
});