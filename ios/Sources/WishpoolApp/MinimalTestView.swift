import SwiftUI

/// 最小化测试视图 - 完全不依赖 WishpoolCore，用于验证基础运行
public struct MinimalTestView: View {
    public init() {}

    public var body: some View {
        VStack(spacing: 20) {
            Text("🎉 iOS App 运行成功!")
                .font(.title.weight(.bold))
                .foregroundColor(.primary)

            Text("Wishpool iOS 基础运行正常")
                .font(.body)
                .foregroundColor(.secondary)

            Button("测试按钮") {
                print("iOS App 交互正常")
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
        .background(.background)
    }
}