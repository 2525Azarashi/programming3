/* =========================================================================
 *  B4 配列と構造体 — 章コンテンツ
 *  出典: 配布資料「[B4] 配列と構造体」と講義スライド「B4.pdf」
 * ========================================================================= */
(function () {
  'use strict';
  const { h, icon } = U;
  const R = String.raw;
  const W = window.B4_CODE || {};

  const C = {
    mat0: R`#include <stdio.h>

int main(void)
{
    double a[3][4];   /* 3 行 4 列の 2 次元配列 */
    int i, j;

    a[0][0] = 2;  a[0][1] = 1;  a[0][2] = 4;  a[0][3] = 5;
    a[1][0] = 9;  a[1][1] = 0;  a[1][2] = 5;  a[1][3] = 7;
    a[2][0] = 6;  a[2][1] = 7;  a[2][2] = 8;  a[2][3] = 9;

    for (i=0; i<3; i++) {
        for (j=0; j<4; j++) {
            printf(" %3.0f", a[i][j]);
        }
        printf("\n");
    }
    return 0;
}
`,
    d32: R`#include <stdio.h>

int main(void)
{
    double c[2];
    int d[3][2];
    int i, j;

    c[0] = 1.5;  c[1] = 2.5;
    for (i=0; i<3; i++) {
        for (j=0; j<2; j++) {
            d[i][j] = 10*i + j;
        }
    }
    printf("%p %p %p\n", &d[0][0], &d[0][1], &d[1][0]);
    return 0;
}
`,
    fn2d: R`#include <stdio.h>
#define N 3

/* 2 次元配列を受け取る関数: 列の数 [N] は省略できない */
void matrix_twice(int n, double A[N][N])
{
    int i, j;
    for (i=0; i<n; i++) {
        for (j=0; j<n; j++) {
            A[i][j] = 2 * A[i][j];
        }
    }
}

int main(void)
{
    double A[N][N] = { {1, 2, 3}, {4, 5, 6}, {7, 8, 9} };

    matrix_twice(2, A);   /* 左上 2×2 だけ 2 倍 */
    printf("%.0f %.0f %.0f\n", A[0][0], A[1][1], A[2][2]);
    return 0;
}
`,
    pix: R`#include <stdio.h>

typedef struct {
    unsigned char r;     /* 赤の輝度 (0〜255) */
    unsigned char g;     /* 緑の輝度 (0〜255) */
    unsigned char b;     /* 青の輝度 (0〜255) */
} pixel_t;

int main(void)
{
    pixel_t x, y[3][2];

    x.r = 255;  x.g = 0;  x.b = 255;   /* 赤紫 */
    y[1][0].r = 255;                   /* スライドの例 */
    y[1][0].g = 128;
    y[1][0].b = 128;
    y[0][1] = y[1][0];                 /* 構造体はまるごと代入できる */

    printf("%d %d\n", (int)sizeof(pixel_t), (int)sizeof(y));
    return 0;
}
`,
    item: R`#include <stdio.h>
#include <string.h>

typedef struct {
    char   name[32];
    int    price;
    double weight;
} item_t;

int main(void)
{
    item_t a;

    strcpy(a.name, "Apple");   /* a.name は配列名 (= 先頭の番地) */
    a.name[0] = 'a';           /* 1 文字だけ書き換え */
    a.price = 120;
    a.weight = 205.8;

    printf("%s %d %.1f\n", a.name, a.price, a.weight);
    return 0;
}
`,
    cool: R`#include <stdio.h>

typedef struct { unsigned char r, g, b; } pixel_t;

int main(void)
{
    pixel_t img[2][3];   /* 縦 2 × 横 3 の小さな画像 */
    int i, j;

    for (i=0; i<2; i++) {
        for (j=0; j<3; j++) {
            img[i][j].r = 200;
            img[i][j].g = 100 + 50*j;
            img[i][j].b = 60 * i;
        }
    }
    /* 涼しげに: 赤だけ 0.8 倍 */
    for (i=0; i<2; i++) {
        for (j=0; j<3; j++) {
            img[i][j].r = img[i][j].r * 0.8;
        }
    }
    printf("%d %d %d\n", img[1][2].r, img[1][2].g, img[1][2].b);
    return 0;
}
`,
  };

  function hero(heroMem) {
    return h('section.u-hero',
      h('div.u-hero-grid',
        h('div',
          h('div.code-id', 'UNIT B4 — ARRAYS & STRUCTS'),
          h('h1', '配列と構造体', h('br'), h('em', 'img[y][x].r')),
          h('p.tag', '2 次元配列で行列を, 構造体の配列で画像を。', h('br'), h('span', '[ ] と . を組み合わせれば, 複雑なデータもメモリに並べられる。')),
          h('div.u-stats',
            h('div', h('b', '7'), '章'),
            h('div', h('b', '14+2'), '課題 (オプション含む)'),
            h('div', h('b', '5'), '予想問題')),
          h('div.cta',
            h('a.btn.ptr', { href: '#intro' }, '学習を始める', icon('arrow')),
            h('a.btn', { href: '#lab' }, '課題ラボへ'),
            h('a.btn.ghost', { href: '#report' }, 'レポート作成'))),
        heroMem()));
  }

  const chapters = [
    {
      id: 'intro', num: '00', group: 'はじめに', kicker: 'Why 2D?', navTitle: 'なぜ 2 次元?',
      title: '表も, 画像も, 「縦×横」に並んだデータ。',
      lead: '配列でベクトル (1 列) が表せた。では行列や画像のような「縦×横」のデータは? C では [ ] を 2 つ重ねる。',
      blocks: [
        { type: 'predict', id: 'p0', code: C.mat0, hl: [5], q: '3×4 の行列を 2 次元配列 <code class="ic">a[3][4]</code> に入れて表示する。<b>2 行目の出力</b>は?', choices: ['<code>  2   1   4   5</code>', '<code>  9   0   5   7</code>', '<code>  1   0   7   8</code>'], answer: 1, explain: '添字は <b>0 から</b>始まるので, a[1][…] が数学の 2 行目。外側の for (i) が行, 内側の for (j) が列を回すので, 1 行ずつ表示される。' },
        { type: 'widget', title: '<span class="chip ptr">GOAL</span> この単元の終わりには, こんな画像処理を自分の C で書けるようになる', make: () => W.demoGallery([['4-2-1', '涼しげ (cool)'], ['4-2-2', 'モノクロ (mono)'], ['4-2-5', 'モザイク (mosaic)'], ['4-2-4', '鏡像 (mirror)']]) },
      ],
    },
    {
      id: 'arr2d', num: '01', group: '1. 2 次元配列', kicker: '1. 2 次元配列とメモリ', navTitle: '2 次元配列とメモリ',
      title: '[ ] を 2 つ重ねると, 行列になる。',
      lead: '数学の a_{i,j} は C では a[i][j]。ただし i も j も 0 から。そしてメモリの中では, 縦×横の表も 1 列に並んでいる。',
      blocks: [
        { type: 'point', n: 1, title: '<code>double a[3][4];</code> は「要素 4 個の配列」が 3 つ', sub: '<code class="ic">a[i][j]</code> は i 行 j 列。全部で 3×4 = 12 要素, double なので 96 バイト。' },
        { type: 'tracer', code: C.d32, name: '講義スライド「配列宣言とメモリ領域」', title: 'double c[2] の後ろに int d[3][2] — d[0][1] (0x78) の<b>すぐ次</b>が d[1][0] (0x7c)' },
        { type: 'point', n: 2, title: '多重配列では, <b>後ろの添字</b>が近いメモリアドレスに配置される', sub: 'd[0][0], d[0][1], d[1][0], d[1][1], … の順 (行優先)。d[i][j] の番地 = 先頭 + (i × 列数 + j) × 要素サイズ。' },
        { type: 'predict', id: 'p1', code: R`#include <stdio.h>

int main(void)
{
    int d[3][2];

    printf("%p\n", &d[0][0]);
    printf("%p\n", &d[2][1]);
    return 0;
}
`, q: 'このサイトのメモリモデル (d は 100 番地 = <code class="ic a">0x64</code> から) で, <code class="ic">&amp;d[2][1]</code> は?', placeholder: '0x64\n0x..', explain: 'd[2][1] は先頭から (2×2 + 1) = <b>5 個目</b>。int は 4 バイトなので 100 + 5×4 = 120 = <b>0x78</b>。' },
        { type: 'mistakes', items: [
          { title: 'a[i, j] と書いてしまう', code: R`#include <stdio.h>

int main(void)
{
    int a[2][3];
    a[1, 2] = 5;
    printf("%d\n", a[1][2]);
    return 0;
}
`, fix: 'C では <code class="ic">a[i][j]</code> と<b>カッコを 2 つ</b>書く。<code class="ic">a[1, 2]</code> はコンマ演算子で a[2] (行そのもの = 配列) の意味になり, gcc でもエラーになる。' },
          { title: '添字が範囲外 (行列は 1 から数えない)', code: R`#include <stdio.h>

int main(void)
{
    int a[2][2] = { {1, 2}, {3, 4} };
    printf("%d\n", a[2][2]);
    return 0;
}
`, fix: '<code class="ic">int a[2][2]</code> の添字は 0〜1。数学の a_{2,2} は C の <code class="ic">a[1][1]</code>。' },
        ] },
      ],
    },
    {
      id: 'func2d', num: '02', group: '1. 2 次元配列', kicker: '1. 課題 4-1 行列の関数', navTitle: '2 次元配列と関数',
      title: '行列を関数に渡して, 足す・転置する・掛ける。',
      lead: '2 次元配列を関数に渡すときも, コピーされるのは先頭の番地。だから関数の中で書き換えると, 呼び出し元の行列が変わる。',
      blocks: [
        { type: 'point', n: 3, title: '仮引数は <code>double A[N][N]</code> — <b>列数は省略できない</b>', sub: 'A[i][j] の番地を計算するのに「1 行が何要素か」が必要だから。課題では matrix.h の <code class="ic">#define N 8</code> を使い, 実際の大きさ n (≦ N) を別の引数で渡す。' },
        { type: 'tracer', code: C.fn2d, name: '2 次元配列を関数で書き換える', title: 'matrix_twice の A は main の A を指している (左上 2×2 だけ 2 倍)' },
        { type: 'widget', title: '行列アニメーション — 課題 4-1 の (3) 和 / (4)(5) 転置 / (7) 行列×ベクトル', make: () => W.matrixAnim() },
        { type: 'predict', id: 'p2', code: R`#include <stdio.h>

int main(void)
{
    int A[2][2] = { {1, 2}, {3, 4} };
    int i, j, tmp;

    for (i=0; i<2; i++) {
        for (j=0; j<2; j++) {
            tmp = A[i][j];
            A[i][j] = A[j][i];
            A[j][i] = tmp;
        }
    }
    printf("%d %d\n%d %d\n", A[0][0], A[0][1], A[1][0], A[1][1]);
    return 0;
}
`, q: '自分自身を転置しようとして, <b>全ての i, j で</b>交換した。出力は?', choices: ['<code>1 3 / 2 4</code> — 転置できた', '<code>1 2 / 3 4</code> — 元のまま'], answer: 1, explain: '(i, j) = (0, 1) で A[0][1] と A[1][0] が交換され, (1, 0) でもう一度交換されて<b>元に戻る</b>。課題 4-1 (5) では <code class="ic">j = i+1</code> から始めて, 対角より上だけを交換する。' },
        { type: 'callout', kind: 'tip', html: '<b>printf の幅指定</b> (課題 4-1 (1)): <code class="ic">%9.5f</code> は「全体 9 文字, 小数点以下 5 桁」。足りない分は左が空白になるので, 桁数が違っても右端がそろう。' },
      ],
    },
    {
      id: 'structarr', num: '03', group: '2. 構造体と配列', kicker: '2. 構造体の配列', navTitle: '構造体の配列 pixel_t',
      title: '構造体を並べれば, 色の画素がずらりと並ぶ。',
      lead: 'カラー画像の 1 画素は赤・緑・青の 3 つの輝度。これを構造体 pixel_t にまとめ, 2 次元配列にすれば画像になる。',
      blocks: [
        { type: 'point', n: 4, title: '<code>pixel_t y[3][2];</code> の <code>y[1][0].r</code> は「1 行 0 列の画素の赤」', sub: '[ ] で要素を選び, <code class="ic">.</code> でメンバーを選ぶ。<code class="ic">unsigned char</code> は 1 バイトで 0〜255 (符号なし)。' },
        { type: 'widget', title: '色合成 — pixel_t の r, g, b を動かしてみよう', make: () => W.pixPlay() },
        { type: 'tracer', code: C.pix, name: '講義スライド「構造体の配列」', title: 'pixel_t x, y[3][2] — 1 画素 3 バイト, y は 3×2×3 = 18 バイト' },
        { type: 'predict', id: 'p3', code: C.cool, hl: [21], q: '赤の輝度 200 を 0.8 倍すると 160。では img[1][2] の (r, g, b) の出力は?', placeholder: '例: 0 0 0', explain: 'img[1][2] は i=1, j=2 なので g = 100 + 50×2 = 200, b = 60×1 = 60。r は 200×0.8 = <b>160</b>。答えは <b>160 200 60</b>。これが課題 4-2 (1) の「涼しげ」処理の正体。' },
        { type: 'mistakes', items: [
          { title: 'unsigned char のあふれ', code: R`#include <stdio.h>

int main(void)
{
    unsigned char c = 250;
    c = c + 10;
    printf("%d\n", c);
    return 0;
}
`, fix: 'unsigned char は 0〜255 しか入らないので, 260 は 256 を引いた <b>4</b> になる。明るくする処理では <code class="ic">if (v &gt; 255) v = 255;</code> のように int で計算してから制限しよう。' },
        ] },
      ],
    },
    {
      id: 'structmem', num: '04', group: '2. 構造体と配列', kicker: '2. 配列をメンバーに持つ構造体', navTitle: '配列を持つ構造体',
      title: '構造体の中に, 配列を入れることもできる。',
      lead: '品物の名前は文字の配列。構造体のメンバーに配列を持たせれば, 名前・価格・重さを 1 つにまとめられる。',
      blocks: [
        { type: 'point', n: 5, title: '<code>a.name</code> は配列名 (= ポインタ) — 代入ではなく <code>strcpy</code>', sub: '<code class="ic">strcpy(a.name, "Apple");</code> で文字列をコピー, <code class="ic">a.name[0] = \'A\';</code> で 1 文字ずつ書き換えられる。' },
        { type: 'tracer', code: C.item, name: '講義スライド「配列をメンバに持つ構造体」', title: 'item_t a — name[32] の後ろに price, weight が並ぶ' },
        { type: 'predict', id: 'p4', code: R`#include <stdio.h>
#include <string.h>

typedef struct {
    char name[8];
    int  price;
} item_t;

int main(void)
{
    item_t a;
    strcpy(a.name, "pen");
    a.name[0] = 'P';
    a.price = 100;
    printf("%s %d\n", a.name, (int)sizeof(a));
    return 0;
}
`, q: 'name[8] (8 バイト) + int (4 バイト)。出力は?', placeholder: '例: pen 0', explain: 'a.name[0] を \'P\' にしたので "<b>Pen</b>"。大きさは 8 + 4 = <b>12</b> バイト。' },
        { type: 'mistakes', items: [
          { title: '文字列を = で代入', code: R`#include <stdio.h>
#include <string.h>

typedef struct { char name[32]; int price; } item_t;

int main(void)
{
    item_t a;
    a.name = "Apple";
    printf("%s\n", a.name);
    return 0;
}
`, fix: '配列には = でまとめて代入できない。<code class="ic">strcpy(a.name, "Apple");</code> を使う (string.h をインクルード)。' },
        ] },
        { type: 'callout', kind: 'tip', html: '<b>構造体の中に構造体</b>も入れられる。課題 4-3 の <code class="ic">bmp_data_t</code> は「ヘッダ構造体 + 画素の 2 次元配列」をまとめたもの。<code class="ic">bmp-&gt;header.biWidth</code>, <code class="ic">bmp-&gt;img[i][j].r</code> のように <code class="ic">-&gt;</code> <code class="ic">.</code> <code class="ic">[ ]</code> を組み合わせてたどる。' },
      ],
    },
    {
      id: 'bitmap', num: '05', group: '3. ビットマップ', kicker: '課題 4-2 / 4-3 画像処理', navTitle: 'ビットマップ画像',
      title: '画像は, 画素の 2 次元配列にすぎない。',
      lead: 'BMP ファイルは「ヘッダ (幅・高さなど)」+「画素データ」。読み込んでしまえば, img[y][x] の r, g, b を書き換えるだけで画像処理になる。',
      blocks: [
        { type: 'cheat', items: [
          { c: 'img[y][x]', d: '座標 (x, y) の画素。<b>x と y の順序が逆</b>になることに注意 (行 = y が先)。', code: 'pixel_t img[MAX_Y][MAX_X];\nimg[y][x].r = 255;' },
          { c: 'hd->biWidth', d: '画像の幅 (横の画素数)。hd はヘッダ構造体へのポインタ。', code: 'for (j=0; j<hd->biWidth; j++)' },
          { c: 'hd->biHeight', d: '画像の高さ。書き換えると bmp_write が書き出す行数も変わる (縮小)。', code: 'hd->biHeight /= 2;' },
          { c: '下の行から', d: 'BMP は<b>画像の一番下の行から</b>格納される。img[0] が一番下。回転のときに効いてくる。', code: '/* img[0][*] = 最下行 */' },
        ] },
        { type: 'widget', title: '画像ラボ — 期待される出力 (gcc で模範解答を実行した結果)', make: () => W.demoGallery([['4-2-3', 'フレーム (frame)'], ['4-2-6', '縮小 (collapse)'], ['o4-2', '90° 回転 (option)']]) },
        { type: 'callout', kind: 'info', html: '<b>このサイトでは</b> in.bmp を配布の猫の写真から <b>128×80 画素</b>に縮小し, image1.h の MAX_X, MAX_Y を 128 にして動かしています (学習用インタプリタの速度のため)。fopen / fread / fwrite はページ内の仮想ファイルで動作し, 出力は gcc と<b>バイト単位で一致</b>することを確認済み。提出前には自分の環境 (512) でも実行しよう。' },
      ],
    },
    {
      id: 'summary', num: '06', group: 'まとめ', kicker: 'Cheat sheet', navTitle: 'チートシート',
      title: 'B4 を 6 枚で。',
      blocks: [
        { type: 'cheat', items: [
          { c: 'a[i][j]', d: 'i 行 j 列。添字は 0 から。<b>後ろの添字</b>が隣の番地 (行優先)。', code: 'double a[3][4];\na[1][2] = 5;' },
          { c: 'f(int n, double A[N][N])', d: '2 次元配列の仮引数。<b>列数は省略不可</b>。先頭の番地が渡るので書き換えは呼び出し元に残る。', code: 'matrix_print(n, A);' },
          { c: 'tmp で交換', d: '自分自身の転置・左右反転は<b>半分だけ</b>交換 (全部だと 2 回で元通り)。', code: 'for (j=i+1; j<n; j++) {\n  tmp=A[i][j]; A[i][j]=A[j][i]; A[j][i]=tmp; }' },
          { c: 'y[1][0].r', d: '構造体の配列: [ ] で要素, . でメンバー。unsigned char は 0〜255。', code: 'pixel_t y[3][2];\ny[1][0].r = 255;' },
          { c: 'strcpy(a.name, "…")', d: '配列メンバーへの文字列は strcpy。1 文字なら <code class="ic">a.name[0] = \'A\';</code>', code: 'item_t a;\nstrcpy(a.name, "Apple");' },
          { c: 'bmp->img[i][j].r', d: '構造体の中の配列の中の構造体。-&gt; . [ ] を左から順にたどる。', code: 'bmp->header.biHeight /= 2;' },
        ] },
      ],
    },
    {
      id: 'lab', num: '07', group: '課題', kicker: 'Assignment Lab', navTitle: '課題ラボ',
      title: '行列を計算し, 画像を加工する。',
      lead: '行列の課題は期待値との diff を, 画像の課題は gcc で模範解答を実行した out.bmp との全画素比較を自動で行います。コードとメモは自動保存。',
      blocks: [
        { type: 'callout', kind: 'tip', html: '<b>matrix.c は 4-1 (1)〜(7) とオプション 1 で共通</b>のファイルです。どの課題のタブで書いても同じ内容が保存されるので, 1 つずつ関数を足していこう。画像課題は「テスト実行」で in.bmp / あなたの out.bmp / 期待画像 が並び, マウスで画素の値を調べられます。' },
        { type: 'lab' },
      ],
    },
    {
      id: 'report', num: '08', group: '課題', kicker: 'Report', navTitle: 'レポート作成',
      title: 'レポートを, 自動で組み立てる。',
      lead: '課題ラボの実行結果と「工夫した点」「感想」のメモから, B3 と同じ形式のレポート (B4.txt) を生成します。',
      blocks: [{ type: 'report' }],
    },
  ];

  window.UNITS.b4 = {
    title: '配列と構造体', source: '[B4] 配列と構造体 / B4 講義スライド', hero, chapters, tasks: window.B4_TASKS || [],
    predictCount: 5,
  };
})();
