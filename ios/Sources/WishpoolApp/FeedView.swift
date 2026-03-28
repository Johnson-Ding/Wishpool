import SwiftUI
import WishpoolCore

struct FeedView: View {
    let state: Loadable<[FeedItem]>
    let onLike: @Sendable (Int) async -> Void
    let onComment: @Sendable (Int) async -> Void
    let onCreateWish: () -> Void

    @State private var current = 0
    @State private var dragOffset: CGFloat = 0

    var body: some View {
        VStack(spacing: 0) {
            header
                .padding(.horizontal, 18)
                .padding(.top, 24)
                .padding(.bottom, 16)

            switch state {
            case .idle, .loading:
                Spacer()
                ProgressView("正在加载广场")
                    .tint(WishpoolPalette.gold)
                    .foregroundStyle(WishpoolPalette.textSecondary)
                Spacer()

            case let .failed(message):
                Spacer()
                Text(message)
                    .foregroundStyle(WishpoolPalette.textSecondary)
                    .wishpoolCardStyle()
                    .padding(.horizontal, 18)
                Spacer()

            case let .loaded(items):
                if items.isEmpty {
                    Spacer()
                    Text("暂无漂流瓶")
                        .foregroundStyle(WishpoolPalette.textSecondary)
                    Spacer()
                } else {
                    let idx = min(current, items.count - 1)

                    FeedCard(item: items[idx], onLike: onLike, onComment: onComment)
                        .padding(.horizontal, 18)
                        .id(idx)
                        .offset(x: dragOffset)
                        .transition(.opacity.combined(with: .scale(scale: 0.95)))
                        .gesture(
                            DragGesture(minimumDistance: 20)
                                .onChanged { dragOffset = $0.translation.width }
                                .onEnded { value in
                                    let threshold: CGFloat = 55
                                    if value.translation.width < -threshold, current < items.count - 1 {
                                        withAnimation(.spring(response: 0.4, dampingFraction: 0.78)) {
                                            current += 1
                                            dragOffset = 0
                                        }
                                    } else if value.translation.width > threshold, current > 0 {
                                        withAnimation(.spring(response: 0.4, dampingFraction: 0.78)) {
                                            current -= 1
                                            dragOffset = 0
                                        }
                                    } else {
                                        withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                                            dragOffset = 0
                                        }
                                    }
                                }
                        )
                        .animation(.spring(response: 0.4, dampingFraction: 0.78), value: current)

                    Spacer()

                    progressDots(total: items.count)
                        .padding(.bottom, 8)

                    Text("← 左右滑动浏览 →")
                        .font(.caption)
                        .foregroundStyle(WishpoolPalette.textSecondary.opacity(0.5))
                        .padding(.bottom, 16)
                }
            }
        }
        .background(WishpoolPalette.background)
        .hideNavigationBar()
    }

    private var header: some View {
        HStack {
            VStack(alignment: .leading, spacing: 6) {
                Text("心愿广场")
                    .font(.system(size: 30, weight: .bold, design: .serif))
                    .foregroundStyle(WishpoolPalette.textPrimary)
                Text("看见别人如何把模糊愿望推进成真实周末")
                    .font(.subheadline)
                    .foregroundStyle(WishpoolPalette.textSecondary)
            }
            Spacer()
            Button(action: onCreateWish) {
                Image(systemName: "sparkles")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(WishpoolPalette.background)
                    .frame(width: 40, height: 40)
                    .background(Circle().fill(WishpoolPalette.gold))
            }
            .buttonStyle(ScaleButtonStyle())
        }
        .staggeredEntrance(index: 0)
    }

    private func progressDots(total: Int) -> some View {
        HStack(spacing: 6) {
            ForEach(0..<total, id: \.self) { index in
                Capsule()
                    .fill(index == current ? WishpoolPalette.gold : WishpoolPalette.textSecondary.opacity(0.3))
                    .frame(width: index == current ? 18 : 6, height: 6)
                    .animation(.spring(response: 0.3, dampingFraction: 0.7), value: current)
            }
        }
    }
}

private struct FeedCard: View {
    let item: FeedItem
    let onLike: @Sendable (Int) async -> Void
    let onComment: @Sendable (Int) async -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text(item.tag)
                    .font(.caption.weight(.semibold))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Capsule().fill(WishpoolPalette.surfaceRaised))
                    .foregroundStyle(WishpoolPalette.gold)
                Spacer()
                Text(item.location)
                    .font(.caption)
                    .foregroundStyle(WishpoolPalette.textSecondary)
            }

            Text(item.title)
                .font(.title3.weight(.semibold))
                .foregroundStyle(WishpoolPalette.textPrimary)

            Text(item.excerpt)
                .font(.body)
                .foregroundStyle(WishpoolPalette.textSecondary)

            Text(item.meta)
                .font(.footnote)
                .foregroundStyle(WishpoolPalette.mint)

            HStack(spacing: 12) {
                Button {
                    Task { await onLike(item.id) }
                } label: {
                    Label("\(item.likes)", systemImage: "heart.fill")
                }
                .buttonStyle(ScaleButtonStyle())
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(
                    Capsule().fill(WishpoolPalette.surfaceRaised)
                )

                Button {
                    Task { await onComment(item.id) }
                } label: {
                    Label("评论", systemImage: "ellipsis.message")
                }
                .buttonStyle(ScaleButtonStyle())
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(
                    Capsule()
                        .strokeBorder(WishpoolPalette.mint.opacity(0.5), lineWidth: 1)
                )
            }
            .font(.subheadline.weight(.semibold))
        }
        .wishpoolCardStyle()
    }
}

struct CommentsSheet: View {
    let state: Loadable<[FeedComment]>
    let onSubmit: @Sendable (String) async -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var content = ""

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                switch state {
                case .idle, .loading:
                    ProgressView("正在加载评论")
                        .tint(WishpoolPalette.gold)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                case let .failed(message):
                    Text(message)
                        .foregroundStyle(WishpoolPalette.textSecondary)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                case let .loaded(comments):
                    List(comments) { comment in
                        VStack(alignment: .leading, spacing: 6) {
                            Text(comment.authorName)
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(WishpoolPalette.textPrimary)
                            Text(comment.content)
                                .font(.body)
                                .foregroundStyle(WishpoolPalette.textSecondary)
                        }
                        .listRowBackground(WishpoolPalette.surface)
                    }
                    .scrollContentBackground(.hidden)
                }

                HStack {
                    TextField("写下你的回应", text: $content, axis: .vertical)
                        .textFieldStyle(.roundedBorder)
                    Button("发送") {
                        let value = content.trimmingCharacters(in: .whitespacesAndNewlines)
                        guard !value.isEmpty else { return }
                        Task {
                            await onSubmit(value)
                            content = ""
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(WishpoolPalette.gold)
                }
                .padding()
            }
            .background(WishpoolPalette.background)
            .navigationTitle("评论")
            .toolbar {
                ToolbarItem(placement: .automatic) {
                    Button("关闭") { dismiss() }
                }
            }
        }
    }
}
