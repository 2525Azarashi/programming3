/* =========================================================================
 *  B3 ポインタ — 章コンテンツ
 *  出典: 配布資料「[B3] ポインタ」と講義スライド「B3.pdf」
 * ========================================================================= */
(function () {
  'use strict';
  const { h, icon } = U;
  const R = String.raw;

  const C = {
    triple0: R`#include <stdio.h>

void triple(int p, int q)
{
    p = 3 * p;
    q = 3 * q;
}

int main(void)
{
    int x = 1, y = 2;

    triple(x, y);

    printf("x = %d, y = %d\n", x, y);
    return 0;
}
`,
    triple1: R`#include <stdio.h>

void triple(int *p, int *q)
/* 2数の番地を受け取り, その番地の内容を3倍する */
{
    *p = 3 * *p;
    *q = 3 * *q;
}

int main(void)
{
    int x = 1, y = 2;

    triple(&x, &y);   /* x, y ではなく, その番地を渡す */

    printf("x = %d, y = %d\n", x, y);
    return 0;
}
`,
    ex31: R`#include <stdio.h>

int main(void)
{
    int a = 1234;
    int b = 6666;
    int c = 9876;

    printf("a の番地は %p\n", &a);
    printf("b の番地は %p\n", &b);
    printf("c の番地は %p\n", &c);

    return 0;
}
`,
    ex32: R`#include <stdio.h>

int main(void)
{
    int a = 1234;
    int b = 6666;

    printf("a の番地は %p\n", &a);   /* 0x64 = 100 番地 */
    printf("b の番地は %p\n", &b);   /* 0x68 = 104 番地 */

    printf("a の値 = %d\n", *((int *)0x64));  /* 100 番地の内容 */

    *((int *)0x64) = 1111;   /* 100 番地 (a) に 1111 を書く */
    *((int *)0x68) = 2010;   /* 104 番地 (b) に 2010 を書く */

    printf("a = %d, b = %d\n", a, b);
    return 0;
}
`,
    ex33: R`#include <stdio.h>

int main(void)
{
    int a = 1234;
    int *p;

    p = &a;              /* a の番地を p に格納 */
    printf("%d\n", *p);  /* *p は p 番地の内容 (= a) */

    *p = *p + 1;         /* p 番地の内容 (= a) を 1 増やす */
    printf("%d\n", a);

    return 0;
}
`,
    funcCopy: R`#include <stdio.h>

void func(int a)
{
    a = 456;
}

int main(void)
{
    int a = 123;

    func(a);   /* 引数は変数 (値のコピー) */
    printf("%d\n", a);
    return 0;
}
`,
    funcPtr: R`#include <stdio.h>

void func(int *pa)
{
    *pa = 456;
}

int main(void)
{
    int a = 123, *pa;

    pa = &a;
    func(pa);  /* 引数はポインタ (番地のコピー) */
    printf("%d\n", a);
    return 0;
}
`,
    item0: R`#include <stdio.h>
#include <string.h>

#define NM_LEN 31

typedef struct {
    char name[NM_LEN+1];   /* 品物の名前 */
    int price;             /* 価格 */
    double weight;         /* 重量 */
} item_t;

void item_double_price(item_t x)
{
    x.price = x.price * 2;
}

int main(void)
{
    item_t a;
    strncpy(a.name, "apple", NM_LEN);
    a.price = 120;
    a.weight = 205.8;

    item_double_price(a);

    printf("%d\n", a.price);
    return 0;
}
`,
    item1: R`#include <stdio.h>
#include <string.h>

#define NM_LEN 31

typedef struct {
    char name[NM_LEN+1];   /* 品物の名前 */
    int price;             /* 価格 */
    double weight;         /* 重量 */
} item_t;

void item_double_price(item_t *x)
{
    x->price = x->price * 2;   /* (*x).price と同じ */
}

int main(void)
{
    item_t a;
    strncpy(a.name, "apple", NM_LEN);
    a.price = 120;
    a.weight = 205.8;

    item_double_price(&a);     /* a のポインタを渡す */

    printf("%d\n", a.price);
    return 0;
}
`,
    arr1: R`#include <stdio.h>

int main(void)
{
    int x[] = {0, 10, 20, 30, 40};
    int *p;

    printf("x      = %p\n", x);        /* 配列名 = 先頭の番地 */
    printf("x + 1  = %p\n", x + 1);    /* int 1 つ分 (4) 進む */
    printf("*(x+2) = %d\n", *(x + 2)); /* x[2] と同じ */

    p = &x[2];
    printf("p[2]   = %d\n", p[2]);     /* *(p+2) = x[4] */
    return 0;
}
`,
    arrFn: R`#include <stdio.h>

#define MAX 16   /* 配列の最大サイズ */

void array_scan(int a[ ], int *pn)
{
    int i;
    for (i=0; i<MAX; i++) {
        if (scanf("%d", &a[i])==EOF) { break; }
    }
    *pn = i;
}

void array_square(int a[ ], int n)
{
    int i;
    for (i=0; i<n; i++) {
        a[i] = a[i]*a[i];
    }
}

void array_print(int a[ ], int n)
{
    int i;
    for (i=0; i<n; i++) {
        if (i!=0) { printf(","); }
        printf("%d", a[i]);
    }
    printf("\n");
}

int main(void)
{
    int a[MAX];
    int n;    /* 配列のサイズ */
    array_scan(a, &n);
    array_square(a, n);
    array_print(a, n);
    return 0;
}
`,
  };

  function valueOf(lines, expr) {
    const src = '#include <stdio.h>\nint main(void)\n{\n' + lines + '\nprintf("%d", ' + expr + ');\nreturn 0;\n}\n';
    const r = CLab.run({ 'm.c': src }, ['m.c'], { maxSnaps: 2 });
    return r.error ? null : r.out.trim();
  }

  function hero(heroMem) {
    return h('section.u-hero',
      h('div.u-hero-grid',
        h('div',
          h('div.code-id', 'UNIT B3 — POINTERS'),
          h('h1', 'ポインタ', h('br'), h('em', '*p = &a;')),
          h('p.tag', '変数には「住所 (番地)」がある。', h('br'), h('span', '番地を使えば, 関数が呼び出し元の変数を書き換えられる。')),
          h('div.u-stats',
            h('div', h('b', '6'), '章'),
            h('div', h('b', '10+2'), '課題 (オプション含む)'),
            h('div', h('b', '6'), '予想問題')),
          h('div.cta',
            h('a.btn.ptr', { href: '#intro' }, '学習を始める', icon('arrow')),
            h('a.btn', { href: '#lab' }, '課題ラボへ'),
            h('a.btn.ghost', { href: '#report' }, 'レポート作成'))),
        heroMem()));
  }

  const chapters = [
    {
      id: 'intro', num: '00', group: 'はじめに', kicker: 'Why pointers?', navTitle: 'なぜポインタ?',
      title: '関数で, 呼び出し元の変数を変えたい。',
      lead: 'return で返せる値は 1 つだけ。2 つ以上の値を返したい・変更したいときに, C 言語では「ポインタ」を使う。まずは予想から。',
      blocks: [
        { type: 'predict', id: 'p0', code: C.triple0, hl: [5, 6, 13], q: '関数 <code class="ic">triple</code> は受け取った p と q を 3 倍している。main で <code class="ic">triple(x, y)</code> を呼んだ後の出力は?', choices: ['<code>x = 1, y = 2</code> — 元のまま', '<code>x = 3, y = 6</code> — 3 倍される'], answer: 0, explain: '<b>呼び出すときに x の値が p に, y の値が q に「コピー」される。</b> triple の中で 3 倍されるのはコピーの p と q なので, 元の x と y は変わらない。下のステップ実行で, triple 用のデータ領域が<b>別の番地</b>に作られる様子を確認しよう。' },
        { type: 'prose', html: '<p>では, x と y を本当に 3 倍にする関数はどう書けばいいか? 答えは「<b>x と y の値</b>ではなく, <b>x と y がメモリのどこにあるか (番地)</b>を渡す」こと。その道具がポインタです。この単元のゴールは, 次のコードを<b>メモリの図で説明できる</b>ようになることです。</p>' },
        { type: 'tracer', code: C.triple1, name: 'ゴール: 例題 3-4 triple (ポインタ版)', title: '<span class="chip ptr">GOAL</span> ▶ 再生 か → キーで 1 ステップずつ進めてみよう' },
      ],
    },
    {
      id: 'addr', num: '01', group: '1. ポインタとは', kicker: '1.1 変数の番地', navTitle: '変数の番地',
      title: '変数は, メモリ上の「番地」に住んでいる。',
      lead: 'C の変数は主記憶 (メインメモリ) に置かれ, 番地 (アドレス) を指定して読み書きされている。番地は 0 以上の整数で, ポインタとはこの番地のことだ。',
      blocks: [
        { type: 'point', n: 1, title: '変数 <code>x</code> の番地は <code>&amp;x</code>', sub: 'printf で番地を出力するには書式 <code class="ic">%p</code> を使う (16 進数で表示される)。' },
        { type: 'tracer', code: C.ex31, name: '例題 3-1 — 変数の番地を表示', title: '例題 3-1 — 宣言するたびに領域が確保され, 番地が決まる' },
        { type: 'callout', kind: 'tip', html: '<b>int は 4 バイト, double は 8 バイト。</b> メモリ図の左の黄色い数字が番地です。このサイトでは講義スライドと同じく main のデータ領域を <b>100 番地</b>から置いています。実際の環境 (cygwin の gcc 等) では <code class="ic">0x22cd0c</code> のような大きな値になり, 実行のたびに変わることもあります。' },
        { type: 'predict', id: 'p1', code: R`#include <stdio.h>

int main(void)
{
    int a = 7;
    double b = 1.5;
    int c = 9;

    printf("%p\n", &a);
    printf("%p\n", &b);
    printf("%p\n", &c);
    return 0;
}
`, q: 'このサイトのメモリモデル (main は 100 番地 = <code class="ic a">0x64</code> から, 宣言順に隙間なく配置) で, 3 行の出力を予想しよう。', placeholder: '0x64\n0x..\n0x..', explain: 'a は 100 (0x64) 番地から 4 バイト。b は double なので 104 (0x68) から <b>8 バイト</b>使う。だから c は 4 ではなく 8 先の 112 (0x70)。型によって占める大きさが違うことが番地の差に表れます。' },
      ],
    },
    {
      id: 'deref', num: '02', group: '1. ポインタとは', kicker: '1.2 番地によるアクセス / 1.3 ポインタ変数', navTitle: '& と * / ポインタ変数',
      title: '番地が分かれば, 名前を使わずに読み書きできる。',
      lead: '「番地 α の変数」は *α で読み書きできる。そして番地そのものを入れておく変数が「ポインタ変数」だ。',
      blocks: [
        { type: 'point', n: 2, title: '番地が α の変数は <code>*α</code> で読み書きできる', sub: '<code class="ic">*((int *)0x64)</code> は「100 番地にある int」。<code class="ic">(int *)</code> は値の型を合わせるためのもの。' },
        { type: 'tracer', code: C.ex32, name: '例題 3-2 — 番地を直接指定して読み書き', title: '例題 3-2 — 番地 0x64 (= a) に直接書き込む' },
        { type: 'callout', kind: 'warn', html: '番地の値はシステムやプログラムのわずかな変更で変わる。<b>番地の値を直接書いて変数にアクセスするのは特殊な場合だけ。</b> 普通は次のポインタ変数を使う。' },
        { type: 'point', n: 3, title: 'int 型変数の番地を保持する変数 p は <code>int *p;</code> と宣言する', sub: '宣言の <code class="ic">*</code> は「ポインタ型」の印。式の中の <code class="ic p">*p</code> は「p が指す先」(間接参照)。<b>同じ記号でも意味が違う</b>。' },
        { type: 'compare', title: '2 つの演算子 — 講義スライド「&amp; 演算子と * 演算子」', items: [
          { title: '<span class="chip addr">&amp;</span> アンパサンド — 番地を調べる', code: 'int a, *p;\np = &a;   /* a の番地を p に格納 */', html: '<code class="ic">&amp;a</code> は「a の番地」。結果は <code class="ic">int *</code> 型。' },
          { title: '<span class="chip ptr">*</span> アスタリスク — 番地の先を読み書き', code: '*p = 123; /* p が指す変数 (a) に 123 */', html: '<code class="ic p">*p</code> は「p に入っている番地の領域」= a そのもの。' },
        ] },
        { type: 'tracer', code: C.ex33, name: '例題 3-3 — ポインタ変数 p で a を操作', title: '例題 3-3 — p = &amp;a の瞬間に<b class="c-ptr">矢印</b>が現れる' },
        { type: 'repl', title: 'ポインタ実験室 — 1 行ずつ書いてメモリを観察', init: ['int a = 10;', 'double x = 2.5;'], quick: ['int *p;', 'p = &a;', '*p = 99;', '*p = *p + 1;', 'double *q = &x;', '*q = *q * 2;', 'int b = 5;', 'p = &b;', 'printf("%d %d\\n", a, *p);'],
          intro: '<b>自由に C の文を打ち込もう。</b> 下のボタンを順に押すだけでも OK。<code class="ic p">p = &amp;a;</code> で矢印が伸び, <code class="ic p">*p = 99;</code> で a が変わる様子を確かめよう。',
          goals: [
            { text: 'ポインタ <code class="ic">p</code> で a を指す', test: (src) => /p\s*=\s*&\s*a\b/.test(src) },
            { text: '<b>「a =」を書かずに</b> a を 100 にする', test: (src) => !/(^|[^\w*.])a\s*=[^=]/m.test(src.replace('int a = 10;', '')) && valueOf(src, 'a') === '100' },
            { text: 'double 型ポインタで x を 2 倍 (5.0) にする', test: (src) => /double\s*\*/.test(src) && valueOf(src, '(int)(x * 10)') === '50' },
          ] },
        { type: 'mistakes', items: [
          { title: '型の合わないポインタ', code: R`#include <stdio.h>

int main(void)
{
    double x = 1.5;
    int *p;
    p = (int *)&x;
    printf("%d\n", *p);
    return 0;
}
`, fix: 'double 型変数には <b>double 型のポインタ</b> (<code class="ic">double *p;</code>) でアクセスする。型が合わないとコンパイルエラーや値の化けが起きる。' },
          { title: '何も指していないポインタ', code: R`#include <stdio.h>

int main(void)
{
    int *p;
    *p = 3;
    printf("%d\n", *p);
    return 0;
}
`, fix: 'ポインタは宣言しただけでは<b>不定 (どこを指すか分からない)</b>。<code class="ic">p = &amp;a;</code> のように番地を入れてから <code class="ic p">*p</code> を使う。' },
        ] },
      ],
    },
    {
      id: 'func', num: '03', group: '2. 関数とポインタ', kicker: '2. ポインタを用いた関数呼び出し', navTitle: 'ポインタ引数',
      title: '番地を渡せば, 関数が元の変数を書き換えられる。',
      lead: '関数を呼ぶと引数はコピーされる。値をコピーしても元は変わらないが, 番地をコピーすれば, 関数はその番地を通して呼び出し元の変数に手が届く。',
      blocks: [
        { type: 'compare', title: '講義スライド「関数の呼び出しと引数のコピー」/「関数の呼び出しとポインタ」', items: [
          { title: '<span class="chip">値を渡す</span> func(a)', html: '<b>a の値 123</b> が func の a にコピーされる。func の中で書き換えても, main の a には影響しない。' },
          { title: '<span class="chip ptr">番地を渡す</span> func(pa)', html: '<b>a の番地 100</b> が func の pa にコピーされる。<code class="ic p">*pa = 456;</code> は「100 番地」= main の a を書き換える。' },
        ] },
        { type: 'tracer', code: C.funcCopy, name: '値渡し — func(a)', title: '<span class="chip">A</span> 値渡し: func のデータ領域 (別の番地) にコピーが作られる' },
        { type: 'tracer', code: C.funcPtr, name: 'ポインタ渡し — func(pa)', title: '<span class="chip ptr">B</span> ポインタ渡し: コピーされた番地の矢印が main の a を指す' },
        { type: 'predict', id: 'p2', code: R`#include <stdio.h>

void swap(int *a, int *b)
{
    int t = *a;
    *a = *b;
    *b = t;
}

int main(void)
{
    int x = 3, y = 8;
    swap(&x, &y);
    printf("%d %d\n", x, y);
    return 0;
}
`, q: '2 つの変数の値を入れ替える関数 swap。出力は?', placeholder: '例: 3 8', explain: 'swap には x と y の<b>番地</b>が渡されるので, <code class="ic p">*a</code> は x, <code class="ic p">*b</code> は y そのもの。中身が入れ替わり <b>8 3</b> になる。ポインタを使わない swap(int a, int b) では入れ替わらない。' },
        { type: 'callout', kind: 'tip', html: '<b>実はもう使っていた:</b> <code class="ic">scanf("%d", &amp;x);</code> の <code class="ic">&amp;</code> はこれ。scanf は読み込んだ値を x に書き込む必要があるので, x の<b>番地</b>を受け取っている。' },
        { type: 'mistakes', items: [
          { title: '& を付け忘れた', code: R`#include <stdio.h>

void triple(int *p)
{
    *p = 3 * *p;
}

int main(void)
{
    int x = 1;
    triple(x);
    printf("%d\n", x);
    return 0;
}
`, fix: '仮引数が <code class="ic">int *p</code> なら, 渡すのは番地: <code class="ic">triple(&amp;x);</code>' },
          { title: 'scanf の & 忘れ', code: R`#include <stdio.h>

int main(void)
{
    int x;
    scanf("%d", x);
    printf("%d\n", x);
    return 0;
}
`, stdin: '5', fix: '<code class="ic">scanf("%d", &amp;x);</code> — scanf にも「書き込み先の番地」を渡す。' },
        ] },
      ],
    },
    {
      id: 'struct', num: '04', group: '3. 構造体と配列', kicker: '3.1 構造体へのポインタ', navTitle: '構造体へのポインタ',
      title: '構造体も, 書き換えたいならポインタで渡す。',
      lead: '構造体を引数に渡すと, 中身がまるごとコピーされる。書き換えるにはポインタを渡し, メンバーは -> で指定する。',
      blocks: [
        { type: 'predict', id: 'p3', code: C.item0, hl: [12, 13, 14, 23], q: 'item_double_price(a) を呼ぶと, a.price は 2 倍になるだろうか?', choices: ['<code>120</code> — 変わらない', '<code>240</code> — 2 倍になる'], answer: 0, explain: '答えは <b>no</b>。呼び出すと a の内容が x に<b>まるごとコピー</b>される。書き換えられるのはコピーの x であって a ではない。' },
        { type: 'tracer', code: C.item1, name: '構造体へのポインタ — item_double_price(&a)', title: 'ポインタ版: <code class="ic p">x-&gt;price</code> は main の a.price を直接書き換える' },
        { type: 'cheat', items: [
          { c: 'a.price', d: '構造体<b>変数</b>のメンバー', code: 'item_t a;\na.price = 120;' },
          { c: 'x->price', d: '構造体への<b>ポインタ</b>からメンバー (一般的な書き方)', code: 'item_t *x = &a;\nx->price = 240;' },
          { c: '(*x).price', d: '-> と同じ意味。<code class="ic">.</code> の方が <code class="ic">*</code> より優先度が高いのでカッコが必要', code: '(*x).price = 240;' },
        ] },
        { type: 'callout', kind: 'tip', html: '書き換えない場合でも, 構造体が大きいときは<b>コピーのオーバーヘッドを避けるため</b>にポインタを渡すことがある (課題 3-7 の dist がその例)。' },
      ],
    },
    {
      id: 'array', num: '05', group: '3. 構造体と配列', kicker: '3.2 配列へのポインタ', navTitle: '配列とポインタ',
      title: '配列名は, 先頭要素の番地そのもの。',
      lead: '配列名を [ ] なしで使うと, その配列の先頭アドレスを表す。だから配列を関数に渡すと, 配列全体ではなく先頭アドレスだけがコピーされる。',
      blocks: [
        { type: 'compare', title: '講義スライド「配列名はそのままポインタ」', items: [
          { title: '添字で書く', code: 'x[0] = 123;\nx[2] = 456;' },
          { title: 'ポインタで書く (同じ意味)', code: '*x     = 123;\n*(x+2) = 456;' },
        ] },
        { type: 'point', n: 4, title: '<code>x + i</code> は「i 要素ぶん先」の番地', sub: 'int の配列なら <code class="ic">x + 1</code> は番地が <b>1 ではなく 4</b> 進む。<code class="ic">x[i]</code> は <code class="ic p">*(x + i)</code> の別の書き方。' },
        { type: 'tracer', code: C.arr1, name: '配列とアドレス', title: '配列 x と, x[2] を指すポインタ p' },
        { type: 'predict', id: 'p4', code: R`#include <stdio.h>

int main(void)
{
    int x[] = {0, 10, 20, 30, 40};
    int *p = &x[1];

    printf("%d %d\n", *(p + 2), p[-1]);
    return 0;
}
`, q: 'p は x[1] を指している。<code class="ic">*(p + 2)</code> と <code class="ic">p[-1]</code> の値は?', placeholder: '例: 0 0', explain: 'p + 2 は x[1] の 2 つ先 = x[3] の番地なので <b>30</b>。p[-1] は *(p - 1) = x[0] で <b>0</b>。' },
        { type: 'prose', html: '<p>関数の引数の宣言では <code class="ic">int a[ ]</code> と書いても <code class="ic">int *a</code> と書いても<b>同じ意味</b>。呼び出された関数の中で配列の要素を書き換えると, <b>元の配列の要素が書き換わる</b>。</p>' },
        { type: 'tracer', code: C.arrFn, name: '例題 3-6 — 配列を関数で 2 乗', stdin: '3 1 4', showStdin: true, title: '例題 3-6 — array_square の a は main の a[0] を指している (stdin は自由に変更可)' },
        { type: 'predict', id: 'p5', code: R`#include <stdio.h>

void func(int *x)
{
    x[0] = 456;
}

int main(void)
{
    int x[4] = {1, 2, 3, 4};
    func(x);
    printf("%d\n", x[0]);
    return 0;
}
`, q: '配列名 x をそのまま渡した。出力は?', choices: ['<code>1</code> — 配列はコピーされるので変わらない', '<code>456</code> — 元の配列が書き換わる'], answer: 1, explain: '配列名 x は<b>先頭の番地</b>。func の x にはその番地がコピーされるので, x[0] = 456 は main の配列を直接書き換える (講義スライド「配列名(アドレス)を引数として渡す」)。' },
      ],
    },
    {
      id: 'summary', num: '06', group: 'まとめ', kicker: 'Cheat sheet', navTitle: 'チートシート',
      title: 'B3 を 6 枚で。',
      blocks: [
        { type: 'cheat', items: [
          { c: '&a', d: '変数 a の<b>番地</b>。printf では <code class="ic">%p</code>。', code: 'printf("%p\\n", &a);' },
          { c: 'int *p;', d: 'int の番地を入れる<b>ポインタ変数</b>の宣言。double なら double *p;', code: 'int *p;\ndouble *q;' },
          { c: '*p', d: 'p が<b>指す先</b>の変数そのもの (読み書きできる)。', code: 'p = &a;\n*p = *p + 1; /* a++ */' },
          { c: 'f(&x)', d: '関数に<b>番地を渡す</b>と, 関数が x を書き換えられる。複数の結果も返せる。', code: 'void f(int *p) { *p = 0; }\nf(&x);' },
          { c: 'p->m', d: '構造体へのポインタからメンバー。<code class="ic">(*p).m</code> と同じ。', code: 'void g(item_t *p)\n{ p->price *= 2; }' },
          { c: 'a ≡ &a[0]', d: '配列名は先頭の番地。<code class="ic">a[i]</code> ≡ <code class="ic">*(a+i)</code>。関数に渡すと元の配列が変わる。', code: 'void h(int a[], int n);\nh(a, n);' },
        ] },
      ],
    },
    {
      id: 'lab', num: '07', group: '課題', kicker: 'Assignment Lab', navTitle: '課題ラボ',
      title: '書いて, テストして, メモリで確かめる。',
      lead: 'このページ上で課題のコードを書き, 期待値との diff を自動チェック。つまずいたら「メモリで追う」で自分のコードをステップ実行しよう。コードとメモは自動保存されます。',
      blocks: [
        { type: 'callout', kind: 'tip', html: 'このサイトは学習用の C インタプリタで動いています。<b>提出前には必ず自分の環境 (gcc) でもコンパイル・実行</b>して確認してください。番地の値は実際の環境では異なります。「保存」ボタンで .c ファイルをダウンロードできます。' },
        { type: 'lab' },
      ],
    },
    {
      id: 'report', num: '08', group: '課題', kicker: 'Report', navTitle: 'レポート作成',
      title: 'レポートを, 自動で組み立てる。',
      lead: '課題ラボの実行結果と「工夫した点」「感想」「考察」のメモから, B2 と同じ形式のレポート (B3.txt) を生成します。',
      blocks: [{ type: 'report' }],
    },
  ];

  window.UNITS.b3 = {
    title: 'ポインタ', source: '[B3] ポインタ / B3 講義スライド', hero, chapters, tasks: window.B3_TASKS || [],
    predictCount: 6,
  };
})();
