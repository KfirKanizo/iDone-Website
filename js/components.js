// js/components.js
async function loadComponentsAuto() {
  try {
    // Use absolute paths from root for consistent loading on all pages
    const componentsPath = '/components/';

    // Add loading state to containers
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    const contactForm = document.getElementById('contact-form');

    if (header) header.innerHTML = '<div class="component-loading">טוען...</div>';
    if (footer) footer.innerHTML = '<div class="component-loading">טוען...</div>';
    if (contactForm) contactForm.innerHTML = '<div class="component-loading">טוען...</div>';

    // Fetch all components in parallel
    const [headerRes, footerRes, contactFormRes] = await Promise.all([
      fetch(componentsPath + 'header.html'),
      fetch(componentsPath + 'footer.html'),
      fetch(componentsPath + 'contact-form.html')
    ]);

    // Check for fetch errors
    if (!headerRes.ok) throw new Error(`Failed to load header: ${headerRes.status}`);
    if (!footerRes.ok) throw new Error(`Failed to load footer: ${footerRes.status}`);
    if (!contactFormRes.ok) throw new Error(`Failed to load contact form: ${contactFormRes.status}`);

    // Inject content
    if (header) header.innerHTML = await headerRes.text();
    if (footer) footer.innerHTML = await footerRes.text();
    if (contactForm) contactForm.innerHTML = await contactFormRes.text();

  } catch (e) {
    console.error('Error loading components:', e);
    
    // Show fallback UI for failed components
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    const contactForm = document.getElementById('contact-form');
    
    if (header) header.innerHTML = '<div class="component-error">שגיאה בטעינת הכותרת. אנא רענן את הדף.</div>';
    if (footer) footer.innerHTML = '';
    if (contactForm) contactForm.innerHTML = '';
  }
}

// Back to top button
document.addEventListener('scroll', () => {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  btn.style.display = window.scrollY > 300 ? 'block' : 'none';
});

// Add CSS for loading states if not already present
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .component-loading, .component-error {
      padding: 2rem;
      text-align: center;
      color: var(--text-muted, #555);
    }
    .component-error {
      color: #e53935;
    }
  `;
  document.head.appendChild(style);
}
