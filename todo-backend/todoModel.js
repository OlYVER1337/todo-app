const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Cho phép ghi đè đường dẫn file DB qua biến môi trường (dùng khi chạy unit test
// để không đụng vào db.json thật). Nếu không set, dùng db.json mặc định như cũ.
const dataPath = process.env.DB_FILE || path.join(__dirname, 'db.json');

function getAll() {
    const data = fs.readFileSync(dataPath, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed;
}

function getById(id) {
    const db = getAll();
    const find = db.todos.find(x => x.id === id);
    if (find === undefined) {
        return null;
    }
    return find;
}

function create(newToDoTitle) {
    const newtodo = {
        id: uuidv4(),
        title: newToDoTitle,
        completed: false,
        createdAt: new Date().toISOString(),
    };
    const db = getAll();
    db.todos.push(newtodo);
    fs.writeFileSync(dataPath, JSON.stringify(db, null, 2), 'utf-8');
    return newtodo;
}

function update(id, updates) {
    const db = getAll();
    const todo = db.todos.find(x => x.id === id);
    if (todo === undefined) {
        return null;
    }
    Object.assign(todo, updates);
    fs.writeFileSync(dataPath, JSON.stringify(db, null, 2), 'utf-8');
    return todo;
}

function remove(id) {
    const db = getAll();
    const find = db.todos.find(x => x.id === id);
    if (find === undefined) {
        return null;
    }
    const filter = db.todos.filter(x => x.id !== id);
    db.todos = filter;
    fs.writeFileSync(dataPath, JSON.stringify(db, null, 2), 'utf-8');
    return find;
}

module.exports = { getAll, getById, create, update, remove };
