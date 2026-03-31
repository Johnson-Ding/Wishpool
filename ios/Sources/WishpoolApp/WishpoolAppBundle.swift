import Foundation

enum WishpoolAppBundle {
    static let bundle: Bundle = {
        #if SWIFT_PACKAGE
        Bundle.module
        #else
        Bundle.main
        #endif
    }()

    static func hasImageResource(named name: String) -> Bool {
        ["png", "jpg", "jpeg"].contains { ext in
            bundle.path(forResource: name, ofType: ext) != nil
        }
    }
}
