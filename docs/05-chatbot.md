# צ'אטבוט באתר

עוזר דיגיטלי צף בכל עמוד ציבורי (לא בעמודי `assessment` ו-`preferences`), עברית ואנגלית, על Claude Haiku 5.5.

## ארכיטקטורה

```
דפדפן (src/scripts/chat.ts)
   │  POST {messages, locale, page}
   ▼
n8n  /webhook/site-chat   ← כאן, ורק כאן, יושב מפתח ה-API (Credential)
   │  1. ולידציה וניקוי של הקלט
   │  2. GET https://www.idone.co.il/chat-knowledge/<locale>.txt   (ה-system prompt)
   │  3. POST https://api.anthropic.com/v1/messages
   ▼
{ "reply": "..." }
```

- **הידע של הבוט** נבנה בזמן build מאותם קבצי תוכן שהאתר מרנדר (`src/pages/chat-knowledge/[lang].txt.ts`): שירותים, תהליך, עלינו, עבודות, פרטי קשר. מה שמעודכן באתר מעודכן בבוט אחרי כל deploy. הכללים (בלי להמציא מחירים, תשובות קצרות, סימון `[[LEAD]]`) נמצאים באותו קובץ ונערכים ב-git.
- **איסוף ליד:** כשהבוט מסיים תשובה ב-`[[LEAD]]`, הווידג'ט פותח טופס פרטים בתוך הצ'אט (עם תיבת ההסכמה לדיוור והנוסח המלא, כמו בטופס הרגיל) ושולח ל-`SITE.formEndpoint`, כלומר לאותו WF-01 / New Lead. השדה `message` מתחיל ב-`[פנייה מהצ'אט באתר]` ומכיל את תמלול השיחה. `source` נשאר `website` כדי לא לשבור מיפוי ב-Airtable.
- **שיחה:** נשמרת ב-`sessionStorage` בלבד (נמחקת עם סגירת הלשונית). אין שמירה בשרת.

## Workflow "Website · Chat (Claude Haiku)" ב-n8n

מזהה `EpwApjG0oovjUszR`, פורסם. Webhook ב-`POST /webhook/site-chat` (הנתיב `chat` תפוס אצל n8n). Origins מותרים: האתר, `idone.co.il` ו-`localhost:4321`. שגיאות נשלחות ל-error workflow `tD6fj0TGkLPMbn4U`. שמירת הרצות מוצלחות כבויה בכוונה, כדי שתוכן שיחות לא יישמר.

1. **Validate Chat** (Code): חותך ל-13 הודעות אחרונות, דורש שהשיחה תתחיל ותסתיים ב-user, הודעה עד 800 תווים, `locale` רק `he`/`en`. מגביל קצב: 10 בקשות לדקה ל-IP ו-400 לשעה בסך הכול (`$getWorkflowStaticData`). דחייה מחזירה 400 או 429.
2. **Fetch Knowledge** (HTTP GET): `https://www.idone.co.il/chat-knowledge/<locale>.txt`. כשל לא עוצר את הזרימה.
3. **Build Request** (Code): הקובץ הוא ה-`system`. אם לא זמין (או קצר מ-500 תווים) משתמשים בנוסח מינימלי קצר, כך שהצ'אט ממשיך לענות בזהירות במקום ליפול.
4. **Ask Claude** (HTTP POST `https://api.anthropic.com/v1/messages`): credential מובנה `anthropicApi` ("Anthropic account"), כותרת `anthropic-version: 2023-06-01` (ה-credential לא מוסיף אותה), גוף `{model: "claude-haiku-5-5", max_tokens: 1024, output_config: {effort: "low"}, system, messages}`, timeout 25 שניות.
5. **Extract Reply** ו-**Has Reply?**: מחברים את בלוקי ה-`text`. `refusal` או תשובה ריקה נחשבים כשל. מחזירים `{reply}` (200), ובכל כשל `{ok:false}` עם 502 (הווידג'ט מציג הודעה ידידותית ומחזיר את הטקסט לשדה ההקלדה).

## בטיחות ועלות

- ב-Anthropic Console: מומלץ **API key ייעודי** לאתר, ולהגדיר **Spend limit חודשי** לארגון/ל-workspace. זו ההגנה האמיתית מפני ניצול לרעה.
- Haiku 5.5 עולה $0.10 / $0.50 למיליון טוקנים (קלט/פלט), כך ששיחה טיפוסית עולה אגורות. בהודעה אחת נשלחים הידע (כ-6K טוקנים בעברית) והשיחה עד כה.
- הגבלות בצד הלקוח (800 תווים להודעה, 20 הודעות לשיחה, חלון של 12 הודעות) הן נוחות, לא אבטחה: האכיפה האמיתית ב-Validate Chat.
- תורי ההודעות הקודמות מגיעים מהדפדפן, ולכן גולש יכול לזייף תשובות "של הבוט". זה לא נותן גישה לשום דבר, והכללים ב-system prompt מגבילים את הבוט, אבל אין לראות בשיחה תיעוד אמין.

## בדיקה

```bash
curl -s -X POST https://n8n.idone.co.il/webhook/site-chat -H "Content-Type: application/json" --data-binary @chat-test.json
```

כש-`chat-test.json` הוא `{"messages":[{"role":"user","content":"מה אתם בונים?"}],"locale":"he","page":"/he/"}` (קובץ ולא `-d`, בגלל העברית מ-Windows).

## סדר העלאה

1. למזג את ה-PR לאתר (ה-deploy מפרסם את `chat-knowledge/*.txt` ואת הווידג'ט).
2. ה-workflow כבר פעיל. עד המיזוג הוא עונה בנוסח המינימלי כי `chat-knowledge` עדיין לא קיים בפרודקשן (נבדק: 404, והמעבר עובד).
3. אחרי ה-deploy לוודא ש-`https://www.idone.co.il/chat-knowledge/he.txt` נטען, ולבדוק על האתר החי: שיחה בעברית, שיחה באנגלית, שאלה על מחיר (אסור שיומצא מחיר), בקשה לשיחה (נפתח טופס), שליחת הטופס (ליד ב-Airtable).
