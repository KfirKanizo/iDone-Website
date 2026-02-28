// iDone Main Application - Module Pattern
const iDoneApp = (function() {
    'use strict';

    // Private functions
    function initConsultationButtons() {
        const consultationButtons = document.querySelectorAll('a[href="#consultation"]');
        consultationButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
            });
        });
    }

    function initIconAnimations() {
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
    }

    function initCharacterCount() {
        const messageTextarea = document.getElementById('message');
        const charCount = document.getElementById('charCount');

        if (messageTextarea && charCount) {
            messageTextarea.addEventListener('input', () => {
                const remaining = messageTextarea.value.length;
                charCount.textContent = remaining;
            });
        }
    }

    function initPhoneValidation() {
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }
    }

    function initInlineValidation() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const fields = {
            firstName: { required: true, minLength: 2 },
            lastName: { required: true, minLength: 2 },
            phone: { required: true, pattern: /^[\d]{9,10}$/, error: 'מספר טלפון חייב להכיל 9-10 ספרות' },
            email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, error: 'אנא הזן כתובת אימייל תקינה' },
            occupation: { required: true, minLength: 2 }
        };

        Object.keys(fields).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (!field) return;

            const config = fields[fieldName];
            const errorSpan = document.createElement('span');
            errorSpan.className = 'field-error';
            errorSpan.setAttribute('role', 'alert');
            errorSpan.style.display = 'none';
            field.parentNode.insertBefore(errorSpan, field.nextSibling);

            field.addEventListener('blur', () => validateField(field, config, errorSpan));
            field.addEventListener('input', () => {
                if (field.classList.contains('invalid')) {
                    validateField(field, config, errorSpan);
                }
            });
        });

        function validateField(field, config, errorSpan) {
            const value = field.value.trim();
            let isValid = true;
            let errorMessage = '';

            if (config.required && !value) {
                isValid = false;
                errorMessage = 'שדה זה הכרחי';
            } else if (config.minLength && value.length < config.minLength) {
                isValid = false;
                errorMessage = `מינימום ${config.minLength} תווים`;
            } else if (config.pattern && !config.pattern.test(value)) {
                isValid = false;
                errorMessage = config.error || 'ערך לא תקין';
            }

            if (isValid) {
                field.classList.remove('invalid');
                field.classList.add('valid');
                errorSpan.style.display = 'none';
                return true;
            } else {
                field.classList.remove('valid');
                field.classList.add('invalid');
                errorSpan.textContent = errorMessage;
                errorSpan.style.display = 'block';
                return false;
            }
        }

        form.dataset.inlineValidation = 'true';
    }

    function initMobileMenuClose() {
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
    }

    function initSmoothScroll() {
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a[href*="#"]');
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (href.includes('#') && !href.startsWith('http')) {
                const targetId = href.split('#')[1];
                if (!targetId) return;

                const isIndex = location.pathname.includes('index.html') || 
                                location.pathname === '/' || 
                                location.pathname === '';

                if (isIndex && (href.startsWith('#') || href.includes('index.html'))) {
                    const target = document.getElementById(targetId);
                    if (target) {
                        e.preventDefault();
                        const headerOffset = 100;
                        const elementPosition = target.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });

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
    }

    function initBackToTop() {
        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) {
            window.addEventListener('scroll', () => {
                backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
            });

            backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        setTimeout(() => {
            const elementsToAnimate = document.querySelectorAll(
                '.service-card, .audience-item, .why-us li, .testimonial, .workflow-step, .portfolio-item, .article-content > *, .card, .package-card, .timeline-item, .benefit-item, .meeting-container, .portfolio-item-new'
            );

            elementsToAnimate.forEach((el) => {
                el.classList.add('fade-in-section');
                observer.observe(el);
            });
        }, 500);
    }

    function initModalClose() {
        window.onclick = function(event) {
            if (event.target === document.getElementById('contactFormModal')) {
                iDoneApp.closeContactForm();
            }
        };

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('contactFormModal');
                if (modal) modal.style.display = 'none';
            }
        });
    }

    // Public API
    return {
        init: function() {
            document.addEventListener('DOMContentLoaded', () => {
                initConsultationButtons();
                initIconAnimations();
                initCharacterCount();
                initPhoneValidation();
                initInlineValidation();
                initMobileMenuClose();
                initSmoothScroll();
                initBackToTop();
                initScrollAnimations();
                initModalClose();
            });
        },

        toggleMenu: function() {
            const navLinks = document.getElementById('navLinks');
            const hamburger = document.querySelector('.hamburger');

            if (navLinks) {
                navLinks.classList.toggle('active');
                const isOpen = navLinks.classList.contains('active');

                if (hamburger) {
                    hamburger.setAttribute('aria-expanded', isOpen);
                }
            }
        },

        openContactForm: function() {
            const modal = document.getElementById('contactFormModal');
            if (modal) modal.style.display = 'block';
        },

        closeContactForm: function() {
            const modal = document.getElementById('contactFormModal');
            const form = document.getElementById('contactForm');

            if (modal) {
                modal.style.display = 'none';
            }

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
        },

        submitContactForm: async function(event) {
            event.preventDefault();

            const form = event.target;
            const submitBtn = document.getElementById('contactSubmitBtn');
            const successMessage = document.getElementById('formSuccessMessage');
            const errorMessage = document.getElementById('formErrorMessage');

            form.classList.add('was-validated');

            submitBtn.disabled = true;
            submitBtn.classList.add('is-loading');
            successMessage.style.display = 'none';
            successMessage.classList.remove('success');
            errorMessage.style.display = 'none';
            errorMessage.classList.remove('error');

            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            const services = formData.getAll('services');

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                errorMessage.innerText = 'אנא הזן כתובת אימייל תקינה.';
                errorMessage.classList.add('error');
                errorMessage.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.classList.remove('is-loading');
                return;
            }

            if (services.length === 0) {
                errorMessage.innerText = 'אנא בחר לפחות שירות אחד.';
                errorMessage.classList.add('error');
                errorMessage.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.classList.remove('is-loading');
                return;
            }

            try {
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

                successMessage.classList.add('success');
                successMessage.style.display = 'block';
                form.reset();

                setTimeout(() => {
                    iDoneApp.closeContactForm();
                    successMessage.style.display = 'none';
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('is-loading');
                }, 5000);

            } catch (error) {
                console.error('Error:', error);
                errorMessage.innerText = 'אירעה שגיאה בשליחת הטופס, אנא נסה שוב מאוחר יותר.';
                errorMessage.classList.add('error');
                errorMessage.style.display = 'block';

                submitBtn.disabled = false;
                submitBtn.classList.remove('is-loading');
            }
        }
    };
})();

// Initialize the app
iDoneApp.init();

// Expose global functions for onclick handlers
window.toggleMenu = iDoneApp.toggleMenu;
window.openContactForm = iDoneApp.openContactForm;
window.closeContactForm = iDoneApp.closeContactForm;
window.submitContactForm = iDoneApp.submitContactForm;
