import Foundation

public struct WishTaskDTO: Codable, Sendable {
    public var id: String
    public var anonymousUserID: String?
    public var title: String
    public var intent: String
    public var status: String
    public var city: String?
    public var budget: String?
    public var timeWindow: String?
    public var rawInput: String?
    public var aiPlan: AIPlan
    public var confirmedAt: String?
    public var createdAt: String
    public var updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case anonymousUserID = "anonymous_user_id"
        case title
        case intent
        case status
        case city
        case budget
        case timeWindow = "time_window"
        case rawInput = "raw_input"
        case aiPlan = "ai_plan"
        case confirmedAt = "confirmed_at"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    public func toDomain() -> WishTask {
        WishTask(
            id: id,
            anonymousUserID: anonymousUserID,
            title: title,
            intent: intent,
            status: .from(raw: status),
            city: city,
            budget: budget,
            timeWindow: timeWindow,
            rawInput: rawInput,
            aiPlan: aiPlan,
            confirmedAt: confirmedAt,
            createdAt: createdAt,
            updatedAt: updatedAt
        )
    }
}

public struct FeedItemDTO: Codable, Sendable {
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

    enum CodingKeys: String, CodingKey {
        case id
        case fulfillmentID = "fulfillment_id"
        case sourceType = "source_type"
        case type
        case tag
        case tagColor = "tag_color"
        case tagBackground = "tag_bg"
        case title
        case meta
        case location = "loc"
        case excerpt
        case likes
        case link
        case isActive = "is_active"
        case createdAt = "created_at"
    }

    public func toDomain() -> FeedItem {
        FeedItem(
            id: id,
            fulfillmentID: fulfillmentID,
            sourceType: sourceType,
            type: type,
            tag: tag,
            tagColor: tagColor,
            tagBackground: tagBackground,
            title: title,
            meta: meta,
            location: location,
            excerpt: excerpt,
            likes: likes,
            link: link,
            isActive: isActive,
            createdAt: createdAt
        )
    }
}

public struct FeedCommentDTO: Codable, Sendable {
    public var id: String
    public var bottleID: Int
    public var anonymousUserID: String?
    public var authorName: String
    public var content: String
    public var createdAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case bottleID = "drift_bottle_id"
        case anonymousUserID = "anonymous_user_id"
        case authorName = "author_name"
        case content
        case createdAt = "created_at"
    }

    public func toDomain() -> FeedComment {
        FeedComment(
            id: id,
            bottleID: bottleID,
            anonymousUserID: anonymousUserID,
            authorName: authorName,
            content: content,
            createdAt: createdAt
        )
    }
}

public struct ValidationRoundDTO: Codable, Sendable {
    public var id: String
    public var roundNumber: Int
    public var summary: String
    public var humanCheckPassed: Bool?
    public var createdAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case roundNumber = "round_number"
        case summary
        case humanCheckPassed = "human_check_passed"
        case createdAt = "created_at"
    }

    public func toDomain() -> ValidationRound {
        ValidationRound(
            id: id,
            roundNumber: roundNumber,
            summary: summary,
            humanCheckPassed: humanCheckPassed,
            createdAt: createdAt
        )
    }
}
