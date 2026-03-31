import Observation
import Testing
@testable import WishpoolApp

private final class ObservationCounter: @unchecked Sendable {
    var value = 0
}

@MainActor
@Test("启动状态变化应能触发 SwiftUI Observation")
func launchManagerStateChangeIsObservable() {
    let manager = LaunchManager()
    let counter = ObservationCounter()

    withObservationTracking {
        _ = manager.shouldShowSplash
    } onChange: {
        counter.value += 1
    }

    manager.completeSplash()

    #expect(counter.value == 1)
    #expect(manager.shouldShowSplash == false)
}
