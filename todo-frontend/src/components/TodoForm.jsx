import { useState } from 'react';

/**
 * Form thêm mới công việc. (Backend create() chỉ nhận title, nên form
 * thêm mới chỉ có 1 trường title - chỉnh sửa completed/title sau qua TodoItem.)
 */
export default function TodoForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề công việc.');
      return;
    }
    if (title.trim().length > 200) {
      setError('Tiêu đề không được vượt quá 200 ký tự.');
      return;
    }
    try {
      setError('');
      await onSubmit(title);
      setTitle('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          type="text"
          placeholder="Thêm công việc mới..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
        />
        <button type="submit" className="btn btn-primary">
          Thêm
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}
