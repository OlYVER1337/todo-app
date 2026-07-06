#  Todo List App
## Cấu trúc

```
.
├── todo-backend/
│   ├── server.js          # Toàn bộ route (bạn tự viết)
│   ├── todoModel.js        # Data layer: getAll/getById/create/update/remove (bạn tự viết)
│   ├── db.json              # File dữ liệu
│   ├── tests/
│   │   └── todo.test.js     # Unit test (Jest + Supertest) — MỚI
│   ├── Dockerfile            # MỚI
│   └── package.json
├── todo-frontend/            # MỚI — giao diện React
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── components/
│   │   └── styles.css
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml         # MỚI
└── README.md
```

## 1. Chạy không dùng Docker

### Backend

```bash
cd todo-backend
npm install
npm start          # chạy ở http://localhost:4000
```

### Chạy Unit Test

```bash
cd todo-backend
npm test
```

Test dùng file `tests/test-db.json` riêng . Bộ test có 29 case, bao phủ:
- CRUD cơ bản + các mã lỗi 400/404/201/204
- Validate: title rỗng, sai kiểu, quá dài, tự động trim khoảng trắng
- Update từng phần (chỉ sửa completed vẫn giữ nguyên title)
- Search không phân biệt hoa/thường, filter theo status, sort asc/desc, phân trang (kể cả trang vượt quá không lỗi)

### Frontend

Mở terminal khác:

```bash
cd todo-frontend
npm install
npm run dev         # chạy ở http://localhost:5173
```

Trong lúc `npm run dev`, các request `/api/*` tự động được forward sang `http://localhost:4000` (cấu hình trong `vite.config.js`), nên **backend phải đang chạy song song**.

Mở trình duyệt: **http://localhost:5173**

## 2. Chạy bằng Docker

Yêu cầu: Docker & Docker Compose.

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:4000/api/todos

Dữ liệu được lưu trong Docker volume `todo-data` (map vào `/app/data/db.json` trong container), không mất khi container bị xoá/restart.

Dừng:
```bash
docker compose down
```

## 3. API Endpoints (tóm tắt)

| Method | Endpoint | Ghi chú |
|---|---|---|
| GET | `/api/todos` | Hỗ trợ `search`, `status`, `sortBy`, `order`, `page`, `limit` |
| GET | `/api/todos/:id` | 404 nếu không tồn tại |
| POST | `/api/todos` | Body: `{title}` — validate bắt buộc, không rỗng, ≤200 ký tự |
| PUT | `/api/todos/:id` | Body: `{title?, completed?}` — sửa từng phần |
| PATCH | `/api/todos/:id/toggle` | Đảo trạng thái hoàn thành |
| DELETE | `/api/todos/:id` | Trả 204 khi thành công |

### Query params của `GET /api/todos`

| Param | Giá trị | Mặc định |
|---|---|---|
| `search` | tìm trong title, không phân biệt hoa/thường | (không lọc) |
| `status` | `all` \| `completed` \| `pending` | `all` |
| `sortBy` | tên field bất kỳ, ví dụ `title`, `createdAt` | `createdAt` |
| `order` | `asc` \| `desc` | `desc` |
| `page` | số trang | `1` |
| `limit` | số item/trang | `5` |

## 4. Deploy lên môi trường online (gợi ý)

**Backend** — Render.com:
1. Push code lên GitHub.
2. Tạo Web Service mới, root directory `todo-backend`, build command `npm install`, start command `npm start`.
3. Gắn Persistent Disk vào đường dẫn chứa `db.json` (hoặc set `DB_FILE` trỏ vào disk đó) để dữ liệu không mất khi service redeploy.

**Frontend** — Vercel/Netlify:
1. Root directory `todo-frontend`, build command `npm run build`, output `dist`.
2. Set biến môi trường `VITE_API_BASE_URL=https://<domain-backend>/api`.

**Hoặc dùng 1 VPS + Docker Compose:**
```bash
git clone <repo-url>
cd <repo>
docker compose up -d --build
```
Sau đó cấu hình Nginx/reverse proxy + domain + SSL trỏ vào cổng 8080.

## 5. Ghi chú

- `todoModel.js` lưu dữ liệu bằng file JSON (`db.json`) — đơn giản, dễ hiểu khi mới học, phù hợp cho project quy mô nhỏ. Có thể nâng cấp sang SQLite/PostgreSQL
- `server.js` có thêm 1 đoạn nhỏ để phục vụ unit test (`if (require.main === module) { app.listen(...) }` + `module.exports = app`) — nghĩa là server chỉ thực sự "chạy" khi gọi trực tiếp bằng `node server.js`, còn khi file test `require` nó vào thì không tự mở port, cho phép Supertest gọi thẳng vào `app` mà không cần server thật đang chạy.
- `todoModel.js` có thêm 1 dòng cho phép ghi đè đường dẫn file DB qua biến môi trường `DB_FILE` 
