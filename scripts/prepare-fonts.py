import urllib.request,urllib.parse,json,pathlib,re,hashlib,concurrent.futures
root=pathlib.Path(__file__).resolve().parents[1]/'dist';raw=urllib.request.urlopen('https://fonts.google.com/metadata/fonts',timeout=40).read().decode();meta=json.loads(raw[raw.find('{'):]);rows=[r for r in meta['familyMetadataList'] if r.get('isOpenSource') is True];offline=['Tinos','Arimo','Cousine','Roboto','Open Sans','Montserrat','Lato','PT Sans','PT Serif','Oswald','Lobster','Comfortaa'];directory=root/'assets/fonts/google';directory.mkdir(exist_ok=True)
(root/'font-catalog.js').write_text('globalThis.FragmentFontCatalog='+json.dumps([dict(n=r['family'],s=list(r['fonts']),c='cyrillic' in r['subsets'],b=r['family'] in offline) for r in rows],ensure_ascii=False,separators=(',',':'))+';\n')
ua='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
def get(u):return urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':ua}),timeout=40).read()
def css(r):
 styles=[s for s in ['400','700','400i','700i'] if s in r['fonts']] or [next(iter(r['fonts']))];pairs=sorted((1 if s.endswith('i') else 0,int(s.rstrip('i'))) for s in styles);spec=r['family']+':ital,wght@'+';'.join(str(i)+','+str(w) for i,w in pairs)
 data=get('https://fonts.googleapis.com/css2?'+urllib.parse.urlencode({'family':spec,'display':'block'})).decode();return r['family'],data
selected=[r for r in rows if r['family'] in offline];csses=list(concurrent.futures.ThreadPoolExecutor(6).map(css,selected));urls=set(u for _,c in csses for u in re.findall(r'url\((https://fonts.gstatic.com/[^)]+)\)',c));print('Catalog',len(rows),'Offline families',len(csses),'Font files',len(urls),flush=True)
def save(u):
 extension='.woff2' if '.woff2' in u else '.ttf';name=hashlib.sha256(u.encode()).hexdigest()[:20]+extension;p=directory/name
 if not p.exists():p.write_bytes(get(u))
 return u,'assets/fonts/google/'+name
mapping=dict(concurrent.futures.ThreadPoolExecutor(8).map(save,urls));output=[]
for family,c in csses:
 for u,p in mapping.items():c=c.replace(u,p)
 output.append('/* '+family+' */\n'+c)
 slug=family.lower().replace(' ','');license=None
 for path in ['ofl/'+slug+'/OFL.txt','apache/'+slug+'/LICENSE.txt','ufl/'+slug+'/UFL.txt']:
  try:license=get('https://raw.githubusercontent.com/google/fonts/main/'+path);break
  except Exception:pass
 if license is None:
  try:license=get('https://raw.githubusercontent.com/googlefonts/'+slug+'/main/OFL.txt')
  except Exception:pass
 if license is None:raise RuntimeError('No license for '+family)
 (directory/(slug+'-LICENSE.txt')).write_bytes(license)
(root/'google-fonts.css').write_text('\n'.join(output));(directory/'README.txt').write_text('Unmodified open-source fonts served by Google Fonts CSS2 API. Family licenses are included next to the font files. Catalog snapshot: https://fonts.google.com/metadata/fonts (2026-11-18). Only isOpenSource=true families included in font-catalog.js.\n')
print('Font bytes',sum(p.stat().st_size for p in directory.iterdir()),flush=True)
