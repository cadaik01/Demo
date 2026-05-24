# 01 — Khái niệm cơ bản: Synchronous vs Asynchronous

## 1. Synchronous (Đồng bộ) là gì?

**Sync = làm xong việc này mới làm việc tiếp theo.**

Giống như bạn đứng xếp hàng ở quán cà phê: bạn gọi món → đứng chờ → nhận cà phê → mới đi về.

```js
// Sync: từng dòng chạy theo thứ tự, dòng sau chờ dòng trước xong
const data = readFileSync('file.txt')   // ← CHẶN ở đây, chờ file đọc xong
console.log(data)                        // ← chỉ chạy khi dòng trên xong
console.log('Done')
```

**Luồng thực thi:**
```
[START] ──► readFile (chờ...) ──► console.log(data) ──► console.log('Done') ──► [END]
               ↑
        chặn toàn bộ chương trình ở đây
```

---

## 2. Asynchronous (Bất đồng bộ) là gì?

**Async = giao việc cho người khác làm, mình tiếp tục làm việc khác, xong thì nhận kết quả.**

Giống như order cà phê rồi ngồi làm việc — barista làm xong thì gọi tên bạn.

```js
// Async: giao việc đi, tiếp tục chạy, callback được gọi khi xong
readFile('file.txt', (err, data) => {   // ← KHÔNG chặn, giao cho OS
    console.log(data)                    // ← chạy SAU khi file đọc xong
})
console.log('Done')                      // ← chạy NGAY, không chờ
```

**Luồng thực thi:**
```
[START] ──► readFile (giao cho OS) ──► console.log('Done') ──► [END của luồng chính]
                                                                        ↓
                                                    [OS hoàn thành] ──► callback chạy ──► console.log(data)
```

> **Kết quả in ra:** `Done` trước, rồi mới in `data`  
> Điều này ngược với sync — đây là điểm dễ nhầm nhất khi mới học!

---

## 3. So sánh trực tiếp

| Tiêu chí | Synchronous | Asynchronous |
|----------|-------------|--------------|
| Luồng thực thi | Tuần tự, từng bước | Không tuần tự, song song về mặt logic |
| Blocking | Có — chặn luồng khi chờ | Không — giao việc, tiếp tục |
| Dễ đọc | Dễ hơn, đọc từ trên xuống | Khó hơn, phải hiểu luồng async |
| Hiệu suất (I/O heavy) | Kém — 1 request chờ xong mới nhận request khác | Tốt — xử lý nhiều request cùng lúc |
| Hiệu suất (CPU heavy) | Ổn | Không có lợi thế |
| Xử lý lỗi | Try/Catch thông thường | Cần cơ chế riêng (callback err, `.catch()`, `try/catch` với async/await) |
| Khi nào dùng trong Node | Script một lần (startup config) | Mọi I/O: DB, file, HTTP request |

---

## 4. Tại sao Node.js cần Async?

Node.js chạy **một luồng duy nhất (single thread)**. Không có multi-threading như Java hay C#.

**Hãy tưởng tượng 1000 user cùng gửi request:**

### Nếu dùng Sync:
```
User 1 gửi request → Server xử lý (100ms) → User 1 nhận kết quả
                      ↑
User 2 đang đợi vì server đang bận với User 1
User 3 đang đợi...
...
User 1000 đợi 100.000ms = 100 giây !!!
```

### Nếu dùng Async:
```
User 1 gửi request → Server nhận, giao cho DB driver → nhận User 2
User 2 gửi request → Server nhận, giao cho DB driver → nhận User 3
...
User 1000 gửi request → Server nhận, giao cho DB driver
                         ↓
[DB trả về kết quả cho User 1] → gửi response
[DB trả về kết quả cho User 2] → gửi response
...
Tất cả xử lý gần như đồng thời
```

---

## 5. Blocking vs Non-blocking

Đây là thuật ngữ hay đi cùng Sync/Async:

- **Blocking** = code dừng lại, chờ. Thường đi với Sync.
- **Non-blocking** = code không dừng lại, tiếp tục. Thường đi với Async.

```js
// BLOCKING — tránh dùng trong server
const fs = require('fs')
const content = fs.readFileSync('./data.json', 'utf-8')  // blocking
console.log(content)

// NON-BLOCKING — nên dùng
fs.readFile('./data.json', 'utf-8', (err, content) => {  // non-blocking
    console.log(content)
})
```

> **Quy tắc vàng:** Trong Express/Node server, **không bao giờ dùng hàm Sync** trừ khi đang ở bước khởi động app (startup), không phải trong request handler.

---

## 6. Ví dụ thực tế để "cảm nhận"

Chạy đoạn code sau và quan sát thứ tự in ra:

```js
const fs = require('fs')

console.log('1. Bắt đầu')

// Async - không blocking
fs.readFile('./package.json', 'utf-8', (err, data) => {
    console.log('3. File đã đọc xong')
})

console.log('2. Sau lệnh readFile')

// Kết quả in ra:
// 1. Bắt đầu
// 2. Sau lệnh readFile
// 3. File đã đọc xong   ← cái này in sau dù code viết trước!
```

Câu hỏi tự hỏi: **Tại sao "2" lại in trước "3"?**  
→ Câu trả lời nằm ở file tiếp theo: **Event Loop**.

---

## Tóm tắt

- **Sync** = blocking, tuần tự, dễ đọc, kém hiệu suất với I/O
- **Async** = non-blocking, song song về logic, khó đọc hơn, tốt cho I/O
- Node.js **single-thread** nên **cần async** để xử lý nhiều request
- Tránh hàm `*Sync` (readFileSync, execSync...) trong request handler của Express

**Tiếp theo:** [02 — Event Loop](./02-event-loop.md)
