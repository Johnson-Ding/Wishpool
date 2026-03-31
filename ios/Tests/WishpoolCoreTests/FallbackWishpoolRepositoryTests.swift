import Testing
@testable import WishpoolCore

@Test("广场主数据源返回空数组时回退到本地 feed")
func feedFallsBackWhenPrimaryReturnsEmptyList() async throws {
    let fallbackItem = FeedItem(
        id: 99,
        type: "story",
        tag: "本地兜底",
        tagColor: "#FFFFFF",
        tagBackground: "#000000",
        title: "fallback",
        meta: "meta",
        location: "上海",
        excerpt: "excerpt",
        likes: 1,
        createdAt: "2026-03-30T00:00:00.000Z"
    )

    let repository = FallbackWishpoolRepository(
        primary: MockWishpoolRepository(feedItems: []),
        fallback: MockWishpoolRepository(feedItems: [fallbackItem])
    )

    let items = try await repository.listFeed(limit: 24)

    #expect(items.map(\.id) == [99])
}
