# אפיון — תרגול דקדוק באנגלית

**פרויקט:** `C:\projects\EnglishQuiz`  
**מבוסס על:** `c:\projects\trivia`  
**מקור שאלות (ב-repo):**
- `data/more/` — Worksheets 1–5 (עברית) + Answer Keys
- `data/Worksheet_1–4_Questions.md` + `Worksheet_X_Answers.md`
- `data/more2/present_perfect.md`, `data/more2/conditional.md`

**מקור הסברים:** קבצי Answers + Answer Keys (+ `scripts/lib/hebrew-explanations.mjs`)

> קבצי ה-MD ב-`data/` נשארים ב-repo כמקור לבנייה (`npm run build:data`) — לא למחוק.

---

## שחקנים ודוח

רשימת השחקנים מוגדרת ב-`src/players.ts`.

| שחקן | אימייל |
|--------|-----|
| יהונתן | moshe.hoffman@gmail.com |
| גיא | tirza01@hotmail.com |

| פרמטר | ערך |
|--------|-----|
| בחירת שחקן | מסך פתיחה — "מי משחק?" (נשמר ב-localStorage) |
| ברירת מחדל | יהונתן |
| שליחה | FormSubmit — לאימייל של השחקן הנבחר; בסיום רמה, "למסך הראשי", סגירת דף |

---

## זרימת משחק

1. מסך פתיחה — בחירת שחקן + ברכה אישית + בחירת רמה (100 / 200 / 300)
2. שאלה אקראית — משפט עם blank + 6 אפשרויות
3. תשובה נכונה → +10, מעבר אוטומטי (3 שנ')
4. טעות ראשונה → −5, **פאנל הסבר** (לפי קטגוריה, דוגמאות בלבד), ניסיון שני
5. טעות שנייה → גילוי תשובה, מעבר (7 שנ')
6. שאלה שטעו בה חוזרת אחרי 3 שאלות
7. יעד ניקוד → מסך ניצחון

---

## שאלות

- **240 שאלות** (100 מ-more + 80 מ-Worksheets 1–4 + 40 present perfect + 20 conditionals)
- **ללא ID**, **עם category** לשליפת הסבר
- **ללא רמזים** בסוגריים — `(never / be)` וכו' מוסרים
- שאלות כפולות: תשובה משולבת (`was studying / was making`, `in / in`, `rains / will stay`)
- 6 מסיחים לכל שאלה

## מסיחים (distractors)

מחולל: `scripts/lib/distractors.mjs` — רץ בכל `npm run build:data`.

### עקרונות

1. **מבוסס על הפועל בתשובה הנכונה** — לא מאגר סטטי לפי קטגוריה בלבד.
2. **אנגלית תקינה בלבד** — כל מסיח חייב להיות צירוף דקדוקי אמיתי שיכול להיות תשובה נכונה **בהקשר אחר** (זמן/גוף אחר), לא צירוף שבור.
3. **טעויות נפוצות בישראל** — רק כשהן עדיין אנגלית תקינה (למשל `haven't finished` במקום `hasn't finished`, או `finished` במקום Present Perfect).

### דוגמה — Present Perfect שלילי

שאלה: `He __________ his homework yet.`  
תשובה: `hasn't finished`

| מסיח | למה |
|------|-----|
| `finished` | Past Simple |
| `finishes` | Present Simple |
| `is finishing` | Present Continuous |
| `had finished` | Past Perfect |
| `has finished` | Present Perfect חיובי |

**אסור:** צירופים לא תקינים כמו `hasn't finishing`, `hasn't finish`, `hasn'ted finished`.

### תשובות כפולות (`have / known`)

שאלות עם שני חסרים — כל חלק מקבל היסחים משלו:
- חלק 1 (עזר): `have` → `has`, `had`, `do`, `does`…
- חלק 2 (פועל): `known` → `know`, `knew`, `knows`, `knowing`…
- חובה שיהיו היסחים שמשנים **כל חלק בנפרד** וגם **שני החלקים יחד**

**אסור:** כל ההיסחים עם אותו חלק 1 (למשל רק `have / …`) או צירופים לא תקינים (`have / is knowing`).

### מימוש טכני

- `parseHaveAnswer()` — מזהה גם קיצורים: `hasn't`, `haven't`, `hadn't`, `have not`
- `validTensePhrases()` — מייצר הטיות תקינות של אותו פועל (Simple, Continuous, Perfect, שלילות, עתיד)
- `detectType()` — לא מטפל בקיצורי עזר (`hasn't`) כפועל רגיל
- ביקורת: `scripts/audit-distractors.mjs`

## הסברים

- מאגר נפרד: `explanations.json`
- מפתח = `category`
- **רק אחרי טעות ראשונה** — לא מכיל את התשובה הנכונה, רק הסבר + דוגמאות
- עברית **בלי ניקוד**

---

## קבצים

```
scripts/build-data.mjs          → questions.json + explanations.json
scripts/lib/distractors.mjs     → מחולל מסיחים
scripts/lib/hint-answers.mjs    → תשובות מ-hints (more2)
scripts/audit-distractors.mjs   → ביקורת איכות מסיחים
data/                           → מקור MD (לא למחוק)
public/questions.json
public/explanations.json
src/game.ts                     → 6 אפשרויות, פאנל הסבר
```

---

## פריסה

GitHub Pages — `base: '/EnglishQuiz/'` ב-Vite, workflow ב-`.github/workflows/`.
