/**
 * Computer Use POC 基础测试
 */

import { ComputerUseExecutor } from '../executor/computer-use.js'

async function testBasicExecution() {
  console.log('🧪 开始 Computer Use 基础功能测试\n')

  const executor = new ComputerUseExecutor({
    apiKey: process.env.KIMI_CODE_API_KEY || 'test-key',
    baseURL: 'https://api.kimi.com/coding',
  })

  // 模拟一个简单的搜索任务
  const testTask = {
    title: '百度搜索测试',
    instruction: '打开百度网站，搜索"Wishpool 许愿池"，查看搜索结果',
    targetWebsite: 'www.baidu.com',
    budgetLimit: 0
  }

  try {
    console.log('📋 测试任务:', testTask.title)
    console.log('🎯 指令:', testTask.instruction)
    console.log('🌐 目标:', testTask.targetWebsite)
    console.log('')

    // 由于没有真实的 API Key，这里会模拟执行流程
    console.log('⚠️  注意: 这是模拟测试（无真实 API 调用）')

    const result = await simulateExecution(testTask)

    console.log('\n📊 测试结果:')
    console.log(`✅ 执行状态: ${result.success ? '成功' : '失败'}`)
    console.log(`📝 步骤数量: ${result.steps?.length || 0}`)
    console.log(`💬 结果信息: ${result.message}`)

    if (result.steps) {
      console.log('\n📋 执行步骤详情:')
      result.steps.forEach((step, i) => {
        console.log(`  ${i + 1}. ${step.action} - ${step.message}`)
      })
    }

    return result

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    return { success: false, error: error.message }
  }
}

// 模拟执行过程（用于测试）
async function simulateExecution(task) {
  const steps = [
    { action: 'screenshot', message: '获取初始屏幕截图' },
    { action: 'navigate', message: `导航到 ${task.targetWebsite}` },
    { action: 'screenshot', message: '确认页面加载完成' },
    { action: 'click', message: '点击搜索框' },
    { action: 'type', message: '输入搜索关键词' },
    { action: 'key', message: '按下回车键搜索' },
    { action: 'screenshot', message: '确认搜索结果显示' }
  ]

  // 模拟异步执行
  for (let i = 0; i < steps.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`🔄 步骤 ${i + 1}/${steps.length}: ${steps[i].message}`)
  }

  return {
    success: true,
    steps,
    message: '模拟执行完成 - 搜索结果已获取',
    finalScreenshot: 'mock-screenshot.png'
  }
}

async function testAPIServer() {
  console.log('\n🌐 测试 HTTP API 服务器')

  const baseURL = 'http://localhost:3200'

  try {
    // 测试状态端点
    console.log('📡 测试 /status 端点...')
    const response = await fetch(`${baseURL}/status`)

    if (response.ok) {
      const data = await response.json()
      console.log('✅ 服务器状态:', data.success ? '正常' : '异常')
      console.log(`🔧 环境: ${data.environment?.computerUseAPI || '未知'}`)
      console.log(`🔑 API Key: ${data.environment?.hasAPIKey ? '已配置' : '未配置'}`)
    } else {
      console.log('❌ 服务器无响应 (可能未启动)')
      console.log('💡 提示: 运行 `node server.js` 启动服务器')
    }

  } catch (error) {
    console.log('❌ 无法连接到服务器 (可能未启动)')
    console.log('💡 提示: 运行 `node server.js` 启动服务器')
  }
}

// 主测试流程
async function runTests() {
  console.log('🚀 Wishpool Computer Use POC 测试套件\n')

  // 基础执行测试
  await testBasicExecution()

  // API 服务器测试
  await testAPIServer()

  console.log('\n🏁 测试完成')
  console.log('\n📖 下一步:')
  console.log('   1. 启动服务器: node server.js')
  console.log('   2. 配置真实API密钥: export KIMI_CODE_API_KEY=your-key')
  console.log('   3. 集成到 Wishpool AI Agent 系统')
}

runTests().catch(console.error)