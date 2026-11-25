from pathlib import Path
import http.server,functools,threading,json
from playwright.sync_api import sync_playwright
root=Path('/workspace/work/hub-update-1.6/my-projects')
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',8773),functools.partial(Quiet,directory=str(root)));threading.Thread(target=server.serve_forever,daemon=True).start();fixtures=json.loads(Path('/workspace/work/build-fixtures.json').read_text());sources=json.loads((root/'build-sources.json').read_text());state={'mode':'fresh','hits':0};errors=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':390,'height':844});page.on('pageerror',lambda e:errors.append(str(e)))
 page.route('**api.github.com/users/nicolenkoe/repos**',lambda r:r.fulfill(status=200,body='[]',content_type='application/json',headers={'Access-Control-Allow-Origin':'*'}))
 def handler(name):
  def handle(route):
   data=fixtures[name]
   if name=='hvost-pod-kontrolem':
    state['hits']+=1
    assert '_hub_check=' in route.request.url
    if state['mode']=='error':route.fulfill(status=503,body='Unavailable',headers={'Access-Control-Allow-Origin':'*'});return
    if state['mode']=='stale':data={'version':'0.64','versionCode':64,'downloadUrl':'https://nicolenkoe.github.io/hvost-pod-kontrolem-downloads/HvostPodKontrolem-0.64.apk'}
   body=json.dumps(data);body='globalThis.FragmentCatalog='+body+';' if name=='fragment-logo-editor' else body
   route.fulfill(status=200,body=body,content_type='application/json',headers={'Access-Control-Allow-Origin':'*'})
  return handle
 for name,url in sources.items():page.route(url+'*',handler(name))
 page.goto('http://127.0.0.1:8773/owner.html?app=1');page.wait_for_selector('[data-project="hvost-pod-kontrolem"] .app-version');page.evaluate('()=>refreshBuilds()')
 page.evaluate("window.requestedApks=[];HTMLAnchorElement.prototype.click=function(){window.requestedApks.push(this.href)};appBuilds['hvost-pod-kontrolem']={version:'0.64',code:64,apk:'https://nicolenkoe.github.io/hvost-pod-kontrolem-downloads/HvostPodKontrolem-0.64.apk'};render()")
 before=state['hits'];page.locator('[data-project="hvost-pod-kontrolem"] .app-version').click();page.wait_for_function("document.querySelector('#notice').textContent.includes('Доступна V0.67')");assert state['hits']==before+1
 assert page.evaluate('requestedApks.length')==0;assert 'V0.67' in page.locator('[data-project="hvost-pod-kontrolem"] h2').inner_text()
 for mode in ['stale','error']:
  state['mode']=mode;page.locator('[data-project="hvost-pod-kontrolem"] .app-version').click();page.wait_for_function("document.querySelector('#notice').textContent.includes('Не удалось проверить')");assert page.evaluate('requestedApks.length')==0;assert page.evaluate("appBuilds['hvost-pod-kontrolem'].version")=='0.67'
 state['mode']='fresh';before=state['hits'];page.evaluate("const a=document.querySelector('[data-project=hvost-pod-kontrolem] .app-version');a.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));a.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));")
 page.wait_for_function("document.querySelector('#notice').textContent.includes('Актуальная версия — V0.67')");assert state['hits']==before+1
 assert page.evaluate('requestedApks.length')==0
 page.goto('http://127.0.0.1:8773/',wait_until='networkidle')
 page.evaluate("builds['hvost-pod-kontrolem']={version:'0.64',code:64,apk:'https://nicolenkoe.github.io/hvost-pod-kontrolem-downloads/HvostPodKontrolem-0.64.apk'};renderPublic()")
 before=state['hits'];page.locator('[data-project="hvost-pod-kontrolem"] .version').click();page.wait_for_function("document.querySelector('footer').textContent.includes('доступна V0.67')")
 assert state['hits']==before+1 and page.locator('[data-project="hvost-pod-kontrolem"] .version').inner_text()=='V0.67'
 assert page.locator('[data-project="my-projects"]').count()==0
 assert not errors,errors;b.close()
server.shutdown();print('PASS version click: owner/public fresh check, label/message update, current/no-network/stale replies, double click guard, zero APK downloads')
