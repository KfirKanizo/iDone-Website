# One-off generator for the initial work entries (kept for reference; the .md files are the source after this).
import json, os
ROOT = os.path.join(os.path.dirname(__file__), '..')

def yaml(d, ind=0):
    out = []
    for k, v in d.items():
        pad = " " * ind
        if isinstance(v, dict):
            out.append(f"{pad}{k}:"); out.append(yaml(v, ind + 2))
        elif isinstance(v, list):
            if not v: out.append(f"{pad}{k}: []"); continue
            out.append(f"{pad}{k}:")
            for it in v:
                if isinstance(it, dict):
                    lines = yaml(it, ind + 4).split("\n")
                    out.append(f"{pad}  - " + lines[0].strip()); out += lines[1:]
                else:
                    out.append(f"{pad}  - {json.dumps(it, ensure_ascii=False)}")
        else:
            out.append(f"{pad}{k}: {json.dumps(v, ensure_ascii=False)}")
    return "\n".join(out)

NONE = dict(type="none", ratio="16 / 9")
W = {}
W['boostcoach'] = {
 'he': dict(title="BoostCoach: אפליקציית כושר שסופרת חזרות במצלמה", client="BoostCoach", year="2025–2026", services=["web", "video"],
   summary="אפליקציית אנדרואיד בעברית ובאנגלית שסופרת חזרות ובודקת טכניקה דרך המצלמה, ולצידה סדרת ריילס שיווקיים שהופקו עם המוצר האמיתי.",
   problem="מתאמנים בבית, בלי מאמן ובלי ציוד, לא יודעים אם הם מבצעים נכון ומאבדים מוטיבציה אחרי שבוע. היה צריך מוצר שנותן משוב בזמן אמת, ואז דרך להסביר אותו ברשתות בשניות ספורות.",
   built=["אפליקציית אנדרואיד (Capacitor) בעברית תחילה, עם אנגלית מלאה",
          "מודל זיהוי תנוחה שרץ על המכשיר: שלד על גבי הווידאו, ספירת חזרות מול יעד, ורמזי טכניקה בעברית (\"אגן למעלה\", \"טווח מלא\")",
          "אימון יומי, נקודות ורמות, רצפים, סטטיסטיקות ומפת גוף, 14 תוכניות לבית ולחדר כושר, ומאמן AI בצ'אט",
          "מנוי Pro עם מסך תשלום מובנה",
          "סדרת ריילס 9:16 בעברית ובאנגלית: פוטג' מיוצר ב-AI, עריכה תכנותית ב-Remotion עם השלד האמיתי של האפליקציה, כתוביות וכרטיס סיום"],
   result=["מוצר חי בחנות Google Play, עם אותו צוות שאחראי לקוד, לעיצוב ולסרטונים",
           "סרטון של 23 שניות שמציג את הפיצ'ר המרכזי כמו שהוא נראה באמת, בשתי שפות, בלי צילום בשטח"],
   tools=["Capacitor", "TypeScript", "MediaPipe", "Remotion", "Kling", "Python"], featured=1,
   media=dict(type="video", src="/work/boostcoach/promo-he.mp4", poster="/work/boostcoach/promo-he.webp", alt="ריל של BoostCoach: יום 1 לעומת יום 30 בשכיבות סמיכה", ratio="9 / 16"),
   tbd=["מספר הורדות או דירוג בחנות", "קישור לחנות Google Play"]),
 'en': dict(title="BoostCoach: a fitness app that counts reps with the camera", client="BoostCoach", year="2025–2026", services=["web", "video"],
   summary="A Hebrew-first Android app that counts reps and checks form through the phone camera, plus a series of social reels produced with the real product.",
   problem="People training at home, with no coach and no equipment, don't know if they're doing it right and lose motivation within a week. The product needed real-time feedback, and then a way to explain it on social in a few seconds.",
   built=["Android app (Capacitor), Hebrew first with full English",
          "On-device pose model: skeleton overlay, rep counter against a target, and form cues in plain language (\"Hips up\", \"Full range\")",
          "Daily workout, XP and levels, streaks, stats and body map, 14 home and gym programs, and an AI coach chat",
          "Pro subscription with an in-app paywall",
          "A series of 9:16 reels in Hebrew and English: AI-generated footage, programmatic editing in Remotion with the app's real skeleton, captions and end card"],
   result=["A live product on Google Play, with one team responsible for the code, the design and the videos",
           "A 23-second reel that shows the hero feature as it actually works, in two languages, without a shoot"],
   tools=["Capacitor", "TypeScript", "MediaPipe", "Remotion", "Kling", "Python"], featured=1,
   media=dict(type="video", src="/work/boostcoach/promo-en.mp4", poster="/work/boostcoach/promo-en.webp", alt="BoostCoach reel: day 1 versus day 30 of push-ups", ratio="9 / 16"),
   tbd=["Download count or store rating", "Google Play link"]),
}
W['lead-automation'] = {
 'he': dict(title="ליד מהאתר לאיש המכירות תוך שניות", client="חברת שירותים (שם הלקוח יפורסם באישור)", year="2025", services=["automation"],
   summary="חיבור טופס האתר ל-CRM, לוואטסאפ ולמשימות הצוות, כך שאף פנייה לא מתקררת.",
   problem="לקוחות השאירו פרטים באתר אבל המענה התעכב. לידים התקררו, פנו למתחרים, ולא היה סדר בטיפול בפניות.",
   built=["חיבור אוטומטי של טופס הפניות ל-CRM: כרטיס חדש או עדכון רשומה קיימת", "הודעת וואטסאפ ומייל אישיים ללקוח תוך שניות, עם תוכן שמותאם ב-AI לפי מה שכתב", "משימה אוטומטית לאיש המכירות במערכת הניהול, עם כל ההקשר", "טיפול בשגיאות והתראה לצוות אם משהו לא עבר"],
   result=["תגובה ראשונה ללקוח תוך שניות במקום שעות", "כל ליד מתועד באותו מקום, בלי העתק-הדבק", "זמן המכירה הולך למכירה, לא להקלדה"],
   tools=["n8n", "Fireberry", "WhatsApp Business API", "OpenAI API"], featured=2, media=NONE,
   tbd=["שם הלקוח ואישור פרסום", "נתון אחד אמיתי על זמן התגובה לפני ואחרי"]),
 'en': dict(title="From website lead to sales rep in seconds", client="Services company (name on approval)", year="2025", services=["automation"],
   summary="The website form wired to the CRM, WhatsApp and the team's tasks, so no enquiry goes cold.",
   problem="People left their details on the site, but the reply took hours. Leads went cold, called a competitor, and nobody could tell who was handling what.",
   built=["Form submissions create or update the record in the CRM automatically", "A personal WhatsApp and email to the customer within seconds, with wording adapted by AI to what they wrote", "A task for the sales rep in the team's system, with the full context attached", "Error handling and an alert to the team if anything fails"],
   result=["First reply in seconds instead of hours", "Every lead documented in one place, no copy-paste", "Sales time spent selling, not typing"],
   tools=["n8n", "Fireberry", "WhatsApp Business API", "OpenAI API"], featured=2, media=NONE,
   tbd=["Client name and permission to publish", "One real before/after number for response time"]),
}
W['digital-signatures'] = {
 'he': dict(title="חוזה לחתימה דיגיטלית בלחיצה אחת מה-CRM", client="AGN נדל\"ן (נדל\"ן ביוון)", year="2025", services=["automation"],
   summary="מהקלקה בכרטיס הלקוח ועד חוזה חתום ומתויק, בלי מיילים ובלי מעקב ידני.",
   problem="שליחת חוזים לחתימה נעשתה ידנית: מייל, מעקב, תזכורת, עוד מעקב. התהליך עיכב סגירת עסקאות ויצר חוויה מסורבלת ללקוח.",
   built=["כפתור בכרטיס הלקוח ב-CRM שמייצר את החוזה עם הפרטים ושולח לחתימה דיגיטלית", "מעקב סטטוס בזמן אמת: נצפה, נחתם, נדחה", "תזכורות אוטומטיות ללקוח כל עוד המסמך לא נחתם", "אחרי החתימה: המסמך נשלח ללקוח, מתויק בתיקייה ומעדכן את סטטוס העסקה"],
   result=["תהליך חתימה שלוקח דקות במקום ימים", "שליטה מלאה על כל החוזים הפתוחים במקום אחד", "חוויה מקצועית ללקוח בשלב הכי רגיש של העסקה"],
   tools=["Make", "CRM", "חתימה דיגיטלית", "Google Drive"], featured=3, media=NONE,
   quote=dict(text="מאז שהטמענו את iDone, תהליכים שבעבר לקחו שעות הפכו לאוטומטיים ומהירים. החיבור בין ה-CRM למערכת החתימות לא רק ייעל את העבודה, אלא גם יצר חווית לקוח טובה יותר.", who="צהלי, סמנכ\"לית שיווק ומכירות, AGN נדל\"ן"),
   tbd=["אישור מחודש לפרסום הציטוט והשם"]),
 'en': dict(title="Contracts signed digitally with one click from the CRM", client="AGN Real Estate (Greece)", year="2025", services=["automation"],
   summary="From a click on the customer record to a signed, filed contract, with no emails and no manual chasing.",
   problem="Contracts went out for signature by hand: an email, a follow-up, a reminder, another follow-up. Deals slowed down and the customer experience was clumsy at the most sensitive moment.",
   built=["A button on the CRM record that generates the contract with the customer's details and sends it for e-signature", "Real-time status tracking: viewed, signed, declined", "Automatic reminders to the customer until the document is signed", "After signing: the document goes to the customer, is filed in the right folder and updates the deal status"],
   result=["Signing takes minutes instead of days", "Every open contract visible in one place", "A professional experience for the customer at the point of commitment"],
   tools=["Make", "CRM", "E-signature", "Google Drive"], featured=3, media=NONE,
   quote=dict(text="Since we implemented iDone, processes that used to take hours became automatic and fast. Connecting the CRM to the signature system didn't just streamline the work, it created a better customer experience.", who="Tzahali, VP Marketing & Sales, AGN Real Estate"),
   tbd=["Re-confirm permission to publish the quote and the name"]),
}
W['whatsapp-chatbot'] = {
 'he': dict(title="צ'אטבוט וואטסאפ שעונה על השאלות שחוזרות", client="קו המים, מערכות טיהור מים", year="2024", services=["automation"],
   summary="בוט שמקבל את הפנייה, עונה על השאלות הנפוצות, אוסף פרטים ומעביר לנציג רק מה שצריך נציג.",
   problem="הצוות קרס תחת עומס של שאלות חוזרות בוואטסאפ: מחירים, זמינות, אזורי שירות. לקוחות חיכו, והנציגים לא הגיעו לפניות שבאמת דרשו אותם.",
   built=["צ'אטבוט בוואטסאפ עם תפריט ומענה טבעי לשאלות הנפוצות", "איסוף פרטי הפנייה ויצירת רשומה ב-CRM", "העברה חכמה לנציג אנושי עם כל ההיסטוריה כשצריך", "תיעוד כל שיחה לצורך שיפור המענה"],
   result=["תשובות מיידיות וענייניות ללקוחות, גם מחוץ לשעות הפעילות", "זמן הנציגים חוזר לפניות שמייצרות מכירות"],
   tools=["GreenAPI", "WhatsApp", "Make", "CRM"], media=NONE,
   quote=dict(text="לפני שהטמענו את הצ'אטבוט, היינו קורסים תחת עומס של שאלות חוזרות. מאז שהמערכת עלתה לאוויר, הלקוחות מקבלים תגובות מהירות, ענייניות ומקצועיות, ואנחנו מרוויחים גם זמן פנימי יקר וגם לקוחות מרוצים ונאמנים יותר.", who="שלומי, מנכ\"ל, קו המים"),
   tbd=["אישור מחודש לפרסום הציטוט והשם"]),
 'en': dict(title="A WhatsApp chatbot for the questions that keep coming back", client="Kav HaMayim, water purification systems", year="2024", services=["automation"],
   summary="A bot that takes the enquiry, answers the common questions, collects details and hands over to a human only when a human is needed.",
   problem="The team was drowning in repeated WhatsApp questions: prices, availability, service areas. Customers waited, and reps never got to the enquiries that actually needed them.",
   built=["A WhatsApp chatbot with a menu and natural answers to the frequent questions", "Collects the enquiry details and creates a CRM record", "Smart handover to a human rep with the full history when needed", "Logs every conversation so the answers keep improving"],
   result=["Instant, relevant answers for customers, outside office hours too", "Rep time goes back to enquiries that turn into sales"],
   tools=["GreenAPI", "WhatsApp", "Make", "CRM"], media=NONE,
   quote=dict(text="Before the chatbot we were collapsing under repeated questions. Since the system went live, customers get fast, relevant, professional replies, and we gain both valuable internal time and happier, more loyal customers.", who="Shlomi, CEO, Kav HaMayim"),
   tbd=["Re-confirm permission to publish the quote and the name"]),
}
W['finance-sync'] = {
 'he': dict(title="סליקה, חשבונית ו-CRM שמדברים ביניהם", client="עסקים שונים (חבילה חוזרת)", year="2024–2025", services=["automation"],
   summary="עסקה מאושרת מפיקה מסמך, שולחת אותו ללקוח, מעדכנת את ה-CRM ורושמת שורה לרואה החשבון. בלי יד אדם.",
   problem="נתק בין מערכת הסליקה להנהלת החשבונות יצר טעויות, כפילויות ועבודה ידנית שחורה בסוף כל חודש.",
   built=["זיהוי עסקה מאושרת דרך webhook ממערכת הסליקה", "הפקת חשבונית או קבלה אוטומטית במערכת הנהלת החשבונות", "שליחה למייל הלקוח ועדכון כרטיס הלקוח ב-CRM", "רישום שורה בגיליון ביקורת לרואה החשבון, ותזכורות גבייה לפי תאריכים"],
   result=["אפס הקלדה כפולה בין סליקה לחשבונאות", "תמונת מצב כספית עדכנית בתוך כרטיס הלקוח", "גבייה מסודרת בלי לרדוף אחרי תשלומים"],
   tools=["n8n", "Make", "Google Sheets", "CRM", "מערכת סליקה"], media=NONE,
   tbd=["שם לקוח אחד לדוגמה, באישור"]),
 'en': dict(title="Payments, invoices and CRM that talk to each other", client="Several businesses (a recurring package)", year="2024–2025", services=["automation"],
   summary="An approved payment issues the document, sends it to the customer, updates the CRM and logs a line for the accountant. No hands involved.",
   problem="A gap between the payment processor and the bookkeeping system meant errors, duplicates and a pile of manual work at the end of every month.",
   built=["Approved transactions detected through a webhook from the payment processor", "Invoice or receipt issued automatically in the accounting system", "Sent to the customer's email and recorded on the CRM customer card", "A line logged in an audit sheet for the accountant, plus scheduled payment reminders"],
   result=["No double entry between payments and bookkeeping", "An up-to-date financial picture inside the customer record", "Orderly collections without chasing"],
   tools=["n8n", "Make", "Google Sheets", "CRM", "Payment gateway"], media=NONE,
   tbd=["One named client example, on approval"]),
}
W['client-onboarding'] = {
 'he': dict(title="קליטת לקוח חדש שמתחילה לבד ברגע שהעסקה נסגרת", client="משרד שירותים (שם הלקוח יפורסם באישור)", year="2025", services=["automation"],
   summary="סימון \"נסגר\" ב-CRM מפעיל את כל תהליך הקליטה: מייל, טופס, תיקייה, משימה ופגישת התנעה.",
   problem="אחרי סגירת עסקה, ההתחלה עם הלקוח הייתה ידנית ומפוזרת: מיילים, איסוף פרטים, קביעת פגישות, יצירת תיקיות. זה יצר עיכובים ותחושה לא מקצועית בדיוק ברגע שבו צריך רושם ראשוני טוב.",
   built=["מייל ברוכים הבאים אישי עם הסבר על השלבים הבאים וקישור לטופס פרטים", "תיקייה משותפת שנוצרת אוטומטית ב-Google Drive", "משימה למנהל הפרויקט במערכת ניהול המשימות", "קישור לקביעת פגישת התנעה בזמינות אמת, ועדכון ה-CRM אחרי שנקבעה"],
   result=["קליטה אחידה ומהירה לכל לקוח חדש", "אפס שלבים שנשכחים", "זמן אדמיניסטרטיבי שחוזר לצוות"],
   tools=["Make", "Google Workspace", "ClickUp", "Calendly", "CRM"], media=NONE,
   tbd=["שם הלקוח ואישור פרסום"]),
 'en': dict(title="Client onboarding that starts itself the moment a deal closes", client="Professional services firm (name on approval)", year="2025", services=["automation"],
   summary="Marking a deal \"closed\" in the CRM kicks off the whole onboarding: email, form, folder, task and kick-off meeting.",
   problem="After a deal closed, getting started was manual and scattered: emails, collecting details, scheduling, creating folders. It caused delays and looked unprofessional right when a first impression matters most.",
   built=["A personal welcome email explaining next steps, with a link to a details form", "A shared Google Drive folder created automatically", "A task for the project manager in the team's task system", "A link to book the kick-off meeting from real availability, and a CRM update once it's booked"],
   result=["The same fast, consistent onboarding for every new client", "No forgotten steps", "Admin time handed back to the team"],
   tools=["Make", "Google Workspace", "ClickUp", "Calendly", "CRM"], media=NONE,
   tbd=["Client name and permission to publish"]),
}
W['idone-noc'] = {
 'he': dict(title="iDone NOC: ניטור מערכות והתראות בזמן אמת", client="מוצר פנימי של iDone", year="2025", services=["web", "automation"],
   summary="פלטפורמה שמנטרת את יציבות המערכות של לקוחות ומתריעה בסלאק ובוואטסאפ לפני שהלקוחות מרגישים.",
   problem="מערכות ואוטומציות שאנחנו מוסרים ללקוחות צריכות להמשיך לעבוד גם אחרי המסירה. בלי ניטור, הלקוח הוא זה שמגלה שמשהו נפל.",
   built=["ניטור רציף של זמינות ובריאות המערכות", "התראות קריטיות ישירות לצ'אט של הצוות: Slack ו-WhatsApp", "ניהול לוגים לאיתור מקור השגיאה", "חיבור לתשתית הקיימת של הלקוח (DevOps ready)"],
   result=["כל מערכת שאנחנו מוסרים מגיעה עם עיניים פקוחות", "בעיות מתגלות אצלנו לפני שהן מגיעות ללקוחות של הלקוח"],
   tools=["Python", "PostgreSQL", "Docker", "Slack API", "WhatsApp Business API"], media=NONE,
   tbd=["צילום מסך של הדשבורד", "קישור לעמוד המוצר, אם קיים"]),
 'en': dict(title="iDone NOC: system monitoring and real-time alerts", client="iDone internal product", year="2025", services=["web", "automation"],
   summary="A platform that watches the stability of our clients' systems and alerts on Slack and WhatsApp before their customers notice.",
   problem="Systems and automations we hand over have to keep working after the handover. Without monitoring, the client is the one who finds out something broke.",
   built=["Continuous uptime and health monitoring", "Critical alerts straight to the team's chat: Slack and WhatsApp", "Log management to trace the origin of errors", "Plugs into the client's existing infrastructure (DevOps ready)"],
   result=["Every system we ship comes with eyes on it", "Problems reach us before they reach our client's customers"],
   tools=["Python", "PostgreSQL", "Docker", "Slack API", "WhatsApp Business API"], media=NONE,
   tbd=["Dashboard screenshot", "Product page link, if any"]),
}
W['reports-dashboard'] = {
 'he': dict(title="דוח הנהלה שמכין את עצמו", client="חברת שירותים (שם הלקוח יפורסם באישור)", year="2024", services=["automation"],
   summary="נתונים מה-CRM, מהאנליטיקס ומהנהלת החשבונות מתרכזים לדשבורד אחד ונשלחים להנהלה בלי שאף אחד אוסף אותם ידנית.",
   problem="הפקת דוח חודשי דרשה איסוף ידני ממספר מערכות. זה גזל זמן, היה פתוח לטעויות, והתובנות הגיעו באיחור.",
   built=["תהליך אוטומטי ששואב נתונים מהמערכות דרך API", "ריכוז בבסיס נתונים מסודר", "דשבורד דינמי שמתעדכן לבד", "סיכום שנשלח במייל למנהלים בתדירות קבועה"],
   result=["החלטות על בסיס נתונים עדכניים במקום דוח מהחודש שעבר", "אפס שעות של העתקה מטבלה לטבלה"],
   tools=["Make", "Airtable", "Looker Studio", "Google Analytics"], media=NONE,
   tbd=["שם הלקוח ואישור פרסום", "צילום מסך מטושטש של הדשבורד"]),
 'en': dict(title="A management report that prepares itself", client="Services company (name on approval)", year="2024", services=["automation"],
   summary="Data from the CRM, analytics and accounting flows into one dashboard and reaches management without anyone collecting it by hand.",
   problem="The monthly report meant pulling numbers from several systems by hand. It took hours, invited mistakes, and the insights arrived late.",
   built=["An automated flow that pulls the key data from each system through its API", "A tidy central database", "A live dashboard that updates itself", "A summary emailed to managers on a fixed schedule"],
   result=["Decisions on this week's numbers instead of last month's report", "Zero hours copying from one sheet to another"],
   tools=["Make", "Airtable", "Looker Studio", "Google Analytics"], media=NONE,
   tbd=["Client name and permission to publish", "A blurred dashboard screenshot"]),
}
n = 0
for slug, locs in W.items():
    for loc, d in locs.items():
        p = os.path.join(ROOT, 'src', 'content', 'work', loc, slug + '.md')
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, 'w', encoding='utf-8') as f:
            f.write("---\n" + yaml(d) + "\n---\n")
        n += 1
print("written", n)
