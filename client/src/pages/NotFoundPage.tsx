import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20" data-container="page--not-found">
      <h1 className="mb-2 text-4xl font-bold text-zinc-900">404</h1>
      <p className="text-zinc-500">Страница не найдена</p>
      <Link to="/" className="mt-4 text-sm text-zinc-600 hover:text-zinc-900">
        → На главную
      </Link>
    </div>
  );
}
