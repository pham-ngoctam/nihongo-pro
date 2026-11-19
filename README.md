# Nihongo Pro Ultimate — từ số 0 đến JLPT N1

Website học tiếng Nhật giao diện responsive, giải thích tiếng Việt. Chạy tĩnh trên GitHub Pages.

## Có gì trong bản này?
- Hiragana và Katakana có nút đọc phát âm (Speech Synthesis của trình duyệt).
- Lộ trình: nhập môn, N5, N4, N3, N2, N1.
- Trang từ vựng/Kanji, ngữ pháp, luyện nghe, quiz, tiến độ.
- Chế độ khách lưu trên trình duyệt bằng localStorage.
- Đăng ký/đăng nhập email và đồng bộ tiến độ riêng từng người qua Supabase.
- Mỗi người dùng một tài khoản email riêng. RLS trong SQL giới hạn dữ liệu theo auth.uid().

## Quan trọng về đăng nhập nhiều người
GitHub Pages chỉ host website tĩnh, không tự tạo hệ thống tài khoản. Muốn mày và em mày đăng nhập riêng và đồng bộ tiến độ trên nhiều thiết bị, cần cấu hình Supabase (gói miễn phí có thể đủ cho khởi đầu).

### A. Tạo Supabase
1. Mở https://supabase.com/ và tạo project.
2. Trong Project Settings → API, sao chép Project URL và anon/public key.
3. Mở file `supabase-schema.sql` trong repository hoặc Supabase SQL Editor.
4. Dán toàn bộ SQL vào SQL Editor và bấm Run.
5. Trong Authentication → Providers, bật Email. Có thể tắt Confirm email để thử nghiệm đơn giản; nếu bật thì mỗi người phải xác nhận email.
6. Authentication → URL Configuration: đặt Site URL là `https://pham-ngoctam.github.io` và thêm Redirect URL `https://pham-ngoctam.github.io/nihongo-pro/`.

### B. Nối website với Supabase
1. Mở `app.js` trên GitHub → nút bút chì Edit.
2. Ở đầu file, tìm:
   `const SUPABASE_URL = "";`
   `const SUPABASE_ANON_KEY = "";`
3. Điền Project URL và anon/public key vào hai dấu ngoặc kép.
4. Không bao giờ đưa `service_role` key vào website. Chỉ dùng anon/public key.
5. Commit changes. Chờ GitHub Pages triển khai.

### C. Tạo tài khoản cho hai người
1. Mở website → Tài khoản & đồng bộ → Đăng nhập / Tạo tài khoản.
2. Mày đăng ký bằng email của mày.
3. Em mày đăng ký bằng email riêng của em ấy.
4. Mỗi tài khoản có một hàng dữ liệu `learning_progress` riêng. Không dùng chung email/mật khẩu.

## Triển khai GitHub Pages
Repository → Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save.
Website: https://pham-ngoctam.github.io/nihongo-pro/

## Upload bản mới bằng iPhone
Giải nén ZIP trong ứng dụng Files. Trên GitHub repository chọn Add file → Upload files, chọn `index.html`, `app.js`, `styles.css`, `README.md`, `supabase-schema.sql`, rồi Commit changes. Nếu iOS không cho chọn nhiều file, upload từng file. Không xóa repository.

## Giới hạn nội dung hiện tại — đọc kỹ
Đây là bản nền tảng có dữ liệu học mẫu để kiểm tra luồng và giao diện, KHÔNG phải giáo trình đầy đủ chính thức từ bảng chữ cái đến N1, cũng không phải ngân hàng đề JLPT chính thức. Mỗi cấp độ hiện có 10 chủ đề lộ trình và một số ví dụ mẫu; cần biên soạn, rà soát và bổ sung nhiều bài học, từ vựng, kanji, audio người bản xứ và đề thi theo từng chương. Phần luyện nghe dùng giọng đọc tổng hợp của thiết bị, không phải bản thu âm người Nhật.
