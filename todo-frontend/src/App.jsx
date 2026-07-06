import { useCallback, useEffect, useState } from 'react';
import TodoForm from './components/TodoForm.jsx';
import TodoList from './components/TodoList.jsx';
import FilterBar from './components/FilterBar.jsx';
import Pagination from './components/Pagination.jsx';
import * as api from './api.js';

const DEFAULT_FILTERS = {
  search: '',
  status: 'all',
  sortBy: 'createdAt',
  order: 'desc',
  page: 1,
  limit: 5,
};

export default function App() {
  const [todos, setTodos] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.fetchTodos(filters);
      setTodos(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(loadTodos, 300); // debounce cho ô search
    return () => clearTimeout(timer);
  }, [loadTodos]);

  async function handleCreate(title) {
    await api.createTodo(title);
    await loadTodos();
  }

  async function handleToggle(id) {
    try {
      await api.toggleTodo(id);
      await loadTodos();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdateTitle(id, title) {
    await api.updateTodo(id, { title });
    await loadTodos();
  }

  async function handleDelete(id) {
    if (!window.confirm('Bạn có chắc muốn xoá công việc này?')) return;
    try {
      await api.deleteTodo(id);
      await loadTodos();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-container">
      <header>
        <h1>📝 Quản lý công việc</h1>
      </header>

      <TodoForm onSubmit={handleCreate} />
      <FilterBar filters={filters} onChange={setFilters} />

      {error && <p className="error-banner">⚠️ {error}</p>}

      {loading ? (
        <p className="loading-state">Đang tải...</p>
      ) : (
        <TodoList
          todos={todos}
          onToggle={handleToggle}
          onUpdateTitle={handleUpdateTitle}
          onDelete={handleDelete}
        />
      )}

      <Pagination pagination={pagination} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
    </div>
  );
}
