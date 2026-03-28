import SwiftUI
import WishpoolCore

@main
struct WishpoolApp: App {
    @State private var model = WishpoolAppModel(repository: WishpoolBootstrap.makeRepository())

    var body: some Scene {
        WindowGroup {
            WishpoolAppRootView(model: model)
                .preferredColorScheme(.dark)
                .task {
                    await model.bootstrap()
                }
        }
    }
}
