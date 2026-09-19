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
  <b>Aprenda chinês tecla por tecla: digite o pinyin, ouça o tom e fixe a palavra. Uma ferramenta de código aberto para praticar palavras e textos em chinês.</b>
</p>

## Demonstração online

<https://www.typingchinese.club>

## Funcionalidades

### Prática de palavras

- **Quatro modos de prática**: acompanhar (ver o hanzi e digitar o pinyin), ditado (só ouvindo), autoteste (o pinyin aparece e você produz a palavra) e escrita pelo significado (apenas a tradução é exibida)
- **Três modos de digitação**: pinyin completo `zhongguo`, iniciais `zg` ou tons `zhong1 guo2`
- **Duas formas de entrada**: digitar letras latinas em um teclado inglês com correção imediata por letra, ou digitar hanzi com seu IME chinês (Microsoft Pinyin e similares) com avaliação por palavra
- Pinyin com marcas de tom, síntese de voz em chinês e tradução em cada palavra
- Repita cada palavra quantas vezes quiser; palavras com erro podem ser limpas e redigitadas automaticamente

### Prática de textos

- Textos graduados integrados, do nível iniciante ao intermediário (de frases curtas a pequenas fábulas)
- Adicione seu próprio texto: cole o conteúdo e digite frase por frase
- Cada frase é pronunciada enquanto você avança, reforçando leitura, escuta e escrita ao mesmo tempo

### Erros, revisões e estatísticas

- Toda palavra errada é guardada automaticamente no caderno de erros
- As revisões são agendadas com o **FSRS** (Free Spaced Repetition Scheduler); a proporção diária de revisão é configurável
- A página de estatísticas registra meta diária, palavras por dia, tempo dedicado, precisão e número de teclas

### Altamente personalizável

- Efeitos sonoros de teclado e sons de digitação, com volume e velocidade da voz ajustáveis
- Atalhos personalizáveis: tecla de repetição (<kbd>Tab</kbd> / <kbd>F2</kbd>) e tecla de próxima palavra (<kbd>Espaço</kbd> / <kbd>Enter</kbd>)
- Teclado virtual na tela, tema claro / escuro / seguir o sistema
- **14 idiomas de interface**: a interface segue a sua escolha, enquanto o conteúdo de estudo é sempre chinês

### Limpo e eficiente

- Interface moderna e sem anúncios
- Funciona inteiramente no navegador: sem conta, sem backend, sem cadastro obrigatório
- Todo o progresso é guardado localmente no `localStorage`

### Dicionários

Integrados: **Palavras do dia a dia** (59), **Vocabulário avançado** (51), **Expressões idiomáticas de quatro caracteres** (40).

Traga o seu próprio: cole uma lista ou envie um arquivo `.json` / `.csv` / `.txt`. Uma entrada por linha; o pinyin é gerado automaticamente:

```
中国,国家名称
旅行 lv you
安静=没有声音
```

Veja `sample-words.csv` como exemplo pronto para importar.

## Executar localmente

O projeto é feito com Next.js e requer Node.js 18 ou superior.

```bash
git clone https://github.com/CodeTrainerMan/typingchinese.git
cd typingchinese/web
npm install
npm run dev
```

Abra <http://localhost:3000>.

| Comando | Função |
| --- | --- |
| `npm run dev` | Iniciar o servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servir o build de produção |
| `npm run lint` | ESLint |
| `npm run gen:dict` | Regerar `public/dicts/*.json` a partir de `scripts/seed-words.mjs` |

## Estrutura do projeto

```
web/                    Aplicação Next.js (a única unidade implantável)
  src/app/              Rotas: / (início) /practice /article /dicts /wrong /stats /setting
  src/i18n/             Pacotes de idioma (adicionar idioma: novo pacote + uma entrada em LOCALES)
  src/lib/              Dicionários, pinyin, TTS, agendamento FSRS, armazenamento local
  public/dicts/         Dicionários pré-gerados
  public/articles/      Textos de prática integrados
  scripts/              Lista de palavras-semente e gerador de dicionários
sample-words.csv        Exemplo para importar seu próprio dicionário
```

## Implantação

A raiz do repositório não tem `package.json`; ao importar o projeto na Vercel (ou outra plataforma), o **Root Directory deve ser `web`**. O restante usa os padrões do Next.js.

## Sugestões e contribuições

O projeto é recente e novas funções continuam sendo adicionadas. Ideias e relatórios de erro são bem-vindos como `Issues`; se você gosta da proposta, abra um `PR`.

- Adicionar um idioma: crie um pacote em `src/i18n/messages/` e registre-o em `src/i18n/index.tsx`
- Adicionar palavras: edite `scripts/seed-words.mjs` e execute `npm run gen:dict`
