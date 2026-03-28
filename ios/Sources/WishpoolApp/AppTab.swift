import SwiftUI

enum AppTab: String {
    case feed
    case wishes

    var title: String {
        switch self {
        case .feed:
            return "广场"
        case .wishes:
            return "我的"
        }
    }

    var systemImage: String {
        switch self {
        case .feed:
            return "sparkles.square.filled.on.square"
        case .wishes:
            return "list.bullet.rectangle.portrait"
        }
    }
}

enum AppSheet: Identifiable {
    case createWish
    case comments(Int)
    case wishDetail(String)

    var id: String {
        switch self {
        case .createWish:
            return "createWish"
        case let .comments(id):
            return "comments-\(id)"
        case let .wishDetail(id):
            return "wish-\(id)"
        }
    }
}
