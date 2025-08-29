// js/components.js
async function loadComponentsAuto() {
  try {
    // מזהה אם אנחנו בתוך תיקיית components/articles
    const isArticle = location.pathname.includes('/components/articles/');
    const componentsPath = isArticle ? '../../components/' : 'components/';

    const [headerRes, footerRes] = await Promise.all([
      fetch(componentsPath + 'header.html'),
      fetch(componentsPath + 'footer.html')
    ]);

    const header = document.getElementById('header');
    const footer = document.getElementById('footer');

    if (header) header.innerHTML = await headerRes.text();
    if (footer) footer.innerHTML = await footerRes.text();
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
