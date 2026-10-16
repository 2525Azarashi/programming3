import { Hono } from 'hono'

const app = new Hono()

// 単元レジストリ (PDF を受け取るたびにここと public/static/js/units/ に追加する)
const UNITS: Record<string, { title: string; desc: string; extra?: string[] }> = {
  b1: { title: 'Cプログラミングの基礎事項', desc: 'bit と型・標準入出力と標準エラー出力・リダイレクトと diff・EOF・配列と文字列', extra: ['code'] },
  b2: { title: '分割コンパイル', desc: '関数とプロトタイプ宣言・コンパイルとリンク・ヘッダファイル・構造体・乱数', extra: ['code'] },
  b3: { title: 'ポインタ', desc: '変数の番地・& と *・ポインタ引数・構造体/配列へのポインタ' },
}

const shell = (opts: { page: string; unit?: string; title: string; desc: string; extra?: string[] }) => `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${opts.title}</title>
<meta name="description" content="${opts.desc}">
<meta name="theme-color" content="#fff6ec">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='%23f2467f'/><text x='50%25' y='58%25' font-family='monospace' font-size='34' font-weight='700' fill='%23ffffff' text-anchor='middle' dominant-baseline='middle'>*p</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Zen+Maru+Gothic:wght@400;500;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/static/css/app.css">
</head>
<body data-page="${opts.page}" data-unit="${opts.unit ?? ''}">
<div id="app" aria-live="polite"></div>
<noscript><p style="padding:2rem">このサイトは JavaScript を使用します。</p></noscript>
<script src="/static/js/core.js"></script>
<script src="/static/js/kinetic.js"></script>
<script src="/static/js/infog.js"></script>
<script src="/static/js/memviz.js"></script>
<script src="/static/js/interp.js"></script>
<script src="/static/js/shell.js"></script>
<script src="/static/js/widgets.js"></script>
<script src="/static/js/units/index.js"></script>
${opts.unit ? `<script src="/static/js/units/${opts.unit}-data.js"></script>
<script src="/static/js/units/${opts.unit}-tasks.js"></script>
${(opts.extra ?? []).map((x) => `<script src="/static/js/units/${opts.unit}-${x}.js"></script>`).join('\n')}
<script src="/static/js/units/${opts.unit}.js"></script>
<script src="/static/js/units/${opts.unit}-talk.js"></script>
<script src="/static/js/units/infog-data.js"></script>` : ''}
<script src="/static/js/app.js"></script>
</body>
</html>`

app.get('/', (c) =>
  c.html(shell({ page: 'home', title: 'プログラミング実習Ⅲ — Learning Lab', desc: 'プログラミング実習Ⅲの理解を最大化する学習サイト' }))
)

app.get('/:unit', (c) => {
  const id = c.req.param('unit').toLowerCase()
  const u = UNITS[id]
  if (!u) return c.notFound()
  return c.html(shell({ page: 'unit', unit: id, title: `${id.toUpperCase()} ${u.title} — プログラミング実習Ⅲ`, desc: u.desc, extra: u.extra }))
})

app.get('/api/units', (c) => c.json(Object.entries(UNITS).map(([id, u]) => ({ id, title: u.title, desc: u.desc }))))

export default app
