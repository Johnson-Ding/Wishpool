import Foundation

public actor MockWishpoolRepository: WishpoolRepository {
    private var feedItems: [FeedItem]
    private var comments: [Int: [FeedComment]]
    private var wishes: [WishTask]
    private var rounds: [String: [ValidationRound]]

    public init(
        feedItems: [FeedItem]? = nil,
        wishes: [WishTask]? = nil,
        comments: [Int: [FeedComment]]? = nil,
        rounds: [String: [ValidationRound]]? = nil
    ) {
        self.feedItems = feedItems ?? MockData.feedItems
        self.comments = comments ?? MockData.comments
        self.wishes = wishes ?? MockData.wishes
        self.rounds = rounds ?? MockData.rounds
    }

    public func listFeed(limit: Int) async throws -> [FeedItem] {
        Array(feedItems.prefix(limit))
    }

    public func likeFeedItem(id: Int) async throws -> FeedItem {
        guard let index = feedItems.firstIndex(where: { $0.id == id }) else {
            throw WishpoolRepositoryError.notFound
        }
        feedItems[index].likes += 1
        return feedItems[index]
    }

    public func listComments(bottleID: Int) async throws -> [FeedComment] {
        comments[bottleID, default: []]
    }

    public func createComment(bottleID: Int, content: String, authorName: String?) async throws -> FeedComment {
        let comment = FeedComment(
            id: UUID().uuidString,
            bottleID: bottleID,
            authorName: authorName ?? "匿名用户",
            content: content,
            createdAt: ISO8601DateFormatter().string(from: Date())
        )
        comments[bottleID, default: []].append(comment)
        return comment
    }

    public func listMyWishes() async throws -> [WishTask] {
        wishes.sorted { $0.updatedAt > $1.updatedAt }
    }

    public func createWish(_ draft: WishDraft) async throws -> WishTask {
        let now = ISO8601DateFormatter().string(from: Date())
        let wish = WishTask(
            id: UUID().uuidString,
            anonymousUserID: "mock-user",
            title: draft.title ?? "untitled wish",
            intent: draft.intent,
            status: .clarifying,
            city: draft.city,
            budget: draft.budget,
            timeWindow: draft.timeWindow,
            rawInput: draft.rawInput ?? draft.intent,
            aiPlan: AIPlan(summary: "正在为你生成计划…", intent: draft.intent),
            createdAt: now,
            updatedAt: now
        )
        wishes.insert(wish, at: 0)
        rounds[wish.id] = []
        return wish
    }

    public func getWish(id: String) async throws -> WishTask {
        guard let wish = wishes.first(where: { $0.id == id }) else {
            throw WishpoolRepositoryError.notFound
        }
        return wish
    }

    public func clarifyWish(id: String, draft: WishDraft) async throws -> WishTask {
        guard let index = wishes.firstIndex(where: { $0.id == id }) else {
            throw WishpoolRepositoryError.notFound
        }

        wishes[index].title = draft.title ?? wishes[index].title
        wishes[index].intent = draft.intent
        wishes[index].city = draft.city
        wishes[index].budget = draft.budget
        wishes[index].timeWindow = draft.timeWindow
        wishes[index].rawInput = draft.rawInput ?? draft.intent
        wishes[index].status = .planning
        wishes[index].aiPlan = AIPlan(
            source: "mock",
            summary: "先确认城市、预算与时间，再进入执行准备。",
            intent: draft.intent,
            steps: ["确认目标城市", "筛选预算范围", "锁定时间窗口"]
        )
        wishes[index].updatedAt = ISO8601DateFormatter().string(from: Date())
        rounds[id, default: []] = [
            ValidationRound(
                id: UUID().uuidString,
                roundNumber: 1,
                summary: "已根据你的补充信息生成首版方案",
                humanCheckPassed: nil,
                createdAt: ISO8601DateFormatter().string(from: Date())
            ),
        ]
        return wishes[index]
    }

    public func confirmWishPlan(id: String) async throws -> WishTask {
        guard let index = wishes.firstIndex(where: { $0.id == id }) else {
            throw WishpoolRepositoryError.notFound
        }
        wishes[index].status = .ready
        wishes[index].confirmedAt = ISO8601DateFormatter().string(from: Date())
        wishes[index].updatedAt = wishes[index].confirmedAt ?? wishes[index].updatedAt
        return wishes[index]
    }

    public func listRounds(wishID: String) async throws -> [ValidationRound] {
        rounds[wishID, default: []]
    }
}

public enum MockData {
    public static let feedItems: [FeedItem] = [
        FeedItem(
            id: 1,
            sourceType: "seed",
            type: "story",
            tag: "城市活动",
            tagColor: "#F5C842",
            tagBackground: "#1B2235",
            title: "第一次参加城市夜跑，认识了固定搭子",
            meta: "3人助力 · 6天完成",
            location: "上海 · 上周",
            excerpt: "当前未连到 Supabase 时，先展示本地兜底内容。",
            likes: 132,
            createdAt: "2026-03-28T08:00:00.000Z"
        ),
        FeedItem(
            id: 2,
            sourceType: "seed",
            type: "mumble",
            tag: "周末计划",
            tagColor: "#7FD1C8",
            tagBackground: "#16212E",
            title: "如果这个周末就想出门走走，你会先做什么？",
            meta: "轻许愿 · 适合单人出发",
            location: "杭州 · 今日",
            excerpt: "先说出愿望，再让系统帮你把模糊念头收成可执行计划。",
            likes: 54,
            createdAt: "2026-03-27T21:00:00.000Z"
        ),
    ]

    public static let wishes: [WishTask] = [
        WishTask(
            id: "wish-mock-1",
            anonymousUserID: "mock-user",
            title: "周末去滑雪",
            intent: "我想在下个月体验一次滑雪",
            status: .planning,
            city: "北京",
            budget: "1500",
            timeWindow: "下周末",
            rawInput: "我想在下个月体验一次滑雪",
            aiPlan: AIPlan(summary: "先确认雪场、交通和预算。", intent: "滑雪", steps: ["选雪场", "比预算", "锁时间"]),
            createdAt: "2026-03-28T08:00:00.000Z",
            updatedAt: "2026-03-28T08:30:00.000Z"
        ),
        WishTask(
            id: "wish-mock-2",
            anonymousUserID: "mock-user",
            title: "海边吹吹风",
            intent: "周末去海边放松一下",
            status: .inProgress,
            city: "宁波",
            budget: "1200",
            timeWindow: "本周六",
            rawInput: "周末去海边放松一下",
            aiPlan: AIPlan(summary: "民宿和高铁已进入确认中。", intent: "海边", steps: ["民宿确认", "路线确认"]),
            confirmedAt: "2026-03-26T09:30:00.000Z",
            createdAt: "2026-03-25T08:00:00.000Z",
            updatedAt: "2026-03-26T09:30:00.000Z"
        ),
        WishTask(
            id: "wish-mock-3",
            anonymousUserID: "mock-user",
            title: "看个展",
            intent: "找个周末去看展",
            status: .completed,
            city: "上海",
            budget: "300",
            timeWindow: "上周",
            rawInput: "找个周末去看展",
            aiPlan: AIPlan(summary: "展览行程已经完成。", intent: "看展"),
            confirmedAt: "2026-03-18T09:30:00.000Z",
            createdAt: "2026-03-12T08:00:00.000Z",
            updatedAt: "2026-03-20T09:30:00.000Z"
        ),
    ]

    public static let comments: [Int: [FeedComment]] = [
        1: [
            FeedComment(
                id: UUID().uuidString,
                bottleID: 1,
                authorName: "月下旅人",
                content: "这个夜跑故事好有行动力。",
                createdAt: "2026-03-28T10:00:00.000Z"
            ),
        ],
    ]

    public static let rounds: [String: [ValidationRound]] = [
        "wish-mock-1": [
            ValidationRound(
                id: UUID().uuidString,
                roundNumber: 1,
                summary: "已锁定 2 个适合新手的雪场候选",
                humanCheckPassed: nil,
                createdAt: "2026-03-28T08:20:00.000Z"
            ),
        ],
    ]
}
