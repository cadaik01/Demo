# Serie: Async & Sync Programming trong Node.js / Express

## Mục lục serie

| # | File | Nội dung |
|---|------|----------|
| 00 | `00-tong-quan-serie.md` | Bạn đang đọc — roadmap toàn bộ serie |
| 01 | `01-khai-niem-co-ban.md` | Sync vs Async là gì, tại sao quan trọng |
| 02 | `02-event-loop.md` | Event Loop — trái tim của Node.js |
| 03 | `03-callback.md` | Callback Pattern — cơ chế async đầu tiên |
| 04 | `04-promise.md` | Promise — giải quyết "callback hell" |
| 05 | `05-async-await.md` | Async/Await — viết async như sync |
| 06 | `06-event-emitter.md` | EventEmitter — pub/sub trong Node.js |
| 07 | `07-express-async.md` | Áp dụng Async trong Express routes & middleware |
| 08 | `08-thuc-te.md` | Use cases thực tế: DB, File I/O, API, stream |

---

## Tại sao cần học chủ đề này?

Node.js được thiết kế **single-threaded** (một luồng duy nhất). Điều đó có nghĩa:

- Nếu bạn viết code **blocking** (đồng bộ, chặn luồng), toàn bộ server đứng chờ.
- 1000 user gửi request → server xử lý **từng cái một** → chậm.
- Với **async** (bất đồng bộ), server nhận request, trao công việc cho OS/thread pool, rồi tiếp tục nhận request khác.

> **Hiểu Async/Sync = hiểu được tại sao Node.js nhanh, và tại sao code của bạn đôi khi bị treo.**

---

## Sơ đồ tổng quan

```
┌─────────────────────────────────────────────────┐
│              Cơ chế lập trình Async              │
│                                                  │
│  1. Callback      ──► cũ nhất, dễ bị "hell"     │
│  2. Promise       ──► giải quyết callback hell   │
│  3. Async/Await   ──► syntax đẹp nhất, dùng nay  │
│  4. EventEmitter  ──► pub/sub, stream, real-time │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Cách đọc serie này

1. Đọc theo thứ tự từ 01 → 08
2. Mỗi file có phần **Lý thuyết → Code mẫu → Khi nào dùng**
3. Thử tự viết lại code mẫu, đừng copy paste
4. File 07 và 08 là phần áp dụng thực tế — đọc sau khi hiểu lý thuyết

---

## Yêu cầu kiến thức trước

- Biết JavaScript cơ bản (function, object, array)
- Đã cài Node.js và biết `node file.js`
- Đã biết Express cơ bản (bonus, không bắt buộc cho phần đầu)
