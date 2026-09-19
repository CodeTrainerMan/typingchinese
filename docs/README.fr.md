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
  <b>Apprenez le chinois touche par touche : tapez le pinyin, écoutez le ton, retenez le mot. Un outil open source pour travailler le vocabulaire et les textes chinois.</b>
</p>

## Démonstration en ligne

<https://www.typingchinese.club>

## Fonctionnalités

### Pratique des mots

- **Quatre modes d'exercice** : suivi (voir le hanzi, taper le pinyin), dictée (écoute seule), autotest (le pinyin est donné, produire le mot) et écriture par le sens (seule la traduction est affichée)
- **Trois modes de saisie** : pinyin complet `zhongguo`, initiales `zg` ou tons `zhong1 guo2`
- **Deux méthodes d'entrée** : taper des lettres latines au clavier anglais avec correction immédiate lettre par lettre, ou saisir des hanzi avec votre IME chinois (Microsoft Pinyin et autres) avec évaluation par mot
- Pinyin avec marques de ton, synthèse vocale chinoise et traduction pour chaque mot
- Répétez chaque mot autant de fois que vous voulez ; un mot raté peut être effacé et retapé automatiquement

### Pratique des textes

- Textes gradués intégrés, du niveau débutant à intermédiaire (des phrases courtes aux petites fables)
- Ajoutez votre propre texte : collez-le et tapez-le phrase par phrase
- Chaque phrase est prononcée au fil de la frappe : lecture, écoute et écriture se renforcent mutuellement

### Erreurs, révisions et statistiques

- Chaque mot manqué est automatiquement enregistré dans le carnet d'erreurs
- Les révisions sont planifiées avec **FSRS** (Free Spaced Repetition Scheduler) ; la proportion quotidienne de révisions est configurable
- La page de statistiques suit l'objectif du jour, le nombre de mots par jour, le temps passé, la précision et le nombre de frappes

### Hautement personnalisable

- Effets sonores du clavier et sons de frappe, volume et débit de la voix réglables
- Raccourcis personnalisables : touche de réécoute (<kbd>Tab</kbd> / <kbd>F2</kbd>) et touche du mot suivant (<kbd>Espace</kbd> / <kbd>Entrée</kbd>)
- Clavier virtuel à l'écran, thème clair / sombre / système
- **14 langues d'interface** : l'interface suit votre choix, tandis que le contenu d'apprentissage reste toujours en chinois

### Sobres et efficace

- Interface moderne et sans publicité
- Fonctionne entièrement dans le navigateur : pas de compte, pas de backend, aucune inscription obligatoire
- Toute la progression est stockée localement dans `localStorage`

### Dictionnaires

Intégrés : **Mots quotidiens** (59), **Vocabulaire avancé** (51), **Idiotismes à quatre caractères** (40).

Apportez le vôtre : collez une liste ou déposez un fichier `.json` / `.csv` / `.txt`. Une entrée par ligne ; le pinyin est généré automatiquement :

```
中国,国家名称
旅行 lv you
安静=没有声音
```

Voir `sample-words.csv` pour un exemple prêt à importer.

## Exécuter en local

Le projet est construit avec Next.js et nécessite Node.js 18 ou plus.

```bash
git clone https://github.com/CodeTrainerMan/typingchinese.git
cd typingchinese/web
npm install
npm run dev
```

Ouvrez <http://localhost:3000>.

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Démarrer le serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Servir le build de production |
| `npm run lint` | ESLint |
| `npm run gen:dict` | Régénérer `public/dicts/*.json` depuis `scripts/seed-words.mjs` |

## Structure du projet

```
web/                    Application Next.js (la seule unité déployable)
  src/app/              Routes : / (accueil) /practice /article /dicts /wrong /stats /setting
  src/i18n/             Fichiers de langue (ajouter une langue : nouveau fichier + une entrée dans LOCALES)
  src/lib/              Dictionnaires, pinyin, TTS, planification FSRS, stockage local
  public/dicts/         Dictionnaires pré-générés
  public/articles/      Textes d'entraînement intégrés
  scripts/              Liste de mots source et générateur de dictionnaires
sample-words.csv        Exemple pour importer votre propre dictionnaire
```

## Déploiement

La racine du dépôt ne contient pas de `package.json` : lors de l'import sur Vercel (ou une autre plateforme), le **Root Directory doit être `web`**. Le reste utilise les réglages par défaut de Next.js.

## Suggestions et contributions

Le projet est jeune et de nouvelles fonctions arrivent régulièrement. Les idées et les rapports de bugs sont bienvenus dans les `Issues` ; si l'approche vous plaît, ouvrez une `PR`.

- Ajouter une langue : créez un fichier dans `src/i18n/messages/` et enregistrez-le dans `src/i18n/index.tsx`
- Ajouter des mots : modifiez `scripts/seed-words.mjs` puis lancez `npm run gen:dict`
