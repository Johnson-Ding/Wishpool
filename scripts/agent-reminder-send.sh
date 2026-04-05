#!/bin/bash
set -euo pipefail

# Agent 报告提醒 - 飞书推送执行脚本
# 被 wrapper 调度执行，向用户推送 Agent 报告检查提醒，并附带最新 md 文件

LOG_FILE="/tmp/agent-reminder.log"
REPO_DIR="/Users/cookie/Desktop/wishpool-workspace"
TARGET_USER_ID="ou_3bfaffdb1298cdb0e89135354ee677c9"

send_text() {
    local message="$1"
    (
        cd "${REPO_DIR}"
        lark-cli im +messages-send \
            --as bot \
            --user-id "${TARGET_USER_ID}" \
            --text "${message}"
    )
}

send_file() {
    local file_path="$1"
    [ -f "${file_path}" ] || return 0

    local relative_path="${file_path#${REPO_DIR}/}"
    (
        cd "${REPO_DIR}"
        lark-cli im +messages-send \
            --as bot \
            --user-id "${TARGET_USER_ID}" \
            --file "${relative_path}"
    )
}

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始执行飞书推送..." >> "$LOG_FILE"

# 检查最近的报告文件
REPORTS_DIR="${REPO_DIR}/docs/reports"
LATEST_PLANNING=$(ls -t ${REPORTS_DIR}/*-planning-*.md 2>/dev/null | head -1)
LATEST_ITERATION=$(ls -t ${REPORTS_DIR}/*-iteration-*.md 2>/dev/null | head -1)

# 构建消息内容
MESSAGE="🔔 Agent 报告检查提醒

⏰ 触发时间: $(date '+%Y-%m-%d %H:%M') (SG时间)

📋 请检查以下 Agent 是否已提交报告：
• foundation (基础设施)
• plaza (广场)
• wish-publish (心愿发布)
• management (心愿管理)

📁 最新规划报告: ${LATEST_PLANNING##${REPO_DIR}/}
📁 最新迭代报告: ${LATEST_ITERATION##${REPO_DIR}/}

💡 如果已有 Agent 提交报告，请：
1. 审阅报告内容
2. 确认或调整优先级
3. 约时间评审（如有必要）

📍 报告目录: docs/reports/"

# 使用 lark-im 发送消息给自己
# 用户 open_id: ou_3bfaffdb1298cdb0e89135354ee677c9
if command -v lark-cli >/dev/null 2>&1; then
    # 发送给自己 (user 身份) - 使用 messages-send 子命令
    # 注意：messages-send 是 bot-only，user 需要用其他方式
    # 这里尝试用 bot 发给用户
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 尝试用 bot 身份发送..." >> "$LOG_FILE"

    send_text "${MESSAGE}" 2>> "$LOG_FILE"
    SEND_RESULT=$?

    if [ $SEND_RESULT -eq 0 ]; then
        send_file "${LATEST_PLANNING}" 2>> "$LOG_FILE" || true
        send_file "${LATEST_ITERATION}" 2>> "$LOG_FILE" || true
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 飞书推送成功" >> "$LOG_FILE"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 飞书推送失败 (exit: $SEND_RESULT)" >> "$LOG_FILE"
        # 备用：输出到系统通知
        osascript -e "display notification \"Agent报告检查提醒 - 飞书推送失败，请检查日志\" with title \"Agent报告提醒\"" 2>/dev/null || true
    fi
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 错误: lark-cli 未找到" >> "$LOG_FILE"
    # 备用：输出到系统通知
    osascript -e "display notification \"${MESSAGE}\" with title \"Agent报告提醒\"" 2>/dev/null || true
fi
