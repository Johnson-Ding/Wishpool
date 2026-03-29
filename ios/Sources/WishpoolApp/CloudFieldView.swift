import SwiftUI

/// 云朵背景动画组件，为 Cloud 主题提供柔和的漂浮云朵效果
struct CloudFieldView: View {
    let cloudColor: Color

    init(cloudColor: Color = Color(red: 1.0, green: 0.961, blue: 0.941)) { // #FFF5F0
        self.cloudColor = cloudColor
    }

    var body: some View {
        Canvas { context, size in
            // 预生成云朵数据
            let clouds = generateClouds()
            let timeOffset = Date().timeIntervalSince1970

            for (_, cloud) in clouds.enumerated() {
                // 计算漂浮偏移（模拟 Android 的 infiniteRepeatable 动画）
                let animationCycle = cloud.driftSpeed // 25-45秒周期
                let phase = (timeOffset + cloud.driftDelay) / animationCycle
                let offsetFactor = sin(phase * 2 * .pi) * 0.1 // ±10% 横向漂移

                let centerX = CGFloat(cloud.x) * size.width + offsetFactor * size.width * 0.5
                let centerY = CGFloat(cloud.y) * size.height

                // 绘制柔和的云朵光晕（外层）
                let glowGradient = Gradient(colors: [
                    cloudColor.opacity(0.15),
                    cloudColor.opacity(0.05),
                    Color.clear
                ])
                context.fill(
                    Circle().path(in: CGRect(
                        x: centerX - CGFloat(cloud.size) * 1.5,
                        y: centerY - CGFloat(cloud.size) * 1.5,
                        width: CGFloat(cloud.size) * 3,
                        height: CGFloat(cloud.size) * 3
                    )),
                    with: .radialGradient(
                        glowGradient,
                        center: CGPoint(x: 0.5, y: 0.5),
                        startRadius: 0,
                        endRadius: CGFloat(cloud.size) * 1.5
                    )
                )

                // 绘制云朵主体（内层）
                context.fill(
                    Circle().path(in: CGRect(
                        x: centerX - CGFloat(cloud.size),
                        y: centerY - CGFloat(cloud.size),
                        width: CGFloat(cloud.size) * 2,
                        height: CGFloat(cloud.size) * 2
                    )),
                    with: .color(cloudColor.opacity(0.08))
                )
            }
        }
    }

    /// 生成云朵数据（固定种子确保一致性）
    private func generateClouds() -> [CloudData] {
        var rng = SeededRandomGenerator(seed: 123)
        return (0..<5).map { _ in
            CloudData(
                x: rng.nextFloat(in: 0.1...0.9),
                y: rng.nextFloat(in: 0.2...0.8),
                size: rng.nextFloat(in: 60...140),
                driftSpeed: rng.nextDouble(in: 25...45), // 25-45秒漂浮周期
                driftDelay: rng.nextDouble(in: 0...5)    // 0-5秒延迟错开
            )
        }
    }
}

/// 云朵数据结构
private struct CloudData {
    let x: Float        // 横向位置比例 (0-1)
    let y: Float        // 纵向位置比例 (0-1)
    let size: Float     // 云朵半径
    let driftSpeed: Double  // 漂浮周期（秒）
    let driftDelay: Double  // 动画延迟（秒）
}

/// 可控制种子的随机数生成器
private struct SeededRandomGenerator {
    private var state: UInt64

    init(seed: Int) {
        state = UInt64(seed)
    }

    mutating func nextFloat(in range: ClosedRange<Float>) -> Float {
        let randomValue = nextUInt64()
        let normalized = Float(randomValue) / Float(UInt64.max)
        return range.lowerBound + normalized * (range.upperBound - range.lowerBound)
    }

    mutating func nextDouble(in range: ClosedRange<Double>) -> Double {
        let randomValue = nextUInt64()
        let normalized = Double(randomValue) / Double(UInt64.max)
        return range.lowerBound + normalized * (range.upperBound - range.lowerBound)
    }

    private mutating func nextUInt64() -> UInt64 {
        // 简单的线性同余生成器
        state = state &* 1103515245 &+ 12345
        return state
    }
}

/// 预览
struct CloudFieldView_Previews: PreviewProvider {
    static var previews: some View {
        ZStack {
            Color.black
            CloudFieldView()
        }
        .ignoresSafeArea()
    }
}