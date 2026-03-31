#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
GRADLE_FILE="$REPO_ROOT/android/app/build.gradle.kts"
KEYSTORE_FILE="$REPO_ROOT/android/app/release.keystore"
KEYSTORE_PROPS="$REPO_ROOT/android/app/keystore.properties"
REMOTE_URL="$(git -C "$REPO_ROOT" remote get-url origin 2>/dev/null || true)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}OK${NC}  $1"; }
fail() { echo -e "${RED}FAIL${NC} $1"; exit 1; }
info() { echo -e "${YELLOW}...${NC} $1"; }

normalize_repo_slug() {
  local url="$1"
  url="${url%.git}"
  url="${url#git@github.com:}"
  url="${url#https://github.com/}"
  url="${url#http://github.com/}"
  printf '%s' "$url"
}

REPO_SLUG="$(normalize_repo_slug "$REMOTE_URL")"
RELEASE_URL="https://github.com/$REPO_SLUG/releases/tag"

echo ""
echo "═══════════════════════════════════════"
echo "  Wishpool Android Release Script"
echo "═══════════════════════════════════════"
echo ""

# 1. 读取版本号
VERSION=$(python3 - <<'PY' "$GRADLE_FILE"
import pathlib,re,sys
content = pathlib.Path(sys.argv[1]).read_text()
patterns = [
    r'appVersionName\s*=\s*"(\d+\.\d+\.\d+)"',
    r'versionName\s*=\s*"(\d+\.\d+\.\d+)"',
]
for pattern in patterns:
    match = re.search(pattern, content)
    if match:
        print(match.group(1))
        break
else:
    print("")
PY
)
[ -z "$VERSION" ] && fail "无法从 build.gradle.kts 读取 versionName"
TAG="v$VERSION"
ok "当前版本: $VERSION (tag: $TAG)"

# 2. 检查工作区
info "检查 git 工作区..."
cd "$REPO_ROOT"
if ! git diff --quiet || ! git diff --cached --quiet; then
  fail "工作区有未提交的改动，请先 commit 或 stash"
fi
ok "工作区干净"

# 3. 检查 repo / gh CLI
[ -z "$REPO_SLUG" ] && fail "无法识别 origin 仓库地址，请先配置 GitHub remote"
ok "目标仓库: $REPO_SLUG"

command -v gh >/dev/null 2>&1 || fail "未安装 gh CLI"
ok "gh CLI 可用"

gh auth status >/dev/null 2>&1 || fail "gh 未登录，请先执行 gh auth login"
ok "gh 已登录"

# 4. 检查 tag 不重复
if git rev-parse "$TAG" >/dev/null 2>&1; then
  fail "tag $TAG 已存在，请先升级 versionName 再发版"
fi
ok "tag $TAG 未存在，可用"

# 5. 检查 keystore
[ -f "$KEYSTORE_FILE" ] || fail "keystore 文件不存在: $KEYSTORE_FILE"
[ -f "$KEYSTORE_PROPS" ] || fail "keystore.properties 不存在: $KEYSTORE_PROPS"
ok "keystore 文件就绪"

python3 - <<'PY' "$KEYSTORE_PROPS"
import pathlib,sys
required = {"storeFile", "storePassword", "keyAlias", "keyPassword"}
content = pathlib.Path(sys.argv[1]).read_text().splitlines()
keys = {line.split('=',1)[0].strip() for line in content if '=' in line and not line.strip().startswith('#')}
missing = sorted(required - keys)
if missing:
    raise SystemExit("keystore.properties 缺少字段: " + ",".join(missing))
PY
ok "keystore.properties 完整"

# 6. 本地构建 Release APK
echo ""
info "开始本地构建 Release APK..."
cd "$REPO_ROOT/android"
./gradlew :app:assembleRelease \
  --quiet \
  --build-cache \
  --parallel \
  -Dorg.gradle.jvmargs="-Xmx4g -XX:MaxMetaspaceSize=1g"
cd "$REPO_ROOT"

APK_SRC="$REPO_ROOT/android/app/build/outputs/apk/release/app-release.apk"
[ -f "$APK_SRC" ] || fail "APK 构建失败，未找到: $APK_SRC"

APK_NAME="wishpool-${VERSION}-android.apk"
APK_DEST="$REPO_ROOT/android/app/build/outputs/apk/release/$APK_NAME"
cp "$APK_SRC" "$APK_DEST"

APK_SIZE=$(ls -lh "$APK_DEST" | awk '{print $5}')
ok "APK 构建成功: $APK_NAME ($APK_SIZE)"

# 7. 创建并推送 tag
echo ""
info "创建 tag $TAG..."
git tag -a "$TAG" -m "Release $TAG"
info "推送 tag 到 origin..."
git push origin "$TAG"
ok "tag $TAG 已推送"

# 8. 创建 GitHub Release（不带文件，秒完成）
echo ""
info "创建 GitHub Release..."
gh release create "$TAG" \
  --title "$TAG" \
  --generate-notes \
  --repo "$REPO_SLUG"
ok "Release $TAG 已创建"

# 9. 上传 APK（单独上传，失败可重试，终端有进度条）
echo ""
info "上传 APK ($APK_SIZE)，请稍候..."
gh release upload "$TAG" "$APK_DEST" --repo "$REPO_SLUG"

echo ""
echo "═══════════════════════════════════════"
ok "发布完成！"
echo "  Release: $RELEASE_URL/$TAG"
echo "  APK:     $APK_NAME ($APK_SIZE)"
echo "═══════════════════════════════════════"
echo ""
echo "如上传失败可单独重试："
echo "  gh release upload $TAG $APK_DEST --repo $REPO_SLUG --clobber"
echo ""
