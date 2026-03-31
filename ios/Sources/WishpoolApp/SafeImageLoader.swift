import SwiftUI

/// 安全的图片加载器 - 防止资源缺失导致崩溃
struct SafeImage: View {
    let imageName: String
    let fallbackSystemImage: String

    init(_ imageName: String, fallback: String = "photo") {
        self.imageName = imageName
        self.fallbackSystemImage = fallback
    }

    var body: some View {
        Group {
            if WishpoolAppBundle.hasImageResource(named: imageName) {
                Image(imageName, bundle: WishpoolAppBundle.bundle)
                    .resizable()
            } else {
                Image(systemName: fallbackSystemImage)
                    .resizable()
                    .foregroundColor(.secondary)
                    .opacity(0.5)
            }
        }
    }
}

#if DEBUG
extension SafeImage {
    /// 调试信息：检查图片资源是否存在
    static func checkImageResource(_ imageName: String) -> Bool {
        if WishpoolAppBundle.hasImageResource(named: imageName) {
            print("✅ 图片资源存在: \(imageName)")
            return true
        }

        print("❌ 图片资源缺失: \(imageName)")
        return false
    }
}
#endif
