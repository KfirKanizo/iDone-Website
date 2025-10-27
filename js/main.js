// הגדרת פונקציונליות בסיסית

document.addEventListener('DOMContentLoaded', () => {
    // קישור כפתור ייעוץ חינם
    const consultationButtons = document.querySelectorAll('a[href="#consultation"]');
    consultationButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            // כאן תוכל להוסיף לוגיקה לטיפול בלחיצה על כפתור הייעוץ
        });
    });

    // טיפול באנימציית האייקונים
    const suitableIcons = document.querySelectorAll('.suitable-for-icon');
    suitableIcons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            icon.style.transform = 'scale(1.2)';
            icon.style.transition = 'transform 0.3s ease';
        });

        icon.addEventListener('mouseleave', () => {
            icon.style.transform = 'scale(1)';
        });
    });

    // מעקב אחר מספר התווים בהודעה
    const messageTextarea = document.getElementById('message');
    const charCount = document.getElementById('charCount');

    if (messageTextarea && charCount) {
        messageTextarea.addEventListener('input', () => {
            const remaining = messageTextarea.value.length;
            charCount.textContent = remaining;
        });
    }

    // ולידציה לטלפון - רק מספרים
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }

    // סגירת תפריט נייד לאחר לחיצה על קישור
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            const navLinks = document.getElementById('navLinks');
            navLinks.classList.remove('active');
            document.querySelector('.hamburger').setAttribute('aria-expanded', false);
        });
    });

    // הצגת כפתור חזרה למעלה
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // יצירת Observer חדש
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // הוספת הקלאס כשהאלמנט נכנס למסך
                entry.target.classList.add('is-visible');
                // אופציונלי: הפסקת המעקב אחרי שהאנימציה בוצעה
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // 10% מהאלמנט צריך להיראות כדי להפעיל
    });

    // בחירת כל האלמנטים שנרצה להנפיש
    // (אפשר להוסיף עוד סלקטורים לפי הצורך)
    const elementsToAnimate = document.querySelectorAll(
        '.service-card, .audience-item, .why-us li, .testimonial, .workflow-step, .portfolio-item, .article-content > *'
    );
    
    // הוספת קלאס ההכנה לכל האלמנטים והפעלת המעקב
    elementsToAnimate.forEach((el) => {
        el.classList.add('fade-in-section');
        observer.observe(el);
    });

});

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');

    const isOpen = navLinks.classList.contains('active');
    document.querySelector('.hamburger').setAttribute('aria-expanded', isOpen);
}

function openContactForm() {
    document.getElementById('contactFormModal').style.display = 'block';
}

function closeContactForm() {
    document.getElementById('contactFormModal').style.display = 'none';
}

async function submitContactForm(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // בדיקת תקינות אימייל
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        alert('אנא הזן כתובת אימייל תקינה');
        return;
    }

    // בדיקת בחירת לפחות שירות אחד
    const services = formData.getAll('services');
    if (services.length === 0) {
        alert('אנא בחר לפחות שירות אחד');
        return;
    }

    try {
        const response = await fetch('https://n8n.idone.co.il/webhook/3426c7c0-5223-447d-913e-4b4c1d855591', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...data,
                services: services,
                source: "אתר תדמיתי"
            })
        });

        if (!response.ok) {
            throw new Error('שגיאה בשליחת הטופס');
        }

        alert('תודה! נציג יחזור אליך בהקדם');
        closeContactForm();
    } catch (error) {
        console.error('Error:', error);
        alert('אירעה שגיאה בשליחת הטופס, אנא נסה שוב מאוחר יותר');
    }
}

// סגירת המודל כאשר לוחצים מחוץ לטופס או לוחצים על Escape
window.onclick = function(event) {
    if (event.target === document.getElementById('contactFormModal')) {
        closeContactForm();
    }
};

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('contactFormModal');
        if (modal) modal.style.display = 'none';
    }
});
