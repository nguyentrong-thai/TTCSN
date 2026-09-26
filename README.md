# ElectroShop

Website bán đồ điện tử phục vụ bài tập lớn, xây dựng bằng Node.js, Express, EJS và MySQL.

## Tình trạng hiện tại

- App đã khởi động đúng và render các trang chính như homepage, login và danh mục sản phẩm.
- Các luồng dữ liệu như đăng nhập, đăng ký, giỏ hàng, đặt hàng, admin quản lý yêu cầu MySQL đang chạy và database `electro_shop` đã được import đúng `schema.sql`.
- Nếu MySQL chưa được khởi động hoặc schema chưa được import, app có thể chạy nhưng các flow phụ thuộc DB sẽ không hoạt động đúng.

## Công nghệ chính

- Node.js 18+
- Express.js
- EJS
- MySQL/MariaDB
- `mysql2/promise`
- `express-session`, `connect-flash`, `bcrypt`
- `multer`, `sharp`
- `csurf`, `helmet`, `express-rate-limit`

## Tính năng đã triển khai

- Đăng ký / đăng nhập / đăng xuất
- Phân quyền người dùng và admin
- Trang chủ, danh mục, tìm kiếm và lọc sản phẩm
- Chi tiết sản phẩm, đánh giá và bình luận
- Giỏ hàng theo session
- Đặt hàng, hủy đơn khi còn ở trạng thái chờ xác nhận
- Quản trị danh mục, sản phẩm, đơn hàng
- Wishlist theo tài khoản
- Chatbot tư vấn sản phẩm đơn giản
- Giao diện responsive

## Yêu cầu môi trường

- Node.js 18 trở lên
- npm
- MySQL hoặc MariaDB đang chạy
- XAMPP hoặc Laragon đều được dùng

## Hướng dẫn cài đặt và chạy

### 1. Cài đặt dependency

```powershell
npm install
```

### 2. Tạo file môi trường

```powershell
Copy-Item .env.example .env
```

Kiểm tra file `.env`:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=electro_shop
SESSION_SECRET=chuoi_bi_mat_cua_ban
```

### 3. Khởi động MySQL và import schema

Bước bắt buộc để chạy hết các chức năng có dữ liệu.

1. Mở XAMPP Control Panel
2. Start MySQL
3. Vào `http://localhost/phpmyadmin`
4. Tạo database `electro_shop`
5. Import `database/schema.sql`

> Nếu database đã tồn tại, hãy backup trước khi import lại. Nếu cần thêm dữ liệu đánh giá/wishlist từ phiên bản cũ, chạy thêm `database/migration-reviews-wishlist.sql`.

### 4. Chạy ứng dụng

```powershell
npm run dev
```

Mở:

```text
http://localhost:3000
```

### 5. Tài khoản admin mẫu

```text
Email: admin@electroshop.vn
Mật khẩu: ElectroShop@2026!
```

> Chỉ dùng cho môi trường local. Nên đổi mật khẩu trước khi demo hoặc deploy thật.

Nếu tài khoản admin đã tồn tại từ lần cài đặt trước và mật khẩu mẫu không đăng nhập được, bản ghi trong database có thể đang giữ hash cũ. Cập nhật lại `password_hash` bằng hash bcrypt mới cho `admin@electroshop.vn`; import lại `schema.sql` không tự cập nhật bản ghi đã tồn tại.

Nếu gặp `EADDRINUSE` trên cổng 3000, app khác hoặc một instance ElectroShop khác đang sử dụng cổng đó. Dùng instance đang chạy hoặc đổi `PORT` trong `.env` sang cổng còn trống.

## Kiểm tra luồng người dùng

### Luồng đã xác minh

- [x] Trang chủ render thành công
- [x] Trang đăng nhập render thành công
- [x] Đăng nhập admin và mở dashboard thành công trên database local
- [x] Danh sách và chi tiết sản phẩm hiển thị ảnh trên database local
- [x] Mở trang yêu thích sau khi đăng nhập
- [ ] Đăng ký tài khoản mới sau khi MySQL đang chạy
- [ ] Đăng nhập tài khoản khách hàng
- [ ] Thêm sản phẩm vào giỏ hàng
- [ ] Cập nhật số lượng trong giỏ hàng
- [ ] Đặt hàng và xem đơn hàng
- [ ] Hủy đơn ở trạng thái chờ xác nhận
- [ ] Đánh giá sản phẩm sau khi hoàn tất đơn hàng
- [ ] Admin quản trị danh mục/sản phẩm/đơn hàng

### Lưu ý thực tế

Khi MySQL chưa chạy hoặc schema chưa được import:

- login trả về “Email hoặc mật khẩu không đúng.”
- các flow phụ thuộc database sẽ không hoạt động
- app vẫn có thể boot nhưng không có dữ liệu người dùng/sản phẩm để test

Database cũ chưa có bảng `wishlist_items` có thể khiến trang chi tiết sản phẩm và wishlist lỗi khi đăng nhập. Tạo bảng này theo định nghĩa trong `database/migration-reviews-wishlist.sql`; không cần import lại toàn bộ `schema.sql`.

Tài khoản admin mẫu, danh sách/chi tiết sản phẩm và trang wishlist đã được kiểm tra trên database local. Các luồng đăng ký, thêm giỏ, checkout và xử lý đơn hàng chưa được xác minh end-to-end.

## Cấu trúc thư mục

```text
config/         Cấu hình DB và môi trường
controllers/    Logic nghiệp vụ
database/       Schema SQL và dữ liệu mẫu
middlewares/    Middleware auth, quyền, bảo mật
models/         Query dữ liệu
public/         CSS, JS, ảnh tĩnh
routes/         Định tuyến Express
views/          Templates EJS
app.js          Khởi tạo server
README.md       Hướng dẫn dự án
```

## Hạng mục chưa hoàn thiện

- Phân trang sản phẩm / đơn hàng
- Thanh toán online (VNPay/Momo sandbox)
- Thống kê doanh thu dạng biểu đồ
- Tự động hóa kiểm thử
- Deploy production và báo cáo bảo vệ

## Lưu ý quan trọng

- Giỏ hàng hiện đang lưu trong session, không đồng bộ giữa các thiết bị.
- Dự án đang tập trung vào phương án Express + EJS + MySQL theo đúng đề tài đồ án.
- Chưa có CI/CD hay test suite tự động trong package.json.

