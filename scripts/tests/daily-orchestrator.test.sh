#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCRIPT_PATH="${ROOT_DIR}/scripts/daily-orchestrator.sh"

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

mkdir -p \
  "${TMP_DIR}/bin" \
  "${TMP_DIR}/scripts" \
  "${TMP_DIR}/.claude/triggers" \
  "${TMP_DIR}/docs/progress"

cat > "${TMP_DIR}/.claude/task-pool.md" <<'EOF'
# 许愿池共享任务池

## 基础设施 Agent

### P0
| # | 任务 | 依赖 | 状态 |
|---|------|------|------|
| 1 | AI Server 运维监控 | - | 🔲 |

### P1
| # | 任务 | 依赖 | 状态 |
|---|------|------|------|
| 2 | RPC 错误码统一 | - | 🔲 |

## 广场 Agent

### P0
| # | 任务 | 依赖 | 状态 |
|---|------|------|------|
| 1 | Feed 真实化接入 | - | 🔲 |

### P1
| # | 任务 | 依赖 | 状态 |
|---|------|------|------|
| 2 | 点赞评论真实化 | - | 🔲 |

## 心愿发布 Agent

### P0
| # | 任务 | 依赖 | 状态 |
|---|------|------|------|
| 1 | US-05 输入边界定义 | - | 🔲 |

### P1
| # | 任务 | 依赖 | 状态 |
|---|------|------|------|
| 2 | ChatScreen 接入真实 API | - | 🔲 |

## 心愿管理 Agent

### P0
| # | 任务 | 依赖 | 状态 |
|---|------|------|------|
| 1 | 心愿状态实时同步 | - | 🔲 |

### P1
| # | 任务 | 依赖 | 状态 |
|---|------|------|------|
| 2 | 列表空状态设计 | - | 🔲 |

## 本周P0优先级排序（考虑依赖）

1. **基础设施#2**: RPC 错误码统一（基础能力）
2. **心愿发布#1**: US-05 输入边界定义（关键用户输入链路）
3. **心愿管理#1**: 心愿状态实时同步（影响用户侧状态感知）
EOF

PLAN_FILE="${TMP_DIR}/docs/progress/daily/2026-04-02-plan.md"
REPORT_FILE="${TMP_DIR}/docs/progress/daily/2026-04-02-report.md"
COORDINATOR_PLAN_FILE="${TMP_DIR}/docs/progress/daily/2026-04-02-coordinator-plan.md"
COORDINATOR_REPORT_FILE="${TMP_DIR}/docs/progress/daily/2026-04-02-coordinator-report.md"
FOUNDATION_FILE="${TMP_DIR}/docs/progress/daily/2026-04-02-foundation.md"
PLAZA_FILE="${TMP_DIR}/docs/progress/daily/2026-04-02-plaza.md"
WISH_PUBLISH_FILE="${TMP_DIR}/docs/progress/daily/2026-04-02-wish-publish.md"
MANAGEMENT_FILE="${TMP_DIR}/docs/progress/daily/2026-04-02-management.md"

bash "${SCRIPT_PATH}" plan --repo-dir "${TMP_DIR}" --date 2026-04-02 --no-send
test -f "${PLAN_FILE}"
grep -q "2026-04-02 日迭代计划" "${PLAN_FILE}"
grep -q "AI Server 运维监控" "${PLAN_FILE}"
grep -q "Feed 真实化接入" "${PLAN_FILE}"
grep -q "US-05 输入边界定义" "${PLAN_FILE}"
grep -q "心愿状态实时同步" "${PLAN_FILE}"
test -f "${TMP_DIR}/.claude/triggers/foundation-daily-plan-2026-04-02"
test -f "${TMP_DIR}/.claude/triggers/plaza-daily-plan-2026-04-02"
test -f "${TMP_DIR}/.claude/triggers/wish-publish-daily-plan-2026-04-02"
test -f "${TMP_DIR}/.claude/triggers/management-daily-plan-2026-04-02"
test -f "${COORDINATOR_PLAN_FILE}"
grep -q "协调者晨报" "${COORDINATOR_PLAN_FILE}"
grep -q "基础设施#2" "${COORDINATOR_PLAN_FILE}"
test -f "${FOUNDATION_FILE}"
test -f "${PLAZA_FILE}"
test -f "${WISH_PUBLISH_FILE}"
test -f "${MANAGEMENT_FILE}"
grep -q "回写状态：待填写" "${FOUNDATION_FILE}"
grep -q "AI Server 运维监控" "${FOUNDATION_FILE}"

python3 - <<'PY' "${FOUNDATION_FILE}"
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()
text = text.replace("回写状态：待填写", "回写状态：已回写")
text = text.replace("- 今日实际进展：\n  - 待填写", "- 今日实际进展：\n  - 已完成 AI Server 运维监控 日回写")
path.write_text(text)
PY

bash "${SCRIPT_PATH}" report --repo-dir "${TMP_DIR}" --date 2026-04-02 --no-send
test -f "${REPORT_FILE}"
test -f "${COORDINATOR_REPORT_FILE}"
grep -q "2026-04-02 日迭代汇总" "${REPORT_FILE}"
grep -q "协调者日报" "${COORDINATOR_REPORT_FILE}"
grep -q "foundation-daily-report-2026-04-02" "${REPORT_FILE}"
grep -q "4/4" "${REPORT_FILE}"
grep -q "| 基础设施 | .* | 已回写 |" "${REPORT_FILE}"
grep -q "| 广场 | .* | 待填写 |" "${REPORT_FILE}"
grep -q "你只需要关注以下事项" "${COORDINATOR_REPORT_FILE}"
test -f "${TMP_DIR}/.claude/triggers/foundation-daily-report-2026-04-02"
test -f "${TMP_DIR}/.claude/triggers/plaza-daily-report-2026-04-02"
test -f "${TMP_DIR}/.claude/triggers/wish-publish-daily-report-2026-04-02"
test -f "${TMP_DIR}/.claude/triggers/management-daily-report-2026-04-02"

cat > "${TMP_DIR}/bin/lark-cli" <<'EOF'
#!/bin/bash
printf '%s\n' "$*" >> "${LARK_FAKE_LOG}"
cat <<'JSON'
{
  "ok": true,
  "identity": "bot",
  "data": {
    "message_id": "om_fake_daily"
  }
}
JSON
EOF
chmod +x "${TMP_DIR}/bin/lark-cli"

LARK_FAKE_LOG="${TMP_DIR}/lark-cli.log" \
PATH="${TMP_DIR}/bin:${PATH}" \
bash "${SCRIPT_PATH}" run --repo-dir "${TMP_DIR}" --date 2026-04-02 --send

grep -q -- "--text ✅ Wishpool 协调者收敛日报已生成｜2026-04-02" "${TMP_DIR}/lark-cli.log"
grep -q -- "--file docs/progress/daily/2026-04-02-coordinator-plan.md" "${TMP_DIR}/lark-cli.log"
grep -q -- "--file docs/progress/daily/2026-04-02-coordinator-report.md" "${TMP_DIR}/lark-cli.log"
if grep -q -- "--file docs/progress/daily/2026-04-02-foundation.md" "${TMP_DIR}/lark-cli.log"; then
  echo "agent writeback files should not be sent to user by default"
  exit 1
fi

echo "daily-orchestrator test passed"
