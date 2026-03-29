import SwiftUI

/// 许愿创建FAB组件 - 支持双模式交互
/// 对应Android的MoonBottomBar中的FAB逻辑
/// 单击 → 语音直发模式（CreateWishDirectSheet）
/// 长按 → 语音转录编辑模式（CreateWishSheetWithASR）
struct WishCreationFAB: View {
    let onCreateWish: @Sendable (String) async -> Void

    @State private var showDirectMode = false
    @State private var showEditMode = false
    @State private var isLongPressing = false
    @GestureState private var longPressState = false

    var body: some View {
        Button(action: {
            // 单击行为：语音直发模式
            if !isLongPressing {
                showDirectMode = true
            }
        }) {
            ZStack {
                Circle()
                    .fill(WishpoolPalette.gold)
                    .frame(width: 56, height: 56)
                    .shadow(color: .black.opacity(0.2), radius: 8, x: 0, y: 4)

                Image(systemName: "mic.fill")
                    .font(.title2)
                    .foregroundStyle(WishpoolPalette.background)
                    .scaleEffect(longPressState ? 1.1 : 1.0)
            }
        }
        .buttonStyle(PlainButtonStyle())
        .scaleEffect(longPressState ? 0.95 : 1.0)
        .animation(.easeInOut(duration: 0.1), value: longPressState)
        .simultaneousGesture(
            // 长按手势：语音转录编辑模式
            LongPressGesture(minimumDuration: 0.5)
                .updating($longPressState) { currentState, gestureState, transaction in
                    gestureState = currentState
                    transaction.animation = Animation.easeInOut(duration: 0.1)
                }
                .onEnded { _ in
                    isLongPressing = true
                    showEditMode = true

                    // 重置长按状态（避免影响下次点击）
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                        isLongPressing = false
                    }
                }
        )
        .sheet(isPresented: $showDirectMode) {
            CreateWishDirectSheet(onSubmit: onCreateWish)
        }
        .sheet(isPresented: $showEditMode) {
            CreateWishSheetWithASR { intent, city, budget, timeWindow in
                // 对于编辑模式，主要使用intent字段
                await onCreateWish(intent)
            }
        }
    }
}

/// 底部导航栏组件 - 集成许愿FAB
/// 对应Android的MoonBottomBar
struct WishpoolBottomBar: View {
    @Binding var activeTab: HomeTab
    let onCreateWish: @Sendable (String) async -> Void

    enum HomeTab: CaseIterable {
        case feed
        case myWishes

        var title: String {
            switch self {
            case .feed: return "广场"
            case .myWishes: return "我的"
            }
        }

        var icon: String {
            switch self {
            case .feed: return "house.fill"
            case .myWishes: return "person.fill"
            }
        }
    }

    var body: some View {
        HStack {
            // 左侧Tab按钮
            ForEach(HomeTab.allCases, id: \.self) { tab in
                Button(action: {
                    activeTab = tab
                }) {
                    VStack(spacing: 4) {
                        Image(systemName: tab.icon)
                            .font(.title3)
                        Text(tab.title)
                            .font(.caption)
                    }
                    .foregroundStyle(activeTab == tab ? WishpoolPalette.gold : WishpoolPalette.textSecondary)
                }
                .frame(maxWidth: .infinity)
            }

            // 中间许愿FAB
            WishCreationFAB(onCreateWish: onCreateWish)
                .padding(.bottom, 8)

            // 右侧占位（保持对称）
            Spacer()
                .frame(maxWidth: .infinity)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(
            Rectangle()
                .fill(WishpoolPalette.background)
                .shadow(color: .black.opacity(0.1), radius: 1, x: 0, y: -1)
        )
    }
}

// MARK: - 使用示例

struct ContentView: View {
    @State private var activeTab: WishpoolBottomBar.HomeTab = .feed
    @State private var showDirectMode = false

    var body: some View {
        VStack(spacing: 0) {
            // 主内容区域
            Group {
                switch activeTab {
                case .feed:
                    FeedView(
                        state: .loaded([]),
                        onLike: { _ in },
                        onComment: { _ in },
                        onCreateWish: { showDirectMode = true }
                    )
                case .myWishes:
                    MyWishesView(
                        state: .loaded([]),
                        onOpenWish: { _ in }
                    )
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            // 底部导航栏
            // 注：此处的 print 仅用于预览/测试，实际生产代码应调用 WishpoolAppModel.createWish()
            // 见 WishpoolAppRootView.swift 中的实际调用方式
            WishpoolBottomBar(
                activeTab: $activeTab,
                onCreateWish: { wishText in
                    print("Created wish: \(wishText)")
                    // 实际调用: await model.createWish(intent: wishText, city: "", budget: "", timeWindow: "")
                }
            )
        }
        .ignoresSafeArea(.keyboard, edges: .bottom)
    }
}

// MARK: - 注释：占位视图已移除，使用正式的 FeedView.swift 和 MyWishesView.swift 实现