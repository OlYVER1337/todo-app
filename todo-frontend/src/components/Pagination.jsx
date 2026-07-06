export default function Pagination({ pagination, onPageChange }) {
  const { page, limit, total } = pagination;
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button className="btn btn-secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ← Trước
      </button>
      <span>
        Trang {page}/{totalPages} ({total} công việc)
      </span>
      <button
        className="btn btn-secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Sau →
      </button>
    </div>
  );
}
