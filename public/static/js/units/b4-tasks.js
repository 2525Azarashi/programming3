/* B4 配列と構造体 — 課題定義 (出典: 配布資料「[B4] 配列と構造体」) */
(function () {
  'use strict';
  const R = String.raw;
  const D = window.B4_DATA || { sol: {}, given: {}, exp: {}, inp: {}, ref: {} };
  const G = D.given || {}, E = D.exp || {}, I = D.inp || {};
  const C = new Proxy({}, { get: (_, k) => (window.B4_CODE || {})[k] });   /* b4-code.js は後から読み込まれる */
  const pick = (...ks) => { const o = {}; ks.forEach((k) => (o[k] = G[k])); return o; };

  /* matrix.c は 4-1 (1)〜(7) とオプション 1 で同じファイルを育てる (共有保存) */
  const MATRIX_START = R`#include <stdio.h>
#include <assert.h>
#include "matrix.h"

/* 行列の出力 */
void matrix_print(int n, double A[N][N])
{
    int i, j;
    assert(n<=N);
    for (i=0; i<n; i++) {
        for (j=0; j<n; j++) {
            printf(" %.5f", A[i][j]);   /* ← (1) 書式を調整する */
        }
        printf("\n");
    }
}

/* (2) 以降の関数をここに追加していく */
`;
  const share = ['matrix.c'];
  const matTask = (o) => Object.assign({ files: ['matrix.c'], share, starter: { 'matrix.c': MATRIX_START } }, o);
  const IMGREQ = '<div class="req"><span class="chip val">in.bmp = 配布の猫の写真 (このサイトでは 128×80 に縮小)</span><span class="chip">image1.h / image1.c はタブで閲覧可</span><span class="chip addr">MAX_X, MAX_Y はこのサイトでは 128</span></div>';

  function imgTask(id, label, short, file, fn, title, spec, body, hints, summary, opt) {
    opt = opt || {};
    const head = R`#include <stdio.h>
#include "image1.h"

/* 画像処理の関数 */
void ${fn}(bmp_header_t *hd, pixel_t img[MAX_Y][MAX_X]);

int main(void)
{
  bmp_header_t hd;
  pixel_t img [MAX_Y][MAX_X];

  bmp_read("in.bmp", &hd, img);     /* in.bmp から読み込む */
  ${fn}(&hd, img);               /* 処理の呼び出し */
  bmp_write("out.bmp", &hd, img);   /* out.bmp への書き出し */
  return 0;
}

/* 画像処理の関数の本体 */
void ${fn}(bmp_header_t *hd, pixel_t img[MAX_Y][MAX_X])
{
${body}
}
`;
    const units = [file, 'image1.c'];
    return {
      id, label, short, files: [file], given: pick('image1.h', 'image1.c'), link: units, gcc: file + ' image1.c', noTrace: true, noStdin: true,
      title, spec: spec + IMGREQ, starter: { [file]: head }, hints, summary, reportTitle: '課題 4.2 (' + label.slice(4, 5) + ')',
      busy: '画像処理を実行中… (128×80 画素)',
      custom: (src) => (opt.frame ? frameTask(src, units) : C.imageTask(id, units)(src)),
      term: (st) => C.imageTerm(id, 'gcc ' + file + ' image1.c')(st),
    };
  }

  /* フレームは色が自由なので「外周 8 画素が一様なピンク系 + 内側は元のまま」で判定 */
  function frameTask(src, units) {
    const { h } = U;
    const r = CLab.run(src, units, { stdin: '', maxSnaps: 2, maxOps: 40000000, vfs: { 'in.bmp': C.inBmp() } });
    const box = h('div');
    if (r.error) { box.appendChild(h('div.er', (r.error.phase === 'compile' ? 'コンパイルエラー' : '実行時エラー') + (r.error.loc ? ' [' + r.error.loc.file + ':' + r.error.loc.line + ']' : '') + '\n' + r.error.msg)); return { ok: false, out: box, text: '', msg: 'エラーで止まりました: ' + r.error.msg.slice(0, 60), wide: true, wide: true }; }
    const out = r.vfs['out.bmp'];
    if (!out) return { ok: false, out: box, text: '', msg: 'out.bmp が書き出されていません', wide: true };
    const P = C.imgPanel({ inBmp: C.inBmp(), outBmp: out, refBmp: C.refBmp('4-2-3') });
    box.appendChild(P.el);
    const o = P.outI, a = C.parseBmp(C.inBmp());
    if (!o || o.w !== a.w || o.h !== a.h) return { ok: false, out: box, text: '', msg: '画像のサイズが変わっています', wide: true };
    let c0 = null, bad = 0, inner = 0;
    for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) {
      const d = (y * o.w + x) * 4, edge = y < 8 || y >= o.h - 8 || x < 8 || x >= o.w - 8;
      const p = [o.px[d], o.px[d + 1], o.px[d + 2]];
      if (edge) { if (!c0) c0 = p; if (p[0] !== c0[0] || p[1] !== c0[1] || p[2] !== c0[2]) bad++; }
      else if (p[0] !== a.px[d] || p[1] !== a.px[d + 1] || p[2] !== a.px[d + 2]) inner++;
    }
    const text = 'input file = "in.bmp"\noutput file = out.bmp\n(フレームの色: r=' + c0[0] + ', g=' + c0[1] + ', b=' + c0[2] + ')';
    if (bad) return { ok: false, out: box, text, msg: '外周 8 画素の中に色の違う画素が ' + bad + ' 個あります (幅は 8 画素?)', wide: true };
    if (inner) return { ok: false, out: box, text, msg: '内側の画素が ' + inner + ' 個変わっています (フレームが太すぎる?)', wide: true };
    const pinkish = c0[0] >= 200 && c0[1] < c0[0] - 30 && c0[2] < c0[0] - 20 && Math.abs(c0[1] - c0[2]) < 90;
    if (!pinkish) return { ok: false, out: box, text, msg: 'フレームの色 (' + c0.join(', ') + ') がピンクに見えません。赤を強く, 緑と青を中くらいに', wide: true };
    return { ok: true, out: box, text, msg: '幅 8 画素のピンク (' + c0.join(', ') + ') のフレームが描けました', wide: true };
  }

  const tasks = [
    matTask({
      id: '4-1-1', label: '4-1(1)', short: 'matrix_print の書式', given: pick('matrix.h', 'matrix1test.c'), link: ['matrix1test.c', 'matrix.c'], gcc: 'matrix1test.c matrix.c',
      title: 'matrix_print の printf 書式を調整し, 桁をそろえて行列を出力する',
      spec: '<p>配布の <code class="ic">matrix.c</code> と <code class="ic">matrix1test.c</code> (両方とも <code class="ic">matrix.h</code> をインクルード) をコンパイル・リンクして実行すると, 現状は <code class="ic"> 0.00000 1.00000 2.00000</code> のように桁がそろわない。</p><p><code class="ic">void matrix_print(int n, double A[N][N])</code> の printf の書式を適切に設定し, 下のように出力されるようにせよ (diff で確認)。</p><pre class="spec-pre">A\n   0.00000   1.00000   2.00000\n   1.00000   2.00000   3.00000\n   2.00000   3.00000   4.00000</pre><p class="c-mute"><b>matrix.c は (2)〜(7) とオプション課題 1 で共通</b>です (どの課題で書いても同じ内容が保存されます)。</p>',
      tests: [{ stdin: '', expect: E.m1, label: 'matrix1test' }],
      hints: ['「 %.5f」は小数点以下 5 桁だが, <b>全体の幅</b>は指定していない。幅は % と . の間に書く: <code class="ic">%9.5f</code>', '期待値の 1 項目は「空白 1 + 幅 9 文字」(例: <code class="ic">"   0.00000"</code>)。だから <code class="ic">" %9.5f"</code>。', '幅を指定すると足りない分は<b>左側が空白</b>。12.34567 のように桁が増えても右端がそろう。'],
      summary: 'n×n 行列を出力する関数 matrix_print の printf の書式を " %9.5f" に設定し、\nmatrix1test.c とリンクして桁のそろった出力が得られることを確認した。',
      reportTitle: '課題 4.1 (1)',
    }),
    matTask({
      id: '4-1-2', label: '4-1(2)', short: 'matrix_scan', given: pick('matrix.h', 'matrix2test.c'), link: ['matrix2test.c', 'matrix.c'], gcc: 'matrix2test.c matrix.c',
      title: '標準入力から n×n 行列を読み込む matrix_scan',
      spec: '<p>標準入力から n×n 行列のデータを配列 A[N][N] に読み込む関数 <code class="ic">void matrix_scan(int n, double A[N][N])</code> を作成し, matrix.c に追加せよ。</p><p>プロンプト (例: <code class="ic">[0][1] </code>) の書式は自由だが, <b>必ず stderr に出力</b>すること。</p>',
      tests: [{ stdin: I.m2, expect: E.m2, label: '3×3 (1〜9)' }],
      hints: ['2 重の for 文で i 行 j 列を順に: <code class="ic">scanf("%lf", &amp;A[i][j]);</code> — double なので <code class="ic">%lf</code>, そして要素の<b>番地</b>。', 'プロンプトは <code class="ic">fprintf(stderr, "[%d][%d] ", i, j);</code> — stdout に出すと diff が合わなくなる。', '配列を引数に渡すと実際に渡るのは<b>先頭の番地</b>。だから関数の中で書いた値が main の配列に残る (B3 と同じ)。'],
      summary: '標準入力から n×n 行列を配列 A[N][N] に読み込む関数 matrix_scan を\nmatrix.c に追加し、プロンプトは stderr に出力するようにした。',
      reportTitle: '課題 4.1 (2)',
    }),
    matTask({
      id: '4-1-3', label: '4-1(3)', short: '行列の和 matrix_sum', given: pick('matrix.h', 'matrix3test.c'), link: ['matrix3test.c', 'matrix.c'], gcc: 'matrix3test.c matrix.c',
      title: 'Y = A + B を計算する matrix_sum',
      spec: '<p>配列 A と B に格納された n×n 行列の和を求め, 結果を配列 Y に格納する関数 <code class="ic">void matrix_sum(int n, double A[N][N], double B[N][N], double Y[N][N])</code> を作成し, matrix.c に追加せよ。</p><p>n=5 のテストデータ (in.txt) で, 期待値 (exp.txt) と diff で一致することを確認する。</p>',
      tests: [{ stdin: I.m3, expect: E.m3, label: 'n=5 (in.txt)', inName: 'in.txt', expName: 'exp.txt' }],
      hints: ['<code class="ic">Y[i][j] = A[i][j] + B[i][j];</code> を全ての i, j について。', 'まず n=2 くらいを手入力で試すと安心 (「メモリで追う」で stdin を変えられます)。', 'ターミナル: <code class="ic">./a &lt; in.txt &gt; out.txt</code> → <code class="ic">diff out.txt exp.txt</code>。'],
      summary: 'n×n 行列 A と B の和を配列 Y に格納する関数 matrix_sum を matrix.c に\n追加し、matrix3test.c とリンクして in.txt の入力で動作を確認した。',
      reportTitle: '課題 4.1 (3)',
    }),
    matTask({
      id: '4-1-4', label: '4-1(4)', short: '転置 matrix_trans2', given: pick('matrix.h', 'matrix4test.c'), link: ['matrix4test.c', 'matrix.c'], gcc: 'matrix4test.c matrix.c',
      title: 'A の転置行列を Y に格納する matrix_trans2',
      spec: '<p>配列 A に格納された n×n 行列の<b>転置行列</b>を求め, 結果を配列 Y に格納する関数 <code class="ic">void matrix_trans2(int n, double A[N][N], double Y[N][N])</code> を作成し, matrix.c に追加せよ。</p>',
      tests: [{ stdin: I.m4, expect: E.m4, label: 'n=5 (in.txt)', inName: 'in.txt', expName: 'exp.txt' }],
      hints: ['転置は「行と列を入れ替える」: Y の i 行 j 列 = A の j 行 i 列。', '<code class="ic">Y[i][j] = A[j][i];</code>', 'A は書き換えない。出力の最初の A がそのまま, Y が転置になっていれば OK。'],
      summary: 'n×n 行列 A の転置行列を配列 Y に格納する関数 matrix_trans2 を matrix.c\nに追加し、matrix4test.c とリンクして動作を確認した。',
      reportTitle: '課題 4.1 (4)',
    }),
    matTask({
      id: '4-1-5', label: '4-1(5)', short: '自分を転置 trans1', given: pick('matrix.h', 'matrix5test.c'), link: ['matrix5test.c', 'matrix.c'], gcc: 'matrix5test.c matrix.c',
      title: 'A 自身を転置する matrix_trans1 (A 以外の配列を使わない)',
      spec: '<p>配列 A に格納された n×n 行列を転置する (<b>結果を A に格納する</b>) 関数 <code class="ic">void matrix_trans1(int n, double A[N][N])</code> を作成し, matrix.c に追加せよ。</p><p class="c-addr"><b>matrix_trans1 の中で A 以外の配列を宣言して用いてはならない。</b></p><p>x と y の交換は, 作業用の変数 tmp で <code class="ic">tmp = x; x = y; y = tmp;</code>。</p>',
      tests: [{ stdin: I.m5, expect: E.m5, label: 'n=5 (in.txt)', inName: 'in.txt', expName: 'exp.txt' }],
      hints: ['A[i][j] と A[j][i] を交換する。ただし<b>全ての i, j で交換すると 2 回交換されて元に戻る</b>!', '対角線より上だけを交換: <code class="ic">for (j = i+1; j &lt; n; j++)</code>', '<code class="ic">double tmp;</code> は配列ではないので OK。<code class="ic">tmp = A[i][j]; A[i][j] = A[j][i]; A[j][i] = tmp;</code>'],
      check(outs, src) {
        const m = /void\s+matrix_trans1\s*\([^)]*\)\s*\{([\s\S]*?)\n\}/.exec(src['matrix.c'] || '');
        if (m && /\b(double|int|float)\s+\w+\s*\[/.test(m[1])) return { ok: false, msg: 'matrix_trans1 の中で配列が宣言されています (A 以外の配列は使えません)' };
        return { ok: true, msg: 'A 以外の配列を使わずに転置できました。' };
      },
      summary: '作業用の変数 tmp を用い、A 以外の配列を使わずに n×n 行列 A 自身を転置\nする関数 matrix_trans1 を matrix.c に追加し、matrix5test.c とリンクし\nて動作を確認した。',
      reportTitle: '課題 4.1 (5)',
    }),
    matTask({
      id: '4-1-6', label: '4-1(6)', short: 'vector_scan / print', given: pick('matrix.h', 'matrix6test.c'), link: ['matrix6test.c', 'matrix.c'], gcc: 'matrix6test.c matrix.c',
      title: 'n 次元ベクトルを読み込む vector_scan と, 出力する vector_print',
      spec: '<p>標準入力から n 次元ベクトルを配列 x[N] に読み込む関数 <code class="ic">void vector_scan(int n, double x[N])</code> と, x[N] を出力する関数 <code class="ic">void vector_print(int n, double x[N])</code> を matrix.c に追加せよ。出力フォーマットは matrix_print と同様 (1 行に 1 要素)。</p><p>テストでは 1.5, -2, 0.25 を入力し, matrix6test.c が 2 倍した値を表示する。</p>',
      tests: [{ stdin: I.m6, expect: E.m6, label: 'x = (1.5, -2, 0.25)' }],
      hints: ['matrix_scan / matrix_print の 1 次元版。for 文は 1 重。', '<code class="ic">printf(" %9.5f\\n", x[i]);</code>', 'プロンプトは stderr へ (例: <code class="ic">fprintf(stderr, "[%d] ", i);</code>)。'],
      summary: 'n 次元ベクトルを配列 x[N] に読み込む関数 vector_scan と、出力する関数\nvector_print を matrix.c に追加し、matrix6test.c とリンクして動作を確\n認した。',
      reportTitle: '課題 4.1 (6)',
    }),
    {
      id: '4-1-7', label: '4-1(7)', short: '行列×ベクトル', files: ['matrix.c', 'matrix7test.c'], share, given: pick('matrix.h', 'matrix3test.c'), link: ['matrix7test.c', 'matrix.c'], gcc: 'matrix7test.c matrix.c',
      title: 'y = A x を計算する matrix_vector_prod と, テスト matrix7test.c',
      spec: '<p>n×n 行列 A[N][N] と n 次元ベクトル x[N] の積を計算し, 結果を y[N] に格納する関数 <code class="ic">void matrix_vector_prod(int n, double A[N][N], double x[N], double y[N])</code> を matrix.c に作成せよ。</p><p>A と x を入力して y = A x を計算し, y を出力するテストプログラム <b>matrix7test.c</b> を (3) の matrix3test.c に倣って作成せよ。</p><p>【参考】 A = (1 1 1 / 1 2 3 / 5 4 3), x = (1, 2, 2) のとき y = (5, 11, 19)。</p>',
      starter: { 'matrix.c': MATRIX_START, 'matrix7test.c': R`#include <stdio.h>
#include "matrix.h"
/* matrix_vector_prod のテスト: y = A x  (matrix3test.c に倣って作る) */
int main(void)
{
    int n;
    double A[N][N], x[N], y[N];

    fprintf(stderr, "n = ");
    scanf("%d", &n);
    /* TODO: A と x を読み込み, y = A x を計算して A, x, y を出力 */

    return 0;
}
` },
      tests: [{ stdin: I.m7ref, expect: E.m7ref, label: '【参考】 n=3' }, { stdin: I.m7, expect: E.m7, label: 'n=5 (in.txt)', inName: 'in.txt', expName: 'exp.txt' }],
      hints: ['y[i] = A の i 行目と x の内積 = A[i][0]*x[0] + … + A[i][n-1]*x[n-1]', '<code class="ic">y[i] = 0.0;</code> で初期化してから <code class="ic">y[i] += A[i][j] * x[j];</code>。初期化を忘れるとゴミの値に足してしまう。', 'テスト側: A を読む → x を読む → 計算 → <code class="ic">printf("A\\n"); matrix_print(n, A);</code> → x → y の順に表示。'],
      summary: '行列とベクトルの積 y = A x を y[N] に格納する関数 matrix_vector_prod\nを matrix.c に追加し、A と x を入力して y を出力するテストプログラム\nmatrix7test.c を作成して動作を確認した。',
      reportTitle: '課題 4.1 (7)',
    },
    imgTask('4-2-1', '4-2(1)', '色調の変更 cool', 'image1cool.c', 'bmp_cool', '画像全体を「涼しげ」にする image1cool.c',
      '<p>image1cool.c の関数 bmp_cool の中は, 現状 R, G, B 全ての輝度を 0.5 倍 (全体を暗く) する処理になっている。これを書き換え, <b>赤の輝度のみ 0.8 倍</b>にし, 緑と青は変更しない (1.0 倍) ようにせよ。</p>',
      R`  int i, j;

  /**** 以下 (現状は画像を全体に暗くする処理になっている) を書き換えて完成させよ ****/
  for (i=0; i< hd->biHeight; i++) { /* biHeight は画像の高さ */
    for (j=0; j< hd->biWidth; j++) { /* biWidth は画像の幅 */
      img[i][j].r = img[i][j].r*0.5;
      img[i][j].g = img[i][j].g*0.5;
      img[i][j].b = img[i][j].b*0.5;
    }
  }
  /************** ここまで *************************************************/`,
      ['まずそのまま「テスト実行」。全体が暗くなった画像が出るはず。', '<code class="ic">img[i][j].r</code> は i 行 j 列の画素 (pixel_t) の<b>メンバー r</b>。0.5 を 0.8 に。', 'g と b は「変更しない」ので, その 2 行は消しても <code class="ic">*1.0</code> にしても OK。'],
      '画像全体を「涼しげ」にするため、関数 bmp_cool の中で全画素の赤の輝度\nのみ 0.8 倍にし、緑と青は変更しないようにした image1cool.c を作成した。'),
    imgTask('4-2-2', '4-2(2)', 'モノクロ化 mono', 'image1mono.c', 'bmp_mono', '画像をモノクロに変換する image1mono.c',
      '<p>in.bmp を入力し, 画像を<b>モノクロ</b>に変換して out.bmp に出力するプログラム image1mono.c を作成せよ。全画素について R, G, B の値を等しくすればモノクロになる。値は <b>R, G, B の平均値</b>にすればよい。</p>',
      R`  int i, j;

  /* TODO: 全画素について r, g, b を「3 色の平均値」にそろえる */`,
      ['平均は <code class="ic">(img[i][j].r + img[i][j].g + img[i][j].b) / 3</code>。', 'r に先に代入すると g, b の計算時に r が変わっている! <b>平均を int の変数にいったん保存</b>してから 3 色に。', 'unsigned char 同士の足し算は int に変換されて計算されるので 255×3 でもあふれない。'],
      'in.bmp の全画素について R, G, B の平均値を求め、その値を R, G, B の\nすべてに代入してモノクロ画像を out.bmp に出力する image1mono.c を作成\nした。'),
    imgTask('4-2-3', '4-2(3)', 'ピンクのフレーム', 'image1frame.c', 'bmp_frame', '幅 8 画素のピンク色のフレームを付ける image1frame.c',
      '<p>in.bmp を入力し, <b>幅 8 画素でピンク色</b>のフレーム (外枠) を付加して out.bmp に出力するプログラム image1frame.c を作成せよ。細長い長方形を 4 つ描画すればよい。色を適切に調整せよ。</p><p class="c-mute">自動判定: 外周 8 画素がすべて同じ「ピンク系」の色で, 内側が元の画像のままなら OK。</p>',
      R`  int i, j;
  int w = hd->biWidth, h = hd->biHeight;

  /* TODO: 外側 8 画素をピンク色 (例: r=255, g=128, b=128) で塗る */`,
      ['上下左右の 4 本の帯 = 「i &lt; 8」「i ≧ h-8」「j &lt; 8」「j ≧ w-8」のどれか。', '2 重ループの中で <code class="ic">if (i &lt; 8 || i &gt;= h-8 || j &lt; 8 || j &gt;= w-8)</code> なら色を代入。', 'ピンク =「赤が強く, 緑と青が中くらい」: (255, 128, 128) など。上の「色合成」で試そう。'],
      'in.bmp の上下左右の外周 8 画素を、R=255, G=128, B=128 のピンク色で\n塗りつぶして枠を付け、out.bmp に出力する image1frame.c を作成した。',
      { frame: true }),
    imgTask('4-2-4', '4-2(4)', '鏡像 mirror', 'image1mirror.c', 'bmp_mirror', '左右を反転させた画像を出力する image1mirror.c',
      '<p>in.bmp を入力し, <b>左右</b>を反転させた画像を out.bmp に出力するプログラム image1mirror.c を作成せよ (資料では「上下」に取り消し線があり, 左右反転の図が示されている)。</p>',
      R`  int i, j;
  int w = hd->biWidth;

  /* TODO: 各行で, 左端と右端, 左から 2 番目と右から 2 番目, … を交換する */`,
      ['j 列目と (w-1-j) 列目の画素を交換する。', '<b>j は w/2 未満まで</b>。最後まで回すと 2 回交換されて元に戻る (matrix_trans1 と同じ罠)。', '構造体はまるごと代入できる: <code class="ic">pixel_t tmp; tmp = img[i][j]; img[i][j] = img[i][w-1-j]; img[i][w-1-j] = tmp;</code>'],
      'in.bmp の各行について j 列目と (幅-1-j) 列目の画素 (pixel_t) を作業用\n変数 tmp を用いて交換し、左右を反転させた画像を out.bmp に出力する\nimage1mirror.c を作成した。'),
    imgTask('4-2-5', '4-2(5)', 'モザイク mosaic', 'image1mosaic.c', 'bmp_mosaic', '右半分に 16×16 画素のモザイクをかける image1mosaic.c',
      '<p>in.bmp の画像の<b>右半分</b>に 16×16 画素のモザイクをかけて out.bmp に出力するプログラム image1mosaic.c を作成せよ。16×16 画素毎に (その 256 画素の) <b>平均値</b>を計算し, その値をその 16×16 画素すべてに代入すればよい。</p>',
      R`  int i, j, y, x;
  int sr, sg, sb;

  /* TODO: 右半分 (x が biWidth/2 以上) を 16×16 のブロックに区切り,
           各ブロックの r, g, b の平均値をブロック内の全画素に代入する */`,
      ['外側の 2 重ループでブロックの開始座標を 16 ずつ: <code class="ic">for (y=0; y+16 &lt;= hd-&gt;biHeight; y+=16)</code>, <code class="ic">for (x=hd-&gt;biWidth/2; x+16 &lt;= hd-&gt;biWidth; x+=16)</code>', '内側の 2 重ループ (i: y〜y+15, j: x〜x+15) で合計を求め, もう一度同じ範囲で <code class="ic">sr / 256</code> などを代入。', '合計は最大 255×256 = 65280。unsigned char ではなく <b>int</b> で足す。'],
      'in.bmp の右半分を 16×16 画素のブロックに区切り、各ブロックの R, G, B\nの平均値をブロック内の 256 画素すべてに代入してモザイクをかけ、\nout.bmp に出力する image1mosaic.c を作成した。'),
    imgTask('4-2-6', '4-2(6)', '縮小 collapse', 'image1collapse.c', 'bmp_collapse', '縦方向を半分に縮小する image1collapse.c',
      '<p>in.bmp の<b>縦方向のサイズを半分</b>に縮小して out.bmp に出力するプログラム image1collapse.c を作成せよ。</p><ul><li>新画像の (x, y) の画素の値を, 元画像の (x, 2y) と (x, 2y+1) の平均値とすればよい。</li><li>ヘッダの <code class="ic">biHeight</code> の値を半分にせよ。</li></ul>',
      R`  int i, j;

  /* TODO: biHeight を半分にし, 新しい i 行目 = 元の 2i 行目と 2i+1 行目の平均 */`,
      ['<code class="ic">hd-&gt;biHeight = hd-&gt;biHeight / 2;</code> — hd は構造体へのポインタなので <code class="ic">-&gt;</code>。bmp_write はこの値で書き出す行数を決める。', '<code class="ic">img[i][j].r = (img[2*i][j].r + img[2*i+1][j].r) / 2;</code> を g, b も。', 'i の小さい方から上書きしても大丈夫? → 新 i 行目が読むのは 2i, 2i+1 行目 (≧ i) なので, まだ壊されていない。'],
      'ヘッダの biHeight を半分にし、新しい画像の i 行目を元画像の 2i 行目と\n2i+1 行目の平均値として、縦方向に半分に縮小した画像を out.bmp に出力す\nる image1collapse.c を作成した。'),
    {
      id: '4-3', label: '4-3', short: 'bmp_data_t に書き換え', files: ['image2.c', 'image2collapse.c'], given: pick('image2.h'), link: ['image2collapse.c', 'image2.c'], gcc: 'image2collapse.c image2.c', noTrace: true, noStdin: true,
      title: 'ヘッダと画素をまとめた構造体 bmp_data_t 用に image2.c と image2collapse.c を書き換える',
      spec: '<p>課題 4-2 のヘッダ (bmp_header_t) と画素配列 (pixel_t の 2 次元配列) をまとめ, 一つの構造体型 <code class="ic">bmp_data_t</code> で表現するように変更したい。</p><pre class="spec-pre">typedef struct {\n  bmp_header_t header;\n  pixel_t img[MAX_Y][MAX_X];\n} bmp_data_t;</pre><p>image1.h を image2.h (タブで閲覧可) に変更する。<b>image1.c と image1collapse.c</b> をそれぞれこのデータ構造に適合する <b>image2.c, image2collapse.c</b> に書き換えよ。</p><p class="c-addr">(image1.c の修正量が多く, 構造体型の書き換えでミスが出やすいので, 心して取り組むこと。)</p>',
      starter: { 'image2.c': (G['image1.c'] || '').replace('#include "image1.h"', '#include "image2.h"\n\n/* TODO: image2.h の bmp_read(char filename[], bmp_data_t *bmp) と\n         bmp_write(char filename[], bmp_data_t *bmp) に合わせて書き換える */'),
        'image2collapse.c': R`#include <stdio.h>
#include "image2.h"

void bmp_collapse(bmp_data_t *bmp);

int main(void)
{
  static bmp_data_t bmp;   /* 大きいので static を付けて確保する (ヒント 3 参照) */

  bmp_read("in.bmp", &bmp);
  bmp_collapse(&bmp);
  bmp_write("out.bmp", &bmp);
  return 0;
}

void bmp_collapse(bmp_data_t *bmp)
{
  /* TODO: image1collapse.c と同じ処理を bmp-> を使って書く */
}
` },
      hints: ['関数の形が変わる: <code class="ic">void bmp_read(char filename[], bmp_data_t *bmp)</code>。hd と img の代わりに <b>bmp 1 つ</b>を受け取る。', '書き換え規則: <code class="ic">hd-&gt;biWidth</code> → <code class="ic">bmp-&gt;header.biWidth</code>, <code class="ic">img[i][j].r</code> → <code class="ic">bmp-&gt;img[i][j].r</code>, <code class="ic">&amp;hd-&gt;bfType</code> → <code class="ic">&amp;bmp-&gt;header.bfType</code>。', 'bmp_data_t は 512×512×3 ≒ 768KB。実際の gcc でも main のローカル変数にするとスタックがあふれて落ちることがある。<code class="ic">static</code> か大域変数に。'],
      busy: '画像処理を実行中… (128×80 画素)',
      custom: (src) => C.imageTask('4-3', ['image2collapse.c', 'image2.c'], { check: (s) => (/bmp_header_t\s*\*\s*\w+\s*,\s*pixel_t/.test(s['image2.c'] || '') ? { ok: false, msg: 'image2.c の関数の引数がまだ (bmp_header_t *hd, pixel_t img[][]) のままです' } : /\bhd\s*->/.test(s['image2.c'] || '') ? { ok: false, msg: 'image2.c に hd-> が残っています (bmp->header. に)' } : { ok: true, msg: 'bmp_data_t 1 つで受け渡しできました' }) })(src),
      term: (st) => C.imageTerm('4-3', 'gcc image2collapse.c image2.c')(st),
      summary: 'ヘッダと画素配列を一つにまとめた構造体型 bmp_data_t を定義した image2.h\nに合わせて、image1.c と image1collapse.c をそれぞれ image2.c と\nimage2collapse.c に書き換え、縦方向に半分に縮小した画像を出力した。',
      reportTitle: '課題 4.3',
    },
    {
      id: 'o4-1', label: 'Opt-1', short: 'Gauss-Jordan 法', files: ['matrix.c'], share, optional: true, given: pick('matrix.h', 'jordan.c'), link: ['jordan.c', 'matrix.c'], gcc: 'jordan.c matrix.c', starter: { 'matrix.c': MATRIX_START },
      title: 'オプション: Gauss-Jordan 法で連立一次方程式を解く (matrix.c に関数を追加)',
      spec: '<p>配布の jordan.c は Gauss-Jordan 法で n 元連立一次方程式を解くプログラム。matrix.c に次の関数の本体を追加し, jordan.c とリンクして正しく計算されるようにせよ。</p><ul><li><code class="ic">matrix_copy</code> / <code class="ic">vector_copy</code> — コピー</li><li><code class="ic">matrix_vector_print(n, A, b)</code> — A と b を「<code class="ic"> 2.00000   4.00000   6.00000 :   16.00000</code>」のように横に並べて出力</li><li><code class="ic">gauss_jordan(n, A, b)</code> — 掃き出し。<b>1 行の掃き出しが終わる毎に</b> <code class="ic">&lt;k行目&gt;</code> と途中経過を出力。解は b に入る。</li></ul><p>例: 2x+4y+6z=6, 3x+8y+7z=15, 5x+7y+21z=24 → x=-33, y=9, z=6。</p>',
      tests: [{ stdin: I.jordan, expect: E.jordan, label: '3 元 (資料の例)' }],
      hints: ['k = 0…n-1 について (k-1) <b>規格化</b>: k 行目 (A[k][*] と b[k]) を A[k][k] で割る。<b>先に A[k][k] を p に保存</b>しないと途中で 1 になって割れなくなる。', '(k-2) <b>掃き出し</b>: k 以外の各行 i で m = A[i][k] を保存し, A[i][j] -= A[k][j] * m, b[i] -= b[k] * m。', '途中経過: <code class="ic">printf("&lt;%d行目&gt;\\n", k); matrix_vector_print(n, A, b); printf("\\n");</code>'],
      summary: 'matrix.c に matrix_copy, vector_copy, matrix_vector_print, gauss_jordan\nの本体を追加し、jordan.c とリンクして Gauss-Jordan 法により 3 元連立一次\n方程式を解き、解を元の A に掛けて b と一致することを確認した。',
      reportTitle: 'オプション課題 4.1',
    },
    {
      id: 'o4-2', label: 'Opt-2', short: '90 度回転', files: ['image2rotate90.c'], optional: true, given: Object.assign(pick('image2.h'), { 'image2.c': (D.sol['4-3'] || {})['image2.c'] }), link: ['image2rotate90.c', 'image2.c'], gcc: 'image2rotate90.c image2.c', noTrace: true, noStdin: true,
      title: 'オプション: 画像を反時計回りに 90 度回転する image2rotate90.c',
      spec: '<p>in.bmp の画像を<b>反時計回りに 90 度</b>回転したものを out.bmp に出力するプログラム image2rotate90.c を作成せよ (データ構造は image2.h のものを用いよ)。</p><p class="c-mute">image2.c はタブにあるもの (課題 4-3 の模範解答) を使います。</p>',
      starter: { 'image2rotate90.c': R`#include <stdio.h>
#include "image2.h"

void bmp_rotate90(bmp_data_t *in, bmp_data_t *out);

int main(void)
{
  static bmp_data_t in, out;

  bmp_read("in.bmp", &in);
  bmp_rotate90(&in, &out);
  bmp_write("out.bmp", &out);
  return 0;
}

void bmp_rotate90(bmp_data_t *in, bmp_data_t *out)
{
  /* TODO: 幅と高さを入れ替え, 画素を移す */
}
` },
      hints: ['回転すると幅と高さが入れ替わる。<code class="ic">out-&gt;header = in-&gt;header;</code> (構造体はまるごと代入できる) の後, biWidth と biHeight を入れ替える。', '<b>BMP は下の行から格納</b> (img[0] が一番下)。数学の座標と同じ向きなので, 反時計回り 90° は (x, y) → (h-1-y, x)。', '<code class="ic">out-&gt;img[j][h-1-i] = in-&gt;img[i][j];</code> (i: 元の行, j: 元の列, h: 元の高さ)'],
      busy: '画像処理を実行中… (128×80 画素)',
      custom: (src) => C.imageTask('o4-2', ['image2rotate90.c', 'image2.c'])(src),
      term: (st) => C.imageTerm('o4-2', 'gcc image2rotate90.c image2.c')(st),
      summary: 'image2.h の bmp_data_t を用い、幅と高さを入れ替えて画素を\nout->img[j][h-1-i] = in->img[i][j] のように移すことで、画像を反時計回り\nに 90 度回転して out.bmp に出力する image2rotate90.c を作成した。',
      reportTitle: 'オプション課題 4.2',
    },
  ];
  tasks.forEach((t) => { t.solution = D.sol[t.id] || {}; });
  window.B4_TASKS = tasks;
})();
