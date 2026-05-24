# 04 — Promise

## 1. Promise là gì?

**Promise = một "cam kết" về một giá trị sẽ có trong tương lai.**

Khi bạn gọi một hàm async trả về Promise, bạn nhận ngay một object Promise — như một "phiếu hẹn". Sau đó bạn dùng `.then()` để nhận kết quả khi sẵn sàng.

```js
// Ví dụ minh họa
const phieuHen = orderCoffee()   // nhận phiếu ngay, không chờ

// Khi cà phê xong (thành công)
phieuHen.then(coffee => drinkCoffee(coffee))

// Nếu hết nguyên liệu (thất bại)
phieuHen.catch(err => orderAlternative(err))
```

---

## 2. Ba trạng thái của Promise

```
┌─────────────┐
│   PENDING   │  ← đang chờ kết quả (trạng thái ban đầu)
└──────┬──────┘
       │
  ┌────┴────┐
  │         │
  ▼         ▼
┌──────────┐  ┌──────────┐
│ FULFILLED│  │ REJECTED │
│ (resolve)│  │ (reject) │
└──────────┘  └──────────┘
thành công       thất bại
```

- **Pending:** Promise đang được xử lý, chưa có kết quả
- **Fulfilled:** Tác vụ thành công, có giá trị kết quả
- **Rejected:** Tác vụ thất bại, có lý do lỗi

> Promise chỉ thay đổi trạng thái **một lần duy nhất** và **không thể đảo ngược**.

---

## 3. Tạo Promise

```js
const myPromise = new Promise((resolve, reject) => {
    //                         ^^^^^^^  ^^^^^^
    //                       thành công  thất bại

    // Làm việc gì đó...
    const success = true

    if (success) {
        resolve('Kết quả thành công')   // Promise → FULFILLED
    } else {
        reject(new Error('Có lỗi xảy ra'))  // Promise → REJECTED
    }
})
```

**Ví dụ thực tế: giả lập query database**

```js
function findUserById(id) {
    return new Promise((resolve, reject) => {
        // Giả lập I/O delay
        setTimeout(() => {
            const users = [
                { id: 1, name: 'An' },
                { id: 2, name: 'Bình' }
            ]
            const user = users.find(u => u.id === id)

            if (user) {
                resolve(user)
            } else {
                reject(new Error(`Không tìm thấy user id=${id}`))
            }
        }, 100)
    })
}
```

---

## 4. Sử dụng Promise: .then() và .catch()

```js
findUserById(1)
    .then(user => {
        console.log('Tìm thấy:', user.name)
        return user  // có thể return giá trị tiếp theo
    })
    .catch(err => {
        console.error('Lỗi:', err.message)
    })
    .finally(() => {
        console.log('Luôn chạy dù thành công hay thất bại')
    })
```

---

## 5. Promise Chaining — thay thế Callback Hell

Nhớ callback hell từ bài 03? Đây là cách Promise giải quyết:

```js
// ❌ Callback hell (bài 03)
db.findUser(id, function(err, user) {
    db.getProfile(user.id, function(err, profile) {
        db.getSettings(profile.id, function(err, settings) {
            res.json(settings)
        })
    })
})

// ✅ Promise chaining — phẳng hơn, dễ đọc hơn
db.findUser(id)
    .then(user => db.getProfile(user.id))
    .then(profile => db.getSettings(profile.id))
    .then(settings => res.json(settings))
    .catch(err => res.status(500).json({ error: err.message }))
```

**Nguyên tắc chaining:**
- Mỗi `.then()` nhận kết quả từ `.then()` trước
- Nếu return một Promise, `.then()` tiếp theo sẽ đợi Promise đó
- `.catch()` ở cuối bắt **mọi** lỗi trong toàn bộ chain

---

## 6. Xử lý lỗi trong Promise Chain

```js
findUserById(1)
    .then(user => {
        if (!user.isActive) {
            throw new Error('User không active')  // ném lỗi
        }
        return getProfile(user.id)
    })
    .then(profile => {
        return sendWelcomeEmail(profile.email)
    })
    .catch(err => {
        // Bắt lỗi từ BẤT KỲ .then() nào ở trên
        console.error('Lỗi trong chain:', err.message)
        // Nếu muốn tiếp tục chain (recovery):
        return { status: 'failed', reason: err.message }
    })
    .then(result => {
        // Chạy dù catch ở trên có bắt lỗi hay không (nếu catch return giá trị)
        console.log('Kết quả cuối:', result)
    })
```

---

## 7. Promise.all — Chạy song song, chờ tất cả

```js
// Tình huống: cần dữ liệu từ 3 nguồn CÙNG LÚC
// Nếu dùng chaining: chờ từng cái → 300ms
// Nếu dùng Promise.all: chờ cái lâu nhất → ~100ms

const p1 = fetchUser(1)       // 100ms
const p2 = fetchProducts()    // 80ms
const p3 = fetchSettings()    // 90ms

Promise.all([p1, p2, p3])
    .then(([user, products, settings]) => {
        // Tất cả đều xong, kết quả theo thứ tự truyền vào
        res.json({ user, products, settings })
    })
    .catch(err => {
        // Nếu BẤT KỲ promise nào fail → vào catch ngay
        res.status(500).json({ error: err.message })
    })
```

> **Quan trọng:** `Promise.all` fail nhanh — một cái lỗi là cả nhóm bị hủy.

---

## 8. Promise.allSettled — Chạy song song, không bỏ sót

```js
// Khác all: không dừng khi có lỗi, chờ TẤT CẢ hoàn thành
Promise.allSettled([
    fetchUser(1),
    fetchUser(999),   // user này không tồn tại
    fetchProducts()
])
.then(results => {
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            console.log('Thành công:', result.value)
        } else {
            console.log('Thất bại:', result.reason.message)
        }
    })
})
```

---

## 9. Promise.race — Ai xong trước dùng cái đó

```js
// Dùng cho timeout pattern
const fetchData = fetch('/api/data')
const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), 5000)
)

Promise.race([fetchData, timeout])
    .then(data => res.json(data))
    .catch(err => res.status(504).json({ error: err.message }))
```

---

## 10. Promisify — Chuyển đổi callback sang Promise

Node.js có sẵn `util.promisify` để chuyển callback-style sang Promise-style:

```js
const fs = require('fs')
const { promisify } = require('util')

// Bọc hàm callback thành Promise
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

// Bây giờ dùng được .then()
readFile('./data.txt', 'utf-8')
    .then(data => console.log(data))
    .catch(err => console.error(err))
```

**Hoặc dùng fs.promises (modern):**

```js
const fs = require('fs').promises
// hoặc
const { readFile, writeFile } = require('fs/promises')

readFile('./data.txt', 'utf-8')
    .then(data => console.log(data))
```

---

## 11. Các phương thức Promise tổng hợp

| Phương thức | Behavior | Dùng khi |
|-------------|----------|----------|
| `Promise.all([...])` | Chờ tất cả, fail nếu 1 cái fail | Cần tất cả kết quả, 1 fail là không dùng được |
| `Promise.allSettled([...])` | Chờ tất cả, không fail | Muốn biết kết quả của từng cái dù fail |
| `Promise.race([...])` | Lấy cái xong trước tiên | Timeout pattern, fastest-response |
| `Promise.any([...])` | Lấy cái thành công đầu tiên | Có nhiều nguồn dự phòng |
| `Promise.resolve(val)` | Tạo Promise fulfilled ngay | Wrap giá trị sync thành Promise |
| `Promise.reject(err)` | Tạo Promise rejected ngay | Test, short-circuit |

---

## 12. Pros & Cons của Promise

### Ưu điểm
- Giải quyết callback hell với chaining phẳng
- Xử lý lỗi tập trung (`.catch()` một chỗ)
- Dễ chạy song song (`Promise.all`)
- Tích hợp tốt với `async/await`

### Nhược điểm
- `.then()` chain dài vẫn khó đọc hơn code sync
- Debug stack trace khó hơn callback
- Phải hiểu Promise lifecycle để tránh "silent" (Promise bị bỏ không `.catch()`)

---

## Tóm tắt

- Promise = object đại diện cho giá trị tương lai (3 trạng thái: pending/fulfilled/rejected)
- `.then()` xử lý thành công, `.catch()` xử lý lỗi, `.finally()` luôn chạy
- Chaining giải quyết callback hell
- `Promise.all` chạy song song (fail nhanh)
- `Promise.allSettled` chạy song song (chờ tất cả)
- `util.promisify` chuyển callback → Promise

**Tiếp theo:** [05 — Async/Await](./05-async-await.md)
