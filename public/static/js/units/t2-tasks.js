/* =========================================================================
 *  T2 中間試験対策 — 模擬問題 (本番形式: 4 問 × 5 点 × 3 回 + 腕試し 2 問)
 *  出典: 「2026 年度 プログラミング実習 III 中間試験 T2 について」(T2-yokoku.pdf)
 *  期待値はすべて gcc (Linux / glibc) で模範解答を実行して求めたもの (tools/gen_t2.py)。
 *  採点は本番と同じく:
 *    1) 問題文の入力 diff -Bw
 *    2) 表示していない入力 (隠しテスト) diff -Bw + 終了ステータス
 *    3) 題意チェック (malloc の sizeof・バイト数 / メモリリーク / 二分探索かどうか)
 * ========================================================================= */
(function () {
  'use strict';
  const R = String.raw;
  const D = window.T2_DATA || { files: {}, tests: {} };
  const F = D.files || {}, TS = D.tests || {};
  const pick = (...n) => { const o = {}; n.forEach((k) => (o[k] = F[k])); return o; };

  /* diff -Bw 相当: 空白を全部無視, 空行を無視 */
  const bw = (s) => String(s || '').replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+/g, '')).filter(Boolean).join('\n');
  const strip = (s) => String(s || '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const HP = (r) => (r && r.heap) || { sizes: [], leaks: [] };
  const u8 = (s) => new TextEncoder().encode(s).length;

  function leakCheck(r, label) {
    const lk = HP(r).leaks;
    if (lk.length) {
      return (label || '実行終了時') + ' に free 忘れ (メモリリーク) が ' + lk.length + ' ブロック (' + lk.reduce((a, b) => a + b.n, 0) + ' バイト) あります。不要になった節点や配列を free していますか?';
    }
    return null;
  }

  /* 隠しテスト + メモリリーク + 題意チェック */
  function hidden(key, units, src, CL, extra) {
    // まず表示テスト (outs[0]) も含め全ケースを走らせて heap 情報も確認
    const allCases = TS[key] || [];
    const allRuns = [];
    for (let idx = 0; idx < allCases.length; idx++) {
      const tc = allCases[idx];
      const r = CL.run(src, units, { stdin: tc.stdin, maxSnaps: 2, maxOps: 60000000 });
      allRuns.push(r);
      const isHidden = idx >= 1;
      const lab = isHidden
        ? '隠しテスト ' + idx + ' (入力: ' + (tc.stdin.trim().replace(/\n/g, ' ⏎ ').slice(0, 40) || '空') + ')'
        : '問題文の入力';
      if (r.error) return { ok: false, msg: lab + ' で実行時エラー: ' + r.error.msg };
      if (bw(r.out) !== bw(tc.expect)) {
        const L = (t) => String(t || '').replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '');
        const E = L(tc.expect), A = L(r.out);
        let k = 0;
        while (k < Math.max(E.length, A.length) && (E[k] || '').replace(/\s+/g, '') === (A[k] || '').replace(/\s+/g, '')) k++;
        const show = (x) => (x === undefined ? '(行がない)' : U.esc(x));
        return { ok: false, msg: lab + ' で期待値と一致しません (' + (k + 1) + ' 行目)。期待値: <code class="ic">' + show(E[k]) + '</code> / あなたの出力: <code class="ic">' + show(A[k]) + '</code>' };
      }
      if ((r.exit || 0) !== tc.exit) {
        return { ok: false, msg: lab + ' で終了ステータスが ' + (r.exit || 0) + ' です (期待: ' + tc.exit + ')。' };
      }
      const lm = leakCheck(r, lab);
      if (lm) return { ok: false, msg: '<b>メモリ管理チェック</b>: ' + lm };
    }
    const v = extra ? extra(src, allRuns) : null;
    if (v) return { ok: false, msg: '<b>厳格採点チェック (T2 基準)</b>: ' + v };
    return { ok: true, msg: '隠しテスト ' + Math.max(0, allCases.length - 1) + ' 件・メモリチェック・厳格題意チェックをすべて通過 — <b>本番なら 5 点</b>!' };
  }

  /* T2 予告の厳格ルール1: malloc の sizeof チェック */
  function checkMallocSizeof(code, typeName) {
    const c = strip(code);
    if (!/\bmalloc\s*\(/.test(c)) {
      return '<code class="ic">malloc</code> を呼び出して動的に領域を割り当てていません。';
    }
    const re = new RegExp('sizeof\\s*\\(\\s*' + typeName + '\\s*\\)');
    if (!re.test(c)) {
      return 'T2 予告の注意: <b><code class="ic">sizeof(' + typeName + ')</code> を使わずに直接バイト数を指定した場合 (または型が違う場合) は不正解 (0 点)</b> になります。';
    }
    if (!/NULL/.test(c) || !/exit\s*\(\s*1\s*\)/.test(c)) {
      return 'サンプルプログラムにならい、<code class="ic">malloc</code> の返り値が <code class="ic">NULL</code> のとき <code class="ic">fprintf(stderr, ...)</code> して <code class="ic">exit(1)</code> する検査を入れよう。';
    }
    return null;
  }

  /* T2 予告の厳格ルール2: 二分探索かどうかのチェック (線形探索は出力が合っても 0 点!) */
  function checkBinarySearch(code) {
    const c = strip(code);
    if (/\bbsearch\s*\(/.test(c)) {
      return '標準ライブラリの <code class="ic">bsearch</code> ではなく、自分で二分探索のループを書こう。';
    }
    // 線形探索パターン: i++ / i-- で 0 から n まで回す for / while
    const hasMidDiv = /\/\s*2\b|>>\s*1\b/.test(c);
    const hasNarrow = /\+\s*1\b/.test(c) && /-\s*1\b/.test(c);
    if (!hasMidDiv || !hasNarrow) {
      return 'T2 予告の注意: <b>実行結果が正しくても二分探索ができていない (線形探索になっている等) 場合は不正解 (0 点)</b> です。中央の添字 <code class="ic">(low + high) / 2</code> を求め、比較結果に応じて <code class="ic">low = mid + 1</code> または <code class="ic">high = mid - 1</code> と範囲を半分に絞ろう。';
    }
    return null;
  }

  const vis = (key, base) => [{ stdin: TS[key][0].stdin, expect: TS[key][0].expect, inName: base + '-in.txt', expName: base + '-exp.txt', label: '問題文の入力' }];

  const tasks = [
    /* ======================= 第 1 回 ======================= */
    {
      id: 'q1', set: 1, label: '1-問1', short: 'malloc で逆順配列 darray', files: ['darray.c'], given: pick('darray.h', 'darraymain.c'), link: ['darraymain.c', 'darray.c'], gcc: 'darraymain.c darray.c',
      title: 'n 個の double 配列を malloc で割り当て逆順に格納する darray.c (5 点)',
      spec: '<p>関数 <code class="ic">double *darray_rev(int n, double a[])</code> を <code class="ic">darray.c</code> に作成せよ。</p><ul><li>要素数 <code class="ic">n</code> の <code class="ic">double</code> 型配列を <code class="ic">malloc</code> でちょうど必要なバイト数だけ動的に割り当てる (<code class="ic">NULL</code> 検査を行い、失敗時は stderr にメッセージを出して <code class="ic">exit(1)</code>)。</li><li>割り当てた配列の先頭から順に、<code class="ic">a[n-1], a[n-2], ..., a[0]</code> を格納し、その先頭ポインタを返す。</li></ul><div class="callout warn" style="margin-top:10px"><b>厳格採点</b>: <code class="ic">sizeof(double)</code> を使わずに <code class="ic">8 * n</code> のように書いたり、余分な要素数を確保した場合は <b>0 点</b>とする。</div><div class="req"><span class="chip">重点: 課題(5-1)</span><span class="chip ptr">malloc + sizeof</span><span class="chip">分割コンパイル</span></div>',
      starter: { 'darray.c': R`#include <stdio.h>
#include <stdlib.h>
#include "darray.h"

double *darray_rev(int n, double a[])
{
  double *b = NULL;
  /* ここを完成させよ */
  return b;
}
` },
      solution: pick('darray.c'),
      tests: vis('darray', 'darray'),
      check: (outs, src, CL) => hidden('darray', ['darraymain.c', 'darray.c'], src, CL, (s, runs) => {
        const m = checkMallocSizeof(s['darray.c'], 'double');
        if (m) return m;
        // 入力1: n=4 -> 32B, n=3 -> 24B (double は interp 内で 8B)
        const sz = HP(runs[0]).sizes;
        if (sz[0] !== 32 || sz[1] !== 24) {
          return '割り当てたバイト数が <code class="ic">sizeof(double) * n</code> と一致しません (n=4 で ' + (sz[0] || 0) + ' バイト確保されています。期待: 32 バイト)。';
        }
        return null;
      }),
      hints: [
        '確保は <code class="ic p">b = malloc(sizeof(double) * n);</code> — <b>sizeof(double)</b> が必須!',
        'サンプルプログラムの <code class="ic">if (b == NULL) { fprintf(stderr, "malloc failed\\n"); exit(1); }</code> をそのまま使える。',
        '<code class="ic">for (i = 0; i &lt; n; i++) { b[i] = a[n - 1 - i]; }</code> として <code class="ic">return b;</code> (free は main 側が行う)。',
      ],
      summary: 'sizeof(double) * n バイトを malloc で動的に割り当て、配列 a の要素を逆順に格納して返す関数 darray_rev を darray.c に作成した。',
      reportTitle: '第1回 問 1',
    },

    {
      id: 'q2', set: 1, label: '1-問2', short: 'リストへの重複なし昇順挿入', files: ['listuniq.c'], given: pick('listuniq.h', 'listuniqmain.c'), link: ['listuniqmain.c', 'listuniq.c'], gcc: 'listuniqmain.c listuniq.c',
      title: 'ダミー節点付き昇順リストに重複なく挿入する listuniq.c (5 点)',
      spec: '<p><code class="ic">listuniq.h</code> で定義された単方向リスト (先頭 <code class="ic">head</code> はダミー節点、要素は <code class="ic">val</code> の昇順に並んでいる) に対し、関数 <code class="ic">int list_insert_uniq(node_t *head, int val)</code> を <code class="ic">listuniq.c</code> に作成せよ。</p><ul><li><code class="ic">val</code> と同じ値がすでにリストにあれば、何も挿入せず <code class="ic">0</code> を返す。</li><li>なければ、昇順を保つ位置に <code class="ic">new_node(val, ...)</code> で新しい節点を挿入し、<code class="ic">1</code> を返す。</li></ul><div class="req"><span class="chip">重点: 課題(6-1)〜(6-4)</span><span class="chip ptr">p-&gt;next の先読み</span><span class="chip">ダミー節点</span></div>',
      starter: { 'listuniq.c': R`#include <stdio.h>
#include "listuniq.h"

int list_insert_uniq(node_t *head, int val)
{
  /* ここを完成させよ */
  return 0;
}
` },
      solution: pick('listuniq.c'),
      tests: vis('listuniq', 'listuniq'),
      check: (outs, src, CL) => hidden('listuniq', ['listuniqmain.c', 'listuniq.c'], src, CL, (s) => {
        const c = strip(s['listuniq.c']);
        if (!/new_node\s*\(/.test(c)) return '節点の生成には配布済みの <code class="ic">new_node</code> 関数を使おう。';
        if (/printf|scanf/.test(c)) return 'listuniq.c の中で入出力を行ってはいけません。';
        return null;
      }),
      hints: [
        'B6 の鉄則: 挿入したい場所の<b>1 つ手前</b>で止まるため、ダミー節点 <code class="ic">p = head</code> から始め <code class="ic">p-&gt;next</code> を先読みする!',
        '<code class="ic">for (p = head; p-&gt;next != NULL; p = p-&gt;next)</code> の中で:<br>・<code class="ic">p-&gt;next-&gt;val == val</code> なら重複なので <code class="ic">return 0;</code><br>・<code class="ic">p-&gt;next-&gt;val &gt; val</code> ならここが挿入位置なので <code class="ic">break;</code>',
        'ループを抜けた位置で <code class="ic p">p-&gt;next = new_node(val, p-&gt;next); return 1;</code>',
      ],
      summary: 'ダミー節点 head から p->next を先読みし、重複があれば 0 を返し、なければ昇順位置に節点を挿入して 1 を返す list_insert_uniq を作成した。',
      reportTitle: '第1回 問 2',
    },

    {
      id: 'q3', set: 1, label: '1-問3', short: '単純選択法 selection_sort', files: ['selsort.c'], given: pick('selsort.h', 'selsortmain.c'), link: ['selsortmain.c', 'selsort.c'], gcc: 'selsortmain.c selsort.c',
      title: 'double 配列を昇順に並べる単純選択法 selsort.c (5 点)',
      spec: '<p>要素数 <code class="ic">n</code> の <code class="ic">double</code> 型配列 <code class="ic">a</code> を<b>単純選択法 (selection sort)</b> によって昇順 (<code class="ic">a[0] &lt;= a[1] &lt;= ... &lt;= a[n-1]</code>) に並べ替える関数 <code class="ic">void selection_sort(int n, double *a)</code> を <code class="ic">selsort.c</code> に作成せよ。</p><div class="req"><span class="chip">重点: 課題(7-2)</span><span class="chip val">単純選択法</span><span class="chip">添字 min の更新</span></div>',
      starter: { 'selsort.c': R`#include "selsort.h"

void selection_sort(int n, double *a)
{
  /* ここを完成させよ */
}
` },
      solution: pick('selsort.c'),
      tests: vis('selsort', 'selsort'),
      check: (outs, src, CL) => hidden('selsort', ['selsortmain.c', 'selsort.c'], src, CL, (s) => {
        const c = strip(s['selsort.c']);
        if (/\bqsort\s*\(/.test(c)) return '標準ライブラリの qsort は使わず、単純選択法を自分で実装しよう。';
        if (/printf|scanf/.test(c)) return 'ソート関数の中で入出力は行わない。';
        return null;
      }),
      hints: [
        '外側ループ: <code class="ic">for (k = 0; k &lt;= n - 2; k++)</code> (<code class="ic">n == 1</code> のとき 1 回も回らないので安全)。',
        '最小値の<b>添字</b>を探す: <code class="ic">min = k;</code> として <code class="ic">for (i = k + 1; i &lt; n; i++) if (a[i] &lt; a[min]) min = i;</code>',
        '最後に <code class="ic">double tmp</code> を使って <code class="ic">a[k]</code> と <code class="ic">a[min]</code> を交換! (<code class="ic">tmp</code> を <code class="ic">int</code> にしないよう注意!)',
      ],
      summary: '単純選択法により double 型配列を昇順に整列する関数 selection_sort を selsort.c に作成した。',
      reportTitle: '第1回 問 3',
    },

    {
      id: 'q4', set: 1, label: '1-問4', short: 'db_t の二分探索 (整数キー)', files: ['dbbin.c'], given: pick('dbbin.h', 'dbbinmain.c'), link: ['dbbinmain.c', 'dbbin.c'], gcc: 'dbbinmain.c dbbin.c',
      title: 'id 昇順に整列された db_t から二分探索で探す dbbin.c (5 点)',
      spec: '<p><code class="ic">dbbin.h</code> の <code class="ic">db_t</code> には、<code class="ic">db-&gt;n</code> 件のレコード <code class="ic">db-&gt;entry[0]</code> 〜 <code class="ic">db-&gt;entry[db-&gt;n - 1]</code> が <b><code class="ic">id</code> の昇順</b> (重複なし) で格納されている。</p><p>指定された <code class="ic">key_id</code> を<b>二分探索 (binary search)</b> で探し、見つかった場合はその添字 (<code class="ic">0</code> 〜 <code class="ic">db-&gt;n - 1</code>)、見つからなかった場合は <code class="ic">-1</code> を返す関数 <code class="ic">int db_binary_search(db_t *db, int key_id)</code> を <code class="ic">dbbin.c</code> に作成せよ。</p><div class="callout warn" style="margin-top:10px"><b>厳格採点</b>: 実行結果が正しくても、<b>二分探索ができていない (先頭から順に調べる線形探索になっている等) 場合は 0 点</b>とする。</div><div class="req"><span class="chip">重点: 課題(8-4)</span><span class="chip ptr">二分探索 O(log n)</span><span class="chip">db-&gt;entry[mid]</span></div>',
      starter: { 'dbbin.c': R`#include "dbbin.h"

int db_binary_search(db_t *db, int key_id)
{
  /* ここを完成させよ (必ず二分探索で実装すること!) */
  return -1;
}
` },
      solution: pick('dbbin.c'),
      tests: vis('dbbin', 'dbbin'),
      check: (outs, src, CL) => hidden('dbbin', ['dbbinmain.c', 'dbbin.c'], src, CL, (s) => checkBinarySearch(s['dbbin.c'])),
      hints: [
        '探索範囲の両端を <code class="ic">low = 0; high = db-&gt;n - 1;</code> とし、<code class="ic">while (low &lt;= high)</code> で繰り返す (<code class="ic">&lt;=</code> のイコールが超重要! 1 個残った要素も調べる)。',
        '中央 <code class="ic">mid = (low + high) / 2;</code> とし、<code class="ic">db-&gt;entry[mid].id</code> と <code class="ic">key_id</code> を比べる。',
        '一致なら <code class="ic">return mid;</code>、<code class="ic">db-&gt;entry[mid].id &lt; key_id</code> なら右半分へ (<code class="ic">low = mid + 1;</code>)、大きければ左半分へ (<code class="ic">high = mid - 1;</code>)。ループを抜けたら <code class="ic">return -1;</code>。',
      ],
      summary: 'id 昇順に並んだ db_t に対して low, high, mid を用いた二分探索を行い、該当レコードの添字 (未発見時は -1) を返す db_binary_search を作成した。',
      reportTitle: '第1回 問 4',
    },

    /* ======================= 第 2 回 ======================= */
    {
      id: 'r2q1', set: 2, label: '2-問1', short: 'malloc で文字列連結 str_join', files: ['strjoin.c'], given: pick('strjoin.h', 'strjoinmain.c'), link: ['strjoinmain.c', 'strjoin.c'], gcc: 'strjoinmain.c strjoin.c',
      title: '2 つの文字列を連結した新文字列を malloc で作って返す strjoin.c (5 点)',
      spec: '<p>文字列 <code class="ic">s1</code> と <code class="ic">s2</code> を受け取り、<code class="ic">s1</code> の後ろに <code class="ic">s2</code> を連結した文字列を<b>ちょうどのサイズで <code class="ic">malloc</code> した領域</b>に格納して返す関数 <code class="ic">char *str_join(char *s1, char *s2)</code> を <code class="ic">strjoin.c</code> に作成せよ。</p><div class="callout warn" style="margin-top:10px"><b>厳格採点</b>: 終端の <code class="ic">\'\\0\'</code> を含む<b>必要最小限のバイト数</b>を <code class="ic">sizeof(char)</code> を用いて確保すること。固定長 (<code class="ic">malloc(128)</code> 等) や <code class="ic">+ 1</code> 忘れは <b>0 点</b>とする。</div><div class="req"><span class="chip">重点: 課題(5-3)</span><span class="chip ptr">strlen + 1 と sizeof(char)</span><span class="chip">strcpy / strcat</span></div>',
      starter: { 'strjoin.c': R`#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "strjoin.h"

char *str_join(char *s1, char *s2)
{
  /* ここを完成させよ */
  return NULL;
}
` },
      solution: pick('strjoin.c'),
      tests: vis('strjoin', 'strjoin'),
      check: (outs, src, CL) => hidden('strjoin', ['strjoinmain.c', 'strjoin.c'], src, CL, (s, runs) => {
        const m = checkMallocSizeof(s['strjoin.c'], 'char');
        if (m) return m;
        // 入力1: "Chiba"(5)+"Univ"(4)+1 = 10B, "Hello"(5)+"World"(5)+1 = 11B, "C"(1)+"Lang"(4)+1 = 6B
        const sz = HP(runs[0]).sizes;
        const want = [u8('ChibaUniv') + 1, u8('HelloWorld') + 1, u8('CLang') + 1];
        if (sz.length < 3 || sz[0] !== want[0] || sz[1] !== want[1] || sz[2] !== want[2]) {
          return '割り当てバイト数が <code class="ic">sizeof(char) * (strlen(s1) + strlen(s2) + 1)</code> と一致しません ("Chiba" + "Univ" で ' + (sz[0] || 0) + ' バイト確保、期待は終端 \\0 込みの 10 バイト)。';
        }
        return null;
      }),
      hints: [
        '連結後の文字数は <code class="ic">len = strlen(s1) + strlen(s2);</code>。終端の <code class="ic">\'\\0\'</code> の分を足して <code class="ic p">sizeof(char) * (len + 1)</code> バイトを確保!',
        '<code class="ic">NULL</code> チェック (<code class="ic">exit(1)</code>) を忘れないこと。',
        '<code class="ic">strcpy(p, s1);</code> で先頭をコピーし、<code class="ic">strcat(p, s2);</code> (または <code class="ic">strcpy(p + strlen(s1), s2);</code>) で後ろをつなぐ。',
      ],
      summary: 'strlen(s1) + strlen(s2) + 1 個の char 領域を sizeof(char) を用いて malloc し、2 つの文字列を連結して返す str_join を作成した。',
      reportTitle: '第2回 問 1',
    },

    {
      id: 'r2q2', set: 2, label: '2-問2', short: 'リストの挿入・重複削除', files: ['listtoggle.c'], given: pick('listtoggle.h', 'listtogglemain.c'), link: ['listtogglemain.c', 'listtoggle.c'], gcc: 'listtogglemain.c listtoggle.c',
      title: '昇順リストになければ挿入、あれば削除して free する listtoggle.c (5 点)',
      spec: '<p>ダミー節点 <code class="ic">head</code> を持つ昇順リストに対し、関数 <code class="ic">void list_insert_delete_dup(node_t *head, int val)</code> を <code class="ic">listtoggle.c</code> に作成せよ。</p><ul><li>リスト中に <code class="ic">val</code> と同じ値を持つ節点があれば、<b>その節点をリストから外して <code class="ic">free</code></b> する。</li><li>なければ、昇順を保つ位置に <code class="ic">new_node(val, ...)</code> で新しい節点を挿入する。</li></ul><div class="callout warn" style="margin-top:10px">外した節点を <code class="ic">free</code> し忘れるとメモリリークで不正解になる。</div><div class="req"><span class="chip">重点: 課題(6-5)</span><span class="chip ptr">つなぎ替え + free</span><span class="chip">ダミー節点</span></div>',
      starter: { 'listtoggle.c': R`#include <stdio.h>
#include <stdlib.h>
#include "listtoggle.h"

void list_insert_delete_dup(node_t *head, int val)
{
  /* ここを完成させよ */
}
` },
      solution: pick('listtoggle.c'),
      tests: vis('listtoggle', 'listtoggle'),
      check: (outs, src, CL) => hidden('listtoggle', ['listtogglemain.c', 'listtoggle.c'], src, CL, (s) => {
        const c = strip(s['listtoggle.c']);
        if (!/\bfree\s*\(/.test(c)) return '削除した節点を <code class="ic">free</code> していません。';
        return null;
      }),
      hints: [
        '課題 6-5 そのもの! <code class="ic">for (p = head; p-&gt;next != NULL; p = p-&gt;next)</code> で 1 つ手前から先読みする。',
        '<code class="ic">p-&gt;next-&gt;val == val</code> なら削除: 一時ポインタ <code class="ic">del = p-&gt;next;</code> に退避してから <code class="ic">p-&gt;next = del-&gt;next; free(del); return;</code> (先に free すると <code class="ic">del-&gt;next</code> が読めなくなる!)',
        '<code class="ic">p-&gt;next-&gt;val &gt; val</code> で <code class="ic">break;</code> し、ループ外で <code class="ic">p-&gt;next = new_node(val, p-&gt;next);</code>',
      ],
      summary: '昇順リストに対し、同値節点があればつなぎ替えて free し、なければ昇順位置に新節点を挿入する list_insert_delete_dup を作成した。',
      reportTitle: '第2回 問 2',
    },

    {
      id: 'r2q3', set: 2, label: '2-問3', short: '単純挿入法 insertion_sort', files: ['inssort.c'], given: pick('inssort.h', 'inssortmain.c'), link: ['inssortmain.c', 'inssort.c'], gcc: 'inssortmain.c inssort.c',
      title: 'double 配列を昇順に並べる単純挿入法 inssort.c (5 点)',
      spec: '<p>要素数 <code class="ic">n</code> の <code class="ic">double</code> 型配列 <code class="ic">a</code> を<b>単純挿入法 (insertion sort)</b> によって昇順に並べ替える関数 <code class="ic">void insertion_sort(int n, double *a)</code> を <code class="ic">inssort.c</code> に作成せよ。</p><div class="req"><span class="chip">重点: 課題(7-4)</span><span class="chip val">単純挿入法</span><span class="chip">整列済み境界で break</span></div>',
      starter: { 'inssort.c': R`#include "inssort.h"

void insertion_sort(int n, double *a)
{
  /* ここを完成させよ */
}
` },
      solution: pick('inssort.c'),
      tests: vis('inssort', 'inssort'),
      check: (outs, src, CL) => hidden('inssort', ['inssortmain.c', 'inssort.c'], src, CL, (s) => {
        const c = strip(s['inssort.c']);
        if (/\bqsort\s*\(/.test(c)) return 'qsort ではなく単純挿入法を自分で実装しよう。';
        // 選択法ではなく挿入法になっているか (i-- で左へ辿る or シフトする)
        if (!/--/.test(c)) return '単純挿入法 (<code class="ic">k = 1</code> から順に左側の整列済み部分へ挿入していく形) で書こう。';
        return null;
      }),
      hints: [
        '外側ループ: 先頭 1 個は整列済みとみなせるので <code class="ic">for (k = 1; k &lt;= n - 1; k++)</code>。',
        '内側ループ (課題 7-3 の insert): <code class="ic">for (i = k; 1 &lt;= i; i--)</code> で左隣 <code class="ic">a[i-1]</code> と比較する。',
        '<code class="ic">if (a[i - 1] &lt;= a[i]) { break; }</code> で即ストップ! そうでなければ <code class="ic">double tmp</code> で <code class="ic">a[i]</code> と <code class="ic">a[i - 1]</code> を交換。',
      ],
      summary: '単純挿入法により double 型配列を昇順に整列する関数 insertion_sort を inssort.c に作成した。',
      reportTitle: '第2回 問 3',
    },

    {
      id: 'r2q4', set: 2, label: '2-問4', short: 'db_t の二分探索 (文字列キー)', files: ['dbstr.c'], given: pick('dbstr.h', 'dbstrmain.c'), link: ['dbstrmain.c', 'dbstr.c'], gcc: 'dbstrmain.c dbstr.c',
      title: '辞書順に並んだ db_t から文字列キーを二分探索する dbstr.c (5 点)',
      spec: '<p><code class="ic">dbstr.h</code> の <code class="ic">db_t</code> には、<code class="ic">db-&gt;n</code> 件の商品データ (<code class="ic">key</code>: 商品名, <code class="ic">price</code>: 価格) が <b><code class="ic">key</code> の辞書順 (strcmp の昇順)</b> で格納されている。</p><p>商品名 <code class="ic">key</code> を<b>二分探索</b>で探し、見つかったらその <code class="ic">price</code> を、見つからなければ <code class="ic">-1</code> を返す関数 <code class="ic">int db_search_name(db_t *db, char *key)</code> を <code class="ic">dbstr.c</code> に作成せよ。</p><div class="callout warn" style="margin-top:10px"><b>厳格採点</b>: 当日配布のサンプルプログラムにある <code class="ic">strcmp</code> の符号 (0 / 負 / 正) を使って二分探索すること。線形探索は <b>0 点</b>。</div><div class="req"><span class="chip">重点: 課題(8-4) + サンプル</span><span class="chip ptr">strcmp × 二分探索</span><span class="chip">O(log n)</span></div>',
      starter: { 'dbstr.c': R`#include <string.h>
#include "dbstr.h"

int db_search_name(db_t *db, char *key)
{
  /* ここを完成させよ (strcmp を使った二分探索!) */
  return -1;
}
` },
      solution: pick('dbstr.c'),
      tests: vis('dbstr', 'dbstr'),
      check: (outs, src, CL) => hidden('dbstr', ['dbstrmain.c', 'dbstr.c'], src, CL, (s) => {
        const c = strip(s['dbstr.c']);
        if (!/\bstrcmp\s*\(/.test(c)) return '文字列の比較には <code class="ic">strcmp</code> を使おう。';
        return checkBinarySearch(c);
      }),
      hints: [
        'サンプルプログラムで確認! <code class="ic">c = strcmp(key, db-&gt;entry[mid].key);</code> とすると、一致で <code class="ic">0</code>、<code class="ic">key</code> の方が辞書順で前なら<b>負</b>、後ろなら<b>正</b>になる。',
        '<code class="ic">c == 0</code> なら <code class="ic">return db-&gt;entry[mid].price;</code>',
        '<code class="ic">c &lt; 0</code> (<code class="ic">key</code> が中央より前) なら左半分 <code class="ic">high = mid - 1;</code>、<code class="ic">c &gt; 0</code> なら右半分 <code class="ic">low = mid + 1;</code>! 符号の向きをサンプルの <code class="ic">"China"</code> vs <code class="ic">"Japan"</code> で確かめよう。',
      ],
      summary: '辞書順に整列された db_t に対し、strcmp の返り値の正負を用いた二分探索で価格を検索する db_search_name を作成した。',
      reportTitle: '第2回 問 4',
    },

    /* ======================= 第 3 回 ======================= */
    {
      id: 'r3q1', set: 3, label: '3-問1', short: '正の要素だけ malloc 抽出', files: ['filterpos.c'], given: pick('filterpos.h', 'filterposmain.c'), link: ['filterposmain.c', 'filterpos.c'], gcc: 'filterposmain.c filterpos.c',
      title: '正の要素の個数を数え、ちょうどの長さを malloc して返す filterpos.c (5 点)',
      spec: '<p>関数 <code class="ic">int *alloc_positives(int n, int a[], int *out_m)</code> を <code class="ic">filterpos.c</code> に作成せよ。</p><ul><li><code class="ic">a[0]</code> 〜 <code class="ic">a[n-1]</code> のうち<b>正の値 (<code class="ic">&gt; 0</code>)</b> の個数 <code class="ic">cnt</code> を数え、<code class="ic">*out_m</code> に格納する。</li><li><code class="ic">cnt == 0</code> のときは <code class="ic">malloc</code> を呼ばずに <code class="ic">NULL</code> を返す。</li><li><code class="ic">cnt &gt; 0</code> のときは、ちょうど <code class="ic">cnt</code> 個分の <code class="ic">int</code> 配列を <code class="ic">sizeof(int)</code> を使って <code class="ic">malloc</code> し、元の順序のまま正の要素だけを詰めて返す。</li></ul><div class="req"><span class="chip">重点: 課題(5-1) 応用</span><span class="chip ptr">sizeof(int) * cnt</span><span class="chip">ポインタ引数 *out_m</span></div>',
      starter: { 'filterpos.c': R`#include <stdio.h>
#include <stdlib.h>
#include "filterpos.h"

int *alloc_positives(int n, int a[], int *out_m)
{
  /* ここを完成させよ */
  return NULL;
}
` },
      solution: pick('filterpos.c'),
      tests: vis('filterpos', 'filterpos'),
      check: (outs, src, CL) => hidden('filterpos', ['filterposmain.c', 'filterpos.c'], src, CL, (s, runs) => {
        const m = checkMallocSizeof(s['filterpos.c'], 'int');
        if (m) return m;
        // 入力1: 1組目は正が3個(5,8,2) -> 12B, 2組目は正が0個 -> malloc しない (計1回だけ!)
        const sz = HP(runs[0]).sizes;
        if (sz.length !== 1 || sz[0] !== 12) {
          return '正の要素数 <code class="ic">cnt</code> 個分だけ確保していますか? (<code class="ic">n</code> 個分確保したり、<code class="ic">cnt == 0</code> で malloc すると不正解。入力1での確保実績: [' + sz.join(', ') + '] バイト、期待: [12] バイト)。';
        }
        return null;
      }),
      hints: [
        '2 パスで書くのが一番安全! 1 回目のループで <code class="ic">a[i] &gt; 0</code> を数えて <code class="ic">*out_m = cnt;</code>。',
        '<code class="ic">if (cnt == 0) return NULL;</code> を先に書いてから、<code class="ic p">b = malloc(sizeof(int) * cnt);</code> + NULL チェック。',
        '2 回目のループでは書き込み用の添字 <code class="ic">k = 0</code> を別に用意し、<code class="ic">if (a[i] &gt; 0) { b[k] = a[i]; k++; }</code>!',
      ],
      summary: '配列中の正の要素数を *out_m に返し、0 個なら NULL、1 個以上なら sizeof(int) * cnt バイトを malloc して正の要素のみ格納して返す alloc_positives を作成した。',
      reportTitle: '第3回 問 1',
    },

    {
      id: 'r3q2', set: 3, label: '3-問2', short: '文字列リストの探索と削除', files: ['strlist.c'], given: pick('strlist.h', 'strlistmain.c'), link: ['strlistmain.c', 'strlist.c'], gcc: 'strlistmain.c strlist.c',
      title: 'ダミー節点付き文字列リストの探索と削除 strlist.c (5 点)',
      spec: '<p><code class="ic">strlist.h</code> の単方向リスト (先頭 <code class="ic">head</code> はダミー節点) に対し、次の 2 関数を <code class="ic">strlist.c</code> に作成せよ。</p><ul><li><code class="ic">snode_t *slist_find(snode_t *head, char *key)</code> — <code class="ic">word</code> が <code class="ic">key</code> と一致する最初の節点へのポインタを返す (なければ <code class="ic">NULL</code>)。</li><li><code class="ic">int slist_remove(snode_t *head, char *key)</code> — <code class="ic">word</code> が <code class="ic">key</code> と一致する最初の節点をリストから外して <code class="ic">free</code> し <code class="ic">1</code> を返す (なければ <code class="ic">0</code>)。</li></ul><div class="req"><span class="chip">重点: 課題(6-3)(6-5)</span><span class="chip ptr">strcmp + free</span><span class="chip">head-&gt;next vs head</span></div>',
      starter: { 'strlist.c': R`#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "strlist.h"

snode_t *slist_find(snode_t *head, char *key)
{
  /* TODO */
  return NULL;
}

int slist_remove(snode_t *head, char *key)
{
  /* TODO */
  return 0;
}
` },
      solution: pick('strlist.c'),
      tests: vis('strlist', 'strlist'),
      check: (outs, src, CL) => hidden('strlist', ['strlistmain.c', 'strlist.c'], src, CL, (s) => {
        const c = strip(s['strlist.c']);
        if (!/\bstrcmp\s*\(/.test(c)) return '文字列の一致判定には <code class="ic">strcmp(..., key) == 0</code> を使おう (<code class="ic">==</code> ではアドレス比較になってしまう)。';
        if (!/\bfree\s*\(/.test(c)) return 'slist_remove で外した節点を <code class="ic">free</code> しよう。';
        return null;
      }),
      hints: [
        '<b>探索 (<code class="ic">slist_find</code>)</b> は読むだけなので<b>実データの先頭 <code class="ic">p = head-&gt;next</code></b> から回す! (ダミー節点の空文字と比較しないよう注意)',
        '<b>削除 (<code class="ic">slist_remove</code>)</b> は前の節点の <code class="ic">next</code> を書き換えるので<b>ダミー節点 <code class="ic">p = head</code></b> から <code class="ic">p-&gt;next</code> を先読みする!',
        '一致したら <code class="ic">del = p-&gt;next; p-&gt;next = del-&gt;next; free(del); return 1;</code>',
      ],
      summary: '文字列を格納する単方向リストに対し、head->next から走査する探索関数 slist_find と、head から先読みして削除・free する slist_remove を作成した。',
      reportTitle: '第3回 問 2',
    },

    {
      id: 'r3q3', set: 3, label: '3-問3', short: '構造体配列の複合キー整列', files: ['recsort.c'], given: pick('recsort.h', 'recsortmain.c'), link: ['recsortmain.c', 'recsort.c'], gcc: 'recsortmain.c recsort.c',
      title: 'student_t 配列を「得点降順・同点なら id 昇順」に整列する recsort.c (5 点)',
      spec: '<p>要素数 <code class="ic">n</code> の <code class="ic">student_t</code> 型配列 <code class="ic">a</code> を次の規則で並べ替える関数 <code class="ic">void sort_students(int n, student_t *a)</code> を <code class="ic">recsort.c</code> に作成せよ (単純選択法・単純挿入法のどちらでもよい)。</p><ul><li>第 1 キー: <code class="ic">score</code> の<b>高い順 (降順)</b></li><li>第 2 キー: <code class="ic">score</code> が等しい場合は <code class="ic">id</code> の<b>小さい順 (昇順)</b></li></ul><div class="req"><span class="chip">重点: 課題(7-2)(7-4)(7-8)</span><span class="chip val">構造体の丸ごと交換</span><span class="chip">複合キー比較</span></div>',
      starter: { 'recsort.c': R`#include "recsort.h"

void sort_students(int n, student_t *a)
{
  /* ここを完成させよ */
}
` },
      solution: pick('recsort.c'),
      tests: vis('recsort', 'recsort'),
      check: (outs, src, CL) => hidden('recsort', ['recsortmain.c', 'recsort.c'], src, CL, (s) => {
        const c = strip(s['recsort.c']);
        if (/\bqsort\s*\(/.test(c)) return 'qsort は使わず自分でソート関数を書こう。';
        return null;
      }),
      hints: [
        'B7 課題 7-8 の応用! 「学生 x が y より前に来るべきか」を返す補助関数 <code class="ic">comes_before(x, y)</code> を作るとミスが激減する。',
        '<code class="ic">x.score != y.score</code> なら <code class="ic">x.score &gt; y.score</code> (降順なので不等号の向きに注意!)、等しければ <code class="ic">x.id &lt; y.id</code>。',
        '交換は <code class="ic">student_t tmp; tmp = a[k]; a[k] = a[min]; a[min] = tmp;</code> と構造体ごと <code class="ic">=</code> で一発コピーできる (<code class="ic">name</code> の <code class="ic">strcpy</code> は不要)。',
      ],
      summary: 'student_t 型配列を score の降順、同点時は id の昇順に整列する関数 sort_students を recsort.c に作成した。',
      reportTitle: '第3回 問 3',
    },

    {
      id: 'r3q4', set: 3, label: '3-問4', short: 'db_t のソート + 二分探索', files: ['dbsortfind.c'], given: pick('dbsortfind.h', 'dbsortfindmain.c'), link: ['dbsortfindmain.c', 'dbsortfind.c'], gcc: 'dbsortfindmain.c dbsortfind.c',
      title: '未整列の db_t を辞書順にソートし、ポインタを返す二分探索 dbsortfind.c (5 点)',
      spec: '<p><code class="ic">dbsortfind.h</code> に従い、次の 2 関数を <code class="ic">dbsortfind.c</code> に作成せよ。</p><ul><li><code class="ic">void db_sort(db_t *db)</code> — <code class="ic">db-&gt;entry[0]</code> 〜 <code class="ic">db-&gt;entry[db-&gt;n - 1]</code> を <code class="ic">word</code> の辞書順 (昇順) に並べ替える。</li><li><code class="ic">entry_t *db_bsearch(db_t *db, char *word)</code> — 整列後の <code class="ic">db</code> から <code class="ic">word</code> を<b>二分探索</b>し、見つかった要素へのポインタ <code class="ic">&amp;db-&gt;entry[mid]</code> を返す (なければ <code class="ic">NULL</code>)。</li></ul><div class="callout warn" style="margin-top:10px"><b>厳格採点</b>: <code class="ic">db_bsearch</code> が二分探索になっていない場合は <b>0 点</b>とする。</div><div class="req"><span class="chip">重点: B7 + B8 総仕上げ</span><span class="chip ptr">&amp;db-&gt;entry[mid]</span><span class="chip">ソート → 二分探索</span></div>',
      starter: { 'dbsortfind.c': R`#include <stdio.h>
#include <string.h>
#include "dbsortfind.h"

void db_sort(db_t *db)
{
  /* TODO: word の辞書順にソート */
}

entry_t *db_bsearch(db_t *db, char *word)
{
  /* TODO: 二分探索して &db->entry[mid] または NULL を返す */
  return NULL;
}
` },
      solution: pick('dbsortfind.c'),
      tests: vis('dbsortfind', 'dbsortfind'),
      check: (outs, src, CL) => hidden('dbsortfind', ['dbsortfindmain.c', 'dbsortfind.c'], src, CL, (s) => {
        const c = strip(s['dbsortfind.c']);
        const m = /(\bdb_bsearch\s*\([\s\S]*)$/.exec(c);
        return checkBinarySearch(m ? m[1] : c);
      }),
      hints: [
        '「ソートしてから二分探索」の黄金コンビ! <code class="ic">db_sort</code> では <code class="ic">strcmp(db-&gt;entry[i].word, db-&gt;entry[min].word) &lt; 0</code> で最小を選び、<code class="ic">entry_t tmp</code> で丸ごと交換。',
        '<code class="ic">db_bsearch</code> の返り値は構造体へのポインタ <code class="ic">entry_t *</code>! 見つかったら添字ではなく <code class="ic p">&amp;db-&gt;entry[mid]</code> を返す。',
        '見つからなかったときは <code class="ic">-1</code> ではなく <code class="ic">NULL</code> を返す (<code class="ic">stdio.h</code> 等が必要)。',
      ],
      summary: 'db_t の配列を辞書順に整列する db_sort と、二分探索により該当要素へのポインタ (&db->entry[mid]) を返す db_bsearch を作成した。',
      reportTitle: '第3回 問 4',
    },

    /* ======================= 腕試し (得点外・特訓 2 問) ======================= */
    {
      id: 'x1', label: '腕試し1', short: 'malloc 大文字複製 strdup', files: ['mystrdup.c'], given: pick('mystrdup.h', 'mystrdupmain.c'), link: ['mystrdupmain.c', 'mystrdup.c'], gcc: 'mystrdupmain.c mystrdup.c', optional: true,
      title: '【5-3 特訓】英小文字を大文字に変えた複製文字列を malloc で返す mystrdup.c',
      spec: '<p>文字列 <code class="ic">s</code> と同じ長さの領域を <code class="ic">sizeof(char) * (strlen(s) + 1)</code> で動的に割り当て、英小文字 (<code class="ic">\'a\'</code>〜<code class="ic">\'z\'</code>) だけを英大文字 (<code class="ic">\'A\'</code>〜<code class="ic">\'Z\'</code>) に変換した文字列を格納して返す <code class="ic">char *my_strdup_upper(char *s)</code> を作成せよ。</p>',
      starter: { 'mystrdup.c': R`#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "mystrdup.h"

char *my_strdup_upper(char *s)
{
  /* TODO */
  return NULL;
}
` },
      solution: pick('mystrdup.c'),
      tests: vis('mystrdup', 'mystrdup'),
      check: (outs, src, CL) => hidden('mystrdup', ['mystrdupmain.c', 'mystrdup.c'], src, CL, (s, runs) => {
        const m = checkMallocSizeof(s['mystrdup.c'], 'char');
        if (m) return m;
        const sz = HP(runs[0]).sizes;
        if (sz[0] !== 6 || sz[1] !== 10 || sz[2] !== 10) return '確保バイト数が <code class="ic">strlen(s) + 1</code> になっていません。';
        return null;
      }),
      hints: [
        '<code class="ic">len = strlen(s);</code> に対し <code class="ic">malloc(sizeof(char) * (len + 1))</code>。',
        '<code class="ic">i = 0</code> から <code class="ic">i &lt;= len</code> まで回せば末尾の <code class="ic">\'\\0\'</code> も一緒にコピーできる!',
      ],
      summary: '文字列と同じ長さ (+1) を malloc し、小文字を大文字に変換した複製を返す my_strdup_upper を作成した。',
      reportTitle: '腕試し 1',
    },

    {
      id: 'x2', label: '腕試し2', short: '文字列 2 次元配列のソート', files: ['wordsort.c'], given: pick('wordsort.h', 'wordsortmain.c'), link: ['wordsortmain.c', 'wordsort.c'], gcc: 'wordsortmain.c wordsort.c', optional: true,
      title: '【7-7 + サンプル特訓】文字列配列 char (*a)[STRLEN+1] のソート wordsort.c',
      spec: '<p>当日配布のサンプルプログラムにある <code class="ic">STRLEN</code>, <code class="ic">strcpy</code>, <code class="ic">strcmp</code> をフル活用し、<code class="ic">n</code> 個の文字列 <code class="ic">a[0]</code> 〜 <code class="ic">a[n-1]</code> を辞書順 (昇順) に並べ替える <code class="ic">void string_sort(int n, char (*a)[STRLEN + 1])</code> を <code class="ic">wordsort.c</code> に作成せよ。</p>',
      starter: { 'wordsort.c': R`#include <string.h>
#include "wordsort.h"

void string_sort(int n, char (*a)[STRLEN + 1])
{
  /* TODO */
}
` },
      solution: pick('wordsort.c'),
      tests: vis('wordsort', 'wordsort'),
      check: (outs, src, CL) => hidden('wordsort', ['wordsortmain.c', 'wordsort.c'], src, CL, (s) => {
        const c = strip(s['wordsort.c']);
        if (!/\bstrcmp\s*\(/.test(c) || !/\bstrcpy\s*\(/.test(c)) return '<code class="ic">strcmp</code> と <code class="ic">strcpy</code> を使って比較・交換しよう。';
        return null;
      }),
      hints: [
        '一時変数は <code class="ic">char tmp[STRLEN + 1];</code>。',
        '比較は <code class="ic">strcmp(a[i], a[min]) &lt; 0</code>、交換は <code class="ic">strcpy</code> を 3 回!',
      ],
      summary: 'strcmp と strcpy を用いて文字列の 2 次元配列を辞書順に整列する string_sort を作成した。',
      reportTitle: '腕試し 2',
    },
  ];

  window.T2_TASKS = tasks;
})();
