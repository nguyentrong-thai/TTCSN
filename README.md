# ElectroShop - Website bán đồ điện tử (Bài tập lớn)

## Công nghệ
- Node.js + Express
- EJS
- MySQL (mysql2)
- express-session, bcrypt, multer, express-validator

## Cài đặt

```bash
npm install
cp .env.example .env      # rồi chỉnh sửa thông tin DB trong .env
```

## Tạo cơ sở dữ liệu

1. Bật MySQL (Laragon / XAMPP...).
2. Import file `database/schema.sql` (tạo DB `electro_shop`, các bảng, và dữ liệu mẫu).

## Chạy project

```bash
npm run dev     # hoặc npm start
```

Truy cập: http://localhost:3000

## Cấu trúc thư mục

```
config/       cấu hình kết nối DB
controllers/  logic xử lý request
models/       truy vấn CSDL
routes/       định tuyến
views/        giao diện EJS
public/       css, js, ảnh tĩnh
middlewares/  kiểm tra đăng nhập, phân quyền admin
database/     file schema.sql
```

## Lộ trình đã/sẽ hoàn thành
- [x] Khởi tạo project, cấu hình DB, schema SQL
- [x] Đăng ký / đăng nhập / phân quyền
- [ ] CRUD sản phẩm + danh mục (admin)
- [ ] Hiển thị sản phẩm, tìm kiếm, lọc (người dùng)
- [ ] Giỏ hàng + đặt hàng
- [ ] Quản lý đơn hàng (admin)
- [ ] Hoàn thiện giao diện + báo cáo
