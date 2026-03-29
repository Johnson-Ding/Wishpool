import { primaryNavItems } from "@/app/navigation";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";

export function ProductNav() {
  const [location] = useLocation();

  return (
    <nav className="border-b border-white/10 bg-[var(--bg-primary)]/95 backdrop-blur" aria-label="主导航">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 overflow-x-auto px-4 py-3">
        {primaryNavItems.map((item) => {
          const active = location === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white text-black"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
