// AI Agent 功能测试脚本
// 在浏览器控制台中运行，验证 Agent API 是否正常工作

import { analyzeWish, generateExecutionPlan, executeStep } from './lib/agent-api'

export async function testAgentSystem() {
  console.log('🧪 开始测试 AI Agent 系统...')

  const testWishes = [
    "我想学吉他",           // growth
    "我想去北京旅行",       // travel
    "我想找一家好的火锅店", // local_life
    "我最近压力很大",       // emotional
    "帮我买一个iPad"        // execution
  ]

  const deviceId = 'test_device_' + Date.now()

  for (const wish of testWishes) {
    console.log(`\n🔍 测试愿望: "${wish}"`)

    try {
      // 测试意图分析
      const analysisResult = await analyzeWish(wish)

      if (analysisResult.success && analysisResult.analysis) {
        console.log('✅ 意图分析成功:', {
          类型: analysisResult.analysis.intentType,
          置信度: analysisResult.analysis.confidence,
          目标: analysisResult.analysis.goal,
          约束: analysisResult.analysis.constraints
        })

        // 测试执行计划生成
        const planResult = await generateExecutionPlan(wish)

        if (planResult.success && planResult.plan) {
          console.log('✅ 执行计划生成成功:', {
            步骤数: planResult.plan.steps.length,
            预估时间: planResult.plan.totalEstimate
          })

          // 测试自动执行（如果有 auto 类型的步骤）
          const autoSteps = planResult.plan.steps.filter(step => step.type === 'auto')
          if (autoSteps.length > 0) {
            console.log(`🤖 尝试执行第一个自动步骤: ${autoSteps[0].title}`)

            const executeResult = await executeStep(0, planResult.plan)
            if (executeResult.success) {
              console.log('✅ 自动执行成功:', executeResult.result)
            } else {
              console.log('❌ 自动执行失败:', executeResult.error)
            }
          }
        } else {
          console.log('❌ 执行计划生成失败:', planResult.error)
        }
      } else {
        console.log('❌ 意图分析失败:', analysisResult.error)
      }
    } catch (error) {
      console.error('💥 测试出错:', error)
    }

    // 添加延迟避免API限制
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n🎉 AI Agent 系统测试完成!')
}

// 单独测试函数
export async function testSingleWish(wish: string) {
  console.log(`🔍 单独测试: "${wish}"`)
  const deviceId = 'test_single_' + Date.now()

  try {
    const result = await analyzeWish(wish)
    console.log('分析结果:', result)
    return result
  } catch (error) {
    console.error('测试失败:', error)
    return null
  }
}

// 使用方法:
// 在浏览器控制台中运行:
// import('./test-agent.js').then(m => m.testAgentSystem())
// 或
// import('./test-agent.js').then(m => m.testSingleWish('我想学编程'))
