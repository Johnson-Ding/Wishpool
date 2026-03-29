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
    case createWishDirect
    case comments(Int)
    case wishDetail(String)
    case aiPlan(wishInput: String)

    var id: String {
        switch self {
        case .createWish:
            return "createWish"
        case .createWishDirect:
            return "createWishDirect"
        case let .comments(id):
            return "comments-\(id)"
        case let .wishDetail(id):
            return "wish-\(id)"
        case let .aiPlan(input):
            return "aiPlan-\(input.hashValue)"
        }
    }
}
