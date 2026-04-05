#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

MODE="${1:-}"
if [ -z "${MODE}" ]; then
  echo "usage: $0 <plan|report|run> [--repo-dir PATH] [--date YYYY-MM-DD] [--send|--no-send] [--user-id OPEN_ID]" >&2
  exit 1
fi
shift || true

REPO_DIR="${DEFAULT_REPO_DIR}"
DATE_STR="$(TZ=Asia/Shanghai date '+%Y-%m-%d')"
SEND_MODE="false"
TARGET_USER_ID="${LARK_TARGET_OPEN_ID:-ou_3bfaffdb1298cdb0e89135354ee677c9}"
LOG_FILE="/tmp/daily-orchestrator.log"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --repo-dir)
      REPO_DIR="$2"
      shift 2
      ;;
    --date)
      DATE_STR="$2"
      shift 2
      ;;
    --send)
      SEND_MODE="true"
      shift
      ;;
    --no-send)
      SEND_MODE="false"
      shift
      ;;
    --user-id)
      TARGET_USER_ID="$2"
      shift 2
      ;;
    *)
      echo "unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

TASK_POOL_FILE="${REPO_DIR}/.claude/task-pool.md"
TRIGGER_DIR="${REPO_DIR}/.claude/triggers"
DAILY_DIR="${REPO_DIR}/docs/progress/daily"
PLAN_FILE="${DAILY_DIR}/${DATE_STR}-plan.md"
REPORT_FILE="${DAILY_DIR}/${DATE_STR}-report.md"
COORDINATOR_PLAN_FILE="${DAILY_DIR}/${DATE_STR}-coordinator-plan.md"
COORDINATOR_REPORT_FILE="${DAILY_DIR}/${DATE_STR}-coordinator-report.md"

AGENTS=(foundation plaza wish-publish management)

agent_title() {
  case "$1" in
    foundation) echo "基础设施 Agent" ;;
    plaza) echo "广场 Agent" ;;
    wish-publish) echo "心愿发布 Agent" ;;
    management) echo "心愿管理 Agent" ;;
    *)
      echo "unknown agent: $1" >&2
      exit 1
      ;;
  esac
}

agent_label() {
  case "$1" in
    foundation) echo "基础设施" ;;
    plaza) echo "广场" ;;
    wish-publish) echo "心愿发布" ;;
    management) echo "心愿管理" ;;
    *)
      echo "unknown agent: $1" >&2
      exit 1
      ;;
  esac
}

trim() {
  printf '%s' "$1" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//'
}

ensure_layout() {
  if [ ! -f "${TASK_POOL_FILE}" ]; then
    echo "missing task pool: ${TASK_POOL_FILE}" >&2
    exit 1
  fi

  mkdir -p "${TRIGGER_DIR}" "${DAILY_DIR}"
}

extract_tasks() {
  local title
  title="$(agent_title "$1")"

  awk -v section="## ${title}" '
    function trim(s) {
      sub(/^[ \t]+/, "", s)
      sub(/[ \t]+$/, "", s)
      return s
    }
    $0 == section {
      in_section = 1
      next
    }
    /^## / && in_section {
      exit
    }
    in_section && /^### P0/ {
      priority = "P0"
      next
    }
    in_section && /^### P1/ {
      priority = "P1"
      next
    }
    in_section && /^### P2/ {
      priority = "P2"
      next
    }
    in_section && /^\| [0-9]+ \|/ {
      split($0, parts, "|")
      task = trim(parts[3])
      dep = trim(parts[4])
      status = trim(parts[5])
      if (task != "") {
        print priority "\t" task "\t" dep "\t" status
      }
    }
  ' "${TASK_POOL_FILE}" | head -n 2
}

extract_global_priorities() {
  awk '
    /^## 本周P0优先级排序/ {
      in_section = 1
      next
    }
    /^## / && in_section {
      exit
    }
    in_section && /^[0-9]+\./ {
      print $0
    }
  ' "${TASK_POOL_FILE}" | head -n 3
}

fallback_global_priorities() {
  local emitted=0
  local agent lines priority task dep status

  for agent in "${AGENTS[@]}"; do
    lines="$(extract_tasks "${agent}")"
    while IFS=$'\t' read -r priority task dep status; do
      [ -n "${task}" ] || continue
      printf -- "- %s｜%s\n" "$(agent_label "${agent}")" "${task}"
      emitted=$((emitted + 1))
      if [ "${emitted}" -ge 3 ]; then
        return 0
      fi
    done <<< "${lines}"
  done
}

trigger_file() {
  local agent="$1"
  local phase="$2"
  echo "${TRIGGER_DIR}/${agent}-daily-${phase}-${DATE_STR}"
}

writeback_file() {
  local agent="$1"
  echo "${DAILY_DIR}/${DATE_STR}-${agent}.md"
}

touch_trigger() {
  local agent="$1"
  local phase="$2"
  local path
  path="$(trigger_file "${agent}" "${phase}")"
  printf '%s\n' "$(TZ=Asia/Shanghai date '+%H:%M')" > "${path}"
}

count_existing_triggers() {
  local phase="$1"
  local count=0
  local agent path
  for agent in "${AGENTS[@]}"; do
    path="$(trigger_file "${agent}" "${phase}")"
    if [ -f "${path}" ]; then
      count=$((count + 1))
    fi
  done
  echo "${count}"
}

ensure_writeback_templates() {
  local agent
  for agent in "${AGENTS[@]}"; do
    local file_path title label plan_trigger report_trigger lines
    file_path="$(writeback_file "${agent}")"

    if [ -f "${file_path}" ]; then
      continue
    fi

    title="$(agent_title "${agent}")"
    label="$(agent_label "${agent}")"
    plan_trigger="$(basename "$(trigger_file "${agent}" "plan")")"
    report_trigger="$(basename "$(trigger_file "${agent}" "report")")"
    lines="$(extract_tasks "${agent}")"

    {
      echo "# ${DATE_STR}｜${label} Agent 日回写"
      echo
      echo "- Agent：${title}"
      echo "- 日期：${DATE_STR}"
      echo "- 回写状态：待填写"
      echo "- 对应计划：\`docs/progress/daily/${DATE_STR}-plan.md\`"
      echo "- 日计划 Trigger：\`${plan_trigger}\`"
      echo "- 日汇总 Trigger：\`${report_trigger}\`"
      echo
      echo "## 今日承接任务"
      echo

      if [ -z "${lines}" ]; then
        echo "- [ ] 暂无任务"
      else
        local priority task dep status
        while IFS=$'\t' read -r priority task dep status; do
          [ -n "${task}" ] || continue
          echo "- [ ] ${priority}｜${task}（依赖：${dep:--}｜计划状态：${status:--}）"
        done <<< "${lines}"
      fi

      echo
      echo "## 今日实际进展"
      echo
      echo "- 待填写"
      echo
      echo "## 阻塞与风险"
      echo
      echo "- 待填写"
      echo
      echo "## 需要协调者拍板"
      echo
      echo "- 待填写"
      echo
      echo "## 明日衔接"
      echo
      echo "- 待填写"
    } > "${file_path}"
  done
}

writeback_status() {
  local agent="$1"
  local file_path
  file_path="$(writeback_file "${agent}")"

  if [ ! -f "${file_path}" ]; then
    echo "未生成"
    return 0
  fi

  if grep -q "回写状态：已回写" "${file_path}"; then
    echo "已回写"
  else
    echo "待填写"
  fi
}

build_coordinator_plan_file() {
  local generated_at priorities
  generated_at="$(TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M:%S %Z')"
  priorities="$(extract_global_priorities)"
  if [ -z "${priorities}" ]; then
    priorities="$(fallback_global_priorities)"
  fi

  {
    echo "# ${DATE_STR} 协调者晨报"
    echo
    echo "> 生成时间：${generated_at}"
    echo "> 面向对象：用户只看这一份，不需要逐个管理四个 Agent"
    echo
    echo "## 你只需要关注以下事项"
    echo

    if [ -z "${priorities}" ]; then
      echo "- 今日暂无明确优先级任务"
    else
      echo "${priorities}"
    fi

    echo
    echo "## 协调者判断"
    echo
    echo "- 今日优先级先按共享任务池中的“本周P0优先级排序”执行。"
    echo "- 四个 Agent 明细仍然保留为内部回写文件，但默认不推送给你。"
    echo "- 只有当回写文件里出现明确阻塞或拍板项时，才会在协调者日报里单独抬出来。"
  } > "${COORDINATOR_PLAN_FILE}"
}

build_coordinator_report_file() {
  local generated_at priorities
  generated_at="$(TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M:%S %Z')"
  priorities="$(extract_global_priorities)"
  if [ -z "${priorities}" ]; then
    priorities="$(fallback_global_priorities)"
  fi

  {
    echo "# ${DATE_STR} 协调者日报"
    echo
    echo "> 生成时间：${generated_at}"
    echo "> 面向对象：用户只看这一份，不需要逐个查看四个 Agent 明细"
    echo
    echo "## 你只需要关注以下事项"
    echo
    echo
    echo "### 今日最高优先级"
    echo

    if [ -z "${priorities}" ]; then
      echo "- 今日暂无明确优先级任务"
    else
      echo "${priorities}"
    fi

    echo
    echo "### Agent 回写概览"
    echo

    local agent label status
    for agent in "${AGENTS[@]}"; do
      label="$(agent_label "${agent}")"
      status="$(writeback_status "${agent}")"
      echo "- ${label}：${status}"
    done

    echo
    echo "### 协调者结论"
    echo
    echo
    echo "- 当前你无需逐个处理四个 Agent 的明细。"
    echo "- 只有当某个 Agent 回写文件中出现真实阻塞或拍板项时，我才会在这里收敛后抛给你。"
  } > "${COORDINATOR_REPORT_FILE}"
}

build_plan_file() {
  local generated_at
  generated_at="$(TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M:%S %Z')"

  {
    echo "# ${DATE_STR} 日迭代计划"
    echo
    echo "> 生成时间：${generated_at}"
    echo "> 来源任务池：\`.claude/task-pool.md\`"
    echo "> 编排脚本：\`scripts/daily-orchestrator.sh plan --date ${DATE_STR}\`"
    echo
    echo "## 今日节奏"
    echo
    echo "- 晨间动作：从共享任务池抽取四个 Agent 的当日焦点任务。"
    echo "- 日间动作：各 Agent 按触发文件回写自己的交付。"
    echo "- 晚间动作：协调者运行 \`report\` 生成日汇总，并同步飞书。"
    echo
    echo "## Agent 今日任务板"
    echo

    local agent
    for agent in "${AGENTS[@]}"; do
      local title label plan_trigger
      title="$(agent_title "${agent}")"
      label="$(agent_label "${agent}")"
      plan_trigger="$(basename "$(trigger_file "${agent}" "plan")")"

      echo "### ${label}"
      echo
      echo "| 优先级 | 任务 | 依赖 | 当前状态 | 触发文件 |"
      echo "|--------|------|------|----------|----------|"

      local lines line priority task dep status
      lines="$(extract_tasks "${agent}")"
      if [ -z "${lines}" ]; then
        echo "| P0 | 暂无任务 | - | - | ${plan_trigger} |"
      else
        while IFS=$'\t' read -r priority task dep status; do
          [ -n "${task}" ] || continue
          echo "| ${priority} | ${task} | ${dep:--} | ${status:--} | ${plan_trigger} |"
        done <<< "${lines}"
      fi

      echo
      echo "- 负责人：${title}"
      echo "- 触发文件：\`${plan_trigger}\`"
      echo
    done
  } > "${PLAN_FILE}"
}

build_report_file() {
  local generated_at
  generated_at="$(TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M:%S %Z')"
  local plan_trigger_count report_trigger_count
  plan_trigger_count="$(count_existing_triggers "plan")"
  report_trigger_count="$(count_existing_triggers "report")"

  {
    echo "# ${DATE_STR} 日迭代汇总"
    echo
    echo "> 生成时间：${generated_at}"
    echo "> 对应日计划：\`docs/progress/daily/${DATE_STR}-plan.md\`"
    echo "> 编排脚本：\`scripts/daily-orchestrator.sh report --date ${DATE_STR}\`"
    echo
    echo "## 汇总状态"
    echo
    echo "- 日计划触发已生成：${plan_trigger_count}/4"
    echo "- 日汇总触发已生成：${report_trigger_count}/4"
    echo "- 今日计划文件：\`docs/progress/daily/${DATE_STR}-plan.md\`"
    echo "- 今日汇总文件：\`docs/progress/daily/${DATE_STR}-report.md\`"
    echo
    echo "## Trigger 看板"
    echo
    echo "| Agent | 日计划 Trigger | 日汇总 Trigger | 回写文件 | 当前状态 |"
    echo "|-------|----------------|----------------|----------|----------|"

    local agent label plan_trigger report_trigger file_path relative_file status
    for agent in "${AGENTS[@]}"; do
      label="$(agent_label "${agent}")"
      plan_trigger="$(basename "$(trigger_file "${agent}" "plan")")"
      report_trigger="$(basename "$(trigger_file "${agent}" "report")")"
      file_path="$(writeback_file "${agent}")"
      relative_file="docs/progress/daily/${DATE_STR}-${agent}.md"
      status="$(writeback_status "${agent}")"
      echo "| ${label} | ${plan_trigger} | ${report_trigger} | ${relative_file} | ${status} |"
    done

    echo
    echo "## 协调者动作"
    echo
    echo "1. 校验今日计划和今日汇总文件均已落盘。"
    echo "2. 校验 4 个 Agent 的 daily trigger 已生成。"
    echo "3. 校验每个 Agent 的日回写文件是“待填写”还是“已回写”。"
    echo "4. 如需对外同步，使用 \`--send\` 通过飞书发送摘要与附件。"
  } > "${REPORT_FILE}"
}

send_message() {
  local heading="$1"
  local body="$2"

  if [ "${SEND_MODE}" != "true" ]; then
    return 0
  fi

  if ! command -v lark-cli >/dev/null 2>&1; then
    echo "lark-cli not found" >&2
    exit 1
  fi

  printf '[%s] %s\n' "$(TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M:%S')" "${heading}" >> "${LOG_FILE}"

  local message
  message="${heading}

${body}"

  (
    cd "${REPO_DIR}"
    lark-cli im +messages-send \
      --as bot \
      --user-id "${TARGET_USER_ID}" \
      --text "${message}"
  )
}

relative_repo_path() {
  local file_path="$1"

  case "${file_path}" in
    "${REPO_DIR}/"*)
      echo "${file_path#${REPO_DIR}/}"
      ;;
    *)
      echo "file path is outside repo: ${file_path}" >&2
      exit 1
      ;;
  esac
}

send_file_message() {
  local file_path="$1"

  if [ "${SEND_MODE}" != "true" ]; then
    return 0
  fi

  if [ ! -f "${file_path}" ]; then
    echo "attachment file not found: ${file_path}" >&2
    exit 1
  fi

  local relative_path
  relative_path="$(relative_repo_path "${file_path}")"

  printf '[%s] attachment %s\n' "$(TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M:%S')" "${relative_path}" >> "${LOG_FILE}"

  (
    cd "${REPO_DIR}"
    lark-cli im +messages-send \
      --as bot \
      --user-id "${TARGET_USER_ID}" \
      --file "${relative_path}"
  )
}

send_all_writeback_files() {
  local agent
  for agent in "${AGENTS[@]}"; do
    send_file_message "$(writeback_file "${agent}")"
  done
}

send_plan_digest() {
  local plan_trigger_count
  plan_trigger_count="$(count_existing_triggers "plan")"

  send_message \
    "📅 Wishpool 协调者晨报已生成｜${DATE_STR}" \
    "协调者晨报：docs/progress/daily/${DATE_STR}-coordinator-plan.md
计划 Trigger：${plan_trigger_count}/4
四个 Agent 明细已转为内部回写，不再默认推给你。"

  send_file_message "${COORDINATOR_PLAN_FILE}"
}

send_report_digest() {
  local plan_trigger_count report_trigger_count
  plan_trigger_count="$(count_existing_triggers "plan")"
  report_trigger_count="$(count_existing_triggers "report")"

  send_message \
    "🧾 Wishpool 协调者日报已生成｜${DATE_STR}" \
    "协调者日报：docs/progress/daily/${DATE_STR}-coordinator-report.md
计划 Trigger：${plan_trigger_count}/4
汇总 Trigger：${report_trigger_count}/4
四个 Agent 明细已转为内部留档。"

  send_file_message "${COORDINATOR_REPORT_FILE}"
}

run_plan() {
  ensure_layout

  local agent
  for agent in "${AGENTS[@]}"; do
    touch_trigger "${agent}" "plan"
  done

  build_plan_file
  ensure_writeback_templates
  build_coordinator_plan_file
  send_plan_digest
}

run_report() {
  ensure_layout

  local agent
  for agent in "${AGENTS[@]}"; do
    touch_trigger "${agent}" "report"
  done

  ensure_writeback_templates
  build_report_file
  build_coordinator_report_file
  send_report_digest
}

run_full() {
  ensure_layout

  local original_send_mode
  original_send_mode="${SEND_MODE}"
  SEND_MODE="false"
  run_plan
  run_report
  SEND_MODE="${original_send_mode}"
  send_message \
    "✅ Wishpool 协调者收敛日报已生成｜${DATE_STR}" \
    "协调者晨报：docs/progress/daily/${DATE_STR}-coordinator-plan.md
协调者日报：docs/progress/daily/${DATE_STR}-coordinator-report.md
计划 Trigger：$(count_existing_triggers "plan")/4
汇总 Trigger：$(count_existing_triggers "report")/4
用户无需逐个管理四个 Agent 明细。"

  send_file_message "${COORDINATOR_PLAN_FILE}"
  send_file_message "${COORDINATOR_REPORT_FILE}"
}

case "${MODE}" in
  plan)
    run_plan
    ;;
  report)
    run_report
    ;;
  run)
    run_full
    ;;
  *)
    echo "unknown mode: ${MODE}" >&2
    exit 1
    ;;
esac
