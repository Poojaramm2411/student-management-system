import { useState } from "react";

export function usePagination(initialPage = 0, initialSize = 10) {
  const [page, setPage] = useState(initialPage);
  const [size] = useState(initialSize);

  const goToPage = (p) => setPage(p);
  const nextPage = (total) => { if (page < total - 1) setPage(page + 1); };
  const prevPage = () => { if (page > 0) setPage(page - 1); };
  const reset = () => setPage(0);

  return { page, size, goToPage, nextPage, prevPage, reset };
}