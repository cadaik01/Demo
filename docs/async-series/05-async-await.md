# 05 — Async/Await

## 1. Async/Await là gì?

**Async/Await là cú pháp "sugar" trên Promise** — giúp viết code async trông như code sync.

Không có gì mới về cơ chế bên dưới. Async/Await vẫn dùng Promise, chỉ là cú pháp đẹp hơn.

```js
// Promise style
function getUser(id) {
    return findUserById(id)
        .then(user => getProfile(user.id))
        .then(profile => profile)
        .catch(err => { throw err })
}

// Async/Await style — cùng kết quả, dễ đọc hơn nhiều
async function getUser(id) {
    const user = await findUserById(id)
    const profile = await getProfile(user.id)
    return profile
}
```

---

## 2. Cú pháp cơ bản

### `async` function

```js
// Khai báo async function
async function fetchData() {
    return 'kết quả'
}

// Arrow function async
const fetchData = async () => {
    return 'kết quả'
}

// Method trong object/class
const obj = {
    async getData() {
        return 'kết quả'
    }
}
```

> `async function` **luôn trả về một Promise**, dù bạn có `return` Promise hay không.

```js
async function demo() {
    return 42  // Thực ra trả về Promise.resolve(42)
}

demo().then(val => console.log(val))  // in ra: 42
```

### `await`

```js
// await chỉ dùng TRONG async function
async function example() {
    const result = await somePromise()
    //             ^^^^^
    // Dừng lại đây, chờ somePromise() resolve
    // Sau đó gán kết quả vào result
    console.log(result)
}
```

> `await` không block Event Loop! Nó "pause" **hàm hiện tại**, cho phép Event Loop xử lý việc khác.

---

## 3. So sánh Callback → Promise → Async/Await

Cùng một tác vụ: đọc file → parse JSON → in tên

```js
// --- CALLBACK ---
const fs = require('fs')

fs.readFile('./user.json', 'utf-8', function(err, data) {
    if (err) {
        console.error(err)
        return
    }
    const user = JSON.parse(data)
    console.log(user.name)
})

// --- PROMISE ---
const fs = require('fs').promises

fs.readFile('./user.json', 'utf-8')
    .then(data => JSON.parse(data))
    .then(user => console.log(user.name))
    .catch(err => console.error(err))

// --- ASYNC/AWAIT ---
const fs = require('fs').promises

async function readUser() {
    try {
        const data = await fs.readFile('./user.json', 'utf-8')
        const user = JSON.parse(data)
        console.log(user.name)
    } catch (err) {
        console.error(err)
    }
}

readUser()
```

Async/Await đọc như code thông thường từ trên xuống dưới.

---

## 4. Xử lý lỗi với try/catch

```js
async function processOrder(orderId) {
    try {
        const order = await findOrder(orderId)

        if (order.status === 'cancelled') {
            throw new Error('Đơn hàng đã bị hủy')  // throw hoạt động bình thường
        }

        const payment = await processPayment(order)
        const receipt = await sendReceipt(payment)

        return receipt

    } catch (err) {
        // Bắt lỗi từ BẤT KỲ await nào ở trên
        console.error('Lỗi xử lý đơn hàng:', err.message)
        throw err  // re-throw nếu muốn caller biết có lỗi
    } finally {
        await cleanupTempData()  // luôn chạy
    }
}
```

---

## 5. Chạy Song Song với Async/Await

**Lỗi phổ biến của người mới:** await từng cái một khi không cần thiết.

```js
// ❌ CHẬM — tuần tự: 100ms + 80ms + 90ms = 270ms
async function slowVersion() {
    const user = await fetchUser()        // chờ 100ms
    const products = await fetchProducts() // chờ thêm 80ms
    const settings = await fetchSettings() // chờ thêm 90ms
    return { user, products, settings }
}

// ✅ NHANH — song song: chỉ mất ~100ms (cái lâu nhất)
async function fastVersion() {
    const [user, products, settings] = await Promise.all([
        fetchUser(),
        fetchProducts(),
        fetchSettings()
    ])
    return { user, products, settings }
}
```

**Quy tắc:** Nếu các tác vụ **không phụ thuộc nhau**, dùng `Promise.all`.  
Nếu tác vụ sau **cần kết quả** của tác vụ trước → await tuần tự.

```js
async function correctSequential() {
    const user = await fetchUser()          // cần user.id trước
    const profile = await fetchProfile(user.id)  // mới fetch được profile
    const friends = await fetchFriends(user.id)  // độc lập với profile

    // profile và friends độc lập nhau → chạy song song
    const [profile, friends] = await Promise.all([
        fetchProfile(user.id),
        fetchFriends(user.id)
    ])
    return { user, profile, friends }
}
```

---

## 6. Async/Await trong Express

```js
const express = require('express')
const app = express()

// Route handler là async function
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy user' })
        }

        res.json(user)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ❗ VẤN ĐỀ: nếu quên try/catch, Express không tự bắt lỗi async
// Lỗi sẽ dẫn đến "UnhandledPromiseRejection" và crash
```

**Giải pháp: Wrapper function**

```js
// Utility function để bọc async handler
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next)
        //                                        ^^^^
        //                           chuyển lỗi đến Express error handler
    }
}

// Dùng như sau — không cần try/catch trong mỗi route
app.get('/users/:id', asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (!user) return res.status(404).json({ message: 'Not found' })

    res.json(user)
}))

// Express error handler bắt tất cả
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: err.message })
})
```

---

## 7. Async/Await với vòng lặp

```js
// ✅ for...of với await — tuần tự
async function processItems(items) {
    for (const item of items) {
        await processItem(item)  // chờ từng cái
    }
}

// ✅ song song với Promise.all + map
async function processItemsParallel(items) {
    await Promise.all(items.map(item => processItem(item)))
}

// ❌ forEach KHÔNG hoạt động với await!
async function broken(items) {
    items.forEach(async (item) => {
        await processItem(item)  // forEach không chờ async callback!
    })
    console.log('Xong')  // in TRƯỚC khi tất cả items được xử lý
}
```

---

## 8. Top-level Await (Node.js 14.8+)

```js
// Trong ES modules (.mjs hoặc "type": "module" trong package.json)
// Có thể dùng await ở top-level, không cần bọc trong async function

const data = await fetchData()
console.log(data)

// Hữu ích khi cần async trong module initialization
```

---

## 9. Async/Await với Mongoose (MongoDB)

```js
// Ví dụ Express + Mongoose
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: String,
    email: String
})

const User = mongoose.model('User', userSchema)

// Route tạo user
app.post('/users', asyncHandler(async (req, res) => {
    const { name, email } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
        return res.status(409).json({ message: 'Email đã tồn tại' })
    }

    const user = new User({ name, email })
    await user.save()

    res.status(201).json(user)
}))

// Route lấy danh sách
app.get('/users', asyncHandler(async (req, res) => {
    const users = await User.find({}).sort({ name: 1 })
    res.json(users)
}))
```

---

## 10. Pros & Cons

### Ưu điểm
- Code async trông như sync → dễ đọc, dễ hiểu
- Try/catch quen thuộc để xử lý lỗi
- Debug dễ hơn (stack trace rõ ràng hơn)
- Dễ viết logic tuần tự có điều kiện

### Nhược điểm
- Vẫn phải hiểu Promise bên dưới
- Dễ nhầm khi song song hóa (await tuần tự trong khi có thể dùng `Promise.all`)
- Không dùng được trong non-async context mà không wrapper
- `forEach` + async là bẫy phổ biến

---

## Tóm tắt

| | Callback | Promise | Async/Await |
|--|---------|---------|-------------|
| Cú pháp | Lồng nhau | Chaining | Flat, như sync |
| Xử lý lỗi | `if (err)` mỗi bước | `.catch()` cuối chain | `try/catch` |
| Song song | Khó | `Promise.all` | `await Promise.all` |
| Dễ đọc | Thấp | Trung bình | Cao |
| Khi nào dùng | Event listener, API cũ | Utility function | Express handler, business logic |

**Tiếp theo:** [06 — EventEmitter](./06-event-emitter.md)
