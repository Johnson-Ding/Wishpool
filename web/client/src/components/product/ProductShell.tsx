import { ProductNav } from "./ProductNav";

interface ProductShellProps {
  children: React.ReactNode;
}

export function ProductShell({ children }: ProductShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <ProductNav />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
