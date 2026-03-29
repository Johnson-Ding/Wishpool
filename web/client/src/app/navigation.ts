export interface PrimaryNavItem {
  label: string;
  path: string;
}

export const primaryNavItems: PrimaryNavItem[] = [
  { label: "广场", path: "/plaza" },
  { label: "发愿", path: "/wish/new" },
  { label: "我的愿望", path: "/wishes" },
  { label: "通知", path: "/notifications" },
  { label: "我的", path: "/me" },
];
