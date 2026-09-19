<h1 align="center">TypingChinese</h1>

<p align="center">
  <a href="/README.md">English</a> |
  <a href="/docs/README.zh-CN.md">简体中文</a> |
  <a href="/docs/README.zh-TW.md">繁體中文</a> |
  <a href="/docs/README.es.md">Español</a> |
  <a href="/docs/README.pt.md">Português</a> |
  <a href="/docs/README.fr.md">Français</a> |
  <a href="/docs/README.de.md">Deutsch</a> |
  <a href="/docs/README.ru.md">Русский</a> |
  <a href="/docs/README.uk.md">Українська</a> |
  <a href="/docs/README.ja.md">日本語</a> |
  <a href="/docs/README.ko.md">한국어</a> |
  <a href="/docs/README.th.md">ไทย</a> |
  <a href="/docs/README.vi.md">Tiếng Việt</a> |
  <a href="/docs/README.id.md">Bahasa Indonesia</a>
</p>

<p align="center">
  <b>Lerne Chinesisch Taste für Taste: tippe das Pinyin, höre den Ton, behalte das Wort. Ein Open-Source-Werkzeug zum Üben chinesischer Wörter und Texte.</b>
</p>

## Online-Demo

<https://www.typingchinese.club>

## Funktionen

### Worttraining

- **Vier Übungsmodi**: Mitlesen (Hanzi sehen, Pinyin tippen), Diktat (nur hören), Selbsttest (Pinyin ist gegeben, Wort produzieren) und Schreiben nach Bedeutung (nur die Übersetzung wird angezeigt)
- **Drei Schreibmodi**: vollständiges Pinyin `zhongguo`, Initialen `zg` oder Töne `zhong1 guo2`
- **Zwei Eingabearten**: lateinische Buchstaben auf einer englischen Tastatur mit sofortiger Korrektur pro Buchstabe, oder Hanzi mit dem chinesischen IME (Microsoft Pinyin u. a.) und Bewertung pro Wort
- Pinyin mit Tonzeichen, chinesische Sprachausgabe und Übersetzung bei jedem Wort
- Jedes Wort beliebig oft wiederholen; falsch getippte Wörter können automatisch geleert und neu getippt werden

### Texttraining

- Eingebaute Texte vom Anfänger- bis zum Mittelstufenniveau (von kurzen Sätzen bis zu kleinen Fabeln)
- Eigene Texte hinzufügen: Text einfügen und Satz für Satz tippen
- Jeder Satz wird beim Tippen vorgelesen, sodass sich Lesen, Hören und Schreiben gegenseitig verstärken

### Fehler, Wiederholungen, Statistik

- Jedes falsch geschriebene Wort landet automatisch im Fehlerheft
- Wiederholungen werden mit **FSRS** (Free Spaced Repetition Scheduler) geplant; der tägliche Wiederholungsanteil ist einstellbar
- Die Statistikseite erfasst Tagesziel, Wörter pro Tag, Lernzeit, Genauigkeit und Tastenanschläge

### Vielfach anpassbar

- Tastatur-Soundeffekte und Tippgeräusche, Lautstärke und Sprechtempo einstellbar
- Eigene Tastenkürzel: Wiederholen-Taste (<kbd>Tab</kbd> / <kbd>F2</kbd>) und Weiter-Taste (<kbd>Leertaste</kbd> / <kbd>Enter</kbd>)
- Virtuelle Bildschirmtastatur, helles / dunkles / systemabhängiges Design
- **14 Oberflächensprachen**: die Oberfläche folgt deiner Wahl, die Lerninhalte bleiben immer Chinesisch

### Klar und effizient

- Moderne Oberfläche ohne Werbung
- Läuft vollständig im Browser: kein Konto, kein Backend, keine Registrierung
- Der gesamte Lernstand wird lokal im `localStorage` gespeichert

### Wörterbücher

Eingebaut: **Alltagswörter** (59), **Fortgeschrittener Wortschatz** (51), **Vier-Zeichen-Idiome** (40).

Eigene mitbringen: Liste einfügen oder `.json` / `.csv` / `.txt` hochladen. Ein Eintrag pro Zeile, das Pinyin wird automatisch erzeugt:

```
中国,国家名称
旅行 lv you
安静=没有声音
```

Siehe `sample-words.csv` für ein importfertiges Beispiel.

## Lokal ausführen

Das Projekt basiert auf Next.js und benötigt Node.js 18 oder neuer.

```bash
git clone https://github.com/CodeTrainerMan/typingchinese.git
cd typingchinese/web
npm install
npm run dev
```

Dann <http://localhost:3000> öffnen.

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Entwicklungsserver starten |
| `npm run build` | Produktions-Build |
| `npm run start` | Produktions-Build ausliefern |
| `npm run lint` | ESLint |
| `npm run gen:dict` | `public/dicts/*.json` aus `scripts/seed-words.mjs` neu erzeugen |

## Projektstruktur

```
web/                    Next.js-Anwendung (die einzige bereitstellbare Einheit)
  src/app/              Routen: / (Start) /practice /article /dicts /wrong /stats /setting
  src/i18n/             Sprachpakete (Sprache hinzufügen: neues Paket + ein Eintrag in LOCALES)
  src/lib/              Wörterbücher, Pinyin, TTS, FSRS-Planung, lokaler Speicher
  public/dicts/         Vorgefertigte Wörterbücher
  public/articles/      Eingebaute Übungstexte
  scripts/              Wortliste und Wörterbuch-Generator
sample-words.csv        Beispiel für den Import eines eigenen Wörterbuchs
```

## Bereitstellung

Im Wurzelverzeichnis des Repositories liegt keine `package.json`; beim Import auf Vercel (oder anderen Plattformen) muss das **Root Directory auf `web`** gesetzt werden. Alles andere bleibt bei den Next.js-Standardwerten.

## Vorschläge und Beiträge

Das Projekt ist jung und es kommen laufend Funktionen dazu. Ideen und Fehlermeldungen sind als `Issues` willkommen; wenn dir der Ansatz gefällt, eröffne gern einen `PR`.

- Sprache hinzufügen: Paket unter `src/i18n/messages/` anlegen und in `src/i18n/index.tsx` registrieren
- Wörter hinzufügen: `scripts/seed-words.mjs` bearbeiten und `npm run gen:dict` ausführen
