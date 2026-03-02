// ============================================
// 0. אבטחה - בדיקת הרשאות מיידית (Immediate Guard)
// ============================================
if (typeof window !== 'undefined' && sessionStorage.getItem('adminAuthenticated') !== 'true') {
    window.location.href = 'admin-login.html';
}

document.addEventListener('DOMContentLoaded', async function () {

    // ============================================
    // 0.5 Hide Loading Overlay
    // ============================================
    function hideLoadingOverlay() {
        var overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            setTimeout(function () { overlay.remove(); }, 300);
        }
    }

    // Hide loading immediately since content is embedded
    hideLoadingOverlay();

    // ============================================
    // Dark Mode Initialization
    // ============================================
    function initDarkMode() {
        var savedTheme = localStorage.getItem('adminTheme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }
    initDarkMode();

    // Theme toggle handler
    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var currentTheme = document.documentElement.getAttribute('data-theme');
            var newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            if (newTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('adminTheme', 'dark');
                showToast('הממשק עבר למצב לילה', 'info');
            } else {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('adminTheme', 'light');
                showToast('הממשק עבר למצב יום', 'info');
            }
        });
    }

    // ============================================
    // Toast Notification System
    // ============================================
    function showToast(message, type) {
        type = type || 'info';
        var existingToast = document.getElementById('admin-toast');
        if (existingToast) existingToast.remove();

        var toast = document.createElement('div');
        toast.id = 'admin-toast';
        toast.className = 'toast-notification toast-' + type;

        var icons = {
            success: 'check_circle',
            error: 'error',
            info: 'info'
        };

        toast.innerHTML = '<span class="material-icons-round toast-icon">' + (icons[type] || icons.info) + '</span>' +
            '<span class="toast-message">' + message + '</span>' +
            '<button class="toast-close" aria-label="סגור"><span class="material-icons-round">close</span></button>';

        document.body.appendChild(toast);

        requestAnimationFrame(function () {
            toast.classList.add('show');
        });

        var closeToast = function () {
            toast.classList.remove('show');
            setTimeout(function () { toast.remove(); }, 300);
        };

        toast.querySelector('.toast-close').addEventListener('click', closeToast);
        setTimeout(closeToast, 5000);
    }

    // ============================================
    // Button Loading State Helper
    // ============================================
    function setButtonLoading(button, isLoading, originalText) {
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
            button.innerHTML = '<span class="btn-spinner"></span>' + originalText + '...';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            button.textContent = originalText;
        }
    }

    // ============================================
    // Email Validation Helper
    // ============================================
    function isValidEmail(email) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // ============================================
    // Sidebar Logic
    // ============================================
    var sidebar = document.getElementById('sidebar');
    var toggleBtn = document.getElementById('toggle-sidebar-btn');
    var closeBtnMobile = document.getElementById('close-sidebar-mobile');
    var overlay = document.getElementById('overlay');

    function toggleSidebar() {
        var isMobile = window.innerWidth <= 992;
        if (isMobile) {
            var isActive = sidebar.classList.contains('active');
            if (isActive) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            } else {
                sidebar.classList.add('active');
                overlay.classList.add('active');
            }
        } else {
            sidebar.classList.toggle('collapsed');
        }
    }

    if (toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);

    if (closeBtnMobile) {
        closeBtnMobile.addEventListener('click', function () {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function () {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // === Logout ===
    var logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            sessionStorage.removeItem('adminAuthenticated');
            showToast('התנתקת בהצלחה. מתכוון למסך הכניסה...', 'success');
            setTimeout(function () {
                window.location.href = 'admin-login.html';
            }, 1500);
        });
    }

    // === Preview Modal Logic ===
    var modalBackdrop = document.getElementById('preview-modal');
    var closePreviewBtn = document.getElementById('close-preview-btn');
    var previewFrame = document.getElementById('preview-frame');

    if (closePreviewBtn && modalBackdrop) {
        closePreviewBtn.addEventListener('click', function () {
            modalBackdrop.classList.remove('open');
            setTimeout(function () { modalBackdrop.style.display = 'none'; }, 300);
        });

        modalBackdrop.addEventListener('click', function (e) {
            if (e.target === modalBackdrop) closePreviewBtn.click();
        });
    }

    async function showEmailPreview(templatePath, replacements) {
        try {
            if (modalBackdrop) {
                modalBackdrop.style.display = 'flex';
                setTimeout(function () { modalBackdrop.classList.add('open'); }, 10);
            }

            var response = await fetch(templatePath);
            if (!response.ok) throw new Error('Failed to load template');

            var htmlContent = await response.text();

            for (var key in replacements) {
                if (replacements.hasOwnProperty(key)) {
                    if (key.startsWith('{') || key.startsWith('\\')) {
                        htmlContent = htmlContent.replace(new RegExp(key, 'g'), replacements[key] || '---');
                    } else {
                        htmlContent = htmlContent.split(key).join(replacements[key] || '---');
                    }
                }
            }

            var doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
            doc.open();
            doc.write(htmlContent);
            doc.close();

        } catch (err) {
            console.error('Preview Error:', err);
            showToast('שגיאה בטעינת תצוגה מקדימה: ' + err.message, 'error');
        }
    }

    // Preview buttons
    var btnPreviewPostCall = document.getElementById('btn-preview-post-call');
    if (btnPreviewPostCall) {
        btnPreviewPostCall.addEventListener('click', function () {
            var name = document.getElementById('post-call-name').value;
            showEmailPreview('assets/emails/client/post-call-assessment-email.html', {
                '{שם לקוח}': name
            });
        });
    }

    var btnPreviewAgreement = document.getElementById('btn-preview-agreement');
    if (btnPreviewAgreement) {
        btnPreviewAgreement.addEventListener('click', function () {
            var name = document.getElementById('agreement-name').value;
            var mockUrl = 'https://www.idone.co.il/agreement.html?name=' + encodeURIComponent(name) + '...';

            showEmailPreview('assets/emails/client/send-service-agreement-email.html', {
                '{שם לקוח}': name,
                '{{4.shortURL}}': mockUrl
            });
        });
    }

    function showFeedback(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.className = 'feedback-message';
        element.classList.add(type);
        element.style.display = 'block';
    }

    // === Post-Call Form ===
    var postCallForm = document.getElementById('form-post-call');
    var postCallFeedback = document.getElementById('feedback-post-call');
    var N8N_POST_CALL_WEBHOOK_URL = 'https://n8n.idone.co.il/webhook/admin-send-email';

    if (postCallForm) {
        postCallForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            var name = document.getElementById('post-call-name').value;
            var email = document.getElementById('post-call-email').value;
            var submitButton = postCallForm.querySelector('button[type="submit"]');
            var originalText = 'שגר אוטומציה 🚀';

            if (!name.trim()) {
                showToast('יש להזין שם לקוח', 'error');
                return;
            }
            if (!isValidEmail(email)) {
                showToast('יש להזין כתובת אימייל תקינה', 'error');
                return;
            }

            setButtonLoading(submitButton, true, originalText);
            showFeedback(postCallFeedback, 'מעבד בקשה...', 'pending');

            try {
                var response = await fetch('assets/emails/client/post-call-assessment-email.html');
                if (!response.ok) throw new Error('לא הצלחתי לטעון את תבנית המייל');

                var emailHtmlTemplate = await response.text();
                var finalHtmlBody = emailHtmlTemplate.replace(/{שם לקוח}/g, name);

                var n8nResponse = await fetch(N8N_POST_CALL_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        htmlBody: finalHtmlBody,
                        subject: 'היי ' + name + ', תודה על השיחה המעניינת!'
                    })
                });

                if (!n8nResponse.ok) throw new Error('תגובת שרת n8n לא תקינה');
                var result = await n8nResponse.json();

                if (result.success === true) {
                    showFeedback(postCallFeedback, 'המייל נשלח בהצלחה!', 'success');
                    showToast('המייל נשלח בהצלחה!', 'success');
                    postCallForm.reset();
                } else {
                    throw new Error(result.message || 'שגיאה שהגיעה מ-n8n');
                }

            } catch (err) {
                console.error('Error sending post-call email:', err);
                showFeedback(postCallFeedback, 'אירעה שגיאה: ' + err.message, 'error');
                showToast('שגיאה: ' + err.message, 'error');
            } finally {
                setButtonLoading(submitButton, false, originalText);
                setTimeout(function () {
                    if (postCallFeedback) postCallFeedback.style.display = 'none';
                }, 5000);
            }
        });
    }

    // === Agreement Form ===
    var agreementForm = document.getElementById('form-send-agreement');
    var agreementFeedback = document.getElementById('feedback-agreement');
    var N8N_AGREEMENT_WEBHOOK_URL = 'https://n8n.idone.co.il/webhook/admin-send-email';

    if (agreementForm) {
        agreementForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            var formData = {
                name: document.getElementById('agreement-name').value,
                email: document.getElementById('agreement-email').value,
                phone: document.getElementById('agreement-phone').value,
                company: document.getElementById('agreement-company').value,
                id: document.getElementById('agreement-id').value,
                industry: document.getElementById('agreement-industry').value,
                price: document.getElementById('agreement-price').value
            };

            var submitButton = agreementForm.querySelector('button[type="submit"]');
            var originalText = 'צור ושלח הסכם 📄';

            if (!formData.name.trim()) {
                showToast('יש להזין שם לקוח', 'error');
                return;
            }
            if (!isValidEmail(formData.email)) {
                showToast('יש להזין כתובת אימייל תקינה', 'error');
                return;
            }
            if (!formData.id.trim()) {
                showToast('יש להזין ת.ז או ח.פ', 'error');
                return;
            }
            if (!formData.price.trim()) {
                showToast('יש להזין תעריף', 'error');
                return;
            }

            setButtonLoading(submitButton, true, originalText);
            showFeedback(agreementFeedback, 'מעבד בקשה...', 'pending');

            try {
                var agreementURL = 'https://www.idone.co.il/agreement.html?name=' + encodeURIComponent(formData.name) + '&id=' + encodeURIComponent(formData.id) + '&price=' + encodeURIComponent(formData.price);

                var clientTemplateResponse = await fetch('assets/emails/client/send-service-agreement-email.html');

                if (!clientTemplateResponse.ok) {
                    throw new Error('לא הצלחתי לטעון את תבניות המייל');
                }

                var clientHtml = await clientTemplateResponse.text();

                var finalClientHtml = clientHtml
                    .replace(/{שם לקוח}/g, formData.name)
                    .replace('{{4.shortURL}}', agreementURL);

                var n8nResponse = await fetch(N8N_AGREEMENT_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        name: formData.name,
                        htmlBody: finalClientHtml,
                        subject: '📄 נשלח הסכם שירות ל-' + formData.name
                    })
                });

                if (!n8nResponse.ok) throw new Error('תגובת שרת n8n לא תקינה');
                var result = await n8nResponse.json();

                if (result.success === true) {
                    showFeedback(agreementFeedback, 'ההסכם נשלח בהצלחה!', 'success');
                    showToast('ההסכם נשלח בהצלחה!', 'success');
                    agreementForm.reset();
                } else {
                    throw new Error(result.message || 'שגיאה שהגיעה מ-n8n');
                }

            } catch (err) {
                console.error('Error sending agreement:', err);
                showFeedback(agreementFeedback, 'אירעה שגיאת תקשורת: ' + err.message, 'error');
                showToast('שגיאה: ' + err.message, 'error');
            } finally {
                setButtonLoading(submitButton, false, originalText);
                setTimeout(function () {
                    if (agreementFeedback) agreementFeedback.style.display = 'none';
                }, 5000);
            }
        });
    }
});
