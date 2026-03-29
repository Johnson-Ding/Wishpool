const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { wishInput } = await req.json()

    if (!wishInput) {
      return new Response(
        JSON.stringify({ error: '心愿内容不能为空' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 简单的方案生成逻辑
    const plan = {
      wishText: wishInput,
      durationText: "预计 3-5 天完成",
      decisionTitle: "AI 需要你决定：这次海边之行你更想要什么体验？",
      decisionOptions: [
        { key: "relax", label: "纯放松休闲" },
        { key: "activity", label: "海上活动体验" },
        { key: "photo", label: "拍照打卡风景" }
      ],
      planSteps: [
        { num: "①", title: "筛选适合的海边目的地和住宿", type: "线上直出", typeColor: "var(--accent)", desc: "AI 自动搜索推荐" },
        { num: "②", title: "预订交通和酒店，准备物品清单", type: "资源助力", typeColor: "var(--primary)", desc: "平台资源助力" },
        { num: "③", title: "找同行伙伴或当地向导推荐", type: "人群助力", typeColor: "#c084fc", desc: "AI匹配志同道合的旅友" },
        { num: "④", title: "开始海边放松之旅", type: "需你到场", typeColor: "#f97316", desc: "你本人享受旅程" }
      ],
      category: "生活体验",
      difficulty: "easy",
      estimatedDays: 4
    }

    return new Response(
      JSON.stringify({
        success: true,
        plan,
        message: 'AI方案生成完成'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'AI方案生成失败', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})