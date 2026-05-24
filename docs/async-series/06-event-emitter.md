# 06 — EventEmitter

## 1. EventEmitter là gì?

**EventEmitter = cơ chế Publish/Subscribe (pub/sub) trong Node.js.**

- **Publish (emit):** phát ra sự kiện
- **Subscribe (on/once):** đăng ký lắng nghe sự kiện

Đây là nền tảng của gần như toàn bộ Node.js: `http.Server`, `fs.ReadStream`, `net.Socket`... đều kế thừa từ EventEmitter.

```
┌─────────────────────────────────────────────┐
│              EventEmitter                   │
│                                             │
│  emitter.emit('event', data)                │
│       │                                     │
│       ▼                                     │
│  ┌─────────────────────────────────────┐    │
│  │  listener1 (đăng ký với .on())      │    │
│  │  listener2 (đăng ký với .on())      │    │
│  │  listener3 (đăng ký với .once())    │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

## 2. API cơ bản

```js
const EventEmitter = require('events')

const emitter = new EventEmitter()

// Đăng ký lắng nghe sự kiện (.on = nhiều lần)
emitter.on('data', (payload) => {
    console.log('Nhận được data:', payload)
})

// Đăng ký chỉ nghe một lần (.once)
emitter.once('connected', () => {
    console.log('Kết nối lần đầu tiên')
})

// Phát sự kiện
emitter.emit('data', { id: 1, name: 'An' })  // trigger tất cả listener 'data'
emitter.emit('data', { id: 2, name: 'Bình' })  // trigger lại

emitter.emit('connected')  // listener chạy
emitter.emit('connected')  // listener KHÔNG chạy (once đã bị remove)

// Hủy đăng ký
function handler(data) { console.log(data) }
emitter.on('event', handler)
emitter.off('event', handler)     // hoặc: emitter.removeListener('event', handler)
emitter.removeAllListeners('event')  // xóa tất cả listener của event này
```

---

## 3. Tạo class kế thừa EventEmitter

Cách dùng phổ biến nhất: tạo class với khả năng emit events.

```js
const EventEmitter = require('events')

class OrderService extends EventEmitter {
    async createOrder(data) {
        // Tạo đơn hàng...
        const order = await saveToDatabase(data)

        // Phát event thay vì gọi trực tiếp
        this.emit('order:created', order)

        return order
    }

    async cancelOrder(orderId) {
        const order = await updateStatus(orderId, 'cancelled')
        this.emit('order:cancelled', order)
        return order
    }
}

// Sử dụng
const orderService = new OrderService()

// Các module khác đăng ký lắng nghe
orderService.on('order:created', async (order) => {
    await sendConfirmationEmail(order.userEmail)
})

orderService.on('order:created', async (order) => {
    await notifyWarehouse(order)
})

orderService.on('order:cancelled', (order) => {
    processRefund(order)
})
```

**Lợi ích:** `OrderService` không cần biết có bao nhiêu module lắng nghe nó.  
Dễ thêm/xóa tính năng mà không sửa class gốc.

---

## 4. Xử lý lỗi với EventEmitter

```js
// ❗ QUAN TRỌNG: event 'error' là đặc biệt
// Nếu emit 'error' mà không có listener → Node.js CRASH!

const emitter = new EventEmitter()

// LUÔN đăng ký listener cho 'error'
emitter.on('error', (err) => {
    console.error('Lỗi từ emitter:', err.message)
    // Xử lý hoặc log, đừng để crash
})

// Giờ emit error an toàn
emitter.emit('error', new Error('Kết nối bị mất'))
```

---

## 5. EventEmitter vs Callback vs Promise

| | Callback | Promise | EventEmitter |
|--|---------|---------|-------------|
| Số lần trigger | 1 lần | 1 lần | Nhiều lần |
| Số listener | 1 | 1 (`.then` chain) | Nhiều listener |
| Dùng cho | Một tác vụ async | Một tác vụ async | Luồng sự kiện liên tục |
| Ví dụ | `readFile(cb)` | `fetch().then()` | `server.on('request')` |

**EventEmitter phù hợp khi:**
- Sự kiện xảy ra **nhiều lần** (request đến, data stream...)
- Cần **nhiều thành phần** phản ứng với cùng sự kiện
- Real-time: chat, notification, live data

---

## 6. Ví dụ thực tế: HTTP Server dùng EventEmitter

Thực ra `http.Server` **chính là EventEmitter**:

```js
const http = require('http')

const server = http.createServer()
//                  ↑
//        Trả về một EventEmitter

// Cách 1: truyền callback vào createServer
// Cách 2: dùng .on() — bởi vì server là EventEmitter

server.on('request', (req, res) => {
    res.end('Hello World')
})

server.on('listening', () => {
    console.log('Server đang lắng nghe')
})

server.on('error', (err) => {
    console.error('Server lỗi:', err.message)
})

server.on('close', () => {
    console.log('Server đóng')
})

server.listen(3000)
```

---

## 7. Ví dụ thực tế: File Stream

```js
const fs = require('fs')

// ReadStream là EventEmitter
const stream = fs.createReadStream('./large-file.csv')

let lineCount = 0
let buffer = ''

stream.on('data', (chunk) => {
    // chunk là Buffer, đến từng mảnh không phải toàn bộ file
    buffer += chunk.toString()
    const lines = buffer.split('\n')
    lineCount += lines.length - 1
    buffer = lines[lines.length - 1]  // phần chưa complete của dòng cuối
})

stream.on('end', () => {
    console.log('Đọc xong. Số dòng:', lineCount)
})

stream.on('error', (err) => {
    console.error('Lỗi đọc file:', err.message)
})
```

---

## 8. EventEmitter trong Express middleware

```js
// Tạo event bus dùng chung trong app
const EventEmitter = require('events')
const eventBus = new EventEmitter()

// Middleware log mọi request
app.use((req, res, next) => {
    eventBus.emit('request:received', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        timestamp: new Date()
    })
    next()
})

// Một service khác lắng nghe để lưu access log
eventBus.on('request:received', async (data) => {
    await AccessLog.create(data)
})

// Một service khác gửi metrics
eventBus.on('request:received', (data) => {
    metrics.increment('http.requests', { method: data.method })
})
```

---

## 9. Giới hạn số listeners

```js
const emitter = new EventEmitter()

// Mặc định: cảnh báo khi > 10 listeners trên cùng event
// (để phát hiện memory leak)
emitter.setMaxListeners(20)  // tăng giới hạn nếu cần

// Xem số listeners
console.log(emitter.listenerCount('data'))
console.log(emitter.eventNames())  // ['data', 'error', ...]
```

---

## 10. Async EventEmitter listeners

```js
// ❗ Vấn đề: EventEmitter không biết listener là async
const emitter = new EventEmitter()

emitter.on('event', async (data) => {
    await doSomethingAsync(data)
    // Nếu có lỗi ở đây → UnhandledPromiseRejection
    // emitter.emit() không chờ async listener!
})

// ✅ Xử lý lỗi trong async listener
emitter.on('event', async (data) => {
    try {
        await doSomethingAsync(data)
    } catch (err) {
        emitter.emit('error', err)  // chuyển lỗi sang error event
    }
})
```

---

## Tóm tắt

- EventEmitter = pub/sub: emit để phát, on/once để lắng nghe
- Nền tảng của Node.js: http, fs, net đều là EventEmitter
- Dùng khi: sự kiện nhiều lần, nhiều listener, real-time
- **Bắt buộc** đăng ký listener `'error'` để tránh crash
- Async listener cần tự xử lý lỗi (emitter không biết về async)

**Tiếp theo:** [07 — Async trong Express](./07-express-async.md)
