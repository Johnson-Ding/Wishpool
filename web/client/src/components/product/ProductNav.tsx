import { leftNavItems, rightNavItems } from "@/app/navigation";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { ThemeContext } from "@/contexts/theme/ThemeContext";
import { useContext, useState } from "react";
import { getCharacterAvatar } from "@/contexts/character";
import { ThemeSelector } from "@/components/ThemeSelector";

export function ProductNav() {
  const [location] = useLocation();
  const { theme, setTheme } = useContext(ThemeContext);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  return (
    <>
    <nav
      className="border-b backdrop-blur z-30"
      style={{
        borderColor: "var(--border)",
        background: "var(--background)/95"
      }}
      aria-label="主导航"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* 左侧：头像 + 我的愿望 */}
        <div className="flex items-center gap-4">
          {/* 角色头像 - 纯展示，不触发主题选择 */}
          <div
            className={`w-9 h-9 rounded-full overflow-hidden ${
              theme === "cloud" ? "cloud-breathe" : "moon-pulse"
            }`}
            style={{
              background: "var(--primary)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <img
              src={getCharacterAvatar(theme)}
              alt="角色头像"
              className="w-full h-full object-cover"
            />
          </div>

          {/* 左侧导航 */}
          {leftNavItems.map((item) => {
            const active = location === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-white"
                    : "hover:opacity-80"
                )}
                style={{
                  background: active ? "var(--primary)" : "var(--secondary)",
                  color: active ? "var(--primary-foreground)" : "var(--foreground)",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* 右侧：广场导航 + 主题切换 */}
        <div className="flex items-center gap-4">
          {/* 右侧导航项 */}
          <div className="flex items-center gap-2">
            {rightNavItems.map((item) => {
              const active = location.startsWith(item.path.split('?')[0]) &&
                            (!item.path.includes('?') || location.includes(item.path.split('?')[1]));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active ? "text-white" : "hover:opacity-80"
                  )}
                  style={{
                    background: active ? "var(--primary)" : "var(--secondary)",
                    color: active ? "var(--primary-foreground)" : "var(--foreground)",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* 主题切换器 */}
          <button
            onClick={() => setShowThemeSelector(true)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{
              background: "var(--secondary)",
              color: "var(--foreground)",
            }}
          >
            <span className="text-base">
              {theme === 'moon' ? '🌙' : theme === 'cloud' ? '☁️' : '⭐'}
            </span>
            <span>主题</span>
          </button>
        </div>
      </div>
    </nav>

    {/* ThemeSelector - 使用 Portal 渲染到 body */}
    <ThemeSelector
      open={showThemeSelector}
      onClose={() => setShowThemeSelector(false)}
    />
  </>);
}
