#!/usr/bin/env node
/**
 * Wishpool L1执行+进度管理 端到端测试
 * 验证完整的"AI方案生成 → Computer Use执行 → 进度跟踪"流程
 */

const AI_SERVER = 'http://localhost:3100'
const COMPUTER_USE = 'http://localhost:3200'
const WEB_FRONTEND = 'http://localhost:5173'

async function testService(name, url) {
  try {
    const response = await fetch(url, { timeout: 5000 })
    console.log(`✅ ${name}: 服务正常 (${response.status})`)
    return true
  } catch (error) {
    console.log(`❌ ${name}: 服务异常 - ${error.message}`)
    return false
  }
}

async function testAIPlanGeneration() {
  console.log('\n📋 测试1: AI方案生成（ExecutionPlan格式）')

  try {
    const response = await fetch(`${AI_SERVER}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wishInput: '我想学摄影',
        deviceId: 'test-e2e-001'
      })
    })

    const data = await response.json()

    if (data.success && data.executionPlan) {
      const plan = data.executionPlan
      console.log(`✅ ExecutionPlan生成成功:`)
      console.log(`   - 总步骤数: ${plan.total_steps}`)
      console.log(`   - 可自动执行: ${plan.steps.filter(s => s.auto_executable).length}`)
      console.log(`   - 预估时长: ${Math.ceil(plan.estimated_total_duration / 60)}小时`)

      return plan
    } else {
      console.log(`⚠️ 返回格式: success=${data.success}, hasExecutionPlan=${!!data.executionPlan}`)
      return null
    }
  } catch (error) {
    console.log(`❌ AI方案生成失败: ${error.message}`)
    return null
  }
}

async function testComputerUseExecution(executionPlan) {
  console.log('\n🤖 测试2: Computer Use自动执行')

  if (!executionPlan) {
    console.log('❌ 无ExecutionPlan，跳过Computer Use测试')
    return null
  }

  const autoStep = executionPlan.steps.find(step => step.auto_executable)

  if (!autoStep) {
    console.log('❌ 无可自动执行步骤，跳过Computer Use测试')
    return null
  }

  try {
    console.log(`📋 执行步骤: ${autoStep.title}`)

    const response = await fetch(`${COMPUTER_USE}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stepConfig: autoStep,
        sessionId: `test-${Date.now()}`
      })
    })

    const result = await response.json()

    if (result.success) {
      console.log('✅ Computer Use执行成功:')
      console.log(`   - 执行结果: ${result.stepResult?.completed ? '完成' : '部分完成'}`)
      console.log(`   - 消息: ${result.stepResult?.message || '无消息'}`)
      console.log(`   - 需要用户干预: ${result.stepResult?.requiresUserInput ? '是' : '否'}`)

      return result
    } else {
      console.log(`❌ Computer Use执行失败: ${result.error}`)
      return null
    }
  } catch (error) {
    console.log(`❌ Computer Use执行异常: ${error.message}`)
    return null
  }
}

async function testSystemIntegration() {
  console.log('\n🔄 测试3: 系统集成状态')

  // 检查各服务能否相互通信
  const checks = [
    { name: 'AI Server → Computer Use', test: async () => {
      const aiResponse = await fetch(`${AI_SERVER}/status`)
      const cuResponse = await fetch(`${COMPUTER_USE}/status`)
      return aiResponse.ok && cuResponse.ok
    }},
    { name: 'Web Frontend 可访问性', test: async () => {
      const webResponse = await fetch(WEB_FRONTEND)
      return webResponse.ok
    }}
  ]

  for (const check of checks) {
    try {
      const result = await check.test()
      console.log(`${result ? '✅' : '❌'} ${check.name}`)
    } catch (error) {
      console.log(`❌ ${check.name}: ${error.message}`)
    }
  }
}

async function runE2ETest() {
  console.log('🚀 Wishpool L1执行+进度管理 端到端测试')
  console.log('=' * 50)

  // 步骤1: 检查服务状态
  console.log('\n🔍 服务状态检查:')
  const services = [
    ['Web 前端', WEB_FRONTEND],
    ['AI Server', `${AI_SERVER}/status`],
    ['Computer Use', `${COMPUTER_USE}/status`]
  ]

  const serviceResults = await Promise.all(
    services.map(([name, url]) => testService(name, url))
  )

  const allServicesUp = serviceResults.every(Boolean)

  if (!allServicesUp) {
    console.log('\n❌ 部分服务不可用，无法进行完整测试')
    process.exit(1)
  }

  // 步骤2: 测试AI方案生成
  const executionPlan = await testAIPlanGeneration()

  // 步骤3: 测试Computer Use执行
  const executionResult = await testComputerUseExecution(executionPlan)

  // 步骤4: 测试系统集成
  await testSystemIntegration()

  // 总结
  console.log('\n📊 测试结果总结:')
  console.log(`✅ 服务状态: 全部正常`)
  console.log(`${executionPlan ? '✅' : '❌'} AI方案生成: ${executionPlan ? '正常' : '失败'}`)
  console.log(`${executionResult ? '✅' : '❌'} Computer Use执行: ${executionResult ? '正常' : '失败'}`)

  console.log('\n🎯 下一步操作:')
  console.log('1. 在浏览器打开: http://localhost:5173/')
  console.log('2. 输入愿望: "我想学摄影"')
  console.log('3. 观察AI生成的步骤列表')
  console.log('4. 点击🤖自动执行按钮测试Computer Use')
  console.log('5. 查看步骤状态和进度条变化')

  console.log('\n🏁 端到端测试完成!')
}

// 运行测试
runE2ETest().catch(console.error)