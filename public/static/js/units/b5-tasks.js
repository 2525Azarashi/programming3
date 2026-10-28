/* B5 動的割当て — 課題定義 (出典: 配布資料「[B5] 動的割当て」) */
(function () {
  'use strict';
  const R = String.raw;
  const D = window.B5_DATA || { sol: {}, given: {}, exp: {}, inp: {} };
  const G = D.given || {}, E = D.exp || {}, I = D.inp || {};
  const pick = (...ks) => { const o = {}; ks.forEach((k) => (o[k] = G[k])); return o; };
  const T = (k, label, extra) => Object.assign({ stdin: I[k], expect: E[k], label }, extra || {});

  /* ---- 判定の補助 ---- */
  const HP = (r) => (r && r.heap) || { sizes: [], leaks: [] };
  const u8 = (s) => new TextEncoder().encode(s).length;
  const body = (src, fn) => { const m = new RegExp('\\b' + fn + '\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\n\\}').exec(src || ''); return m ? m[1] : ''; };
  const noCmt = (s) => (s || '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  function leakMsg(outs) {
    const r = outs.find((x) => HP(x).leaks.length);
    if (!r) return null;
    const L = HP(r).leaks;
    return 'free 忘れ (メモリリーク) があります: 終了時に ' + L.length + ' ブロック (' + L.reduce((a, b) => a + b.n, 0) + ' バイト) が返却されていません' + (L[0].loc ? ' — 例: ' + L[0].loc.file + ':' + L[0].loc.line + ' で確保した領域' : '');
  }
  const has = (sizes, n) => sizes.includes(n);
  function subseq(sizes, want) { let k = 0; for (const s of sizes) if (s === want[k]) k++; return k === want.length; }
  const firstDiff = (a, b) => { const x = a.split('\n'), y = b.split('\n'); for (let i = 0; i < Math.max(x.length, y.length); i++) if (x[i] !== y[i]) return i + 1; return 0; };

  const PREF_H = R`#define NAMELEN 15

typedef struct {
  char name[NAMELEN+1];   /* 県名 */
  double area;            /* 面積 (km2)*/
  int population;         /* 人口 (人) */
} pref_t;

/* TODO: pref.c に作る関数のプロトタイプ宣言を書く */
`;
  const PREF_C = R`#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "pref.h"

/* TODO: pref_t *pref_new(char *name, double area, int population) */

/* TODO: void pref_print(pref_t* p) */
`;
  const ISTACK_C = R`#include <stdio.h>
#include <stdlib.h>
#include "istack.h"

/* (1) サイズ size のスタックを新たに作り, そのポインタを返す */
istack_t *istack_new(int size)
{
  istack_t *s = NULL;
  /* TODO: s を malloc → size, sp, data を初期化 (data も malloc) */
  return s;
}

/* (1) スタックを破棄する */
void istack_delete(istack_t *s)
{
  /* TODO: s->data → s の順に free */
}

/* (2) 以降の関数をここに追加していく */
`;
  const AS_START = R`#include <stdio.h>
#include <stdlib.h>

/* 標準入力から n と n 個の整数を読み込み, malloc した配列に格納して返す */
int* new_array_scan(int *pn)
{
  int *a = NULL;
  int n, i;

  /* TODO: 1. n を読む  2. malloc  3. n 個読む  4. *pn = n  5. return */

  return a;
}
`;
  const prefShare = ['pref.c', 'pref.h'];
  const stShare = ['istack.c'];
  const stTask = (o) => Object.assign({ files: ['istack.c'], share: stShare, starter: { 'istack.c': ISTACK_C } }, o);

  /* istack: new/delete の作法 (2 ブロック・size*4 バイト・解放漏れなし) */
  function stackCheck(outs, src, extra) {
    const c = noCmt(src['istack.c']);
    const nb = body(c, 'istack_new');
    if (!/malloc\s*\(/.test(nb)) return { ok: false, msg: 'istack_new の中で malloc を使っていません (構造体と data 配列の 2 つを動的に割り当てる)' };
    if (!/NULL/.test(nb) || !/exit\s*\(\s*1\s*\)/.test(nb)) return { ok: false, msg: 'istack_new: malloc が失敗した場合 (NULL) に stderr へ出力して exit(1) する処理がありません' };
    const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk + '。istack_delete で <b>s->data を free してから s を free</b> していますか?' };
    if (extra) return extra(c);
    return { ok: true, msg: 'malloc 2 回 (構造体 + data 配列) → free 2 回 (data → 構造体) の順で, リークなし。' };
  }

  const tasks = [
    {
      id: '5-1', label: '5-1', short: 'new_array_scan', files: ['array_scan.c'], share: ['array_scan.c'], given: pick('array_scan_main.c'), link: ['array_scan_main.c', 'array_scan.c'], gcc: 'array_scan_main.c array_scan.c',
      title: '標準入力から n と n 個の整数を読み込み, malloc した配列で返す new_array_scan',
      spec: '<p>次の処理を行う関数 <code class="ic">int* new_array_scan(int *pn)</code> を作成し, <b>array_scan.c</b> に格納せよ。</p><ol><li>標準入力からまず整数 n (読み込むデータの数) を読み込む。</li><li>サイズ n の int 型配列を割り当てる。</li><li>n 個の整数を標準入力からその配列に読み込む。</li><li><code class="ic">*pn</code> に n をセットする。</li><li>その配列の先頭要素へのポインタを返す。</li></ol><p class="c-addr"><b>☆必ず malloc を使用すること。</b>(サイズ固定の配列や C99 の可変長配列は不可)</p><p>in.txt の最後の 99 は<b>読まれない</b> (n = 8 なので)。</p>',
      starter: { 'array_scan.c': AS_START },
      tests: [T('a1', 'in.txt (n=8, 最後の 99 は読まない)', { inName: 'in.txt', expName: 'exp.txt' }), T('a2', '負の数・0 を含む (n=3)')],
      hints: ['<code class="ic">scanf("%d", &amp;n);</code> → <code class="ic">a = malloc(sizeof(int)*n);</code> — バイト数は「1 要素のバイト数 × 要素数」。', 'malloc が NULL を返したら <code class="ic">fprintf(stderr, …); exit(1);</code> (例題 5-1 と同じ形)。', '<code class="ic">pn</code> は main の n の<b>番地</b>。<code class="ic">*pn = n;</code> で main の n に個数が入る (B3 のポインタ引数)。'],
      check(outs, src) {
        const c = noCmt(src['array_scan.c']);
        if (/\bint\s+\w+\s*\[/.test(body(c, 'new_array_scan'))) return { ok: false, msg: 'new_array_scan の中で配列が宣言されています。malloc で割り当ててください' };
        if (!/malloc\s*\(/.test(c)) return { ok: false, msg: 'malloc を使っていません' };
        if (!has(HP(outs[0]).sizes, 32) || !has(HP(outs[1]).sizes, 12)) return { ok: false, msg: '割り当てたバイト数が sizeof(int)*n になっていません (n=8 なら 32 バイト)' };
        return { ok: true, msg: 'n=8 で 32 バイト (= sizeof(int)×8), n=3 で 12 バイトを malloc で借りています。' };
      },
      summary: '標準入力から読み込んだデータ数 n の大きさの int 型配列を malloc で割り\n当て、n 個の整数を読み込んで *pn に n をセットし、配列の先頭要素への\nポインタを返す関数 new_array_scan を array_scan.c に作成した。',
      reportTitle: '課題 5.1',
    },
    {
      id: '5-2', label: '5-2', short: '出現回数 distr', files: ['distr.c', 'array_scan.c'], share: ['array_scan.c'], link: ['distr.c', 'array_scan.c'], gcc: 'distr.c array_scan.c',
      title: 'サイズ max-min+1 の配列を malloc して数値の出現回数を数える distr.c',
      spec: '<ol><li>課題 5-1 の <code class="ic">new_array_scan</code> で標準入力から数値の配列を得る。</li><li>データの最大値 max と最小値 min を求める。</li><li>サイズ <b>max-min+1</b> の int 型配列を malloc で割り当て, 出現回数を数える (データ i の回数を第 <code class="ic">i-min</code> 要素に。<b>初期化を忘れない</b>)。</li><li>出現回数が 1 以上のものだけを <code class="ic">値: 回数</code> の形で表示する。</li></ol><p class="c-addr"><b>☆必ず new_array_scan を用い, 必ずサイズ max-min+1 の配列を malloc で割り当てること。</b></p><p class="c-mute">array_scan.c は課題 5-1 と共通です。</p>',
      starter: { 'array_scan.c': AS_START, 'distr.c': R`#include <stdio.h>
#include <stdlib.h>

int* new_array_scan(int *pn);

int main(void)
{
  int *a = NULL;     /* 読み込んだデータ */
  int *cnt = NULL;   /* 出現回数 (サイズ max-min+1) */
  int n, i, max, min;

  a = new_array_scan(&n);
  /* TODO: max, min → cnt を malloc → 0 で初期化 → 数える → 表示 → free */

  free(a);
  a = NULL;
  return 0;
}
` },
      tests: [T('d1', 'in.txt 1'), T('d2', 'in.txt 2'), T('d3', 'in.txt 3 (21 億付近)'), T('d4', '負の数を含む')],
      hints: ['max, min は a[0] から始めて, for で更新。', '<code class="ic">cnt = malloc(sizeof(int)*(max-min+1));</code> の後, <b>全要素を 0 に</b>。malloc 直後の中身は不定 (このサイトでは読むとエラーになる)。', '数える: <code class="ic">cnt[a[i]-min]++;</code> / 表示: <code class="ic">printf("%d: %d\\n", i+min, cnt[i]);</code>', 'テスト 3 は 2147483640 と 2147483641。<code class="ic">int cnt[2147483642]</code> のような固定配列では無理 — 動的割当ての出番。'],
      check(outs, src) {
        const c = noCmt(src['distr.c']);
        if (!/new_array_scan\s*\(/.test(c)) return { ok: false, msg: 'distr.c で new_array_scan を使っていません' };
        const want = [4, 201, 2, 6].map((k) => k * 4);
        const bad = outs.findIndex((r, k) => !has(HP(r).sizes, want[k]));
        if (bad >= 0) return { ok: false, msg: 'テスト ' + (bad + 1) + ': サイズ max-min+1 (' + want[bad] / 4 + ' 要素 = ' + want[bad] + ' バイト) のカウント用配列が malloc されていません' };
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        return { ok: true, msg: 'どのテストでも max-min+1 要素ちょうどの配列を借りて, 返しています (テスト 3 は 2 要素 = 8 バイト)。' };
      },
      summary: '課題 5.1 の new_array_scan で読み込んだデータの最大値 max と最小値 min\nを求め、サイズ max-min+1 の配列を malloc で割り当てて 0 で初期化し、\nデータ i の出現回数を第 i-min 要素に数えて、1 回以上のものだけを表示\nする distr.c を作成した。',
      reportTitle: '課題 5.2',
    },
    {
      id: '5-3', label: '5-3', short: 'strdouble', files: ['strdouble.c'], given: pick('strdouble_main.c', 'strclone.c'), link: ['strdouble_main.c', 'strdouble.c'], gcc: 'strdouble_main.c strdouble.c',
      title: '文字列を 2 回繰り返した文字列を, ちょうどのサイズで割り当てて返す strdouble',
      spec: '<p>文字配列 s の文字列の<b>2 倍の長さ</b>の文字列をちょうど格納できるサイズの文字配列を動的に割り当て, s の文字列を 2 回繰り返したものをコピーして, その先頭要素へのポインタを返す関数 <code class="ic">char *strdouble(char s[])</code> を作成し, strdouble.c に格納せよ。</p><pre class="spec-pre">s[10]        \'a\' \'b\' \'c\' \'\\0\'\nstrdouble(s) \'a\' \'b\' \'c\' \'a\' \'b\' \'c\' \'\\0\'</pre><p class="c-addr"><b>strdouble の中では strcpy と strcat を用いてはならない。</b></p><p class="c-mute">例題 5-2 の strclone.c はタブで閲覧できます。</p>',
      starter: { 'strdouble.c': R`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* s の文字列を 2 回繰り返した文字列を, ちょうどのサイズで割り当てて返す */
char *strdouble(char s[])
{
  char *d = NULL;

  /* TODO: 長さ 2*strlen(s) + 1 の配列を malloc → 1 文字ずつコピー → '\0' */

  return d;
}
` },
      tests: [T('sd1', 'in.txt', { inName: 'in.txt', expName: 'exp.txt' }), T('sd2', '1 文字 / 5 文字')],
      hints: ['必要なバイト数は「文字数 2 倍 + <b>終端 \'\\0\' の 1</b>」: <code class="ic">malloc(sizeof(char)*(2*len+1))</code>', '<code class="ic">d[i] = s[i]; d[len+i] = s[i];</code> を i = 0〜len-1 で。', '最後に <code class="ic">d[2*len] = \'\\0\';</code> を忘れると, printf が文字列の終わりを見つけられない。'],
      check(outs, src) {
        const b = noCmt(body(src['strdouble.c'], 'strdouble'));
        if (/\bstr(cpy|cat|ncpy|ncat)\s*\(/.test(b)) return { ok: false, msg: 'strdouble の中で strcpy / strcat が使われています (禁止)' };
        if (!has(HP(outs[0]).sizes, 7) || !has(HP(outs[0]).sizes, 21)) return { ok: false, msg: '割り当てサイズが「ちょうど」ではありません: "abc" なら 2×3+1 = 7 バイト, "1234567890" なら 21 バイト' };
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        return { ok: true, msg: '"abc" に 7 バイト, "1234567890" に 21 バイト — 2 倍 + \\0 のちょうどのサイズです。' };
      },
      summary: '文字列 s の長さ len を strlen で求め、2*len+1 バイトの文字配列を\nmalloc で割り当てて、strcpy や strcat を使わずに s を 2 回 1 文字ずつ\nコピーし、最後に \'\\0\' を付けて返す関数 strdouble を作成した。',
      reportTitle: '課題 5.3',
    },
    {
      id: '5-4', label: '5-4', short: '行の逆順 linereverse', files: ['linereverse.c'], link: ['linereverse.c'], gcc: 'linereverse.c',
      title: 'fgets で読んだ各行をちょうどのサイズで malloc し, 逆順に出力する linereverse.c',
      spec: '<p>標準入力から複数行 (EOF で終了) の文字列を読み込み, <b>行の逆順</b>に出力するプログラム linereverse.c を作成せよ。</p><ul><li>行の読み込みには <code class="ic">fgets(s, LINELEN, stdin)</code> を用いる。入力がなくなると (EOF ではなく) <b>NULL</b> を返す。読んだ文字列の最後には改行 \'\\n\' が含まれる。</li><li><code class="ic">char *line[…]</code> (char へのポインタの配列) は通常の配列で良い。行数がサイズを超えたらエラーメッセージを出す。</li><li>1 行読むごとに, <b>そのデータをちょうど格納できるサイズ</b>の文字配列を割り当ててコピーし, その先頭を line[0], line[1], … に格納する。</li><li>最後に全ての文字列を <b>free</b> すること。</li></ul>',
      starter: { 'linereverse.c': R`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define LINELEN 128

/* いまは「そのまま出力する」だけのプログラム (資料の fgets の使用例) */
int main(void)
{
  char s[LINELEN+1];
  while (fgets(s, LINELEN, stdin) != NULL) {
    printf("%s", s);
  }
  /* TODO: line[] に malloc したコピーを貯めて, 逆順に出力 → free */
  return 0;
}
` },
      tests: [T('lr1', '空港リスト (8 行)'), T('lr2', '空行・最後に改行なし')],
      hints: ['<code class="ic">char *line[MAXLINE];</code> と行数 <code class="ic">n</code>。読んだら <code class="ic">line[n] = malloc(strlen(s)+1);</code> <code class="ic">strcpy(line[n], s); n++;</code>', '<code class="ic">s</code> を直接 line[n] に入れる (<code class="ic">line[n] = s;</code>) と, 全部が同じ配列 s を指してしまい, 最後の行しか残らない!', '出力は <code class="ic">for (i=n-1; i&gt;=0; i--)</code>。最後に <code class="ic">for</code> で全部 free。', '最後の行に改行がないと, 逆順にしたとき 1 行目にくっつく… (テスト 2) — 期待値は gcc の実行結果そのもの。'],
      check(outs, src) {
        const c = noCmt(src['linereverse.c']);
        if (!/fgets\s*\(/.test(c)) return { ok: false, msg: 'fgets を使って行を読み込んでください' };
        const bad = outs.findIndex((r, k) => {
          const lines = ([I.lr1, I.lr2][k].match(/[^\n]*\n|[^\n]+$/g) || []).map((l) => u8(l) + 1);
          return !subseq(HP(r).sizes, lines);
        });
        if (bad >= 0) return { ok: false, msg: 'テスト ' + (bad + 1) + ': 各行を「ちょうど格納できるサイズ」(strlen(s)+1 バイト) で malloc していません' };
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        return { ok: true, msg: '各行を strlen+1 バイトちょうどで借り, 逆順に出力して全部返しました。' };
      },
      summary: 'fgets で 1 行ずつ読み込み、その行をちょうど格納できる strlen+1 バイト\nの文字配列を malloc で割り当ててコピーし、ポインタの配列 line に格納\nしてから、line[n-1] から line[0] の順に出力し、最後に全て free する\nlinereverse.c を作成した。',
      reportTitle: '課題 5.4',
    },
    {
      id: '5-5', label: '5-5', short: 'pref_new / pref_print', files: ['pref.c', 'pref.h'], share: prefShare, given: pick('pref1main.c', 'pref0.c'), link: ['pref1main.c', 'pref.c'], gcc: 'pref1main.c pref.c',
      title: '構造体を動的に割り当てる pref_new と, 出力する pref_print (pref.c / pref.h)',
      spec: '<p>例題 5-3 (pref0.c, タブで閲覧可) を次のように書き換えよ。</p><ol><li>動的割当てと値の代入を関数 <code class="ic">pref_t *pref_new(char *name, double area, int population)</code> として独立させる。pref_t 型の変数を動的に割り当て, name, area, population を代入し, そのポインタを返す。</li><li>出力の処理を関数 <code class="ic">void pref_print(pref_t* p)</code> として独立させる。</li></ol><p>2 つの関数を <b>pref.c</b> に格納し, 配布の pref1main.c とリンクして実行せよ。<b>必要な pref.h も作成</b>して提出すること。</p><p class="c-mute">pref.c / pref.h は 5-5〜5-7 で共通です。</p>',
      starter: { 'pref.c': PREF_C, 'pref.h': PREF_H },
      tests: [T('p1', 'pref1main.c')],
      hints: ['pref.h に typedef と<b>プロトタイプ宣言 2 つ</b>。pref1main.c も pref.c も <code class="ic">#include "pref.h"</code> する。', '<code class="ic">pref_t *p = malloc(sizeof(pref_t));</code> — 構造体 1 つ分のバイト数。', 'name は配列メンバーなので <code class="ic">strncpy(p-&gt;name, name, NAMELEN);</code>。p はポインタなので <code class="ic">-&gt;</code>。', '書式は例題と同じ <code class="ic">"%-10s %9.2f %9d\\n"</code>。'],
      check(outs, src) {
        const hh = noCmt(src['pref.h']);
        if (!/pref_new\s*\(/.test(hh) || !/pref_print\s*\(/.test(hh)) return { ok: false, msg: 'pref.h に pref_new と pref_print のプロトタイプ宣言を書いてください' };
        if (!/malloc\s*\(\s*sizeof\s*\(\s*pref_t\s*\)/.test(noCmt(body(src['pref.c'], 'pref_new')))) return { ok: false, msg: 'pref_new の中で malloc(sizeof(pref_t)) を使って構造体を割り当ててください' };
        return { ok: true, msg: '3 つの県を pref_new で 1 つずつヒープに作り, main が free しています。' };
      },
      summary: 'pref_t 型の変数を malloc で動的に割り当てて県名・面積・人口を代入し、\nそのポインタを返す関数 pref_new と、出力する関数 pref_print を pref.c\nに作成し、型定義とプロトタイプ宣言を pref.h にまとめた。',
      reportTitle: '課題 5.5',
    },
    {
      id: '5-6', label: '5-6', short: '配列 p[3] で pref2main', files: ['pref2main.c', 'pref.c', 'pref.h'], share: prefShare, given: pick('pref1main.c'), link: ['pref2main.c', 'pref.c'], gcc: 'pref2main.c pref.c',
      title: '変数 a, b, c の代わりにポインタの配列 p[3] を使う pref2main.c',
      spec: '<p>課題 5-5 の pref1main.c を次のように書き換えよ (<b>pref2main.c</b> として提出)。</p><ol><li>変数 a, b, c の代わりに, 配列 <code class="ic">p[3]</code> を用いる。</li><li>出力と領域の解放は <b>for ループ</b>を用いて行う。</li></ol><p>pref.c とリンクして実行し, 課題 5-5 と同じ出力が得られることを確認せよ。</p>',
      starter: { 'pref.c': PREF_C, 'pref.h': PREF_H, 'pref2main.c': R`#include <stdlib.h>
#include "pref.h"
int main(void)
{
  /* TODO: pref_t へのポインタの配列 p[3] を宣言 */

  /* TODO: p[0], p[1], p[2] に pref_new の結果を代入 */

  /* TODO: for で pref_print, for で free */

  return 0;
}
` },
      tests: [T('p1', '課題 5-5 と同じ出力')],
      hints: ['宣言は <code class="ic">pref_t *p[3];</code> — 「pref_t へのポインタ」が 3 つ並んだ配列。', '<code class="ic">p[0] = pref_new("Tokyo", 2187.65, 12988797);</code> …', '<code class="ic">for (i=0; i&lt;3; i++) { pref_print(p[i]); }</code> / 解放も同様に <code class="ic">free(p[i]); p[i] = NULL;</code>'],
      check(outs, src) {
        const c = noCmt(src['pref2main.c']);
        if (!/pref_t\s*\*\s*p\s*\[\s*3\s*\]/.test(c)) return { ok: false, msg: 'pref_t へのポインタの配列 p[3] を宣言してください (pref_t *p[3];)' };
        if (/pref_t\s*\*\s*[abc]\b/.test(c)) return { ok: false, msg: '変数 a, b, c がまだ残っています' };
        if (!/for\s*\([^)]*\)\s*\{?[^}]*pref_print\s*\(\s*p\s*\[/.test(c) || !/for\s*\([^)]*\)\s*\{?[^}]*free\s*\(\s*p\s*\[/.test(c)) return { ok: false, msg: '出力 (pref_print) と解放 (free) を for ループで行ってください' };
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        return { ok: true, msg: 'p[0]〜p[2] がそれぞれヒープの pref_t を指し, for でまとめて出力・解放できました。' };
      },
      summary: 'pref1main.c の変数 a, b, c の代わりに pref_t へのポインタの配列 p[3]\nを用い、出力と領域の解放を for ループで行う pref2main.c を作成し、\npref.c とリンクして課題 5.5 と同じ出力が得られることを確認した。',
      reportTitle: '課題 5.6',
    },
    {
      id: '5-7', label: '5-7', short: 'pref_new_scan と逆順', files: ['pref3main.c', 'pref.c', 'pref.h'], share: prefShare, link: ['pref3main.c', 'pref.c'], gcc: 'pref3main.c pref.c',
      title: '標準入力から県を読む pref_new_scan と, 逆順に出力する pref3main.c',
      spec: '<p>関数 <code class="ic">pref_t *pref_new_scan()</code> を作成し, pref.h, pref.c に追加せよ。pref_t 型の変数を動的に割り当て, 標準入力から name, area, population を読み込み, そのポインタを返す。<b>EOF を検出すると NULL を返す</b>。</p><p>これを用いて, 次の処理を行う <b>pref3main.c</b> を作成せよ。</p><ol><li>標準入力から県のデータを EOF になるまで読み込む。</li><li>読み込んだのと<b>逆順</b>に標準出力に出力する。</li></ol><p>県の数の上限は 47 としてよい (<b>pref3main.c の中で #define</b> せよ)。</p>',
      starter: { 'pref.c': PREF_C, 'pref.h': PREF_H, 'pref3main.c': R`#include <stdio.h>
#include <stdlib.h>
#include "pref.h"

/* TODO: 県の数の上限 47 を #define */

int main(void)
{
  /* TODO: pref_new_scan が NULL を返すまで読む → 逆順に pref_print → free */
  return 0;
}
` },
      tests: [T('p3', 'in.txt (8 県)', { inName: 'in.txt', expName: 'exp.txt' }), T('p3b', '1 県だけ')],
      hints: ['<code class="ic">if (scanf("%15s %lf %d", p-&gt;name, &amp;p-&gt;area, &amp;p-&gt;population) != 3)</code> なら EOF。<b>借りた p を free してから</b> NULL を返す (返さないとリーク)。', 'main: <code class="ic">while ((q = pref_new_scan()) != NULL) { p[n] = q; n++; }</code> — 代入の式をカッコで囲んでから != で比較。', '逆順は課題 5-4 と同じ <code class="ic">for (i=n-1; i&gt;=0; i--)</code>。'],
      check(outs, src) {
        if (!/pref_new_scan\s*\(/.test(noCmt(src['pref.h']))) return { ok: false, msg: 'pref.h に pref_new_scan のプロトタイプ宣言を追加してください' };
        if (!/#define\s+\w+\s+47\b/.test(src['pref3main.c'] || '')) return { ok: false, msg: 'pref3main.c で県の数の上限 47 を #define してください' };
        if (!/pref_new_scan\s*\(/.test(noCmt(src['pref3main.c']))) return { ok: false, msg: 'pref3main.c で pref_new_scan を使ってください' };
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk + '。EOF で NULL を返すとき, 割り当てた領域を free していますか?' };
        return { ok: true, msg: 'EOF を検出するまで読み, 逆順に出力。EOF のとき借りた領域も返せています (リークなし)。' };
      },
      summary: '標準入力から 1 県分のデータを動的に割り当てた pref_t に読み込み、EOF\nのときは領域を free して NULL を返す関数 pref_new_scan を pref.c に追加\nし、これを用いて EOF まで読み込んだ県を逆順に出力する pref3main.c を\n作成した。',
      reportTitle: '課題 5.7',
    },
    stTask({
      id: '5-8-1', label: '5-8(1)', short: 'istack_new / delete', given: pick('istack.h', 'istack1main.c'), link: ['istack1main.c', 'istack.c'], gcc: 'istack1main.c istack.c',
      title: '整数スタックを作る istack_new と, 破棄する istack_delete',
      spec: '<p><code class="ic">istack_t *istack_new(int size)</code> はサイズ size の整数型スタックを新たに作り, そのポインタを返す。</p><ol><li>malloc で <code class="ic">istack_t</code> 型の変数を 1 つ割り当てる (失敗したらその旨を stderr に出力して <code class="ic">exit(1)</code>)。</li><li>size には引数 size, sp は 0, data にはサイズ size の int 型配列を割り当てた先頭へのポインタ (失敗したら exit(1))。</li></ol><p><code class="ic">void istack_delete(istack_t *s)</code> は, まず <b>s-&gt;data</b> の指す配列を, 次に <b>s</b> の指す構造体を解放する。</p><p class="c-mute">istack.c は 5-8 (1)〜(6) で共通。istack.h はタブで閲覧できます。</p>',
      tests: [T('s1', 'istack1main.c')],
      hints: ['<code class="ic">s = malloc(sizeof(istack_t));</code> → <code class="ic">s-&gt;data = malloc(sizeof(int)*size);</code> — malloc は 2 回。', '解放の順番が大事: 先に <code class="ic">free(s)</code> すると, その後の <code class="ic">s-&gt;data</code> は返却済みの領域を読むことになる (このサイトではエラー)。', '「メモリで追う」で, ヒープに 2 つのブロックができて矢印でつながる様子を見よう。'],
      check: (outs, src) => stackCheck(outs, src),
      summary: 'istack_t 型の構造体と、サイズ size の int 型配列 data の 2 つを malloc\nで割り当てて初期化する istack_new と、data → 構造体の順に解放する\nistack_delete を istack.c に作成した。',
      reportTitle: '課題 5.8 (1)',
    }),
    stTask({
      id: '5-8-2', label: '5-8(2)', short: 'istack_push', given: pick('istack.h', 'istack2main.c'), link: ['istack2main.c', 'istack.c'], gcc: 'istack2main.c istack.c',
      title: 'データを末尾に追加する istack_push (満杯なら何もしない)',
      spec: '<p><code class="ic">void istack_push(istack_t *s, int d)</code> は, データを記憶する配列の末尾に d を追加する。</p><ol><li>最初のデータが data[0] に, 次が data[1] に, … と格納されるようにせよ。<b>sp はスタックが保持しているデータ数</b>であることに留意。</li><li>スタックが満杯 (データ数が size に等しい) の場合には何も行わない。</li></ol><p class="c-mute">(5) で size を拡張するように改良した後も, このテストは「拡張版の出力」として合格になります。</p>',
      tests: [{ stdin: '', label: 'istack2main.c' }],
      hints: ['次に入れる場所は <code class="ic">s-&gt;data[s-&gt;sp]</code>。入れたら <code class="ic">s-&gt;sp++;</code>', '満杯の判定は <code class="ic">s-&gt;sp == s-&gt;size</code>。そのときは <code class="ic">return;</code>', '期待値: 5, 6, 2, 8 の後の 3, 3 は入らない → 最後も [ 5 6 2 8 ]。'],
      check(outs, src) {
        const o = outs[0].out;
        if (o !== E.s2 && o !== E.s2r) return { ok: false, msg: '期待値と違います (' + firstDiff(o, E.s2) + ' 行目)。期待値:<br><code class="ic">' + U.esc(E.s2).replace(/\n/g, '<br>') + '</code>' };
        return stackCheck(outs, src, () => ({ ok: true, msg: o === E.s2 ? '満杯のときは何もしない版として正しく動いています。' : '(5) の拡張版として正しい出力です (満杯で size が 8 に拡張)。' }));
      },
      summary: 'data[sp] にデータ d を格納して sp を 1 増やし、スタックが満杯 (sp が\nsize に等しい) のときは何もしない関数 istack_push を istack.c に追加し\nた。',
      reportTitle: '課題 5.8 (2)',
    }),
    stTask({
      id: '5-8-3', label: '5-8(3)', short: 'istack_pop', given: pick('istack.h', 'istack3main.c'), link: ['istack3main.c', 'istack.c'], gcc: 'istack3main.c istack.c',
      title: '末尾のデータを返して削除する istack_pop (空なら 0)',
      spec: '<p><code class="ic">int istack_pop(istack_t *s)</code> は, 配列の末尾の要素を返し, スタックからそのデータを削除する。スタックが空の場合には削除を行わず, <b>0 を返す</b>。</p>',
      tests: [T('s3', 'istack3main.c')],
      hints: ['末尾の要素は <code class="ic">s-&gt;data[s-&gt;sp - 1]</code>。', '<code class="ic">s-&gt;sp--;</code> してから <code class="ic">return s-&gt;data[s-&gt;sp];</code> と書くと 1 行で済む。値は消さなくて良い (sp より後ろは「無いもの」扱い)。', '空の判定 <code class="ic">s-&gt;sp == 0</code> を最初に。'],
      check: (outs, src) => stackCheck(outs, src),
      summary: 'スタックが空のときは 0 を返し、そうでなければ sp を 1 減らして\ndata[sp] を返す関数 istack_pop を istack.c に追加した。',
      reportTitle: '課題 5.8 (3)',
    }),
    stTask({
      id: '5-8-4', label: '5-8(4)', short: 'empty / full', given: pick('istack.h', 'istack4main.c'), link: ['istack4main.c', 'istack.c'], gcc: 'istack4main.c istack.c',
      title: '空かどうか istack_empty, 満杯かどうか istack_full',
      spec: '<p><code class="ic">int istack_empty(istack_t *s)</code> はスタックが空のとき 1 を, そうでないとき 0 を返す。<br><code class="ic">int istack_full(istack_t *s)</code> はスタックが満杯のとき 1 を, そうでないとき 0 を返す。</p>',
      tests: [T('s4', 'istack4main.c')],
      hints: ['C の比較演算子の結果はそのまま 1 か 0: <code class="ic">return s-&gt;sp == 0;</code>', 'push / pop の中の判定もこの関数で書き直すと読みやすい。'],
      check: (outs, src) => stackCheck(outs, src),
      summary: 'sp が 0 のとき 1 を返す istack_empty と、sp が size に等しいとき 1 を\n返す istack_full を istack.c に追加した。',
      reportTitle: '課題 5.8 (4)',
    }),
    stTask({
      id: '5-8-5', label: '5-8(5)', short: 'realloc で拡張', given: pick('istack.h', 'istack5main.c'), link: ['istack5main.c', 'istack.c'], gcc: 'istack5main.c istack.c',
      title: 'istack_push を改良し, 満杯なら size を 2 倍に realloc する',
      spec: '<p>満杯の istack に対して istack_push を呼び出した場合には, <b>size を 2 倍</b>にし, data の要素数も 2 倍になるように data の<b>再割当て</b>を行って, プッシュされたデータを収容できるようにせよ。動的領域の再割り当ては <code class="ic">realloc</code> 関数 (教科書 p. 135) で行える。</p><pre class="spec-pre">新しい番地 = realloc(元の番地, 新しいバイト数);</pre>',
      tests: [T('s5', 'istack5main.c')],
      hints: ['<code class="ic">int *p = realloc(s-&gt;data, sizeof(int)*s-&gt;size*2);</code> — 中身はコピーされ, <b>番地が変わることがある</b>。必ず戻り値を data に入れ直す。', 'NULL チェックしてから <code class="ic">s-&gt;data = p; s-&gt;size *= 2;</code>', '「メモリで追う」: realloc で新しいブロックに中身が移り, 古いブロックが返却される様子が見える。'],
      check: (outs, src) => stackCheck(outs, src, (c) => {
        if (!/realloc\s*\(/.test(body(c, 'istack_push')) && !/malloc\s*\(/.test(body(c, 'istack_push'))) return { ok: false, msg: 'istack_push の中で realloc (または malloc + コピー) を使って data を拡張してください' };
        if (!has(HP(outs[0]).sizes, 32)) return { ok: false, msg: 'data を 2 倍 (4 要素 → 8 要素 = 32 バイト) に再割当てしていません' };
        return { ok: true, msg: '16 バイト → 32 バイトに再割当てされ, 中身 5 6 2 8 もそのまま引き継がれました。' };
      }),
      summary: 'istack_push でスタックが満杯の場合に、realloc で data の大きさを 2 倍\nに再割り当てして size も 2 倍にし、プッシュされたデータを収容できる\nように改良した。',
      reportTitle: '課題 5.8 (5)',
    }),
    stTask({
      id: '5-8-6', label: '5-8(6)', short: 'istacktest.c', given: pick('istack.h', 'istacktest.c'), link: ['istacktest.c', 'istack.c'], gcc: 'istacktest.c istack.c',
      title: '完成した istack.c をテストプログラム istacktest.c で確かめる',
      spec: '<p>完成した istack.c を配布のテストプログラム <b>istacktest.c</b> (タブで閲覧可) とリンクして実行し, 期待値が出力されることを確認せよ。</p><p>push を合計 70 回以上, size は 4 → 8 → 16 → 32 → 64 と拡張され, 2 つめのスタック s2 も同時に使われる。空のときの pop (0 を返す) も含む総合テスト。</p>',
      tests: [T('st', 'istacktest.c (44 行)')],
      hints: ['(1)〜(5) が全部合格していれば, そのまま通るはず。', '途中の pop(s) = 1521 は 39² — push を 40 回まとめて (NO_PRINT) 行った後なので。', '最後に s2, s の 2 つとも delete される。リークがないか判定が確かめます。'],
      check: (outs, src) => stackCheck(outs, src, () => ({ ok: true, msg: 'size 4 → 64 まで拡張しても正しく動き, 2 つのスタックとも全部返却できました。' })),
      summary: '完成した istack.c を istacktest.c とリンクして実行し、size の拡張を含\nむ push / pop と empty / full の結果が期待値と一致することを確認した。',
      reportTitle: '課題 5.8 (6)',
    }),
    {
      id: 'o5-1', label: 'Opt-1', short: '1 次元で行列 matrixd', files: ['matrixd.c'], optional: true, given: pick('matrixd.h', 'matrixd3test.c'), link: ['matrixd3test.c', 'matrixd.c'], gcc: 'matrixd3test.c matrixd.c',
      title: 'サイズ n*n の 1 次元配列で行列を表す動的割当て版 matrixd.c',
      spec: '<p>n が変数のときの n×n 行列の代わりに, サイズ <b>n*n の 1 次元配列</b>を割り当て, 2 次元配列の <code class="ic">[i][j]</code> 要素を 1 次元配列の <code class="ic">[i*n+j]</code> 要素で表す。この方法で B4 課題 4-1 の matrix.c の動的割当て版 <b>matrixd.c</b> を作れ。</p><ul><li><code class="ic">double *matrixd_new(int n)</code> / <code class="ic">void matrixd_delete(double *A)</code></li><li><code class="ic">matrixd_print</code> / <code class="ic">matrixd_scan</code> / <code class="ic">matrixd_sum</code> (課題 4-1 (1)(2)(3) に相当)</li></ul>',
      starter: { 'matrixd.c': R`#include <stdio.h>
#include <stdlib.h>
#include "matrixd.h"

/* TODO: matrixd_new / matrixd_delete / matrixd_print / matrixd_scan / matrixd_sum
   [i][j] 要素は A[i*n+j] */
` },
      tests: [T('md', 'n=5 (in.txt)', { inName: 'in.txt', expName: 'exp.txt' })],
      hints: ['<code class="ic">malloc(sizeof(double)*n*n)</code> を 1 回。', '<code class="ic">A[i*n+j]</code> — i 行目の先頭は i*n 番目 (B4 の「行優先」と同じ計算を自分でする)。', 'print の書式は 4-1 (1) と同じ <code class="ic">" %9.5f"</code>。'],
      check(outs, src) {
        if (/\[\s*\w+\s*\]\s*\[/.test(noCmt(src['matrixd.c']))) return { ok: false, msg: '2 次元配列 [ ][ ] を使わず, A[i*n+j] で表してください' };
        if (!has(HP(outs[0]).sizes, 200)) return { ok: false, msg: 'n=5 のとき 5*5*sizeof(double) = 200 バイトを割り当てていません' };
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        return { ok: true, msg: '200 バイト (= 25 要素) の 1 次元配列を 3 つ借りて行列として使えました。' };
      },
      summary: 'サイズ n*n の double 型 1 次元配列を malloc で割り当て、2 次元配列の\n[i][j] 要素を [i*n+j] 要素として扱う、行列の動的割当て版 matrixd.c\n(new, delete, print, scan, sum) を作成した。',
      reportTitle: 'オプション課題 5.1',
    },
    {
      id: 'o5-2', label: 'Opt-2', short: 'ポインタの配列 matrixdd', files: ['matrixdd.c'], optional: true, given: pick('matrixdd.h', 'matrixdd3test.c'), link: ['matrixdd3test.c', 'matrixdd.c'], gcc: 'matrixdd3test.c matrixdd.c',
      title: '1 次元配列を指すポインタの配列で行列を表す matrixdd.c (A[i][j] で書ける)',
      spec: '<p>2 次元配列を動的に割り当てる別の方法として, <b>1 次元配列を指すポインタの配列</b>を用いる方法がある。<code class="ic">A[1]</code> の指す 1 次元配列の第 2 要素は <code class="ic">A[1][2]</code> と書ける。</p><ul><li><code class="ic">double **matrixdd_new(int n)</code> / <code class="ic">void matrixdd_delete(int n, double **A)</code></li><li><code class="ic">matrixdd_print</code> / <code class="ic">matrixdd_scan</code> / <code class="ic">matrixdd_sum</code></li></ul><p class="c-addr">matrixdd_delete では, <b>データの配列を全て解放した後に</b>ポインタの配列を解放すること。</p>',
      starter: { 'matrixdd.c': R`#include <stdio.h>
#include <stdlib.h>
#include "matrixdd.h"

/* TODO: matrixdd_new: ポインタの配列 (n 個) → 各行の double 配列 (n 個ずつ)
   TODO: matrixdd_delete: 各行を free → ポインタの配列を free
   TODO: print / scan / sum は A[i][j] で書ける */
` },
      tests: [T('mdd', 'n=5 (in.txt)', { inName: 'in.txt', expName: 'exp.txt' })],
      hints: ['<code class="ic">A = malloc(sizeof(double *)*n);</code> — 要素は「double へのポインタ」。', '<code class="ic">for (i…) A[i] = malloc(sizeof(double)*n);</code>', 'delete の順番: 先に A を free すると A[i] が読めなくなる。'],
      check(outs, src) {
        const c = noCmt(src['matrixdd.c']);
        if (!/sizeof\s*\(\s*double\s*\*\s*\)/.test(c)) return { ok: false, msg: 'ポインタの配列を malloc(sizeof(double *)*n) で割り当ててください' };
        if (HP(outs[0]).sizes.length < 18) return { ok: false, msg: '行列 1 つにつき「ポインタの配列 1 + 行 n 個」= 6 回の malloc が必要です (3 つで 18 回)' };
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        return { ok: true, msg: '行列 1 つ = ポインタの配列 1 + 行 5 本 = 6 ブロック。3 つで 18 ブロック, すべて返却できました。' };
      },
      summary: 'double へのポインタの配列と各行の double 型配列を malloc で割り当て、\nA[i][j] で要素にアクセスできる行列の動的割当て版 matrixdd.c を作成し、\ndelete では各行を解放してからポインタの配列を解放するようにした。',
      reportTitle: 'オプション課題 5.2',
    },
  ];
  tasks.forEach((t) => { t.solution = D.sol[t.id] || {}; });
  window.B5_TASKS = tasks;
})();
