#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MODEL_DIR_NAME="sherpa-onnx-streaming-zipformer-zh-14M-2023-02-23"
MODEL_URL="https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/${MODEL_DIR_NAME}.tar.bz2"
ASSETS_DIR="$REPO_ROOT/android/app/src/main/assets/asr/$MODEL_DIR_NAME"
TMP_DIR="$(mktemp -d)"
ARCHIVE_PATH="$TMP_DIR/${MODEL_DIR_NAME}.tar.bz2"
EXTRACT_DIR="$TMP_DIR/extracted"
REQUIRED_FILES=(
  "encoder-epoch-99-avg-1.int8.onnx"
  "decoder-epoch-99-avg-1.onnx"
  "joiner-epoch-99-avg-1.onnx"
  "tokens.txt"
)

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

mkdir -p "$EXTRACT_DIR"

echo "Downloading $MODEL_DIR_NAME..."
curl -L "$MODEL_URL" -o "$ARCHIVE_PATH"

echo "Extracting archive..."
tar -xjf "$ARCHIVE_PATH" -C "$EXTRACT_DIR"

SOURCE_DIR="$EXTRACT_DIR/$MODEL_DIR_NAME"
if [ ! -d "$SOURCE_DIR" ]; then
  echo "Expected model directory not found: $SOURCE_DIR" >&2
  exit 1
fi

rm -rf "$ASSETS_DIR"
mkdir -p "$ASSETS_DIR"

echo "Copying required model files into assets..."
for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$SOURCE_DIR/$file" ]; then
    echo "Missing required file: $file" >&2
    exit 1
  fi
  cp "$SOURCE_DIR/$file" "$ASSETS_DIR/$file"
done

echo "Done. Bundled files:"
ls -lh "$ASSETS_DIR"
