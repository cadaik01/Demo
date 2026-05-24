# 02 — Event Loop: Trái tim của Node.js

## 1. Event Loop là gì?

Event Loop là **cơ chế** giúp Node.js xử lý async mà chỉ dùng một luồng duy nhất.

Nói đơn giản: Event Loop liên tục hỏi *"Có việc gì cần làm không?"* và phân phối việc cho đúng nơi xử lý.

---

## 2. Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│                      Node.js Process                        │
│                                                             │
│  ┌──────────────┐    ┌─────────────────────────────────┐   │
│  │  Call Stack  │    │           Event Loop            │   │
│  │              │    │                                 │   │
│  │  main()      │    │  ┌─────────┐  ┌─────────────┐  │   │
│  │  readFile()  │    │  │ Timers  │  │  I/O Queue  │  │   │
│  │  ...         │    │  │(setTimeout│  │(fs, net,...)│  │   │
│  └──────────────┘    │  │setTimeout)│  └─────────────┘  │   │
│                      │  └─────────┘                    │   │
│  ┌──────────────┐    │  ┌───────────────────────────┐  │   │
│  │  Node APIs   │    │  │      Check Queue          │  │   │
│  │  (libuv)     │    │  │     (setImmediate)        │  │   │
│  │              │    │  └───────────────────────────┘  │   │
│  │  Thread Pool │    └─────────────────────────────────┘   │
│  │  (4 threads) │                                          │
│  └──────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Các thành phần chính

### Call Stack (Ngăn xếp lệnh gọi)
- Nơi JavaScript thực thi code đồng bộ.
- **LIFO** (Last In, First Out) — cái vào sau thì ra trước.
- Khi stack trống → Event Loop kiểm tra queue.

### Web APIs / Node APIs (libuv)
- Khi gặp `setTimeout`, `readFile`, `fetch`... — JS **đẩy công việc sang đây**.
- APIs này chạy **ngoài Call Stack**, không blocking.
- Khi xong, đẩy callback vào Queue tương ứng.

### Callback Queues (Hàng đợi)
Node.js có nhiều loại queue, theo thứ tự ưu tiên:

| Thứ tự | Queue | Ví dụ |
|--------|-------|-------|
| 1 (cao nhất) | **microtask queue** | `Promise.then()`, `queueMicrotask()` |
| 2 | **nextTick queue** | `process.nextTick()` |
| 3 | **timers** | `setTimeout(fn, 0)`, `setInterval()` |
| 4 | **I/O callbacks** | `fs.readFile`, `net`, `http` |
| 5 | **check** | `setImmediate()` |
| 6 (thấp nhất) | **close callbacks** | `socket.on('close')` |

---

## 4. Event Loop hoạt động như thế nào?

```
Bắt đầu
   │
   ▼
┌──────────────────────────────────────┐
│  Chạy hết code synchronous (main)    │  ← Call Stack
└──────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────┐
│  Kiểm tra: có microtask không?       │  ← Promise.then()
│  Nếu có → chạy hết                   │
└──────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────┐
│  Kiểm tra: có nextTick không?        │  ← process.nextTick()
│  Nếu có → chạy hết                   │
└──────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────┐
│  Timers: setTimeout/setInterval      │
│  đã đến giờ chưa?                    │
└──────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────┐
│  I/O callbacks (file, network, DB)   │
└──────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────┐
│  Check: setImmediate()               │
└──────────────────────────────────────┘
   │
   └──────────────────► Lặp lại từ đầu
```

---

## 5. Demo: Thứ tự thực thi

```js
console.log('1: sync - bắt đầu')

setTimeout(() => {
    console.log('5: setTimeout 0ms')
}, 0)

Promise.resolve().then(() => {
    console.log('3: Promise.then (microtask)')
})

process.nextTick(() => {
    console.log('2: process.nextTick')  // chạy trước Promise!
})

setImmediate(() => {
    console.log('6: setImmediate')
})

console.log('4: sync - kết thúc')  // ← thực ra là số 4 nếu đọc code

// Thứ tự in ra thực tế:
// 1: sync - bắt đầu
// 4: sync - kết thúc         ← hết sync code
// 2: process.nextTick        ← nextTick trước microtask
// 3: Promise.then            ← microtask
// 5: setTimeout 0ms          ← timer
// 6: setImmediate            ← check phase
```

> **Điều bất ngờ:** `setTimeout(fn, 0)` không phải là "ngay lập tức" — nó chạy sau cả Promise!

---

## 6. Thread Pool (libuv)

Node.js **không phải** hoàn toàn single-threaded. Nó có **Thread Pool** (mặc định 4 threads) để xử lý:

- File system I/O (`fs.readFile`, `fs.writeFile`)
- DNS lookup
- Crypto (`crypto.pbkdf2`, `crypto.randomBytes`)
- Zlib (compression)

```
Request đến → Event Loop (1 thread) → giao cho Thread Pool (4 threads)
                                                    ↓
                                       OS thực hiện I/O thực sự
                                                    ↓
                                       Callback vào I/O Queue
                                                    ↓
                                       Event Loop lấy ra, chạy callback
```

**Tăng thread pool nếu cần:**
```js
// Trước khi require bất cứ gì
process.env.UV_THREADPOOL_SIZE = 8  // tối đa 1024
```

---

## 7. Khi nào Event Loop bị "block"?

Dù async, Event Loop vẫn bị block nếu:

```js
// ❌ NGUY HIỂM - tính toán nặng trong event loop
app.get('/danger', (req, res) => {
    // Vòng lặp này chiếm CPU 2 giây
    // Trong 2 giây đó, KHÔNG request nào được xử lý!
    let sum = 0
    for (let i = 0; i < 10_000_000_000; i++) {
        sum += i
    }
    res.json({ sum })
})
```

**Giải pháp cho CPU-heavy tasks:**
1. Dùng `worker_threads` (Node.js built-in)
2. Dùng child process
3. Tách ra microservice riêng
4. Dùng `setImmediate` để chia nhỏ task

---

## 8. Tóm tắt thực hành

| Tình huống | Cơ chế phù hợp |
|-----------|----------------|
| Đọc/ghi file | `fs.readFile` (async) + callback/Promise/async-await |
| Query database | async/await với Mongoose/Sequelize |
| Gọi API khác | `fetch` hoặc `axios` (đều async) |
| Delay | `setTimeout`, `setInterval` |
| "Ngay sau tick hiện tại" | `process.nextTick()` |
| "Sau I/O của tick này" | `setImmediate()` |
| Tính toán nặng | `worker_threads` |

---

## Tóm tắt

- Event Loop = vòng lặp vô tận kiểm tra và thực thi callbacks
- **Thứ tự ưu tiên:** nextTick > Promise.then > timers > I/O > setImmediate
- **Thread Pool** (libuv) xử lý I/O thực sự, không blocking Event Loop
- **Tránh** code blocking lâu trong request handler
- `setTimeout(fn, 0)` **không phải** ngay lập tức — nó sau microtask

**Tiếp theo:** [03 — Callback Pattern](./03-callback.md)
