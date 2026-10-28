# iDone Technologies · Brand kit (Spine)

הזהות של iDone: ה-D שהגב שלו הוא גם הגוף של ה-i, והנקודה של ה-i נעולה בתוך החלל שלו. **הלקוח בפנים, העבודה סגורה.**

## מבנה

```
brand/
├── logo/          SVG נקי לכל גרסה. הטקסט הומר ל-paths, הצבעים כמשתני CSS + fill לגיבוי
├── png/           ייצוא שקוף: לוגו אופקי, מוערם, סמל, ו-og-image.png (1200×630)
├── favicon/       favicon.svg, favicon.ico, apple-touch-icon, אייקוני PWA, site.webmanifest
├── tokens/        tokens.css (צבעים, פונטים, מרווחים, תנועה, מצב כהה) ו-tokens.json
├── animation/     <idone-logo> קומפוננטה מונפשת, SVG-ים מונפשים ב-CSS בלבד, demo.html, סקריפט ייצוא
└── video/         פתיח הלוגו: MP4 לרקע בהיר/כהה, MOV ו-WebM שקופים לעריכה, גרסה אנכית, לואדר
```

## לוגו

| קובץ | מתי |
|---|---|
| `idone-logo-horizontal.svg` | ברירת מחדל: header באתר, מסמכים, חתימות |
| `idone-logo-stacked.svg` | מקומות צרים וריבועיים: פוסטים, שקופית פתיחה, שלט |
| `idone-mark.svg` | סמל בלבד: אייקון, תמונת פרופיל, watermark בסרטונים |
| `idone-wordmark.svg` | כשהסמל כבר מופיע בסמוך |

לכל קובץ יש גרסאות: ללא סיומת (רקע בהיר), `-dark` (רקע כהה), `-mono-black`, `-mono-white`.

**כללים**
1. צבע האקסנט (Cobalt) שמור **לנקודה בלבד**. לא צובעים בו את ה-D, את ה-wordmark או שני אלמנטים באותה גרסה. בלי גרדיאנט, צל, קו מתאר או 3D.
2. **מרחב נקי** סביב הלוגו: רבע מגובה הסמל מכל צד. **גודל מינימלי:** אופקי בגובה 24px, מוערם בגובה 56px. מתחת לזה משתמשים בסמל או ב-favicon.
3. לא מותחים, לא מסובבים, לא מזיזים את הנקודה ולא כותבים "iDone" מחדש בפונט אחר. גם בעמודים בעברית הלוגו נשאר באנגלית ולא מתהפך.

**גריד הסמל** (64 יחידות): עובי 12 · חלל פנימי 20 · נקודה בקוטר 12 · מרווח 4 סביב הנקודה.

## צבעים

| | HEX | שימוש |
|---|---|---|
| Ink | `#0E1A2B` | סמל, טקסט, משטחים כהים |
| Cobalt | `#2F5BFF` | הנקודה ואקסנט על רקע בהיר |
| Cobalt Light | `#7D97FF` | הנקודה ואקסנט על רקע כהה |
| Mist | `#F4F6FA` | משטחים בהירים |

## טיפוגרפיה

- **Familjen Grotesk**: כותרות לטיניות. זה הפונט של ה-wordmark.
- **IBM Plex Sans Hebrew**: טקסט רץ, כותרות בעברית ולטינית משולבת.
- **IBM Plex Mono**: קוד, מספרים טכניים, תוויות.

כולם ב-Google Fonts ונטענים מתוך `tokens.css`.

## חיבור לאתר

```html
<link rel="icon" href="/brand/favicon/favicon.ico" sizes="48x48">
<link rel="icon" href="/brand/favicon/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/brand/favicon/apple-touch-icon.png">
<link rel="manifest" href="/brand/favicon/site.webmanifest">
<meta name="theme-color" content="#0E1A2B">
<meta property="og:image" content="https://www.idone.co.il/brand/png/og-image.png">

<link rel="stylesheet" href="/brand/tokens/tokens.css">
<script type="module" src="/brand/animation/idone-logo.js"></script>
```

אם האתר יושב ב-Next.js או Vite, שמים את תיקיית `brand/` תחת `public/`, והנתיבים יעבדו כמו שהם.

## אנימציה

**הסיפור (1.9 שניות):** ה-spine עולה כמו גוף של i, והנקודה קופצת מעליו, כך שרואים לרגע "i". אחר כך הקערה של ה-D נסגרת, והנקודה מזנקת בקשת ונוחתת בתוכה בדיוק ברגע הסגירה, עם קפיץ קטן ו"קליק" של ה-D. המילה iDone נכנסת אות אחרי אות, הנקודה של ה-i במילה נוחתת אחרונה, ו-TECHNOLOGIES מופיע בסוף.

```html
<!-- פתיח ב-header, מתנגן פעם אחת כשנכנס למסך -->
<idone-logo layout="horizontal" animation="intro"></idone-logo>

<!-- לואדר -->
<idone-logo layout="mark" animation="loop" style="width:48px;height:48px"></idone-logo>

<!-- סמל סטטי עם מיקרו-אינטראקציה בלחיצה (למשל אחרי שליחת טופס: el.tap()) -->
<idone-logo layout="mark" animation="none" tap></idone-logo>

<!-- הצבעים נלקחים מהאתר (מתחלף אוטומטית במצב כהה דרך tokens.css) -->
<idone-logo theme="inherit"></idone-logo>
```

| מאפיין | ערכים |
|---|---|
| `layout` | `mark` · `horizontal` · `stacked` |
| `animation` | `intro` · `loop` · `none` |
| `trigger` | `visible` (ברירת מחדל) · `load` · `hover` · `manual` |
| `theme` | `light` · `dark` · `mono-black` · `mono-white` · `inherit` (קורא את `--idone-ink` / `--idone-accent`) |
| `tap` | לחיצה מפעילה את מיקרו-האנימציה "done" |

- **מתודות:** `play()`, `replay()`, `stop()`, `tap()`, `seek('intro', ms)`.
- **אירועים:** `idone:landed` (הנקודה ננעלה) ו-`idone:finished`. אפשר לסנכרן אליהם את כניסת שאר העמוד.
- **prefers-reduced-motion:** מוצג המצב הסופי בלי תנועה.
- **React/Next:** טוענים פעם אחת ב-layout עם `<Script type="module" src="/brand/animation/idone-logo.js" />`, או מעתיקים את הקובץ ל-`src/` ומייבאים אותו בקומפוננטת client. אחרי זה משתמשים ב-`<idone-logo ... />` כרגיל.

**בלי JavaScript:** `idone-logo-intro.svg`, `idone-mark-intro.svg`, `idone-loader.svg` (וגרסאות `-dark`) הם SVG-ים עם אנימציית CSS בלבד, שעובדים גם בתוך `<img>`.

לראות הכול: מריצים שרת סטטי מתיקיית האתר (למשל `npx serve .`) ופותחים את `/brand/animation/demo.html`. מודולים לא נטענים מ-`file://`.

## וידאו

| קובץ | שימוש |
|---|---|
| `intro-horizontal-dark.mp4` / `-light.mp4` | פתיח או סיום מוכן, 1920×1080, 60fps |
| `intro-horizontal-for-dark-footage.mov` / `.webm` | שקוף (PNG-in-MOV, עם alpha), לשכבה מעל צילום כהה |
| `intro-horizontal-for-light-footage.mov` | שקוף, מעל צילום בהיר |
| `intro-stacked-vertical-dark.mp4` | 1080×1920 לרילס, טיקטוק וסטוריז |
| `loader-for-dark.webm` / `.mov` | לואדר בלולאה, שקוף |

**ייצוא מחדש** (גודל, רקע או משך אחרים): `npm i -D playwright && npx playwright install chromium`, ואז:

```
node brand/animation/export/render.mjs --layout horizontal --theme dark --bg "#0E1A2B" --width 3840 --height 2160 --encode mp4,mov --out exports/intro-4k
```

כל הפלטים (אתר, SVG מונפש, וידאו) נוצרים מאותה פונקציית תזמון ב-`idone-logo.js`, כך ששינוי בתנועה מתעדכן בכולם.
