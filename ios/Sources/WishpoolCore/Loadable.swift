import Foundation

public enum Loadable<Value> {
    case idle
    case loading
    case loaded(Value)
    case failed(String)

    public var value: Value? {
        switch self {
        case let .loaded(value):
            return value
        default:
            return nil
        }
    }
}
