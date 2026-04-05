export interface PrimaryNavItem {
  label: string;
  path: string;
}

// 左侧导航项
export const leftNavItems: PrimaryNavItem[] = [
  { label: "对话", path: "/chat" },
  { label: "我的", path: "/wishes" },
];

// 右侧导航项
export const rightNavItems: PrimaryNavItem[] = [
  { label: "广场", path: "/plaza" },
  { label: "热门", path: "/plaza?filter=hot" },
  { label: "关注", path: "/plaza?filter=following" },
];

// 保持向后兼容
export const primaryNavItems: PrimaryNavItem[] = [
  { label: "广场", path: "/plaza" },
  { label: "发愿", path: "/wish/new" },
  { label: "我的愿望", path: "/wishes" },
  { label: "通知", path: "/notifications" },
  { label: "我的", path: "/me" },
];
