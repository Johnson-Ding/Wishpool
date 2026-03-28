import SwiftUI
import WishpoolCore

struct WishpoolAppRootView: View {
    @Bindable var model: WishpoolAppModel

    var body: some View {
        ZStack(alignment: .bottom) {
            WishpoolPalette.background.ignoresSafeArea()

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
                .presentationBackground(WishpoolPalette.surface)

            case let .comments(bottleID):
                CommentsSheet(
                    state: model.commentsState,
                    onSubmit: { content in
                        await model.submitComment(for: bottleID, content: content)
                    }
                )
                .presentationDetents([.medium, .large])
                .presentationBackground(WishpoolPalette.surface)

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
                .presentationBackground(WishpoolPalette.background)
            }
        }
        .overlay(alignment: .top) {
            if let message = model.actionMessage {
                Text(message)
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(WishpoolPalette.background)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Capsule().fill(WishpoolPalette.gold))
                    .padding(.top, 14)
                    .onAppear {
                        Task {
                            try? await Task.sleep(for: .seconds(2))
                            model.consumeActionMessage()
                        }
                    }
            }
        }
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
                                colors: [WishpoolPalette.gold, WishpoolPalette.mint],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 62, height: 62)
                        .shadow(color: WishpoolPalette.gold.opacity(0.35), radius: 16, y: 8)
                    Image(systemName: "mic.fill")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundStyle(WishpoolPalette.background)
                }
            }
            .frame(maxWidth: .infinity)
            .offset(y: -18)

            tabButton(tab: .wishes)
        }
        .padding(.horizontal, 18)
        .padding(.top, 14)
        .padding(.bottom, 24)
        .background(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(WishpoolPalette.surface.opacity(0.96))
                .overlay(
                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                        .strokeBorder(Color.white.opacity(0.08))
                )
                .ignoresSafeArea(edges: .bottom)
        )
        .padding(.horizontal, 14)
    }

    private func tabButton(tab: AppTab) -> some View {
        Button {
            model.selectedTab = tab
        } label: {
            VStack(spacing: 6) {
                Image(systemName: tab.systemImage)
                    .font(.system(size: 19, weight: .semibold))
                Text(tab.title)
                    .font(.caption.weight(model.selectedTab == tab ? .semibold : .regular))
            }
            .foregroundStyle(model.selectedTab == tab ? WishpoolPalette.gold : WishpoolPalette.textSecondary)
            .frame(maxWidth: .infinity)
        }
    }
}
