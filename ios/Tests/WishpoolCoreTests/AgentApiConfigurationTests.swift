import Testing
@testable import WishpoolCore

@Test("iOS 真机默认不请求 localhost AI Server")
func agentApiSkipsLocalhostOnPhysicalIOSDevice() {
    let url = AgentApiConfiguration.defaultServerURL(
        environment: [:],
        isSimulator: false,
        isIOS: true
    )

    #expect(url == nil)
}

@Test("模拟器默认连接本机 AI Server")
func agentApiUsesLocalhostOnSimulator() {
    let url = AgentApiConfiguration.defaultServerURL(
        environment: [:],
        isSimulator: true,
        isIOS: true
    )

    #expect(url == "http://localhost:3100")
}

@Test("显式配置 AI Server 地址时优先使用配置值")
func agentApiPrefersConfiguredServerURL() {
    let url = AgentApiConfiguration.defaultServerURL(
        environment: ["WISHPOOL_AI_SERVER_URL": "http://192.168.1.8:3100"],
        isSimulator: false,
        isIOS: true
    )

    #expect(url == "http://192.168.1.8:3100")
}
