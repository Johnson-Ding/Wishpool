import Foundation
import WishpoolCore

struct WishpoolCoreVerificationRunner {
    static func main() async {
        do {
            try verifyStatusFallback()
            try verifySectionGrouping()
            try verifyDTOMapping()
            print("WishpoolCore verification passed.")
        } catch {
            fputs("WishpoolCore verification failed: \(error)\n", stderr)
            exit(1)
        }
    }

    static func verifyStatusFallback() throws {
        guard WishExecutionStatus.from(raw: "planning") == .planning else {
            throw VerificationError("planning 状态解析失败")
        }
        guard WishExecutionStatus.from(raw: "unknown") == .draft else {
            throw VerificationError("未知状态未回落到 draft")
        }
    }

    static func verifySectionGrouping() throws {
        let wishes = [
            WishTask(id: "1", title: "滑雪", intent: "周末滑雪", status: .planning),
            WishTask(id: "2", title: "看展", intent: "周末看展", status: .inProgress),
            WishTask(id: "3", title: "海边", intent: "海边吹风", status: .completed),
        ]

        let sections = WishSectionBuilder.build(from: wishes)
        let titles = sections.map(\.title)
        guard titles == ["待决策", "进行中", "已完成"] else {
            throw VerificationError("愿望分组结果不正确：\(titles)")
        }
    }

    static func verifyDTOMapping() throws {
        let json = """
        {
          "id": "wish-1",
          "anonymous_user_id": "user-1",
          "title": "周末去滑雪",
          "intent": "想去滑雪",
          "status": "planning",
          "city": "北京",
          "budget": "1500",
          "time_window": "下周末",
          "raw_input": "我想下周末去滑雪",
          "ai_plan": {
            "summary": "先确认雪场和预算"
          },
          "confirmed_at": null,
          "created_at": "2026-03-28T08:00:00.000Z",
          "updated_at": "2026-03-28T08:30:00.000Z"
        }
        """

        let dto = try JSONDecoder().decode(WishTaskDTO.self, from: Data(json.utf8))
        let wish = dto.toDomain()
        guard wish.id == "wish-1" else {
            throw VerificationError("WishTaskDTO.id 映射失败")
        }
        guard wish.aiPlan.summary == "先确认雪场和预算" else {
            throw VerificationError("ai_plan.summary 映射失败")
        }
    }
}

struct VerificationError: Error, CustomStringConvertible {
    let description: String

    init(_ description: String) {
        self.description = description
    }
}

// 程序入口
await WishpoolCoreVerificationRunner.main()
