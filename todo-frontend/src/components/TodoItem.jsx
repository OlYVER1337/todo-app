import { useState } from 'react';

export default function TodoItem({ todo, onToggle, onUpdateTitle, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const [error, setError] = useState('');

  async function saveEdit() {
    if (!draft.trim()) {
      setError('Tiêu đề không được để trống.');
      return;
    }
    try {
      await onUpdateTitle(todo.id, draft.trim());
      setEditing(false);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />

      <div className="todo-content">
        {editing ? (
          <>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={200}
              autoFocus
            />
            {error && <p className="form-error">{error}</p>}
          </>
        ) : (
          <p className="todo-title">{todo.title}</p>
        )}
        {todo.createdAt && (
          <span className="todo-date">
            {new Date(todo.createdAt).toLocaleString('vi-VN')}
          </span>
        )}
      </div>

      <div className="todo-actions">
        {editing ? (
          <>
            <button className="btn btn-icon" title="Lưu" onClick={saveEdit}>
              ✅
            </button>
            <button
              className="btn btn-icon"
              title="Huỷ"
              onClick={() => {
                setEditing(false);
                setDraft(todo.title);
                setError('');
              }}
            >
              ✖️
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-icon" title="Chỉnh sửa" onClick={() => setEditing(true)}>
              ✏️
            </button>
            <button className="btn btn-icon" title="Xoá" onClick={() => onDelete(todo.id)}>
              🗑️
            </button>
          </>
        )}
      </div>
    </li>
  );
}
