# AGENTS.md - iDone Website Project Guide

## Project Overview

This is a static Hebrew RTL website for iDone, an automation services company. 
The site is built with vanilla HTML, CSS, and JavaScript without any build system 
or framework.

- **Language**: Hebrew (lang="he", dir="rtl")
- **Font**: Heebo (Google Fonts)
- **Architecture**: Component-based with async loading

---

## Development Commands

### Local Development
```bash
# Start local dev server (VS Code Live Server extension)
# Port: 5501 (configured in .vscode/settings.json)
# Simply open index.html with Live Server
```

### Build/Deploy
- No build step required
- Deploy static files directly to web server
- Cache busting via URL query params (e.g., `style.css?v=202601141`)

### Testing & Linting
- No automated tests exist
- No linting configured (no ESLint/Prettier)
- Manual testing recommended across browsers

---

## Project Structure

```
├── index.html              # Homepage
├── portfolio.html          # Portfolio/case studies
├── workflow.html           # Workflow explanation
├── packages.html           # Pricing packages
├── articles.html           # Blog listing
├── meeting.html            # Meeting scheduler
├── assessment-form.html    # Client assessment
├── admin-*.html            # Admin dashboard pages
├── css/
│   └── style.css           # Main stylesheet (CSS variables)
├── js/
│   ├── main.js             # Global functionality
│   ├── components.js       # Async component loader
│   ├── chatbot.js          # Chat widget
│   ├── assessment-form.js  # Form logic
│   └── admin-dashboard.js  # Admin functionality
├── components/
│   ├── header.html         # Site header
│   ├── footer.html         # Site footer
│   ├── contact-form.html   # Contact modal
│   └── articles/           # Article HTML partials
└── assets/
    ├── images/             # SVG icons, logos
    └── emails/             # Email templates
```

---

## Code Style Guidelines

### File Naming
- Use **kebab-case**: `assessment-form.js`, `admin-dashboard.html`

### HTML
- Always include `lang="he"` and `dir="rtl"` on html/sections
- Use semantic elements: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- All images must have meaningful `alt` attributes (Hebrew preferred for SEO)
- Interactive elements need `aria-label` attributes
- External links should have `target="_blank"` and `rel="noopener noreferrer"`

### CSS
- Use CSS custom properties defined in `:root` (see style.css lines 2-38)
- Class naming: **kebab-case** (e.g., `.top-nav`, `.chat-input-area`)
- Use BEM-like patterns: `.card`, `.card-title`, `.card-footer`
- Mobile-first responsive design with `@media (max-width: 768px)`
- Animations use `.fade-in-section` and `.is-visible` pattern

### JavaScript
- **Variables**: camelCase (e.g., `messageTextarea`, `chatWidget`)
- **Functions**: camelCase (e.g., `loadComponentsAuto`, `submitContactForm`)
- Use `const` and `let` - no `var`
- Use `async/await` for async operations
- Event delegation preferred for dynamic elements
- User-facing messages in Hebrew, comments in English
- Always use `DOMContentLoaded` for initialization
- Handle errors with try/catch and user-friendly Hebrew messages

#### Example Function Pattern
```javascript
async function loadComponent(containerId, filePath) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to load ${filePath}`);
        container.innerHTML = await response.text();
    } catch (error) {
        console.error('Error loading component:', error);
    }
}
```

### Components (components.js)
- Components are HTML partials loaded via `fetch()`
- Path adjustment for nested pages (e.g., articles in `/components/articles/`)
- Always wait for components before manipulating their DOM

---

## Error Handling

- Use try/catch for async operations
- Display user-friendly Hebrew error messages
- Log technical details to console.error
- Form validation shows inline feedback in Hebrew

---

## Accessibility Requirements

- All pages: `dir="rtl"` and `lang="he"`
- Images: Descriptive `alt` text (Hebrew for local SEO)
- Buttons: `aria-label` for icon-only buttons
- Modals: Escape key to close, focus management
- Forms: Proper `<label>` associations
- Focus states visible for keyboard navigation

---

## External Integrations

- Webhook endpoint: `https://n8n.idone.co.il/webhook/`
- Chat API: `https://n8n.idone.co.il/webhook/chat`
- Form submission: `https://n8n.idone.co.il/webhook/website-form`
- Never commit API keys or sensitive credentials

---

## Color Palette (CSS Variables)

| Variable | Value | Usage |
|----------|-------|-------|
| `--primary-color` | #8e52db | Primary purple |
| `--primary-dark` | #6c3db5 | Hover states |
| `--secondary-color` | #00c48c | Accent green |
| `--accent-color` | #3b86f7 | Blue accent |
| `--text-color` | #1a1a1a | Body text |
| `--background-light` | #f8f9fa | Page background |

---

## Notes for AI Agents

1. This is a production website - test changes carefully
2. All user-facing text must be in Hebrew
3. Maintain RTL layout compatibility
4. Keep bundle size minimal (no frameworks)
5. Preserve existing CSS variable usage for consistency
6. Follow existing patterns in the codebase
