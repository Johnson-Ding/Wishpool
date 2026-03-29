import Foundation

/// AI 生成的心愿方案 — 对标 Android 端 GeneratedPlan
public struct GeneratedPlan: Codable, Equatable, Sendable {
    public var wishText: String
    public var durationText: String
    public var decisionTitle: String
    public var decisionOptions: [DecisionOption]
    public var planSteps: [AiPlanStep]
    public var category: String
    public var difficulty: String // "easy" | "medium" | "hard"
    public var estimatedDays: Int

    public init(
        wishText: String,
        durationText: String,
        decisionTitle: String = "",
        decisionOptions: [DecisionOption] = [],
        planSteps: [AiPlanStep],
        category: String,
        difficulty: String = "medium",
        estimatedDays: Int = 5
    ) {
        self.wishText = wishText
        self.durationText = durationText
        self.decisionTitle = decisionTitle
        self.decisionOptions = decisionOptions
        self.planSteps = planSteps
        self.category = category
        self.difficulty = difficulty
        self.estimatedDays = estimatedDays
    }
}

public struct DecisionOption: Codable, Equatable, Sendable {
    public var key: String
    public var label: String

    public init(key: String, label: String) {
        self.key = key
        self.label = label
    }
}

public struct AiPlanStep: Codable, Equatable, Sendable, Identifiable {
    public var id: String { num + title }
    public var num: String
    public var title: String
    public var type: String
    public var typeColor: String
    public var desc: String

    public init(num: String, title: String, type: String, typeColor: String, desc: String) {
        self.num = num
        self.title = title
        self.type = type
        self.typeColor = typeColor
        self.desc = desc
    }
}
