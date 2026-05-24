# 08 — Use Cases Thực Tế

## 1. Database Queries (MongoDB + Mongoose)

### CRUD cơ bản

```js
// GET /products?page=1&limit=10&sort=price
app.get('/products', asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sort = '-createdAt', category } = req.query

    const filter = {}
    if (category) filter.category = category

    // Chạy song song: query data và count
    const [products, total] = await Promise.all([
        Product.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('category', 'name'),  // join với collection khác

        Product.countDocuments(filter)
    ])

    res.json({
        data: products,
        pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        }
    })
}))
```

### Transaction (nhiều operations phải cùng thành công hoặc cùng rollback)

```js
// Chuyển tiền: trừ tài khoản A, cộng tài khoản B
app.post('/transfer', asyncHandler(async (req, res) => {
    const { fromId, toId, amount } = req.body

    const session = await mongoose.startSession()

    try {
        session.startTransaction()

        const from = await Account.findById(fromId).session(session)
        const to = await Account.findById(toId).session(session)

        if (from.balance < amount) {
            throw new ValidationError('Số dư không đủ')
        }

        from.balance -= amount
        to.balance += amount

        await from.save({ session })
        await to.save({ session })

        await session.commitTransaction()

        res.json({ message: 'Chuyển tiền thành công' })
    } catch (err) {
        await session.abortTransaction()  // rollback nếu có lỗi
        throw err
    } finally {
        session.endSession()
    }
}))
```

---

## 2. File Upload & Processing

### Upload file, resize ảnh, lưu S3

```js
const multer = require('multer')
const sharp = require('sharp')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const upload = multer({ storage: multer.memoryStorage() })
const s3 = new S3Client({ region: 'ap-southeast-1' })

app.post('/upload/avatar',
    authenticate,
    upload.single('avatar'),  // sync multer middleware
    asyncHandler(async (req, res) => {
        if (!req.file) throw new ValidationError('Không có file')

        // Resize ảnh (CPU-ish nhưng sharp dùng native code, OK)
        const resized = await sharp(req.file.buffer)
            .resize(200, 200)
            .webp({ quality: 80 })
            .toBuffer()

        const key = `avatars/${req.user.id}-${Date.now()}.webp`

        // Upload lên S3
        await s3.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: key,
            Body: resized,
            ContentType: 'image/webp'
        }))

        const avatarUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`

        // Cập nhật DB
        await User.findByIdAndUpdate(req.user.id, { avatarUrl })

        res.json({ avatarUrl })
    })
)
```

---

## 3. Gọi External API

### Gọi một API

```js
const axios = require('axios')

app.get('/weather/:city', asyncHandler(async (req, res) => {
    const { city } = req.params

    const response = await axios.get('https://api.weather.com/current', {
        params: { city, apiKey: process.env.WEATHER_API_KEY },
        timeout: 5000  // 5 giây timeout
    })

    res.json(response.data)
}))
```

### Gọi nhiều API song song + fallback

```js
app.get('/dashboard', authenticate, asyncHandler(async (req, res) => {
    // Gọi 3 services song song
    const results = await Promise.allSettled([
        userService.getProfile(req.user.id),
        orderService.getRecentOrders(req.user.id),
        notificationService.getUnread(req.user.id)
    ])

    const [profileResult, ordersResult, notificationsResult] = results

    // Trả về dữ liệu có, dùng fallback cho cái fail
    res.json({
        profile: profileResult.status === 'fulfilled'
            ? profileResult.value
            : null,
        orders: ordersResult.status === 'fulfilled'
            ? ordersResult.value
            : [],
        notifications: notificationsResult.status === 'fulfilled'
            ? notificationsResult.value
            : [],
        errors: results
            .filter(r => r.status === 'rejected')
            .map(r => r.reason.message)
    })
}))
```

---

## 4. Gửi Email (Async I/O)

```js
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

// Hàm gửi email là async
async function sendEmail(to, subject, html) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
    })
}

// Route đăng ký user
app.post('/register', asyncHandler(async (req, res) => {
    const user = await User.create(req.body)

    // Gửi email trong background — không cần user chờ
    // Dùng .catch() để không crash nếu email fail
    sendEmail(
        user.email,
        'Chào mừng bạn!',
        `<h1>Xin chào ${user.name}</h1>`
    ).catch(err => console.error('Email fail:', err.message))

    // Trả response ngay, không chờ email
    res.status(201).json({ message: 'Đăng ký thành công', user })
}))
```

---

## 5. Caching với Redis

```js
const redis = require('redis')
const client = redis.createClient({ url: process.env.REDIS_URL })

await client.connect()

// Middleware cache
function cache(ttlSeconds) {
    return asyncHandler(async (req, res, next) => {
        const key = `cache:${req.originalUrl}`

        const cached = await client.get(key)

        if (cached) {
            return res.json(JSON.parse(cached))
        }

        // Ghi đè res.json để cache kết quả
        const originalJson = res.json.bind(res)
        res.json = async (data) => {
            await client.setEx(key, ttlSeconds, JSON.stringify(data))
            return originalJson(data)
        }

        next()
    })
}

// Dùng cache 5 phút cho danh sách products
app.get('/products',
    cache(300),
    asyncHandler(async (req, res) => {
        const products = await Product.find({})
        res.json(products)
    })
)
```

---

## 6. Real-time với EventEmitter + SSE

### Server-Sent Events (SSE) — đơn giản hơn WebSocket

```js
const EventEmitter = require('events')
const orderEvents = new EventEmitter()

// Endpoint SSE: client giữ kết nối mở để nhận events
app.get('/orders/stream', authenticate, (req, res) => {
    // Thiết lập SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // Gửi event khi có đơn hàng mới
    const sendOrder = (order) => {
        if (order.userId === req.user.id.toString()) {
            res.write(`data: ${JSON.stringify(order)}\n\n`)
        }
    }

    orderEvents.on('order:updated', sendOrder)

    // Cleanup khi client disconnect
    req.on('close', () => {
        orderEvents.off('order:updated', sendOrder)
    })
})

// Route tạo đơn hàng emit event
app.post('/orders', authenticate, asyncHandler(async (req, res) => {
    const order = await Order.create({ ...req.body, userId: req.user.id })

    orderEvents.emit('order:updated', order)  // broadcast đến SSE clients

    res.status(201).json(order)
}))
```

---

## 7. Xử lý File Lớn với Stream

```js
const fs = require('fs')
const csv = require('csv-parser')

// Import 100.000 records từ CSV mà không tốn nhiều RAM
app.post('/import/products', asyncHandler(async (req, res) => {
    const results = []
    const errors = []

    await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => {
                // Xử lý từng row
                results.push({
                    name: row.name,
                    price: Number(row.price),
                    stock: Number(row.stock)
                })
            })
            .on('end', resolve)
            .on('error', reject)
    })

    // Bulk insert thay vì insert từng cái
    const inserted = await Product.insertMany(results, { ordered: false })

    res.json({
        imported: inserted.length,
        errors: errors.length
    })
}))
```

---

## 8. Job Queue (Background Processing)

Khi task quá nặng cho request/response cycle:

```js
const Bull = require('bull')

const emailQueue = new Bull('email', { redis: process.env.REDIS_URL })
const reportQueue = new Bull('report', { redis: process.env.REDIS_URL })

// Thêm job vào queue (nhanh, không blocking)
app.post('/reports/generate', authenticate, asyncHandler(async (req, res) => {
    const job = await reportQueue.add({
        userId: req.user.id,
        type: req.body.type,
        filters: req.body.filters
    })

    res.json({
        message: 'Đang tạo báo cáo, bạn sẽ nhận email khi xong',
        jobId: job.id
    })
}))

// Worker xử lý job (chạy trong process riêng)
reportQueue.process(async (job) => {
    const { userId, type, filters } = job.data

    const report = await generateReport(type, filters)  // có thể mất 30s
    const pdfBuffer = await convertToPDF(report)

    await uploadToS3(pdfBuffer, `reports/${userId}/${job.id}.pdf`)
    await sendEmail(job.data.email, 'Báo cáo của bạn đã sẵn sàng', ...)
})
```

---

## 9. Tổng kết: Chọn cơ chế nào?

```
Tình huống                          → Cơ chế phù hợp
─────────────────────────────────────────────────────
Query DB, gọi API, đọc file         → async/await
Nhiều task độc lập                  → Promise.all
Nhiều task, 1 fail không dừng       → Promise.allSettled
Race / timeout                      → Promise.race
Nhiều listener cho 1 sự kiện        → EventEmitter
Stream dữ liệu lớn                  → Stream + EventEmitter
Real-time (chat, notification)       → EventEmitter + SSE/WebSocket
Task nặng (report, email batch)     → Job Queue (Bull, BullMQ)
Tính toán nặng (CPU)                → Worker Threads / Child Process
Cần rollback nhiều DB ops           → Transaction (Mongoose session)
Cache kết quả                       → Redis + async middleware
```

---

## 10. Checklist trước khi deploy

```
✅ Tất cả async route handler đều có try/catch hoặc asyncHandler wrapper
✅ Express error handler có 4 params (err, req, res, next)
✅ Không có hàm *Sync (readFileSync...) trong request handler
✅ Không dùng forEach với async - dùng for...of hoặc Promise.all
✅ Các task độc lập dùng Promise.all thay vì await tuần tự
✅ EventEmitter có listener cho 'error' event
✅ Async EventEmitter listeners có try/catch
✅ Timeout cho external API calls
✅ Không để UnhandledPromiseRejection (attach global handler)
✅ Graceful shutdown (đóng DB connection, drain queue)
```

```js
// Global unhandled rejection handler (safety net)
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    // Log rồi gracefully shutdown
    process.exit(1)
})

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err)
    process.exit(1)
})
```

---

## Kết thúc Serie

Bạn đã đi qua toàn bộ hành trình:

| File | Kiến thức |
|------|-----------|
| 01 | Sync vs Async — khái niệm nền tảng |
| 02 | Event Loop — hiểu tại sao Node.js hoạt động |
| 03 | Callback — cơ chế đầu tiên, biết để đọc code cũ |
| 04 | Promise — giải quyết callback hell |
| 05 | Async/Await — cú pháp hiện đại, dùng hàng ngày |
| 06 | EventEmitter — real-time, stream, pub/sub |
| 07 | Express Async — áp dụng đúng trong web server |
| 08 | Use Cases thực tế — DB, file, API, cache, queue |

**Bước tiếp theo để thực hành:**
1. Viết lại CRUD app của bạn dùng đúng async/await + asyncHandler
2. Thêm Redis cache vào một endpoint chậm
3. Thử tạo một EventEmitter class cho business logic của bạn
