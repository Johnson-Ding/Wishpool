import Foundation

public protocol WishpoolRepository: Sendable {
    func listFeed(limit: Int) async throws -> [FeedItem]
    func likeFeedItem(id: Int) async throws -> FeedItem
    func listComments(bottleID: Int) async throws -> [FeedComment]
    func createComment(bottleID: Int, content: String, authorName: String?) async throws -> FeedComment

    func listMyWishes() async throws -> [WishTask]
    func createWish(_ draft: WishDraft) async throws -> WishTask
    func getWish(id: String) async throws -> WishTask
    func clarifyWish(id: String, draft: WishDraft) async throws -> WishTask
    func confirmWishPlan(id: String) async throws -> WishTask
    func listRounds(wishID: String) async throws -> [ValidationRound]
}

public struct SupabaseConfig: Sendable {
    public var projectURL: URL
    public var anonKey: String
    public var deviceID: String

    public init(projectURL: URL, anonKey: String, deviceID: String) {
        self.projectURL = projectURL
        self.anonKey = anonKey
        self.deviceID = deviceID
    }
}

public enum WishpoolRepositoryError: LocalizedError {
    case invalidResponse
    case notFound
    case server(String)

    public var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "服务响应格式不正确"
        case .notFound:
            return "没有找到对应数据"
        case let .server(message):
            return message
        }
    }
}
