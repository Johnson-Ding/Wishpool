import { useState, useEffect } from "react";
import { ProductNav } from "./ProductNav";
import { Button } from "@/components/ui/button";
import { StarField, CloudField, getCharacterBg } from "@/components/ui/CharacterVisuals";
import { useTheme } from "@/contexts/theme/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { createWish } from "@/lib/api";
import { useLocation } from "wouter";
import { generateAIPlan, type GeneratedPlan } from "@/lib/agent-api";
import type { ExecutionPlan, ExecutionStep } from "../../../../../../shared/wishpool-access/types/execution-plan";
import { globalEvents, EVENTS } from "@/lib/events";

interface ProductShellProps {
  children: React.ReactNode;
}

export function ProductShell({ children }: ProductShellProps) {
  const [inputValue, setInputValue] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [aiPlan, setAiPlan] = useState<GeneratedPlan | null>(null);
  const [executionPlan, setExecutionPlan] = useState<ExecutionPlan | null>(null);
  const [aiProvider, setAiProvider] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState(false);
  const [editedWishText, setEditedWishText] = useState("");
  const { theme } = useTheme();
  const [, setLocation] = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async () => {
    const content = inputValue.trim();
    if (!content || isSubmitting || isAnalyzing) return;

    // 1. 先保存心愿到数据库
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await createWish({
        intent: content,
        rawInput: content,
        title: content.length > 18 ? `${content.slice(0, 18)}…` : content,
      });

      // 触发全局愿望创建事件，通知其他组件刷新数据
      globalEvents.emit(EVENTS.WISH_CREATED);
      console.log('🔄 愿望创建成功，触发全局刷新事件');
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "创建失败，请重试",
      });
      setIsSubmitting(false);
      return;
    }

    // 2. AI 智能方案生成（调用本地 AI Server）
    setIsSubmitting(false);
    setIsAnalyzing(true);
    setAiPlan(null);
    setAiProvider(null);
    setFeedback({ type: "info", message: "🤖 AI 正在分析你的心愿..." });

    try {
      const result = await generateAIPlan(content);

      console.log('🤖 AI方案结果:', result);
      setInputValue("");

      if (result.success) {
        // 处理新的ExecutionPlan格式
        if (result.executionPlan) {
          setExecutionPlan(result.executionPlan);
          setEditedWishText(result.executionPlan.wish_text);
          setFeedback({
            type: "success",
            message: `✨ AI 已生成 ${result.executionPlan.total_steps} 步执行方案！点击步骤可标记完成`
          });
        }

        // 兼容旧的GeneratedPlan格式
        if (result.plan) {
          setAiPlan(result.plan);
          setEditedWishText(result.plan.wishText);
        }

        setAiProvider(result.provider || null);
      } else {
        setFeedback({
          type: "info",
          message: "💭 AI 方案生成失败，请重试"
        });
      }
    } catch (error) {
      console.error('AI 分析失败:', error);
      setFeedback({
        type: "error",
        message: "AI 服务暂时不可用，请确认本地 AI Server 已启动（端口 3100）"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter 发送（英文输入友好）
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 步骤状态切换
  const toggleStepStatus = (stepId: string) => {
    if (!executionPlan) return;

    const updatedSteps = executionPlan.steps.map(step => {
      if (step.id === stepId) {
        const newStatus = step.status === 'completed' ? 'pending' : 'completed';
        return {
          ...step,
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
          manual_override: newStatus === 'completed'
        };
      }
      return step;
    });

    const completedCount = updatedSteps.filter(s => s.status === 'completed').length;
    const progressPercentage = Math.round((completedCount / updatedSteps.length) * 100);

    setExecutionPlan({
      ...executionPlan,
      steps: updatedSteps,
      completed_steps: completedCount,
      progress_percentage: progressPercentage,
      overall_status: completedCount === updatedSteps.length ? 'completed' : 'executing',
      updated_at: new Date().toISOString()
    });
  };

  // 启动自动执行 - 调用Computer Use服务
  const startAutomation = async (stepId: string) => {
    if (!executionPlan) return;

    const step = executionPlan.steps.find(s => s.id === stepId);
    if (!step?.auto_executable) return;

    // 更新步骤状态为执行中
    setFeedback({
      type: "info",
      message: `🤖 正在自动执行: ${step.title}...`
    });

    const updatedSteps = executionPlan.steps.map(s =>
      s.id === stepId ? { ...s, status: 'in_progress', started_at: new Date().toISOString() } : s
    );

    setExecutionPlan({
      ...executionPlan,
      steps: updatedSteps,
      updated_at: new Date().toISOString()
    });

    try {
      // 调用Computer Use API
      console.log('🤖 调用Computer Use执行:', step.title);
      const response = await fetch('http://localhost:3200/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stepConfig: step,
          sessionId: executionPlan.id
        })
      });

      if (!response.ok) {
        throw new Error(`Computer Use API调用失败: ${response.status}`);
      }

      const result = await response.json();
      console.log('🤖 Computer Use执行结果:', result);

      if (result.success && result.stepResult) {
        // 成功执行
        const finalSteps = executionPlan.steps.map(s => {
          if (s.id === stepId) {
            return {
              ...s,
              status: result.stepResult.completed ? 'completed' :
                     result.stepResult.requiresUserInput ? 'waiting_user' : 'failed',
              completed_at: result.stepResult.completed ? new Date().toISOString() : undefined,
              execution_result: {
                success: result.stepResult.completed,
                message: result.stepResult.message,
                screenshot_url: result.stepResult.screenshot_url
              }
            };
          }
          return s;
        });

        const completedCount = finalSteps.filter(s => s.status === 'completed').length;
        const progressPercentage = Math.round((completedCount / finalSteps.length) * 100);

        setExecutionPlan({
          ...executionPlan,
          steps: finalSteps,
          completed_steps: completedCount,
          progress_percentage: progressPercentage,
          overall_status: completedCount === finalSteps.length ? 'completed' : 'executing',
          updated_at: new Date().toISOString()
        });

        if (result.stepResult.completed) {
          setFeedback({
            type: "success",
            message: `✅ 自动执行成功: ${step.title}`
          });
        } else if (result.stepResult.requiresUserInput) {
          setFeedback({
            type: "info",
            message: `⚠️ 需要用户操作: ${result.stepResult.message}`
          });
        } else {
          setFeedback({
            type: "error",
            message: `❌ 执行遇到问题: ${result.stepResult.message}`
          });
        }
      } else {
        throw new Error(result.error || '执行失败');
      }

    } catch (error) {
      console.error('❌ Computer Use执行失败:', error);

      // 执行失败，更新状态
      const errorSteps = executionPlan.steps.map(s => {
        if (s.id === stepId) {
          return {
            ...s,
            status: 'failed',
            execution_result: {
              success: false,
              message: error instanceof Error ? error.message : '未知错误'
            }
          };
        }
        return s;
      });

      setExecutionPlan({
        ...executionPlan,
        steps: errorSteps,
        updated_at: new Date().toISOString()
      });

      setFeedback({
        type: "error",
        message: `❌ 自动执行失败: ${error instanceof Error ? error.message : '服务不可用'}`
      });
    }
  };

  const character = theme === "star" ? "star" : theme === "cloud" ? "cloud" : "moon";
  const bgImage = getCharacterBg(character);
  const isCloud = character === "cloud";

  return (
    <div
      className="h-dvh flex flex-col transition-colors duration-500 relative overflow-hidden"
      style={{
        background: "var(--background)",
        fontFamily: "'Noto Sans SC', 'PingFang SC', -apple-system, sans-serif"
      }}
    >
      {/* 背景图片层 */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
        style={{
          backgroundImage: `url(${bgImage})`,
          opacity: isCloud ? 0.6 : 0.45,
        }}
      />

      {/* 渐变遮罩 */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, oklch(var(--background-lch) / 20%), oklch(var(--background-lch) / 90%))",
        }}
      />

      {/* 动态背景动画 */}
      {mounted && (
        isCloud ? <CloudField /> : <StarField />
      )}

      {/* 装饰光晕 */}
      <div
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(var(--primary-lch) / 12%), transparent 70%)",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
          animation: "float 8s ease-in-out infinite",
        }}
      />

      <ProductNav />

      <main className="flex-1 overflow-y-auto relative z-10">
        {/* AI 方案展示区 */}
        <AnimatePresence>
          {(aiPlan || executionPlan) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto px-6 pt-6 pb-2"
            >
              <div
                className="rounded-2xl border p-6 backdrop-blur-md"
                style={{
                  borderColor: "oklch(var(--primary-lch) / 30%)",
                  background: "oklch(var(--background-lch) / 70%)",
                }}
              >
                {/* 标题和进度 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    {editingPlan ? (
                      <input
                        type="text"
                        value={editedWishText}
                        onChange={(e) => setEditedWishText(e.target.value)}
                        onBlur={() => {
                          if (executionPlan) {
                            setExecutionPlan(prev => prev ? { ...prev, wish_text: editedWishText } : null);
                          } else if (aiPlan) {
                            setAiPlan(prev => prev ? { ...prev, wishText: editedWishText } : null);
                          }
                          setEditingPlan(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (executionPlan) {
                              setExecutionPlan(prev => prev ? { ...prev, wish_text: editedWishText } : null);
                            } else if (aiPlan) {
                              setAiPlan(prev => prev ? { ...prev, wishText: editedWishText } : null);
                            }
                            setEditingPlan(false);
                          }
                        }}
                        className="text-lg font-semibold bg-transparent border border-dashed border-gray-400 rounded px-2 py-1 w-full"
                        style={{ color: "var(--foreground)" }}
                        autoFocus
                      />
                    ) : (
                      <h3
                        className="text-lg font-semibold cursor-pointer hover:opacity-70 transition-opacity"
                        style={{ color: "var(--foreground)" }}
                        onClick={() => setEditingPlan(true)}
                        title="点击编辑心愿"
                      >
                        {executionPlan ? executionPlan.wish_text : aiPlan?.wishText}
                      </h3>
                    )}

                    {/* 进度信息 */}
                    {executionPlan ? (
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                          预估 {Math.ceil((executionPlan.estimated_total_duration || 0) / 60)} 小时
                          {aiProvider && <span className="ml-2 opacity-50">· {aiProvider}</span>}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width: `${executionPlan.progress_percentage}%`,
                                background: "linear-gradient(90deg, var(--primary), var(--accent))"
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>
                            {executionPlan.completed_steps}/{executionPlan.total_steps}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                        {aiPlan?.durationText}
                        {aiProvider && <span className="ml-2 opacity-50">· {aiProvider}</span>}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPlan(!editingPlan)}
                      className="text-sm px-3 py-1 rounded-full"
                      style={{ color: "var(--muted-foreground)", background: "var(--secondary)" }}
                      title={editingPlan ? "取消编辑" : "编辑心愿"}
                    >
                      {editingPlan ? "取消" : "编辑"}
                    </button>
                    <button
                      onClick={() => {
                        setAiPlan(null);
                        setExecutionPlan(null);
                        setFeedback(null);
                      }}
                      className="text-sm px-3 py-1 rounded-full"
                      style={{ color: "var(--muted-foreground)", background: "var(--secondary)" }}
                    >
                      关闭
                    </button>
                  </div>
                </div>

                {/* 决策问题 - 仅对旧格式显示 */}
                {!executionPlan && aiPlan?.decisionTitle && (
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{ background: "oklch(var(--primary-lch) / 8%)" }}
                  >
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {aiPlan.decisionTitle}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {aiPlan.decisionOptions.map(opt => (
                        <span
                          key={opt.key}
                          className="text-xs px-3 py-1.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                          style={{
                            border: "1px solid oklch(var(--primary-lch) / 30%)",
                            color: "var(--foreground)",
                          }}
                        >
                          {opt.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 执行步骤 - 新格式（ExecutionPlan） */}
                {executionPlan ? (
                  <div className="space-y-3">
                    {executionPlan.steps.map((step) => (
                      <div
                        key={step.id}
                        className={`group flex gap-3 items-start rounded-xl p-3 transition-all border ${
                          step.status === 'completed' ? 'opacity-75' : 'hover:shadow-sm'
                        }`}
                        style={{
                          background: step.status === 'completed'
                            ? "oklch(var(--primary-lch) / 5%)"
                            : step.status === 'in_progress'
                            ? "oklch(var(--accent-lch) / 8%)"
                            : "oklch(var(--background-lch) / 50%)",
                          borderColor: step.status === 'completed'
                            ? "oklch(var(--primary-lch) / 20%)"
                            : "transparent"
                        }}
                      >
                        {/* 步骤状态指示器 */}
                        <button
                          onClick={() => toggleStepStatus(step.id)}
                          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-105 ${
                            step.status === 'completed' ? 'bg-green-100 text-green-700' :
                            step.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600 group-hover:bg-primary group-hover:text-white'
                          }`}
                          title={step.status === 'completed' ? '点击标记未完成' : '点击标记完成'}
                        >
                          {step.status === 'completed' ? '✓' :
                           step.status === 'in_progress' ? '⚡' : step.index}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-medium ${step.status === 'completed' ? 'line-through' : ''}`}
                              style={{ color: "var(--foreground)" }}
                            >
                              {step.title}
                            </span>

                            {/* 步骤类型标签 */}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                                step.type === 'research' ? 'bg-blue-100 text-blue-700' :
                                step.type === 'book' ? 'bg-green-100 text-green-700' :
                                step.type === 'execute' ? 'bg-purple-100 text-purple-700' :
                                step.type === 'manual' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {step.type === 'research' ? '调研' :
                               step.type === 'book' ? '预订' :
                               step.type === 'execute' ? '执行' :
                               step.type === 'manual' ? '手动' : step.type}
                            </span>

                            {/* 自动执行标识 */}
                            {step.auto_executable && step.status === 'pending' && (
                              <button
                                onClick={() => startAutomation(step.id)}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-80 transition-opacity"
                                title="点击自动执行"
                              >
                                🤖 自动
                              </button>
                            )}

                            {/* 预估时长 */}
                            {step.estimated_duration && (
                              <span className="text-xs opacity-60">
                                ~{step.estimated_duration}分钟
                              </span>
                            )}
                          </div>

                          <p className={`text-xs mt-1 ${step.status === 'completed' ? 'opacity-50' : ''}`}
                             style={{ color: "var(--muted-foreground)" }}>
                            {step.description}
                          </p>

                          {/* Computer Use 配置预览 */}
                          {step.computer_use_config && step.status !== 'completed' && (
                            <div className="mt-2 text-xs opacity-60" style={{ color: "var(--muted-foreground)" }}>
                              🎯 {step.computer_use_config.target_website}
                            </div>
                          )}

                          {/* 执行结果 */}
                          {step.execution_result && (
                            <div className={`mt-2 text-xs p-2 rounded ${
                              step.execution_result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {step.execution_result.message}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* 旧格式步骤展示 */
                  <div className="space-y-3">
                    {aiPlan?.planSteps?.map((step) => (
                      <div
                        key={step.num}
                        className="flex gap-3 items-start rounded-xl p-3"
                        style={{ background: "oklch(var(--background-lch) / 50%)" }}
                      >
                        <span
                          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: `${step.typeColor}20`, color: step.typeColor }}
                        >
                          {step.num}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                              {step.title}
                            </span>
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                              style={{ background: `${step.typeColor}15`, color: step.typeColor }}
                            >
                              {step.type}
                            </span>
                          </div>
                          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 底部信息和操作 */}
                <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid oklch(var(--border-lch) / 30%)" }}>
                  <div className="flex items-center gap-4">
                    {executionPlan ? (
                      <>
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {executionPlan.intent_type} · {executionPlan.execution_level === 'L1_auto' ? 'AI自动执行' :
                           executionPlan.execution_level === 'L2_friend' ? '朋友协助' : '社区帮助'}
                        </span>
                        {executionPlan.automation_config?.enabled && (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                            🤖 支持自动化
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {aiPlan?.category} · {aiPlan?.difficulty === 'easy' ? '简单' : aiPlan?.difficulty === 'medium' ? '中等' : '困难'} · 预计 {aiPlan?.estimatedDays} 天
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {executionPlan && executionPlan.progress_percentage === 100 && (
                      <span className="text-sm px-3 py-2 rounded-full font-medium bg-green-100 text-green-700">
                        🎉 已完成
                      </span>
                    )}

                    <button
                      className="text-sm px-4 py-2 rounded-full font-medium"
                      style={{
                        background: "linear-gradient(135deg, var(--primary), var(--accent))",
                        color: "var(--background)",
                      }}
                      onClick={() => {
                        setAiPlan(null);
                        setExecutionPlan(null);
                        setFeedback(null);
                        setLocation("/wishes");
                      }}
                    >
                      {executionPlan && executionPlan.progress_percentage > 0 ? '保存进度' : '确认方案'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {children}
      </main>

      {/* 底部输入框 - 精致桌面版 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="border-t backdrop-blur-xl z-20"
        style={{
          borderColor: "var(--border)",
          background: "oklch(var(--background-lch) / 85%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex-1 relative"
              style={{
                boxShadow: "0 4px 20px oklch(var(--primary-lch) / 10%)",
                borderRadius: "9999px",
              }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting || isAnalyzing}
                className="w-full rounded-full px-6 py-4 text-sm outline-none transition-all font-medium"
                style={{
                  background: "var(--input)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  opacity: (isSubmitting || isAnalyzing) ? 0.7 : 1,
                }}
                onFocus={(e) => {
                  if (!isSubmitting && !isAnalyzing) {
                    e.target.style.boxShadow = "0 0 0 2px oklch(var(--primary-lch) / 40%)";
                    e.target.style.borderColor = "oklch(var(--primary-lch) / 50%)";
                  }
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "var(--border)";
                }}
                placeholder={
                  isAnalyzing
                    ? "🤖 AI 分析中..."
                    : isSubmitting
                    ? "💾 保存中..."
                    : isCloud
                    ? "☁️ 许下你的心愿...（⌘+回车发送）"
                    : "✨ 许下你的心愿...（⌘+回车发送）"
                }
              />
              {isAnalyzing && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <span className="animate-spin text-lg">🤖</span>
                </div>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isSubmitting || isAnalyzing}
              className="rounded-full font-semibold px-8 py-5 hover:opacity-90 transition-all hover:scale-105"
              style={{
                background: inputValue.trim() && !isSubmitting && !isAnalyzing
                  ? "linear-gradient(135deg, var(--primary), var(--accent))"
                  : "var(--secondary)",
                color: inputValue.trim() && !isSubmitting && !isAnalyzing
                  ? "var(--background)"
                  : "var(--muted-foreground)",
                boxShadow: inputValue.trim() && !isSubmitting && !isAnalyzing
                  ? "0 4px 15px oklch(var(--primary-lch) / 30%)"
                  : "none",
                opacity: (isSubmitting || isAnalyzing) ? 0.7 : 1,
              }}
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">🤖</span>
                  分析中
                </span>
              ) : isSubmitting ? "保存中..." : "许愿"}
            </Button>
          </div>

          {/* 反馈消息 */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 text-center text-sm"
                style={{
                  color: feedback.type === "success"
                    ? "var(--primary)"
                    : feedback.type === "error"
                    ? "var(--destructive)"
                    : "var(--accent)", // info 类型用 accent 颜色
                }}
              >
                {feedback.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
