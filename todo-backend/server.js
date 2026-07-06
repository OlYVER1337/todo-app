const express = require("express");
const app = express();
const todoModel = require("./todoModel");

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Res respone successful",
    });
});

// ---------- GET /api/todos (search + filter + sort + pagination) ----------
app.get("/api/todos", (req, res) => {
    const { search, status } = req.query;
    let result = todoModel.getAll().todos;

    if (search !== undefined && search !== '') {
        result = result.filter(todo => String(todo.title).toLowerCase().includes(search.toLowerCase()));
    }

    const validStatuses = ["all", "completed", "pending"];
    if (status !== undefined && !validStatuses.includes(status)) {
        return res.status(400).json({
            error: "gui sai trang thai",
        });
    }
    if (status === 'completed') {
        result = result.filter(todo => todo.completed === true);
    }
    if (status === 'pending') {
        result = result.filter(todo => !todo.completed);
    }

    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order || "desc";
    result = [...result].sort((a, b) => {
        if (order === 'desc') {
            return a[sortBy] > b[sortBy] ? -1 : 1;
        } else {
            return a[sortBy] < b[sortBy] ? -1 : 1;
        }
    });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const start = (page - 1) * limit;
    const end = start + limit;
    const total = result.length;
    result = result.slice(start, end);

    res.status(200).json({
        data: result,
        pagination: { page, limit, total },
    });
});

app.get("/api/todos/:id", (req, res) => {
    const id = req.params.id;
    const todo = todoModel.getById(id);
    if (todo === null) {
        res.status(404).json({
            error: "khong tim thay cong viec",
        });
    } else {
        res.status(200).json(todo);
    }
});

app.post("/api/todos", (req, res) => {
    const title = req.body.title;
    if (typeof title !== "string" || title.trim() === '' || title.trim().length > 200) {
        return res.status(400).json({
            error: " tieu de la bat buoc, hoac khong the de trong"
        });
    } else {
        const newTodo = todoModel.create(title.trim());
        res.status(201).json(newTodo);
    }
});

app.put("/api/todos/:id", (req, res) => {
    const id = req.params.id;
    const todo = todoModel.getById(id);
    if (todo === null) {
        return res.status(404).json({
            error: "Khong tim thay cong viec",
        });
    } else {
        if (req.body.title !== undefined) {
            const title = req.body.title;
            if (typeof title !== 'string' || title.trim() === '' || title.length > 200) {
                return res.status(400).json({
                    error: "tieu de la bat buoc hoac khong the de trong",
                });
            }
        }
        if (req.body.completed !== undefined) {
            const completed = req.body.completed;
            if (typeof completed !== "boolean") {
                return res.status(400).json({
                    error: "trang thai cong viec khong hop le"
                });
            }
        }
        res.status(200).json(todoModel.update(id, req.body));
    }
});

app.patch("/api/todos/:id/toggle", (req, res) => {
    const id = req.params.id;
    const todo = todoModel.getById(id);
    if (todo === null) {
        return res.status(404).json({
            error: "khong tim thay cong viec",
        });
    } else {
        return res.status(200).json(todoModel.update(id, { completed: !todo.completed }));
    }
});

app.delete("/api/todos/:id", (req, res) => {
    const id = req.params.id;
    const todo = todoModel.getById(id);
    if (todo === null) {
        return res.status(404).json({
            error: "khong tim thay cong viec",
        });
    }
    todoModel.remove(id);
    return res.status(204).send();
});

const PORT = process.env.PORT || 4000;

// Chỉ thực sự "listen" khi file này được chạy trực tiếp (node server.js),
// KHÔNG listen khi file bị require() từ nơi khác (ví dụ từ file test) —
// nhờ vậy unit test có thể "require" app mà không cần mở port thật.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log("server run at port " + PORT);
    });
}

module.exports = app;
