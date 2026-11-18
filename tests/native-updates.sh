#!/usr/bin/env bash
set -euo pipefail
repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
tools_dir="${FRAGMENT_ANDROID_TOOLS:?Set FRAGMENT_ANDROID_TOOLS}"
test_dir="${FRAGMENT_UPDATE_TEST_BUILD:-/workspace/work/update-native-tests}"
rm -rf "$test_dir/classes"
mkdir -p "$test_dir/classes"
python3 - "$repo_dir/dist/downloads/fragment-editor.apk" "$test_dir/tampered.apk" <<'PY'
import sys,zipfile,struct,pathlib
src,dest=map(pathlib.Path,sys.argv[1:]);data=bytearray(src.read_bytes())
with zipfile.ZipFile(src) as z:
 i=z.getinfo('assets/www/assets/enduro-logo.png');p=i.header_offset;name,extra=struct.unpack('<HH',data[p+26:p+30]);offset=p+30+name+extra;data[offset+30]^=1
# Keep all claimed file bytes/hash internally consistent; signature must still reject.
dest.write_bytes(data)
PY
java -jar "$tools_dir/ecj.jar" -source 1.8 -target 1.8 -nowarn -bootclasspath "$tools_dir/android-35/android.jar" -classpath "$repo_dir/android/libs/apksig.jar" -d "$test_dir/classes" "$repo_dir/tests/native/UpdateNativeTests.java" "$repo_dir/android/src/ru/fragment/logoeditor/UpdatePolicy.java" "$repo_dir/android/src/ru/fragment/logoeditor/UpdateCache.java" "$repo_dir/android/src/ru/fragment/logoeditor/ApkIntegrity.java"
java -cp "$test_dir/classes:$repo_dir/android/libs/apksig.jar" UpdateNativeTests "$repo_dir/dist/downloads/fragment-editor.apk" face17525fbf33ace89b2c66a4aa5d7914938aaca74257e74e2965bd5d617ffc "$test_dir/cache" "$test_dir/tampered.apk"
