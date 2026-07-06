/**
 * todo.test.js
 * Unit/integration test cho API Todo bằng Jest + Supertest.
 *
 * Dùng 1 file DB riêng (test-db.json) để KHÔNG đụng vào db.json thật của bạn.
 * Set biến môi trường DB_FILE TRƯỚC KHI require server.js, vì todoModel.js
 * đọc biến này ngay lúc khởi động module.
 */
const path = require('path');
const fs = require('fs');

const TEST_DB_FILE = path.join(__dirname, 'test-db.json');
process.env.DB_FILE = TEST_DB_FILE;

function resetDb() {
    fs.writeFileSync(TEST_DB_FILE, JSON.stringify({ todos: [] }, null, 2), 'utf-8');
}

resetDb();

const request = require('supertest');
const app = require('../server');

afterAll(() => {
    if (fs.existsSync(TEST_DB_FILE)) fs.unlinkSync(TEST_DB_FILE);
});

describe('Health check', () => {
    test('GET /health trả về status OK', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('OK');
    });
});

describe('CRUD cơ bản', () => {
    let createdId;

    test('GET /api/todos khi chưa có gì trả về mảng rỗng', async () => {
        resetDb();
        const res = await request(app).get('/api/todos');
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
        expect(res.body.pagination.total).toBe(0);
    });

    test('POST /api/todos tạo công việc mới thành công (201)', async () => {
        const res = await request(app).post('/api/todos').send({ title: 'Hoc Node' });
        expect(res.status).toBe(201);
        expect(res.body.title).toBe('Hoc Node');
        expect(res.body.completed).toBe(false);
        expect(res.body).toHaveProperty('createdAt');
        createdId = res.body.id;
    });

    test('POST /api/todos báo lỗi 400 khi thiếu title', async () => {
        const res = await request(app).post('/api/todos').send({});
        expect(res.status).toBe(400);
    });

    test('POST /api/todos báo lỗi 400 khi title chỉ toàn khoảng trắng', async () => {
        const res = await request(app).post('/api/todos').send({ title: '   ' });
        expect(res.status).toBe(400);
    });

    test('POST /api/todos báo lỗi 400 khi title không phải string', async () => {
        const res = await request(app).post('/api/todos').send({ title: 123 });
        expect(res.status).toBe(400);
    });

    test('POST /api/todos báo lỗi 400 khi title quá 200 ký tự', async () => {
        const res = await request(app).post('/api/todos').send({ title: 'a'.repeat(201) });
        expect(res.status).toBe(400);
    });

    test('POST /api/todos tự trim khoảng trắng thừa trước khi lưu', async () => {
        const res = await request(app).post('/api/todos').send({ title: '  Co khoang trang  ' });
        expect(res.status).toBe(201);
        expect(res.body.title).toBe('Co khoang trang');
    });

    test('GET /api/todos/:id trả về đúng công việc', async () => {
        const res = await request(app).get(`/api/todos/${createdId}`);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(createdId);
    });

    test('GET /api/todos/:id trả về 404 nếu id không tồn tại', async () => {
        const res = await request(app).get('/api/todos/id-khong-ton-tai');
        expect(res.status).toBe(404);
    });

    test('PUT /api/todos/:id cập nhật title thành công', async () => {
        const res = await request(app).put(`/api/todos/${createdId}`).send({ title: 'Hoc Node - update' });
        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Hoc Node - update');
    });

    test('PUT /api/todos/:id chỉ sửa completed vẫn giữ nguyên title cũ', async () => {
        const before = await request(app).get(`/api/todos/${createdId}`);
        const res = await request(app).put(`/api/todos/${createdId}`).send({ completed: true });
        expect(res.status).toBe(200);
        expect(res.body.completed).toBe(true);
        expect(res.body.title).toBe(before.body.title);
    });

    test('PUT /api/todos/:id báo lỗi 400 khi completed sai kiểu', async () => {
        const res = await request(app).put(`/api/todos/${createdId}`).send({ completed: 'yes' });
        expect(res.status).toBe(400);
    });

    test('PUT /api/todos/:id báo lỗi 400 khi title rỗng', async () => {
        const res = await request(app).put(`/api/todos/${createdId}`).send({ title: '' });
        expect(res.status).toBe(400);
    });

    test('PUT /api/todos/:id trả về 404 nếu id không tồn tại', async () => {
        const res = await request(app).put('/api/todos/id-khong-ton-tai').send({ title: 'x' });
        expect(res.status).toBe(404);
    });

    test('PATCH /api/todos/:id/toggle đảo trạng thái hoàn thành', async () => {
        const before = await request(app).get(`/api/todos/${createdId}`);
        const res = await request(app).patch(`/api/todos/${createdId}/toggle`);
        expect(res.status).toBe(200);
        expect(res.body.completed).toBe(!before.body.completed);
    });

    test('PATCH /api/todos/:id/toggle trả về 404 nếu id không tồn tại', async () => {
        const res = await request(app).patch('/api/todos/id-khong-ton-tai/toggle');
        expect(res.status).toBe(404);
    });

    test('DELETE /api/todos/:id xoá thành công trả về 204', async () => {
        const res = await request(app).delete(`/api/todos/${createdId}`);
        expect(res.status).toBe(204);

        const check = await request(app).get(`/api/todos/${createdId}`);
        expect(check.status).toBe(404);
    });

    test('DELETE /api/todos/:id trả về 404 nếu id không tồn tại', async () => {
        const res = await request(app).delete('/api/todos/id-khong-ton-tai');
        expect(res.status).toBe(404);
    });
});

describe('Search / Filter / Sort / Pagination', () => {
    beforeAll(async () => {
        resetDb();
        // Tạo dữ liệu mẫu, cách nhau 1 chút để createdAt khác nhau rõ ràng
        await request(app).post('/api/todos').send({ title: 'Hoc Node co ban' });
        await new Promise(r => setTimeout(r, 10));
        await request(app).post('/api/todos').send({ title: 'Hoc React' });
        await new Promise(r => setTimeout(r, 10));
        await request(app).post('/api/todos').send({ title: 'Mua sam' });
        await new Promise(r => setTimeout(r, 10));
        await request(app).post('/api/todos').send({ title: 'Don dep nha' });
        await new Promise(r => setTimeout(r, 10));
        await request(app).post('/api/todos').send({ title: 'Hoc Docker' });

        // Đánh dấu 2 việc là đã hoàn thành
        const all = await request(app).get('/api/todos?limit=100');
        const hocNode = all.body.data.find(t => t.title === 'Hoc Node co ban');
        const muaSam = all.body.data.find(t => t.title === 'Mua sam');
        await request(app).patch(`/api/todos/${hocNode.id}/toggle`);
        await request(app).patch(`/api/todos/${muaSam.id}/toggle`);
    });

    test('search không phân biệt hoa thường, tìm đúng theo title', async () => {
        const res = await request(app).get('/api/todos?search=HOC');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(3); // Hoc Node, Hoc React, Hoc Docker
        expect(res.body.data.every(t => t.title.toLowerCase().includes('hoc'))).toBe(true);
    });

    test('filter status=completed chỉ trả về việc đã hoàn thành', async () => {
        const res = await request(app).get('/api/todos?status=completed&limit=100');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(2);
        expect(res.body.data.every(t => t.completed === true)).toBe(true);
    });

    test('filter status=pending chỉ trả về việc chưa hoàn thành', async () => {
        const res = await request(app).get('/api/todos?status=pending&limit=100');
        expect(res.status).toBe(200);
        expect(res.body.data.every(t => t.completed === false)).toBe(true);
    });

    test('status không hợp lệ trả về lỗi 400', async () => {
        const res = await request(app).get('/api/todos?status=xyz');
        expect(res.status).toBe(400);
    });

    test('sort theo createdAt asc trả về đúng thứ tự cũ -> mới', async () => {
        const res = await request(app).get('/api/todos?sortBy=createdAt&order=asc&limit=100');
        const dates = res.body.data.map(t => t.createdAt);
        const sorted = [...dates].sort();
        expect(dates).toEqual(sorted);
    });

    test('sort theo createdAt desc trả về đúng thứ tự mới -> cũ', async () => {
        const res = await request(app).get('/api/todos?sortBy=createdAt&order=desc&limit=100');
        const dates = res.body.data.map(t => t.createdAt);
        const sortedDesc = [...dates].sort().reverse();
        expect(dates).toEqual(sortedDesc);
    });

    test('pagination trả về đúng số lượng item theo limit', async () => {
        const res = await request(app).get('/api/todos?page=1&limit=2');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(2);
        expect(res.body.pagination.total).toBe(5);
    });

    test('pagination trang 1 và trang 2 không trùng lặp item', async () => {
        const page1 = await request(app).get('/api/todos?page=1&limit=2&sortBy=title&order=asc');
        const page2 = await request(app).get('/api/todos?page=2&limit=2&sortBy=title&order=asc');
        const ids1 = page1.body.data.map(t => t.id);
        const ids2 = page2.body.data.map(t => t.id);
        const overlap = ids1.filter(id => ids2.includes(id));
        expect(overlap.length).toBe(0);
    });

    test('page vượt quá tổng số trang trả về mảng rỗng, không lỗi', async () => {
        const res = await request(app).get('/api/todos?page=999&limit=2');
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
        expect(res.body.pagination.total).toBe(5);
    });

    test('kết hợp search + status + sort + pagination cùng lúc', async () => {
        const res = await request(app).get(
            '/api/todos?search=hoc&status=pending&sortBy=title&order=asc&page=1&limit=1'
        );
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeLessThanOrEqual(1);
        if (res.body.data.length === 1) {
            expect(res.body.data[0].title.toLowerCase()).toContain('hoc');
            expect(res.body.data[0].completed).toBe(false);
        }
    });
});
