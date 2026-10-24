// Vercel / GitHub Pages 用の静的ビルド
// 1) vite build で作った Hono アプリ (dist/_worker.js) に各ルートを問い合わせ, HTML を書き出す
// 2) public/static を丸ごとコピーする
// 出力: out/index.html, out/t1/index.html, out/b1/index.html ... + out/static/
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolve(root, 'out')
const app = (await import(pathToFileURL(resolve(root, 'dist/_worker.js')).href)).default

await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })
await cp(resolve(root, 'public/static'), resolve(out, 'static'), { recursive: true })

const get = async (p) => {
  const r = await app.fetch(new Request('https://example.com' + p))
  if (r.status !== 200) throw new Error(p + ' -> ' + r.status)
  return r
}
const units = await (await get('/api/units')).json()
const routes = ['/', ...units.map((u) => '/' + u.id)]
for (const p of routes) {
  const html = await (await get(p)).text()
  const dir = resolve(out, '.' + p)
  await mkdir(dir, { recursive: true })
  await writeFile(resolve(dir, 'index.html'), html, 'utf8')
}
await mkdir(resolve(out, 'api'), { recursive: true })
await writeFile(resolve(out, 'api/units.json'), JSON.stringify(units), 'utf8')
console.log('static site ->', out, routes.join(' '))
