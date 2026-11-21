from pathlib import Path
import http.server,functools,threading,json
from playwright.sync_api import sync_playwright
root=Path('/workspace/work/hub-update-1.6/my-projects')
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',8772),functools.partial(Quiet,directory=str(root)));threading.Thread(target=server.serve_forever,daemon=True).start()
fixtures=json.loads(Path('/workspace/work/build-fixtures.json').read_text());sources=json.loads((root/'build-sources.json').read_text());errors=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':390,'height':844});page.on('pageerror',lambda e:errors.append(str(e)))
 for name,url in sources.items():
  body=json.dumps(fixtures[name]);body='globalThis.FragmentCatalog='+body+';' if name=='fragment-logo-editor' else body
  page.route(url+"*",lambda route,request,body=body:route.fulfill(status=200,body=body,content_type='application/json'))
 page.goto('http://127.0.0.1:8772/');page.wait_for_selector('article');page.wait_for_timeout(300)
 assert page.locator('article').count()==5
 assert page.locator('[data-project="my-projects"]').count()==0
 assert page.get_by_text('Codex').count()==0 and page.get_by_text('GitHub',exact=True).count()==0
 assert page.locator('.description').count()==5 and page.locator('.version').count()==5
 assert page.locator('a.pc').count()==2
 links=page.locator('a').evaluate_all('(nodes)=>nodes.map(x=>x.href)')
 assert not any('/my-projects/' in u or 'chatgpt.com' in u for u in links)
 assert not any('github.com' in u and '/releases/download/' not in u for u in links)
 assert page.locator('[data-project="screen-recorder-downloads"] .version').inner_text()=='V0.1.2'
 for width in [320,360,390,768,1280]:
  page.set_viewport_size({'width':width,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.set_viewport_size({'width':390,'height':844});page.screenshot(path='/workspace/work/public-1.19.png',full_page=True)
 page.route('**/*',lambda r:r.abort() if r.request.url.startswith('https:') else r.continue_());page.reload();assert page.locator('article').count()==5
 assert not errors,errors
 b.close()
server.shutdown();print('PASS public: five apps, descriptions/versions, two PC downloads, zero owner/Codex/repository links, five widths, offline cached builds, no console errors')
