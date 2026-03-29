import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { openai } from 'https://esm.sh/@ai-sdk/openai@1.0.0'
import { generateText, tool } from 'https://esm.sh/ai@4.0.0'
import { z } from 'https://esm.sh/zod@3.22.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 意图分类类型定义
type IntentType = 'emotional' | 'travel' | 'local_life' | 'growth' | 'execution'

interface WishAnalysis {
  intentType: IntentType
  confidence: number
  executableAutomatically: boolean
  needsFriendHelp: boolean
  needsCommunityHelp: boolean
  structuredWish: {
    goal: string
    constraints: string[]
    preferences: string[]
    timeframe?: string
    budget?: string
  }
  executionPlan?: {
    steps: Array<{
      step: number
      title: string
      type: 'auto' | 'friend' | 'community'
      description: string
      estimatedTime?: string
    }>
    totalEstimate: string
  }
}

// 工具定义
const analyzeWishTool = tool({
  description: 'Analyze user wish and determine execution path',
  parameters: z.object({
    intentType: z.enum(['emotional', 'travel', 'local_life', 'growth', 'execution']).describe('愿望的类型分类'),
    confidence: z.number().min(0).max(1).describe('分类置信度'),
    executableAutomatically: z.boolean().describe('AI 能否自动执行'),
    needsFriendHelp: z.boolean().describe('是否需要朋友帮助'),
    needsCommunityHelp: z.boolean().describe('是否需要发布到社区求助'),
    goal: z.string().describe('用户的核心目标'),
    constraints: z.array(z.string()).describe('约束条件列表'),
    preferences: z.array(z.string()).describe('用户偏好'),
    timeframe: z.string().optional().describe('期望时间'),
    budget: z.string().optional().describe('预算范围'),
  })
})

const generateExecutionPlanTool = tool({
  description: 'Generate detailed execution plan for the wish',
  parameters: z.object({
    steps: z.array(z.object({
      step: z.number(),
      title: z.string(),
      type: z.enum(['auto', 'friend', 'community']),
      description: z.string(),
      estimatedTime: z.string().optional()
    })),
    totalEstimate: z.string().describe('整体预估完成时间')
  })
})

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { wish, action = 'analyze', deviceId } = await req.json()

    // 初始化 Supabase 客户端
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // 初始化 Kimi K2.5 模型 (通过 OpenAI 兼容接口)
    const kimik25 = openai('kimi-k2.5', {
      apiKey: Deno.env.get('MOONSHOT_API_KEY')!,
      baseURL: 'https://api.moonshot.cn/v1'
    })

    switch (action) {
      case 'analyze': {
        // US-20: 智能意图理解与确认
        const analysisResult = await generateText({
          model: kimik25,
          tools: { analyzeWish: analyzeWishTool },
          toolChoice: 'required',
          prompt: `
作为 Wishpool AI 助手，请分析用户的愿望并确定执行路径。

用户愿望: "${wish}"

请按以下标准分析：

1. 意图分类：
   - emotional: 情感倾诉、心理支持、关系困惑
   - travel: 旅行规划、出行安排、订票酒店
   - local_life: 本地活动、餐厅推荐、周末安排
   - growth: 技能学习、职业发展、个人提升
   - execution: 线上事务、购物、查信息、办手续

2. 执行判断：
   - L1 (自动执行): AI可以直接调用API完成 (如订票、查信息、下单)
   - L2 (朋友帮助): 需要亲友协助执行 (如本地帮忙、情感支持)
   - L3 (社区求助): 需要发布到许愿池社区 (脱敏后)

3. 结构化提取：
   - 用户的核心目标是什么？
   - 有哪些约束条件？(时间、预算、地点等)
   - 用户的偏好是什么？

请仔细分析并给出准确的分类和执行建议。
          `.trim(),
          maxTokens: 2000,
        })

        const analysis = analysisResult.toolCalls[0]?.args as WishAnalysis

        // 保存意图分析结果
        await supabase
          .from('wish_agent_states')
          .insert({
            device_id: deviceId,
            wish_text: wish,
            intent_type: analysis.intentType,
            confidence: analysis.confidence,
            analysis_result: analysis,
            created_at: new Date().toISOString()
          })

        return new Response(
          JSON.stringify({
            success: true,
            analysis,
            message: '愿望分析完成'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      case 'plan': {
        // 生成执行计划
        const planResult = await generateText({
          model: kimik25,
          tools: { generatePlan: generateExecutionPlanTool },
          toolChoice: 'required',
          prompt: `
基于之前的愿望分析，为用户生成详细的执行计划。

用户愿望: "${wish}"

请生成具体的执行步骤：
1. 每个步骤要明确是 auto(AI自动)、friend(朋友协助) 还是 community(社区帮助)
2. 给出每步的预估时间
3. 确保步骤逻辑清晰、可执行

要求：
- 自动执行的步骤要具体到API调用级别
- 朋友协助的要明确需要什么帮助
- 社区求助的要考虑脱敏处理
          `.trim(),
          maxTokens: 2000,
        })

        const plan = planResult.toolCalls[0]?.args

        return new Response(
          JSON.stringify({
            success: true,
            plan,
            message: '执行计划生成完成'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      case 'execute': {
        // US-23: AI 自动执行能力
        const { stepIndex, planData } = await req.json()
        const step = planData.steps[stepIndex]

        if (step.type !== 'auto') {
          return new Response(
            JSON.stringify({
              success: false,
              error: '该步骤无法自动执行，需要人工介入'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        // 这里会调用具体的自动执行逻辑
        // TODO: 实现具体的工具调用 (订票API、购物API等)

        return new Response(
          JSON.stringify({
            success: true,
            result: `步骤 ${step.step} "${step.title}" 执行完成`,
            nextStep: stepIndex + 1 < planData.steps.length ? stepIndex + 1 : null
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
    }

  } catch (error) {
    console.error('Agent error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})