import { selfCanonical } from './canonical';

export function relNextPrev(input: { path: string; page?: number; totalPages?: number; pageParam?: string }) {
  const page = input.page ?? 1;
  const total = input.totalPages ?? 1;
  const param = input.pageParam ?? 'page';
  if (total <= 1) return { prev: null as string | null, next: null as string | null };
  const href = (n: number) => (n <= 1 ? selfCanonical(input.path) : `${selfCanonical(input.path)}?${param}=${n}`);
  return {
    prev: page > 1 ? href(page - 1) : null,
    next: page < total ? href(page + 1) : null,
  };
}
