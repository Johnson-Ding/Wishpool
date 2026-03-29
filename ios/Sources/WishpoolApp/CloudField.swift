import SwiftUI

/// 漂浮云朵背景动画（朵朵云主题）
/// 模拟 Web Demo 的 CloudField 效果
struct CloudField: View {
    @Environment(\.themedPalette) private var palette

    var body: some View {
        GeometryReader { geo in
            ZStack {
                // 云朵1 - 左上，粉色
                FloatingCloud(
                    x: geo.size.width * 0.15,
                    y: geo.size.height * 0.12,
                    width: 120,
                    height: 60,
                    opacity: 0.15,
                    duration: 8,
                    delay: 0,
                    color: palette.primary
                )

                // 云朵2 - 右上，蓝色
                FloatingCloud(
                    x: geo.size.width * 0.65,
                    y: geo.size.height * 0.25,
                    width: 100,
                    height: 50,
                    opacity: 0.1,
                    duration: 10,
                    delay: 1.5,
                    color: palette.accent
                )

                // 云朵3 - 中间，粉色
                FloatingCloud(
                    x: geo.size.width * 0.35,
                    y: geo.size.height * 0.45,
                    width: 140,
                    height: 65,
                    opacity: 0.12,
                    duration: 12,
                    delay: 3,
                    color: palette.primary
                )

                // 云朵4 - 右下，蓝色
                FloatingCloud(
                    x: geo.size.width * 0.80,
                    y: geo.size.height * 0.55,
                    width: 90,
                    height: 45,
                    opacity: 0.08,
                    duration: 9,
                    delay: 4.5,
                    color: palette.accent
                )
            }
            .frame(width: geo.size.width, height: geo.size.height)
        }
        .allowsHitTesting(false)
    }
}

/// 单个漂浮云朵
private struct FloatingCloud: View {
    let x: CGFloat
    let y: CGFloat
    let width: CGFloat
    let height: CGFloat
    let opacity: CGFloat
    let duration: Double
    let delay: Double
    let color: Color

    @State private var offset: CGFloat = 0

    var body: some View {
        CloudShape()
            .fill(color.opacity(opacity))
            .frame(width: width, height: height)
            .position(x: x, y: y)
            .offset(y: offset)
            .blur(radius: 30)
            .onAppear {
                withAnimation(
                    .easeInOut(duration: duration)
                    .repeatForever(autoreverses: true)
                    .delay(delay)
                ) {
                    offset = -20
                }
            }
    }
}

/// 云朵形状
private struct CloudShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()

        let w = rect.width
        let h = rect.height

        // 绘制云朵轮廓 - 使用多个圆形组合
        path.addEllipse(in: CGRect(x: w * 0.1, y: h * 0.3, width: w * 0.5, height: h * 0.6))
        path.addEllipse(in: CGRect(x: w * 0.35, y: h * 0.1, width: w * 0.4, height: h * 0.7))
        path.addEllipse(in: CGRect(x: w * 0.55, y: h * 0.25, width: w * 0.35, height: h * 0.55))

        return path
    }
}

// MARK: - Preview
#if DEBUG
struct CloudField_Previews: PreviewProvider {
    static var previews: some View {
        ZStack {
            Color(red: 240/255, green: 249/255, blue: 255/255)
                .ignoresSafeArea()

            CloudField()
        }
    }
}
#endif
