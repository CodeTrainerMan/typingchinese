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
  <b>Học tiếng Trung qua từng lần gõ: gõ pinyin, nghe thanh điệu, nhớ từ vựng. Công cụ mã nguồn mở để luyện từ và đoạn văn tiếng Trung.</b>
</p>

## Bản demo trực tuyến

<https://www.typingchinese.club>

## Tính năng

### Luyện từ vựng

- **Bốn chế độ luyện tập**: nhại theo (nhìn chữ Hán, gõ pinyin), chính tả (chỉ nghe), tự kiểm tra (cho pinyin, viết từ) và viết theo nghĩa (chỉ hiện bản dịch)
- **Ba chế độ gõ**: pinyin đầy đủ `zhongguo`, viết tắt `zg`, hoặc có thanh điệu `zhong1 guo2`
- **Hai cách nhập**: gõ chữ Latinh trên bàn phím tiếng Anh với sửa lỗi ngay theo từng chữ cái, hoặc gõ chữ Hán bằng IME tiếng Trung (Microsoft Pinyin và tương tự) và chấm theo cả từ
- Mỗi từ đều có pinyin kèm dấu thanh, phát âm tiếng Trung và bản dịch
- Lặp lại mỗi từ bao nhiêu lần tùy ý; từ gõ sai có thể tự động xóa và gõ lại

### Luyện đoạn văn

- Các đoạn văn được phân cấp sẵn, từ nhập môn đến trung cấp (từ câu ngắn đến ngụ ngôn ngắn)
- Thêm đoạn văn của riêng bạn: dán văn bản vào rồi gõ từng câu
- Mỗi câu đều được phát âm khi bạn gõ, nên đọc, nghe và viết hỗ trợ lẫn nhau

### Lỗi sai, ôn tập, thống kê

- Mọi từ làm sai đều tự động được đưa vào sổ lỗi sai
- Lịch ôn tập do **FSRS** (Free Spaced Repetition Scheduler) sắp xếp; có thể điều chỉnh tỷ lệ ôn tập mỗi ngày
- Trang thống kê ghi mục tiêu hằng ngày, số từ mỗi ngày, thời gian học, độ chính xác và số lần gõ phím

### Tùy biến cao

- Hiệu ứng âm thanh bàn phím và âm thanh gõ, chỉnh được âm lượng và tốc độ đọc
- Phím tắt tùy chỉnh: nghe lại (<kbd>Tab</kbd> / <kbd>F2</kbd>) và từ tiếp theo (<kbd>Space</kbd> / <kbd>Enter</kbd>)
- Bàn phím ảo trên màn hình, giao diện sáng / tối / theo hệ thống
- **14 ngôn ngữ giao diện**: giao diện theo lựa chọn của bạn, còn nội dung học luôn là tiếng Trung

### Gọn gàng và hiệu quả

- Giao diện hiện đại, không quảng cáo
- Chạy hoàn toàn trong trình duyệt: không cần tài khoản, không cần backend, không bắt buộc đăng ký
- Toàn bộ tiến độ được lưu cục bộ trong `localStorage`

### Từ điển

Có sẵn: **Từ thường dùng** (59), **Từ vựng nâng cao** (51), **Thành ngữ bốn chữ** (40).

Mang từ điển của riêng bạn: dán danh sách hoặc tải lên `.json` / `.csv` / `.txt`. Mỗi dòng một mục, pinyin được tạo tự động:

```
中国,国家名称
旅行 lv you
安静=没有声音
```

Xem `sample-words.csv` để có ví dụ có thể nhập ngay.

## Chạy trên máy local

Dự án được xây bằng Next.js và cần Node.js 18 trở lên.

```bash
git clone https://github.com/CodeTrainerMan/typingchinese.git
cd typingchinese/web
npm install
npm run dev
```

Mở <http://localhost:3000>.

| Lệnh | Tác dụng |
| --- | --- |
| `npm run dev` | Khởi động máy chủ phát triển |
| `npm run build` | Build cho môi trường production |
| `npm run start` | Chạy bản build production |
| `npm run lint` | ESLint |
| `npm run gen:dict` | Tạo lại `public/dicts/*.json` từ `scripts/seed-words.mjs` |

## Cấu trúc dự án

```
web/                    Ứng dụng Next.js (đơn vị duy nhất cần triển khai)
  src/app/              Các route: / (trang chủ) /practice /article /dicts /wrong /stats /setting
  src/i18n/             Gói ngôn ngữ (thêm ngôn ngữ: gói mới + một mục trong LOCALES)
  src/lib/              Từ điển, pinyin, TTS, lập lịch FSRS, lưu trữ cục bộ
  public/dicts/         Từ điển được tạo sẵn
  public/articles/      Đoạn văn luyện tập có sẵn
  scripts/              Danh sách từ gốc và trình tạo từ điển
sample-words.csv        Ví dụ để nhập từ điển riêng
```

## Triển khai

Thư mục gốc của repository không có `package.json`, vì vậy khi nhập dự án vào Vercel (hoặc nền tảng khác) **Root Directory phải là `web`**. Các phần còn lại dùng mặc định của Next.js.

## Góp ý và đóng góp

Dự án còn mới và các tính năng vẫn đang được bổ sung. Ý tưởng và báo lỗi được hoan nghênh qua `Issues`; nếu bạn thích cách tiếp cận này, hãy mở `PR`.

- Thêm ngôn ngữ: tạo gói mới trong `src/i18n/messages/` và đăng ký trong `src/i18n/index.tsx`
- Thêm từ: sửa `scripts/seed-words.mjs` rồi chạy `npm run gen:dict`
