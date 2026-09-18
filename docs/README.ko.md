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
  <b>한 번의 타이핑으로 배우는 중국어 — 병음을 입력하고, 성조를 듣고, 단어를 기억하세요. 중국어 단어와 문장을 연습하는 오픈 소스 도구입니다.</b>
</p>

## 온라인 데모

<https://typingchinese.vercel.app>

## 기능

### 단어 연습

- **네 가지 연습 모드**: 따라 쓰기(한자를 보고 병음 입력), 받아쓰기(소리만 듣기), 자가 테스트(병음을 보고 단어 쓰기), 뜻으로 쓰기(해석만 표시)
- **세 가지 입력 모드**: 전체 병음 `zhongguo`, 초성 `zg`, 성조 `zhong1 guo2`
- **두 가지 입력 방식**: 영문 키보드로 라틴 문자를 입력해 글자마다 바로 교정, 또는 중국어 IME(마이크로소프트 병음 등)로 한자를 입력해 단어 단위로 채점
- 모든 단어에 성조 표시 병음, 중국어 음성 합성, 해석 제공
- 단어 반복 횟수를 자유롭게 설정할 수 있고, 틀린 단어는 자동으로 지우고 다시 쓸 수 있습니다

### 문장 연습

- 입문부터 중급까지 단계별 내장 지문(짧은 문장부터 짧은 우화까지)
- 직접 글 추가: 텍스트를 붙여넣고 문장 단위로 입력
- 입력할 때마다 문장이 읽히므로 읽기·듣기·쓰기가 서로를 강화합니다

### 오답, 복습, 통계

- 틀린 단어는 자동으로 오답 노트에 모입니다
- 복습은 **FSRS**(Free Spaced Repetition Scheduler)가 예약하며, 하루 복습 비율을 조정할 수 있습니다
- 통계 페이지에서 일일 목표, 하루 단어 수, 학습 시간, 정확도, 타수 확인

### 자유로운 설정

- 키보드 효과음과 타이핑 소리, 음량과 음성 속도 조절
- 단축키 지정: 다시 듣기(<kbd>Tab</kbd> / <kbd>F2</kbd>), 다음 단어(<kbd>Space</kbd> / <kbd>Enter</kbd>)
- 화상 가상 키보드, 라이트 / 다크 / 시스템 테마
- **14개 인터페이스 언어**: 화면은 선택한 언어를 따르고, 학습 콘텐츠는 항상 중국어입니다

### 깔끔하고 효율적

- 광고 없는 모던한 UI
- 브라우저에서만 동작: 계정 없음, 백엔드 없음, 가입 강제 없음
- 모든 진도는 로컬 `localStorage`에 저장

### 사전

내장: **일상 단어** (59), **고급 어휘** (51), **사자성어** (40).

직접 만들기: 목록을 붙여넣거나 `.json` / `.csv` / `.txt` 업로드. 한 줄에 한 항목이며 병음은 자동 생성됩니다.

```
中国,国家名称
旅行 lv you
安静=没有声音
```

바로 쓸 수 있는 예시는 `sample-words.csv`를 참고하세요.

## 로컬 실행

Next.js로 만들어졌으며 Node.js 18 이상이 필요합니다.

```bash
git clone https://github.com/CodeTrainerMan/typingchinese.git
cd typingchinese/web
npm install
npm run dev
```

<http://localhost:3000> 을 열어 주세요.

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드 결과 실행 |
| `npm run lint` | ESLint |
| `npm run gen:dict` | `scripts/seed-words.mjs`로 `public/dicts/*.json` 재생성 |

## 프로젝트 구조

```
web/                    Next.js 애플리케이션(배포 대상은 이 폴더뿐)
  src/app/              라우트: / (홈) /practice /article /dicts /wrong /stats /setting
  src/i18n/             언어 팩(언어 추가: 팩 생성 + LOCALES에 한 줄)
  src/lib/              사전, 병음, TTS, FSRS 스케줄, 로컬 저장소
  public/dicts/         미리 생성된 사전
  public/articles/      내장 연습 지문
  scripts/              시드 단어 목록과 사전 생성기
sample-words.csv        나만의 사전을 가져오는 예시
```

## 배포

저장소 루트에는 `package.json`이 없으므로 Vercel(또는 다른 플랫폼)에서 가져올 때 **Root Directory를 `web`으로** 지정해야 합니다. 나머지는 Next.js 기본값을 사용합니다.

## 의견과 기여

이제 막 시작한 프로젝트로 기능이 계속 추가되고 있습니다. 아이디어와 버그 제보는 `Issues`로 환영합니다. 방향이 마음에 든다면 `PR`도 보내주세요.

- 언어 추가: `src/i18n/messages/`에 팩을 만들고 `src/i18n/index.tsx`에 등록
- 단어 추가: `scripts/seed-words.mjs` 수정 후 `npm run gen:dict`
