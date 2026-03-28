import Foundation

public struct WishSection: Equatable, Sendable {
    public var title: String
    public var items: [WishTask]

    public init(title: String, items: [WishTask]) {
        self.title = title
        self.items = items
    }
}

public enum WishSectionBuilder {
    public static func build(from wishes: [WishTask]) -> [WishSection] {
        let pendingStatuses: Set<WishExecutionStatus> = [.clarifying, .planning, .validating, .locking, .ready]
        let completedStatuses: Set<WishExecutionStatus> = [.completed, .failed, .cancelled]

        let pending = wishes.filter { pendingStatuses.contains($0.status) }
        let active = wishes.filter { $0.status == .inProgress }
        let completed = wishes.filter { completedStatuses.contains($0.status) }

        var sections: [WishSection] = []
        if !pending.isEmpty {
            sections.append(WishSection(title: "待决策", items: pending))
        }
        if !active.isEmpty {
            sections.append(WishSection(title: "进行中", items: active))
        }
        if !completed.isEmpty {
            sections.append(WishSection(title: "已完成", items: completed))
        }

        return sections
    }
}
