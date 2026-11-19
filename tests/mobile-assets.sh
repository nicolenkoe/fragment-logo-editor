#!/usr/bin/env bash
set -euo pipefail
repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
tools_dir="${FRAGMENT_ANDROID_TOOLS:?Set FRAGMENT_ANDROID_TOOLS}"
test_dir="${FRAGMENT_MOBILE_TEST_BUILD:-/workspace/work/mobile-image-tests}"
mkdir -p "$test_dir"
java -jar "$tools_dir/ecj.jar" -source 1.8 -target 1.8 -nowarn -bootclasspath "$tools_dir/android-35/android.jar" -d "$test_dir" "$repo_dir/android/src/ru/fragment/logoeditor/ImageAssets.java" "$repo_dir/tests/native/ImageAssetsTest.java"
java -cp "$test_dir" ru.fragment.logoeditor.ImageAssetsTest
node "$repo_dir/tests/mobile-images.cjs"
