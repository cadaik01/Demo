# Expense Tracker

Ứng dụng quản lý chi tiêu cá nhân xây dựng bằng Express.js. Dữ liệu lưu trong MongoDB, giao diện render phía server bằng Pug.

---

## Mục tiêu học tập

| Khái niệm | Áp dụng ở đâu |
|-----------|---------------|
| CRUD routes | Thêm, sửa, xóa expense |
| `req.query` | Lọc theo danh mục, tháng |
| `req.params` | Lấy expense theo ID |
| `req.body` | Nhận dữ liệu từ form |
| Middleware | Validate dữ liệu trước khi lưu |
| Xử lý date | Group chi tiêu theo tháng |
| Aggregate data | Tính tổng, tính trung bình bằng MongoDB Aggregation Pipeline |
| Mongoose | Định nghĩa Schema, Model, kết nối MongoDB |
| Pug template | Render danh sách, form, dashboard |
| `express.static` | Phục vụ CSS |

---

## Tính năng

### 1. Dashboard (`/`)
- Tổng chi tiêu tháng hiện tại
- So sánh với tháng trước (tăng/giảm bao nhiêu %)
- Bảng breakdown chi tiêu theo từng danh mục trong tháng
- 5 khoản chi gần nhất

### 2. Danh sách chi tiêu (`/expenses`)
- Hiển thị toàn bộ lịch sử
- Lọc theo danh mục: `?category=food`
- Lọc theo tháng: `?month=2026-05`
- Kết hợp cả hai: `?category=food&month=2026-05`
- Sắp xếp theo ngày mới nhất lên trên

### 3. Thêm chi tiêu (`/expenses/new`)
- Form nhập: tiêu đề, số tiền, danh mục, ngày
- Validate: không được để trống, số tiền phải là số dương
- Sau khi lưu redirect về danh sách

### 4. Chỉnh sửa (`/expenses/:id/edit`)
- Form điền sẵn dữ liệu cũ
- Lưu lại và redirect về danh sách

### 5. Xóa (`/expenses/:id/delete`)
- Xóa và redirect về danh sách

---

## Data Model

Mongoose Schema định nghĩa trong `models/Expense.js`:

```js
const expenseSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  amount:   { type: Number, required: true, min: 1 },
  category: {
    type: String,
    enum: ['food', 'transport', 'shopping', 'health', 'entertainment', 'other'],
    required: true
  },
  date: { type: Date, required: true }
}, { timestamps: true });
```

| Field | Type | Mô tả |
|-------|------|-------|
| `_id` | ObjectId | Tự sinh bởi MongoDB |
| `title` | String | Tên khoản chi |
| `amount` | Number | Số tiền (VNĐ, số nguyên dương) |
| `category` | String | Một trong các danh mục bên dưới |
| `date` | Date | Ngày phát sinh chi tiêu |
| `createdAt` | Date | Tự sinh bởi Mongoose (`timestamps`) |

**Danh mục (category):**
- `food` — Ăn uống
- `transport` — Di chuyển
- `shopping` — Mua sắm
- `health` — Sức khỏe
- `entertainment` — Giải trí
- `other` — Khác

---

## Routes

| Method | Path | Nhiệm vụ |
|--------|------|----------|
| `GET` | `/` | Dashboard tổng quan |
| `GET` | `/expenses` | Danh sách, hỗ trợ filter qua query string |
| `GET` | `/expenses/new` | Hiển thị form thêm mới |
| `POST` | `/expenses` | Nhận form, validate, lưu vào MongoDB |
| `GET` | `/expenses/:id/edit` | Hiển thị form chỉnh sửa |
| `POST` | `/expenses/:id` | Nhận form, cập nhật vào MongoDB |
| `POST` | `/expenses/:id/delete` | Xóa khỏi MongoDB, redirect |

> HTML form chỉ hỗ trợ GET và POST, không dùng được PUT/DELETE trực tiếp nên dùng POST cho cả update và delete.

---

## Cấu trúc thư mục

```
expense-tracker/
├── models/
│   └── Expense.js             ← Mongoose Schema + Model
├── config/
│   └── db.js                  ← kết nối MongoDB
├── routes/
│   ├── index.js               ← route "/"
│   └── expenses.js            ← route "/expenses/*"
├── views/
│   ├── layout.pug             ← layout chung (nav, head)
│   ├── index.pug              ← dashboard
│   ├── expenses/
│   │   ├── list.pug           ← danh sách + filter
│   │   ├── new.pug            ← form thêm mới
│   │   └── edit.pug           ← form chỉnh sửa
│   └── error.pug
├── public/
│   └── style.css
├── app.js
├── .env                       ← MONGODB_URI
└── package.json
```

---

## Kết nối MongoDB (`config/db.js`)

```js
const mongoose = require('mongoose');

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
}

module.exports = connectDB;
```

Gọi trong `app.js`:

```js
const connectDB = require('./config/db');
connectDB();
```

Biến môi trường trong `.env`:
```
MONGODB_URI=mongodb://localhost:27017/expense-tracker
```

---

## Logic nghiệp vụ quan trọng

### Lọc theo tháng (`req.query`)
```js
// ?month=2026-05
const [year, month] = req.query.month.split('-');
const start = new Date(year, month - 1, 1);
const end   = new Date(year, month, 1);       // đầu tháng kế tiếp

Expense.find({ date: { $gte: start, $lt: end } });
```

### Tính tổng + breakdown bằng Aggregation Pipeline
```js
Expense.aggregate([
  { $match: { date: { $gte: start, $lt: end } } },
  { $group: {
      _id: '$category',
      total: { $sum: '$amount' },
      count: { $sum: 1 }
  }},
  { $sort: { total: -1 } }
]);
```

### So sánh với tháng trước
```
tổng tháng hiện tại  → query MongoDB
tổng tháng trước     → query MongoDB
% thay đổi: (hiện tại - trước) / trước * 100
```

---

## Thứ tự thực hiện

1. **Scaffold** — tạo project bằng express-generator
2. **Cài package** — `mongoose`, `dotenv`
3. **`config/db.js`** — kết nối MongoDB, gọi trong `app.js`
4. **`models/Expense.js`** — định nghĩa Schema
5. **CRUD cơ bản** — list, new, create, delete (chưa cần filter)
6. **Edit/Update** — hoàn thiện vòng CRUD
7. **Filter** — thêm logic lọc theo `req.query`
8. **Dashboard** — Aggregation Pipeline tính tổng + breakdown
9. **CSS** — style giao diện

---

## Package cần cài

```bash
npm install mongoose dotenv
```

---

## Stack

| Thành phần | Công nghệ |
|-----------|-----------|
| Framework | Express.js 5.x |
| Template | Pug |
| CSS | CSS thuần |
| Database | MongoDB + Mongoose |
| Runtime | Node.js |
