#!/bin/bash
set -euo pipefail

# 日迭代晨间计划调度器
# 每天 9:00 SG 时间运行，生成随机偏移后触发 daily-orchestrator 的 plan 阶段

# 生成 0~540 分钟的随机偏移 (9小时 = 9*60 = 540分钟)
RANDOM_MIN=$((RANDOM % 541))

# 计算实际触发时间（SG 时间 UTC+8）
TRIGGER_HOUR=$((9 + RANDOM_MIN / 60))
TRIGGER_MIN=$((RANDOM_MIN % 60))

# 记录日志
LOG_FILE="/tmp/agent-reminder.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 晨间计划随机偏移: ${RANDOM_MIN}分钟" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 预计触发时间: ${TRIGGER_HOUR}:${TRIGGER_MIN} (SG时间)" >> "$LOG_FILE"

# 获取仓库路径
REPO_DIR="/Users/cookie/Desktop/wishpool-workspace"

# 使用 at 或 nohup 调度实际晨间计划任务
# 方式1: 使用 at 命令 (推荐，如果系统有安装)
if command -v at > /dev/null 2>&1; then
    echo "cd ${REPO_DIR} && bash scripts/daily-orchestrator.sh plan --send" | at now + ${RANDOM_MIN} minutes 2>> "$LOG_FILE"
else
    # 方式2: 使用 nohup + sleep (备用)
    nohup bash -c "sleep ${RANDOM_MIN}m; cd ${REPO_DIR} && bash scripts/daily-orchestrator.sh plan --send" >> "$LOG_FILE" 2>&1 &
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 晨间计划调度完成，将在 ${RANDOM_MIN} 分钟后触发" >> "$LOG_FILE"
