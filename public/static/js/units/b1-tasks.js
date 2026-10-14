/* B1 Cプログラミングの基礎事項 — 課題定義 (出典: 配布資料「[B1] Cプログラミングの基礎事項」) */
(function () {
  'use strict';
  const R = String.raw;
  const D = window.B1_DATA || { sol: {}, given: {}, exp: {}, inp: {} };
  const E = D.exp, I = D.inp;
  const stderrNote = (r) => (r.err ? '' : '<br><span class="c-addr">※ プロンプトを出していません。入力を促すメッセージは fprintf(stderr, …) で出すのが標準的な書き方です。</span>');

  const tasks = [
    {
      id: '1-1', label: '1-1', short: '3 の倍数か 3 が付く数', files: ['san.c'],
      title: '1〜40 のうち, 3 の倍数か, いずれかの桁が 3 である数を小さい順に出力する san.c',
      spec: '<p>1〜40 までの整数のうち, <b>3 の倍数</b>か, <b>いずれかの桁が 3</b> であるものを, 小さい順に出力するプログラム san.c を作成せよ。コンパイル &amp; 実行して期待値どおりの出力が得られることを確認せよ。</p><div class="req"><span class="chip val">i % 3 == 0</span><span class="chip val">一の位 i % 10</span><span class="chip val">十の位 i / 10</span></div>',
      starter: { 'san.c': R`#include <stdio.h>

#define N 40

int main(void)
{
    int i;

    for (i = 1; i <= N; i++) {
        /* TODO: 3 の倍数, または一の位か十の位が 3 のときだけ表示 */
        if (i % 3 == 0) {
            printf("%d\n", i);
        }
    }
    return 0;
}
` },
      tests: [{ stdin: '', expect: E['1-1'] }],
      hints: [
        '一の位は <code class="ic">i % 10</code>, 十の位は <code class="ic">i / 10</code> (int どうしの割り算は小数点以下切り捨て) で取り出せます。',
        '「または」は <code class="ic">||</code>。条件を 3 つ並べます。',
        '<code class="ic">if (i % 3 == 0 || i % 10 == 3 || i / 10 == 3)</code>',
      ],
      summary: '1〜40 の整数のうち、3 の倍数か、いずれかの桁が 3 であるものを小さい\n順に出力するプログラム san.c を作成した。',
      reportTitle: '課題 1.1',
    },
    {
      id: '1-2', label: '1-2', short: 'リダイレクトと diff', files: ['san-exp.txt'], kind: 'text',
      title: 'san.c の出力を out.txt に保存し, 自分で作った san-exp.txt と diff で比較する',
      spec: '<p>課題 (1-1) で作成した san.c を実行したときの出力を, テキストファイル <code class="ic">out.txt</code> に保存せよ (<code class="ic">./a &gt; out.txt</code>)。次に, 期待値を書いたファイル <b>san-exp.txt</b> を作成し, <code class="ic">diff -w out.txt san-exp.txt</code> で内容が一致することを確かめよ。</p><p class="c-addr">(プログラムを提出する必要はない。演習の状況や感想をレポートに記せ。)</p><p>左のエディタで <b>san-exp.txt を自分で入力</b> → 「テスト実行」で diff。続けて「ターミナル」で実際のコマンド手順を体験しよう (san.c は課題 1-1 のエディタの内容が使われます)。</p>',
      starter: { 'san-exp.txt': '3\n6\n9\n' },
      hints: [
        'san-exp.txt は資料の期待値のとおり, 1 行に 1 つずつ数を書きます (3, 6, 9, 12, 13, …)。',
        '1〜40 なので最後は 39。30〜39 は十の位が 3 なのですべて入ります。',
        'ターミナルでは <code class="ic">gcc san.c</code> → <code class="ic">./a &gt; out.txt</code> → <code class="ic">diff -w out.txt san-exp.txt</code>。<b>何も表示されなければ一致</b>です。',
      ],
      custom(src) {
        const d = window.ShellDiff(E['1-1'], src['san-exp.txt'] || '', { w: true, B: false });
        return { ok: d.length === 0, out: '$ ./a > out.txt\n$ diff -w out.txt san-exp.txt\n' + (d.length ? d.join('\n') : '(何も表示されない)'), msg: d.length ? 'diff が差分を表示しました (< は out.txt にだけある行, > は san-exp.txt にだけある行)' : 'diff は何も表示しない = out.txt と san-exp.txt は一致' };
      },
      term(store) {
        const san = store.get('code:b1:1-1:san.c', null) || D.sol['1-1']['san.c'];
        return { files: { 'san.c': san }, cmds: ['gcc san.c', './a', './a > out.txt', 'cat out.txt', 'diff -w out.txt san-exp.txt'] };
      },
      obsTitle: '演習の状況',
      obsPh: '例: ./a > out.txt で出力を保存し, diff -w out.txt san-exp.txt を実行したところ何も表示されず一致した。最初は … で差分が出た',
      observe() { return '観察: diff は「違う行だけ」を表示します。<b>何も表示されないことが一致の証拠</b>。<code class="ic">-w</code> は空白の違いを無視するオプションです。'; },
      summary: '課題 1.1 の san.c を実行した出力を ./a > out.txt で out.txt に保存し、\n期待値を書いたファイル san-exp.txt を作成して diff -w で比較した。',
      noRun: '結果:\n  $ ./a > out.txt\n  $ diff -w out.txt san-exp.txt\n  (何も表示されなかった)\n\ndiff は何も表示せず、out.txt と san-exp.txt の内容が一致した。',
      reportTitle: '課題 1.2',
    },
    {
      id: '1-3', label: '1-3', short: 'n を入力して出力', files: ['san2.c'],
      title: 'キーボードから n を入力し, 1〜n で課題 1-1 と同じ条件の数を出力する san2.c',
      spec: '<p>キーボードから n を入力し (1≦n≦99 とする), 1〜n の整数のうち, 3 の倍数か, いずれかの桁が 3 であるものを, 小さい順に出力するプログラム san2.c を作成せよ。</p><p><b>n=77</b> を入力したときの出力をテキストファイルに保存し, 期待値 san2-exp.txt と内容が一致することを確認せよ。</p><div class="req"><span class="chip addr">プロンプトは stderr へ</span><span class="chip">scanf("%d", &amp;n)</span></div>',
      starter: { 'san2.c': R`#include <stdio.h>

int main(void)
{
    int n, i;

    printf("n を入力して下さい (1〜99): ");   /* ← このままだと out.txt に混ざる */
    scanf("%d", &n);

    for (i = 1; i <= n; i++) {
        if (i % 3 == 0 || i % 10 == 3 || i / 10 == 3) {
            printf("%d\n", i);
        }
    }
    return 0;
}
` },
      tests: [{ stdin: '77\n', expect: E['1-3'], label: 'n=77' }],
      hints: [
        'テストが 1 行目で失敗するのは, プロンプト「n を入力して下さい」が <b>標準出力 (stdout)</b> に出ているから。リダイレクトするとこれも out.txt に入ってしまいます。',
        'ユーザー向けのメッセージは <b>標準エラー出力</b>に: <code class="ic">fprintf(stderr, "…");</code>',
        '<code class="ic">fprintf(stderr, "n を入力して下さい (1〜99): ");</code> に変えるだけで OK。「メモリで追う」の出力欄を「端末 / stdout / stderr」で切り替えて違いを確かめよう。',
      ],
      check(outs) { return { ok: true, msg: 'stdout には数だけが出ています。' + stderrNote(outs[0]) }; },
      summary: 'キーボードから n (1≦n≦99) を入力し、1〜n の整数のうち 3 の倍数か、\nいずれかの桁が 3 であるものを小さい順に出力するプログラム san2.c を作\n成した。プロンプトは標準エラー出力に出力した。',
      reportTitle: '課題 1.3',
    },
    {
      id: '1-4', label: '1-4', short: '2 点間の距離', files: ['dist.c'],
      title: '4 つの実数 x1, y1, x2, y2 を入力し, 2 点間の距離を出力する dist.c (3 回繰り返し)',
      spec: '<p>標準入力から 4 つの実数 x1, y1, x2, y2 を入力し, 2 点 (x1,y1) と (x2,y2) の<b>距離</b>を標準出力に出力するプログラム dist.c を作成せよ。この動作を <b>3 回</b>繰り返し, 計算結果は<b>小数点以下 4 桁</b>まで出力すること。</p><p>まず手入力と目視で動作を確認した後, リダイレクトと diff によって間違いがないことを確認せよ。</p><div class="req"><span class="chip">#include &lt;math.h&gt;</span><span class="chip val">sqrt()</span><span class="chip">%0.4f</span><span class="chip">scanf("%lf")</span></div>',
      starter: { 'dist.c': R`#include <stdio.h>
#include <math.h>   /* sqrt を使うため */

#define REPEAT 3

int main(void)
{
    int r;
    double x1, y1, x2, y2;

    for (r = 0; r < REPEAT; r++) {
        fprintf(stderr, "x1 y1 x2 y2 を入力して下さい: ");
        /* TODO: 4 つの実数を読み込む */

        /* TODO: 距離を計算して小数点以下 4 桁で出力 */
    }
    return 0;
}
` },
      tests: [{ stdin: I['1-4'], expect: E['1-4'], inName: 'dist-in.txt', expName: 'dist-exp.txt' }],
      hints: [
        'double 型を scanf で読むときの書式は <code class="ic">%lf</code> (エル・エフ)。printf の <code class="ic">%f</code> とは違うので注意。',
        '距離は √((x2−x1)² + (y2−y1)²)。<code class="ic">dx = x2 - x1;</code> のように差を先に求めると読みやすい。',
        '<code class="ic">printf("%0.4f\\n", sqrt(dx * dx + dy * dy));</code>',
      ],
      summary: '標準入力から 4 つの実数 x1, y1, x2, y2 を入力し、2 点 (x1, y1),\n(x2, y2) の距離を小数点以下 4 桁で出力する動作を 3 回繰り返すプログラ\nム dist.c を作成した。',
      reportTitle: '課題 1.4',
    },
    {
      id: '1-5', label: '1-5', short: 'GP と平均 (EOF まで)', files: ['gpa.c'],
      title: '素点を EOF まで入力して GP を出力し, 最後に GP の平均を出力する gpa.c',
      spec: '<p>標準入力から科目の成績の素点 (0〜100 の整数) を入力してその GP を<b>小数点以下 1 桁</b>で出力する, という動作をデータがなくなるまで (<b>scanf が EOF を返すまで</b>) 繰り返し, 最後に GP の平均値を<b>小数点以下 3 桁</b>で出力するプログラム gpa.c を作成せよ。</p><table class="mini"><tr><th>素点</th><td>90-100</td><td>85-89</td><td>80-84</td><td>75-79</td><td>70-74</td><td>65-69</td><td>60-64</td><td>0-59</td></tr><tr><th>GP</th><td>4.0</td><td>3.5</td><td>3.0</td><td>2.5</td><td>2.0</td><td>1.5</td><td>1.0</td><td>0.0</td></tr></table>',
      starter: { 'gpa.c': R`#include <stdio.h>

int main(void)
{
    int score;
    int n = 0;          /* 科目数 */
    double gp;
    double sum = 0.0;   /* GP の合計 */

    for (;;) {
        fprintf(stderr, "素点を入力して下さい: ");
        /* TODO: scanf が EOF を返したらループを抜ける */
        scanf("%d", &score);

        /* TODO: 表に従って gp を決める */
        gp = 0.0;

        printf("%0.1f\n", gp);
        sum = sum + gp;
        n++;
        if (n >= 3) { break; }   /* ← 仮: EOF 判定ができたら消す */
    }
    /* TODO: 平均を小数点以下 3 桁で出力 */
    return 0;
}
` },
      tests: [{ stdin: I['1-5'], expect: E['1-5'], inName: 'gpa-in.txt', expName: 'gpa-exp.txt' }],
      hints: [
        '例題 (1-6) の形: <code class="ic">if (scanf("%d", &amp;score) == EOF) { break; }</code>',
        '上の段から順に <code class="ic">if (score &gt;= 90) … else if (score &gt;= 85) … else if …</code> と書けば, 範囲の下限だけで判定できます。',
        '平均は <code class="ic">sum / n</code>。sum が double なので割り算も double で計算されます。<code class="ic">printf("%0.3f\\n", sum / n);</code>',
      ],
      summary: '標準入力から素点 (0〜100 の整数) を入力して GP を小数点以下 1 桁で\n出力する動作を、scanf が EOF を返すまで繰り返し、最後に GP の平均値\nを小数点以下 3 桁で出力するプログラム gpa.c を作成した。',
      reportTitle: '課題 1.5',
    },
    {
      id: '1-6', label: '1-6', short: '品物の重さの合計', files: ['wt.c'],
      title: 'n 種類の品物の重さ wt[i] を入力し, 番号の系列 (EOF まで) の重さの合計を出す wt.c',
      spec: '<p>品物が n 種類あり, i 番目の品物の重さが wt[i] (小数点以下 1 桁以内の実数) であるとする。</p><ol><li>まず n を入力する。</li><li>次に, wt[0], wt[1], …, wt[n-1] を入力する。</li><li>続いて, 品物の番号 (0〜n-1) の系列を入力する (EOF で終了判定する)。</li><li>3 で入力した品物の重さの合計を出力 (小数点以下 1 桁まで) する。</li></ol><p>ただし, <b>n の上限は 10</b> とする。</p><div class="req"><span class="chip">#define N_MAX 10</span><span class="chip val">double wt[N_MAX];</span></div>',
      starter: { 'wt.c': R`#include <stdio.h>

#define N_MAX 10   /* n の上限 */

int main(void)
{
    int n, i, k;
    double wt[N_MAX];
    double sum = 0.0;

    fprintf(stderr, "n = ");
    scanf("%d", &n);

    /* TODO: wt[0] 〜 wt[n-1] を読み込む */

    /* TODO: 品物の番号 k を EOF まで読み込み, wt[k] を sum に足す */

    printf("%0.1f\n", sum);
    return 0;
}
` },
      tests: [
        { stdin: I['1-6a'], expect: E['1-6a'], label: 'wt-in.txt (1)', inName: 'wt-in1.txt', expName: 'wt-exp1.txt' },
        { stdin: I['1-6b'], expect: E['1-6b'], label: 'wt-in.txt (2)', inName: 'wt-in2.txt', expName: 'wt-exp2.txt' },
      ],
      hints: [
        'wt[i] の読み込みは <code class="ic">for (i = 0; i &lt; n; i++) { scanf("%lf", &amp;wt[i]); }</code>',
        '番号の系列は例題 (1-7) と同じく <code class="ic">for (;;) { if (scanf("%d", &amp;k) == EOF) { break; } … }</code>',
        'n が 10 を超えたり, 番号 k が 0〜n-1 の外だと配列の外を読んでしまいます。<code class="ic">if (k &lt; 0 || k &gt;= n) { continue; }</code> のように防ぐと安全 (「メモリで追う」で wt[] の並びを確認しよう)。',
      ],
      check(outs, src) {
        const s = src['wt.c'];
        if (!/\[\s*N_MAX\s*\]|\[\s*10\s*\]/.test(s)) return { ok: true, msg: '期待値と一致。<span class="c-addr">配列の大きさは n の上限 10 (N_MAX) で宣言しておこう。</span>' };
        return { ok: true, msg: '2 つのテスト入力でどちらも期待値と一致しました。' };
      },
      summary: '品物の種類数 n、各品物の重さ wt[0]〜wt[n-1] を入力した後、品物の番\n号の系列を EOF まで入力し、入力した品物の重さの合計を小数点以下 1 桁で\n出力するプログラム wt.c を作成した。n の上限は 10 とした。',
      reportTitle: '課題 1.6',
    },
    {
      id: '1-7', label: '1-7', short: '母音以外を * に', files: ['aiueo.c'],
      title: '英単語の a, i, u, e, o 以外をすべて * に置き換えて出力する aiueo.c ("qq" で終了)',
      spec: '<p>標準入力から英単語 w を入力し, w 中の <code class="ic">\'a\' \'i\' \'u\' \'e\' \'o\'</code> 以外を全て <code class="ic">\'*\'</code> に置き換えて, w を出力するプログラム aiueo.c を作成せよ。上記の動作を英単語 <b>"qq"</b> が入力されるまで繰り返し実行するようにせよ。</p><div class="req"><span class="chip">#define W_LEN 31</span><span class="chip">#define W_FMT "%31s"</span><span class="chip val">strcmp()</span><span class="chip">w[i] != \'\\0\'</span></div>',
      starter: { 'aiueo.c': R`#include <stdio.h>
#include <string.h>   /* strcmp を使うため */

#define W_LEN 31      /* 文字列 w の最大文字数 */
#define W_FMT "%31s"  /* 文字列 w を読み込むフォーマット */

int main(void)
{
    int i;
    char w[W_LEN+1];

    for (;;) {
        fprintf(stderr, "英単語を入力して下さい (qq で終了): ");
        scanf(W_FMT, w);
        /* TODO: w が "qq" なら終了 */

        for (i = 0; w[i] != '\0'; i++) {   /* 文字列走査の決まった書き方 */
            /* TODO: 母音以外なら '*' に置き換える */
        }
        printf("%s\n", w);
    }
    return 0;
}
` },
      tests: [{ stdin: I['1-7'], expect: E['1-7'], inName: 'aiueo-in.txt', expName: 'aiueo-exp.txt' }],
      hints: [
        '文字列の比較は <code class="ic">==</code> ではなく <code class="ic">strcmp(w, "qq") == 0</code> (一致すると 0 を返す)。',
        '文字の比較は <code class="ic">w[i] != \'a\'</code> のように<b>シングルクォート</b>。5 つすべてと違うとき (<code class="ic">&amp;&amp;</code>) に置き換えます。',
        '<code class="ic">if (w[i] != \'a\' &amp;&amp; w[i] != \'i\' &amp;&amp; w[i] != \'u\' &amp;&amp; w[i] != \'e\' &amp;&amp; w[i] != \'o\') { w[i] = \'*\'; }</code>',
      ],
      summary: '標準入力から英単語 w を入力し、w 中の a, i, u, e, o 以外の文字を全て\n* に置き換えて出力する動作を、qq が入力されるまで繰り返すプログラム\naiueo.c を作成した。',
      reportTitle: '課題 1.7',
    },
    {
      id: '1-8', label: '1-8', short: '部分列の一致判定', files: ['match.c'],
      title: 'k 個の整数列 a が, n 個の整数列 b の中に連続して現れるかを m 回判定する match.c',
      spec: '<ol><li>整数 k を入力する。(ただし, 1≦k≦10)</li><li>k 個の整数 a<sub>0</sub>, …, a<sub>k-1</sub> を入力する。</li><li>整数 n を入力する。(ただし, k≦n≦16)</li><li>整数 m を入力する。(ただし, 1≦m≦16)</li><li>次を m 回繰り返す: n 個の整数 b<sub>0</sub>, …, b<sub>n-1</sub> を入力する。ある整数 i について b<sub>i</sub>=a<sub>0</sub>, b<sub>i+1</sub>=a<sub>1</sub>, …, b<sub>i+k-1</sub>=a<sub>k-1</sub> が成り立てば <b>1</b> を, そうでなければ <b>0</b> を出力し, その後に改行を出力する。</li></ol>',
      starter: { 'match.c': R`#include <stdio.h>

#define K_MAX 10
#define N_MAX 16

int main(void)
{
    int k, n, m;
    int a[K_MAX], b[N_MAX];
    int i, j, r, found;

    fprintf(stderr, "k : ");
    scanf("%d", &k);
    fprintf(stderr, "%d個の整数 : ", k);
    for (i = 0; i < k; i++) { scanf("%d", &a[i]); }
    fprintf(stderr, "n : ");
    scanf("%d", &n);
    fprintf(stderr, "m : ");
    scanf("%d", &m);

    for (r = 0; r < m; r++) {
        fprintf(stderr, "%d個の整数: ", n);
        for (i = 0; i < n; i++) { scanf("%d", &b[i]); }

        found = 0;
        /* TODO: 開始位置 i をずらしながら, b[i]〜b[i+k-1] が a[0]〜a[k-1] と一致するか調べる */

        printf("%d\n", found);
    }
    return 0;
}
` },
      tests: [{ stdin: I['1-8'], expect: E['1-8'], inName: 'match-in.txt', expName: 'match-exp.txt' }],
      hints: [
        '開始位置 i は 0 から n−k まで (<code class="ic">i + k &lt;= n</code>)。それより後ろから始めると b の外を読みます。',
        '二重ループ: 外側で開始位置 i, 内側で j = 0〜k−1 について <code class="ic">b[i + j] != a[j]</code> なら break。',
        '内側のループを最後まで回りきった (<code class="ic">j == k</code>) なら全部一致 → <code class="ic">found = 1; break;</code>',
      ],
      summary: 'k 個の整数 a[0]〜a[k-1] と n、m を入力した後、n 個の整数 b[0]〜\nb[n-1] を入力し、b の中に a と同じ並びが連続して現れれば 1、そうでな\nければ 0 を出力する動作を m 回繰り返すプログラム match.c を作成した。',
      reportTitle: '課題 1.8',
    },
    {
      id: 'o1-1', label: 'O1-1', short: 'ポーカーの役', files: ['poker.c'], optional: true,
      title: '1〜13 の整数 5 つからポーカーの役を判定する poker.c (EOF まで)',
      spec: '<p class="c-addr">オプション課題は基本課題とは提出するレポートが異なる。B1 ではなく<b>オプション課題のレポート O1</b> として提出すること (下の「レポート作成」で O1.txt を選択)。</p><p>1〜13 の整数を 5 つ入力し, 次のメッセージを出力するプログラム poker.c を作成せよ。この動作を入力がなくなるまで (scanf が EOF を返すまで) 繰り返す。</p><ol><li>4 個の等しい数字があるとき "four of a kind"</li><li>3 個の数字が等しく, 別の 2 個の数字が等しいとき "full house"</li><li>上記 1, 2 いずれにも該当せず, 3 個の等しい数字があるとき "three of a kind"</li><li>上記 1, 2 に該当せず, 2 個の等しい数字があり, 更に別に 2 個の等しい数字があるとき "two pair"</li><li>上記 1〜4 に該当せず, 2 個の等しい数字があるとき "one pair"</li><li>上記のいずれにも該当しないとき "no pair"</li></ol>',
      starter: { 'poker.c': R`#include <stdio.h>

int main(void)
{
    int c[14];   /* c[v] は数字 v の枚数 (c[0] は使わない) */
    int i, v;

    for (;;) {
        for (v = 1; v <= 13; v++) { c[v] = 0; }
        fprintf(stderr, "1〜13 の整数を 5 つ入力: ");
        for (i = 0; i < 5; i++) {
            if (scanf("%d", &v) == EOF) { return 0; }
            c[v]++;
        }
        /* TODO: 4 枚・3 枚・2 枚の組がいくつあるか数えて役を判定する */
        printf("no pair\n");
    }
    return 0;
}
` },
      tests: [{ stdin: I['o1-1'], expect: E['o1-1'], inName: 'poker-in.txt', expName: 'poker-exp.txt' }],
      hints: [
        '例題 (1-7) count.c の考え方: <code class="ic">c[v]</code> に数字 v の出現回数を数える。',
        '数え終わったら c[1]〜c[13] を見て, 値が 4 のもの, 3 のもの, 2 のものが<b>いくつあるか</b> (n4, n3, n2) を数える。',
        '判定は上から順に: n4==1 → four, n3==1 &amp;&amp; n2==1 → full house, n3==1 → three, n2==2 → two pair, n2==1 → one pair, それ以外 → no pair。',
      ],
      summary: '1〜13 の整数を 5 つ入力し、four of a kind, full house,\nthree of a kind, two pair, one pair, no pair のいずれかを出力する動作\nを EOF まで繰り返すプログラム poker.c を作成した。',
      reportTitle: 'オプション課題 1.1',
    },
    {
      id: 'o1-2', label: 'O1-2', short: '3 次方程式の実数解の個数', files: ['nsol_ceq.c'], optional: true,
      title: 'f(x)=ax³+bx²+cx+d=0 の実数解の個数を出力する nsol_ceq.c (a=0 で終了)',
      spec: '<p class="c-addr">オプション課題のレポート O1 として提出すること。</p><p>f を実数係数の 3 次関数 f(x) = ax³ + bx² + cx + d (ただし a≠0) とする。標準入力から実数値 a, b, c, d を入力し, f(x)=0 の<b>実数解の個数</b>を標準出力に出力するプログラム nsol_ceq.c を作成せよ。上記の動作を <b>a=0</b> が入力されるまで繰り返す。なお, 解の値を求める必要はない。</p><p>(ヒント) 関数 f(x) の導関数 f\'(x) を求め, f(x) の概形を把握する。極点の値と x 軸の上下関係から解の数を求める。</p><ul><li>(1) 2 次方程式 f\'(x)=0 が, 実数解を持たないか, 重解を持つとき</li><li>(2) f\'(x)=0 が 2 つの実数解をもつとき: (2a) 極大値・極小値ともに正 (負) / (2b) いずれか一方が 0 / (2c) 極大値が正, 極小値が負</li></ul><p class="c-mute">※ 資料に期待値はないため, このサイトでは gcc で確認した確認用テストで判定します。</p>',
      starter: { 'nsol_ceq.c': R`#include <stdio.h>
#include <math.h>

#define EPS 1e-9

int main(void)
{
    double a, b, c, d;
    int n;

    for (;;) {
        fprintf(stderr, "a b c d を入力 (a=0 で終了): ");
        if (scanf("%lf %lf %lf %lf", &a, &b, &c, &d) == EOF) { break; }
        if (fabs(a) < EPS) { break; }

        /* TODO: f'(x) = 3a x^2 + 2b x + c = 0 の判別式で場合分けし,
                 極値 f(s1), f(s2) の符号から実数解の個数 n を決める */
        n = 1;

        printf("%d\n", n);
    }
    return 0;
}
` },
      tests: [{ stdin: I['o1-2'], expect: E['o1-2'], label: '確認用 (x³−x, x³+x, (x−1)³, x³−3x+2, (x−1)(x−2)(x−3), …)', inName: 'ceq-in.txt', expName: 'ceq-exp.txt' }],
      hints: [
        'f\'(x) = 3ax² + 2bx + c。判別式 (の 1/4) は <code class="ic">D = b*b - 3*a*c</code>。D ≦ 0 なら f は単調で, 実数解は 1 個。',
        'D &gt; 0 のとき極値をとる x は <code class="ic">s = (-b ± sqrt(D)) / (3*a)</code>。f(s1), f(s2) を計算する。',
        'f(s1)·f(s2) &lt; 0 → 3 個 / どちらかが 0 (|f| &lt; EPS) → 2 個 (重解) / 同符号 → 1 個。実数の 0 判定には誤差を考えて EPS を使う。',
      ],
      summary: '標準入力から実数 a, b, c, d を入力し、3 次方程式 ax^3+bx^2+cx+d=0\nの実数解の個数を、導関数の判別式と極値の符号から求めて出力する動作を\na=0 が入力されるまで繰り返すプログラム nsol_ceq.c を作成した。',
      reportTitle: 'オプション課題 1.2',
    },
  ];
  tasks.forEach((t) => { t.solution = D.sol[t.id] || (t.id === '1-2' ? { 'san-exp.txt': E['1-1'] } : {}); });
  window.B1_TASKS = tasks;
})();
