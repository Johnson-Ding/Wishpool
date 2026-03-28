// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "WishpoolIOS",
    platforms: [
        .iOS(.v17),
        .macOS(.v14),
    ],
    products: [
        .library(
            name: "WishpoolCore",
            targets: ["WishpoolCore"]
        ),
        .executable(
            name: "WishpoolCoreVerification",
            targets: ["WishpoolCoreVerification"]
        ),
    ],
    targets: [
        .target(
            name: "WishpoolCore",
            path: "Sources/WishpoolCore"
        ),
        .executableTarget(
            name: "WishpoolApp",
            dependencies: ["WishpoolCore"],
            path: "Sources/WishpoolApp"
        ),
        .executableTarget(
            name: "WishpoolCoreVerification",
            dependencies: ["WishpoolCore"],
            path: "Verification"
        ),
    ]
)
