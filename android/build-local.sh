#!/usr/bin/env bash
set -euo pipefail
repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
tools_dir="${FRAGMENT_ANDROID_TOOLS:?Set FRAGMENT_ANDROID_TOOLS to directory containing android-35, android-15 and ecj.jar}"
build_dir="${FRAGMENT_ANDROID_BUILD:-$repo_dir/android/build}"
keystore="${FRAGMENT_ANDROID_KEYSTORE:?Set FRAGMENT_ANDROID_KEYSTORE to a private persistent keystore path}"
rm -rf "$build_dir/classes" "$build_dir/dex"
mkdir -p "$build_dir/classes" "$build_dir/dex" "$build_dir/assets/www" "$repo_dir/dist/downloads"
python3 - "$repo_dir/dist" "$build_dir/assets/www" <<'PY'
import sys,shutil,pathlib
source,target=map(pathlib.Path,sys.argv[1:]);shutil.rmtree(target,ignore_errors=True);shutil.copytree(source,target,ignore=shutil.ignore_patterns('downloads'))
PY
"$tools_dir/android-15/aapt" package -f -M "$repo_dir/android/AndroidManifest.xml" -I "$tools_dir/android-35/android.jar" -S "$repo_dir/android/res" -A "$build_dir/assets" -F "$build_dir/resources.apk"
find "$repo_dir/android/src" -name '*.java' -print > "$build_dir/sources.list"
java -jar "$tools_dir/ecj.jar" -source 1.8 -target 1.8 -nowarn -bootclasspath "$tools_dir/android-35/android.jar" -classpath "$repo_dir/android/libs/apksig.jar" -d "$build_dir/classes" @"$build_dir/sources.list"
find "$build_dir/classes" -name '*.class' -print > "$build_dir/classes.list"
java -cp "$tools_dir/android-15/lib/d8.jar" com.android.tools.r8.D8 --release --min-api 23 --lib "$tools_dir/android-35/android.jar" --desugared-lib "$repo_dir/android/libs/desugar.json" --desugared-lib-pg-conf-output "$build_dir/desugar-keep.txt" --output "$build_dir/dex" @"$build_dir/classes.list" "$repo_dir/android/libs/apksig.jar"
java -cp "$tools_dir/android-15/lib/d8.jar" com.android.tools.r8.L8 --release --min-api 23 --desugared-lib "$repo_dir/android/libs/desugar.json" --lib "$tools_dir/android-35/android.jar" --pg-conf "$build_dir/desugar-keep.txt" --output "$build_dir/corelib.zip" "$repo_dir/android/libs/desugar_jdk_libs-2.0.4.jar" "$repo_dir/android/libs/desugar_jdk_libs_configuration-2.0.4.jar"
python3 - "$build_dir/resources.apk" "$build_dir/dex/classes.dex" "$build_dir/unsigned.apk" "$build_dir/corelib.zip" <<'PY'
import sys,shutil,zipfile
src,dex,out,core=sys.argv[1:];shutil.copyfile(src,out)
with zipfile.ZipFile(out,'a') as z:
 z.write(dex,'classes.dex')
 with zipfile.ZipFile(core) as c:
  for i,n in enumerate(sorted(n for n in c.namelist() if n.endswith('.dex')),2):z.writestr('classes'+str(i)+'.dex',c.read(n))
PY
"$tools_dir/android-15/zipalign" -f -p 4 "$build_dir/unsigned.apk" "$build_dir/aligned.apk"
if [ ! -f "$keystore" ]; then
 keytool -genkeypair -keystore "$keystore" -storepass changeit -keypass changeit -alias fragment -dname 'CN=Fragment Editor' -keyalg RSA -keysize 2048 -validity 10000 >/dev/null
fi
"$tools_dir/android-15/apksigner" sign --ks "$keystore" --ks-pass pass:changeit --key-pass pass:changeit --out "$repo_dir/dist/downloads/fragment-editor.apk" "$build_dir/aligned.apk"
"$tools_dir/android-15/apksigner" verify --verbose "$repo_dir/dist/downloads/fragment-editor.apk"
"$tools_dir/android-15/aapt" dump badging "$repo_dir/dist/downloads/fragment-editor.apk" | head -8
