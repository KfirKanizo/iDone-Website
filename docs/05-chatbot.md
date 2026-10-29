# צ'אטבוט באתר

עוזר דיגיטלי צף בכל עמוד ציבורי (לא בעמודי `assessment` ו-`preferences`), עברית ואנגלית, על Claude Haiku 5.5.

## ארכיטקטורה

```
דפדפן (src/scripts/chat.ts)
   │  POST {messages, locale, page}
   ▼
n8n  /webhook/chat   ← כאן, ורק כאן, יושב מפתח ה-API (Credential)
   │  1. ולידציה וניקוי של הקלט
   │  2. GET https://www.idone.co.il/chat-knowledge/<locale>.txt   (ה-system prompt)
   │  3. POST https://api.anthropic.com/v1/messages
   ▼
{ "reply": "..." }
```

- **הידע של הבוט** נבנה בזמן build מאותם קבצי תוכן שהאתר מרנדר (`src/pages/chat-knowledge/[lang].txt.ts`): שירותים, תהליך, עלינו, עבודות, פרטי קשר. מה שמעודכן באתר מעודכן בבוט אחרי כל deploy. הכללים (בלי להמציא מחירים, תשובות קצרות, סימון `[[LEAD]]`) נמצאים באותו קובץ ונערכים ב-git.
- **איסוף ליד:** כשהבוט מסיים תשובה ב-`[[LEAD]]`, הווידג'ט פותח טופס פרטים בתוך הצ'אט (עם תיבת ההסכמה לדיוור והנוסח המלא, כמו בטופס הרגיל) ושולח ל-`SITE.formEndpoint`, כלומר לאותו WF-01 / New Lead. השדה `message` מתחיל ב-`[פנייה מהצ'אט באתר]` ומכיל את תמלול השיחה. `source` נשאר `website` כדי לא לשבור מיפוי ב-Airtable.
- **שיחה:** נשמרת ב-`sessionStorage` בלבד (נמחקת עם סגירת הלשונית). אין שמירה בשרת.

## Workflow "Website Chat" ב-n8n

1. **Webhook** · POST · path `chat` · Respond: "Using Respond to Webhook node". Allowed Origins: `https://www.idone.co.il` (לפיתוח מקומי להוסיף `http://localhost:4321`).
2. **Code (ולידציה)**: לדחות (400) אם `messages` אינו מערך של 1 עד 13 הודעות, אם התפקידים לא מתחלפים user/assistant ומתחילים ב-user, אם ההודעה האחרונה אינה user, או אם `content` אינו מחרוזת עד 800 תווים. `locale` רק `he` או `en` (ברירת מחדל `he`). להעביר הלאה רק `role` ו-`content`.
3. **HTTP Request (ידע)**: GET `https://www.idone.co.il/chat-knowledge/{{ $json.locale }}.txt`, Response Format: Text.
4. **HTTP Request (Anthropic)**: POST `https://api.anthropic.com/v1/messages`
   - Authentication: Generic → Header Auth → Credential חדש "Anthropic" (שם הכותרת `x-api-key`, הערך הוא המפתח).
   - כותרת נוספת: `anthropic-version: 2023-06-01`.
   - Body (JSON):
     ```json
     {
       "model": "claude-haiku-5-5",
       "max_tokens": 1024,
       "output_config": { "effort": "low" },
       "system": "<טקסט הידע מהשלב הקודם>",
       "messages": "<המערך שנוקה בשלב 2>"
     }
     ```
   - Timeout 25 שניות. בלי `temperature`/`top_p` (נדחים במודלים החדשים).
5. **Respond to Webhook**: `{ "reply": "<ה-text block הראשון ב-content>" }`. אם `stop_reason` הוא `refusal`, או אם יש שגיאה, להחזיר 502 (הווידג'ט מציג הודעת שגיאה ידידותית ומחזיר את הטקסט לשדה ההקלדה).

## בטיחות ועלות

- ב-Anthropic Console: ליצור **API key ייעודי** (לא משותף), ולהגדיר **Spend limit חודשי** לארגון/ל-workspace. זו ההגנה האמיתית מפני ניצול לרעה.
- Haiku 5.5 עולה $0.10 / $0.50 למיליון טוקנים (קלט/פלט), כך ששיחה טיפוסית עולה אגורות. בהודעה אחת נשלחים הידע (כ-6K טוקנים בעברית) והשיחה עד כה.
- הגבלות בצד הלקוח (800 תווים להודעה, 20 הודעות לשיחה, חלון של 12 הודעות) הן נוחות, לא אבטחה: האכיפה האמיתית בשלב 2 ב-n8n.
- מומלץ להוסיף Rate limit לפי IP ב-n8n לפני שחושפים את זה לתנועה גבוהה (למשל Data Table עם מונה לדקה).

## בדיקה

```bash
curl -s -X POST https://n8n.idone.co.il/webhook/chat -H "Content-Type: application/json" --data-binary @chat-test.json
```

כש-`chat-test.json` הוא `{"messages":[{"role":"user","content":"מה אתם בונים?"}],"locale":"he","page":"/he/"}` (קובץ ולא `-d`, בגלל העברית מ-Windows).

## סדר העלאה

1. למזג את ה-PR לאתר (ה-deploy מפרסם את `chat-knowledge/*.txt` ואת הווידג'ט).
2. לבנות ולפרסם את ה-workflow ב-n8n. עד אז הווידג'ט יציג "משהו השתבש" כי אין למי לפנות.
3. לבדוק על האתר החי: שיחה בעברית, שיחה באנגלית, שאלה על מחיר (אסור שיומצא מחיר), בקשה לשיחה (נפתח טופס), שליחת הטופס (ליד ב-Airtable).
