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
        .library(
            name: "WishpoolApp",
            targets: ["WishpoolApp"]
        ),
        .executable(
            name: "WishpoolCoreVerification",
            targets: ["WishpoolCoreVerification"]
        ),
    ],
    dependencies: [
        // 如果需要可以添加外部依赖
    ],
    targets: [
        // 暂时禁用框架依赖，先搭建Swift架构
        // .binaryTarget(
        //     name: "SherpaONNX",
        //     path: "Frameworks/build-ios-no-tts/sherpa-onnx.xcframework"
        // ),
        // .binaryTarget(
        //     name: "ONNXRuntime",
        //     path: "Frameworks/build-ios-no-tts/ios-onnxruntime/1.17.1/onnxruntime.xcframework"
        // ),
        .target(
            name: "WishpoolCore",
            // dependencies: ["SherpaONNX", "ONNXRuntime"],
            path: "Sources/WishpoolCore"
        ),
        .target(
            name: "WishpoolApp",
            dependencies: ["WishpoolCore"],
            path: "Sources/WishpoolApp",
            exclude: ["Info.plist"],
            resources: [
                .process("Resources")
            ]
        ),
        .executableTarget(
            name: "WishpoolCoreVerification",
            dependencies: ["WishpoolCore"],
            path: "Verification"
        ),
        .testTarget(
            name: "WishpoolAppTests",
            dependencies: ["WishpoolApp"],
            path: "Tests/WishpoolAppTests"
        ),
        .testTarget(
            name: "WishpoolCoreTests",
            dependencies: ["WishpoolCore"],
            path: "Tests/WishpoolCoreTests"
        ),
    ]
)
