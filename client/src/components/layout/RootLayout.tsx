import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { ErrorBoundary } from "./ErrorBoundary";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-zinc-50" data-container="layout--root">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6" data-container="layout--main">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
