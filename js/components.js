// js/components.js
async function loadComponentsAuto() {
  try {
    // מזהה אם אנחנו בתוך תיקיית components/articles
    const isArticle = location.pathname.includes('/components/articles/');
    const componentsPath = isArticle ? '../../components/' : 'components/';

    const [headerRes, footerRes, contactFormRes] = await Promise.all([
      fetch(componentsPath + 'header.html'),
      fetch(componentsPath + 'footer.html'),
      fetch(componentsPath + 'contact-form.html')
    ]);

    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    const contactForm = document.getElementById('contact-form');

    if (header) header.innerHTML = await headerRes.text();
    if (footer) footer.innerHTML = await footerRes.text();
    if (contactForm) contactForm.innerHTML = await contactFormRes.text();
  } catch (e) {
    console.error('Error loading components:', e);
  }
}

// כפתור חזרה לראש הדף
document.addEventListener('scroll', () => {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  btn.style.display = window.scrollY > 300 ? 'block' : 'none';
});
