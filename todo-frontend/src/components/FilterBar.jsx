export default function FilterBar({ filters, onChange }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value, page: 1 });
  }

  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="🔍 Tìm kiếm công việc..."
        value={filters.search}
        onChange={(e) => update('search', e.target.value)}
      />

      <select value={filters.status} onChange={(e) => update('status', e.target.value)}>
        <option value="all">Tất cả</option>
        <option value="pending">Chưa hoàn thành</option>
        <option value="completed">Đã hoàn thành</option>
      </select>

      <select
        value={`${filters.sortBy}:${filters.order}`}
        onChange={(e) => {
          const [sortBy, order] = e.target.value.split(':');
          onChange({ ...filters, sortBy, order, page: 1 });
        }}
      >
        <option value="createdAt:desc">Mới nhất</option>
        <option value="createdAt:asc">Cũ nhất</option>
        <option value="title:asc">Tiêu đề A-Z</option>
        <option value="title:desc">Tiêu đề Z-A</option>
      </select>
    </div>
  );
}
