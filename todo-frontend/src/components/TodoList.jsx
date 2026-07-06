import TodoItem from './TodoItem.jsx';

export default function TodoList({ todos, onToggle, onUpdateTitle, onDelete }) {
  if (todos.length === 0) {
    return <p className="empty-state">Không có công việc nào phù hợp.</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onUpdateTitle={onUpdateTitle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
