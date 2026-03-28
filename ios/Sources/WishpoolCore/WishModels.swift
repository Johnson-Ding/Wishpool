import Foundation

public enum WishExecutionStatus: String, Codable, CaseIterable, Sendable {
    case draft
    case clarifying
    case planning
    case validating
    case locking
    case ready
    case inProgress = "in_progress"
    case completed
    case failed
    case cancelled

    public static func from(raw: String) -> WishExecutionStatus {
        WishExecutionStatus(rawValue: raw.lowercased()) ?? .draft
    }
}

public struct AIPlan: Codable, Equatable, Sendable {
    public var source: String?
    public var summary: String
    public var intent: String?
    public var steps: [String]

    public init(
        source: String? = nil,
        summary: String = "正在为你生成计划…",
        intent: String? = nil,
        steps: [String] = []
    ) {
        self.source = source
        self.summary = summary
        self.intent = intent
        self.steps = steps
    }

    enum CodingKeys: String, CodingKey {
        case source
        case summary
        case intent
        case steps
    }

    public init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.source = try container.decodeIfPresent(String.self, forKey: .source)
        self.summary = try container.decodeIfPresent(String.self, forKey: .summary) ?? "正在为你生成计划…"
        self.intent = try container.decodeIfPresent(String.self, forKey: .intent)
        self.steps = try container.decodeIfPresent([String].self, forKey: .steps) ?? []
    }
}

public struct WishTask: Identifiable, Equatable, Sendable {
    public var id: String
    public var anonymousUserID: String?
    public var title: String
    public var intent: String
    public var status: WishExecutionStatus
    public var city: String?
    public var budget: String?
    public var timeWindow: String?
    public var rawInput: String?
    public var aiPlan: AIPlan
    public var confirmedAt: String?
    public var createdAt: String
    public var updatedAt: String

    public init(
        id: String,
        anonymousUserID: String? = nil,
        title: String,
        intent: String,
        status: WishExecutionStatus,
        city: String? = nil,
        budget: String? = nil,
        timeWindow: String? = nil,
        rawInput: String? = nil,
        aiPlan: AIPlan = .init(),
        confirmedAt: String? = nil,
        createdAt: String = "",
        updatedAt: String = ""
    ) {
        self.id = id
        self.anonymousUserID = anonymousUserID
        self.title = title
        self.intent = intent
        self.status = status
        self.city = city
        self.budget = budget
        self.timeWindow = timeWindow
        self.rawInput = rawInput
        self.aiPlan = aiPlan
        self.confirmedAt = confirmedAt
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

public struct FeedItem: Identifiable, Equatable, Sendable {
    public var id: Int
    public var fulfillmentID: String?
    public var sourceType: String
    public var type: String
    public var tag: String
    public var tagColor: String
    public var tagBackground: String
    public var title: String
    public var meta: String
    public var location: String
    public var excerpt: String
    public var likes: Int
    public var link: String?
    public var isActive: Bool
    public var createdAt: String

    public init(
        id: Int,
        fulfillmentID: String? = nil,
        sourceType: String = "seed",
        type: String,
        tag: String,
        tagColor: String,
        tagBackground: String,
        title: String,
        meta: String,
        location: String,
        excerpt: String,
        likes: Int,
        link: String? = nil,
        isActive: Bool = true,
        createdAt: String
    ) {
        self.id = id
        self.fulfillmentID = fulfillmentID
        self.sourceType = sourceType
        self.type = type
        self.tag = tag
        self.tagColor = tagColor
        self.tagBackground = tagBackground
        self.title = title
        self.meta = meta
        self.location = location
        self.excerpt = excerpt
        self.likes = likes
        self.link = link
        self.isActive = isActive
        self.createdAt = createdAt
    }
}

public struct FeedComment: Identifiable, Equatable, Sendable {
    public var id: String
    public var bottleID: Int
    public var anonymousUserID: String?
    public var authorName: String
    public var content: String
    public var createdAt: String

    public init(
        id: String,
        bottleID: Int,
        anonymousUserID: String? = nil,
        authorName: String,
        content: String,
        createdAt: String
    ) {
        self.id = id
        self.bottleID = bottleID
        self.anonymousUserID = anonymousUserID
        self.authorName = authorName
        self.content = content
        self.createdAt = createdAt
    }
}

public struct ValidationRound: Identifiable, Equatable, Sendable {
    public var id: String
    public var roundNumber: Int
    public var summary: String
    public var humanCheckPassed: Bool?
    public var createdAt: String

    public init(
        id: String,
        roundNumber: Int,
        summary: String,
        humanCheckPassed: Bool?,
        createdAt: String
    ) {
        self.id = id
        self.roundNumber = roundNumber
        self.summary = summary
        self.humanCheckPassed = humanCheckPassed
        self.createdAt = createdAt
    }
}

public struct WishDraft: Equatable, Sendable {
    public var title: String?
    public var intent: String
    public var city: String?
    public var budget: String?
    public var timeWindow: String?
    public var rawInput: String?

    public init(
        title: String? = nil,
        intent: String,
        city: String? = nil,
        budget: String? = nil,
        timeWindow: String? = nil,
        rawInput: String? = nil
    ) {
        self.title = title
        self.intent = intent
        self.city = city
        self.budget = budget
        self.timeWindow = timeWindow
        self.rawInput = rawInput
    }
}
