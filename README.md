# iDone Technologies · website

אתר דו-לשוני (עברית RTL, אנגלית LTR) בסגנון scrollytelling: הנקודה הכחולה מהלוגו מלווה את הגלילה, מחליפה תפקיד בכל סצנה, ונוחתת ב-D כשהטופס נשלח.

- **סטאק:** [Astro 5](https://astro.build) (אתר סטטי, ניתוב i18n מובנה, Content Collections, View Transitions), GSAP 3 + ScrollTrigger (חינמי לשימוש מסחרי מגרסה 3.13), Lenis לגלילה חלקה בדסקטופ בלבד. בלי WebGL.
- **מותג:** תיקיית `brand/` היא מקור האמת ואינה נערכת. היא מועתקת ל-`public/brand/` בכל `dev`/`build` (סקריפט `scripts/sync-brand.mjs`), כך שהנתיבים מה-README של המותג (`/brand/...`) עובדים כמו שהם.
- **Node:** 18.17+ / 20.3+ / 22 (נבדק על 22.16).

## הרצה

```bash
npm install
npm run dev        # http://localhost:4321  (מסנכרן את brand/ אוטומטית)
npm run build      # פלט סטטי ב-dist/
npm run preview    # הגשה של dist/
```

## מבנה

```
brand/                      ערכת המותג (לקריאה בלבד). README, tokens, לוגו, אנימציה, וידאו
public/brand/               עותק אוטומטי של brand/ (ב-.gitignore)
public/work/                מדיה של פרויקטים (וידאו, פוסטרים)
src/i18n/he.json, en.json   כל הטקסטים של הממשק, לכל שפה
src/i18n/index.ts           עזרי שפה: localePath, otherLocale, useTranslations
src/content/work/<he|en>/   פרויקטים (Markdown + frontmatter), זוג קבצים לכל פרויקט
src/content.config.ts       סכמת הפרויקטים
src/styles/tokens-ext.css   הרחבות האתר ל-tokens (קידומת --site-*)
src/styles/global.css       בסיס, טיפוגרפיה, כפתורים, הנקודה, טפסים
src/layouts/Base.astro      <head> (קוד המותג, hreflang, OG, JSON-LD), כותרת, פוטר, הנקודה
src/components/scenes/      סצנות עמוד הבית (HTML + CSS בלבד)
src/scripts/motion/         GSAP: dot.ts (הנקודה), scenes/*.ts (כוריאוגרפיה לכל סצנה)
src/scripts/ui.ts           כותרת, מצב כהה, מתג תנועה, מתג שפה (שומר סצנה), reveal, וידאו עצל
src/scripts/form.ts         טופס: ולידציה, שליחה ל-webhook, מצבי הצלחה/שגיאה
src/pages/<he|en>/          עמודים דקים שמרנדרים את src/components/pages/* (אין עמוד עבודות נפרד: הפרויקטים מוצגים בעמודי השירות ובעמוד הבית)
scripts/screenshots.mjs     צילומי QA (שפות × מכשירים × מצבים)
scripts/qa-flows.mjs        בדיקות אינטראקציה (פתיח, מתג שפה, טופס, בלי JS, reduced motion)
```

## עריכת תוכן ותרגומים

- **טקסטים של הממשק:** `src/i18n/he.json` ו-`src/i18n/en.json`. אותו מבנה מפתחות בשתי השפות; TypeScript יתריע אם מפתח חסר באנגלית (העברית היא הסכמה).
- **פרויקטים:** קובץ לכל שפה ב-`src/content/work/he/<slug>.md` ו-`src/content/work/en/<slug>.md`. אותו `slug` בשתי השפות (זה מה שמחבר את זוג ה-hreflang). שדות: `title, client, year, services[], summary, problem, built[], result[], tools[], featured, media, quote, tbd[]`. `featured: 1..3` מציב בעמוד הבית.
- **מדיה של פרויקט:** `media.type` יכול להיות `video`, `image`, `flow` (תרשים זרימה בסגנון המותג מתוך `flow: [...]`) או `none`. `gallery` לתמונות נוספות, `clientLogo` ללוגו הלקוח. וידאו ל-`public/work/<slug>/` (MP4 H.264 עד ~2MB לריל, עם פוסטר WebP), ומצביעים אליו מ-`media.src`/`media.poster`.
- **פרטי קשר, וואטסאפ, רשתות, webhook:** `src/lib/site.ts`. כשממלאים `whatsapp` (פורמט בינלאומי בלי +) כפתור הוואטסאפ מתחיל לעבוד.

## הוספת שפה

1. להוסיף את הקוד ל-`LOCALES` ב-`src/i18n/index.ts` ול-`astro.config.mjs` (`i18n.locales` ו-`sitemap.i18n.locales`).
2. ליצור `src/i18n/<lang>.json` באותו מבנה, ולהוסיף ל-`dicts`.
3. להעתיק את `src/pages/he/` ל-`src/pages/<lang>/` ולהחליף את `locale="he"`.
4. ליצור `src/content/work/<lang>/` עם אותם slugs.
5. `dirOf()` מחזיר `rtl` רק לעברית; להוסיף שפות RTL נוספות שם. ה-CSS כולו ב-logical properties, כך שהפריסה מתהפכת לבד.

## מצב כהה, תנועה ונגישות

- מצב כהה מגיע מ-`tokens.css` (לפי מערכת ההפעלה) ומכפתור בכותרת (`data-theme` על `<html>`, נשמר ב-localStorage). הלוגו `<idone-logo theme="inherit">` מתחלף לבד.
- כפתור "השבת אנימציות" מוסיף `data-motion="reduced"`: אין הצמדה, אין נקודה נודדת, הלוגו במצב סופי. אותו מסלול רץ אוטומטית עם `prefers-reduced-motion` ובמכשירים חלשים (`deviceMemory ≤ 2`, `saveData`).
- בלי JavaScript: כל הסקשנים נראים כרגיל, הלוגו הוא ה-SVG המונפש ב-CSS מתוך `brand/animation/`, הטופס נשלח ב-POST רגיל ל-webhook.
- הפתיח רץ פעם אחת לביקור (`sessionStorage`), ניתן לדלג בגלילה, בלחיצה או ב-Esc, ולא חוסם תוכן.

## עדכון נכסי מותג

- שינוי צבע/פונט/עקומה: עורכים ב-`brand/tokens/tokens.css`, מריצים `npm run sync-brand` (או פשוט `dev`/`build`). האתר קורא את המשתנים ישירות.
- שינוי בתנועת הלוגו: עורכים את פונקציית התזמון ב-`brand/animation/idone-logo.js`. הקומפוננטה באתר מתעדכנת מיד. כדי לייצא מחדש את ה-SVG המונפשים והסרטונים: `npm i -D playwright && npx playwright install chromium`, ואז `node brand/animation/export/render.mjs ...` לפי ה-README של המותג.
- הסקריפט `sync-brand` מדלג על קובצי `.mov` (PNG-in-MOV, פורמט עריכה שדפדפנים לא מנגנים) ועל `animation/export/`.

## טופס יצירת קשר

נשלח כ-JSON ל-`https://n8n.idone.co.il/webhook/website-form` (ב-`src/lib/site.ts`):

```json
{ "name": "", "phone": "", "email": "", "need": ["web","video","automation","unsure"], "message": "",
  "locale": "he|en", "source": "website", "page": "/he/contact/", "submittedAt": "ISO", "userAgent": "" }
```

ה-webhook צריך להחזיר 2xx (וכותרות CORS לדומיין האתר). שדה `website` הוא honeypot ולא נשלח. בלי JavaScript הטופס נשלח כ-`application/x-www-form-urlencoded` לאותה כתובת; כדאי ש-n8n יענה ב-redirect ל-`/he/contact/`.

## אוטומציית לידים (n8n + Airtable)

- **New Lead** (`/webhook/website-form`): בודק את הטופס, שומר ב-Base בשם iDone CRM ב-Airtable, שולח ללקוח אישור פנייה (עברית או אנגלית) ולצוות התראה במייל ובוואטסאפ, ורושם כל שליחה ביומן.
- **תבניות המיילים** יושבות ב-`public/emails/` ו-n8n מושך אותן מ-`https://www.idone.co.il/emails/`, כך ששינוי בתבנית נכנס לתוקף אחרי פריסה. משתנים כותבים כ-`{{name}}`.
- **הסרה מדיוור** (`/webhook/unsubscribe?r=<record>&l=he`): דף אישור, ורק לחיצה על הכפתור מסירה. מייל האישור הוא שירותי בלבד; לא מוסיפים לו תוכן שיווקי.
- **טופס אפיון**: `/he/assessment/?lead=<record>` (לא באינדקס ולא ב-sitemap), נשלח ל-`/webhook/assessment`.

## בדיקות

```bash
npm run dev                       # בטרמינל אחד
node scripts/qa-flows.mjs         # בדיקות אינטראקציה, תוצאות ב-qa/flows
node scripts/screenshots.mjs      # צילומי מסך, qa/shots   (--quick, --only=home, --themes=light, --langs=he, --vp=mobile)
python scripts/sheet.py "qa/shots/he-desktop-dark-home-*.png" qa/sheet.jpg 5 384
```

## העלאה לאירוח

אתר סטטי: `npm run build` ואז להעלות את `dist/` לכל ספק (Vercel, Netlify, Cloudflare Pages, GitHub Pages). הגדרות:

- Build command: `npm run build` · Output: `dist` · Node 22.
- `/` מפנה ל-`/he/` (ול-`/en/` אם המבקר בחר אנגלית בעבר). `404.html` בשורש הוא העברי; ב-Netlify/Cloudflare אפשר להוסיף כלל ל-`/en/*` → `/en/404/`.
- ב-GitHub Pages: הוסיפו `CNAME` ל-`public/`.
- לאחר העלאה: לבדוק את `https://www.idone.co.il/sitemap-index.xml` ולשלוח ל-Search Console.

## placeholders להשלמה

| מקום | מה חסר |
|---|---|
| `src/lib/site.ts` | עיר (ל-structured data), LinkedIn אם יש. אימייל/טלפון/וואטסאפ נלקחו מהאתר הקודם (support@idone.co.il, 052-8888182); לוודא שהוואטסאפ על אותו מספר |
| `src/i18n/*.json` → `legal.accessibility` | שם רכז נגישות, תאריך בדיקה |
| `src/i18n/*.json` → `legal.privacy` | כלי אנליטיקס (אם יש) |
| `src/components/scenes/Video.astro` | 6 ריילס/סרטונים נוספים במקום ה-placeholders (קובץ + פוסטר + קישור לפרויקט) |
| `src/content/work/*/boostcoach.md` | מספר הורדות/דירוג, קישור ל-Google Play |
| `src/content/work/*/lead-automation.md`, `client-onboarding.md`, `reports-dashboard.md` | שם לקוח ואישור פרסום, נתון אמיתי אחד |
| `src/content/work/*/digital-signatures.md`, `whatsapp-chatbot.md` | אישור מחודש לציטוטים ולשמות (הועתקו מהאתר הקיים) |
| `src/content/work/*/idone-noc.md` | צילום מסך אמיתי של הדשבורד (כרגע תרשים זרימה) |
| `brand/png/og-image.png` | גרסה עברית (אופציונלי) |
