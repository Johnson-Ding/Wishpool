#!/bin/bash

echo "🚀 Wishpool iOS 快速验证脚本"
echo "============================"

echo "📦 1. 编译验证..."
if swift build; then
    echo "✅ SPM 编译成功"
else
    echo "❌ SPM 编译失败"
    echo "⚠️ 如果当前运行环境受沙箱限制，SwiftPM 可能因为 sandbox/cache 权限失败。请在本机终端或 Xcode 中复核。"
    exit 1
fi

echo ""
echo "🎯 2. 打开 Xcode Workspace..."
open Wishpool.xcworkspace

echo ""
echo "✨ 验证清单："
echo "  1. 确保本地 SPM 依赖已解析（WishpoolCore + WishpoolApp）"
echo "  2. Build & Run"
echo "  3. 应该看到："
echo "     - 🎬 完整开屏动画（2.6s）"
echo "     - 📱 双Tab导航 + 中央发愿按钮"
echo "     - 🌙 主题系统（默认月亮主题）"
echo "     - ✨ 星空、脉冲光晕等完整动画效果"

echo ""
echo "🔧 如果还有问题，可以尝试："
echo "  • Clean Build Folder (⌘+Shift+K)"
echo "  • 重启 Xcode"
echo "  • 重启模拟器"
echo "  • 若命令行在受限环境中失败，改用本机终端直接执行 `cd ios && swift build`"

echo ""
echo "📱 理想效果：开屏动画 → 心愿广场/我的愿望双Tab界面"
