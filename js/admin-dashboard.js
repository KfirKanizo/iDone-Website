document.addEventListener('DOMContentLoaded', async () => {

    // ============================================
    // 1. רכיב טעינת קומפוננטות (Component Loader)
    // ============================================
    async function loadComponent(containerId, filePath) {
        const container = document.getElementById(containerId);
        if (!container) return; // הגנה למקרה שה-ID לא קיים

        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`Failed to load ${filePath}`);
            const html = await response.text();
            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading component:', error);
            container.innerHTML = `<div class="error-msg">שגיאה בטעינת רכיב</div>`;
        }
    }

    // טעינת כל החלקים במקביל
    // שים לב: הנתיבים יחסיים לקובץ ה-HTML שמריץ את הסקריפט (בתיקייה הראשית)
    await Promise.all([
        loadComponent('preview-modal-container', 'components/admin/preview-modal.html'),
        loadComponent('sidebar-container', 'components/admin/sidebar.html'),
        loadComponent('stats-container', 'components/admin/stats.html'),
        loadComponent('widget-post-call-container', 'components/admin/widget-post-call.html'),
        loadComponent('widget-agreement-container', 'components/admin/widget-agreement.html')
    ]);

    // ============================================
    // 2. אתחול הלוגיקה של הדשבורד (Controller)
    // ============================================
    // מופעל רק אחרי שכל ה-HTML נטען והוזרק לדף
    initializeDashboardLogic();
});


function initializeDashboardLogic() {

    // --- א. לוגיקת תפריט צד (Sidebar) ---
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const toggleBtn = document.getElementById('toggle-sidebar-btn');
    const closeBtnMobile = document.getElementById('close-sidebar-mobile');
    const overlay = document.getElementById('overlay');

    function toggleSidebar() {
        const isMobile = window.innerWidth <= 992;
        if (isMobile) {
            const isActive = sidebar.classList.contains('active');
            if (isActive) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            } else {
                sidebar.classList.add('active');
                overlay.classList.add('active');
            }
        } else {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        }
    }

    if (toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);

    if (closeBtnMobile) {
        closeBtnMobile.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // --- ב. לוגיקת התנתקות (Logout) ---
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('adminAuthenticated');
            alert('התנתקת בהצלחה.');
            window.location.href = 'admin-login.html';
        });
    }

    // === לוגיקת תצוגה מקדימה (Preview Logic) ===
    const modalBackdrop = document.getElementById('preview-modal');
    const closePreviewBtn = document.getElementById('close-preview-btn');
    const previewFrame = document.getElementById('preview-frame');

    // סגירת המודאל
    if (closePreviewBtn && modalBackdrop) {
        closePreviewBtn.addEventListener('click', () => {
            modalBackdrop.classList.remove('open');
            setTimeout(() => { modalBackdrop.style.display = 'none'; }, 300);
        });

        // סגירה בלחיצה בחוץ
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) closePreviewBtn.click();
        });
    }

    // פונקציה גנרית ליצירת תצוגה מקדימה
    async function showEmailPreview(templatePath, replacements) {
        try {
            // הצגת המודאל עם אנימציה
            if (modalBackdrop) {
                modalBackdrop.style.display = 'flex';
                // Timeout קטן כדי לאפשר ל-CSS Transition לעבוד
                setTimeout(() => modalBackdrop.classList.add('open'), 10);
            }

            // טעינת התבנית
            const response = await fetch(templatePath);
            if (!response.ok) throw new Error('Failed to load template');

            let htmlContent = await response.text();

            // ביצוע ההחלפות
            for (const [key, value] of Object.entries(replacements)) {
                // יצירת Regex גלובלי כדי להחליף את כל המופעים
                // מניח שהמפתחות הם בדיוק מה שיש ב-HTML, למשל "{שם לקוח}"
                // אם המפתח הוא Regex string, נשתמש בו ישירות
                if (key.startsWith('{') || key.startsWith('\\')) {
                    htmlContent = htmlContent.replace(new RegExp(key, 'g'), value || '---');
                } else {
                    // ברירת מחדל: חיפוש טקסט רגיל
                    htmlContent = htmlContent.replaceAll(key, value || '---');
                }
            }

            // הזרקת ה-HTML לתוך ה-iframe
            const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
            doc.open();
            doc.write(htmlContent);
            doc.close();

        } catch (err) {
            console.error('Preview Error:', err);
            alert('שגיאה בטעינת תצוגה מקדימה: ' + err.message);
        }
    }

    // === חיבור כפתורי התצוגה ===

    // 1. תצוגה מקדימה - מייל סיכום שיחה
    const btnPreviewPostCall = document.getElementById('btn-preview-post-call');
    if (btnPreviewPostCall) {
        btnPreviewPostCall.addEventListener('click', () => {
            const name = document.getElementById('post-call-name').value;

            showEmailPreview('assets/emails/client/post-call-assessment-email.html', {
                '{שם לקוח}': name
            });
        });
    }

    // 2. תצוגה מקדימה - הסכם שירות
    const btnPreviewAgreement = document.getElementById('btn-preview-agreement');
    if (btnPreviewAgreement) {
        btnPreviewAgreement.addEventListener('click', () => {
            const name = document.getElementById('agreement-name').value;
            const id = document.getElementById('agreement-id').value;
            const price = document.getElementById('agreement-price').value;

            // יצירת לינק דמה לתצוגה
            const mockUrl = `https://www.idone.co.il/agreement.html?name=${encodeURIComponent(name)}...`;

            showEmailPreview('assets/emails/client/send-service-agreement-email.html', {
                '{שם לקוח}': name,
                '{{4.shortURL}}': mockUrl // חשוב: להשתמש בדיוק באותו מחזיק מקום שיש בקובץ
            });
        });
    }

    // פונקציית עזר להצגת משוב (Feedback)
    function showFeedback(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.className = 'feedback-message';
        element.classList.add(type);
        element.style.display = 'block';
    }

    // --- ג. לוגיקת טופס "תודה על השיחה" ---
    const postCallForm = document.getElementById('form-post-call');
    const postCallFeedback = document.getElementById('feedback-post-call');
    const N8N_POST_CALL_WEBHOOK_URL = 'https://n8n.idone.co.il/webhook/admin-post-call-email';

    if (postCallForm) {
        postCallForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('post-call-name').value;
            const email = document.getElementById('post-call-email').value;
            const submitButton = postCallForm.querySelector('button[type="submit"]');

            submitButton.disabled = true;
            submitButton.textContent = 'קורא תבנית...';
            showFeedback(postCallFeedback, 'מעבד בקשה...', 'pending');

            try {
                const response = await fetch('assets/emails/client/post-call-assessment-email.html');
                if (!response.ok) throw new Error('לא הצלחתי לטעון את תבנית המייל');

                let emailHtmlTemplate = await response.text();
                const finalHtmlBody = emailHtmlTemplate.replace(/{שם לקוח}/g, name);

                submitButton.textContent = 'שולח מייל...';

                const n8nResponse = await fetch(N8N_POST_CALL_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        htmlBody: finalHtmlBody
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
                submitButton.textContent = 'שגר אוטומציה 🚀';
                setTimeout(() => {
                    if (postCallFeedback) postCallFeedback.style.display = 'none';
                }, 5000);
            }
        });
    }

    // --- ד. לוגיקת טופס "שליחת הסכם שירות" ---
    const agreementForm = document.getElementById('form-send-agreement');
    const agreementFeedback = document.getElementById('feedback-agreement');
    const N8N_AGREEMENT_WEBHOOK_URL = 'https://n8n.idone.co.il/webhook/admin-send-agreement';

    if (agreementForm) {
        agreementForm.addEventListener('submit', async (e) => {
            e.preventDefault();

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
                const agreementURL = `https://www.idone.co.il/agreement.html?name=${encodeURIComponent(formData.name)}&id=${encodeURIComponent(formData.id)}&price=${encodeURIComponent(formData.price)}`;

                const [clientTemplateResponse, employeeTemplateResponse] = await Promise.all([
                    fetch('assets/emails/client/send-service-agreement-email.html'),
                    fetch('assets/emails/employee/send-service-agreement-email.html')
                ]);

                if (!clientTemplateResponse.ok || !employeeTemplateResponse.ok) {
                    throw new Error('לא הצלחתי לטעון את תבניות המייל');
                }

                let clientHtml = await clientTemplateResponse.text();
                let employeeHtml = await employeeTemplateResponse.text();

                const finalClientHtml = clientHtml
                    .replace(/{שם לקוח}/g, formData.name)
                    .replace('{{4.shortURL}}', agreementURL);

                const finalEmployeeHtml = employeeHtml
                    .replace(/{שם לקוח}/g, formData.name)
                    .replace(/{אימייל לקוח}/g, formData.email)
                    .replace(/{טלפון לקוח}/g, formData.phone)
                    .replace(/{שם חברה}/g, formData.company)
                    .replace(/{תחום עיסוק}/g, formData.industry)
                    .replace(/{ת.ז \/ ח.פ}/g, formData.id)
                    .replace(/{תאריך שליחה}/g, new Date().toLocaleDateString('he-IL'))
                    .replace(/{שעה שליחה}/g, new Date().toLocaleTimeString('he-IL'));

                submitButton.textContent = 'שולח מיילים...';

                const n8nResponse = await fetch(N8N_AGREEMENT_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clientEmail: formData.email,
                        clientHtmlBody: finalClientHtml,
                        employeeHtmlBody: finalEmployeeHtml,
                        employeeSubject: `📄 נשלח הסכם שירות ל-${formData.name}`
                    }),
                });

                if (!n8nResponse.ok) throw new Error('תגובת שרת n8n לא תקינה');
                const result = await n8nResponse.json();

                if (result.success === true) {
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
                submitButton.textContent = 'צור ושלח הסכם 📄';
                setTimeout(() => {
                    if (agreementFeedback) agreementFeedback.style.display = 'none';
                }, 5000);
            }
        });
    }
}