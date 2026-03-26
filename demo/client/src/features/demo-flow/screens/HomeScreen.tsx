import { useEffect, useRef, useState, AnimatePresence, motion, React, DropdownMenu, COMMENT_TRANSCRIPTS, DEFAULT_SCENARIO, DRIFT_BOTTLES, TYPE_LABEL, WISH_SCENARIOS, type HomeActionConfig, type ToastState, type WishScenario, CharacterContext, MOON_AVATAR, MOON_BG, NavBar, SplashScreen, StarField, StatusBar } from "./_shared-imports";

export function HomeScreen({ onWishClick, onDoSameClick, isMember, tabMode }: { onWishClick: () => void; onDoSameClick: (bottleId: number) => void; isMember: boolean; tabMode?: boolean }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [likeAnim, setLikeAnim] = useState<number | null>(null);
  const [activeCommentBottleId, setActiveCommentBottleId] = useState<number | null>(null);
  const [commentDraftById, setCommentDraftById] = useState<Record<number, string>>({});
  const [commentCountBoostById, setCommentCountBoostById] = useState<Record<number, number>>({});
  const [isCommentRecording, setIsCommentRecording] = useState(false);
  const [recordingBottleId, setRecordingBottleId] = useState<number | null>(null);
  const [taskSheetBottleId, setTaskSheetBottleId] = useState<number | null>(null);
  const [taskSheetMode, setTaskSheetMode] = useState<"help" | "join" | null>(null);
  const [toast, setToast] = useState<ToastState>({ text: "", visible: false });
  const total = DRIFT_BOTTLES.length;

  const goNext = () => { setDirection(1); setCurrent(c => (c + 1) % total); };
  const goPrev = () => { setDirection(-1); setCurrent(c => (c - 1 + total) % total); };

  const handleLike = (id: number) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setLikeAnim(id);
    setTimeout(() => setLikeAnim(null), 600);
  };

  const showToast = (text: string) => {
    setToast({ text, visible: true });
    window.setTimeout(() => {
      setToast(currentToast => currentToast.text === text ? { text: "", visible: false } : currentToast);
    }, 1800);
  };

  const openCommentSheet = (id: number) => {
    setActiveCommentBottleId(id);
    setIsCommentRecording(false);
    setRecordingBottleId(null);
  };

  const closeCommentSheet = () => {
    setActiveCommentBottleId(null);
    setIsCommentRecording(false);
    setRecordingBottleId(null);
  };

  const closeTaskSheet = () => {
    setTaskSheetBottleId(null);
    setTaskSheetMode(null);
  };

  const updateCommentDraft = (id: number, value: string) => {
    setCommentDraftById(prev => ({ ...prev, [id]: value }));
  };

  const handleCommentMic = (id: number) => {
    setActiveCommentBottleId(id);
    setIsCommentRecording(true);
    setRecordingBottleId(id);
    window.setTimeout(() => {
      setIsCommentRecording(false);
      setRecordingBottleId(null);
      setCommentDraftById(prev => ({
        ...prev,
        [id]: prev[id] || COMMENT_TRANSCRIPTS[id % COMMENT_TRANSCRIPTS.length],
      }));
    }, 1800);
  };

  const handleSendComment = (id: number) => {
    const draft = commentDraftById[id]?.trim();
    if (!draft) return;
    setCommentCountBoostById(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setCommentDraftById(prev => ({ ...prev, [id]: "" }));
    closeCommentSheet();
    showToast("评论已发送");
  };

  const getWishLabel = (bottle: typeof DRIFT_BOTTLES[number]) => {
    const participationIds = new Set([1, 3]);
    return participationIds.has(bottle.id) ? "我要参加" : "我也想做";
  };

  const getCardActions = (bottle: typeof DRIFT_BOTTLES[number]): HomeActionConfig => {
    if (bottle.type === "story") {
      return bottle.meta.includes("助力")
        ? { primaryLabel: "参与其中 →", primaryKind: "task", secondaryLabel: getWishLabel(bottle), secondaryKind: "wish" }
        : { primaryLabel: "帮Ta实现 →", primaryKind: "task", secondaryLabel: getWishLabel(bottle), secondaryKind: "wish" };
    }
    if (bottle.type === "mumble") return { primaryLabel: "深有同感", primaryKind: "react" };
    if (bottle.type === "goodnews" || bottle.type === "poem" || bottle.type === "quote") return { primaryLabel: "真好", primaryKind: "react" };
    return { primaryLabel: `${getWishLabel(bottle)} →`, primaryKind: "wish" };
  };

  const runPrimaryAction = (bottle: typeof DRIFT_BOTTLES[number]) => {
    const action = getCardActions(bottle);
    if (action.primaryKind === "wish") {
      onDoSameClick(bottle.id);
      return;
    }
    if (action.primaryKind === "task") {
      setTaskSheetBottleId(bottle.id);
      setTaskSheetMode(bottle.meta.includes("助力") ? "join" : "help");
      return;
    }
    handleLike(bottle.id);
    showToast(action.primaryLabel === "真好" ? "已收到你的真好" : "已收到你的共鸣");
    window.setTimeout(() => {
      setDirection(1);
      setCurrent(value => (value + 1) % total);
    }, 220);
  };

  const activeCommentCard = activeCommentBottleId ? DRIFT_BOTTLES.find(item => item.id === activeCommentBottleId) ?? null : null;
  const taskCard = taskSheetBottleId ? DRIFT_BOTTLES.find(item => item.id === taskSheetBottleId) ?? null : null;

  const card = DRIFT_BOTTLES[current];
  const commentCount = (id: number) => (commentCountBoostById[id] || 0);

  const renderCommentButton = (id: number) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => openCommentSheet(id)}
      className="flex items-center gap-1.5 py-2.5 px-3 rounded-2xl text-sm"
      style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <span>评论</span>
      <span className="text-xs tabular-nums">{commentCount(id)}</span>
    </motion.button>
  );

  const renderPrimaryActions = (bottle: typeof DRIFT_BOTTLES[number]) => {
    const action = getCardActions(bottle);
    return (
      <>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => runPrimaryAction(bottle)}
          className="flex-1 py-2.5 rounded-2xl text-sm font-semibold"
          style={{ background: `linear-gradient(135deg, ${bottle.tagColor}, ${bottle.tagColor}cc)`, color: "oklch(0.1 0.02 265)" }}
        >
          {action.primaryKind === "react" && likedIds.has(bottle.id) ? `❤️ ${action.primaryLabel}` : action.primaryLabel}
        </motion.button>
        {action.secondaryLabel && action.secondaryKind === "wish" && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onDoSameClick(bottle.id)}
            className="py-2.5 px-3 rounded-2xl text-sm"
            style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
          >
            {action.secondaryLabel}
          </motion.button>
        )}
      </>
    );
  };

  const renderCommentSheet = () => {
    if (!activeCommentCard) return null;
    const draft = commentDraftById[activeCommentCard.id] || "";
    const isRecordingCurrent = isCommentRecording && recordingBottleId === activeCommentCard.id;
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex items-end"
          style={{ background: "oklch(0 0 0 / 45%)" }}
          onClick={closeCommentSheet}
        >
          <motion.div
            initial={{ y: 320 }}
            animate={{ y: 0 }}
            exit={{ y: 320 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="w-full rounded-t-[28px] px-5 pt-4 pb-5"
            style={{ background: "var(--card)", borderTop: "1px solid var(--border)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "var(--border)" }} />
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs mb-1" style={{ color: activeCommentCard.tagColor }}>{activeCommentCard.tag}</p>
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{activeCommentCard.title}</p>
              </div>
              <button onClick={closeCommentSheet} className="p-1 rounded-full" style={{ color: "var(--muted-foreground)" }}>✕</button>
            </div>
            <div className="glass-card rounded-2xl px-4 py-3 mb-3">
              <textarea
                value={draft}
                onChange={e => updateCommentDraft(activeCommentCard.id, e.target.value)}
                placeholder="说说你的想法…"
                rows={4}
                className="w-full bg-transparent text-sm outline-none resize-none"
                style={{ color: "var(--foreground)" }}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs" style={{ color: isRecordingCurrent ? "#f87171" : "var(--muted-foreground)" }}>
                  {isRecordingCurrent ? "正在转写你的语音…" : "支持文字评论 / 语音评论"}
                </span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{draft.length}/80</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => handleCommentMic(activeCommentCard.id)}
                className="w-12 h-12 rounded-full flex items-center justify-center recording-pulse"
                style={{
                  background: isRecordingCurrent ? "linear-gradient(135deg, #f87171, #ef4444)" : "var(--primary)",
                  color: "var(--background)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSendComment(activeCommentCard.id)}
                className="flex-1 py-3 rounded-2xl font-semibold text-sm"
                style={{
                  background: draft.trim() ? "linear-gradient(135deg, var(--accent), var(--primary))" : "var(--secondary)",
                  color: draft.trim() ? "var(--background)" : "var(--muted-foreground)",
                }}
              >
                发送评论
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderTaskSheet = () => {
    if (!taskCard || !taskSheetMode) return null;
    const isJoin = taskSheetMode === "join";
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex items-end"
          style={{ background: "oklch(0 0 0 / 45%)" }}
          onClick={closeTaskSheet}
        >
          <motion.div
            initial={{ y: 320 }}
            animate={{ y: 0 }}
            exit={{ y: 320 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="w-full rounded-t-[28px] px-5 pt-4 pb-5"
            style={{ background: "var(--card)", borderTop: "1px solid var(--border)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "var(--border)" }} />
            <div className="mb-4">
              <p className="text-xs mb-1" style={{ color: taskCard.tagColor }}>{isJoin ? "多人助力任务" : "帮 Ta 实现"}</p>
              <p className="text-base font-semibold mb-1" style={{ color: "var(--foreground)" }}>{taskCard.title}</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{taskCard.meta} · {taskCard.loc}</p>
            </div>

            {isJoin ? (
              <div className="flex flex-col gap-3 mb-4">
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>参与说明</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>发起人正在找同频伙伴一起完成这件事，你可以先加入意向名单，后续由平台继续撮合时间、地点和分工。</p>
                </div>
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: "var(--muted-foreground)" }}>当前进度</span>
                    <span style={{ color: "var(--foreground)" }}>已确认 3 / 5 人</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-4">
                {[
                  { title: "内容核验", desc: "AI 先问你 2 个问题，判断这条需求是否真实可执行。" },
                  { title: "帮忙转帖", desc: "把这条愿望扩散到更可能帮助到的人群里。" },
                ].map(task => (
                  <div key={task.title} className="glass-card rounded-2xl p-4">
                    <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>{task.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{task.desc}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={closeTaskSheet}
                className="flex-1 py-3 rounded-2xl text-sm"
                style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
              >
                {isJoin ? "先不了" : "稍后再说"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  closeTaskSheet();
                  showToast(isJoin ? "已加入参与名单" : "任务已接收");
                }}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "var(--background)" }}
              >
                {isJoin ? "确定参与" : "接受任务"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="flex flex-col h-full relative">
      {!tabMode && <StatusBar />}
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-1 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden moon-pulse">
            <img src={MOON_AVATAR} alt="许愿池" className="w-full h-full object-cover" />
          </div>
          <span className="font-heading font-semibold text-sm" style={{ color: "var(--foreground)" }}>许愿池</span>
        </div>
        <button className="p-1.5 rounded-full" style={{ color: "var(--muted-foreground)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
      </div>

      {/* 进度点 */}
      <div className="flex items-center justify-center gap-1.5 pb-2">
        {DRIFT_BOTTLES.map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-300" style={{
            width: i === current ? 18 : 6, height: 6,
            background: i === current ? "var(--primary)" : "oklch(0.3 0.01 265)",
          }} />
        ))}
      </div>

      {/* 卡片区 */}
      <div className="flex-1 px-4 relative" style={{ minHeight: 0 }}>
        {/* 背景叠影 */}
        <div className="absolute inset-x-10 top-3 bottom-2 rounded-3xl" style={{ background: "oklch(0.18 0.02 265)", zIndex: 1 }} />
        <div className="absolute inset-x-6 top-1.5 bottom-1 rounded-3xl" style={{ background: "oklch(0.22 0.025 265)", zIndex: 2 }} />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ x: direction > 0 ? 300 : -300, opacity: 0, rotate: direction > 0 ? 6 : -6 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ x: direction > 0 ? -300 : 300, opacity: 0, rotate: direction > 0 ? -6 : 6 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="absolute inset-x-4 top-0 bottom-0 rounded-3xl flex flex-col overflow-hidden cursor-grab active:cursor-grabbing"
            style={{ background: "var(--card)", border: `1px solid ${card.tagColor}28`, boxShadow: `0 12px 40px oklch(0 0 0 / 40%), 0 0 0 1px ${card.tagColor}15`, zIndex: 3 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -55) goNext();
              else if (info.offset.x > 55) goPrev();
            }}
          >
            {(card.type === "poem" || card.type === "quote") ? (
              /* 小诗 / 金句：全卡大字居中排版 */
              <>
                <div className="flex-1 flex flex-col items-center justify-center px-7 pt-8 pb-4 text-center"
                  style={{ background: `linear-gradient(160deg, ${card.tagBg}, oklch(0.15 0.03 265))` }}>
                  <span className="text-xs px-3 py-1.5 rounded-full font-medium mb-6"
                    style={{ background: card.tagBg, color: card.tagColor, border: `1px solid ${card.tagColor}40` }}>
                    {card.tag}
                  </span>
                  <p className="font-heading font-bold text-xl leading-loose whitespace-pre-line"
                    style={{ color: "var(--foreground)" }}>
                    {card.excerpt}
                  </p>
                </div>
                <div className="flex items-center gap-2 p-4">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => runPrimaryAction(card)}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-semibold"
                    style={{ background: likedIds.has(card.id) ? `linear-gradient(135deg, #f87171, #ef4444)` : `linear-gradient(135deg, ${card.tagColor}, ${card.tagColor}cc)`, color: "oklch(0.1 0.02 265)" }}>
                    {likedIds.has(card.id) ? "❤️ 真好" : "真好"}
                  </motion.button>
                  {renderCommentButton(card.id)}
                  <span className="text-xs tabular-nums px-2" style={{ color: "var(--muted-foreground)" }}>
                    {card.likes + (likedIds.has(card.id) ? 1 : 0)}
                  </span>
                </div>
              </>
            ) : (
              /* 普通卡片：封面图 + 内容区 */
              <>
                <div className="relative h-44 overflow-hidden" style={{ background: card.tagBg }}>
                  <StarField />
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: card.tagBg, color: card.tagColor, border: `1px solid ${card.tagColor}40` }}>
                      {card.tag}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "oklch(0.1 0.02 265 / 50%)", color: "var(--muted-foreground)", backdropFilter: "blur(4px)" }}>
                      {TYPE_LABEL[card.type]}
                    </span>
                  </div>
                </div>
                <div className="flex-1 p-5 flex flex-col gap-3">
                  <div>
                    <h3 className="font-heading font-bold text-base mb-1" style={{ color: "var(--foreground)" }}>{card.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{card.excerpt}</p>
                  </div>
                  {card.type === "goodnews" && card.link && (
                    <div className="flex items-center gap-1 text-xs" style={{ color: card.tagColor }}>
                      <span>🔗</span>
                      <span style={{ opacity: 0.8 }}>来源：{card.link}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-auto">
                    <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "oklch(var(--accent-lch) / 10%)", color: "var(--accent)" }}>{card.meta}</span>
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{card.loc}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {renderPrimaryActions(card)}
                    {renderCommentButton(card.id)}
                    <motion.button whileTap={{ scale: 0.8 }} onClick={() => handleLike(card.id)}
                      className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl gap-0.5"
                      style={{ background: likedIds.has(card.id) ? "oklch(0.6 0.2 20 / 18%)" : "var(--secondary)" }}>
                      <motion.span key={`${card.id}-${likedIds.has(card.id)}`} initial={{ scale: 1 }}
                        animate={likeAnim === card.id ? { scale: [1, 1.5, 1] } : {}} transition={{ duration: 0.35 }}
                        className="text-base leading-none">
                        {likedIds.has(card.id) ? "❤️" : "🤍"}
                      </motion.span>
                      <span className="text-xs tabular-nums leading-none" style={{ color: likedIds.has(card.id) ? "#f87171" : "var(--muted-foreground)" }}>
                        {card.likes + (likedIds.has(card.id) ? 1 : 0)}
                      </span>
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {renderCommentSheet()}
        {renderTaskSheet()}
      </div>

      {/* 滑动提示 */}
      <p className="text-center text-xs py-2" style={{ color: "var(--muted-foreground)" }}>← 左右滑动浏览 →</p>

      {/* CTA 底部 — tabMode 下隐藏，由 MainTabScreen 的发布器替代 */}
      {!tabMode && (
        <div className="px-5 pb-5 pt-1">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onWishClick}
            className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, var(--primary), oklch(0.75 0.14 80))",
              color: "var(--background)",
              boxShadow: "0 8px 24px var(--ring)",
            }}
          >
            <span className="text-lg">+</span>
            <span>说出你的心愿</span>
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-24 px-4 py-2 rounded-full text-sm z-40"
            style={{ background: "oklch(0.18 0.02 265 / 92%)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── US-07：付费墙（会员）────────────────────────────────────────
