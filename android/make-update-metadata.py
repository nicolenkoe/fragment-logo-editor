#!/usr/bin/env python3
"""Create an external integrity sidecar AFTER signing, avoiding a hash inside its own APK."""
import argparse,hashlib,json,pathlib,re,subprocess,zipfile
p=argparse.ArgumentParser();p.add_argument('--apk',required=True);p.add_argument('--output',required=True);p.add_argument('--tools',required=True);a=p.parse_args()
apk=pathlib.Path(a.apk);tools=pathlib.Path(a.tools)
badging=subprocess.check_output([str(tools/'android-15/aapt'),'dump','badging',str(apk)],text=True)
pkg,code,version=re.search(r"package: name='([^']+)' versionCode='(\d+)' versionName='([^']+)'",badging).groups();minimum=int(re.search(r"sdkVersion:'(\d+)'",badging).group(1))
certs=subprocess.check_output([str(tools/'android-15/apksigner'),'verify','--print-certs',str(apk)],text=True)
signers=sorted(re.findall(r'certificate SHA-256 digest: ([a-f0-9]{64})',certs))
if not signers:raise SystemExit('APK has no verified signer')
with zipfile.ZipFile(apk) as z:abis=sorted({n.split('/')[1] for n in z.namelist() if n.startswith('lib/') and n.endswith('.so')}) or ['universal']
data=dict(schema=1,packageName=pkg,version=version,versionCode=int(code),minSdk=minimum,abis=abis,size=apk.stat().st_size,sha256=hashlib.sha256(apk.read_bytes()).hexdigest(),signerSha256=signers)
body=json.dumps(data,ensure_ascii=False,indent=2)+'\n';out=pathlib.Path(a.output);out.parent.mkdir(parents=True,exist_ok=True)
if out.exists() and out.read_text()!=body:raise SystemExit('Refusing to replace immutable metadata: '+str(out))
out.write_text(body);print(version,code,data['size'],data['sha256'])
