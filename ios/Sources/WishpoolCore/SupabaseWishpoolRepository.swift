import Foundation

public protocol HTTPTransport: Sendable {
    func send(_ request: URLRequest) async throws -> (Data, HTTPURLResponse)
}

public struct URLSessionTransport: HTTPTransport {
    public init() {}

    public func send(_ request: URLRequest) async throws -> (Data, HTTPURLResponse) {
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw WishpoolRepositoryError.invalidResponse
        }
        return (data, httpResponse)
    }
}

public actor SupabaseWishpoolRepository: WishpoolRepository {
    private let config: SupabaseConfig
    private let transport: HTTPTransport
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    public init(config: SupabaseConfig, transport: HTTPTransport = URLSessionTransport()) {
        self.config = config
        self.transport = transport
        self.decoder = JSONDecoder()
        self.encoder = JSONEncoder()
    }

    public func listFeed(limit: Int) async throws -> [FeedItem] {
        let path = "drift_bottles?select=*&is_active=eq.true&order=created_at.desc&limit=\(limit)"
        let items: [FeedItemDTO] = try await sendREST(path: path)
        return items.map { $0.toDomain() }
    }

    public func likeFeedItem(id: Int) async throws -> FeedItem {
        let payload = ["p_bottle_id": id]
        let item: FeedItemDTO = try await sendRPC(name: "like_bottle", body: payload)
        return item.toDomain()
    }

    public func listComments(bottleID: Int) async throws -> [FeedComment] {
        let path = "drift_bottle_comments?select=*&drift_bottle_id=eq.\(bottleID)&order=created_at.asc"
        let items: [FeedCommentDTO] = try await sendREST(path: path)
        return items.map { $0.toDomain() }
    }

    public func createComment(bottleID: Int, content: String, authorName: String?) async throws -> FeedComment {
        let payload = AnyEncodable([
            CreateCommentPayload(
                driftBottleID: bottleID,
                authorName: authorName ?? "匿名用户",
                content: content
            ),
        ])
        let items: [FeedCommentDTO] = try await sendREST(
            path: "drift_bottle_comments",
            method: "POST",
            body: payload,
            extraHeaders: ["Prefer": "return=representation"]
        )
        guard let comment = items.first else {
            throw WishpoolRepositoryError.invalidResponse
        }
        return comment.toDomain()
    }

    public func listMyWishes() async throws -> [WishTask] {
        let items: [WishTaskDTO] = try await sendRPC(
            name: "list_my_wishes",
            body: ListMyWishesPayload(pDeviceID: config.deviceID)
        )
        return items.map { $0.toDomain() }
    }

    public func createWish(_ draft: WishDraft) async throws -> WishTask {
        let wish: WishTaskDTO = try await sendRPC(
            name: "create_wish",
            body: CreateWishPayload(
                pDeviceID: config.deviceID,
                pIntent: draft.intent,
                pTitle: draft.title ?? "untitled wish",
                pCity: draft.city,
                pBudget: draft.budget,
                pTimeWindow: draft.timeWindow,
                pRawInput: draft.rawInput ?? draft.intent
            )
        )
        return wish.toDomain()
    }

    public func getWish(id: String) async throws -> WishTask {
        let path = "wish_tasks?select=*&id=eq.\(id)"
        let items: [WishTaskDTO] = try await sendREST(path: path)
        guard let wish = items.first else {
            throw WishpoolRepositoryError.notFound
        }
        return wish.toDomain()
    }

    public func clarifyWish(id: String, draft: WishDraft) async throws -> WishTask {
        let wish: WishTaskDTO = try await sendRPC(
            name: "clarify_wish",
            body: ClarifyWishPayload(
                pWishID: id,
                pTitle: draft.title,
                pIntent: draft.intent,
                pCity: draft.city,
                pBudget: draft.budget,
                pTimeWindow: draft.timeWindow,
                pRawInput: draft.rawInput ?? draft.intent
            )
        )
        return wish.toDomain()
    }

    public func confirmWishPlan(id: String) async throws -> WishTask {
        let wish: WishTaskDTO = try await sendRPC(
            name: "confirm_wish_plan",
            body: ConfirmWishPayload(pWishID: id)
        )
        return wish.toDomain()
    }

    public func listRounds(wishID: String) async throws -> [ValidationRound] {
        let path = "validation_rounds?select=*&wish_task_id=eq.\(wishID)&order=round_number.asc"
        let items: [ValidationRoundDTO] = try await sendREST(path: path)
        return items.map { $0.toDomain() }
    }

    private func sendREST<Response: Decodable>(
        path: String,
        method: String = "GET",
        body: AnyEncodable? = nil,
        extraHeaders: [String: String] = [:]
    ) async throws -> Response {
        guard let url = URL(string: "rest/v1/\(path)", relativeTo: config.projectURL) else {
            throw WishpoolRepositoryError.invalidResponse
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        applyBaseHeaders(to: &request, extraHeaders: extraHeaders)
        if let body = body {
            request.httpBody = try encoder.encode(body)
        }

        return try await decodeResponse(for: request)
    }

    private func sendRPC<Response: Decodable>(name: String, body: some Encodable) async throws -> Response {
        guard let url = URL(string: "rest/v1/rpc/\(name)", relativeTo: config.projectURL) else {
            throw WishpoolRepositoryError.invalidResponse
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        applyBaseHeaders(to: &request)
        request.httpBody = try encoder.encode(AnyEncodable(body))
        return try await decodeResponse(for: request)
    }

    private func applyBaseHeaders(to request: inout URLRequest, extraHeaders: [String: String] = [:]) {
        request.setValue(config.anonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(config.anonKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        for (key, value) in extraHeaders {
            request.setValue(value, forHTTPHeaderField: key)
        }
    }

    private func decodeResponse<Response: Decodable>(for request: URLRequest) async throws -> Response {
        let (data, response) = try await transport.send(request)
        guard (200 ..< 300).contains(response.statusCode) else {
            if let message = try? decoder.decode(SupabaseErrorResponse.self, from: data).message {
                throw WishpoolRepositoryError.server(message)
            }
            throw WishpoolRepositoryError.server("Supabase 请求失败：\(response.statusCode)")
        }

        do {
            return try decoder.decode(Response.self, from: data)
        } catch {
            throw WishpoolRepositoryError.invalidResponse
        }
    }
}

public actor FallbackWishpoolRepository: WishpoolRepository {
    private let primary: any WishpoolRepository
    private let fallback: any WishpoolRepository

    public init(primary: any WishpoolRepository, fallback: any WishpoolRepository) {
        self.primary = primary
        self.fallback = fallback
    }

    public func listFeed(limit: Int) async throws -> [FeedItem] {
        let items = try await run(
            primary: { try await primary.listFeed(limit: limit) },
            fallback: { try await fallback.listFeed(limit: limit) }
        )

        if items.isEmpty {
            return try await fallback.listFeed(limit: limit)
        }

        return items
    }

    public func likeFeedItem(id: Int) async throws -> FeedItem {
        try await run(primary: { try await primary.likeFeedItem(id: id) }, fallback: { try await fallback.likeFeedItem(id: id) })
    }

    public func listComments(bottleID: Int) async throws -> [FeedComment] {
        try await run(primary: { try await primary.listComments(bottleID: bottleID) }, fallback: { try await fallback.listComments(bottleID: bottleID) })
    }

    public func createComment(bottleID: Int, content: String, authorName: String?) async throws -> FeedComment {
        try await run(
            primary: { try await primary.createComment(bottleID: bottleID, content: content, authorName: authorName) },
            fallback: { try await fallback.createComment(bottleID: bottleID, content: content, authorName: authorName) }
        )
    }

    public func listMyWishes() async throws -> [WishTask] {
        try await run(primary: { try await primary.listMyWishes() }, fallback: { try await fallback.listMyWishes() })
    }

    public func createWish(_ draft: WishDraft) async throws -> WishTask {
        try await run(primary: { try await primary.createWish(draft) }, fallback: { try await fallback.createWish(draft) })
    }

    public func getWish(id: String) async throws -> WishTask {
        try await run(primary: { try await primary.getWish(id: id) }, fallback: { try await fallback.getWish(id: id) })
    }

    public func clarifyWish(id: String, draft: WishDraft) async throws -> WishTask {
        try await run(
            primary: { try await primary.clarifyWish(id: id, draft: draft) },
            fallback: { try await fallback.clarifyWish(id: id, draft: draft) }
        )
    }

    public func confirmWishPlan(id: String) async throws -> WishTask {
        try await run(primary: { try await primary.confirmWishPlan(id: id) }, fallback: { try await fallback.confirmWishPlan(id: id) })
    }

    public func listRounds(wishID: String) async throws -> [ValidationRound] {
        try await run(primary: { try await primary.listRounds(wishID: wishID) }, fallback: { try await fallback.listRounds(wishID: wishID) })
    }

    private func run<Value>(
        primary: () async throws -> Value,
        fallback: () async throws -> Value
    ) async throws -> Value {
        do {
            return try await primary()
        } catch {
            return try await fallback()
        }
    }
}

private struct SupabaseErrorResponse: Decodable {
    var message: String
}

private struct ListMyWishesPayload: Encodable {
    let pDeviceID: String

    enum CodingKeys: String, CodingKey {
        case pDeviceID = "p_device_id"
    }
}

private struct CreateWishPayload: Encodable {
    let pDeviceID: String
    let pIntent: String
    let pTitle: String
    let pCity: String?
    let pBudget: String?
    let pTimeWindow: String?
    let pRawInput: String

    enum CodingKeys: String, CodingKey {
        case pDeviceID = "p_device_id"
        case pIntent = "p_intent"
        case pTitle = "p_title"
        case pCity = "p_city"
        case pBudget = "p_budget"
        case pTimeWindow = "p_time_window"
        case pRawInput = "p_raw_input"
    }
}

private struct ClarifyWishPayload: Encodable {
    let pWishID: String
    let pTitle: String?
    let pIntent: String
    let pCity: String?
    let pBudget: String?
    let pTimeWindow: String?
    let pRawInput: String

    enum CodingKeys: String, CodingKey {
        case pWishID = "p_wish_id"
        case pTitle = "p_title"
        case pIntent = "p_intent"
        case pCity = "p_city"
        case pBudget = "p_budget"
        case pTimeWindow = "p_time_window"
        case pRawInput = "p_raw_input"
    }
}

private struct ConfirmWishPayload: Encodable {
    let pWishID: String

    enum CodingKeys: String, CodingKey {
        case pWishID = "p_wish_id"
    }
}

private struct CreateCommentPayload: Encodable {
    let driftBottleID: Int
    let authorName: String
    let content: String

    enum CodingKeys: String, CodingKey {
        case driftBottleID = "drift_bottle_id"
        case authorName = "author_name"
        case content
    }
}

private struct AnyEncodable: Encodable {
    private let encodeBody: (Encoder) throws -> Void

    init(_ wrapped: some Encodable) {
        self.encodeBody = wrapped.encode(to:)
    }

    func encode(to encoder: Encoder) throws {
        try encodeBody(encoder)
    }
}
