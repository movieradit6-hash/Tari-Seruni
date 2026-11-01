"""Menyiapkan salinan situs untuk GitHub Pages. File sumber di repo tidak diubah."""
import os, re, shutil, sys
SRC, OUT = '.', 'dist'
SKIP = {'.git', '.github', 'netlify.toml', 'README.md', 'dist'}
shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
for n in os.listdir(SRC):
    if n in SKIP: continue
    (shutil.copytree if os.path.isdir(n) else shutil.copy2)(n, os.path.join(OUT, n))

def rw(p, fn):
    p = os.path.join(OUT, p); s = open(p, encoding='utf-8').read(); open(p, 'w', encoding='utf-8').write(fn(s))

# 1. Nama file addon three.js: samakan huruf besar-kecil dengan yang di-import
names = ['RoomEnvironment','EffectComposer','MaskPass','OutputPass','Pass','RenderPass','ShaderPass','UnrealBloomPass','CopyShader','LuminosityHighPassShader','OutputShader']
low = {n.lower(): n for n in names}
for d, _, fs in os.walk(os.path.join(OUT, 'vendor/three/addons')):
    for f in fs:
        if f.endswith('.js') and f[:-3] in low:
            os.rename(os.path.join(d, f), os.path.join(d, low[f[:-3]] + '.js'))

# 2. Path absolut -> relatif (GitHub Pages ada di subfolder), tambah PWA
def html(s):
    s = s.replace('href="/css/app.css"', 'href="css/app.css"').replace('src="/js/app.js"', 'src="js/app.js"')
    s = s.replace('"three":"/vendor/', '"three":"./vendor/').replace('"three/addons/":"/vendor/', '"three/addons/":"./vendor/')
    s = s.replace('<meta name="theme-color" content="#5c0b1a">', '''<meta name="theme-color" content="#5c0b1a">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="icons/favicon-16.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Seruni Musi">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">''', 1)
    return s.replace('</body>', "<script>if('serviceWorker' in navigator){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}</script>\n</body>", 1)
rw('index.html', html)

# 3. Gambar lewat Netlify Image CDN -> file asli
rw('css/app.css', lambda s: re.sub(r'url\("/\.netlify/images\?url=/img/([a-z-]+\.png)[^"]*"\)', r'url("../img/\1")', s))
rw('js/three/tex.js', lambda s: s.replace("TL.load(`/.netlify/images?url=/img/${file}&w=${w}&fm=webp`, x => set(x.image), undefined, () => TL.load('/img/' + file, x => set(x.image)))", "TL.load('img/' + file, x => set(x.image))"))

# 4. Manifest + service worker (Add to Home)
open(f'{OUT}/manifest.webmanifest', 'w').write('''{"name":"Tari Sambut Seruni Musi","short_name":"Seruni Musi","lang":"id","start_url":"./index.html","scope":"./","display":"standalone","background_color":"#5c0b1a","theme_color":"#5c0b1a","icons":[{"src":"icons/seruni-musi-icon-192.png","sizes":"192x192","type":"image/png","purpose":"any"},{"src":"icons/seruni-musi-icon-512.png","sizes":"512x512","type":"image/png","purpose":"any"},{"src":"icons/seruni-musi-icon-maskable-192.png","sizes":"192x192","type":"image/png","purpose":"maskable"},{"src":"icons/seruni-musi-icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]}''')
open(f'{OUT}/sw.js', 'w').write('''const V='seruni-v1';
const CORE=['./','index.html','css/app.css','js/app.js','js/data.js','js/audio.js','js/three/characters.js','js/three/tex.js','js/three/world.js','vendor/three/three.module.min.js','manifest.webmanifest','icons/seruni-musi-icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(h=>h||fetch(e.request).then(r=>{if(r.ok&&new URL(e.request.url).origin===location.origin){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match('index.html'))))});
''')
open(f'{OUT}/.nojekyll', 'w').close()
print('dist siap')
