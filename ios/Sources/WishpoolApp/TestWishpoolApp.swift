import SwiftUI
import WishpoolCore

@main
struct TestWishpoolApp: App {
    var body: some Scene {
        WindowGroup {
            TestRootView()
        }
    }
}

struct TestRootView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text("🌙 Wishpool iOS")
                    .font(.largeTitle)
                    .fontWeight(.bold)

                Text("测试界面 - iOS 版本运行正常")
                    .foregroundColor(.secondary)

                Button("测试按钮") {
                    print("按钮点击正常")
                }
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
            .padding()
            .navigationTitle("Wishpool Test")
        }
    }
}