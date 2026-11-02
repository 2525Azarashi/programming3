/* B6 リスト処理 — 課題定義 (出典: 配布資料「[B6] リスト処理」) */
(function () {
  'use strict';
  const R = String.raw;
  const D = window.B6_DATA || { sol: {}, given: {}, exp: {}, inp: {}, start: {}, timing: {} };
  const G = D.given || {}, E = D.exp || {}, I = D.inp || {}, S = D.start || {};
  const pick = (...ks) => { const o = {}; ks.forEach((k) => (o[k] = G[k])); return o; };
  const T = (k, label, extra) => Object.assign({ stdin: I[k], expect: E[k], label }, extra || {});

  /* ---- 判定の補助 ---- */
  const HP = (r) => (r && r.heap) || { sizes: [], leaks: [] };
  const noCmt = (s) => (s || '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const body = (src, fn) => { const m = new RegExp('\\b' + fn + '\\s*\\([^)]*\\)\\s*(?:/\\*[\\s\\S]*?\\*/\\s*)*\\{([\\s\\S]*?)\\n\\}').exec(src || ''); return m ? m[1] : ''; };
  function leakMsg(outs) {
    const r = outs.find((x) => HP(x).leaks.length);
    if (!r) return null;
    const L = HP(r).leaks;
    return 'free 忘れ (メモリリーク) があります: 終了時に ' + L.length + ' ブロック (' + L.reduce((a, b) => a + b.n, 0) + ' バイト) が返却されていません';
  }
  /* 隠しテスト: test 用 main の代わりに, 関数の「戻り値」を確かめる main を実行する。
     各行に 1 (OK) / 0 (NG) を出力させ, 0 の行に対応する説明を返す */
  const CHK_HEAD = '#include <stdio.h>\n#include <stdlib.h>\n';
  function hidden(CLab, src, hdr, impl, mainBody, what) {
    const code = CHK_HEAD + '#include "' + hdr + '"\n\nint main(void)\n{\n' + mainBody + '\n  return 0;\n}\n';
    const files = Object.assign({}, src, { '_check.c': code });
    const r = CLab.run(files, ['_check.c', impl], { stdin: '', maxSnaps: 2 });
    if (r.error) return { ok: false, msg: '戻り値のチェック中に' + (r.error.phase === 'compile' ? 'コンパイル' : '実行時') + 'エラー: ' + r.error.msg };
    const got = (r.out || '').trim().split('\n');
    for (let i = 0; i < what.length; i++) if (got[i] !== '1') return { ok: false, msg: '表示は合っていますが, 戻り値が仕様と違います — ' + what[i] };
    const lk = leakMsg([r]); if (lk) return { ok: false, msg: lk };
    return null;
  }
  const L_INS = (vs, fn) => vs.map((v) => '  ' + (fn || 'list_insert') + '(h, ' + v + ');').join('\n');

  const listTask = (o) => Object.assign({ share: ['list.c'], starter: { 'list.c': S['list.c'] } }, o);
  const treeTask = (o) => Object.assign({ share: ['tree.c'], starter: { 'tree.c': S['tree.c'] } }, o);

  /* ---- 計算時間の課題 (6-4, 6-6, 6-8, 6-11) ---- */
  const LIST_SKEL = (name, todo) => R`#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include "list.h"
#include "myrand.h"

int main(void)
{
  list_node_t *head_p = create_node(0); /* ヘッダ (ダミー) */
  clock_t clk_start, clk_end;
  int n, i, found;

  fprintf(stderr, "n = ");
  if (scanf("%d", &n) != 1 || n <= 0) {      /* (0) 正整数 n */
    fprintf(stderr, "正整数を入力してください\n");
    return 1;
  }

` + todo + R`

  list_delete(head_p);
  free(head_p);
  return 0;
}
`;
  const TREE_SKEL = R`#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include "tree.h"
#include "myrand.h"

int main(void)
{
  tree_node_t *root = NULL;
  clock_t clk_start, clk_end;
  int n, i, found;

  fprintf(stderr, "n = ");
  if (scanf("%d", &n) != 1 || n <= 0) {      /* (0) 正整数 n */
    fprintf(stderr, "正整数を入力してください\n");
    return 1;
  }

  /* TODO (1) myrand_init → clock → n 個を tree_insert_uniq で挿入 → clock → 表示 */
  /* TODO (2) myrand_init → 同じ乱数を tree_find で検索 (found を数える) */
  /* TODO (3) myrand_init を呼ばずに続けて tree_find で検索 */

  tree_delete(root);
  return 0;
}
`;
  const TODO4 = '  /* TODO (1) myrand_init → clock → n 個を list_insert_uniq で挿入 → clock → 表示 */\n  /* TODO (2) myrand_init → 同じ乱数を list_find で検索 (found を数える) */\n  /* TODO (3) myrand_init を呼ばずに続けて list_find で検索 */';
  const COLS = {
    lt4: ['(1) insert_uniq', '(2) find (hit)', '(3) find (miss)'],
    lt8: ['(1) sorted_ins2', '(2) sfind (hit)', '(3) sfind (miss)'],
    tt11: ['(1) tree insert', '(2) tree find (hit)', '(3) tree find (miss)'],
    lt6: ['(2) delete_dup', '(4) delete_dup2'],
  };
  function gccTable(tkey) {
    const tm = (D.timing || {})[tkey] || {}, cols = COLS[tkey];
    const ns = Object.keys(tm).map(Number).sort((a, b) => a - b);
    const us = (s, n) => (s / n * 1e6).toFixed(s / n * 1e6 < 10 ? 2 : 1);
    return '<div class="b6-tbl-wrap"><table class="b6-tbl"><thead><tr><th rowspan="2">n</th>' + cols.map((c) => '<th colspan="2">' + c + '</th>').join('') + '</tr><tr>' + cols.map(() => '<th>合計 [s]</th><th>1 個 [µs]</th>').join('') + '</tr></thead><tbody>' +
      ns.map((n) => '<tr><td>' + n + '</td>' + tm[n].map((s) => '<td>' + s + '</td><td class="per">' + us(s, n) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
  }
  function timeTask(o) {
    const isTree = o.tree;
    return Object.assign({
      share: [isTree ? 'tree.c' : 'list.c'],
      given: pick(isTree ? 'tree.h' : 'list.h', 'myrand.h', 'myrand.c'),
      link: [o.tfile, isTree ? 'tree.c' : 'list.c', 'myrand.c'],
      gcc: o.tfile + (isTree ? ' tree.c' : ' list.c') + ' myrand.c',
      files: [o.tfile, isTree ? 'tree.c' : 'list.c'],
      starter: Object.assign({ [o.tfile]: o.skel }, isTree ? { 'tree.c': S['tree.c'] } : { 'list.c': S['list.c'] }),
      tests: [{ stdin: '200\n', label: 'n = 200 (ブラウザ内の実行は遅いので小さめ)' }],
      check(outs, src) {
        const c = noCmt(src[o.tfile]);
        if (!/clock\s*\(\s*\)/.test(c) || !/CLOCKS_PER_SEC/.test(c)) return { ok: false, msg: o.tfile + ' で clock() と CLOCKS_PER_SEC を使って計測してください (<time.h> をインクルード)' };
        if ((c.match(/myrand_init\s*\(/g) || []).length < 2) return { ok: false, msg: 'myrand_init() を 2 回呼んでいません — 2 回目の呼び出しで (1) と同じ乱数が再び得られます' };
        for (const f of o.need) if (!new RegExp('\\b' + f + '\\s*\\(').test(c)) return { ok: false, msg: o.tfile + ' で ' + f + ' を呼んでいません' };
        const lines = (outs[0].out || '').split('\n').filter((l) => /cpu\s*=\s*[-+.\deE]+/.test(l));
        if (lines.length < o.found.length) return { ok: false, msg: '「cpu = … [sec]」の行が ' + o.found.length + ' 行必要です (今は ' + lines.length + ' 行)' };
        for (let k = 0; k < o.found.length; k++) {
          if (o.found[k] === null) continue;
          const m = /found\s*=\s*(-?\d+)/.exec(lines[k]);
          if (!m) return { ok: false, msg: (k + 1) + ' 行目の計測結果に「found = 件数」を表示してください (検索の正しさの確認用)' };
          if (+m[1] !== o.found[k]) return { ok: false, msg: (k + 1) + ' 行目: found = ' + m[1] + ' ですが, n = 200 なら ' + o.found[k] + ' になるはずです' + (o.found[k] === 0 ? ' — (3) の前に myrand_init() を呼んでいませんか?' : ' — (2) の前に myrand_init() を呼びましたか?') };
        }
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        return { ok: true, msg: o.okMsg || '計測できました。下の「考察」に gcc での計測表があります。' };
      },
      observe: () => '<p><b>gcc -O0 (この演習のサンドボックス) で計測した例</b> — 「1 個」= 合計 ÷ n。n を増やしたとき <b>1 個あたりの時間</b>がどう変わるかに注目。</p>' + gccTable(o.tkey) + '<p class="c-mute">' + o.obsHint + '</p>',
      obsLabel: '考察 (レポートに記す内容)',
      obsTitle: '考察',
      noTrace: true,
    }, o);
  }

  const tasks = [
    listTask({
      id: '6-1', label: '6-1', short: 'insert_node と list_print', files: ['list.c'], given: pick('list.h', 'list1test.c'), link: ['list1test.c', 'list.c'], gcc: 'list1test.c list.c', noKufu: true,
      title: 'insert_node (直後に挿入) と list_print (表示) を完成させる',
      spec: '<p>list.c 中の <code class="ic">list_print</code> と <code class="ic">insert_node</code> を完成させ, list1test.c が次のように動くようにせよ (入力のたびにリストの<b>先頭</b>に挿入して表示)。</p><pre class="code-mini">input = 3\n[ 3 ]\ninput = 5\n[ 5 3 ]\ninput = 4\n[ 4 5 3 ]\ninput = 3\n[ 3 4 5 3 ]</pre><ul><li><code class="ic">head_p</code> は<b>ダミー (ヘッダ)</b> の節点。データは <code class="ic">head_p-&gt;next</code> から始まる。</li><li><code class="ic">insert_node(n, val)</code>: 新しい節点を <b>n の直後</b>につなぐ (2 行)。</li><li>表示は <code class="ic">[</code> → 各要素の前に空白 → <code class="ic"> ]</code> と改行。</li></ul><p class="c-mute">レポートには遂行状況・実行結果・感想のみを記す (工夫した点は不要)。</p>',
      tests: [T('l1', '動作例 3 5 4 3', { inName: 'in.txt' }), T('l1b', '1 2 3 4 5')],
      hints: ['<code class="ic">new_node-&gt;next = n-&gt;next;</code> → <code class="ic">n-&gt;next = new_node;</code> — <b>この順番</b>。逆にすると n の次だった節点への矢印が消えて, 以降のリストが行方不明になる。', 'list_print: <code class="ic">for (p = head_p-&gt;next; p != NULL; p = p-&gt;next)</code> — ダミーは表示しない。', '<code class="ic">printf("[");</code> → ループで <code class="ic">printf(" %d", p-&gt;val);</code> → <code class="ic">printf(" ]\\n");</code>'],
      check(outs, src) {
        const b = body(noCmt(src['list.c']), 'insert_node');
        if (!/->\s*next\s*=/.test(b)) return { ok: false, msg: 'insert_node で next をつなぎ替えていません' };
        return { ok: true, msg: '新しい節点の next を先に設定 → n の next を新しい節点に。つなぎ替えの順番が正しくできています。' };
      },
      summary: 'list.c の insert_node を, 新しい節点の next に n->next を代入してから\nn->next を新しい節点にすることで n の直後に挿入するように完成させ,\nlist_print をダミーの次の節点から NULL までたどって表示するように完成\nさせた。',
      reportTitle: '課題 6.1',
    }),
    listTask({
      id: '6-2', label: '6-2', short: 'list_find (探索)', files: ['list.c'], given: pick('list.h', 'list2test.c'), link: ['list2test.c', 'list.c'], gcc: 'list2test.c list.c',
      title: '値 val を持つ節点を探す list_find',
      spec: '<p><code class="ic">list_node_t* list_find(list_node_t *head_p, int val)</code> を完成させよ。リスト中に値 val を持つ節点を探し, <b>見つかればその節点へのポインタ</b>, なければ <b>NULL</b> を返す。</p><p>list2test.c は, 入力した数がリストになければ先頭に挿入し, あれば<b>符号を反転</b>する。</p><pre class="code-mini">input = 3\n[ 3 ]\ninput = 5\n[ 5 3 ]\ninput = 4\n[ 4 5 3 ]\ninput = 3\n[ 4 5 -3 ]</pre>',
      tests: [T('l2', '動作例 3 5 4 3'), T('l2b', '7 -2 7 0 -2 -2 (符号反転の連続)')],
      hints: ['list_print と同じ for ループで走査し, <code class="ic">p-&gt;val == val</code> なら <code class="ic">return p;</code>', 'ループを抜けたら (最後まで無かったら) <code class="ic">return NULL;</code> — これを忘れると戻り値が不定。'],
      check(outs, src, CLab) {
        const hd = hidden(CLab, src, 'list.h', 'list.c', '  list_node_t *h = create_node(0), *p;\n' + L_INS([3, 5, 4]) + '\n  p = list_find(h, 5);\n  printf("%d\\n", p != NULL && p->val == 5);\n  printf("%d\\n", list_find(h, 9) == NULL);\n  printf("%d\\n", list_find(h, 3) == h->next->next->next);\n  list_delete(h);\n  printf("%d\\n", list_find(h, 3) == NULL);\n  free(h);', ['見つかったとき, その節点へのポインタを返していない', '見つからないとき NULL を返していない', '値 3 の節点そのもの (末尾の節点) のポインタになっていない', '空のリストで NULL を返していない']);
        return hd || { ok: true, msg: '見つかれば節点のポインタ, 無ければ NULL — 戻り値も隠しテストで確認済み。' };
      },
      summary: 'list.c の list_find を, ダミーの次の節点から順にたどり, 値が val の\n節点があればそのポインタを返し, 最後までなければ NULL を返すように\n完成させた。',
      reportTitle: '課題 6.2',
    }),
    listTask({
      id: '6-3', label: '6-3', short: 'list_insert_uniq', files: ['list.c'], given: pick('list.h', 'list3test.c'), link: ['list3test.c', 'list.c'], gcc: 'list3test.c list.c',
      title: '同じ値が無いときだけ先頭に挿入する list_insert_uniq',
      spec: '<p><code class="ic">list_insert_uniq(head_p, val)</code> は list_insert と同様に先頭へ挿入し, 挿入した節点へのポインタを返す。ただし<b>既に同じ値の節点があれば挿入せず</b>, その既存の節点へのポインタを返す。</p><p>最初に <code class="ic">list_find</code> を呼んで調べ, 無い場合だけ挿入すればよい。</p><pre class="code-mini">input = 3\n[ 3 ]\ninput = 5\n[ 5 3 ]\ninput = 3\n[ 5 3 ]\ninput = 4\n[ 4 5 3 ]</pre>',
      tests: [T('l3', '動作例 3 5 3 4'), T('l3b', '1 2 1 3 3 2 4')],
      hints: ['<code class="ic">list_node_t *p = list_find(head_p, val);</code>', '<code class="ic">if (p != NULL) return p;</code> → それ以外は <code class="ic">return list_insert(head_p, val);</code>'],
      check(outs, src, CLab) {
        if (!/list_find\s*\(/.test(body(noCmt(src['list.c']), 'list_insert_uniq'))) return { ok: false, msg: 'list_insert_uniq の中で list_find を呼んでください (課題の指定)' };
        const hd = hidden(CLab, src, 'list.h', 'list.c', '  list_node_t *h = create_node(0);\n  list_node_t *a = list_insert_uniq(h, 3);\n  list_node_t *b = list_insert_uniq(h, 5);\n  list_node_t *c = list_insert_uniq(h, 3);\n  printf("%d\\n", a != NULL && a->val == 3);\n  printf("%d\\n", b != NULL && b->val == 5 && h->next == b);\n  printf("%d\\n", c == a);\n  list_delete(h);\n  free(h);', ['挿入したとき, 挿入した節点へのポインタを返していない', '新しい節点が先頭に入っていない / そのポインタを返していない', '既にあるとき, 既存の節点へのポインタを返していない']);
        return hd || { ok: true, msg: '重複なら既存の節点, 新規なら挿入した節点を返す — 戻り値も確認済み。' };
      },
      summary: 'list.c の list_insert_uniq を, まず list_find で同じ値の節点を探し,\nあればそのポインタを返し, なければ list_insert で先頭に挿入してその\n節点へのポインタを返すように完成させた。',
      reportTitle: '課題 6.3',
    }),
    timeTask({
      id: '6-4', label: '6-4', short: '計算時間 list4time', tfile: 'list4time.c', tkey: 'lt4', skel: LIST_SKEL('list4time.c', TODO4),
      need: ['list_insert_uniq', 'list_find'], found: [null, 200, 0],
      title: 'list_insert_uniq / list_find の計算時間を測る list4time.c',
      spec: '<p>次の処理を行い, (1)(2)(3) それぞれの計算時間を表示する <b>list4time.c</b> を作成せよ。</p><ol start="0"><li>標準入力から正整数 n を入力する。</li><li>乱数を n 個発生させ, <code class="ic">list_insert_uniq</code> で順次挿入する。</li><li>(1) と<b>同じ</b>乱数を n 個発生させ, <code class="ic">list_find</code> で検索する。</li><li>(1) と<b>異なる</b>乱数を n 個発生させ, <code class="ic">list_find</code> で検索する。</li></ol><p>計測は <code class="ic">clk_start = clock();</code> … <code class="ic">clk_end = clock();</code> → <code class="ic">printf("cpu = %g [sec]\\n", (double) (clk_end-clk_start)/CLOCKS_PER_SEC);</code> (<code class="ic">&lt;time.h&gt;</code> が必要)。</p><p>乱数は myrand.c: 最初に <code class="ic">myrand_init()</code> → 以後 <code class="ic">myrand()</code> が毎回違う整数。もう一度 <code class="ic">myrand_init()</code> すると<b>同じ系列</b>が最初から得られる。(3) は init せずに続ける。</p><p class="c-addr">n = 5000, 10000, 15000, 20000, 25000 … で計測し, <b>データ 1 個あたりの平均時間</b>が n に対してどう増えるか, その理由を考察せよ。</p><p class="c-mute">このサイトでは (2)(3) の正しさ確認のため <code class="ic">found = 件数</code> も表示してください (n=200: hit 200 件, miss 0 件)。本番の計測は gcc で。</p>',
      hints: ['<code class="ic">myrand_init(); clk_start = clock(); for (i=0; i&lt;n; i++) list_insert_uniq(head_p, myrand()); clk_end = clock();</code>', '(2): <code class="ic">if (list_find(head_p, myrand()) != NULL) found++;</code> — found は毎回 0 に戻す。', 'gcc で: <code class="ic">gcc list4time.c list.c myrand.c</code> → <code class="ic">echo 10000 | ./a.out</code>'],
      obsHint: 'list_find は先頭から順にたどるので 1 回あたり平均 n/2 (miss なら n) 個を見る → 1 個あたりの時間は n に<b>比例</b> (合計は n² に比例: n が 2 倍で約 4 倍)。miss は最後まで走査するので hit の約 2 倍。insert_uniq も内部で list_find を呼ぶので同じ傾向。',
      summary: '乱数 n 個を list_insert_uniq で挿入する処理 (1), 同じ乱数を list_find\nで検索する処理 (2), 異なる乱数を list_find で検索する処理 (3) の計算\n時間を clock() で計測して表示する list4time.c を作成し, n = 5000〜25000\nで計測した。',
      reportTitle: '課題 6.4',
    }),
    listTask({
      id: '6-5', label: '6-5', short: 'list_insert_delete_dup', files: ['list.c'], given: pick('list.h', 'list5test.c'), link: ['list5test.c', 'list.c'], gcc: 'list5test.c list.c',
      title: 'あれば削除・無ければ挿入する list_insert_delete_dup',
      spec: '<p><code class="ic">list_insert_delete_dup(head_p, val)</code>: 同じ値の節点が<b>無ければ</b>先頭に挿入してその節点へのポインタを返す。<b>あれば</b>挿入せず, 既存のその節点を<b>削除</b>して <b>NULL</b> を返す。</p><pre class="code-mini">input = 3\n[ 3 ]\ninput = 5\n[ 5 3 ]\ninput = 3\n[ 5 ]\ninput = 4\n[ 4 5 ]\ninput = 4\n[ 5 ]</pre><p class="c-addr"><b>☆list_find, list_insert, remove_node を呼び出して実現すること。</b></p><ol><li>list_find で同じ値の節点 q を探す。</li><li>無ければ list_insert。</li><li>あれば, q の<b>直前</b>の節点 p を求め, <code class="ic">remove_node(p)</code> (p の<b>直後</b>を削除)。</li></ol>',
      tests: [T('l5', '動作例 3 5 3 4 4'), T('l5b', '1 2 3 2 1 3 4 5 4 (空になる場合を含む)')],
      hints: ['直前を探す: <code class="ic">for (p = head_p; p-&gt;next != q; p = p-&gt;next) { }</code> — ダミーから始めるので, q が先頭の節点でも p = head_p になってうまくいく。', '<code class="ic">remove_node(p); return NULL;</code>', 'remove_node の中で free しているので, 自分で free しなくてよい (二重解放になる)。'],
      check(outs, src, CLab) {
        const b = body(noCmt(src['list.c']), 'list_insert_delete_dup');
        if (!/list_find\s*\(/.test(b) || !/remove_node\s*\(/.test(b)) return { ok: false, msg: 'list_insert_delete_dup では list_find と remove_node を呼んでください (課題の指定。使わない版はオプション 6-6)' };
        const hd = hidden(CLab, src, 'list.h', 'list.c', '  list_node_t *h = create_node(0);\n  list_node_t *a = list_insert_delete_dup(h, 3);\n  list_insert_delete_dup(h, 5);\n  printf("%d\\n", a != NULL && a->val == 3);\n  printf("%d\\n", list_insert_delete_dup(h, 3) == NULL);\n  printf("%d\\n", h->next != NULL && h->next->val == 5 && h->next->next == NULL);\n  list_delete(h);\n  free(h);', ['挿入したとき, その節点へのポインタを返していない', '削除したとき NULL を返していない', '削除後のリストが [ 5 ] になっていない']);
        const lk = leakMsg(outs);
        return hd || (lk ? { ok: false, msg: lk } : { ok: true, msg: 'list_find → 直前の節点 → remove_node。削除時は NULL を返すことも確認済み。' });
      },
      summary: 'list.c の list_insert_delete_dup を, list_find で同じ値の節点を探し,\nなければ list_insert で先頭に挿入してそのポインタを返し, あればその\n直前の節点をダミーから順にたどって求め, remove_node で削除して NULL\nを返すように完成させた。',
      reportTitle: '課題 6.5',
    }),
    listTask({
      id: 'o6-6', label: 'Opt-6', short: '1 回の走査 delete_dup2', optional: true, files: ['list.c', 'list6test.c'], given: pick('list.h'), link: ['list6test.c', 'list.c'], gcc: 'list6test.c list.c',
      starter: { 'list.c': S['list.c'], 'list6test.c': (G['list5test.c'] || '').replace('list_insert_delete_dup(', '/* TODO: list_insert_delete_dup2 に変える */ list_insert_delete_dup(') },
      title: 'list_find を使わず 1 回の走査で同じ動作をする list_insert_delete_dup2',
      spec: '<p>課題 6-5 の list_insert_delete_dup を改良し, <b>list_find を呼ばずに, リストを一度走査するだけで</b>同じ動作をする <code class="ic">list_insert_delete_dup2</code> を作成せよ。</p><p>list5test.c の関数名を list_insert_delete_dup2 に変えた <b>list6test.c</b> を作成し, 動作を確認せよ。</p><p class="c-mute">計算時間の比較 (list6time.c) は次の課題 Opt-6t。</p>',
      tests: [T('l5', '動作例 3 5 3 4 4'), T('l5b', '1 2 3 2 1 3 4 5 4')],
      hints: ['ポイントは「<b>先読み</b>」: p を進めながら <code class="ic">p-&gt;next-&gt;val</code> を調べる。見つかった時点で p は<b>直前</b>の節点なので, そのまま <code class="ic">remove_node(p)</code> できる。', '<code class="ic">for (p = head_p; p-&gt;next != NULL; p = p-&gt;next) { if (p-&gt;next-&gt;val == val) { remove_node(p); return NULL; } }</code>', 'ループを最後まで抜けたら無かったので <code class="ic">return insert_node(head_p, val);</code>'],
      check(outs, src, CLab) {
        if (!/list_insert_delete_dup2\s*\(/.test(noCmt(src['list6test.c']))) return { ok: false, msg: 'list6test.c で list_insert_delete_dup2 を呼んでください' };
        const b = body(noCmt(src['list.c']), 'list_insert_delete_dup2');
        if (/list_find\s*\(/.test(b) || /list_insert_delete_dup\s*\(/.test(b)) return { ok: false, msg: 'list_insert_delete_dup2 の中で list_find (や 6-5 の関数) を呼ばないでください — 走査は 1 回だけ' };
        const hd = hidden(CLab, src, 'list.h', 'list.c', '  list_node_t *h = create_node(0);\n  list_node_t *a = list_insert_delete_dup2(h, 3);\n  list_insert_delete_dup2(h, 5);\n  printf("%d\\n", a != NULL && a->val == 3);\n  printf("%d\\n", list_insert_delete_dup2(h, 3) == NULL);\n  printf("%d\\n", h->next != NULL && h->next->val == 5 && h->next->next == NULL);\n  list_delete(h);\n  free(h);', ['挿入したとき, その節点へのポインタを返していない', '削除したとき NULL を返していない', '削除後のリストが [ 5 ] になっていない']);
        const lk = leakMsg(outs);
        return hd || (lk ? { ok: false, msg: lk } : { ok: true, msg: '先読み (p->next->val) で直前の節点を保ったまま 1 回の走査で削除できました。' });
      },
      summary: 'list_find を呼ばずに, ダミーから p->next->val を先読みしながら一度だけ\n走査し, 同じ値があればその直前の節点 p に対して remove_node を呼んで\nNULL を返し, なければ先頭に挿入する list_insert_delete_dup2 を作成し,\nこれを呼ぶ list6test.c を作成した。',
      reportTitle: 'オプション課題 6.6',
    }),
    timeTask({
      id: 'o6-6t', label: 'Opt-6t', short: '時間比較 list6time', optional: true, tfile: 'list6time.c', tkey: 'lt6',
      skel: LIST_SKEL('list6time.c', '  /* TODO (1) myrand_init → n 個を list_insert で挿入 (計測しない) */\n  /* TODO (2) myrand_init → 同じ乱数で list_insert_delete_dup (計測して表示) */\n  /* TODO (3) myrand_init → n 個を list_insert で挿入 */\n  /* TODO (4) myrand_init → 同じ乱数で list_insert_delete_dup2 (計測して表示) */').replace('int n, i, found;', 'int n, i;'),
      need: ['list_insert', 'list_insert_delete_dup', 'list_insert_delete_dup2'], found: [null, null],
      title: 'list_insert_delete_dup と dup2 の計算時間を比べる list6time.c',
      spec: '<p>次の処理を行い, <b>(2) と (4)</b> の計算時間を表示する <b>list6time.c</b> を作成せよ。</p><ol start="0"><li>標準入力から正整数 n。</li><li>乱数 n 個を <code class="ic">list_insert</code> で挿入。</li><li>(1) と同じ乱数 n 個で <code class="ic">list_insert_delete_dup</code> (= 全部削除される)。</li><li>(1) と同じ乱数 n 個を <code class="ic">list_insert</code> で挿入。</li><li>(1) と同じ乱数 n 個で <code class="ic">list_insert_delete_dup2</code>。</li></ol><p class="c-addr">なぜ処理時間に違いが出るのか, 考察をレポートに記せ。</p><p class="c-mute">課題 Opt-6 の list_insert_delete_dup2 が必要です (list.c は共通)。</p>',
      hints: ['(1)(3) は計測しない (準備)。(2)(4) だけ clock() で挟む。', '各段階の前に必ず <code class="ic">myrand_init();</code> — (2) で (1) と同じ値を消すため。', '(2) が終わるとリストは空になるので, (3) でもう一度同じリストを作ってから (4) を測る。'],
      obsHint: 'delete_dup は list_find で 1 回走査した後, 直前の節点を探すためにもう一度先頭から走査する (約 2 回分)。delete_dup2 は先読みで 1 回の走査で済むので, 処理時間はおよそ半分になる。どちらも 1 回あたり O(n) なので合計は n² に比例する点は同じ。',
      summary: '乱数 n 個を list_insert で挿入した後, 同じ乱数で list_insert_delete_dup\nを呼ぶ処理 (2) と, 再度挿入した後 list_insert_delete_dup2 を呼ぶ処理\n(4) の計算時間を clock() で計測する list6time.c を作成し, n = 5000〜\n25000 で比較した。',
      reportTitle: 'オプション課題 6.6 (計算時間)',
    }),
    listTask({
      id: 'o6-7', label: 'Opt-7', short: '昇順に挿入 sorted_insert_uniq', optional: true, files: ['list.c'], given: pick('list.h', 'list7test.c'), link: ['list7test.c', 'list.c'], gcc: 'list7test.c list.c',
      title: '値の昇順を保って挿入する list_sorted_insert_uniq',
      spec: '<p>list_insert_uniq と同様にリストに無い値だけを挿入するが, リスト中で節点が<b>値の昇順</b>に並ぶ位置に挿入する <code class="ic">list_sorted_insert_uniq(head_p, val)</code> を作成せよ。</p><p>ここでは<b>まず list_find</b> で同じ値があるか判定し, なければ挿入する。</p><pre class="code-mini">input = 3\n[ 3 ]\ninput = 5\n[ 3 5 ]\ninput = 3\n[ 3 5 ]\ninput = 7\n[ 3 5 7 ]\ninput = 4\n[ 3 4 5 7 ]</pre>',
      tests: [T('l7', '動作例 3 5 3 7 4'), T('l7b', '9 2 7 2 -1 8 0 9 (負の数・先頭/末尾への挿入)')],
      hints: ['挿入位置 = 「次の節点の値が val 以上になる直前」。<code class="ic">for (p = head_p; p-&gt;next != NULL &amp;&amp; p-&gt;next-&gt;val &lt; val; p = p-&gt;next) { }</code>', 'ループ後 <code class="ic">return insert_node(p, val);</code> — insert_node は「p の直後」に入れる関数なので, ちょうどよい。', '<code class="ic">&amp;&amp;</code> の左右の順番に注意: <code class="ic">p-&gt;next != NULL</code> を先に調べないと NULL の val を読んでしまう。'],
      check(outs, src, CLab) {
        if (!/list_find\s*\(/.test(body(noCmt(src['list.c']), 'list_sorted_insert_uniq'))) return { ok: false, msg: 'list_sorted_insert_uniq ではまず list_find を呼んでください (課題の指定。使わない版は Opt-8)' };
        const hd = hidden(CLab, src, 'list.h', 'list.c', '  list_node_t *h = create_node(0);\n  list_node_t *a = list_sorted_insert_uniq(h, 5);\n  list_node_t *b = list_sorted_insert_uniq(h, 2);\n  printf("%d\\n", b != NULL && b->val == 2 && h->next == b);\n  printf("%d\\n", list_sorted_insert_uniq(h, 5) == a);\n  list_delete(h);\n  free(h);', ['挿入した節点へのポインタを返していない (または昇順の位置でない)', '既にあるとき, 既存の節点へのポインタを返していない']);
        return hd || { ok: true, msg: '「次の値が val 以上になる直前」に insert_node — 先頭・末尾・途中のどこにでも正しく入ります。' };
      },
      summary: 'list_find で同じ値の節点を探し, あればそのポインタを返し, なければ\nダミーから p->next->val < val である間たどって挿入位置の直前の節点 p\nを求め, insert_node で p の直後に挿入する list_sorted_insert_uniq を\n作成した。',
      reportTitle: 'オプション課題 6.7',
    }),
    listTask({
      id: 'o6-8', label: 'Opt-8', short: 'sorted_insert_uniq2 / sorted_find', optional: true, files: ['list.c', 'list8test.c'], given: pick('list.h'), link: ['list8test.c', 'list.c'], gcc: 'list8test.c list.c',
      starter: { 'list.c': S['list.c'], 'list8test.c': (G['list7test.c'] || '').replace('list_sorted_insert_uniq(', '/* TODO: list_sorted_insert_uniq2 に変える */ list_sorted_insert_uniq(') },
      title: '1 回の走査で昇順挿入する sorted_insert_uniq2 と, 途中で打ち切る sorted_find',
      spec: '<ol><li>Opt-7 の list_sorted_insert_uniq を改良し, <b>list_find を呼ばずに一度の走査で</b>同じ動作をする <code class="ic">list_sorted_insert_uniq2</code> を作成せよ。list7test.c の関数名を変えた <b>list8test.c</b> で動作を確認せよ。</li><li>リストが<b>ソートされている</b>ことを利用し, データが無いと判断できた時点で走査を打ち切る <code class="ic">list_sorted_find</code> を作成せよ。</li></ol><p class="c-mute">list_sorted_find は表示に出ないので, 戻り値を隠しテストで確かめます。計算時間の比較は Opt-8t。</p>',
      tests: [T('l7', '動作例 3 5 3 7 4'), T('l7b', '9 2 7 2 -1 8 0 9')],
      hints: ['Opt-7 の挿入位置ループの後で <code class="ic">if (p-&gt;next != NULL &amp;&amp; p-&gt;next-&gt;val == val) return p-&gt;next;</code> — 同じ値はちょうど挿入位置の次にあるはず。', 'sorted_find: <code class="ic">for (p = head_p-&gt;next; p != NULL &amp;&amp; p-&gt;val &lt;= val; p = p-&gt;next)</code> — val より大きい値が出たらその先にはもう無い。'],
      check(outs, src, CLab) {
        const c = noCmt(src['list.c']);
        if (!/list_sorted_insert_uniq2\s*\(/.test(noCmt(src['list8test.c']))) return { ok: false, msg: 'list8test.c で list_sorted_insert_uniq2 を呼んでください' };
        if (/list_find\s*\(/.test(body(c, 'list_sorted_insert_uniq2'))) return { ok: false, msg: 'list_sorted_insert_uniq2 の中で list_find を呼ばないでください — 走査は 1 回だけ' };
        if (/list_find\s*\(/.test(body(c, 'list_sorted_find'))) return { ok: false, msg: 'list_sorted_find は list_find を呼ばずに, 昇順を利用して自分で走査してください' };
        const hd = hidden(CLab, src, 'list.h', 'list.c', '  list_node_t *h = create_node(0), *a;\n  list_sorted_insert_uniq2(h, 5);\n  a = list_sorted_insert_uniq2(h, 2);\n  list_sorted_insert_uniq2(h, 8);\n  printf("%d\\n", a != NULL && a->val == 2 && h->next == a);\n  printf("%d\\n", list_sorted_insert_uniq2(h, 2) == a);\n  printf("%d\\n", list_sorted_find(h, 5) != NULL && list_sorted_find(h, 5)->val == 5);\n  printf("%d\\n", list_sorted_find(h, 8) == h->next->next->next);\n  printf("%d\\n", list_sorted_find(h, 3) == NULL && list_sorted_find(h, 1) == NULL && list_sorted_find(h, 9) == NULL);\n  list_delete(h);\n  free(h);', ['sorted_insert_uniq2: 挿入した節点へのポインタを返していない', 'sorted_insert_uniq2: 既にあるとき既存の節点を返していない', 'sorted_find: 途中の値 5 が見つからない', 'sorted_find: 末尾の値 8 の節点を返していない', 'sorted_find: 無い値 (間・最小より小・最大より大) で NULL を返していない']);
        return hd || { ok: true, msg: '1 回の走査で挿入・重複判定, sorted_find は打ち切りあり — 戻り値も確認済み。' };
      },
      summary: '挿入位置を求める一度の走査の後, 次の節点が同じ値ならそのポインタを\n返し, そうでなければ挿入する list_sorted_insert_uniq2 と, 昇順である\nことを利用して val より大きい値に達した時点で走査を打ち切る\nlist_sorted_find を作成し, list8test.c で動作を確認した。',
      reportTitle: 'オプション課題 6.8',
    }),
    timeTask({
      id: 'o6-8t', label: 'Opt-8t', short: '時間比較 list8time', optional: true, tfile: 'list8time.c', tkey: 'lt8',
      skel: LIST_SKEL('list8time.c', TODO4.replace('list_insert_uniq', 'list_sorted_insert_uniq2').replace(/list_find/g, 'list_sorted_find')),
      need: ['list_sorted_insert_uniq2', 'list_sorted_find'], found: [null, 200, 0],
      title: 'ソート版で計算時間を測る list8time.c (list4time.c と比較)',
      spec: '<p>課題 6-4 の list4time.c の <code class="ic">list_insert_uniq</code> を <code class="ic">list_sorted_insert_uniq2</code> に, <code class="ic">list_find</code> を <code class="ic">list_sorted_find</code> に変えた <b>list8time.c</b> を作成し, list4time.c との実行時間の違いを計測せよ。</p><p class="c-addr">なぜそのような結果になるか, 考察をレポートに記せ。</p>',
      hints: ['list4time.c をコピーして関数名を 3 か所変えるだけ。', '比較は同じ n で list4time と list8time を並べて。'],
      obsHint: '昇順リストでも先頭から順にたどる点は同じなので, 1 回あたりは平均 n/2 個を見る O(n) のまま。miss は「val より大きい値」で打ち切れるので n が小さいうちは速くなるが, 実測では n が大きいと hit も miss も list4time より遅くなった (1 節点ごとの比較が増える・値の順とメモリ上の配置がばらばらでキャッシュが効きにくい, などが考えられる)。整列しても<b>リストでは二分探索ができない</b> (途中の要素へ直接飛べない) ので速くならない。',
      summary: 'list4time.c の list_insert_uniq を list_sorted_insert_uniq2 に, list_find\nを list_sorted_find に変えた list8time.c を作成し, n = 5000〜25000 で\nlist4time.c と計算時間を比較した。',
      reportTitle: 'オプション課題 6.8 (計算時間)',
    }),
    treeTask({
      id: '6-9', label: '6-9', short: '二分木 uniq と昇順表示', files: ['tree.c'], given: pick('tree.h', 'tree9test.c'), link: ['tree9test.c', 'tree.c'], gcc: 'tree9test.c tree.c', noKufu: true,
      title: '二分木: 重複を挿入しない tree_insert_uniq と, 昇順に表示する tree_print',
      spec: '<p>tree9test.c は整数を次々に二分木へ挿入し, 各時点の内容を表示する。原型の tree.c でも動くが,</p><ol type="a"><li>二分木中に既にあるデータを入力すると, <b>それが挿入されてしまう</b>。</li><li>表示が<b>データの昇順にならない</b>。</li></ol><p>という問題がある。(1) tree_insert_uniq, (2) tree_print を修正せよ。</p><pre class="code-mini">input = 3\n[ 3 ]\ninput = 5\n[ 3 5 ]\ninput = 3\n[ 3 5 ]\ninput = 4\n[ 3 4 5 ]</pre><p class="c-mute">レポートには遂行状況・実行結果・感想のみを記す。</p>',
      tests: [T('t9', '動作例 3 5 3 4'), T('t9b', '5 3 8 1 4 7 9 3 8 2 6')],
      hints: ['(1) 原型の最後の <code class="ic">else</code> は「val &gt;= n-&gt;data」— 同じ値も右へ入ってしまう。<code class="ic">else if (val &gt; n-&gt;data)</code> にすれば, 等しいときは何もしない。', '(2) 二分探索木は「左 &lt; 自分 &lt; 右」。<b>左 → 自分 → 右</b> の順 (中間順 / inorder) に表示すれば昇順になる。printf を 2 つの再帰呼び出しの<b>間</b>へ。'],
      check(outs, src) {
        const b = body(noCmt(src['tree.c']), 'tree_print');
        const iL = b.search(/tree_print\s*\(\s*n\s*->\s*left/), iP = b.search(/printf/), iR = b.search(/tree_print\s*\(\s*n\s*->\s*right/);
        if (iL >= 0 && iP >= 0 && iR >= 0 && !(iL < iP && iP < iR)) return { ok: false, msg: 'tree_print: 左 → 表示 → 右 の順 (中間順) にしてください' };
        return { ok: true, msg: '等しい値は挿入しない + 中間順 (左→自分→右) で昇順表示。' };
      },
      summary: 'tree.c の tree_insert_uniq の最後の else を else if (val > n->data) に\n変えて同じ値を挿入しないようにし, tree_print を左部分木 → 自分 → 右\n部分木の順 (中間順) に表示するように修正して, 値の昇順に表示される\nようにした。',
      reportTitle: '課題 6.9',
    }),
    treeTask({
      id: 'o6-10', label: 'Opt-10', short: '二分木 tree_find', optional: true, files: ['tree.c'], given: pick('tree.h', 'tree10test.c'), link: ['tree10test.c', 'tree.c'], gcc: 'tree10test.c tree.c',
      title: '二分木中に値 val の節点を探す tree_find',
      spec: '<p><code class="ic">tree_node_t* tree_find(tree_node_t *root, int val)</code> を完成させよ。root を根とする二分木中に値 val を持つ節点を探し, 見つかればその節点のポインタ, なければ NULL を返す。</p><pre class="code-mini">input = 3\n[ 3 ]\ninput = 5\n[ 3 5 ]\ninput = 4\n[ 3 4 5 ]\ninput = 5\n[ 3 4 5 ]</pre><p class="c-mute">tree.c は課題 6-9 と共通です (6-9 を先に)。</p>',
      tests: [T('t10', '動作例 3 5 4 5'), T('t10b', '5 3 8 5 1 8 4')],
      hints: ['大小比較で<b>片方の部分木だけ</b>に進む: <code class="ic">val &lt; n-&gt;data</code> なら左, 大きければ右, 等しければ見つかった。', 'ループ版: <code class="ic">while (n != NULL) { if (val == n-&gt;data) return n; n = (val &lt; n-&gt;data) ? n-&gt;left : n-&gt;right; } return NULL;</code>', '再帰版でもよい (<code class="ic">return tree_find(n-&gt;left, val);</code>)。'],
      check(outs, src, CLab) {
        const hd = hidden(CLab, src, 'tree.h', 'tree.c', '  tree_node_t *r = NULL;\n  int v[] = {5, 3, 8, 1, 4, 9}, i;\n  for (i = 0; i < 6; i++) r = tree_insert_uniq(r, v[i]);\n  printf("%d\\n", tree_find(r, 5) == r);\n  printf("%d\\n", tree_find(r, 4) == r->left->right);\n  printf("%d\\n", tree_find(r, 9) == r->right->right);\n  printf("%d\\n", tree_find(r, 7) == NULL && tree_find(r, 0) == NULL && tree_find(NULL, 1) == NULL);\n  tree_delete(r);', ['根の値 5 で根を返していない', '値 4 (左の右) の節点を返していない', '値 9 (右の右) の節点を返していない', '無い値 / 空の木で NULL を返していない']);
        return hd || { ok: true, msg: '比較で左右どちらか一方へ — 根から葉まで 1 本の道をたどるだけで見つかる / 無いと分かる。' };
      },
      summary: 'tree.c の tree_find を, 根から始めて val が節点の値より小さければ\n左, 大きければ右の子へ進み, 等しければその節点を返し, NULL に達し\nたら NULL を返すように完成させた。',
      reportTitle: 'オプション課題 6.10',
    }),
    timeTask({
      id: 'o6-11', label: 'Opt-11', short: '二分木の計算時間', optional: true, tree: true, tfile: 'tree11time.c', tkey: 'tt11', skel: TREE_SKEL,
      need: ['tree_insert_uniq', 'tree_find'], found: [null, 200, 0],
      title: '課題 6-4 と同じ処理を二分木で行う tree11time.c',
      spec: '<p>課題 6-4 と同じ処理 (乱数 n 個を挿入 / 同じ乱数を検索 / 異なる乱数を検索) を二分木 (<code class="ic">tree_insert_uniq</code>, <code class="ic">tree_find</code>) で行う <b>tree11time.c</b> を作成せよ。</p><p class="c-addr">n = 5000, 10000, … で計測し, データ 1 個あたりの平均時間が n の増加に対してどう増えるか, その理由を考察せよ。</p><p class="c-mute">tree.c は 6-9 / Opt-10 と共通 (tree_find が必要)。</p>',
      hints: ['list4time.c の list_… を tree_… に。ただし二分木は <code class="ic">root = tree_insert_uniq(root, myrand());</code> と<b>戻り値を root に代入</b> (最初は root が NULL)。', '<code class="ic">if (tree_find(root, myrand()) != NULL) found++;</code>'],
      obsHint: '二分探索木は比較のたびに左右の片方だけに進むので, 乱数のように偏りのないデータなら木の高さは約 log₂n。1 回あたりの時間は O(log n) で, n を 5 倍にしても 1 個あたりの時間はほとんど増えない (リストの O(n) と比べて桁違いに速い)。ただしソート済みのデータを入れると木が一直線になり O(n) に落ちる。',
      summary: '乱数 n 個を tree_insert_uniq で二分木に挿入する処理 (1), 同じ乱数を\ntree_find で検索する処理 (2), 異なる乱数を検索する処理 (3) の計算時間\nを clock() で計測する tree11time.c を作成し, n = 5000〜25000 で計測\nした。',
      reportTitle: 'オプション課題 6.11',
    }),
  ];
  tasks.forEach((t) => { t.solution = D.sol[t.id] || {}; });
  window.B6_TASKS = tasks;
})();
