# 07 — Async trong Express: Routes, Middleware, Error Handling

## 1. Vấn đề: Express và Async mặc định

Express được thiết kế trước khi `async/await` trở thành standard. Điều này gây ra một vấn đề quan trọng:

```js
// ❌ NGUY HIỂM: Express KHÔNG tự bắt lỗi từ async handler
app.get('/users', async (req, res) => {
    const users = await User.find({})  // Nếu dòng này throw error...
    res.json(users)
    // Error sẽ trở thành UnhandledPromiseRejection → crash hoặc request treo mãi
})
```

**Express chỉ bắt lỗi sync** (qua `next(err)`) và lỗi từ callback `next`.

---

## 2. Pattern 1: Try/Catch trong mỗi route (cơ bản)

```js
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({ message: 'User không tồn tại' })
        }

        res.json(user)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})
```

**Vấn đề:** Lặp đi lặp lại `try/catch` trong mọi route. Nếu 50 routes thì 50 lần viết try/catch.

---

## 3. Pattern 2: asyncHandler Wrapper (khuyên dùng)

```js
// utils/asyncHandler.js
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch(next)  // chuyển lỗi vào Express error pipeline
    }
}

module.exports = asyncHandler
```

```js
// routes/users.js
const asyncHandler = require('../utils/asyncHandler')

// Không cần try/catch nữa!
app.get('/users/:id', asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return res.status(404).json({ message: 'User không tồn tại' })
    }

    res.json(user)
}))

// Lỗi tự động đi đến Express error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: err.message })
})
```

---

## 4. Pattern 3: express-async-errors (thư viện)

```bash
npm install express-async-errors
```

```js
// Chỉ cần require một lần ở đầu app.js
require('express-async-errors')

const express = require('express')
const app = express()

// Sau đó viết async handler bình thường, không cần wrapper
app.get('/users', async (req, res) => {
    const users = await User.find({})
    res.json(users)
    // Lỗi tự động chuyển đến next(err)
})

app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message })
})
```

---

## 5. Async Middleware

Middleware cũng có thể là async:

```js
// Middleware xác thực (authentication)
const authenticate = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'Thiếu token' })
    }

    const decoded = await verifyToken(token)      // async operation
    const user = await User.findById(decoded.id)  // async operation

    if (!user) {
        return res.status(401).json({ message: 'User không tồn tại' })
    }

    req.user = user  // attach user vào request
    next()           // tiếp tục middleware tiếp theo
})

// Authorization middleware
const authorize = (...roles) => asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Không có quyền' })
    }
    next()
})

// Dùng trong routes
app.get('/admin/users',
    authenticate,
    authorize('admin'),
    asyncHandler(async (req, res) => {
        const users = await User.find({})
        res.json(users)
    })
)
```

---

## 6. Error Handling Architecture

```js
// Tạo custom error classes
class AppError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
        this.isOperational = true  // lỗi có thể dự đoán, không phải bug
    }
}

class NotFoundError extends AppError {
    constructor(resource) {
        super(`${resource} không tìm thấy`, 404)
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400)
    }
}
```

```js
// Routes ném custom errors
app.get('/users/:id', asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (!user) throw new NotFoundError('User')  // gọn hơn

    res.json(user)
}))

// Error handler tập trung
app.use((err, req, res, next) => {
    // Lỗi có thể dự đoán (operational)
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        })
    }

    // Lỗi không mong đợi (bug trong code)
    console.error('UNEXPECTED ERROR:', err)
    res.status(500).json({
        status: 'error',
        message: 'Đã có lỗi xảy ra. Vui lòng thử lại.'
        // Không expose err.message với bug thực
    })
})
```

---

## 7. Async trong Router

```js
const express = require('express')
const router = express.Router()

// Tất cả routes trong router đều dùng asyncHandler
router.get('/', asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query
    const users = await User.find({})
        .skip((page - 1) * limit)
        .limit(Number(limit))
    res.json(users)
}))

router.get('/:id', asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (!user) throw new NotFoundError('User')
    res.json(user)
}))

router.post('/', asyncHandler(async (req, res) => {
    const user = await User.create(req.body)
    res.status(201).json(user)
}))

router.put('/:id', asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (!user) throw new NotFoundError('User')
    res.json(user)
}))

router.delete('/:id', asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) throw new NotFoundError('User')
    res.status(204).send()
}))

module.exports = router
```

---

## 8. Thứ tự Middleware trong Express

```
Request
  │
  ▼
[Body Parser]           ← express.json()
  │
  ▼
[Static Files]          ← express.static()
  │
  ▼
[Logger]                ← morgan, custom logger
  │
  ▼
[Rate Limiter]          ← express-rate-limit
  │
  ▼
[Authentication]        ← verifyToken middleware
  │
  ▼
[Router]                ← app.use('/api/users', userRouter)
  │
  ▼
[404 Handler]           ← app.use('*', ...) — route không tồn tại
  │
  ▼
[Error Handler]         ← app.use((err,req,res,next) => ...)
```

> **Quan trọng:** Error handler phải có **4 tham số** `(err, req, res, next)` để Express nhận ra đây là error handler.

---

## 9. Async trong Middleware Chain: Biết khi nào gọi next()

```js
// Middleware phải gọi next() HOẶC gửi response, không được cả hai
const logMiddleware = asyncHandler(async (req, res, next) => {
    const start = Date.now()

    // Code trước request
    console.log(`→ ${req.method} ${req.path}`)

    next()  // chuyển sang middleware tiếp theo

    // ❗ Code sau next() KHÔNG chạy sau khi route handler xong
    // Để chạy code sau response, dùng res.on('finish')
})

// Pattern đúng để log sau response
app.use((req, res, next) => {
    const start = Date.now()

    res.on('finish', () => {
        const duration = Date.now() - start
        console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`)
    })

    next()
})
```

---

## 10. Async Request Timeout

```js
// Middleware timeout request
function requestTimeout(ms) {
    return (req, res, next) => {
        const timer = setTimeout(() => {
            if (!res.headersSent) {
                res.status(408).json({ error: 'Request timeout' })
            }
        }, ms)

        // Xóa timer khi response gửi đi
        res.on('finish', () => clearTimeout(timer))
        res.on('close', () => clearTimeout(timer))

        next()
    }
}

app.use(requestTimeout(10000))  // 10 giây timeout
```

---

## Tóm tắt

| Pattern | Khi nào dùng |
|---------|-------------|
| Try/catch inline | Route đơn lẻ, prototype |
| `asyncHandler` wrapper | Dự án lớn, nhiều routes |
| `express-async-errors` | Muốn đơn giản nhất |
| Custom error classes | Cần phân loại lỗi rõ ràng |
| Error handler middleware | Luôn cần, là điểm xử lý lỗi cuối |

- **Luôn** xử lý lỗi async trong Express — không để Promise rejection bị bỏ
- **Error handler** phải có 4 params: `(err, req, res, next)`
- **Thứ tự** middleware quan trọng — error handler phải ở cuối cùng

**Tiếp theo:** [08 — Use Cases Thực Tế](./08-thuc-te.md)
