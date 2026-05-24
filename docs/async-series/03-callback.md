# 03 — Callback Pattern

## 1. Callback là gì?

**Callback = một hàm được truyền vào hàm khác như tham số, và được gọi sau khi việc hoàn thành.**

Đây là cơ chế async **đầu tiên và cũ nhất** trong JavaScript/Node.js.

```js
// Cấu trúc tổng quát
function doSomethingAsync(input, callback) {
    // Làm việc gì đó bất đồng bộ...
    // Khi xong, gọi callback
    callback(error, result)  // convention: lỗi trước, kết quả sau
}

// Cách gọi
doSomethingAsync('data', function(err, result) {
    if (err) {
        // xử lý lỗi
    }
    // dùng result
})
```

---

## 2. Node.js Error-First Callback Convention

Node.js dùng quy ước **error-first callback** (còn gọi là Node.js-style callback hay errback):

- **Tham số đầu tiên** luôn là `error` (nếu thành công thì là `null`)
- **Tham số thứ hai** trở đi là kết quả

```js
const fs = require('fs')

fs.readFile('./data.txt', 'utf-8', function(err, data) {
    //                              ^^^  ^^^^
    //                           lỗi    kết quả

    if (err) {
        console.error('Lỗi đọc file:', err.message)
        return  // ← quan trọng: return để không chạy tiếp
    }

    console.log('Nội dung file:', data)
})
```

> **Tại sao error trước?** Để buộc developer phải kiểm tra lỗi trước khi dùng kết quả. Nếu để result trước, nhiều người sẽ quên kiểm tra lỗi.

---

## 3. Ví dụ thực tế: Đọc file

```js
const fs = require('fs')

// Đọc file config
fs.readFile('./config.json', 'utf-8', function(err, data) {
    if (err) {
        console.error('Không tìm thấy config:', err.message)
        return
    }

    const config = JSON.parse(data)
    console.log('Port:', config.port)
})

console.log('Server đang khởi động...')
// In ra "Server đang khởi động..." TRƯỚC, rồi mới in config
```

---

## 4. Callback Hell (Địa ngục callback)

Vấn đề lớn nhất của callback: khi cần làm nhiều việc **theo thứ tự**, code lồng nhau sâu dần.

**Tình huống:** Đăng ký user → tìm kiếm theo tên → đọc profile → lưu log

```js
// ❌ CALLBACK HELL - khó đọc, khó maintain
db.findUser(username, function(err, user) {
    if (err) return handleError(err)

    db.checkPermission(user.id, function(err, permission) {
        if (err) return handleError(err)

        db.getProfile(user.id, function(err, profile) {
            if (err) return handleError(err)

            fs.writeFile('./log.txt', user.id, function(err) {
                if (err) return handleError(err)

                sendEmail(user.email, profile, function(err) {
                    if (err) return handleError(err)

                    res.json({ success: true })
                    // Đây là cấp 5 lồng nhau!
                    // Hình dạng code như kim tự tháp → "Pyramid of Doom"
                })
            })
        })
    })
})
```

**Vấn đề của callback hell:**
- Khó đọc (phải scroll ngang)
- Khó debug
- Khó xử lý lỗi đồng nhất
- Khó tái sử dụng code

---

## 5. Cách giảm nhẹ Callback Hell

### Cách 1: Named functions (đặt tên hàm)

```js
// Tách các callback thành hàm có tên
function onUserFound(err, user) {
    if (err) return handleError(err)
    db.checkPermission(user.id, onPermissionChecked)
}

function onPermissionChecked(err, permission) {
    if (err) return handleError(err)
    db.getProfile(permission.userId, onProfileLoaded)
}

function onProfileLoaded(err, profile) {
    if (err) return handleError(err)
    // ...
}

// Code chính gọn hơn nhiều
db.findUser(username, onUserFound)
```

### Cách 2: Async library (cách cũ)

```js
const async = require('async')  // thư viện 'async'

async.waterfall([
    function(callback) {
        db.findUser(username, callback)
    },
    function(user, callback) {
        db.checkPermission(user.id, callback)
    },
    function(permission, callback) {
        db.getProfile(permission.userId, callback)
    }
], function(err, result) {
    if (err) return handleError(err)
    res.json(result)
})
```

> **Lưu ý:** Cả hai cách trên chỉ là "giảm nhẹ", không giải quyết gốc rễ. Giải pháp thực sự là **Promise** (bài 04) và **Async/Await** (bài 05).

---

## 6. Tự tạo hàm có callback

```js
// Tạo hàm async của riêng bạn
function delay(ms, callback) {
    setTimeout(function() {
        callback(null, `Đã chờ ${ms}ms`)  // null = không có lỗi
    }, ms)
}

// Giả lập query database
function queryDatabase(id, callback) {
    setTimeout(function() {
        if (!id) {
            callback(new Error('ID không hợp lệ'))
            return
        }
        const user = { id, name: 'Nguyen Van A', age: 25 }
        callback(null, user)
    }, 100)
}

// Sử dụng
queryDatabase(1, function(err, user) {
    if (err) {
        console.error(err.message)
        return
    }
    console.log('User:', user.name)
})
```

---

## 7. Callback trong Express

```js
const express = require('express')
const fs = require('fs')
const app = express()

// Route dùng callback style (cách cũ)
app.get('/file', function(req, res) {
    fs.readFile('./data.json', 'utf-8', function(err, data) {
        if (err) {
            // Nếu có lỗi, trả về lỗi 500
            return res.status(500).json({ error: err.message })
        }

        const parsed = JSON.parse(data)
        res.json(parsed)
    })
})
```

> Đây là pattern **cũ**. Ngày nay Express handler thường dùng async/await (bài 05). Nhưng bạn vẫn sẽ gặp callback trong nhiều codebase cũ.

---

## 8. Pros & Cons

### Ưu điểm
- Đơn giản, không cần hiểu thêm gì khác
- Native JavaScript, không cần library
- Hiểu callback = hiểu được mọi codebase Node.js cũ

### Nhược điểm
- Callback hell khi nhiều tác vụ nối tiếp
- Xử lý lỗi lặp đi lặp lại (`if (err) return`)
- Khó dùng với các cấu trúc điều khiển (`try/catch`, `for` loop)
- Không thể `return` giá trị từ callback ra ngoài

---

## 9. Khi nào nên dùng Callback?

| Nên dùng | Không nên dùng |
|----------|----------------|
| Viết module low-level (như viết thư viện) | Logic business phức tạp, nhiều bước |
| Event listener (`emitter.on('event', fn)`) | Khi cần xử lý nhiều async song song |
| Compatibility với API cũ | Khi muốn code dễ đọc, dễ test |
| setTimeout, setInterval | |

---

## Tóm tắt

- Callback = hàm được truyền vào và gọi sau khi xong việc
- Node.js convention: `callback(err, result)` — lỗi trước
- **Luôn** kiểm tra `err` và `return` ngay nếu có lỗi
- Callback hell = lồng nhiều callback → khó đọc
- Giải pháp tốt hơn: **Promise** và **Async/Await**

**Tiếp theo:** [04 — Promise](./04-promise.md)
