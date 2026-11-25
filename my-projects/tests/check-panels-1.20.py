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
 fixtures=json.loads(Path('/workspace/work/build-fixtures.json').read_text());sources=json.loads((root/'build-sources.json').read_text())
 for name,url in sources.items():
  data=fixtures[name]
  if name=='my-projects':data=json.loads(json.dumps(data));data['releases'][0].update(versionCode=21,versionName='1.20',apkUrl='https://nicolenkoe.github.io/fragment-logo-editor/my-projects/my-projects-1.20.apk')
  body=json.dumps(data);body='globalThis.FragmentCatalog='+body+';' if name=='fragment-logo-editor' else body
  page.route(url+"*",lambda route,request,body=body:route.fulfill(status=200,body=body,content_type='application/json'))

 page.goto('http://127.0.0.1:8769/owner.html?app=1');page.wait_for_function('document.querySelectorAll(".branch-link").length===6');page.evaluate('document.fonts.ready');assert not page.locator('#panel').is_visible() and not page.locator('#settings-panel').is_visible()
 card=page.locator('[data-project="hvost-pod-kontrolem"]')
 assert card.locator('a.button:not(.apk)').get_attribute('href')=='https://nicolenkoe.github.io/hvost-pod-kontrolem-downloads/'
 assert card.locator('.branch-link').get_attribute('href')=='https://chatgpt.com/local/6af50efb-cc3c-8191-a02e-302d0b3ea049'
 card.locator('.copy').click();assert page.evaluate('navigator.clipboard.readText()')=='https://nicolenkoe.github.io/hvost-pod-kontrolem-downloads/'
 assert page.locator('#glass').bounding_box()['x']<page.locator('#settings-toggle').bounding_box()['x']
 assert page.locator('[data-project="hvost-pod-kontrolem"] img.logo').get_attribute('src')=='assets/hvost_original.png?v=1.15'
 assert page.locator('.launch').count()==6
 assert page.locator('.apk[href]').count()==6
 assert page.locator('.app-version').count()==6
 assert page.locator('.owner-description').count()==5
 assert page.locator('.friends-link').count()==1
 page.screenshot(path='/workspace/work/implementation-1.20-mobile.png')
 page.locator('#glass').click();assert page.locator('#panel').is_visible();assert page.locator('#search').is_visible();assert not page.locator('#refresh').is_visible()
 page.locator('#search').fill('Хвост');assert page.locator('.card').count()==1
 page.locator('#settings-toggle').click();assert not page.locator('#panel').is_visible() and page.locator('#settings-panel').is_visible();assert page.locator('.card').count()==6;assert page.locator('#refresh').is_visible()
 page.screenshot(path='/workspace/work/implementation-1.20-settings.png');page.locator('#settings-toggle').click();assert not page.locator('#settings-panel').is_visible()
 page.locator('#glass').click();page.locator('[data-list-filter=unlinked]').click();assert page.locator('.card').count()==0;page.locator('[data-list-filter=all]').click();assert page.locator('.card').count()==6;page.locator('#glass').click()
 page.locator('[data-project="CamaraD-downloads"] .copy').click();assert 'CamaraD-downloads' in page.evaluate('navigator.clipboard.readText()')
 for width in [320,390,768]:
  page.set_viewport_size({'width':width,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  for row in page.locator('.card').all():
   a=row.locator('a.button:not(.apk)').bounding_box();launch=row.locator('.launch').bounding_box();assert launch['y']>=a['y']+a['height'];assert abs(launch['x']-a['x'])<1;c=row.locator('.copy').bounding_box();assert abs(a['y']+a['height']/2-c['y']-c['height']/2)<2
 page.set_viewport_size({'width':390,'height':844});page.evaluate("document.getElementById('notice').textContent=''");page.screenshot(path='/workspace/work/implementation-1.20-mobile.png')
 page.locator('.launch').first.click();assert 'Android' in page.locator('#notice').inner_text()
 assert page.locator('.github-link').count()==6
 assert card.locator('.github-link').get_attribute('href')=='https://github.com/nicolenkoe/hvost-pod-kontrolem'
 assert page.locator('[data-project="CamaraD-downloads"] .github-link').get_attribute('href')=='https://github.com/nicolenkoe/CamaraD_App'
 assert page.locator('[data-project="enduro-club-downloads"] .github-link').get_attribute('href')=='https://github.com/nicolenkoe/enduro_moto'
 assert page.locator('body').get_attribute('data-layout')=='3' 
 page.locator('#settings-toggle').click()
 for mode in ['1','2','3']:
  page.locator('#catalog-layout').select_option(mode)
  page.reload();page.wait_for_selector('.launch');assert page.locator('body').get_attribute('data-layout')==mode
  for width in [320,360,390,768]:
   page.set_viewport_size({'width':width,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   for row in page.locator('.card').all():
    site=row.locator('a.button:not(.apk)').bounding_box();copy=row.locator('.copy').bounding_box();launch=row.locator('.launch').bounding_box()
    assert abs(site['x']-launch['x'])<1 and abs(copy['x']+copy['width']-row.locator('.apk').bounding_box()['x']-row.locator('.apk').bounding_box()['width'])<1
    assert row.locator('h2').evaluate('(e)=>e.scrollWidth<=e.clientWidth'),(mode,width,row.locator('h2').inner_text())
    assert row.locator('.branch-link').inner_text()=='Codex'
    assert row.locator('.github-link').inner_text()=='GitHub'
    center=row.locator('.github-link').evaluate('(e)=>{const r=document.createRange();r.selectNodeContents(e);const b=r.getBoundingClientRect();return b.x+b.width/2}')
    codex=row.locator('.branch-link').bounding_box();assert abs(center-(codex['x']+codex['width']+site['x'])/2)<1.5
    assert row.locator('.project-links').evaluate('(e)=>e.scrollWidth<=e.clientWidth')
    assert row.locator('.github-link').bounding_box()['x']+row.locator('.github-link').bounding_box()['width']<=site['x']
  page.set_viewport_size({'width':390,'height':844});page.evaluate('window.scrollTo(0,0)');page.screenshot(path='/workspace/work/implementation-1.20-mode-'+mode+'.png',full_page=True)
  page.locator('#settings-toggle').click()
 assert not errors,errors
 b.close()
server.shutdown();print('PASS: six links, original dog logo, search/settings separation and toggle/reset, filters, copy, responsive widths 320/390/768, no console errors')
