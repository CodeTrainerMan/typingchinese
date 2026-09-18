<h1 align="center">Pinyin Type</h1>

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
  <b>Aprende chino tecla a tecla: escribe el pinyin, escucha el tono y recuerda la palabra. Una herramienta de código abierto para practicar vocabulario y textos en chino.</b>
</p>

## Demostración en línea

<https://typingchinese.vercel.app>

## Funciones

### Práctica de palabras

- **Cuatro modos de práctica**: seguir (ver el hanzi y escribir el pinyin), dictado (solo escuchas), autoevaluación (ves el pinyin y produces la palabra) y escritura por significado (solo ves la traducción)
- **Tres modos de escritura**: pinyin completo `zhongguo`, iniciales `zg` o tonos `zhong1 guo2`
- **Dos formas de entrada**: escribir letras latinas en un teclado inglés con corrección letra por letra, o escribir hanzi con tu IME chino (Microsoft Pinyin y similares) y evaluar por palabra completa
- Pinyin con marcas de tono, síntesis de voz en chino y traducción en cada palabra
- Repite cada palabra las veces que quieras; las palabras con errores pueden borrarse y reescribirse automáticamente

### Práctica de textos

- Textos graduados integrados, de nivel inicial a intermedio (desde frases cortas hasta fábulas breves)
- Añade tu propio texto: pega el contenido y escríbelo frase por frase
- Cada frase se pronuncia mientras avanzas, de modo que leer, escuchar y escribir se refuerzan mutuamente

### Errores, repasos y estadísticas

- Cada palabra que fallas se guarda automáticamente en el cuaderno de errores
- Los repasos se programan con **FSRS** (Free Spaced Repetition Scheduler); la proporción diaria de repaso es configurable
- La página de estadísticas registra la meta diaria, las palabras por día, el tiempo dedicado, la precisión y las pulsaciones

### Altamente personalizable

- Efectos de sonido del teclado y sonidos de escritura, con volumen y velocidad de voz ajustables
- Atajos personalizables: tecla de repetición (<kbd>Tab</kbd> / <kbd>F2</kbd>) y tecla de palabra siguiente (<kbd>Espacio</kbd> / <kbd>Enter</kbd>)
- Teclado virtual en pantalla, tema claro / oscuro / según el sistema
- **14 idiomas de interfaz**: la interfaz sigue tu elección, mientras que el contenido de estudio siempre es chino

### Limpio y eficiente

- Interfaz moderna y sin publicidad
- Funciona por completo en el navegador: sin cuenta, sin backend, sin registros obligatorios
- Todo el progreso se guarda localmente en `localStorage`

### Diccionarios

Integrados: **Palabras cotidianas** (59), **Vocabulario avanzado** (51), **Modismos de cuatro caracteres** (40).

Crea los tuyos: pega una lista o sube un archivo `.json` / `.csv` / `.txt`. Una entrada por línea; el pinyin se genera automáticamente:

```
中国,国家名称
旅行 lv you
安静=没有声音
```

Consulta `sample-words.csv` como ejemplo listo para importar.

## Ejecutar en local

El proyecto está hecho con Next.js y necesita Node.js 18 o superior.

```bash
git clone https://github.com/CodeTrainerMan/typingchinese.git
cd typingchinese/web
npm install
npm run dev
```

Abre <http://localhost:3000>.

| Comando | Para qué sirve |
| --- | --- |
| `npm run dev` | Iniciar el servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Servir la compilación de producción |
| `npm run lint` | ESLint |
| `npm run gen:dict` | Regenerar `public/dicts/*.json` desde `scripts/seed-words.mjs` |

## Estructura del proyecto

```
web/                    Aplicación Next.js (la única unidad desplegable)
  src/app/              Rutas: / (inicio) /practice /article /dicts /wrong /stats /setting
  src/i18n/             Paquetes de idioma (añadir idioma: nuevo paquete + una entrada en LOCALES)
  src/lib/              Diccionarios, pinyin, TTS, programación FSRS, almacenamiento local
  public/dicts/         Diccionarios pregenerados
  public/articles/      Textos de práctica integrados
  scripts/              Lista de palabras semilla y generador de diccionarios
sample-words.csv        Ejemplo para importar tu propio diccionario
```

## Despliegue

La raíz del repositorio no tiene `package.json`, por lo que al importar el proyecto en Vercel (u otra plataforma) el **Root Directory debe ser `web`**. Todo lo demás usa los valores predeterminados de Next.js.

## Sugerencias y contribuciones

El proyecto es joven y seguimos añadiendo funciones. Las ideas y los informes de errores son bienvenidos como `Issues`; si te gusta el enfoque, abre un `PR`.

- Añadir un idioma: crea un paquete en `src/i18n/messages/` y regístralo en `src/i18n/index.tsx`
- Añadir palabras: edita `scripts/seed-words.mjs` y ejecuta `npm run gen:dict`
