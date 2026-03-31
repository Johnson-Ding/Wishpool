import CoreGraphics
import Testing
@testable import WishpoolApp

@Test("开屏背景 frame 必须和容器尺寸一致")
func splashBackgroundFrameMatchesContainerSize() {
    let portrait = CGSize(width: 393, height: 852)
    let landscape = CGSize(width: 852, height: 393)

    #expect(SplashBackgroundLayout.containerFrame(for: portrait) == CGRect(origin: .zero, size: portrait))
    #expect(SplashBackgroundLayout.containerFrame(for: landscape) == CGRect(origin: .zero, size: landscape))
}
