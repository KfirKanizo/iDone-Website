// Basic functionality definition

document.addEventListener('DOMContentLoaded', () => {
    // Link for free consultation button
    const consultationButtons = document.querySelectorAll('a[href="#consultation"]');
    consultationButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            // Logic for consultation button click can be added here
        });
    });

    // Handle icon animation
    // Use event delegation for better performance and dynamic elements
    document.body.addEventListener('mouseenter', (e) => {
        if (e.target.classList && e.target.classList.contains('suitable-for-icon')) {
            e.target.style.transform = 'scale(1.2)';
            e.target.style.transition = 'transform 0.3s ease';
        }
    }, true);

    document.body.addEventListener('mouseleave', (e) => {
        if (e.target.classList && e.target.classList.contains('suitable-for-icon')) {
            e.target.style.transform = 'scale(1)';
        }
    }, true);

    // Character count for message textarea
    const messageTextarea = document.getElementById('message');
    const charCount = document.getElementById('charCount');

    if (messageTextarea && charCount) {
        messageTextarea.addEventListener('input', () => {
            const remaining = messageTextarea.value.length;
            charCount.textContent = remaining;
        });
    }

    // Phone validation - numbers only
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }

    // Close mobile menu after clicking a link (using event delegation)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.nav-links a')) {
            const navLinks = document.getElementById('navLinks');
            const hamburger = document.querySelector('.hamburger');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (hamburger) hamburger.setAttribute('aria-expanded', false);
            }
        }
    });

    // Smooth Scrolling with Event Delegation
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href*="#"]');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        // Check if it's an anchor link to an ID
        if (href.includes('#') && !href.startsWith('http')) {
            // Extract ID
            const targetId = href.split('#')[1];
            if (!targetId) return;

            // Logic: If on index page (or asking for index page anchor), try to scroll
            const isIndex = location.pathname.includes('index.html') || location.pathname === '/' || location.pathname === '';

            if (isIndex && (href.startsWith('#') || href.includes('index.html'))) {
                const target = document.getElementById(targetId);
                if (target) {
                    e.preventDefault();
                    const headerOffset = 100; // Adjust for sticky header
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });

                    // Close mobile menu if open
                    const navLinks = document.getElementById('navLinks');
                    if (navLinks && navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                        const hamburger = document.querySelector('.hamburger');
                        if (hamburger) hamburger.setAttribute('aria-expanded', false);
                    }
                }
            }
        }
    });

    // Show back to top button
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Create new Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Add class when element enters viewport
                entry.target.classList.add('is-visible');
                // Optional: Stop observing after animation is done
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // 10% of element needs to be visible to trigger
    });

    // Select all elements to animate
    // We used a timeout to ensure dynamic elements are loaded (though components.js handles loading, redundancy helps)
    setTimeout(() => {
        const elementsToAnimate = document.querySelectorAll(
            '.service-card, .audience-item, .why-us li, .testimonial, .workflow-step, .portfolio-item, .article-content > *, .card, .package-card, .timeline-item, .benefit-item, .meeting-container, .portfolio-item-new'
        );

        // Add preparation class to all elements and start observing
        elementsToAnimate.forEach((el) => {
            el.classList.add('fade-in-section');
            observer.observe(el);
        });
    }, 500); // Small delay to allow component injection if race condition occurs

});

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');

    if (navLinks) {
        navLinks.classList.toggle('active');
        const isOpen = navLinks.classList.contains('active');

        if (hamburger) {
            hamburger.setAttribute('aria-expanded', isOpen);
        }
    }
}

function openContactForm() {
    document.getElementById('contactFormModal').style.display = 'block';
}

function closeContactForm() {
    const modal = document.getElementById('contactFormModal');
    const form = document.getElementById('contactForm');

    if (modal) {
        modal.style.display = 'none';
    }

    // Reset validation state and form messages
    if (form) {
        form.classList.remove('was-validated');

        const successMessage = document.getElementById('formSuccessMessage');
        const errorMessage = document.getElementById('formErrorMessage');

        if (successMessage) {
            successMessage.style.display = 'none';
            successMessage.classList.remove('success');
        }
        if (errorMessage) {
            errorMessage.style.display = 'none';
            errorMessage.classList.remove('error');
        }
    }
}

async function submitContactForm(event) {
    event.preventDefault();

    // Get form elements
    const form = event.target;
    const submitBtn = document.getElementById('contactSubmitBtn');
    const successMessage = document.getElementById('formSuccessMessage');
    const errorMessage = document.getElementById('formErrorMessage');

    // Enable visual validation state
    form.classList.add('was-validated');

    // Reset messages and enable loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');
    successMessage.style.display = 'none';
    successMessage.classList.remove('success');
    errorMessage.style.display = 'none';
    errorMessage.classList.remove('error');

    // Collect data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const services = formData.getAll('services');

    // Validations (remain as they were)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        // alert('Please enter a valid email address'); // Replaced
        errorMessage.innerText = 'אנא הזן כתובת אימייל תקינה.'; // Keeping Hebrew text for user facing messages
        errorMessage.classList.add('error');
        errorMessage.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-loading');
        return;
    }

    if (services.length === 0) {
        // alert('Please select at least one service'); // Replaced
        errorMessage.innerText = 'אנא בחר לפחות שירות אחד.'; // Keeping Hebrew text for user facing messages
        errorMessage.classList.add('error');
        errorMessage.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-loading');
        return;
    }

    try {
        // Send data to Webhook
        const response = await fetch('https://n8n.idone.co.il/webhook/website-form', {
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
            throw new Error('Server communication error');
        }

        // Success!
        // alert('Thank you! A representative will contact you shortly'); // Replaced
        successMessage.classList.add('success');
        successMessage.style.display = 'block';
        form.reset(); // Reset form

        // Keep message for 2 seconds then close modal
        setTimeout(() => {
            closeContactForm();
            // Reset button and message for next time
            successMessage.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-loading');
        }, 2500); // 2.5 seconds

    } catch (error) {
        // Failure
        console.error('Error:', error);
        // alert('An error occurred while sending the form, please try again later'); // Replaced
        errorMessage.innerText = 'אירעה שגיאה בשליחת הטופס, אנא נסה שוב מאוחר יותר.'; // Keeping Hebrew text for user facing messages
        errorMessage.classList.add('error');
        errorMessage.style.display = 'block';

        // Return button to normal state to allow retry
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-loading');
    }
}

// Close modal when clicking outside form or pressing Escape
window.onclick = function (event) {
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
