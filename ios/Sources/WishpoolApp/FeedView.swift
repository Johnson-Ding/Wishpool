import SwiftUI
import WishpoolCore

struct FeedView: View {
    let state: Loadable<[FeedItem]>
    let onLike: @Sendable (Int) async -> Void
    let onComment: @Sendable (Int) async -> Void
    let onCreateWish: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                header

                switch state {
                case .idle, .loading:
                    ProgressView("正在加载广场")
                        .tint(WishpoolPalette.gold)
                        .foregroundStyle(WishpoolPalette.textSecondary)
                        .frame(maxWidth: .infinity, alignment: .center)

                case let .failed(message):
                    Text(message)
                        .foregroundStyle(WishpoolPalette.textSecondary)
                        .wishpoolCardStyle()

                case let .loaded(items):
                    ForEach(items) { item in
                        FeedCard(item: item, onLike: onLike, onComment: onComment)
                    }
                }
            }
            .padding(.horizontal, 18)
            .padding(.top, 24)
        }
        .background(WishpoolPalette.background)
        .hideNavigationBar()
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("心愿广场")
                .font(.system(size: 30, weight: .bold, design: .serif))
                .foregroundStyle(WishpoolPalette.textPrimary)
            Text("看见别人如何把模糊愿望推进成真实周末，也把你自己的念头说出来。")
                .font(.body)
                .foregroundStyle(WishpoolPalette.textSecondary)
            Button(action: onCreateWish) {
                Label("发一个新的愿望", systemImage: "sparkles")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(WishpoolPalette.background)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Capsule().fill(WishpoolPalette.gold))
            }
        }
        .wishpoolCardStyle()
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
                .buttonStyle(.borderedProminent)
                .tint(WishpoolPalette.surfaceRaised)

                Button {
                    Task { await onComment(item.id) }
                } label: {
                    Label("评论", systemImage: "ellipsis.message")
                }
                .buttonStyle(.bordered)
                .tint(WishpoolPalette.mint)
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
