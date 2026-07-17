import type { ReactNode } from "react";
import { ErrorMessage } from "@/components/ui";

interface AuthLayoutProps {
  subtitle: string;
  error: string | null;
  children: ReactNode;
  bottomLink: ReactNode;
}

export function AuthLayout({ subtitle, error, children, bottomLink }: AuthLayoutProps) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-zinc-50"
      data-container="page--auth"
    >
      <div
        className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm"
        data-container="card--auth"
      >
        <h1 className="mb-2 text-2xl font-bold text-zinc-900">Meetly</h1>
        <p className="mb-6 text-sm text-zinc-500">{subtitle}</p>

        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        {children}

        {bottomLink && (
          <p className="mt-6 text-center text-sm text-zinc-500">
            {bottomLink}
          </p>
        )}
      </div>
    </div>
  );
}
