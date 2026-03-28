import SwiftUI
import WishpoolCore

struct WishpoolAppRootView: View {
    @Bindable var model: WishpoolAppModel
    @Environment(\.themedPalette) private var palette

    var body: some View {
        ZStack(alignment: .bottom) {
            palette.background.ignoresSafeArea()

            content
                .padding(.bottom, 110)

            bottomBar
        }
        .sheet(item: $model.presentedSheet) { sheet in
            switch sheet {
            case .createWish:
                CreateWishSheet(
                    onSubmit: { intent, city, budget, timeWindow in
                        await model.createWish(intent: intent, city: city, budget: budget, timeWindow: timeWindow)
                    }
                )
                .presentationDetents([.medium, .large])
                .presentationBackground(palette.card)

            case let .comments(bottleID):
                CommentsSheet(
                    state: model.commentsState,
                    onSubmit: { content in
                        await model.submitComment(for: bottleID, content: content)
                    }
                )
                .presentationDetents([.medium, .large])
                .presentationBackground(palette.card)

            case .wishDetail:
                WishDetailView(
                    wish: model.selectedWish,
                    roundsState: model.roundsState,
                    onClarify: { intent, city, budget, timeWindow in
                        await model.clarifySelectedWish(intent: intent, city: city, budget: budget, timeWindow: timeWindow)
                    },
                    onConfirm: {
                        await model.confirmSelectedWish()
                    }
                )
                .presentationDetents([.large])
                .presentationBackground(palette.background)
            }
        }
        .overlay(alignment: .top) {
            if let message = model.actionMessage {
                Text(message)
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(palette.primaryForeground)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Capsule().fill(palette.primary))
                    .padding(.top, 14)
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .onAppear {
                        Task {
                            try? await Task.sleep(for: .seconds(2))
                            model.consumeActionMessage()
                        }
                    }
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.75), value: model.actionMessage)
    }

    @ViewBuilder
    private var content: some View {
        switch model.selectedTab {
        case .feed:
            NavigationStack {
                FeedView(
                    state: model.feedState,
                    onLike: { id in await model.likeFeed(id: id) },
                    onComment: { bottleID in await model.openComments(for: bottleID) },
                    onCreateWish: model.openCreateWish
                )
            }
        case .wishes:
            NavigationStack {
                MyWishesView(
                    state: model.wishesState,
                    onOpenWish: { wish in await model.openWish(wish) }
                )
            }
        }
    }

    private var bottomBar: some View {
        HStack(spacing: 0) {
            tabButton(tab: .feed)
            Button(action: model.openCreateWish) {
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [palette.primary, palette.accent],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 62, height: 62)
                        .shadow(color: palette.primary.opacity(0.35), radius: 16, y: 8)
                        .pulseRing()
                    Image(systemName: "mic.fill")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundStyle(palette.primaryForeground)
                }
            }
            .buttonStyle(ScaleButtonStyle(scale: 0.92))
            .frame(maxWidth: .infinity)
            .offset(y: -18)

            tabButton(tab: .wishes)
        }
        .padding(.horizontal, 18)
        .padding(.top, 14)
        .padding(.bottom, 24)
        .background(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(palette.card.opacity(0.96))
                .overlay(
                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                        .strokeBorder(palette.border)
                )
                .ignoresSafeArea(edges: .bottom)
        )
        .padding(.horizontal, 14)
    }

    private func tabButton(tab: AppTab) -> some View {
        Button {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                model.selectedTab = tab
            }
        } label: {
            VStack(spacing: 6) {
                Image(systemName: tab.systemImage)
                    .font(.system(size: 19, weight: .semibold))
                    .scaleEffect(model.selectedTab == tab ? 1.12 : 1.0)
                    .animation(.spring(response: 0.3, dampingFraction: 0.5), value: model.selectedTab)
                Text(tab.title)
                    .font(.caption.weight(model.selectedTab == tab ? .semibold : .regular))
            }
            .foregroundStyle(model.selectedTab == tab ? palette.primary : palette.mutedForeground)
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(ScaleButtonStyle(scale: 0.92))
    }
}
