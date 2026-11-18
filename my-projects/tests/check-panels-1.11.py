from pathlib import Path
import http.server,functools,threading,json
from playwright.sync_api import sync_playwright
root=Path('/workspace/work/hub-update-1.6/my-projects')
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',8769),functools.partial(Quiet,directory=str(root)));threading.Thread(target=server.serve_forever,daemon=True).start()
repos=[{'name':n,'has_pages':True} for n in ['CamaraD-downloads','enduro-club-downloads','fragment-logo-editor','hvost-pod-kontrolem-downloads','screen-recorder-downloads']]
errors=[]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']);context=b.new_context(viewport={'width':390,'height':844},permissions=['clipboard-read','clipboard-write']);page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 page.route('**api.github.com/users/nicolenkoe/repos**',lambda r:r.fulfill(status=200,content_type='application/json',body=json.dumps(repos)))
 page.goto('http://127.0.0.1:8769/?app=1');page.wait_for_function('document.querySelectorAll(".branch-link").length===6');page.evaluate('document.fonts.ready');assert not page.locator('#panel').is_visible() and not page.locator('#settings-panel').is_visible()
 assert page.locator('#glass').bounding_box()['x']<page.locator('#settings-toggle').bounding_box()['x']
 assert page.locator('[data-project="hvost-pod-kontrolem-downloads"] img.logo').get_attribute('src')=='assets/hvost_original.png?v=1.11'
 assert page.locator('.launch').count()==6
 page.screenshot(path='/workspace/work/implementation-1.11-mobile.png')
 page.locator('#glass').click();assert page.locator('#panel').is_visible();assert page.locator('#search').is_visible();assert not page.locator('#refresh').is_visible()
 page.locator('#search').fill('Хвост');assert page.locator('.card').count()==1
 page.locator('#settings-toggle').click();assert not page.locator('#panel').is_visible() and page.locator('#settings-panel').is_visible();assert page.locator('.card').count()==6;assert page.locator('#refresh').is_visible()
 page.screenshot(path='/workspace/work/implementation-1.11-settings.png');page.locator('#settings-toggle').click();assert not page.locator('#settings-panel').is_visible()
 page.locator('#glass').click();page.locator('[data-list-filter=unlinked]').click();assert page.locator('.card').count()==0;page.locator('[data-list-filter=all]').click();assert page.locator('.card').count()==6;page.locator('#glass').click()
 page.locator('[data-project="CamaraD-downloads"] .copy').click();assert 'CamaraD-downloads' in page.evaluate('navigator.clipboard.readText()')
 for width in [320,390,768]:
  page.set_viewport_size({'width':width,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  for row in page.locator('.card').all():
   a=row.locator('a.button').bounding_box();launch=row.locator('.launch').bounding_box();assert launch['y']>=a['y']+a['height'];assert abs(launch['x']-a['x'])<1;c=row.locator('.copy').bounding_box();assert abs(a['y']+a['height']/2-c['y']-c['height']/2)<2
 page.set_viewport_size({'width':390,'height':844});page.evaluate("document.getElementById('notice').textContent=''");page.screenshot(path='/workspace/work/implementation-1.11-mobile.png')
 page.locator('.launch').first.click();assert 'Android' in page.locator('#notice').inner_text()
 assert not errors,errors
 b.close()
server.shutdown();print('PASS: six links, original dog logo, search/settings separation and toggle/reset, filters, copy, responsive widths 320/390/768, no console errors')
