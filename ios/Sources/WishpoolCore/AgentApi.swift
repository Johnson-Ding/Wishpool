import Foundation

/// AI Server 调用接口 — 对标 Android 端 AgentApi.kt
/// 调用 AI Server，失败时降级到本地模板
public actor AgentApi {
    private let aiServerUrl: String

    public init(aiServerUrl: String = "http://localhost:3100") {
        self.aiServerUrl = aiServerUrl
    }

    /// 调用 AI Server 生成方案
    public func generatePlan(wishInput: String) async -> AiPlanResult {
        do {
            guard let url = URL(string: "\(aiServerUrl)/plan") else {
                return .success(plan: generateLocalTemplate(wishInput: wishInput), provider: "local-fallback")
            }

            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.timeoutInterval = 15

            let body: [String: Any] = ["wishInput": wishInput]
            request.httpBody = try JSONSerialization.data(withJSONObject: body)

            let (data, _) = try await URLSession.shared.data(for: request)
            let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] ?? [:]

            if json["success"] as? Bool == true, let planJson = json["plan"] as? [String: Any] {
                let plan = parsePlan(planJson, fallbackWishText: wishInput)
                let provider = json["provider"] as? String ?? "ai-server"
                return .success(plan: plan, provider: provider)
            } else {
                return .success(plan: generateLocalTemplate(wishInput: wishInput), provider: "local-fallback")
            }
        } catch {
            return .success(plan: generateLocalTemplate(wishInput: wishInput), provider: "local-fallback")
        }
    }

    // MARK: - 解析

    private func parsePlan(_ json: [String: Any], fallbackWishText: String) -> GeneratedPlan {
        let optionsArray = json["decisionOptions"] as? [[String: Any]] ?? []
        let options = optionsArray.map { opt in
            DecisionOption(
                key: opt["key"] as? String ?? "",
                label: opt["label"] as? String ?? ""
            )
        }

        let stepsArray = json["planSteps"] as? [[String: Any]] ?? []
        let steps = stepsArray.map { s in
            AiPlanStep(
                num: s["num"] as? String ?? "①",
                title: s["title"] as? String ?? "",
                type: s["type"] as? String ?? "",
                typeColor: s["typeColor"] as? String ?? "#4AADA0",
                desc: s["desc"] as? String ?? ""
            )
        }

        return GeneratedPlan(
            wishText: json["wishText"] as? String ?? fallbackWishText,
            durationText: json["durationText"] as? String ?? "预计 5 天完成",
            decisionTitle: json["decisionTitle"] as? String ?? "",
            decisionOptions: options,
            planSteps: steps,
            category: json["category"] as? String ?? "生活体验",
            difficulty: json["difficulty"] as? String ?? "medium",
            estimatedDays: json["estimatedDays"] as? Int ?? 5
        )
    }
}

public enum AiPlanResult: Sendable {
    case success(plan: GeneratedPlan, provider: String)
    case error(message: String)
}

// MARK: - 本地模板降级方案

public func generateLocalTemplate(wishInput: String) -> GeneratedPlan {
    let input = wishInput.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

    if input.containsAny("海边", "海滩", "放松", "旅行", "度假") {
        return GeneratedPlan(
            wishText: wishInput.trimmingCharacters(in: .whitespacesAndNewlines),
            durationText: "预计 3-5 天完成",
            decisionTitle: "AI 需要你决定：这次海边之行你更想要什么体验？",
            decisionOptions: [
                DecisionOption(key: "relax", label: "纯放松休闲"),
                DecisionOption(key: "activity", label: "海上活动体验"),
                DecisionOption(key: "photo", label: "拍照打卡风景"),
            ],
            planSteps: [
                AiPlanStep(num: "①", title: "筛选适合的海边目的地和住宿", type: "线上直出", typeColor: "#4AADA0", desc: "AI 自动搜索推荐"),
                AiPlanStep(num: "②", title: "预订交通和酒店，准备物品清单", type: "资源助力", typeColor: "#F5C842", desc: "平台资源助力"),
                AiPlanStep(num: "③", title: "找同行伙伴或当地向导推荐", type: "人群助力", typeColor: "#C084FC", desc: "AI匹配志同道合的旅友"),
                AiPlanStep(num: "④", title: "开始海边放松之旅", type: "需你到场", typeColor: "#F97316", desc: "你本人享受旅程"),
            ],
            category: "生活体验",
            difficulty: "easy",
            estimatedDays: 4
        )
    }

    if input.containsAny("学习", "技能", "考试", "读书") {
        return GeneratedPlan(
            wishText: wishInput.trimmingCharacters(in: .whitespacesAndNewlines),
            durationText: "预计 10-14 天完成",
            decisionTitle: "AI 需要你决定：你更偏好哪种学习模式？",
            decisionOptions: [
                DecisionOption(key: "self", label: "自主学习"),
                DecisionOption(key: "course", label: "系统课程"),
                DecisionOption(key: "mentor", label: "导师指导"),
            ],
            planSteps: [
                AiPlanStep(num: "①", title: "制定学习计划和时间安排", type: "线上直出", typeColor: "#4AADA0", desc: "AI 自动规划"),
                AiPlanStep(num: "②", title: "整理学习资源和材料", type: "资源助力", typeColor: "#F5C842", desc: "平台资源助力"),
                AiPlanStep(num: "③", title: "寻找学习伙伴或导师", type: "人群助力", typeColor: "#C084FC", desc: "AI匹配学习搭子"),
                AiPlanStep(num: "④", title: "开始系统化学习", type: "需你到场", typeColor: "#F97316", desc: "你本人投入学习"),
            ],
            category: "学习成长",
            difficulty: "medium",
            estimatedDays: 12
        )
    }

    if input.containsAny("运动", "跑步", "健身", "锻炼", "夜跑") {
        return GeneratedPlan(
            wishText: wishInput.trimmingCharacters(in: .whitespacesAndNewlines),
            durationText: "预计 7 天完成",
            decisionTitle: "AI 需要你决定：你更喜欢哪种运动节奏？",
            decisionOptions: [
                DecisionOption(key: "light", label: "轻松入门"),
                DecisionOption(key: "regular", label: "规律训练"),
                DecisionOption(key: "intense", label: "高强度挑战"),
            ],
            planSteps: [
                AiPlanStep(num: "①", title: "制定适合的运动计划", type: "线上直出", typeColor: "#4AADA0", desc: "AI 个性化规划"),
                AiPlanStep(num: "②", title: "准备运动装备和场地", type: "资源助力", typeColor: "#F5C842", desc: "平台资源助力"),
                AiPlanStep(num: "③", title: "寻找运动伙伴或教练", type: "人群助力", typeColor: "#C084FC", desc: "AI匹配运动搭子"),
                AiPlanStep(num: "④", title: "开始规律运动", type: "需你到场", typeColor: "#F97316", desc: "你本人坚持锻炼"),
            ],
            category: "运动健康",
            difficulty: "easy",
            estimatedDays: 7
        )
    }

    if input.containsAny("滑雪", "雪场", "单板", "双板") {
        return GeneratedPlan(
            wishText: wishInput.trimmingCharacters(in: .whitespacesAndNewlines),
            durationText: "预计 5 天完成",
            decisionTitle: "AI 需要你决定：你更偏好哪种滑雪体验？",
            decisionOptions: [
                DecisionOption(key: "beginner", label: "新手入门"),
                DecisionOption(key: "intermediate", label: "进阶挑战"),
                DecisionOption(key: "group", label: "组队同行"),
            ],
            planSteps: [
                AiPlanStep(num: "①", title: "筛选雪场 + 锁定新手友好线路", type: "线上直出", typeColor: "#4AADA0", desc: "AI 自动完成"),
                AiPlanStep(num: "②", title: "整理拼车时间 + 雪具租赁建议", type: "资源助力", typeColor: "#F5C842", desc: "平台资源助力"),
                AiPlanStep(num: "③", title: "匹配有车且节奏合适的滑雪搭子", type: "人群助力", typeColor: "#C084FC", desc: "AI发邀约·按滑雪画像"),
                AiPlanStep(num: "④", title: "按约定出发滑雪 + 回填体验反馈", type: "需你到场", typeColor: "#F97316", desc: "你本人参与"),
            ],
            category: "生活体验",
            difficulty: "medium",
            estimatedDays: 5
        )
    }

    // 通用模板
    return GeneratedPlan(
        wishText: wishInput.trimmingCharacters(in: .whitespacesAndNewlines),
        durationText: "预计 5 天完成",
        decisionTitle: "AI 需要你决定：你更偏好哪种执行方式？",
        decisionOptions: [
            DecisionOption(key: "solo", label: "独自完成"),
            DecisionOption(key: "partner", label: "寻找搭子"),
            DecisionOption(key: "community", label: "社区协助"),
        ],
        planSteps: [
            AiPlanStep(num: "①", title: "分析需求并制定计划", type: "线上直出", typeColor: "#4AADA0", desc: "AI 智能分析"),
            AiPlanStep(num: "②", title: "准备必要的资源和信息", type: "资源助力", typeColor: "#F5C842", desc: "平台资源助力"),
            AiPlanStep(num: "③", title: "寻找合适的协助伙伴", type: "人群助力", typeColor: "#C084FC", desc: "AI匹配合适搭子"),
            AiPlanStep(num: "④", title: "开始执行你的心愿", type: "需你到场", typeColor: "#F97316", desc: "你本人参与"),
        ],
        category: "生活体验",
        difficulty: "medium",
        estimatedDays: 5
    )
}

private extension String {
    func containsAny(_ keywords: String...) -> Bool {
        keywords.contains { self.contains($0) }
    }
}
