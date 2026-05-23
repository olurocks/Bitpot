import { useState, useCallback } from "react";

export function usePagination<T>(items: T[], pageSize = 20) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(items.length / pageSize);
  const paginated = items.slice(page * pageSize, (page + 1) * pageSize);

  const next = useCallback(() => setPage(p => Math.min(totalPages - 1, p + 1)), [totalPages]);
  const prev = useCallback(() => setPage(p => Math.max(0, p - 1)), []);
  const reset = useCallback(() => setPage(0), []);

  return { paginated, page, totalPages, next, prev, reset };
}