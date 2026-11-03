/* =========================================================================
 *  B5 動的割当て — 章コンテンツ
 *  出典: 配布資料「[B5] 動的割当て」と講義スライド「B5.pdf」
 * ========================================================================= */
(function () {
  'use strict';
  const { h, icon } = U;
  const R = String.raw;
  const D = window.B5_DATA || { given: {} };
  const G = D.given || {};

  const C = {
    arrow: "#include <stdio.h>\n#include <string.h>\n\nint main(void)\n{\n    char *p, s[10];\n\n    p = s;\n    strcpy(p, \"Hello\");\n    printf(\"%s\\n\", s);\n    return 0;\n}\n",
    sz: R`#include <stdio.h>

int main(void)
{
    int array[10], *p_array;
    p_array = array;

    printf("%d\n", (int)sizeof array);
    printf("%d\n", (int)sizeof p_array);
    return 0;
}
`,
    slide: R`#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *a;

    a = malloc(sizeof(int)*5);  /* OS から 20 バイト借りる */

    a[3] = 123;                 /* 普通の配列と同じように使える */

    free(a);                    /* 使い終わったら「必ず」返す */
    a = NULL;                   /* 誤って使えないようにする */

    return 0;
}
`,
    p1: R`#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *a = NULL;
    int i, n = 4;

    a = malloc(sizeof(int)*n);
    for (i=0; i<n; i++) {
        a[i] = i * i;
    }
    printf("%d %d\n", a[n-1], (int)(sizeof(int)*n));
    free(a);
    a = NULL;
    return 0;
}
`,
    p2: R`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void)
{
    char s[10] = "Hello";
    char *c = NULL;

    c = malloc(sizeof(char)*(strlen(s)+1));
    strcpy(c, s);
    c[0] = 'J';
    printf("%s %s %d\n", s, c, (int)(strlen(s)+1));
    free(c);
    c = NULL;
    return 0;
}
`,
    p3: R`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int x;
    int y;
} point_t;

point_t *point_new(int x, int y)
{
    point_t *p = malloc(sizeof(point_t));
    p->x = x;
    p->y = y;
    return p;
}

int main(void)
{
    point_t *a = point_new(3, 4);
    point_t *b = a;

    b->x = 10;
    printf("%d %d\n", a->x, a->y);
    free(a);
    a = NULL;
    b = NULL;
    return 0;
}
`,
    p4: R`#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *data = malloc(sizeof(int)*4);
    int sp = 0;

    data[sp] = 1; sp++;   /* push 1 */
    data[sp] = 2; sp++;   /* push 2 */
    data[sp] = 3; sp++;   /* push 3 */

    sp--; printf("%d ", data[sp]);   /* pop */
    sp--; printf("%d ", data[sp]);   /* pop */
    data[sp] = 9; sp++;              /* push 9 */
    sp--; printf("%d\n", data[sp]);  /* pop */

    free(data);
    return 0;
}
`,
    stk: R`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int size;
    int sp;
    int *data;
} istack_t;

int main(void)
{
    istack_t *s = malloc(sizeof(istack_t));   /* 入れ物 */
    s->size = 2;
    s->sp = 0;
    s->data = malloc(sizeof(int)*s->size);    /* 中身 */

    s->data[s->sp] = 5; s->sp++;
    s->data[s->sp] = 6; s->sp++;
    /* 満杯 → 2 倍に */
    s->data = realloc(s->data, sizeof(int)*s->size*2);
    s->size = s->size*2;
    s->data[s->sp] = 7; s->sp++;

    printf("size=%d sp=%d top=%d\n", s->size, s->sp, s->data[s->sp-1]);
    free(s->data);   /* 中身から */
    free(s);         /* 入れ物は最後 */
    return 0;
}
`,
    m1: R`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void)
{
    char s[] = "abc";
    char *c = malloc(sizeof(char)*strlen(s));   /* +1 を忘れた */
    strcpy(c, s);
    printf("%s\n", c);
    free(c);
    return 0;
}
`,
    m2: R`#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *a = malloc(sizeof(int)*3);
    a[0] = 1; a[1] = 2; a[2] = 3;
    free(a);
    printf("%d\n", a[0]);   /* free した後に使った */
    return 0;
}
`,
    m3: R`#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *a = malloc(sizeof(int)*3);
    printf("%d\n", a[0]);   /* 代入する前に読んだ */
    free(a);
    return 0;
}
`,
    m4: R`#include <stdio.h>
#include <stdlib.h>

typedef struct { int size; int sp; int *data; } istack_t;

int main(void)
{
    istack_t *s = malloc(sizeof(istack_t));
    s->data = malloc(sizeof(int)*4);
    free(s);         /* 入れ物を先に返してしまった */
    free(s->data);
    return 0;
}
`,
    m5: R`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define LINELEN 128

int main(void)
{
    char s[LINELEN+1];
    char *line[10];
    int n = 0, i;

    while (fgets(s, LINELEN, stdin) != NULL) {
        line[n] = s;     /* コピーせずに番地だけ入れた */
        n++;
    }
    for (i=n-1; i>=0; i--) {
        printf("%s", line[i]);
    }
    return 0;
}
`,
    m6: R`#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int i;
    for (i=0; i<3; i++) {
        int *a = malloc(sizeof(int)*100);
        a[0] = i;
        printf("%d\n", a[0]);
    }                       /* free していない */
    return 0;
}
`,
  };

  function hero(heroMem) {
    return h('section.u-hero',
      h('div.u-hero-grid',
        h('div',
          h('div.code-id', 'UNIT B5 — DYNAMIC ALLOCATION'),
          h('h1', '動的割当て', h('br'), h('em', 'malloc / free')),
          h('p.tag', '必要な大きさは, 実行してみるまで分からない。', h('br'), h('span', 'だから実行中に OS から借りて, 使い終わったら必ず返す。')),
          h('div.u-stats',
            h('div', h('b', '7'), '章'),
            h('div', h('b', '12+2'), '課題 (オプション含む)'),
            h('div', h('b', '5'), '予想問題')),
          h('div.cta',
            h('a.btn.ptr', { href: '#intro' }, '学習を始める', icon('arrow')),
            h('a.btn', { href: '#lab' }, '課題ラボへ'),
            h('a.btn.ghost', { href: '#report' }, 'レポート作成'))),
        heroMem()));
  }

  const chapters = [
    {
      id: 'intro', num: '00', group: 'はじめに', kicker: 'Why dynamic?', navTitle: 'なぜ動的に?',
      title: '配列の大きさを, 実行してから決めたい。',
      lead: 'int a[100]; は書いた時点で大きさが決まる。でも課題 5-1 の n は, 入力を読むまで分からない。足りなければ壊れ, 大きすぎれば無駄になる。',
      blocks: [
        { type: 'predict', id: 'p0', code: C.sz, hl: [8, 9], q: 'スライド「sizeof 演算子」より。<code class="ic">sizeof array</code> と <code class="ic">sizeof p_array</code> の出力は?', choices: ['<code>40</code> と <code>40</code> — 同じ配列だから', '<code>40</code> と <code>8</code>', '<code>10</code> と <code>1</code>'], answer: 1, explain: 'sizeof は<b>型の大きさ</b>を返す演算子。配列 array は int 10 個で 40 バイト。p_array は配列を指していても<b>ポインタ 1 つ</b>なので 8 バイト。malloc で借りた領域の大きさは, ポインタからは sizeof で取り出せない。' },
        { type: 'callout', kind: 'info', html: '<b>sizeof は「演算子」で, 関数ではない。</b><code class="ic">sizeof(int)</code> と <code class="ic">sizeof int</code> は同じ意味 (変数なら括弧なしでも書ける)。malloc の引数は<b>バイト数</b>なので, いつも <code class="ic">sizeof(型) * 個数</code> の形で書く。' },
        { type: 'callout', kind: 'warn', html: '<b>提出〆切: 2026/11/08 (日) 23:59</b> — レポート提出システムから。資料「[B5] 動的割り当て」中に指示される<b>全てのプログラム</b>を完成させること (課題 5-1〜5-8。オプション 5-1, 5-2 は任意)。レポート B5.txt は 08 章で自動生成できます。' },
        { type: 'callout', kind: 'info', html: '<b>オンデマンドビデオ (第七回「動的割り当て」)</b> — このページの対応する章に要点をまとめています。<br>① <b>動的割り当て</b> (08:14) → 01 malloc・02 free・00 sizeof<br>② <b>【補足】ポインタの矢印表現</b> (02:22) → 01 の最後<br>③ <b>【補足】データ構造「スタック」</b> (03:31) → 05 スタック' },
      ],
    },
    {
      id: 'malloc', num: '01', group: '1. 配列の動的割当て', kicker: '1. malloc で借りる', navTitle: 'malloc で借りる',
      title: 'OS から, 指定バイト数のメモリを借りる。',
      lead: 'malloc(バイト数) は OS のヒープ領域から領域を借り, その先頭の番地を返す。ポインタに入れてしまえば, あとは普通の配列と同じように [ ] で読み書きできる。',
      blocks: [
        { type: 'point', n: 1, title: '<code>a = malloc(sizeof(int)*5);</code> — 借りた領域の<b>番地</b>がもらえる', sub: '戻り値は <code class="ic">void *</code> (何の型でもない番地)。int * の変数に入れると int の配列として使える。<code class="ic">#include &lt;stdlib.h&gt;</code> が必要。' },
        { type: 'tracer', code: C.slide, name: '講義スライド「malloc()」', title: 'a はスタックの変数, 指す先は<b>ヒープ</b> — 下の紫の領域が malloc で借りた 20 バイト' },
        { type: 'point', n: 2, title: '借りた直後の中身は<b>不定</b>。malloc が失敗すると <b>NULL</b>', sub: '値を代入してから使う (0 で初期化済みが欲しければ calloc)。例題 5-1 のように <code class="ic">if (a==NULL) { fprintf(stderr, …); exit(1); }</code> で失敗に備える。' },
        { type: 'predict', id: 'p1', code: C.p1, hl: [9], q: 'n = 4 個の int を借りて, a[i] = i*i を入れる。出力は?', placeholder: '例: 0 0', explain: 'a[3] = 3×3 = <b>9</b>。借りたバイト数は sizeof(int)×4 = <b>16</b>。答えは <b>9 16</b>。n を変えれば借りる量も変わる — これが「実行時に大きさを決める」ということ。' },
        { type: 'callout', kind: 'tip', html: '<b>【参考】malloc の返り値はキャストしないことが推奨</b> (資料より)。<code class="ic">a = malloc(sizeof(int)*n);</code> (推奨) / <code class="ic">a = (int *) malloc(sizeof(int)*n);</code> (非推奨)。void * はどのポインタ型にもそのまま代入できる。' },
        { type: 'callout', kind: 'tip', html: '<b>動画 ① のポイント</b> — 普通の変数 (int a; など) は宣言すると自動で確保され, 関数が終わると自動で解放される。動的割り当てでは, 実行中に <b>OS のヒープ領域</b>から必要なバイト数を借り (malloc), 自分で返す (free)。図では <code class="ic">a</code> (100 番地, プログラムのメモリ) に <b>500</b> (ヒープの番地) が入り, <code class="ic">a[3] = 123;</code> は間接アドレッシングでヒープに書き込む。<br>※動画のスライドには <code class="ic">(int *)malloc(…)</code> とキャスト付きの書き方も出てくるが, 資料の【参考】どおり<b>キャストしない書き方が推奨</b>。' },
        { type: 'point', n: '+', title: '【補足】ポインタの<b>矢印表現</b> — 「番地が入っている」を「指している」と描く', sub: '動画 ②: <code class="ic">p = s;</code> で p (100 番地) に配列 s の番地 130 が入る。これを <b>p → s[10]</b> と矢印で描くのが矢印表現。B5 のスタック, B6 のリスト・二分木では複雑なポインタ構造が出てくるので, この描き方に慣れておこう。' },
        { type: 'tracer', code: C.arrow, name: '動画 ②「ポインタの矢印表現」', title: 'p の箱から s へ伸びる矢印 = p に s の番地が入っている (このサイトでは main は 100 番地〜)' },
      ],
    },
    {
      id: 'free', num: '02', group: '1. 配列の動的割当て', kicker: '1. free で返す', navTitle: 'free で返す',
      title: '借りたら, 必ず返す。',
      lead: 'free(番地) で領域は OS に返却され, 再利用される。返し忘れると「メモリリーク」— 長く動くサーバでは, いつか必ず障害になる。',
      blocks: [
        { type: 'point', n: 3, title: '<code>free(a); a = NULL;</code> をセットで', sub: 'free した後も a には古い番地が残っている (ぶら下がりポインタ)。NULL (0 番地) を入れておけば, 誤って使ったときにすぐ気づける。' },
        { type: 'callout', kind: 'info', html: '<b>このサイトの検査</b>: 範囲外アクセス・free 後の使用・二重 free・未初期化の読み出しは実行時エラーで止まり, 終了時に返却されていない領域は「<b>free 忘れ</b>」として表示されます (gcc では黙って動いてしまうことが多い不具合です)。' },
        { type: 'callout', kind: 'warn', html: '<b>動画 ① より</b>: 「借りたメモリ領域は使い終わったら<b>必ず</b>返す。これを怠ると『メモリリーク』が起きて, システムクラッシュなど深刻なサービス障害を引き起こしかねない」「free した後すぐに <code class="ic">a = NULL;</code> としておけば, 解放した領域に誤って読み書きすることを防げる」。' },
        { type: 'mistakes', items: [
          { title: 'free した後に使う', code: C.m2, fix: 'free した領域はもう自分のものではない。gcc では「たまたま動く」こともあるが, 別の malloc に再利用されて値が壊れる。<b>free の直後に <code class="ic">a = NULL;</code></b> を書く習慣を。' },
          { title: '借りた直後の中身を読む', code: C.m3, fix: 'malloc 直後の中身は不定 (ゴミ)。代入してから読むか, 0 で初期化したいなら <code class="ic">calloc(3, sizeof(int))</code> を使う。課題 5-2 のカウント用配列はここで引っかかりやすい。' },
          { title: 'ループの中で借りっぱなし', code: C.m6, fix: '3 回とも 400 バイトずつ借りて, 1 度も返していない (実行すると「free 忘れ 3 ブロック」)。ループの最後に <code class="ic">free(a);</code> を。' },
        ] },
      ],
    },
    {
      id: 'string', num: '03', group: '2. 文字列の動的割当て', kicker: '2. 文字配列を借りる', navTitle: '文字列を借りる',
      title: '文字列は, 長さ + 1 バイト。',
      lead: '"abc" は 3 文字でも, 終わりの \'\\0\' を入れて 4 バイト。strlen は \'\\0\' を数えないので, ちょうどのサイズは strlen(s)+1。',
      blocks: [
        { type: 'point', n: 4, title: '<code>malloc(sizeof(char)*(strlen(s)+1))</code>', sub: '例題 5-2 の strclone。課題 5-3 の strdouble は「2 倍 + 1」, 課題 5-4 は読んだ 1 行ごとに「その行の長さ + 1」。' },
        { type: 'tracer', files: { 'strclone_main.c': G['strclone_main.c'], 'strclone.c': G['strclone.c'] }, units: ['strclone_main.c', 'strclone.c'], stdin: 'abc\n', showStdin: true, name: '例題 5-2 strclone', title: '例題 5-2 — strclone(s) は s とは<b>別の</b> 4 バイトを借りてコピーする (stdin を書き換えて試せる)' },
        { type: 'predict', id: 'p2', code: C.p2, hl: [10, 12], q: 'コピー c の先頭を \'J\' に書き換えた。<code class="ic">s</code>, <code class="ic">c</code>, 借りたバイト数は?', placeholder: '例: Hello Hello 5', explain: 'c は s の<b>コピー</b> (別の領域) なので, c を書き換えても s はそのまま。"Hello" は 5 文字 + \'\\0\' で <b>6</b> バイト。答えは <b>Hello Jello 6</b>。' },
        { type: 'mistakes', items: [
          { title: '+1 を忘れる', code: C.m1, fix: '3 バイトしか借りていないのに, strcpy は \'\\0\' を含む 4 バイトを書く。<b>1 バイトのはみ出し</b>は gcc では気づかれにくい典型的なバグ。<code class="ic">strlen(s)+1</code>。' },
          { title: '番地だけ貯める (課題 5-4 の罠)', code: C.m5, stdin: 'A\nB\nC\n', fix: 'line[0], line[1], line[2] が<b>全部同じ配列 s</b> を指している。s は毎回上書きされるので, 最後に読んだ "C" が 3 回出る。行ごとに malloc してコピーすれば, それぞれ別の領域になる。' },
        ] },
        { type: 'callout', kind: 'tip', html: '<b>fgets(s, LINELEN, stdin)</b> は 1 行 (最大 LINELEN-1 文字) を読み, 最後の改行 \'\\n\' も s に入れる。入力がなくなると <b>NULL</b> を返す (scanf の EOF とは違う)。だから <code class="ic">while (fgets(…) != NULL)</code>。' },
      ],
    },
    {
      id: 'struct', num: '04', group: '3. 構造体の動的割当て', kicker: '3. 構造体を借りる', navTitle: '構造体を借りる',
      title: '構造体も, 1 つずつ借りられる。',
      lead: 'malloc(sizeof(pref_t)) で県 1 つ分。ポインタで受け取るので, メンバーは「.」ではなく「->」でたどる。',
      blocks: [
        { type: 'point', n: 5, title: '<code>pref_t *a = malloc(sizeof(pref_t));</code> → <code>a-&gt;area = 2187.65;</code>', sub: '<code class="ic">a-&gt;area</code> は <code class="ic">(*a).area</code> の略 (B3)。配列メンバー name には <code class="ic">strncpy(a-&gt;name, "Tokyo", NAMELEN);</code>。' },
        { type: 'tracer', code: G['pref0.c'], name: '例題 5-3', title: '例題 5-3 — pref_t を 3 つヒープに作る (1 つ 32 バイト)' },
        { type: 'predict', id: 'p3', code: C.p3, hl: [20, 22], q: '関数の中で借りた構造体のポインタを返す。<code class="ic">b = a;</code> の後で <code class="ic">b-&gt;x = 10;</code>。出力は?', choices: ['<code>3 4</code> — b はコピーだから', '<code>10 4</code>', 'エラー — 関数が終わると p の指す先は消える'], answer: 1, explain: 'malloc で借りた領域は<b>関数が終わっても消えない</b> (free するまで残る)。だから課題 5-5 の pref_new のように「作って返す」関数が書ける (B3 の「ローカル変数の番地を返す」との違い!)。b = a は<b>番地のコピー</b>なので, a と b は同じ構造体を指す → <b>10 4</b>。free は 1 回だけ。' },
        { type: 'callout', kind: 'tip', html: '<b>課題 5-6 のポインタの配列</b> <code class="ic">pref_t *p[3];</code> は「pref_t へのポインタ」が 3 つ並んだ配列 (24 バイト)。構造体そのものはヒープに 1 つずつあり, p[i] がそれぞれを指す。課題 5-7 で 47 県分の p を用意しても, 実際に借りるのは読み込んだ県の数だけ。' },
      ],
    },
    {
      id: 'stack', num: '05', group: '4. スタック', kicker: '課題 5-8 整数スタック', navTitle: 'スタック istack',
      title: '最後に入れたものを, 最初に取り出す。',
      lead: 'スタックは FILO (First In Last Out)。3, 2, 1 の順に積むと 1, 2, 3 の逆順で出てくる。深さを実行時に決めたいから, データ領域は malloc で借りる。',
      blocks: [
        { type: 'callout', kind: 'info', html: '<b>動画 ③「データ構造『スタック』」</b> — スタックは<b>バネのついた井戸</b>のようなもの。<b>push</b> すると入力が 1 個井戸に積み込まれ (1 → 2 → 3), <b>pop</b> するたびに一番上から出てくる (3 → 2 → 1)。出力の順番が入力と<b>逆</b>になる — これが <b>FILO (First In Last Out)</b>。深さを実行時に決めたいので, istack_new の中で malloc し (構造体 + データ領域), istack_delete の中で free する。動画でも「<b>free の順番が重要です。よく考えてください</b>」と強調されている (→ 下の point 7)。' },
        { type: 'point', n: 6, title: 'push: <code>data[sp] = d; sp++;</code> / pop: <code>sp--; return data[sp];</code>', sub: 'sp (スタックポインタ) =「今いくつ入っているか」= 次に入れる場所。空は sp == 0, 満杯は sp == size。' },
        { type: 'predict', id: 'p4', code: C.p4, q: '1, 2, 3 を push → pop, pop → 9 を push → pop。出力は?', placeholder: '例: 1 2 3', explain: '最初の pop は最後に入れた <b>3</b>, 次は <b>2</b>。残りは [1]。9 を push して pop すると <b>9</b>。答えは <b>3 2 9</b>。' },
        { type: 'tracer', code: C.stk, name: 'istack の構造', title: '入れ物 (istack_t) と中身 (data) の <b>2 ブロック</b> — realloc で中身だけ 2 倍に引っ越す' },
        { type: 'point', n: 7, title: '解放は<b>中身 → 入れ物</b>の順', sub: 'スライド「スタックとメモリ領域の動的割り当て」: istack_delete の中で free(s->data) → free(s)。先に s を返すと s->data が読めない。' },
        { type: 'mistakes', items: [
          { title: '入れ物を先に free', code: C.m4, fix: 'free(s) の時点で s->data のメンバーも返却済み。<code class="ic">free(s->data); free(s);</code> の順に。' },
        ] },
        { type: 'callout', kind: 'info', html: '<b>realloc(番地, 新しいバイト数)</b> は領域の大きさを変える。中身は引き継がれるが, <b>番地が変わることがある</b>ので戻り値を必ず受け取る: <code class="ic">p = realloc(s-&gt;data, …); if (p == NULL) …; s-&gt;data = p;</code>。istacktest.c では size が 4 → 8 → 16 → 32 → 64 と伸びていく。' },
      ],
    },
    {
      id: 'summary', num: '06', group: 'まとめ', kicker: 'Cheat sheet', navTitle: 'チートシート',
      title: 'B5 を 6 枚で。',
      blocks: [
        { type: 'cheat', items: [
          { c: 'malloc(sizeof(T)*n)', d: 'T 型 n 個分を借りて先頭の番地を返す。中身は不定, 失敗すると NULL。<code class="ic">stdlib.h</code>。', code: 'int *a = malloc(sizeof(int)*n);\nif (a==NULL) { exit(1); }' },
          { c: 'free(p); p = NULL;', d: '必ず返す。返した後は使わない。二重 free もダメ。', code: 'free(a);\na = NULL;' },
          { c: 'strlen(s)+1', d: '文字列のちょうどのサイズ。\'\\0\' の 1 バイトを忘れない。', code: 'c = malloc(strlen(s)+1);\nstrcpy(c, s);' },
          { c: 'fgets(s, N, stdin)', d: '1 行読む (改行も入る)。終わりは <b>NULL</b>。', code: 'while (fgets(s, N, stdin) != NULL)' },
          { c: 'malloc(sizeof(pref_t))', d: '構造体 1 つ。メンバーは <code class="ic">-&gt;</code>。関数が終わっても残るので「作って返す」関数が書ける。', code: 'pref_t *p = malloc(sizeof(pref_t));\np->area = 2187.65;' },
          { c: 'realloc(p, 新バイト数)', d: '大きさを変える。中身は引き継ぎ, 番地は変わりうる。', code: 's->data = realloc(s->data,\n  sizeof(int)*s->size*2);' },
        ] },
      ],
    },
    {
      id: 'lab', num: '07', group: '課題', kicker: 'Assignment Lab', navTitle: '課題ラボ',
      title: '借りて, 使って, 返す。',
      lead: '期待値との diff に加えて, 「割り当てたバイト数がちょうどか」「free 忘れがないか」まで自動で確かめます。コードとメモは自動保存。',
      blocks: [
        { type: 'callout', kind: 'tip', html: '<b>array_scan.c は 5-1 と 5-2, pref.c / pref.h は 5-5〜5-7, istack.c は 5-8 (1)〜(6) で共通</b>のファイルです。どのタブで書いても同じ内容が保存されます。「メモリで追う」では紫の<b>ヒープ</b>領域に借りたブロックが現れ, free すると消えます。' },
        { type: 'lab' },
      ],
    },
    {
      id: 'report', num: '08', group: '課題', kicker: 'Report', navTitle: 'レポート作成',
      title: 'レポートを, 自動で組み立てる。',
      lead: '課題ラボの実行結果と「工夫した点」「感想」のメモから, B4 と同じ形式のレポート (B5.txt) を生成します。<b>提出〆切は 2026/11/08 (日) 23:59</b>。',
      blocks: [{ type: 'report' }],
    },
  ];

  window.UNITS.b5 = {
    title: '動的割当て', source: '[B5] 動的割当て / B5 講義スライド', hero, chapters, tasks: window.B5_TASKS || [],
    predictCount: 5,
  };
})();
