#!/bin/bash
set -euo pipefail

# 日迭代晚间汇总入口
# 兼容旧脚本名，实际委托给 daily-orchestrator 的 report 阶段

LOG_FILE="/tmp/agent-reminder.log"
REPO_DIR="/Users/cookie/Desktop/wishpool-workspace"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始执行日汇总链路..." >> "$LOG_FILE"

cd "${REPO_DIR}"
bash scripts/daily-orchestrator.sh report --send "$@"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 日汇总链路执行完成" >> "$LOG_FILE"
