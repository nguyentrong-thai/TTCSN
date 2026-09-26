# LỘ TRÌNH XÂY DỰNG WEBSITE BÁN ĐỒ ĐIỆN TỬ (Bài tập lớn)

> Tham khảo: một website bán đồ điện tử dùng Node.js + Express + EJS + MySQL, deploy trên Railway.

---

## 1. Phân tích dự án tham khảo

Repo tham khảo có cấu trúc MVC khá chuẩn cho một đồ án môn học:

```
project/
├── bin/            # entry point khởi động server
├── config/         # cấu hình DB, session...
├── controllers/    # xử lý logic nghiệp vụ
├── models/         # truy vấn/tương tác MySQL
├── routes/         # định tuyến Express
├── views/          # giao diện EJS
├── public/         # css, js, ảnh tĩnh
├── app.js          # khởi tạo app Express
├── database.sql    # schema + dữ liệu mẫu MySQL
├── package.json
└── railway.toml    # cấu hình deploy Railway
```

**Công nghệ họ dùng:** HTML/CSS/JS thuần, EJS (server-side render), Node.js/Express, MySQL (quản lý qua Laragon/phpMyAdmin), deploy Railway.

**Tính năng chính:**
- Người dùng: đăng ký/đăng nhập, xem/tìm sản phẩm, giỏ hàng, đặt & hủy đơn.
- Quản trị: quản lý danh mục/sản phẩm, đơn hàng, tài khoản nhân viên.

Đây là một baseline tốt — đúng dạng đồ án môn "Thiết kế/Triển khai công nghệ site nghiệp" (TTCSN). Bạn có thể **giữ kiến trúc tương tự** (dễ làm, đúng "khẩu vị" đồ án) hoặc **nâng cấp công nghệ** để điểm cao hơn / học được nhiều hơn. Bên dưới là lộ trình chi tiết, có 2 lựa chọn stack.

---

## 2. Lựa chọn công nghệ (stack)

> ✅ **ĐÃ CHỐT: Phương án A** (Node.js + Express + EJS + MySQL/XAMPP). Toàn bộ lộ trình 8 tuần bên dưới áp dụng theo phương án này. Phương án B chỉ giữ lại để tham khảo/so sánh, không triển khai.

### Phương án A — ✅ ĐÃ CHỌN — bám sát repo tham khảo
| Thành phần | Công nghệ |
|---|---|
| Backend | Node.js + Express.js |
| Template/View | EJS |
| Database | MySQL/MariaDB — quản lý qua **XAMPP** (Apache + MySQL + phpMyAdmin) |
| Auth | express-session + bcrypt |
| Upload ảnh | multer |
| Deploy | Railway / Render |

> **Cập nhật:** Nhóm đã chốt dùng **XAMPP** để chạy MySQL cục bộ (thay vì Laragon). Không ảnh hưởng đến code — `db.js` dùng `mysql2/promise` vẫn kết nối bình thường vì XAMPP dùng MariaDB tương thích hoàn toàn với giao thức MySQL. Cấu hình mặc định trong `.env.example` (`DB_HOST=localhost`, `DB_USER=root`, `DB_PASSWORD=` để trống) khớp sẵn với XAMPP.

**Ưu điểm:** đơn giản, tài liệu dễ tìm, đúng dạng bài giảng viên đã quen chấm.
**Nhược điểm:** giao diện kém mượt (reload trang liên tục), khó mở rộng.

### Phương án B — ❌ Không chọn (tham khảo thêm nếu tò mò, không cần đọc để làm đồ án)
| Thành phần | Công nghệ đề xuất | Lý do thay thế |
|---|---|---|
| Frontend | **Next.js 15 (React) + Tailwind CSS** | SPA/SSR kết hợp, UX mượt, dễ làm responsive, được doanh nghiệp dùng nhiều → tốt cho CV |
| Backend API | **Node.js + Express (hoặc NestJS nếu muốn chuẩn OOP)** hoặc gộp luôn trong Next.js API Routes | Tách API rõ ràng, dễ test |
| Ngôn ngữ | **TypeScript** thay vì JavaScript thuần | An toàn kiểu dữ liệu, ít bug hơn khi làm nhóm |
| Database | **PostgreSQL** (hoặc giữ MySQL nếu quen) + **Prisma ORM** | Prisma giúp viết migration, query an toàn, tự sinh types |
| Auth | **NextAuth.js / Auth.js** hoặc JWT tự viết | Chuẩn hóa, hỗ trợ đăng nhập Google dễ dàng |
| Thanh toán | **VNPay hoặc Momo sandbox** (thực tế ở VN) thay vì chỉ "đặt hàng nội bộ" | Tăng tính thực tế cho bài bảo vệ đồ án |
| Ảnh | **Cloudinary** (free tier) thay vì lưu ảnh cục bộ | Ảnh không mất khi redeploy, tối ưu tự động |
| State FE | React Context / Zustand | Quản lý giỏ hàng mượt không cần reload |
| Deploy | **Vercel (frontend) + Railway/Render (DB & API)** | Miễn phí, CI/CD tự động khi push GitHub |
| Testing | Jest (unit) + Playwright (E2E) — nếu môn yêu cầu | Cộng điểm chất lượng phần mềm |

> **Quyết định cuối cùng của nhóm:** Giữ Phương án A, vì đã code xong Tuần 1-2 (setup, DB, đăng ký/đăng nhập) theo đúng stack này — đổi sang B sẽ phải viết lại từ đầu, không kịp deadline. Từ đây trở đi, toàn bộ lộ trình chỉ triển khai theo Phương án A. Bảng "thay thế công nghệ linh hoạt" ở mục 6 vẫn giữ lại để nâng cấp từng phần nhỏ nếu có thời gian dư, không phải đổi cả hệ thống.

---

## 3. Lộ trình theo tuần (đề xuất 8 tuần, điều chỉnh theo deadline thực tế)

> **Trạng thái hiện tại (cập nhật):** Các tính năng chính của Tuần 1–6 đã được triển khai. Tuần 7 còn kiểm thử end-to-end và một số hạng mục hoàn thiện; Tuần 8 chưa triển khai.

### Tuần 1 — Phân tích & thiết kế ✅ Đã xong
- [x] Xác định phạm vi: website bán đồ điện tử (điện thoại, laptop, phụ kiện, đồng hồ thông minh).
- [x] Thiết kế **ERD** cơ sở dữ liệu (Users, Categories, Products, Cart_items, Orders, Order_items, Reviews) — đã có `schema.sql`.
- [ ] Vẽ **use-case diagram** (Khách, Khách hàng đã đăng ký, Admin) — *cần bổ sung cho báo cáo*.
- [ ] Viết đặc tả chức năng (functional spec) — *cần bổ sung cho báo cáo*.
- [x] Chọn công nghệ: **Phương án A** (Node.js + Express + EJS + MySQL/XAMPP), tạo repo GitHub.

### Tuần 2 — Khởi tạo dự án & xác thực người dùng ✅ Đã xong
- [x] Khởi tạo project Express, cấu trúc thư mục MVC (`config/controllers/models/routes/views/middlewares`).
- [x] Kết nối database qua `mysql2/promise` (connection pool), có `testConnection()`.
- [x] Chức năng: Đăng ký, đăng nhập, đăng xuất — `authController.js`, `authRoutes.js`.
- [x] Phân quyền: middleware `requireLogin` / `requireAdmin` (đã viết, sẽ gắn vào route ở Tuần 3).
- [x] Mã hóa mật khẩu bằng bcrypt, quản lý phiên bằng `express-session` + `connect-flash`.
- [x] Layout chung (`header.ejs`/`footer.ejs`), trang chủ hiển thị danh mục + sản phẩm, trang 404.

**Việc cần dọn trước khi qua Tuần 3:**
- [x] Đặt đúng vị trí `public/css/style.css` (đường dẫn `/css/style.css` mà header đang gọi).
- [x] Có `.env.example` và `.gitignore` đúng vị trí.
- [x] Sắp đúng cấu trúc `views/partials/`, `views/auth/` theo các lệnh `include()` đã viết.
- [x] Có tài khoản admin local trong `schema.sql` với mật khẩu đã hash: `admin@electroshop.vn` / `ElectroShop@2026!`.

### Tuần 3 — Quản lý sản phẩm & danh mục (phía Admin)
- [x] CRUD danh mục sản phẩm.
- [x] CRUD sản phẩm (tên, giá, mô tả, đường dẫn hình ảnh, tồn kho, thương hiệu).
- [x] Upload ảnh sản phẩm bằng multer (lưu tại `public/images/products/`).
- [x] Trang quản trị (dashboard) cơ bản.

### Tuần 4 — Hiển thị sản phẩm & tìm kiếm (phía người dùng)
- [x] Trang chủ, danh sách sản phẩm, chi tiết sản phẩm.
- [x] Tìm kiếm theo tên, lọc theo danh mục/thương hiệu.
- [ ] Phân trang (pagination).
- [x] Responsive UI bằng CSS responsive.

### Tuần 5 — Giỏ hàng & đặt hàng
- [x] Thêm/xóa/sửa số lượng trong giỏ hàng — đã có trong `routes/cartRoutes.js` và `views/cart/index.ejs`.
- [x] Trang checkout: nhập địa chỉ và số điện thoại giao hàng.
- [x] Tạo đơn hàng, lưu chi tiết đơn hàng vào DB và trừ tồn kho.
- [ ] (Phương án B) Tích hợp cổng thanh toán sandbox VNPay/Momo.

### Tuần 6 — Quản lý đơn hàng & nghiệp vụ nâng cao
- [x] Trang "Đơn hàng của tôi" (theo dõi trạng thái, hủy đơn khi chưa xử lý).
- [x] Admin: xem/xử lý/cập nhật trạng thái đơn hàng (chờ xác nhận → đang giao → hoàn tất/hủy).
- [ ] Thống kê doanh thu cơ bản (biểu đồ đơn giản — chart.js/recharts).
- [x] (Tùy chọn) Đánh giá & bình luận sản phẩm (chỉ tài khoản có đơn hoàn tất).

### Tuần 7 — Hoàn thiện, kiểm thử, bảo mật
- [ ] Kiểm thử chức năng (test thủ công theo checklist, hoặc viết test tự động nếu có thời gian).
- [ ] Xử lý lỗi, validate input (chống SQL injection, XSS).
- [ ] Tối ưu UI/UX, thêm loading state, thông báo (toast).
- [x] Viết README chi tiết (hướng dẫn cài đặt, cấu hình môi trường, tài khoản admin mẫu, lưu ý khi chạy local).

### Tuần 8 — Triển khai (deploy) & viết báo cáo
- [ ] Deploy production (Railway/Render/Vercel), cấu hình biến môi trường (.env).
- [ ] Kiểm tra lại toàn bộ luồng trên môi trường thật.
- [ ] Hoàn thiện báo cáo đồ án (mô tả hệ thống, ERD, sơ đồ kiến trúc, ảnh chụp màn hình, hướng dẫn sử dụng).
- [ ] Chuẩn bị slide + kịch bản demo bảo vệ.

> Cập nhật thực tế (26/09/2026): MySQL local kết nối được; trang chủ, đăng nhập admin, danh sách/chi tiết sản phẩm có ảnh và wishlist đã được smoke-test. Hash admin cũ đã được cập nhật; bảng `wishlist_items` bị thiếu trong database cũ đã được tạo an toàn. CSP đã cho phép hai CDN ảnh được seed sử dụng và ảnh lỗi có fallback không dùng inline handler. Các luồng đăng ký, giỏ hàng, checkout và xử lý đơn chưa được xác minh end-to-end.

---

## 4. Cấu trúc thư mục đề xuất

**Nếu theo Phương án A (Express/EJS — giống repo tham khảo):**
```
project/
├── config/
├── controllers/
├── models/
├── routes/
│   ├── user.routes.js
│   └── admin.routes.js
├── middlewares/     # auth check, error handler
├── views/
├── public/
├── database/
│   └── schema.sql
├── app.js
└── .env
```

**Nếu theo Phương án B (Next.js + TypeScript + Prisma):**
```
project/
├── app/                # Next.js App Router
│   ├── (shop)/
│   ├── (admin)/
│   └── api/
├── components/
├── lib/                # prisma client, auth config, utils
├── prisma/
│   └── schema.prisma
├── public/
├── styles/
└── .env
```

---

## 5. Checklist tính năng tối thiểu để "đạt yêu cầu" đồ án

- [x] Đăng ký/đăng nhập/phân quyền
- [x] CRUD sản phẩm + danh mục (Admin)
- [x] Xem, tìm kiếm, lọc sản phẩm (User)
- [x] Giỏ hàng, đặt hàng, hủy đơn
- [x] Quản lý đơn hàng (Admin)
- [x] Responsive, giao diện rõ ràng
- [ ] README + báo cáo đầy đủ
- [ ] Video/slide demo

> Cập nhật thực tế: README đã được viết rõ ràng; báo cáo, slide và video demo còn cần hoàn thiện theo đúng deadline.

> Cập nhật thực tế: README đã được viết rõ ràng; báo cáo, slide và video demo còn cần hoàn thiện theo đúng deadline.

**Điểm cộng (nếu còn thời gian):**
- [ ] Thanh toán online (VNPay/Momo sandbox)
- [x] Đánh giá/bình luận sản phẩm
- [x] Chatbot tư vấn/gợi ý sản phẩm đơn giản (theo catalog, từ khóa và ngân sách)
- [ ] Thống kê doanh thu dạng biểu đồ
- [ ] Gửi email xác nhận đơn hàng (Nodemailer)
- [x] Wishlist (sản phẩm yêu thích, lưu theo tài khoản)

---

## 6. Ghi chú thay thế công nghệ linh hoạt

Bảng dưới liệt kê các điểm có thể "nâng cấp" độc lập từng phần mà không phải đổi cả hệ thống — bạn có thể áp dụng dần trong lúc làm nếu thấy phù hợp hơn:

| Nếu đang dùng | Có thể thay bằng | Khi nào nên đổi |
|---|---|---|
| EJS render server-side | React/Next.js | Khi cần UI động, không muốn reload trang khi thêm giỏ hàng |
| Lưu ảnh trong `/public` | Cloudinary/S3 | Khi deploy lên Railway/Render (ổ đĩa có thể bị xóa mỗi lần redeploy) |
| Session cookie | JWT | Khi tách frontend/backend riêng (API-first) |
| mysql2 thuần (viết SQL tay) | Sequelize/Prisma ORM | Khi DB có nhiều bảng quan hệ, muốn tránh lỗi cú pháp SQL |
| CSS thuần | Tailwind CSS / Bootstrap 5 | Khi cần làm giao diện nhanh, đẹp, responsive |
| Không có thanh toán thật | VNPay/Momo sandbox | Khi muốn đồ án "thực tế" hơn để gây ấn tượng khi bảo vệ |

---

## 7. Công cụ cần cài đặt (đã chốt dùng XAMPP)

| Công cụ | Mục đích |
|---|---|
| **Node.js (>=18.x LTS)** | Chạy backend Express |
| **XAMPP** | Apache + MySQL (MariaDB) + phpMyAdmin — quản lý CSDL |
| **Git** | Quản lý version, đẩy code lên GitHub |
| **VS Code** | Viết code (nên cài thêm extension: EJS, ESLint, Prettier, DotENV) |
| **Thunder Client / Postman** | Test các route POST (đăng ký, đăng nhập...) độc lập với giao diện |
| **DBeaver / MySQL Workbench** (tùy chọn) | Xem/query DB trực quan hơn phpMyAdmin nếu cần |

**Quy trình chạy project với XAMPP:**
1. Mở XAMPP Control Panel → Start `Apache` và `MySQL`.
2. Vào `http://localhost/phpmyadmin` → tạo database `electro_shop` → tab Import → chọn `schema.sql`.
3. `cp .env.example .env` (giữ nguyên cấu hình mặc định, khớp sẵn với XAMPP: `DB_HOST=localhost`, `DB_USER=root`, `DB_PASSWORD=` để trống).
4. `npm install` → `npm run dev` → truy cập `http://localhost:3000`.

---

## 8. Tài liệu & tham khảo nên đọc thêm
- Tham khảo thêm các repo MVC Express/EJS/MySQL để hoàn thiện cấu trúc.
- Prisma docs: https://www.prisma.io/docs
- Next.js docs: https://nextjs.org/docs
- VNPay sandbox docs (cổng thanh toán demo cho sinh viên VN): tìm "VNPay Merchant Sandbox"
- Tailwind CSS docs: https://tailwindcss.com/docs

---

*File này là lộ trình gợi ý — hãy điều chỉnh số tuần/tính năng theo deadline và yêu cầu cụ thể của giảng viên/đề cương môn học.*
