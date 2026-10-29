# יומן בנייה של ה-CRM · iDone Technologies

> כאן נרשם כל מזהה שנוצר בבנייה לפי פרק 7 ב-`docs/03-crm-plan.md`: טבלאות, שדות, Views, Data Tables, Workflows ו-Webhooks, וגם מה נבדק בכל שלב.
> ב-n8n תמיד משתמשים במזהי השדות (`fld…`) ולא בשמות.

**Base:** iDone CRM `appln4aJd00Ai38eL`. ארבע הטבלאות הישנות (לידים, הסרות מדיוור, יומן שליחות, אפיונים) לא שונו.
**n8n:** `n8n.idone.co.il`, פרויקט אישי `jPVF2rwC197qj1pk`.

**מזהים קיימים לשימוש חוזר:** Israeli Phone Formatter `AUmkM9BXiPoWCyFC` · Send Whatsapp from iDone `GUzpL6bRdpQ6kGQw` · Links Shorter `gU3dKT7XBvgC5jib` · Error Handler `tD6fj0TGkLPMbn4U` · Airtable credential `GS3dmOWJX3ueZoIu` · Gmail credential `Wg9QwoUC52CPMdq4`.

---

## שלב 1 · טבלאות ליבה (29.10.2026) · הושלם

### החלטות שאושרו לפני הבנייה

1. **השם "אפיונים" תפוס**, לכן הטבלה החדשה נקראת "אפיונים · חדש". בשלב 15 היא תקבל את השם "אפיונים".
2. **שדה ראשי מסוג נוסחה** אי אפשר ליצור דרך ה-MCP, וגם לא למחוק שדה ראשי. בארבע טבלאות (פניות, הזדמנויות, אפיונים · חדש, הסכמות דיוור) נוצר שדה ראשי זמני מסוג טקסט. בממשק של Airtable (בדפדפן, אחרי שכפיר התחבר) הסוג הוחלף לנוסחה עם ערך זמני `1`, ואת הנוסחה האמיתית כתבתי דרך ה-MCP (`update_field` מעדכן נוסחה רק בשדה שכבר מסוג נוסחה). המזהה של השדה לא השתנה בהמרה.
3. **Views** אי אפשר ליצור דרך ה-MCP, רק לעדכן. התצוגות נוצרו ריקות בממשק, ואת המסננים, המיון והקיבוץ הגדרתי דרך ה-MCP. **כפתורים** עוברים לשלב 7.
4. **שדות שתלויים בטבלאות משלבים מאוחרים** נוספים בשלב של הטבלה שלהם (ראו "נדחה" בהמשך).
5. **"הפנה את":** קישור לאותה טבלה כן יוצר שדה מקביל, ולכן השדה נבנה כמו בתכנון.
6. **"טווח תקציב"** לא נוצר עד שתתקבל החלטה (פרק 8, שאלה 9).

### טבלאות Airtable

#### אנשי קשר `tbll9cTlosAU5YDDD`

| שדה | מזהה | סוג |
|---|---|---|
| שם מלא (ראשי) | `fldrgXZZlWoXE87HR` | טקסט |
| שם פרטי | `fldaVT6IwF8WcALRK` | טקסט |
| מייל | `fldmkpoS5zvHKKRny` | מייל |
| טלפון | `fldalF9BvKnatgyg3` | טלפון |
| טלפון בינלאומי | `fldcMU1UXG5On0CCO` | טקסט |
| שפה מועדפת | `fldLIbLS5k9JJIJKa` | בחירה |
| עסק | `fld6YWrGrsZ9Vt6EH` | קישור ← עסקים |
| תפקיד | `fldgBzH7VZJHGtgMK` | טקסט |
| מקור ראשון | `fldOgQpxsetwqZzb2` | בחירה |
| הופנה על ידי | `fld6bmV2yRGRtcKmI` | קישור ← אנשי קשר |
| הפנה את | `fldCF7Onj4XpYXFpl` | קישור (הצד ההפוך) |
| איש קשר לחיוב ב | `fldVj7m6PC77b9ZtZ` | קישור (הצד ההפוך של עסקים · איש קשר לחיוב) |
| מצב דיוור במייל | `fldoyk4Y9q5RhKqpM` | בחירה |
| מצב דיוור בוואטסאפ | `fldXfWIl9TAs7CiAg` | בחירה |
| חסימה מלאה | `fldHxdv598qt8XdON` | תיבת סימון |
| שלב במחזור החיים | `fldOyILdUgmq7yWG8` | נוסחה (חלקית עד שלב 12) |
| הזדמנויות | `fldb7qsx6OrEdzxNg` | קישור |
| הזדמנויות פתוחות | `fldqAcWxsK3g9W86D` | rollup `SUM` על "פתוחה?" |
| פניות | `fldF1PM8JLw26C6TH` | קישור |
| פנייה ראשונה | `fldOg2qrftostzCu6` | rollup `MIN` על "תאריך" |
| פנייה אחרונה | `fldGCAlHLOdfcS8yI` | rollup `MAX` על "תאריך" |
| הודעה אחרונה | `fldOqclnuuLoS9dSv` | תאריך ושעה |
| פעילות אחרונה | `fldJX58mXgyPZZYHw` | נוסחה |
| שמירה מעבר לשנה | `fldULgSDq5E35ok4r` | תיבת סימון |
| סיבת שמירה | `fldZt58YnDCAGoG3g` | טקסט |
| הסכמות דיוור | `fldxnudaJgcVJorjk` | קישור |
| טוקן | `fldquNXsuZ6y551j7` | טקסט |
| לינק העדפות דיוור | `fldyupHUcjGhJQnTz` | נוסחה |
| לינק הפניה | `fldqAc19rfagzYMvN` | נוסחה |
| מצב רשומה | `fldJLkiooLGjB28ls` | בחירה |
| מזהה ישן | `fldBSCDGr1MAhHcoU` | טקסט |
| הערות | `fldAZCLWNaZ9trepA` | טקסט ארוך |
| נוצר ב | `fldeh8yrG2denAlLl` | זמן יצירה |
| עודכן ב | `fldHNtaYU2mncEbMp` | שינוי אחרון |

**"פעילות אחרונה":** `MAX()` לא מחזיר תאריך, אז הנוסחה משווה זמני Unix:
`DATETIME_PARSE(MAX(IF({הודעה אחרונה},VALUE(DATETIME_FORMAT({הודעה אחרונה},'X')),0),IF({פנייה אחרונה},VALUE(DATETIME_FORMAT({פנייה אחרונה},'X')),0),VALUE(DATETIME_FORMAT({עודכן ב},'X'))),'X')`

#### עסקים `tblWQBc68NclHwDXR`

| שדה | מזהה | סוג |
|---|---|---|
| שם העסק (ראשי) | `fld5ZEvl5GJB9qMXQ` | טקסט |
| תחום | `fldTfuRAyhKmK0mCl` | טקסט |
| גודל צוות | `fld4sJxSUNt6jNhcv` | בחירה |
| אתר | `fldrJNC91t9gnSR5m` | URL |
| מספר עוסק / ח.פ | `fldVV0VWRvNbX7qsz` | טקסט |
| שם לחשבונית | `fld5rYWqZgOj89bTF` | טקסט |
| כתובת לחשבונית | `fldaI8UJ3Y9mEUb2N` | טקסט ארוך |
| מייל לחשבוניות | `fldDmwcSbvg6e1IgK` | מייל |
| אנשי קשר | `fldEMYJsADbF1aT81` | קישור (הצד ההפוך של "עסק") |
| איש קשר לחיוב | `fldev5JQjRwrvFulB` | קישור ← אנשי קשר |
| הזדמנויות | `fldfItIJCR7holyKK` | קישור |
| הערות | `fldSFB4ul1cOnnhWV` | טקסט ארוך |

#### פניות `tblssafvUkon9Abzi`

| שדה | מזהה | סוג |
|---|---|---|
| מזהה (ראשי) | `fldLKsZnhdvsJWB3P` | טקסט זמני, יומר לנוסחה |
| מספר | `fldgwhvFq06xKJ1G7` | מספור אוטומטי |
| תאריך | `fld7NwRfT5mX365sO` | תאריך ושעה |
| ערוץ | `fldynT4aza8RBGAaC` | בחירה |
| שם שנמסר | `fld7kIWqn9QxHw64p` | טקסט |
| מייל שנמסר | `fldl7dJqz0VGxbHMy` | מייל |
| טלפון שנמסר | `flddMgNPv6XyEESXN` | טלפון |
| שירותים מבוקשים | `fldLV7Ge8QA0BZI7J` | בחירה מרובה |
| הודעה | `fldXtmgDPkUlHa8Nl` | טקסט ארוך |
| שפה | `fldlFwXMmhb14mDKH` | בחירה |
| עמוד מקור | `fldv8ywzeT60dvzZ8` | טקסט |
| UTM מקור | `fldXWh1W9a90UyxyQ` | טקסט |
| UTM ערוץ | `fldFNXafX5TswYD4V` | טקסט |
| UTM קמפיין | `fldIUfZUOFuRK0AnG` | טקסט |
| קוד הפניה | `fldyAzfesPhq71hO1` | טקסט |
| סימן הסכמה לדיוור | `fldLtRFLPNZi9RcY4` | תיבת סימון |
| גרסת הודעת פרטיות | `fldpAgpktjXHjd9Mt` | טקסט |
| דפדפן | `fldazlUWqsFcT7ZXG` | טקסט |
| איש קשר | `fldp5xXNx0z4wneKo` | קישור ← אנשי קשר |
| הזדמנות | `fldB7iv8VYZAAvPDc` | קישור ← הזדמנויות |
| סטטוס עיבוד | `fld6n5ScRJh3et75D` | בחירה |
| מזהה גולמי | `fld8kL9ZF66sjYAOC` | טקסט |

#### הזדמנויות `tbl7NEenEZ1TTURlz`

| שדה | מזהה | סוג |
|---|---|---|
| שם (ראשי) | `fldzXu5HD3jKWRcCY` | טקסט זמני, יומר לנוסחה |
| מספר | `fldV9JuipUFEaBYku` | מספור אוטומטי |
| איש קשר | `fld3zhwPr760PFPLs` | קישור ← אנשי קשר |
| שם איש קשר | `fldwev7BrFw4aLqsE` | lookup |
| טלפון | `fld1KY33tuAmVMxzr` | lookup |
| מייל | `fld6irc3VCJwZyKZM` | lookup |
| שפה | `fldTQJft5d7RWisvI` | lookup |
| עסק | `fldllW14n7QvkJkir` | קישור ← עסקים |
| שם העסק | `fld1nmhEu5jBWgjgp` | lookup |
| פניות | `fldsv7y6oZtf7af1W` | קישור |
| מקור | `fldftxpcVyQc7XZbd` | lookup של "ערוץ" מהפנייה הראשונה (מיון לפי תאריך, רשומה ראשונה) |
| שירותים | `fldS06tI0oVXCrpG6` | בחירה מרובה |
| שלב | `fldl5MY0Vtan7Jlvl` | בחירה (16 ערכים) |
| שלב עודכן ב | `fldgSB4Gpx6YrqFTG` | שינוי אחרון של "שלב" |
| ימים בשלב | `fldLlJdRt6yr8MjKn` | נוסחה |
| פתוחה? | `fld8qykMJxDIKGkMS` | נוסחה (1/0) |
| חום | `fldCwD8cUHqmqrba7` | בחירה |
| אחראי | `fldYmGX0r5i1VCtpn` | משתף פעולה |
| מתי להתחיל | `fldcVQNPTndREnbSg` | lookup מאפיונים |
| שווי משוער | `fld2ciA7kLaI5wXC6` | מטבע ₪ |
| פעולה הבאה | `fldEMm2tFxXnnBq7A` | טקסט |
| תאריך פעולה הבאה | `fldJeZhxYq9K3t3lL` | תאריך |
| לחזור ב | `flduNm5G9xlfaNL9o` | תאריך |
| עצור תזכורות אוטומטיות | `fldGoAjEo8AniOkLJ` | תיבת סימון |
| תזכורות בשלב הנוכחי | `fldDKSmMDfbTCNSJ3` | מספר |
| תזכורת אחרונה | `fldF5pRaTmTgKWiti` | תאריך ושעה |
| סיבת הפסד | `fld3PeiTfuevRWbUR` | בחירה |
| פירוט סיבה | `fldaGRULDuNdtbyl4` | טקסט ארוך |
| תאריך סגירה | `fld9zATdE9KfQsPzJ` | תאריך |
| אפיונים | `fldwPPILuAFrRgFJS` | קישור |
| משימות | `fldfcnuImLxNl77Iz` | קישור |
| טוקן | `fldq5E7byw0Jkwdqr` | טקסט |
| לינק אפיון | `fldPAoPdKHAfPavHR` | נוסחה |
| לינק לקביעת פגישה | `fldg6gbaIc0csLPQC` | נוסחה (Cal.com עם `metadata[deal]`, שם ומייל) |
| לינק לרשומה | `fldtcNnGUQUrO7HxJ` | נוסחה (לינק לגריד עד שיהיה Interface בשלב 7) |
| נוצר ב | `fldrvKihTxfyKPNaK` | זמן יצירה |

ב-lookups משתמשים ב-`ARRAYJOIN()` לפני השוואה או חיבור מחרוזות, כי lookup מחזיר מערך.

#### אפיונים · חדש `tbl48TAdW0tAUaSDy`

| שדה | מזהה | סוג |
|---|---|---|
| מזהה (ראשי) | `fldBrhVzNEqmQuVyR` | טקסט זמני, יומר לנוסחה |
| מספר | `fldtUNXFaDMxAOVai` | מספור אוטומטי |
| הזדמנות | `fldnkBGKP10pzZYxf` | קישור ← הזדמנויות |
| שם מלא | `fldBfOLlvbssSCj4s` | טקסט |
| שם העסק | `fld0zvEWZIe7ZqgNK` | טקסט |
| מייל | `fldaTXiSeLLc7bIbJ` | מייל |
| טלפון | `fldNkiwiKlFkFhD7d` | טלפון |
| מה העסק עושה | `fldgpk42iLInGBfsX` | טקסט ארוך |
| גודל צוות | `fld4wcehHB2cLHsCR` | בחירה |
| אתר קיים | `fld28FfeK3OZuqwio` | URL |
| שירותים | `fldMElIHiAFxJdkYU` | בחירה מרובה |
| מה לבנות | `fld8L30O8En8OYHBd` | בחירה מרובה |
| ערוצי וידאו | `fldvRwgw1ZNjWDi9n` | בחירה מרובה |
| היקף וידאו | `fldQ56Hr0G48L55Y9` | בחירה |
| משימות לאוטומציה | `fldaki3deQxHUFNbx` | בחירה מרובה |
| כלים קיימים | `fldo0dGKDgxABIMxx` | טקסט ארוך |
| הבעיה העיקרית | `fldFhWg9YJw2u3LBz` | טקסט ארוך |
| מתי להתחיל | `fldicQKmN2SeavXlH` | בחירה |
| שפה | `fldtO2p0zlZxIgG21` | בחירה |
| מילוי על ידי | `fldw3zOUeoga1h1xp` | בחירה |
| תאריך מילוי | `fldmBZo3E9bcYVfkK` | תאריך ושעה |

#### משימות `tblrAg8hG3U9OGnAY`

| שדה | מזהה | סוג |
|---|---|---|
| משימה (ראשי) | `fldwlpJYb6wOI8pqw` | טקסט |
| סוג | `fld7UftI5kiDkklzs` | בחירה |
| הזדמנות | `fldQBDE2UIBjjlQf3` | קישור ← הזדמנויות |
| אחראי | `fld6aNH1hhjAu7Xm3` | משתף פעולה |
| תאריך יעד | `fldtdu80fSoBTt3Mr` | תאריך |
| סטטוס | `fldjVAiUTf9HF35SF` | בחירה |
| נוצרה על ידי | `fld5N41Sk6sLo7YBE` | בחירה |
| באיחור | `fldRwUEO9BRzk5rOR` | נוסחה |
| הערות | `fldvbftFxsEM1Drdl` | טקסט ארוך |

#### הסכמות דיוור `tbljd9fUn7QClpGht`

| שדה | מזהה | סוג |
|---|---|---|
| מזהה (ראשי) | `fldDvAP36IU2OZ7Ny` | טקסט זמני, יומר לנוסחה |
| איש קשר | `fldzNY47bR9vxPbqh` | קישור ← אנשי קשר |
| ערוץ | `fldIQH4lxudcCmfOX` | בחירה |
| פעולה | `fldi6vQxFraSe0sKp` | בחירה |
| תאריך | `fldfPtBstMfTitW8R` | תאריך ושעה |
| מקור | `fld2e3vAwo01s4VGr` | בחירה |
| נוסח שהוצג | `fldSVbdy7d5JfbFuT` | טקסט ארוך |
| גרסת נוסח | `fldlDJaPqmvmG4LPC` | טקסט |
| עמוד / הודעה | `fldQ2SareRuiOhN5M` | טקסט |
| IP | `fldfLruImLbpcDfjq` | טקסט |
| דפדפן | `fld05S1uZmITUvjhn` | טקסט |
| גיבוב מזהה | `fld1ON3mTd9rQYee7` | טקסט |
| בוצע על ידי | `fldpUx8pRKZzMNSMu` | טקסט |

#### תבניות הודעות `tblRsooimzI4dvkoW`

| שדה | מזהה | סוג |
|---|---|---|
| מפתח (ראשי) | `fldfuvKLWp4RaDkO4` | טקסט |
| שם | `fld9INLuMc8ggzfij` | טקסט |
| ערוץ | `fld0K2AQdF65bSYS2` | בחירה מרובה |
| קהל | `fldxuMrk96ekPs3v4` | בחירה |
| קטגוריה | `fldbOQaZmlw9opUXn` | בחירה |
| שלב במסע | `fldm2GnQIrMag8Vnl` | בחירה |
| נושא מייל (עברית) | `fldUdbvJrCaKgUH18` | טקסט |
| נושא מייל (English) | `fldkHrwOqDRnaDKfR` | טקסט |
| קובץ תבנית מייל | `fldxbjOtdu2BdnBRG` | טקסט |
| וואטסאפ (עברית) | `fldqy8yBqql3kqYrk` | טקסט ארוך |
| וואטסאפ (English) | `fldCX5pVtqXVzhHxf` | טקסט ארוך |
| משתנים | `fldeSXTkng94Rtadj` | טקסט |
| פעילה | `fld5UmhdriNP5DFeQ` | תיבת סימון |

### Views

| טבלה | View | מזהה | הגדרה |
|---|---|---|---|
| הזדמנויות | צנרת מכירה (Kanban לפי "שלב") | `viwsgVYDHSXtByaRI` | פתוחה? = 1. מיון לפי תאריך פעולה הבאה. בכרטיס: שם, שירותים, חום, אחראי, תאריך פעולה הבאה, ימים בשלב |
| הזדמנויות | דורש פעולה היום | `viwC91UFHbCn91aXa` | פתוחה? = 1, תאריך פעולה הבאה ≤ היום. הספים לפי שלב יתווספו עם WF-12 (שלב 7) |
| הזדמנויות | תקועות | `viwGkgllnS1az6GYn` | פתוחה? = 1, ימים בשלב ≥ 7. מיון יורד |
| הזדמנויות | מוקפאות לחזרה | `viwm0qVl9XlEErTk9` | שלב = מוקפא. מיון לפי "לחזור ב" |
| הזדמנויות | נסגרו החודש | `viwp746j88VvMHMZo` | שלב זכייה / הפסד, תאריך סגירה בחודש הנוכחי. קיבוץ לפי סיבת הפסד |
| הזדמנויות | תור תזכורות (ל-n8n) | `viwm4FJl9UAEHGiB7` | פתוחה? = 1, בלי "עצור תזכורות", ובשלבים פנייה חדשה, אפיון נשלח, אפיון התקבל, הצעה נשלחה, הסכם נשלח, מוקפא. **WF-12 תלוי ב-View הזה** |
| פניות | פניות אחרונות | `viwxpAvnOUUazNo1t` | 30 יום אחרונים. מיון יורד |
| פניות | שגיאות וספאם | `viwbnOTcRz7sNGzGf` | סטטוס עיבוד: כפילות / ספאם / שגיאה |
| משימות | המשימות שלי | `viwP2HBayVotCN6Xy` | לא הושלם / בוטל, אחראי = iDone Automations `usrGUe22InlaYQDNl` (המשתמש היחיד ב-Base). מיון לפי תאריך יעד. כשיצטרף עוד איש צוות, כל אחד יקבל View משלו |
| משימות | באיחור | `viwQKCCXS3r4p8aHA` | "באיחור" לא ריק |
| הסכמות דיוור | הסרות אחרונות | `viwITLETcL1XJtzoS` | פעולה = הסרה, 30 יום |

ה-Views של "יומן הודעות" (כשלונות, חסימות) לא נבנו ב-Airtable, כי הטבלה נמצאת ב-n8n. את הסינון שלהם יעשו ה-Workflows.

### Data Tables ב-n8n

| Data Table | מזהה | עמודות |
|---|---|---|
| `crm_message_log` (יומן הודעות) | `qrle92Lq1T0qK7Mu` | description, sent_at (date), contact_id, deal_id, project_id, template_key, dedupe_key, channel, direction, category, recipient, status, provider_message_id, error, workflow, execution_id |
| `crm_raw_submissions` (נתונים גולמיים) | `oJJhalvxkmeqyvjA` | received_at (date), source, workflow, execution_id, payload, inquiry_id, contact_id, processed (boolean) |
| `crm_settings` (הגדרות) | `l4WmhKh2tP6GvVlz` | key, value, description, updated_at (date) |

**שורות ב-`crm_settings`:**
- **מתוך New Lead:** `site_url`, `team_phone`, `team_email`, `reply_to_email`, `sender_name`, `whatsapp_url`.
- **ברירת מחדל מהתכנון:** `reminder_days`.
- **ריקות, מסומנות `[להשלמה]`:** `work_days_hours`, `holidays`, `team_action_key`. את `team_action_key` ממלאים בשלב 7.

### נדחה לשלבים הבאים

| שדה | טבלה | שלב |
|---|---|---|
| פרויקטים פעילים, פרויקטים שהושלמו, וגרסה מלאה של "שלב במחזור החיים" | אנשי קשר | 12 |
| סה"כ שולם | אנשי קשר, עסקים | 11 |
| משובים והמלצות | אנשי קשר | 13 |
| בקשות פרטיות | אנשי קשר | 14 |
| פרויקטים | עסקים | 12 |
| פגישות | הזדמנויות | 8 |
| הצעות מחיר, שווי הצעה מאושרת | הזדמנויות | 9 |
| הסכמים | הזדמנויות | 10 |
| תשלומים, סה"כ שולם, יתרה לתשלום | הזדמנויות | 11 |
| פרויקט, פרויקט פעיל?, פרויקט הושלם? | הזדמנויות | 12 |
| כפתורים: נוצר קשר / סגור כהפסד / הקפא | הזדמנויות | 7 |
| פרויקט, אבן דרך | משימות | 12 |
| טווח תקציב | אפיונים · חדש | אחרי החלטה (שאלה 9) |

### מה נבדק

**רשומות בדיקה:**
- 2 אנשי קשר: אחד עם `kfir.kanizo@gmail.com` והטלפון של כפיר, והשני "ממליץ".
- עסק אחד.
- 2 הזדמנויות: אחת פתוחה, אחת בשלב "הפסד".
- 2 פניות, בתאריכים 20.10 ו-28.10.
- אפיון אחד.
- 3 משימות: באיחור, הושלם, עתידית.
- הסכמה אחת.

| בדיקה | תוצאה |
|---|---|
| קישורים דו-כיווניים (עסק, הופנה על ידי / הפנה את, פניות, הזדמנויות, אפיונים, משימות, הסכמות) | עובר |
| lookups בהזדמנות (שם, טלפון, מייל, שפה, שם העסק, מתי להתחיל) | עובר |
| "מקור" מחזיר את הערוץ של הפנייה המוקדמת (טלפון, 20.10) ולא של המאוחרת | עובר |
| "פתוחה?": 1 לפתוחה, 0 להפסד. "הזדמנויות פתוחות" באיש הקשר = 1 | עובר |
| "שלב במחזור החיים": "ליד פתוח" / "ליד סגור" | עובר |
| פנייה ראשונה 20.10 / פנייה אחרונה 28.10 | עובר |
| "פעילות אחרונה" לוקחת את המאוחר מבין שלושת התאריכים (בדיקה עם "הודעה אחרונה" עתידית) | עובר |
| לינקים לפי שפה: `/he/` ואחרי שינוי ל-English `/en/` (אפיון, העדפות) | עובר |
| לינק Cal.com עם טוקן, ושם ומייל מקודדים | עובר |
| "באיחור" במשימות: רק במשימה פתוחה שתאריך היעד שלה עבר | עובר |
| שורות ההגדרות נקראות מ-`crm_settings` | עובר |
| נוסחאות השדה הראשי: `P-2 · בדיקה כפיר`, `D-1 · בדיקה כפיר · בדיקה · עסק`, `D-2 · בדיקה כפיר` (בלי עסק), `A-1 · בדיקה כפיר`, `הסכמה · מייל · 29/10/2026` | עובר |
| "באיחור" (משימות) מציגה רק את המשימה הפתוחה שעבר התאריך שלה | עובר |
| "צנרת מכירה" מציגה רק את ההזדמנות הפתוחה, בעמודת "אפיון נשלח" | עובר |
| מחיקת 14 רשומות הבדיקה בסוף השלב (2 אנשי קשר, עסק, 2 הזדמנויות, 2 פניות, אפיון, 3 משימות, הסכמה) | בוצע |

**לא נבדק:** כתיבה ומחיקה ב-Data Tables של יומן ההודעות והנתונים הגולמיים. ב-MCP אין כלי למחיקת שורות, ולכן לא נכתבה בהן שורת בדיקה שאי אפשר יהיה לנקות. זה ייבדק דרך Workflow בשלב 2.

**הערה:** שדות הזמן של המערכת (נוצר ב, עודכן ב, שלב עודכן ב) מוצגים בפורמט מקומי של 12 שעות. ה-MCP לא מאפשר לשנות את הפורמט שלהם. אפשר לשנות אותו בממשק, וזה משפיע רק על התצוגה.
