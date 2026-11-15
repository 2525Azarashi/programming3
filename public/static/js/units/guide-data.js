/* =========================================================================
 *  PIII LAB — 理解のエッセンシャル・定型フレーズ図鑑・全課題の思考設計図 & 1行意図データ
 *  window.GUIDE_DATA = { units, phrases, tasks }
 * ========================================================================= */
window.GUIDE_DATA = {
  units: {
    b1: {
      title: 'B1 エッセンシャル — 入出力の3本のパイプと EOF・文字列終端',
      lead: 'C言語のプログラムは「標準入力から読み、メモリ上で計算し、標準出力と標準エラー出力に書き分けるフィルター」です。まずはデータの通り道と配列の終端の仕組みを押さえよう。',
      pillars: [
        {
          tag: '入出力の本質',
          title: 'stdout（結果）と stderr（案内）は別のパイプ',
          why: '採点や自動テストでは <code class="ic">./a &lt; in.txt &gt; out.txt</code> で標準出力だけをファイルに保存し <code class="ic">diff</code> で正解と比べます。入力案内を <code class="ic">printf</code> で出すと <code class="ic">out.txt</code> に混ざって不一致になります。',
          contrast: [
            '<code class="ic">printf("n = ");</code> → リダイレクト先の <code class="ic">out.txt</code> に混入し diff が失敗する',
            '<code class="ic">fprintf(stderr, "n = ");</code> → 画面にだけ出て <code class="ic">out.txt</code> は結果だけの綺麗なまま！',
          ],
          rule: '計算結果は printf（stdout）、入力を促すプロンプトやエラーメッセージは必ず fprintf(stderr, ...)',
        },
        {
          tag: '反復終了の本質',
          title: 'scanf の戻り値は「読めた個数」、尽きたら EOF',
          why: 'データ件数が事前に決まっていない処理では、<code class="ic">scanf</code> が返す「成功した項目数」または終端定数 <code class="ic">EOF</code>（End Of File, 通常 -1）を使って無限ループを止めます。',
          contrast: [
            '回数を勝手に決め打ちして <code class="ic">for (i=0; i&lt;5; i++)</code> と書く → 入力件数が変わると破綻',
            '<code class="ic">if (scanf("%d", &amp;x) == EOF) { break; }</code> → 何件来ても、Ctrl+D やファイル末尾でピタッと止まる',
          ],
          rule: '件数不明の入力は「無限ループ + scanf(...) == EOF で break」！ double の入力は %lf（printf は %f）',
        },
        {
          tag: '文字列の本質',
          title: 'Cの文字列は「最後に \'\\0\' が置かれた char 配列」',
          why: 'C言語には専用の String 型がありません。文字の並びの直後にヌル文字 <code class="ic">\'\\0\'</code>（数値 0）を番兵として置くことで「ここまでが文字列」と表現します。また配列名はその先頭番地を表すため <code class="ic">==</code> では中身を比較できません。',
          contrast: [
            '<code class="ic">char s[5];</code> に 5 文字入れる（<code class="ic">\'\\0\'</code> が入らず暴走） / <code class="ic">s == "qq"</code> で比較する（常に偽）',
            '最大 N 文字なら <code class="ic">char s[N+1];</code> を確保し、比較は <code class="ic">strcmp(s, "qq") == 0</code> を使う',
          ],
          rule: '文字列配列は「文字数 + 1（\'\\0\' の分）」確保！ 走査は s[i] != \'\\0\'、一致判定は strcmp(a, b) == 0',
        },
      ],
    },
    b2: {
      title: 'B2 エッセンシャル — 関数の契約（プロトタイプ）・分割コンパイル・構造体',
      lead: '大きなプログラムを部品（関数・別ファイル・データ型）に分けて組み立てる技術を学びます。「コンパイル」と「リンク」の役割分担が見えればエラーは怖くありません。',
      pillars: [
        {
          tag: '分割コンパイルの本質',
          title: 'ヘッダ (.h) は「メニュー表」、実装 (.c) は「厨房」',
          why: 'コンパイラは <code class="ic">.c</code> を1ファイルずつ別々に機械語（<code class="ic">.o</code>）へ翻訳します。呼ぶ側の <code class="ic">main.c</code> を翻訳するとき、別ファイルにある関数の引数・戻り値の型（プロトタイプ宣言）や構造体定義を知るために <code class="ic">#include "xxx.h"</code> が必要です。',
          contrast: [
            '<code class="ic">.h</code> に関数の本体 <code class="ic">{ ... }</code> まで書く → 複数ファイルで include すると多重定義エラー',
            '<code class="ic">.h</code> には構造体定義とプロトタイプ宣言（末尾 <code class="ic">;</code>）だけを書き、両方の <code class="ic">.c</code> から include する',
          ],
          rule: '「型定義・マクロ・プロトタイプ宣言（;）」は .h へ、「関数の本体 { ... }」は .c へ書き、両方で #include "xxx.h"',
        },
        {
          tag: '値渡しと構造体の本質',
          title: '構造体 typedef struct { ... } xxx_t; は関連データの1パック',
          why: '点の座標 <code class="ic">(x, y)</code> や身長・体重などをバラバラの変数で持つと引数がだらけになります。構造体で1つの型 <code class="ic">point_t</code> にまとめれば、<code class="ic">p.x</code> のようにドット <code class="ic">.</code> で意味が明確になり、丸ごと引数や戻り値で渡せます。',
          contrast: [
            '<code class="ic">dist(x1, y1, x2, y2)</code> → 引数の順番を取り違えやすい',
            '<code class="ic">dist(point_t p1, point_t p2)</code> → 「点 p1 と点 p2 の距離」とコード自体が語る',
          ],
          rule: '実体（変数）のメンバーはドット「p.x」でアクセス！ 通常の引数渡しは「値のコピー」が渡される',
        },
        {
          tag: '数値計算・乱数の本質',
          title: '実数の 0 判定は fabs(x) <= EPS、乱数は % 幅 + 最小値',
          why: 'コンピュータの <code class="ic">double</code> は 2 進数の近似値なので計算誤差を含みます。<code class="ic">d == 0.0</code> のような厳密比較は危険です。また <code class="ic">rand()</code> は <code class="ic">0〜RAND_MAX</code> の整数を返すので、剰余 <code class="ic">%</code> で幅を絞って平行移動します。',
          contrast: [
            '重解判定を <code class="ic">d == 0.0</code> と書く / <code class="ic">[a, b]</code> の乱数を <code class="ic">rand() % b + a</code> と書く（個数がズレる）',
            '極小値で <code class="ic">fabs(d) &lt;= eps</code> と判定 / 個数は <code class="ic">(b - a + 1)</code> 個なので <code class="ic">rand() % (b - a + 1) + a</code>',
          ],
          rule: '区間 [a, b] の整数乱数は rand() % (b - a + 1) + a（サイコロなら rand() % 6 + 1）',
        },
      ],
    },
    b3: {
      title: 'B3 エッセンシャル — メモリの番地と「& / * / ->」の完全理解',
      lead: 'ポインタでつまずく原因の9割は「宣言の *」と「式の *」を混同することです。メモリの「番地（住所）」と「中身（住人）」をハッキリ区別しよう。',
      pillars: [
        {
          tag: '記号の意味',
          title: '「&x は x の番地」「*p は p が指す先の変数そのもの」',
          why: 'Cの関数は値渡し（コピー渡し）なので、普通に変数を渡しても呼び出し元の変数は書き換えられません。<b>呼び出し元の変数の「番地」を <code class="ic">&amp;</code> で渡し、関数側で <code class="ic">*p = 値;</code> とその番地の箱へ直接書き込む</b>ことで、2個以上の計算結果も返せるようになります。',
          contrast: [
            '宣言 <code class="ic">int *p;</code> と実行文 <code class="ic">*p = 10;</code> の <code class="ic">*</code> を同じ意味だと思って混乱する',
            '宣言の <code class="ic">int *p;</code> は「p は int の番地を入れるポインタ型」、式の <code class="ic">*p</code> は「p の矢印をたどった先の int 変数」',
          ],
          rule: '呼ぶ側は「fn(&q, &r)」と番地を渡し、受ける側は「fn(int *q, int *r)」で受け取り「*q = 値;」で指す先に書く！',
        },
        {
          tag: '構造体ポインタの本質',
          title: 'アロー演算子 p->x は (*p).x のスッキリ表記',
          why: '構造体をポインタ <code class="ic">point_t *p</code> で受け取ると、大きな構造体を丸ごとコピーせずに済み、中身を書き換えることもできます。<code class="ic">*p.x</code> と書くと演算子の優先順位で <code class="ic">*(p.x)</code> と解釈されてエラーになるため、専用の矢印 <code class="ic">p-&gt;x</code> を使います。',
          contrast: [
            '<code class="ic">scanf("%lf", p-&gt;x);</code> → 値（double）を渡してしまいクラッシュ！',
            '<code class="ic">scanf("%lf", &amp;p-&gt;x);</code> → <code class="ic">&amp;(p-&gt;x)</code> と解釈され、メンバー <code class="ic">x</code> の番地を正しく渡せる（文字配列メンバー <code class="ic">p-&gt;name</code> は <code class="ic">&amp;</code> 不要）',
          ],
          rule: '実体ならドット「a.x」、ポインタならアロー「p->x」！ scanf で数値メンバーを読むときは「&p->x」',
        },
        {
          tag: '配列とポインタの本質',
          title: '配列引数 int a[] の正体は、先頭要素の番地 int *a',
          why: '配列を関数に渡すとき、全要素がコピーされるのではなく<b>先頭要素の番地 <code class="ic">&amp;a[0]</code></b> だけが渡ります。だから関数内で <code class="ic">a[i] = ...</code> と書くと、呼び出し元の配列そのものが書き換わります（<code class="ic">a[i]</code> は <code class="ic">*(a + i)</code> と完全に同じ意味）。',
          contrast: [
            'カウント用配列 <code class="ic">c[]</code> を関数内で 0 初期化せずに <code class="ic">c[sum]++</code> する → 呼び出し元のゴミ値に足されてバグる',
            '受け取った結果用配列 <code class="ic">c[]</code> は、使う範囲を必ず最初に <code class="ic">c[s] = 0;</code> でゼロクリアしてから数える',
          ],
          rule: '配列名を渡せば関数内で呼び出し元の配列を直接読み書きできる！ カウント配列は必ず最初に 0 初期化！',
        },
      ],
    },
    b4: {
      title: 'B4 エッセンシャル — 2次元配列の添字設計と構造体ネスト（画像処理）',
      lead: '行列も画像も「2重ループで (i, j) を走査する2次元データ」です。添字の意味と、その場での交換（インプレース処理）の急所を掴もう。',
      pillars: [
        {
          tag: '2次元配列の本質',
          title: 'A[i][j] は「第 i 行・第 j 列」— 2重ループの外が i、内が j',
          why: 'メモリ上では <code class="ic">A[0][0], A[0][1], ...</code> と行ごとに一列に並んでいます。積 <code class="ic">y[i] += A[i][j] * x[j]</code> や <code class="ic">C[i][j] += A[i][k] * B[k][j]</code> では、<b>足し込む前に必ず受け皿を <code class="ic">0.0</code> で初期化</b>するのが鉄則です。',
          contrast: [
            '自分を転置する <code class="ic">matrix_trans1</code> で全要素 <code class="ic">j = 0 .. n-1</code> を交換する → 2回交換されて元の行列に戻ってしまう！',
            '対角線より右上だけ（<code class="ic">for (j = i + 1; j &lt; n; j++)</code>）を <code class="ic">tmp</code> を使って1回ずつ交換する',
          ],
          rule: '累積の前には必ず「y[i] = 0.0;」！ 自分自身の転置は上三角「j = i + 1」だけを3行スワップ！',
        },
        {
          tag: '画像データの構造',
          title: '画像は pixel_t（r, g, b）の2次元配列 + ヘッダ情報',
          why: 'BMP 画像の実際の幅・高さは配列の最大枠 <code class="ic">MAX_X, MAX_Y</code> ではなく、ヘッダ構造体の <code class="ic">hd-&gt;biWidth</code>（幅・列数）と <code class="ic">hd-&gt;biHeight</code>（高さ・行数）に入っています。また BMP 形式は <code class="ic">img[0][0]</code> が<b>左下</b>（下の行から順）に格納されています。',
          contrast: [
            'ループ上限を <code class="ic">MAX_Y, MAX_X</code> にする / 左右反転で全列 <code class="ic">j = 0 .. w-1</code> を交換して元に戻してしまう',
            '上限は <code class="ic">hd-&gt;biHeight, hd-&gt;biWidth</code> を使い、左右反転は左半分 <code class="ic">j &lt; w / 2</code> だけを <code class="ic">w - 1 - j</code> と交換する',
          ],
          rule: '画像ループは i < biHeight（縦）, j < biWidth（横）！ 鏡像は j < biWidth / 2 だけ交換！',
        },
        {
          tag: '複合構造体と static',
          title: '入れ子の構造体は「-> と . の組み合わせ」、巨大変数は static',
          why: 'ヘッダと画素配列を1つにまとめた <code class="ic">bmp_data_t *bmp</code> では、<code class="ic">bmp</code> がポインタなので <code class="ic">-&gt;</code>、中の <code class="ic">header</code> や <code class="ic">img[i][j]</code> は実体なので <code class="ic">.</code> となり <code class="ic">bmp-&gt;header.biWidth</code>, <code class="ic">bmp-&gt;img[i][j].r</code> と書きます。また数MB級の構造体をローカル変数にするとスタック領域があふれるため <code class="ic">static</code> を付けます。',
          contrast: [
            '<code class="ic">bmp-&gt;header-&gt;biWidth</code> と書いてエラー（<code class="ic">header</code> はポインタではない）',
            '矢印かドットかは「直前のものがポインタか実体か」だけで決まる：<code class="ic">bmp-&gt;header.biWidth</code>',
          ],
          rule: 'ポインタの後ろは「->」、構造体実体の後ろは「.」！ 大きな画像構造体は static で確保する',
        },
      ],
    },
    b5: {
      title: 'B5 エッセンシャル — ヒープ領域（malloc / realloc / free）の寿命管理',
      lead: '実行時に必要な分だけメモリを借りて（malloc）、関数を越えて使い、使い終わったら1バイト残らず返す（free）。動的メモリの3大原則を体得しよう。',
      pillars: [
        {
          tag: 'malloc の本質',
          title: 'ちょうどのバイト数を借り、直後に NULL チェックする',
          why: 'ローカル変数は関数が終わると消滅し、固定長配列は最大サイズ分の無駄が出ます。<code class="ic">malloc(sizeof(型) * 個数)</code> でヒープ領域から借りたメモリは、<code class="ic">free</code> するまで関数を抜けても生き続けます。',
          contrast: [
            '文字列のコピー先を <code class="ic">malloc(strlen(s))</code> で確保 → 終端 <code class="ic">\'\\0\'</code> の 1 バイトが足りず範囲外書き込み！',
            '要素 n 個なら <code class="ic">sizeof(型) * n</code>、文字列なら<b>必ず <code class="ic">strlen(s) + 1</code></b>（2倍連結なら <code class="ic">2 * len + 1</code>）確保し、<code class="ic">if (p == NULL) exit(1);</code>',
          ],
          rule: 'malloc(sizeof(T) * n) → 直後に NULL チェック！ 文字列の動的割当ては絶対に「+ 1（\'\\0\' の分）」を忘れない',
        },
        {
          tag: 'free と所有権の本質',
          title: 'malloc した回数と同じ回数 free する（内側から外側へ！）',
          why: '<code class="ic">free</code> を忘れるとメモリリークになり、逆に構造体 <code class="ic">s</code> を先に <code class="ic">free(s)</code> してしまうと <code class="ic">s-&gt;data</code> の番地が読めなくなって中身を解放できなくなります。また EOF で読み込み失敗した際も、先に借りていた箱を <code class="ic">free</code> してから <code class="ic">return NULL;</code> します。',
          contrast: [
            '<code class="ic">free(s); free(s-&gt;data);</code> → 解放済みの <code class="ic">s</code> を読む不正アクセス（Use-After-Free）！',
            '必ず<b>中身 <code class="ic">free(s-&gt;data);</code> → 外箱 <code class="ic">free(s);</code></b> の順（2次元動的配列も <code class="ic">A[i]</code> ループ解放 → <code class="ic">free(A)</code>）',
          ],
          rule: '解放は「借りた順の逆（内側 → 外側）」！ 入力失敗で途中 return するときも直前の malloc を free してから戻る',
        },
        {
          tag: 'スタックと realloc の本質',
          title: 'sp は「次に入れる位置（＝現在の要素数）」、拡張は一時ポインタで受ける',
          why: 'スタック <code class="ic">istack_t</code> では <code class="ic">sp == 0</code> が空、<code class="ic">sp == size</code> が満杯です。push は <code class="ic">data[sp] = d; sp++;</code>、pop は <code class="ic">sp--; return data[sp];</code> の対称形になります。満杯時の <code class="ic">realloc</code> は失敗時に <code class="ic">NULL</code> を返しても元のデータを失わないよう一時ポインタ <code class="ic">p</code> で受けます。',
          contrast: [
            '<code class="ic">s-&gt;data = realloc(s-&gt;data, ...);</code> と直接上書き / <code class="ic">s-&gt;size *= 2;</code> を更新し忘れる',
            '<code class="ic">int *p = realloc(s-&gt;data, sizeof(int) * s-&gt;size * 2);</code> で NULL 確認後に <code class="ic">s-&gt;data = p; s-&gt;size *= 2;</code>',
          ],
          rule: 'push は「書いてから sp++」、pop は「sp-- してから読む」！ realloc は一時ポインタで受けて size も2倍に更新',
        },
      ],
    },
    b6: {
      title: 'B6 エッセンシャル — リストの矢印つなぎ替え・先読み走査・二分探索木',
      lead: 'ポインタで節点（ノード）を数珠つなぎにするデータ構造です。「矢印を書き換える順番」と「ダミー節点からの先読み」さえ図でイメージできれば完璧です。',
      pillars: [
        {
          tag: 'リスト挿入の本質',
          title: 'ダミー節点が先頭を統一し、挿入は「新→後、前→新」の順でつなぐ',
          why: '先頭に空の番人（ダミー節点 <code class="ic">head_p</code>）を1個置くことで、「先頭への挿入」も「途中への挿入」もすべて「ある節点 <code class="ic">n</code> の直後への挿入 <code class="ic">insert_node(n, val)</code>」という1つの関数で統一できます。',
          contrast: [
            '先に <code class="ic">n-&gt;next = new_node;</code> と書いてしまう → 元々後ろにつながっていたリスト全体の番地が上書きされて消滅！',
            '① <code class="ic">new_node-&gt;next = n-&gt;next;</code>（新しい節点から後ろへ手を伸ばす）→ ② <code class="ic">n-&gt;next = new_node;</code>（前の節点の手をつなぎ替える）',
          ],
          rule: '矢印のつなぎ替えは「先に新しい節点の next をつないでから、前の節点の next を書き換える」！',
        },
        {
          tag: '2種類の走査イディオム',
          title: '見るだけなら p = head_p->next、削除・昇順挿入なら「先読み p->next」',
          why: '単方向リストは後ろへ戻れません。ある節点を削除したりその手前に挿入するには<b>「1つ手前の節点 <code class="ic">p</code>」</b>が必要です。そこでダミー <code class="ic">head_p</code> から出発し、常に1歩先の <code class="ic">p-&gt;next-&gt;val</code> を覗き見ながら進みます。',
          contrast: [
            '削除したい節点 <code class="ic">q</code> まで進んでしまい、手前の節点の <code class="ic">next</code> を書き換えられなくなる',
            '<code class="ic">for (p = head_p; p-&gt;next != NULL; p = p-&gt;next)</code> で <code class="ic">p-&gt;next</code> を調べ、見つけたら <code class="ic">remove_node(p)</code>！',
          ],
          rule: '探索・表示は「p = head_p->next」、削除や手前への挿入はダミーから「p = head_p で p->next を先読み」！',
        },
        {
          tag: '計算量と二分探索木',
          title: 'リスト探索は O(n)、二分探索木は左右分岐で O(log n)',
          why: 'リストは n 件あると平均 n/2 回の比較が必要です（n 件挿入すると O(n²)）。二分探索木は「左の子 &lt; 自分 &lt; 右の子」の規則で枝分かれするため、1歩ごとに候補が半分になり圧倒的に高速です。通りがけ順（左→自分→右）で再帰すると自動的に昇順で出力されます。',
          contrast: [
            '<code class="ic">tree_insert_uniq</code> で再帰呼び出しの結果を <code class="ic">n-&gt;left = ...</code> に代入し忘れる → 新節点が木につながらない',
            '<code class="ic">n == NULL</code> なら <code class="ic">create_node(val)</code> を返し、小さければ <code class="ic">n-&gt;left = tree_insert_uniq(n-&gt;left, val);</code> で親につなぐ',
          ],
          rule: '二分探索木は「左 < 自分 < 右」！ 昇順出力は「左を再帰 → 自分を出力 → 右を再帰」、解放は「左 → 右 → 自分を free」',
        },
      ],
    },
    t1: {
      title: 'T1 エッセンシャル — 中間試験（70分・20点満点）で満点を取る鉄則',
      lead: '試験範囲（B1〜B4）で問われるパターンは明確に4分野（ポインタ引数・構造体ポインタ・配列と乱数分布・2次元配列の行列）です。減点ゼロの型を固めよう。',
      pillars: [
        {
          tag: '採点基準の本質',
          title: 'diff -Bw で完全一致 + 隠しテスト + 題意チェック',
          why: '本番の採点は問題文の入力だけでなく<b>別の入力データ（件数違い・境界値・エラー入力）</b>でもテストされます。また、呼び出し元の <code class="ic">main</code> が結果配列にわざとゴミ値を入れてから関数を呼ぶため、<b>関数側での 0 初期化忘れ</b>は一発で露見します。',
          contrast: [
            '問題文の入力例のサイズ（例: n=3）を決め打ちする / 結果返却用関数の中で勝手に <code class="ic">printf</code> する',
            '必ず引数 <code class="ic">n</code> でループを回し、関数は指定されたポインタ先や配列への格納・戻り値だけに徹する',
          ],
          rule: 'コンパイル → ./a < xxx-in.txt > out.txt → diff -Bw out.txt xxx-exp.txt で無出力（一致）を毎回確認！',
        },
        {
          tag: 'ポインタ・構造体の急所',
          title: '「*p = 値」で返し、「&p->x」で読み、EOF をそのまま返す',
          why: '問1・問2の頻出パターンは、複数の計算結果をポインタ引数 <code class="ic">*h, *m, *s</code> や <code class="ic">*min, *max, *ave</code> に書き込む関数と、構造体ポインタ <code class="ic">point_t *p</code> に入力して EOF なら <code class="ic">return EOF;</code> を返す入力関数です。',
          contrast: [
            '<code class="ic">min = 0; max = 0;</code> で初期化する → 全部負の数のテストデータや全部大きい数のデータで不正解になる！',
            '最小値・最大値の初期値は必ず<b>最初の要素 <code class="ic">a[0]</code></b>（<code class="ic">*min = a[0]; *max = a[0];</code>）にする',
          ],
          rule: '最小・最大の初期値は必ず a[0]！ 構造体入力関数はプロンプトを stderr に出し、scanf == EOF なら return EOF;',
        },
        {
          tag: '配列・行列の急所',
          title: 'カウント配列のゼロ初期化・積の 0.0 初期化・swap の tmp',
          why: '問3（乱数・度数分布）では <code class="ic">c[]</code> にゴミが入っている前提でまず 0 クリアします。問4（行列計算）では行列積 <code class="ic">C[i][j] = 0.0;</code> や行和・列和 <code class="ic">r[i] = 0.0; c[i] = 0.0;</code> の初期化と、行交換での一時変数 <code class="ic">tmp</code> が鍵です。',
          contrast: [
            '100点を10で割った階級 <code class="ic">k = 10</code> をそのまま <code class="ic">c[10]++</code> して範囲外アクセス（<code class="ic">c[0..9]</code> しかない）',
            '境界値（100点 → <code class="ic">if (k &gt;= N_CLASS) k = N_CLASS - 1;</code>）や異常値時の <code class="ic">exit(1);</code> まで丁寧にケアする',
          ],
          rule: '受け取った結果配列 c[], C[][] は使う前に必ず 0 で初期化！ 配列の上限境界と 0 除算・データ 0 件を確認',
        },
      ],
    },
  },
  phrases: [
    {
      id: 'ph-stderr',
      unit: 'b1',
      also: ['b2', 'b3', 'b4', 't1'],
      cat: '入出力・diff対策',
      must: true,
      title: '入力案内・エラーを stderr（標準エラー出力）へ出す',
      short: 'fprintf(stderr, "n = ");',
      code: 'fprintf(stderr, "n = ");\nscanf("%d", &n);',
      parts: [
        ['fprintf', '出力先のストリームを指定できる printf'],
        ['stderr', '標準エラー出力（リダイレクト > out.txt に混ざらない画面専用パイプ）'],
        ['&n', '読み取った整数を書き込む変数 n の「番地」'],
      ],
      intent: '自動採点や <code class="ic">./a &lt; in.txt &gt; out.txt</code> で標準出力を保存したとき、案内文が <code class="ic">out.txt</code> に混入して <code class="ic">diff</code> が失敗するのを防ぎます。',
      trap: '<code class="ic">printf("n = ");</code> と書くと標準出力に出てしまい、計算結果が合っていても <code class="ic">diff</code> で不正解になります。',
      when: 'キーボード入力の案内（プロンプト）や、エラーメッセージを出す場面すべて。',
      detect: /fprintf\s*\(\s*stderr/,
    },
    {
      id: 'ph-eof',
      unit: 'b1',
      also: ['b3', 'b6', 't1'],
      cat: '反復・EOF',
      must: true,
      title: 'EOF（入力の終わり）まで無限ループで読み続ける',
      short: 'if (scanf("%d", &x) == EOF) { break; }',
      code: 'for (;;) {\n  if (scanf("%d", &x) == EOF) {\n    break;\n  }\n  /* x を使った処理 */\n}',
      parts: [
        ['for (;;)', '回数未定の無限ループ（while (1) と同じ）'],
        ['scanf(...) == EOF', '入力が尽きた（ファイル終端 / Ctrl+D）かどうかの判定'],
        ['break;', 'データが尽きた瞬間にループを抜け、集計処理や終了へ進む'],
      ],
      intent: '事前にデータ件数が分からない入力を、1件残らず最後まで処理してピタッと止める基本イディオムです。',
      trap: '<code class="ic">scanf</code> の結果を確認せずに次の行へ進むと、EOF のときに前回の古い <code class="ic">x</code> の値をもう1回処理してしまうバグになります。',
      when: '「EOF まで入力を繰り返し〜」と書かれたすべての課題・試験問題。',
      detect: /scanf\s*\([^)]*\)\s*==\s*EOF/,
    },
    {
      id: 'ph-double-io',
      unit: 'b1',
      also: ['b2', 'b3', 'b4', 't1'],
      cat: '型と書式',
      must: true,
      title: 'double 型の入出力ペア（入力は %lf、出力は %f）',
      short: 'scanf("%lf", &x); / printf("%.4f\\n", x);',
      code: 'double x;\nscanf("%lf", &x);        /* 入力は %lf (&を付ける) */\nprintf("%.4f\\n", x);     /* 出力は %f  (小数4桁) */',
      parts: [
        ['"%lf"', 'scanf で double（8バイト実数）を読む専用指定（%f だと float 扱いになり壊れる！）'],
        ['&x', '変数 x の先頭番地を渡す'],
        ['"%.4f"', '小数点以下4桁まで表示（%9.5f なら全体9文字幅・小数5桁で右揃え）'],
      ],
      intent: '<code class="ic">scanf</code> はポインタ先のバイト幅を知る必要があるため、<code class="ic">float</code>（4バイト: <code class="ic">%f</code>）と <code class="ic">double</code>（8バイト: <code class="ic">%lf</code>）を厳格に区別します。',
      trap: '<code class="ic">scanf("%f", &amp;x);</code> と書くと上位4バイトしか書き込まれず、意味不明な巨大数値や 0 になります。',
      when: '距離・平均・方程式・行列など実数（double）を扱うすべての課題。',
      detect: /scanf\s*\(\s*"[^"]*%lf/,
    },
    {
      id: 'ph-nullchar',
      unit: 'b1',
      also: ['b5', 't1'],
      cat: '文字列',
      must: true,
      title: '文字列の1文字ずつ走査（ヌル文字 \'\\0\' まで）',
      short: "for (i = 0; s[i] != '\\0'; i++)",
      code: "char s[32];              /* 最大31文字 + '\\0' */\nscanf(\"%31s\", s);        /* 配列名は & 不要！ */\nfor (i = 0; s[i] != '\\0'; i++) {\n  /* s[i] を1文字ずつ調べる */\n}",
      parts: [
        ['char s[32]', '最大31文字 + 終端ヌル文字 1 バイト分の箱'],
        ['scanf("%31s", s)', '配列名はそれ自体が先頭番地なので & を付けない。31文字上限でバッファあふれ防止'],
        ["s[i] != '\\0'", '文字列の終わりを表す番兵（数値 0）に当たるまで繰り返す'],
      ],
      intent: '<code class="ic">strlen</code> を呼ばなくても、終端記号 <code class="ic">\'\\0\'</code> を見るだけでどんな長さの英単語でも先頭から末尾まで安全になめられます。',
      trap: '<code class="ic">\'\\0\'</code>（文字）と <code class="ic">"\\0"</code>（文字列ポインタ）や <code class="ic">\'0\'</code>（数字のゼロ = 文字コード48）を混同しないこと！',
      when: '文字列の文字置換・文字数カウント・文字種判定をするとき。',
      detect: /!=\s*'\\0'/,
    },
    {
      id: 'ph-strcmp',
      unit: 'b1',
      also: ['t1'],
      cat: '文字列',
      must: true,
      title: '文字列の一致判定とコピー（strcmp / strcpy）',
      short: 'if (strcmp(s, "qq") == 0)',
      code: '#include <string.h>\nif (strcmp(s, "qq") == 0) { break; }  /* 完全一致 */\nstrcpy(dst, src);                     /* 丸ごとコピー */',
      parts: [
        ['strcmp(a, b) == 0', '辞書順の差が 0 ＝ 2つの文字列の内容が完全に等しい'],
        ['strcpy(dst, src)', 'src の文字並びを終端 \'\\0\' ごと dst の配列へコピーする'],
      ],
      intent: 'C言語の配列名は「先頭番地」にすぎないため、<code class="ic">==</code> や <code class="ic">=</code> では文字列の中身を比較・代入できません。必ず <code class="ic">&lt;string.h&gt;</code> の関数を使います。',
      trap: '<code class="ic">if (strcmp(s, "qq"))</code> と <code class="ic">== 0</code> を書き忘れると、「一致したときに 0（偽）になり実行されない」という真逆のバグになります！',
      when: '終了キーワード（"qq" など）の判定や、最長単語の保存など。',
      detect: /strcmp\s*\(/,
    },
    {
      id: 'ph-header',
      unit: 'b2',
      also: ['b4', 'b5', 'b6', 't1'],
      cat: '分割コンパイル',
      must: true,
      title: 'ヘッダファイル (.h) と実装 (.c) の3点セット構成',
      short: '#include "xxx.h" + プロトタイプ宣言(;)',
      code: '/* xxx.h : 型定義とプロトタイプ宣言（末尾に ;） */\ntypedef struct { double x, y; } point_t;\ndouble dist(point_t p1, point_t p2);\n\n/* xxx.c と xxxmain.c の両方の先頭で読み込む */\n#include "xxx.h"',
      parts: [
        ['typedef struct {...} 名;', '構造体型に別名を付け、両ファイルで同じメモリ配置を共有'],
        ['型 関数名(引数);', '末尾セミコロン付きのプロトタイプ宣言（コンパイラへの予告）'],
        ['#include "xxx.h"', '二重引用符 "" でカレントディレクトリの自作ヘッダを取り込む'],
      ],
      intent: '呼ぶ側（main.c）と作る側（xxx.c）の両方が同じ <code class="ic">.h</code> を読み込むことで、引数の型違いや戻り値違いをコンパイル時に確実に検出できます。',
      trap: '<code class="ic">gcc main.c</code> だけ実行すると <code class="ic">undefined reference to ...</code>（リンクエラー）になります。必ず <code class="ic">gcc main.c xxx.c</code> と両方の <code class="ic">.c</code> を渡すこと！',
      when: '複数ファイルに分割された課題・中間試験の全問題。',
      detect: /#include\s*"[^"]+\.h"/,
    },
    {
      id: 'ph-eps',
      unit: 'b2',
      also: ['b1', 'b3', 't1'],
      cat: '数値計算',
      must: false,
      title: '浮動小数点数のゼロ・等値判定（fabs と許容誤差 EPS）',
      short: 'if (fabs(d) <= EPS)',
      code: '#include <math.h>\n#define EPS 1e-9\nif (fabs(a - b) <= EPS) {\n  /* a と b は実質的に等しい */\n}',
      parts: [
        ['fabs(x)', 'double 型の絶対値を返す関数（int 用の abs と間違えない！）'],
        ['<= EPS', '丸め誤差（10⁻⁹ や DBL_EPSILON 程度）以内なら等しいとみなす'],
      ],
      intent: '2進浮動小数点数では <code class="ic">0.1 + 0.2</code> すら厳密な <code class="ic">0.3</code> になりません。判別式 <code class="ic">D == 0</code> や円の外接判定、二分法・ニュートン法の収束判定には絶対値と微小幅を使います。',
      trap: '実数に対して <code class="ic">abs(x)</code> を使うと整数に切り捨てられて <code class="ic">0.5</code> が <code class="ic">0</code> になってしまいます。実数は必ず <code class="ic">fabs</code>！',
      when: '2次方程式の重解判定、二分法の収束判定、幾何の接触判定。',
      detect: /fabs\s*\(/,
    },
    {
      id: 'ph-rand',
      unit: 'b2',
      also: ['b3', 't1'],
      cat: '乱数・シミュレーション',
      must: true,
      title: '区間 [a, b] の一様整数乱数と度数カウント',
      short: 'rand() % (b - a + 1) + a',
      code: 'int r = rand() % (b - a + 1) + a;  /* a以上 b以下の整数 */\n/* サイコロ (1〜6) の場合: */\nd[i] = rand() % 6 + 1;',
      parts: [
        ['rand()', '0 以上 RAND_MAX 以下の疑似乱数整数を発生させる'],
        ['% (b - a + 1)', '剰余で 0 〜 (b - a) の「個数分」の幅に収める（+1 を忘れない！）'],
        ['+ a', '最小値 a を足して区間を [a, b] にスライドさせる'],
      ],
      intent: 'たとえば 1〜6 なら個数は <code class="ic">6 - 1 + 1 = 6</code> 個。<code class="ic">rand() % 6</code> で <code class="ic">0〜5</code> を作り、<code class="ic">+ 1</code> で <code class="ic">1〜6</code> にします。',
      trap: '<code class="ic">b - a</code> で割ってしまうと最大値 <code class="ic">b</code> が一生出なくなります！ またテストの再現性を保つため、指定がない限り勝手に <code class="ic">srand(time(NULL))</code> を呼ばないこと。',
      when: 'サイコロ・点数生成・乱数実験（課題2-8, 3-10, 模擬試験問3）。',
      detect: /rand\s*\(\s*\)\s*%/,
    },
    {
      id: 'ph-ptr-out',
      unit: 'b3',
      also: ['b5', 't1'],
      cat: 'ポインタ引数',
      must: true,
      title: 'ポインタ引数で複数の計算結果を呼び出し元へ返す',
      short: '呼ぶ側 fn(&q, &r) / 関数内 *q = ...;',
      code: 'void divrem(int x, int y, int *q, int *r)\n{\n  *q = x / y;   /* q が指す先の変数に商を書く */\n  *r = x % y;   /* r が指す先の変数に余りを書く */\n}\n/* 呼び出し側: divrem(a, b, &quo, &rem); */',
      parts: [
        ['int *q, int *r', '書き込みたい変数の「番地」を受け取るポインタ仮引数'],
        ['*q = ...', 'ポインタ q の矢印をたどった先の変数へ値を書き込む'],
        ['&quo, &rem', '呼び出し側で変数の番地を取り出して渡す'],
      ],
      intent: 'C言語の <code class="ic">return</code> は1つの値しか返せません。結果を入れる箱の「番地」を渡してもらうことで、商と余り・最小と最大と平均・配列とその要素数など何個でも結果を返せます。',
      trap: '関数内で <code class="ic">q = x / y;</code> と <code class="ic">*</code> を忘れると「番地そのもの」を上書きしようとしてエラー/クラッシュになります。',
      when: '2つ以上の値を返す関数すべて（課題3-4〜3-6, 3-9, 5-1, T1問1）。',
      detect: /\*\s*\w+\s*=\s*[^;]+;/,
    },
    {
      id: 'ph-arrow-addr',
      unit: 'b3',
      also: ['b4', 'b5', 't1'],
      cat: '構造体ポインタ',
      must: true,
      title: '構造体ポインタへの入力（&p->x）とメンバー参照（p->x）',
      short: 'scanf("%lf", &p->x);',
      code: 'int point_scan(point_t *p)\n{\n  fprintf(stderr, "x y = ");\n  if (scanf("%lf%lf", &p->x, &p->y) == EOF) { return EOF; }\n  return 1;\n}',
      parts: [
        ['point_t *p', '構造体の実体ではなく先頭番地（8バイト）だけを受け取る'],
        ['p->x', '(*p).x と同じ意味。ポインタ p が指す構造体のメンバー x'],
        ['&p->x', '&(p->x) と結合する！「メンバー x の番地」を scanf に渡す'],
      ],
      intent: '<code class="ic">-&gt;</code> は <code class="ic">&amp;</code> より優先順位が高いため、括弧なしで <code class="ic">&amp;p-&gt;x</code> と書くだけで「p が指す構造体の中のメンバー x の番地」になります（入れ子なら <code class="ic">&amp;p-&gt;c.x</code>）。',
      trap: '数値メンバーなのに <code class="ic">&amp;</code> を忘れるとクラッシュ。逆に <code class="ic">char name[16]</code> のような文字配列メンバーは <code class="ic">p-&gt;name</code> 自体が先頭番地なので <code class="ic">&amp;</code> は不要です。',
      when: '構造体ポインタを受け取って標準入力から値を入れる関数（課題3-7, 5-7, T1問2）。',
      detect: /&\s*\w+->\w+|->\w+/,
    },
    {
      id: 'ph-hist-init',
      unit: 'b3',
      also: ['b5', 't1'],
      cat: '配列・度数分布',
      must: true,
      title: '度数分布・カウント配列のゼロ初期化とバケット集計',
      short: 'c[s] = 0 で初期化 → c[val]++',
      code: 'for (s = MIN; s <= MAX; s++) {\n  c[s] = 0;                 /* 1. 必ず最初に 0 クリア！ */\n}\nfor (i = 0; i < n; i++) {\n  c[a[i]]++;                /* 2. 値そのものを添字にして +1 */\n}',
      parts: [
        ['c[s] = 0;', '呼び出し元の配列に入っている不定値（ゴミ）を確実に消す'],
        ['c[a[i]]++', '出た値 a[i] に対応する箱のカウントを 1 増やす（最小値 min がある場合は c[a[i] - min]++）'],
      ],
      intent: 'ループの中に 1〜6 の if 分岐を6個書く必要はありません。「出た目の値をそのまま配列の添字にする」だけで1行で集計できます。',
      trap: '初期化ループを忘れると、テスト用の main が仕込んだゴミ値に加算されて全滅します！',
      when: 'サイコロの和の分布、点数のヒストグラム、出現回数カウント（課題3-10, 5-2, T1問3）。',
      detect: /\w+\[[^\]]+\]\+\+/,
    },
    {
      id: 'ph-swap-tri',
      unit: 'b4',
      also: ['b3', 't1'],
      cat: '2次元配列・交換',
      must: true,
      title: '3行スワップと上三角走査（自分自身の転置・鏡像反転）',
      short: 'for (j = i + 1; j < n; j++) { tmp = ... }',
      code: 'for (i = 0; i < n; i++) {\n  for (j = i + 1; j < n; j++) {   /* 対角より右上だけ！ */\n    tmp = A[i][j];\n    A[i][j] = A[j][i];\n    A[j][i] = tmp;\n  }\n}',
      parts: [
        ['j = i + 1', '対角成分 (i==j) を除き、上三角のペアだけを1回ずつ選ぶ'],
        ['tmp = A[i][j]', '上書きで消える前に一時変数 tmp に退避する3行スワップ'],
      ],
      intent: '別の配列を使わずにその場で入れ替える（インプレース処理）ときは、「ペアを1回だけ交換する範囲制限」が命です（左右反転なら <code class="ic">j &lt; width / 2</code>）。',
      trap: '内側のループを <code class="ic">j = 0; j &lt; n; j++</code> にすると、<code class="ic">(1,2)</code> と <code class="ic">(2,1)</code> で2回交換が起きて元の行列に戻ってしまいます！',
      when: '配列1つでの転置（課題4-1(5)）、画像の左右鏡像反転（課題4-2(4)）、行の入れ替え（T1 3-問4）。',
      detect: /j\s*=\s*i\s*\+\s*1/,
    },
    {
      id: 'ph-mat-prod',
      unit: 'b4',
      also: ['t1'],
      cat: '2次元配列・行列',
      must: true,
      title: '行列×ベクトル積・行列×行列積（0.0 初期化 → += 累積）',
      short: 'y[i] = 0.0; for (j...) y[i] += A[i][j] * x[j];',
      code: 'for (i = 0; i < n; i++) {\n  y[i] = 0.0;                     /* 累積前に必ず 0 クリア！ */\n  for (j = 0; j < n; j++) {\n    y[i] += A[i][j] * x[j];       /* 第i行とxの内積 */\n  }\n}',
      parts: [
        ['y[i] = 0.0;', '内積を足し始める前に、要素 i の受け皿を 0 にリセット'],
        ['A[i][j] * x[j]', '行列積 C=AB の場合は k ループで C[i][j] += A[i][k] * B[k][j]'],
      ],
      intent: '内積のシグマ記号 $\\sum_{j=0}^{n-1} A_{ij} x_j$ をそのまま C コードに翻訳した形です。「<code class="ic">= 0.0</code> の直後に <code class="ic">for</code> で <code class="ic">+=</code>」はセットで手が動くようにしましょう。',
      trap: '<code class="ic">y[i] = 0.0;</code> を忘れると未初期化のゴミ値に足し込まれ、毎回結果が変わる深刻なバグになります。',
      when: '行列とベクトルの積（課題4-1(7)）、行列の積（T1 1-問4）、行和・列和（T1 3-問4）。',
      detect: /\+=\s*\w+\[\w+\]\[\w+\]\s*\*/,
    },
    {
      id: 'ph-malloc',
      unit: 'b5',
      also: ['b6'],
      cat: '動的メモリ',
      must: true,
      title: 'malloc の黄金テンプレート（確保 → NULL検査 → 使用 → free）',
      short: 'p = malloc(sizeof(int) * n); if (p == NULL) exit(1);',
      code: 'int *a = malloc(sizeof(int) * n);\nif (a == NULL) {\n  fprintf(stderr, "malloc failed\\n");\n  exit(1);\n}\n/* ... a[0] 〜 a[n-1] を使用 ... */\nfree(a);\na = NULL;',
      parts: [
        ['sizeof(int) * n', '1要素のバイト数 × 個数（環境に依存せず正確なバイト数を計算）'],
        ['if (a == NULL)', 'メモリ不足で確保失敗したときに NULL 番地アクセスで暴走するのを防ぐ'],
        ['free(a); a = NULL;', '使い終わったヒープ領域を OS に返却し、ポインタも無効化する'],
      ],
      intent: 'ヒープ領域のメモリはプログラマが明示的に借りて返す資源です。「借りたらすぐ NULL 確認」「使い終わったら必ず free」を1セットで書きます。',
      trap: '<code class="ic">malloc(n)</code> のように <code class="ic">sizeof(型)</code> を掛け忘れると、int（4バイト）配列なのに 1/4 のサイズしか確保されず範囲外破壊を起こします！',
      when: '動的な配列・構造体・リスト節点・二分木節点を作るすべての場面（B5, B6 全般）。',
      detect: /malloc\s*\(\s*sizeof/,
    },
    {
      id: 'ph-strlen1',
      unit: 'b5',
      also: [],
      cat: '動的メモリ・文字列',
      must: true,
      title: '文字列のぴったりサイズ動的割当て（strlen(s) + 1）',
      short: 'malloc(sizeof(char) * (strlen(s) + 1))',
      code: 'p = malloc(sizeof(char) * (strlen(s) + 1));\nif (p == NULL) { exit(1); }\nstrcpy(p, s);',
      parts: [
        ['strlen(s)', '終端 \'\\0\' を除いた純粋な文字数を返す'],
        ['+ 1', '文字列の最後に置くヌル文字 \'\\0\' の 1 バイト分！（超重要）'],
        ['strcpy(p, s)', '\'\\0\' を含む strlen(s)+1 バイト分を確保した領域へコピー'],
      ],
      intent: '<code class="ic">"abc"</code> の <code class="ic">strlen</code> は 3 ですが、メモリには <code class="ic">\'a\',\'b\',\'c\',\'\\0\'</code> の <b>4 バイト</b>が必要です。だから必ず <code class="ic">+ 1</code> します。',
      trap: '<code class="ic">+ 1</code> を忘れると、<code class="ic">strcpy</code> や終端代入が確保枠の1バイト外を踏み抜きます（B5 の自動チェックでも減点・エラーになります）。',
      when: '文字列の動的コピー・連結・行の保存（課題5-3, 5-4）。',
      detect: /strlen\s*\([^)]*\)\s*\+\s*1|2\s*\*\s*len\s*\+\s*1/,
    },
    {
      id: 'ph-fgets',
      unit: 'b5',
      also: [],
      cat: '行入力',
      must: false,
      title: '空白を含む1行まるごと読み込み（fgets ループ）',
      short: 'while (fgets(s, LINELEN, stdin) != NULL)',
      code: 'char s[LINELEN + 1];\nwhile (fgets(s, LINELEN, stdin) != NULL) {\n  /* s には改行文字 \\n まで含めて1行が入る */\n}',
      parts: [
        ['fgets(s, 上限, stdin)', '標準入力から最大「上限-1」文字または改行まで安全に1行読む'],
        ['!= NULL', 'scanf の EOF と違い、fgets は入力終了時に NULL ポインタを返す！'],
      ],
      intent: '<code class="ic">scanf("%s", s)</code> は空白で区切られてしまいますが、<code class="ic">fgets</code> ならスペースを含む1行を改行 <code class="ic">\'\\n\'</code> ごと安全に読み込めます。',
      trap: '終了判定を <code class="ic">== EOF</code> ではなく <b><code class="ic">!= NULL</code></b> で書くこと！ また <code class="ic">s</code> には末尾に <code class="ic">\'\\n\'</code> が入っているので出力時は <code class="ic">printf("%s", line[i])</code> と改行を足さずに出します。',
      when: 'テキストを1行単位で読み込む処理（課題5-4 linereverse）。',
      detect: /fgets\s*\(/,
    },
    {
      id: 'ph-realloc',
      unit: 'b5',
      also: [],
      cat: '動的メモリ・スタック',
      must: true,
      title: 'realloc による動的配列の安全な2倍拡張',
      short: 'int *p = realloc(s->data, sizeof(int) * s->size * 2);',
      code: 'if (istack_full(s)) {\n  int *p = realloc(s->data, sizeof(int) * s->size * 2);\n  if (p == NULL) { fprintf(stderr, "realloc failed\\n"); exit(1); }\n  s->data = p;\n  s->size = s->size * 2;\n}',
      parts: [
        ['realloc(旧ポインタ, 新バイト数)', '既存データを保ったまま広いメモリへ拡張（必要なら自動で引っ越し＆旧領域解放）'],
        ['int *p = ...', '万一 NULL が返ったとき元の s->data の番地を失わないよう一時変数で受ける'],
        ['s->size = s->size * 2', '構造体が記録している容量上限も忘れず2倍に更新する'],
      ],
      intent: 'スタックや動的配列が満杯になったとき、容量を2倍ずつ広げることで、何万件 push されても高速（償却 $O(1)$）に格納し続けられます。',
      trap: '新サイズに <code class="ic">sizeof(int)</code> を掛け忘れるミスと、<code class="ic">s-&gt;size</code> の更新忘れが2大頻出バグです。',
      when: '可変長スタック・ベクタの拡張（課題5-8(5)）。',
      detect: /realloc\s*\(/,
    },
    {
      id: 'ph-list-ins',
      unit: 'b6',
      also: [],
      cat: '連結リスト',
      must: true,
      title: 'リスト節点の直後挿入（矢印つなぎ替えの黄金2行）',
      short: 'new_node->next = n->next; n->next = new_node;',
      code: 'list_node_t *new_node = create_node(val);\nnew_node->next = n->next;   /* ① 新節点 → 元の「次」へつなぐ */\nn->next = new_node;         /* ② 節点 n → 新節点へ切り替える */',
      parts: [
        ['create_node(val)', 'malloc で新節点を作り val を入れ next=NULL にしたポインタを得る'],
        ['new_node->next = n->next;', '【必ず先！】まだ n->next が残っているうちに新節点の後ろをつなぐ'],
        ['n->next = new_node;', '【必ず後！】前の節点 n の矢印を新節点へ振り向ける'],
      ],
      intent: 'ダミー節点 <code class="ic">head_p</code> があるリストでは、先頭挿入は <code class="ic">insert_node(head_p, val)</code>、途中挿入は <code class="ic">insert_node(p, val)</code> でどちらもこの2行だけで完結します。',
      trap: '①と②の順番を逆にすると、<code class="ic">n-&gt;next</code> が <code class="ic">new_node</code> で上書きされ、<code class="ic">new_node-&gt;next = new_node</code>（自分自身を指す無限ループ！）になって後ろの節点がすべて迷子になります。',
      when: '連結リストへの要素挿入すべて（課題6-1〜6-8）。',
      detect: /new_node->next\s*=\s*\w+->next/,
    },
    {
      id: 'ph-list-walk',
      unit: 'b6',
      also: [],
      cat: '連結リスト',
      must: true,
      title: 'リストの基本走査【型A】（ダミーの次 head_p->next から終端まで）',
      short: 'for (p = head_p->next; p != NULL; p = p->next)',
      code: 'list_node_t *p;\nfor (p = head_p->next; p != NULL; p = p->next) {\n  if (p->val == val) { return p; }\n}\nreturn NULL;',
      parts: [
        ['p = head_p->next', 'ダミー節点（head_p 自身）はデータを持たないので「その次」から開始！'],
        ['p != NULL', '最後の節点の next（NULL）に到達するまで続ける'],
        ['p = p->next', '配列の i++ に相当。矢印をたどって次の節点へ進む'],
      ],
      intent: 'リストの中身を表示したり、値 <code class="ic">val</code> を持つ節点を探したりする「読むだけ」の走査の基本形です。配列の <code class="ic">for (i=0; i&lt;n; i++)</code> と一対一で対応させて覚えましょう。',
      trap: '<code class="ic">p = head_p</code> から始めてしまうと、ダミー節点に入っているダミー値（0）まで出力・比較してしまいます！',
      when: 'list_print（表示）や list_find（探索）（課題6-1, 6-2）。',
      detect: /p\s*=\s*head_p->next\s*;\s*p\s*!=\s*NULL/,
    },
    {
      id: 'ph-list-lookahead',
      unit: 'b6',
      also: [],
      cat: '連結リスト',
      must: true,
      title: 'リストの先読み走査【型B】（削除・昇順挿入のために手前 p を保つ）',
      short: 'for (p = head_p; p->next != NULL; p = p->next)',
      code: 'for (p = head_p; p->next != NULL; p = p->next) {\n  if (p->next->val == val) {\n    remove_node(p);         /* p の直後（＝見つけた節点）を削除 */\n    return NULL;\n  }\n}',
      parts: [
        ['p = head_p', '先頭の実データ節点を削除・手前挿入できるよう、ダミー節点自身から出発！'],
        ['p->next != NULL', '1つ先の節点が存在することを確認してから p->next->val を見る'],
        ['p->next->val', '今いる p の「1歩先の節点の値」を先読みでチェック'],
      ],
      intent: '<code class="ic">remove_node(p)</code> も <code class="ic">insert_node(p, val)</code> も「操作したい位置の<b>直前の節点 <code class="ic">p</code></b>」を引数に取ります。だからダミーから出発して <code class="ic">p-&gt;next</code> を調べるのです。',
      trap: '<code class="ic">p-&gt;next != NULL &amp;&amp; p-&gt;next-&gt;val &lt; val</code> の順番を逆にすると、終端で <code class="ic">NULL-&gt;val</code> を読んでクラッシュします（必ず NULL チェックが左！）。',
      when: '1回走査での重複削除、昇順リストへの挿入・探索（課題6-5, Opt-6, Opt-7, Opt-8）。',
      detect: /p\s*=\s*head_p\s*;\s*p->next\s*!=\s*NULL/,
    },
    {
      id: 'ph-clock',
      unit: 'b6',
      also: [],
      cat: '時間計測',
      must: false,
      title: 'clock() による CPU 計算時間（秒）の計測',
      short: '(double)(clk_end - clk_start) / CLOCKS_PER_SEC',
      code: 'clock_t clk_start, clk_end;\nclk_start = clock();\n/* 計測したい処理 */\nclk_end = clock();\nprintf("cpu = %g [sec]\\n", (double)(clk_end - clk_start) / CLOCKS_PER_SEC);',
      parts: [
        ['clock()', 'プログラム開始からの経過クロック数を返す（<time.h>）'],
        ['(double)(...)', '整数除算で 0 にならないよう、割る前に必ず double へキャストする'],
        ['CLOCKS_PER_SEC', '1秒あたりのクロック数定数。これで割ると単位が「秒」になる'],
      ],
      intent: 'アルゴリズムの計算量（リストの $O(n^2)$ と二分探索木の $O(n \\log n)$ の圧倒的な速度差）を実測値で確かめる定型コードです。',
      trap: '<code class="ic">(double)</code> キャストを忘れると、1秒未満の実行時間がすべて整数除算で <code class="ic">0</code> 秒になってしまいます！',
      when: '計算時間計測課題（課題6-4, Opt-6t, Opt-8t, Opt-11）。',
      detect: /CLOCKS_PER_SEC/,
    },
    {
      id: 'ph-tree-rec',
      unit: 'b6',
      also: [],
      cat: '二分探索木',
      must: true,
      title: '二分探索木の再帰挿入と通りがけ順（昇順）表示',
      short: '左を再帰 → 自分 → 右を再帰',
      code: '/* 挿入: 戻り値で親のポインタにつなぎ直す */\nif (n == NULL) { return create_node(val); }\nif (val < n->data)      { n->left  = tree_insert_uniq(n->left, val); }\nelse if (val > n->data) { n->right = tree_insert_uniq(n->right, val); }\nreturn n;\n\n/* 昇順表示 (中間順 / in-order) */\nif (n != NULL) {\n  tree_print(n->left);     /* 1. 小さい左部分木 */\n  printf(" %d", n->data);  /* 2. 自分の値 */\n  tree_print(n->right);    /* 3. 大きい右部分木 */\n}',
      parts: [
        ['if (n == NULL)', '再帰の基底条件（行き止まりに着いたらそこに新節点を作って返す）'],
        ['n->left = tree_insert_uniq(...)', '小さければ左、大きければ右へ降り、戻ってきた根をつなぎ直す'],
        ['left → printf → right', '中間順（通りがけ順）で巡ると、自然に小さい順（昇順）で全要素が並ぶ'],
      ],
      intent: '二分探索木は「どの節点を見ても左の部分木は小さく、右の部分木は大きい」という再帰的な構造を持つため、挿入・昇順表示・後始末（後順 <code class="ic">left → right → free(n)</code>）がすべて数行の再帰で美しく書けます。',
      trap: '<code class="ic">tree_delete</code> で先に <code class="ic">free(n)</code> してから <code class="ic">n-&gt;left</code> を呼ぶと解放後アクセスになります。解放だけは必ず「左 → 右 → 最後に自分を free」！',
      when: '二分探索木の挿入・表示・探索・解放（課題6-9, Opt-10, Opt-11）。',
      detect: /tree_insert_uniq|tree_print/,
    },
  ],
  tasks: {
    /* ==================== B1: Cプログラミングの基礎事項 ==================== */
    'b1:1-1': {
      essence: '10進2桁の整数 <code class="ic">i</code> から「1の位（<code class="ic">i % 10</code>）」と「10の位（<code class="ic">i / 10</code>）」を整数演算だけで取り出し、論理和 <code class="ic">||</code>（どれか1つでも真なら真）で結ぶ問題です。',
      steps: [
        '上限値 <code class="ic">40</code> をマクロ <code class="ic">#define N 40</code> で名前付けし、<code class="ic">for (i = 1; i &lt;= N; i++)</code> で 1 から 40 まで順に調べる',
        '3つの条件「3の倍数 <code class="ic">i % 3 == 0</code>」「1の位が3 <code class="ic">i % 10 == 3</code>」「10の位が3 <code class="ic">i / 10 == 3</code>」を <code class="ic">||</code> でつなぐ',
        '当てはまったときだけ <code class="ic">printf("%d\\n", i);</code> で1行ずつ標準出力へ出す',
      ],
      phrases: [],
      pitfall: '<code class="ic">i &lt; N</code> と書くと 40 が調べられません（1〜N は <code class="ic">&lt;=</code>）。また「または」は <code class="ic">|</code> 1本ではなく2本の <code class="ic">||</code> です。',
      lines: {
        'san.c': {
          'if (i % 3 == 0 || i % 10 == 3 || i / 10 == 3) {': '<b>核心条件</b>: ①3で割り切れる、②10で割った余り（一の位）が3、③10で割った商（十の位）が3 のいずれか1つでも成り立てば出力へ進む',
        },
      },
    },
    'b1:1-2': {
      essence: 'プログラムの出力が正しいかを「目視」ではなく <b>リダイレクト <code class="ic">&gt;</code> と <code class="ic">diff</code> コマンドで機械的に0文字単位で検証する</b> という、この授業全体の基本作法を身につける課題です。',
      steps: [
        '手で計算した正解列（3, 6, 9, 12, 13, ..., 39）を1行1個で <code class="ic">san-exp.txt</code> に書き、最後の行にも改行を入れる',
        'ターミナルで <code class="ic">./a &gt; out.txt</code> を実行し、プログラムの標準出力をファイルへ流し込む',
        '<code class="ic">diff out.txt san-exp.txt</code> を実行して<b>何も表示されなければ完全一致（合格）</b>！',
      ],
      phrases: [],
      pitfall: '最後の行（39 の後ろ）に改行がないと <code class="ic">No newline at end of file</code> で diff が不一致になります。',
    },
    'b1:1-3': {
      essence: 'キーボードから上限 <code class="ic">n</code> を受け取る際、<b>入力を促す案内文は <code class="ic">stderr</code> に出し、計算結果だけを <code class="ic">stdout</code> に出す</b>ことでリダイレクト時の出力汚染を防ぐ設計を学びます。',
      steps: [
        '<code class="ic">fprintf(stderr, "...");</code> で入力プロンプトを標準エラー出力へ出す',
        '<code class="ic">scanf("%d", &amp;n);</code> で変数 <code class="ic">n</code> の番地 <code class="ic">&amp;n</code> に整数を読み込む',
        '課題 1-1 のループ上限 <code class="ic">N</code> を変数 <code class="ic">n</code> に置き換えて出力する',
      ],
      phrases: ['ph-stderr'],
      pitfall: '<code class="ic">scanf("%d", n);</code> と <code class="ic">&amp;</code> を忘れると不正な番地へ書き込んで即クラッシュします。',
    },
    'b1:1-4': {
      essence: '実数 <code class="ic">double</code> の入出力書式の違い（<b>入力は <code class="ic">%lf</code>、出力は <code class="ic">%f</code></b>）と、<code class="ic">&lt;math.h&gt;</code> の平方根関数 <code class="ic">sqrt</code> によるユークリッド距離 $\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$ の計算を押さえます。',
      steps: [
        '平方根 <code class="ic">sqrt</code> を使うため先頭に <code class="ic">#include &lt;math.h&gt;</code> を書く',
        '<code class="ic">for (r = 0; r &lt; 3; r++)</code> の中で <code class="ic">scanf("%lf", ...)</code> で4つの実数を読み込む',
        '差 <code class="ic">dx = x2 - x1; dy = y2 - y1;</code> を作り、<code class="ic">sqrt(dx * dx + dy * dy)</code> を <code class="ic">%0.4f</code> で出力する',
      ],
      phrases: ['ph-stderr', 'ph-double-io'],
      pitfall: 'C言語の <code class="ic">^</code> は累乗ではなくビット排他的論理和です！ 2乗は必ず <code class="ic">dx * dx</code> と掛け算で書きます。',
      lines: {
        'dist.c': {
          'printf("%0.4f\\n", sqrt(dx * dx + dy * dy));': '2乗和の平方根 <code class="ic">sqrt(dx*dx + dy*dy)</code> で2点間距離を求め、小数点以下4桁（<code class="ic">%0.4f</code>）で標準出力へ出す',
        },
      },
    },
    'b1:1-5': {
      essence: '<b>件数が事前に決まっていないデータを <code class="ic">EOF</code> まで無限ループで読み込み</b>、多段階の <code class="ic">else if</code> で GP に変換しながら合計 <code class="ic">sum</code> と件数 <code class="ic">n</code> を蓄える集計パターンです。',
      steps: [
        'ループに入る前に合計 <code class="ic">sum = 0.0</code> と件数カウンタ <code class="ic">n = 0</code> を必ず初期化する',
        '<code class="ic">for (;;)</code> 内で <code class="ic">if (scanf("%d", &amp;score) == EOF) { break; }</code> で終端判定する',
        '高い点数（90以上→85以上→…）から順に <code class="ic">if / else if</code> で <code class="ic">gp</code> を決め、出力しつつ <code class="ic">sum += gp; n++;</code>',
        'ループ脱出後、<code class="ic">n &gt; 0</code> であることを確認して平均 <code class="ic">sum / n</code> を <code class="ic">%0.3f</code> で出力する',
      ],
      phrases: ['ph-eof', 'ph-stderr'],
      pitfall: '<code class="ic">if (score &gt;= 60)</code> から先に判定すると95点もすべて GP 1.0 に吸い込まれます。範囲判定は必ず厳しい方（上）から順に！',
    },
    'b1:1-6': {
      essence: '<b>配列 <code class="ic">wt[i]</code> を「番号 <code class="ic">i</code> → 重さへの対応表（ルックアップテーブル）」として使う</b>発想を学びます。不正な添字でメモリを壊さないガード条件も重要です。',
      steps: [
        '品物の種類数 <code class="ic">n</code> を読み、範囲外なら終了した上で <code class="ic">wt[0] 〜 wt[n-1]</code> に重さを読み込む',
        '無限ループで品物番号 <code class="ic">k</code> を <code class="ic">EOF</code> まで読み込む',
        '<code class="ic">if (k &lt; 0 || k &gt;= n) { continue; }</code> で存在しない番号を弾き、有効なら <code class="ic">sum += wt[k];</code> で加算する',
      ],
      phrases: ['ph-eof', 'ph-double-io'],
      pitfall: '配列サイズが <code class="ic">n</code> のとき有効な添字は <code class="ic">0 〜 n-1</code> です。<code class="ic">k == n</code> も範囲外なので <code class="ic">k &gt;= n</code> で弾きます。',
      lines: {
        'wt.c': {
          'if (k < 0 || k >= n) { continue; }': '<b>配列境界ガード</b>: 番号 <code class="ic">k</code> が範囲外のときは加算をスキップして次の入力へ戻る（不正メモリアクセス防止）',
        },
      },
    },
    'b1:1-7': {
      essence: 'C言語の文字列の3大基本「<b><code class="ic">scanf("%31s", w)</code>（<code class="ic">&amp;</code> なし）</b>」「<b><code class="ic">strcmp(w, "qq") == 0</code> による終了判定</b>」「<b><code class="ic">w[i] != \'\\0\'</code> による1文字走査</b>」を1問で総仕上げします。',
      steps: [
        '31文字＋終端 <code class="ic">\'\\0\'</code> 分として <code class="ic">char w[32];</code> を用意し、無限ループで単語を読む',
        '<code class="ic">EOF</code> または <code class="ic">strcmp(w, "qq") == 0</code> なら <code class="ic">break</code> で終了する',
        '<code class="ic">for (i = 0; w[i] != \'\\0\'; i++)</code> で1文字ずつ見て、a, i, u, e, o のどれでもなければ（<code class="ic">&amp;&amp;</code>）<code class="ic">w[i] = \'*\';</code> に書き換える',
      ],
      phrases: ['ph-nullchar', 'ph-strcmp', 'ph-stderr'],
      pitfall: '「母音以外」の条件を <code class="ic">w[i] != \'a\' || w[i] != \'i\' ...</code> と <code class="ic">||</code> で書くと、すべての文字が条件を満たして全部 <code class="ic">*</code> になってしまいます（ド・モルガンの法則：すべてと違う＝ <code class="ic">&amp;&amp;</code>）！',
      lines: {
        'aiueo.c': {
          "if (w[i] != 'a' && w[i] != 'i' && w[i] != 'u' && w[i] != 'e' && w[i] != 'o') {": '<b>ド・モルガンの急所</b>: a でもなく <b>かつ（&&）</b> i でもなく … 5つの母音すべてと異なるときだけ子音と判定して <code class="ic">\'*\'</code> に置換する',
        },
      },
    },
    'b1:1-8': {
      essence: '配列 <code class="ic">b</code> の中でパターン <code class="ic">a</code> を1マスずつずらして照合する<b>2重ループの部分列探索（スライド窓）</b>です。開始位置 <code class="ic">i</code> の上限と、全文字一致したかの判定が核心です。',
      steps: [
        'パターン <code class="ic">a[0..k-1]</code> と探索回数 <code class="ic">m</code> を最初に読み込む',
        '各回で系列 <code class="ic">b[0..n-1]</code> を読み、<code class="ic">found = 0</code> に初期化する',
        '開始位置 <code class="ic">i</code> を <code class="ic">i + k &lt;= n</code> の範囲で動かし、内側ループ <code class="ic">j = 0..k-1</code> で <code class="ic">b[i + j] != a[j]</code> なら即 <code class="ic">break</code>。最後まで回って <code class="ic">j == k</code> なら完全一致なので <code class="ic">found = 1; break;</code>',
      ],
      phrases: ['ph-stderr'],
      pitfall: '開始位置を <code class="ic">i &lt; n</code> まで回すと <code class="ic">b[i + j]</code> が <code class="ic">b[n]</code> 以降にはみ出します。残り <code class="ic">k</code> 個取れる <code class="ic">i + k &lt;= n</code> が正確な上限です。',
      lines: {
        'match.c': {
          'for (i = 0; i + k <= n; i++) {': '<b>スライド窓の範囲</b>: 開始位置 <code class="ic">i</code> から長さ <code class="ic">k</code> 個を取っても <code class="ic">n</code> をはみ出さない範囲（<code class="ic">i &lt;= n - k</code>）だけ試す',
          'if (j == k) { found = 1; break; }': '内側ループが途中で <code class="ic">break</code> せず <code class="ic">j == k</code> まで到達した ＝ 連続する <code class="ic">k</code> 個がすべて一致した証拠！',
        },
      },
    },
    'b1:o1-1': {
      essence: '5枚のカードをそのまま比較すると場合分けが爆発しますが、<b>「数字 <code class="ic">v</code> ごとの枚数 <code class="ic">c[v]</code>（度数分布）」に変換してから、4枚組・3枚組・ペアが何組あるかを数える</b>と驚くほどシンプルに解けます。',
      steps: [
        '各セットの最初に <code class="ic">c[1]〜c[13]</code> を 0 クリアし、5枚の数字を読んで <code class="ic">c[v]++</code> する（途中で EOF なら終了）',
        '<code class="ic">v = 1..13</code> を走査して 4枚の数字の個数 <code class="ic">n4</code>、3枚の個数 <code class="ic">n3</code>、2枚の個数 <code class="ic">n2</code> を数える',
        '強い役（four of a kind → full house → three of a kind → two pair → one pair → no pair）の順に判定する',
      ],
      phrases: ['ph-hist-init', 'ph-eof'],
      pitfall: '<code class="ic">n3 == 1</code> を <code class="ic">n3 == 1 &amp;&amp; n2 == 1</code>（フルハウス）より先に書くと、フルハウスがスリーカードと誤判定されます。',
    },
    'b1:o1-2': {
      essence: '3次関数 $f(x)=ax^3+bx^2+cx+d$ の実数解の個数を、導関数 $f\'(x)=3ax^2+2bx+c=0$ の判別式 $D/4 = b^2-3ac$ と<b>極大値・極小値の積 $f(s_1)f(s_2)$ の符号</b>で分類する数学×数値計算の良問です。',
      steps: [
        'EOF または <code class="ic">fabs(a) &lt; EPS</code>（3次でなくなる終了条件）ならループを抜ける',
        '$D = b^2 - 3ac \\le 0$ なら関数は単調増減なので実数解は必ず 1 個',
        '$D &gt; 0$ なら極値をとる $s_1, s_2$ で $f(s_1), f(s_2)$ をホーナー法で計算し、一方が 0 なら重解で 2 個、異符号（積 &lt; 0）なら 3 個、同符号なら 1 個',
      ],
      phrases: ['ph-eps', 'ph-eof'],
      pitfall: '実数の 0 判定（<code class="ic">a == 0</code> や極値 <code class="ic">== 0</code>）は丸め誤差を考慮して <code class="ic">fabs(...) &lt; EPS</code> で判定しましょう。',
    },

    /* ==================== B2: 分割コンパイル ==================== */
    'b2:2-1': {
      essence: 'B1 の距離計算ロジックを独立した関数 <code class="ic">double dist(...)</code> として切り出し、<b>プロトタイプ宣言（予告）→ main からの呼び出し → 関数本体</b>という C プログラムの骨格を身につけます。',
      steps: [
        '<code class="ic">main</code> の前にプロトタイプ宣言 <code class="ic">double dist(double x1, double y1, double x2, double y2);</code> を書く',
        '<code class="ic">dist</code> 関数の中で <code class="ic">dx, dy</code> から距離を計算して <code class="ic">return</code> で返す（関数内では printf しない）',
        '<code class="ic">main</code> では入力と <code class="ic">printf("%0.4f\\n", dist(...));</code> だけを担当させる',
      ],
      phrases: ['ph-double-io', 'ph-stderr'],
      pitfall: 'プロトタイプ宣言の末尾にはセミコロン <code class="ic">;</code> が必要、関数定義のヘッダ行には <code class="ic">;</code> を付けないこと。',
    },
    'b2:2-2': {
      essence: '判別式 $d = b^2 - 4ac$ の符号によって出力個数が 2個・1個・0個と変わる処理を <code class="ic">void qeq(...)</code> にまとめます。<b>$a &lt; 0$ のとき解の大小が逆転するため、小さい順に並べ替えるスワップ</b>が急所です。',
      steps: [
        '<code class="ic">main</code> で <code class="ic">a</code> を読み、<code class="ic">fabs(a) &lt; DBL_EPSILON</code> なら終了、そうでなければ <code class="ic">b, c</code> を読んで <code class="ic">qeq(a, b, c)</code> を呼ぶ',
        '<code class="ic">d &gt; 0</code> なら2解を計算し、<code class="ic">if (x1 &gt; x2)</code> のとき一時変数 <code class="ic">t</code> で入れ替えて常に小さい順に出力する',
        '<code class="ic">d == 0</code> なら重解 <code class="ic">-b / (2 * a)</code>、負なら改行のみを出力する',
      ],
      phrases: ['ph-eps', 'ph-double-io'],
      pitfall: '<code class="ic">-b / 2 * a</code> と括弧を忘れると <code class="ic">(-b / 2) * a</code> と左から計算されてしまいます！ 分母は必ず <code class="ic">(2 * a)</code> と括弧で囲むこと。',
      lines: {
        'qeq.c': {
          'if (x1 > x2) { t = x1; x1 = x2; x2 = t; }': '<b>見落とし厳禁</b>: <code class="ic">a &lt; 0</code> のときは分母 <code class="ic">2*a</code> が負になるため <code class="ic">x1 &gt; x2</code> になる。常に小さい順に出すため3行スワップで整列する',
        },
      },
    },
    'b2:2-3': {
      essence: '1つのプログラムを <b>ヘッダ <code class="ic">dist3.h</code>（契約）・関数実装 <code class="ic">dist3.c</code>（部品）・呼び出し側 <code class="ic">dist3main.c</code>（進行役）</b> の3ファイルに分割し、リンクして動かす最初の実践です。',
      steps: [
        '<code class="ic">dist3.h</code> にはプロトタイプ宣言 <code class="ic">double dist(...);</code> の1行だけを書く',
        '<code class="ic">dist3.c</code> には <code class="ic">#include &lt;math.h&gt;</code> と <code class="ic">#include "dist3.h"</code> と <code class="ic">dist</code> の本体を書く',
        '<code class="ic">dist3main.c</code> には <code class="ic">#include &lt;stdio.h&gt;</code> と <code class="ic">#include "dist3.h"</code> と <code class="ic">main</code> を書き、両方の <code class="ic">.c</code> を一緒にコンパイルする',
      ],
      phrases: ['ph-header'],
      pitfall: '自作ヘッダは <code class="ic">&lt;dist3.h&gt;</code> ではなく二重引用符 <code class="ic">"dist3.h"</code> でインクルードします。',
    },
    'b2:2-4': {
      essence: '課題 2-2 の <code class="ic">qeq.c</code> を3ファイルに分割します。<b>各 <code class="ic">.c</code> ファイルがそれぞれ必要とする標準ヘッダ（<code class="ic">stdio.h</code>, <code class="ic">math.h</code>, <code class="ic">float.h</code>）を自分の先頭でインクルードする</b>感覚を掴みましょう。',
      steps: [
        '<code class="ic">qeq2.h</code> に <code class="ic">void qeq(double a, double b, double c);</code> を書く',
        '<code class="ic">qeq2.c</code> では <code class="ic">printf</code> と <code class="ic">sqrt</code> を使うので <code class="ic">stdio.h</code>, <code class="ic">math.h</code>, <code class="ic">"qeq2.h"</code> を読み込む',
        '<code class="ic">qeq2main.c</code> では <code class="ic">fabs</code> と <code class="ic">DBL_EPSILON</code> を使うので <code class="ic">stdio.h</code>, <code class="ic">math.h</code>, <code class="ic">float.h</code>, <code class="ic">"qeq2.h"</code> を読み込む',
      ],
      phrases: ['ph-header', 'ph-eps'],
      pitfall: '<code class="ic">qeq2.c</code> 側で <code class="ic">#include &lt;stdio.h&gt;</code> を忘れると、<code class="ic">qeq</code> 内の <code class="ic">printf</code> が未宣言警告になります。',
    },
    'b2:2-5': {
      essence: '異符号の区間 $[x_1, x_2]$ を中点 $x_{\\text{mid}}$ で半分ずつ狭めて解を追い詰める<b>二分法（bisection method）</b>です。<b>途中経過の表は <code class="ic">stderr</code> へ出し、収束判定と符号比較で区間を更新する</b>流れを押さえます。',
      steps: [
        '両端の関数値 <code class="ic">f1, f2</code> を計算して <code class="ic">stderr</code> に出力し、<code class="ic">fabs(f1) &lt; eps</code> なら <code class="ic">x1</code>、<code class="ic">fabs(f2) &lt; eps</code> なら <code class="ic">x2</code> を即座に返す',
        '中点 <code class="ic">xmid = (x1 + x2) / 2</code> と <code class="ic">fmid</code> を求め、反復上限 <code class="ic">i &gt;= m</code> なら <code class="ic">xmid</code> を返す',
        '<code class="ic">f1</code> と <code class="ic">fmid</code> が異符号（<code class="ic">(f1 &lt; 0) != (fmid &lt; 0)</code> または <code class="ic">f1 * fmid &lt; 0</code>）なら解は左半分にあるので <code class="ic">x2 = xmid</code>、同符号なら右半分なので <code class="ic">x1 = xmid</code>',
      ],
      phrases: ['ph-eps', 'ph-stderr'],
      pitfall: '途中経過のログを <code class="ic">printf</code> で書いてしまうと <code class="ic">main</code> の結果出力と混ざってテストに通りません。必ず <code class="ic">fprintf(stderr, ...)</code>！',
      lines: {
        'bisection.c': {
          'if ((f1 < 0) != (fmid < 0)) { x2 = xmid; }': '<b>異符号判定</b>: 左端 <code class="ic">f1</code> と中点 <code class="ic">fmid</code> の符号が異なれば、その間 $[x_1, x_{\\text{mid}}]$ でグラフが x 軸を横切っているので右端を <code class="ic">xmid</code> に縮める',
        },
      },
    },
    'b2:2-6': {
      essence: '名前（文字配列）・身長・体重・BMI という異なる型のデータを <b><code class="ic">typedef struct { ... } body_index_t;</code> で1つの構造体にまとめ</b>、ドット演算子 <code class="ic">.</code> で読み書きする基本課題です。',
      steps: [
        '構造体変数 <code class="ic">body_index_t p;</code> を宣言し、ループで <code class="ic">p.name</code>（配列なので <code class="ic">&amp;</code> 不要）を読み <code class="ic">"q"</code> なら終了',
        '<code class="ic">&amp;p.stature</code>, <code class="ic">&amp;p.weight</code> に実数を読み込み、<code class="ic">p.bmi = bmi(p);</code> で計算結果をメンバーに格納する',
        'BMI は身長 [cm] を <code class="ic">/ 100.0</code> で [m] に直してから <code class="ic">weight / (h * h)</code> で計算し、<code class="ic">body_index_print(p)</code> で表示する',
      ],
      phrases: ['ph-strcmp', 'ph-double-io'],
      pitfall: '身長が cm 単位で入力されるため、そのまま割ると BMI が 10000 分の 1 になってしまいます（必ず <code class="ic">100.0</code> で割って m に換算）！',
    },
    'b2:2-7': {
      essence: '配布ヘッダ <code class="ic">dist4.h</code> で定義された構造体型 <code class="ic">point_t</code> を受け取り、<code class="ic">p2.x - p1.x</code> のように<b>ドット <code class="ic">.</code> で座標を取り出して距離を返す関数ファイルだけを実装する</b>分割コンパイル課題です。',
      steps: [
        '配布の <code class="ic">dist4.h</code> を確認し、構造体メンバー名（<code class="ic">x, y</code>）と関数シグネチャを確かめる',
        '<code class="ic">dist4.c</code> で <code class="ic">#include &lt;math.h&gt;</code> と <code class="ic">#include "dist4.h"</code> を書く',
        '<code class="ic">dx = p2.x - p1.x; dy = p2.y - p1.y;</code> から <code class="ic">sqrt(dx * dx + dy * dy)</code> を返す',
      ],
      phrases: ['ph-header'],
      pitfall: '<code class="ic">dist4main.c</code> 側にすでに <code class="ic">main</code> 関数があるので、<code class="ic">dist4.c</code> に <code class="ic">main</code> を書いてはいけません（multiple definition エラーになります）。',
    },
    'b2:2-8': {
      essence: '<b>区間 $[a, b]$ の一様整数乱数 <code class="ic">rand() % (b - a + 1) + a</code></b> と、最小値 $a$ をオフセットとして引く <b>配列添字変換 <code class="ic">count[r - a]++</code></b> の2大頻出テクニックを習得します。',
      steps: [
        '個数は <code class="ic">b - a + 1</code> 個なので、<code class="ic">irand(a, b)</code> は <code class="ic">rand() % (b - a + 1) + a</code> を返す',
        '<code class="ic">count[0] 〜 count[b - a]</code> を最初にすべて 0 で初期化する',
        '乱数 <code class="ic">r</code> が出るたびに出力しつつ <code class="ic">count[r - a]++</code> で数え、最後に値 <code class="ic">a + i</code> と回数 <code class="ic">count[i]</code> を表示する',
      ],
      phrases: ['ph-rand', 'ph-hist-init'],
      pitfall: '<code class="ic">a</code> が負や 100 などのとき <code class="ic">count[r]++</code> と直接添字にすると配列外アクセスになります。必ず最小値 <code class="ic">a</code> を引いて <code class="ic">0</code> 始まりにずらすこと！',
      lines: {
        'irand.c': {
          'return rand() % (b - a + 1) + a;': '<b>乱数公式</b>: <code class="ic">a</code> から <code class="ic">b</code> までの整数は全部で <code class="ic">(b - a + 1)</code> 個。剰余で <code class="ic">0〜(b-a)</code> を作り <code class="ic">+ a</code> で平行移動する',
          'count[r - a]++;': '<b>添字シフト</b>: 最小値 <code class="ic">a</code> が <code class="ic">count[0]</code> に入るよう、<code class="ic">r - a</code> 番目の箱を増やす',
        },
      },
    },
    'b2:o2-1': {
      essence: '曲線 $y=f(x)$ の接線をたどって高速に解へ収束させる<b>ニュートン法 $x_{1} = x_0 - f(x_0)/f\'(x_0)$</b> です。2次関数なので $f\'(x_0) = 2ax_0 + b$ が手計算でそのまま書けます。',
      steps: [
        '反復ループ内で関数値 <code class="ic">fx = (a * x0 + b) * x0 + c</code> と微分値 <code class="ic">dfx = 2 * a * x0 + b</code> を求める',
        '更新式 <code class="ic">x1 = x0 - fx / dfx</code> を計算し、経過を <code class="ic">stderr</code> に表示する',
        '変化量 <code class="ic">fabs(x1 - x0) &lt; eps</code> になったら収束とみなして <code class="ic">x1</code> を返し、まだなら <code class="ic">x0 = x1</code> で次の反復へ',
      ],
      phrases: ['ph-eps', 'ph-stderr'],
      pitfall: '次の反復に進む前の <code class="ic">x0 = x1;</code> を忘れると、ずっと同じ点から動かず収束しません。',
    },
    'b2:o2-2': {
      essence: '確率モデル（乱数によるレベル生成と成立判定）を100回試行して期待値を競うモンテカルロ・シミュレーションです。<b>前半は高望みし、チャンスが減る後半で基準を下げる閾値戦略</b>を関数 <code class="ic">x_accept(c, y)</code> に表現します。',
      steps: [
        '0〜9 の乱数を 1:2:4:2:1 の区間に割り振る <code class="ic">level_rand</code> と、$[0,1)$ 実数乱数 <code class="ic">urand</code> の仕組みを読む',
        '<code class="ic">x_accept(int c, int y)</code> で何回目 <code class="ic">c</code> かに応じて OK を出す相手レベル <code class="ic">y</code> の条件（1 または 0）を返す',
        '結婚率と相手レベルの期待値（独身時は -5 ペナルティ）のバランスを見て閾値を調整する',
      ],
      phrases: ['ph-rand'],
      pitfall: '<code class="ic">rand() / (RAND_MAX + 1.0)</code> で <code class="ic">1.0</code> を実数にしておかないと整数除算やオーバーフローが起きます。',
    },

    /* ==================== B3: ポインタ ==================== */
    'b3:3-1': {
      essence: 'すべての変数がメモリ上の固有の「番地（アドレス）」に置かれており、<b><code class="ic">int</code> は 4 バイト間隔、<code class="ic">double</code> は 8 バイト間隔で並んでいる</b>ことを <code class="ic">&amp;</code> と <code class="ic">%p</code> で自分の目で確かめる出発点の課題です。',
      steps: [
        '変数の前にアドレス演算子 <code class="ic">&amp;</code> を付けて番地を取り出す',
        '<code class="ic">printf</code> の書式 <code class="ic">%p</code> に合わせて <code class="ic">(void *)&amp;a</code> のように出力し、隣の変数との番地の差（バイト数）を観察する',
      ],
      phrases: [],
      pitfall: '番地を表示するときに <code class="ic">&amp;</code> を忘れると、変数の「値」を番地と誤認して出力してしまいます。',
    },
    'b3:3-2': {
      essence: '「変数名を使わなくても、<b>番地と型さえ分かれば <code class="ic">*((型 *)番地) = 値;</code> でメモリの中身を直接書き換えられる</b>」という実験を通して、ポインタの正体が単なる番地であることを体感します。',
      steps: [
        'まずプログラムを実行して、自分の環境での <code class="ic">a, b, x, y</code> の16進番地（例: <code class="ic">0x64</code> など）を確認する',
        '整数 <code class="ic">a, b</code> の番地は <code class="ic">(int *)</code> にキャストし、<code class="ic">*</code> を付けて <code class="ic">*((int *)0x64) = 1111;</code> のように書く',
        '実数 <code class="ic">x, y</code> の番地は8バイト幅なので必ず <code class="ic">(double *)</code> にキャストして書き込む',
      ],
      phrases: [],
      pitfall: '<code class="ic">double</code> 変数の番地を <code class="ic">(int *)</code> でキャストして書き込むと、前半4バイトしか書かれず壊れた実数値になります。',
      lines: {
        'pointer2.c': {
          '*((int *)0x64) = 1111;': '数値 <code class="ic">0x64</code> を「int 型変数の番地」とみなし（キャスト）、<code class="ic">*</code> でその番地の箱へ <code class="ic">1111</code> を直接書き込む',
          '*((double *)0x6c) = 3.14;': '数値 <code class="ic">0x6c</code> を「8バイトの double 型変数の番地」とみなし、<code class="ic">*</code> で <code class="ic">3.14</code> を書き込む',
        },
      },
    },
    'b3:3-3': {
      essence: '直書き番地の代わりに<b>ポインタ変数 <code class="ic">pi, pd</code> に <code class="ic">&amp;変数</code> で矢印を向け、<code class="ic">*pi</code> で間接的に読み書きする</b>基本操作です。宣言の <code class="ic">int *pi;</code> と実行文の <code class="ic">*pi</code> の違いを完全に区別しましょう。',
      steps: [
        '<code class="ic">pi = &amp;b;</code> で <code class="ic">pi</code> を <code class="ic">b</code> に向け、<code class="ic">*pi = *pi + 4;</code> で <code class="ic">b</code> の値を 4 増やす',
        '<code class="ic">pd = &amp;x;</code> で <code class="ic">pd</code> を <code class="ic">x</code> に向け、<code class="ic">*pd = *pd * 2;</code> で <code class="ic">x</code> を 2 倍にする',
        'ループで <code class="ic">scanf("%p", (void **)&amp;pd)</code> で番地を読み、<code class="ic">pd == NULL</code>（0番地）なら終了、それ以外は <code class="ic">*pd</code> でその番地の double 値を表示する',
      ],
      phrases: ['ph-ptr-out', 'ph-eof'],
      pitfall: '<code class="ic">pd == NULL</code> のチェックより先に <code class="ic">*pd</code> を評価すると、0番地参照（NULL ポインタ参照）で即クラッシュします。',
    },
    'b3:3-4': {
      essence: '<b>中間試験の最重要原型！</b> 1つの関数から「商」と「余り」の2つの結果を返すため、呼び出し元の変数の番地 <code class="ic">&amp;q, &amp;r</code> を受け取り、<code class="ic">*q = ...; *r = ...;</code> で指す先の箱へ直接結果を格納します。',
      steps: [
        '仮引数をポインタ <code class="ic">int *q, int *r</code> とした関数 <code class="ic">void divrem(int x, int y, int *q, int *r)</code> を定義する',
        '関数内で <code class="ic">*q = x / y;</code> と <code class="ic">*r = x % y;</code> で呼び出し元の箱に書き込む',
        '<code class="ic">main</code> からは <code class="ic">divrem(x, y, &amp;q, &amp;r);</code> と <code class="ic">&amp;</code> を付けて番地を渡す',
      ],
      phrases: ['ph-ptr-out'],
      pitfall: '関数の中で <code class="ic">printf</code> してはいけません（表示は <code class="ic">main</code> の仕事）。また <code class="ic">*q</code> の <code class="ic">*</code> を忘れないこと！',
    },
    'b3:3-5': {
      essence: '課題 3-4 の <code class="ic">double</code>・分割コンパイル版です。相加平均 $(a+b)/2$ を <code class="ic">*p_a</code> に、相乗平均 $\\sqrt{ab}$ を <code class="ic">*p_m</code> に書き込みます。',
      steps: [
        '配布の <code class="ic">ave6.h</code> と <code class="ic">ave6main.c</code> を読み、引数名と型を確認する',
        '<code class="ic">ave6.c</code> に <code class="ic">#include &lt;math.h&gt;</code> と <code class="ic">#include "ave6.h"</code> を書く',
        '<code class="ic">*p_a = (a + b) / 2.0;</code> と <code class="ic">*p_m = sqrt(a * b);</code> の2行を実装する',
      ],
      phrases: ['ph-ptr-out', 'ph-header'],
      pitfall: '<code class="ic">sqrt</code> を使うための <code class="ic">#include &lt;math.h&gt;</code> を忘れないようにしましょう。',
    },
    'b3:3-6': {
      essence: '<b>「戻り値」と「ポインタ引数」の合わせ技</b>です。解の個数（2, 1, 0）を <code class="ic">int</code> の戻り値で返し、実際の解の値を <code class="ic">*x1, *x2</code> に書き込むことで、計算と表示を綺麗に分離します。',
      steps: [
        '判別式 <code class="ic">d = b * b - 4 * a * c</code> を計算する',
        '<code class="ic">d &gt; 0</code> なら2解を求め、小さい方を <code class="ic">*x1</code>、大きい方を <code class="ic">*x2</code> に格納して <code class="ic">return 2;</code>',
        '<code class="ic">d == 0</code> なら重解を <code class="ic">*x1</code> に格納して <code class="ic">return 1;</code>、<code class="ic">d &lt; 0</code> なら何も書き込まず <code class="ic">return 0;</code>',
      ],
      phrases: ['ph-ptr-out', 'ph-header'],
      pitfall: '解が 0 個のときに <code class="ic">sqrt(d)</code>（負の数の平方根 = NaN）を計算しないよう、必ず <code class="ic">if (d &gt; 0)</code> の中で <code class="ic">sqrt</code> を呼びます。',
    },
    'b3:3-7': {
      essence: '<b>中間試験の問2の直系モデル！</b> 構造体へのポインタ <code class="ic">point_t *p</code> を使い、<code class="ic">point_scan</code> では <code class="ic">&amp;p-&gt;x</code> でメンバーの番地に読み込み、<code class="ic">dist</code> では <code class="ic">p1-&gt;x</code> で参照します。',
      steps: [
        '<code class="ic">point_scan(point_t *p)</code> で <code class="ic">scanf("%lf", &amp;p-&gt;x)</code> と <code class="ic">&amp;p-&gt;y</code> を呼び、どちらかが <code class="ic">EOF</code> なら <code class="ic">return EOF;</code>、成功なら <code class="ic">return 1;</code>',
        '<code class="ic">dist(point_t *p1, point_t *p2)</code> で <code class="ic">p2-&gt;x - p1-&gt;x</code> と <code class="ic">p2-&gt;y - p1-&gt;y</code> から <code class="ic">sqrt</code> で距離を返す',
      ],
      phrases: ['ph-arrow-addr', 'ph-eof', 'ph-header'],
      pitfall: '<code class="ic">p1.x</code>（ドット）ではなくポインタなので <code class="ic">p1-&gt;x</code>（アロー）！ そして <code class="ic">scanf</code> では <code class="ic">&amp;p-&gt;x</code> の先頭の <code class="ic">&amp;</code> を絶対に忘れないこと！',
      lines: {
        'dist5.c': {
          'if (scanf("%lf", &p->x) == EOF) { return EOF; }': '<b>最重要フレーズ</b>: ポインタ <code class="ic">p</code> が指す構造体のメンバー <code class="ic">x</code> の番地 <code class="ic">&amp;(p-&gt;x)</code> へ実数を読み込み、EOF ならそのまま呼び出し元へ知らせる',
        },
      },
    },
    'b3:3-8': {
      essence: '「<b>配列名 <code class="ic">x</code> は先頭要素の番地 <code class="ic">&amp;x[0]</code> と同じ</b>」「<b>ポインタに <code class="ic">+ i</code> すると <code class="ic">sizeof(型) * i</code> バイト進む</b>」「<b><code class="ic">*(x + i)</code> と <code class="ic">x[i]</code> は完全に同じ</b>」という C の配列とポインタの等価性を実験で確認します。',
      steps: [
        '要素数 <code class="ic">k = sizeof(x) / sizeof(x[0])</code>（全体のバイト数 ÷ 1要素のバイト数）を求める',
        '<code class="ic">&amp;x[i]</code> と <code class="ic">x + i</code> が全く同じ番地になり、4バイトずつ増えることを確認する',
        '<code class="ic">p = &amp;x[2]</code> としたとき、<code class="ic">p[2]</code> は <code class="ic">*(p + 2)</code> すなわち <code class="ic">x[4]</code> になることを確認する',
      ],
      phrases: [],
      pitfall: '<code class="ic">sizeof(x) / sizeof(x[0])</code> が使えるのは配列を宣言したスコープ内だけです（関数引数に渡すとポインタサイズになってしまいます）。',
    },
    'b3:3-9': {
      essence: '<b>配列引数（入力データ列）とポインタ引数（複数の集計結果の返却）を組み合わせる</b>実用パターンです。最大値の初期値設定と平均の実数キャストがポイントです。',
      steps: [
        '<code class="ic">array_scan</code> で上限 <code class="ic">MAX</code> 個まで <code class="ic">EOF</code> が来るまで <code class="ic">&amp;a[i]</code> に読み込み、読めた個数 <code class="ic">i</code> を返す',
        '<code class="ic">array_ave_max</code> で最大値の初期値を <b><code class="ic">*max = a[0];</code></b> にセットし、<code class="ic">sum</code> を累積しながら <code class="ic">a[i] &gt; *max</code> で更新する',
        '整数同士の割り算で切り捨てられないよう <code class="ic">*ave = (double)sum / n;</code> で平均を格納する',
      ],
      phrases: ['ph-ptr-out', 'ph-eof'],
      pitfall: '<code class="ic">*max = 0;</code> で初期化すると、入力がすべて負の数のときに誤った最大値 0 になってしまいます。必ず <code class="ic">a[0]</code> で初期化！',
      lines: {
        'ave_max.c': {
          '*max = a[0];': '<b>鉄則</b>: 最大値（最小値）の初期値は 0 ではなく、必ずデータの先頭要素 <code class="ic">a[0]</code> にする（全データが負でも正しく動く）',
          '*ave = (double)sum / n;': '<code class="ic">sum</code> も <code class="ic">n</code> も <code class="ic">int</code> なので、割る前に <code class="ic">(double)</code> キャストして小数点以下まで正確に求める',
        },
      },
    },
    'b3:3-10': {
      essence: '<b>中間試験の問3の直系モデル！</b> サイコロの乱数生成 <code class="ic">rand() % 6 + 1</code> と、3個の和（3〜18）の出現回数を配列 <code class="ic">c[s]</code> で数えるヒストグラム作成です。',
      steps: [
        '<code class="ic">dice_throw</code> で <code class="ic">d[0] 〜 d[n-1]</code> に <code class="ic">rand() % 6 + 1</code> を格納する',
        '<code class="ic">dice3_distr</code> の先頭で、まず <code class="ic">s = D3_MIN(3) 〜 D3_MAX(18)</code> の <code class="ic">c[s]</code> をすべて <code class="ic">0</code> に初期化する',
        '<code class="ic">i = 0 .. n-1</code> を回し、3個の和 <code class="ic">s = d1[i] + d2[i] + d3[i]</code> をそのまま添字にして <code class="ic">c[s]++</code> する',
      ],
      phrases: ['ph-rand', 'ph-hist-init'],
      pitfall: '呼び出し元のローカル配列 <code class="ic">c[]</code> にはゴミ値が入っています。<code class="ic">c[s] = 0;</code> の初期化ループを抜かすと結果がめちゃくちゃになります！',
    },
    'b3:opt1': {
      essence: '一様乱数2個からボックス＝ミュラー変換 $\\mu + \\sigma\\sqrt{-2\\ln u_1}\\cos(2\\pi u_2)$ で正規分布に従う試験点数を生成し、四捨五入・0〜100点クリップ・5点刻み度数分布を作る統計シミュレーションです。',
      steps: [
        '<code class="ic">nrand</code> で <code class="ic">u1 == 0</code> による <code class="ic">log(0)</code> を避けて標準正規乱数を作り、<code class="ic">mu + sigma * z</code> を返す',
        '<code class="ic">score_rand</code> で <code class="ic">floor(x + 0.5)</code> により四捨五入し、0未満は0、100超は100に丸める',
        '<code class="ic">count[s / 5]++</code>（100点は <code class="ic">100 / 5 == 20</code> で自動的に21番目の枠に入る！）で集計し、平均と標準偏差を出力する',
      ],
      phrases: ['ph-hist-init'],
      pitfall: '分散 $\\frac{1}{n}\\sum s_i^2 - \\bar{s}^2$ の二乗和 <code class="ic">sum2</code> は桁あふれを防ぐため <code class="ic">double</code> で累積します。',
    },
    'b3:opt2': {
      essence: '長さの異なる複数の英単語を、無駄な隙間なく1本の大きな配列 <code class="ic">pool</code> に詰め込み、各単語の先頭番地だけをポインタ配列 <code class="ic">word[i]</code> に記録する「文字列プール（動的割当ての原型）」を学びます。',
      steps: [
        '空き領域の先頭ポインタを <code class="ic">next = pool;</code> に初期化する',
        '単語を <code class="ic">buf</code> に読み、<code class="ic">next + len + 1 &gt; pool + POOL_SIZE</code> なら容量オーバーなので <code class="ic">break</code>',
        '<code class="ic">strcpy(next, buf);</code> で書き込み、<code class="ic">word[n++] = next;</code> で先頭番地を保存し、<code class="ic">next += len + 1;</code> で <code class="ic">\'\\0\'</code> の次の空き番地へ進める',
      ],
      phrases: ['ph-nullchar', 'ph-eof'],
      pitfall: '<code class="ic">next += len;</code> にしてしまうと終端 <code class="ic">\'\\0\'</code> が次の単語で上書きされ、全単語が1本につながってしまいます（必ず <code class="ic">+ 1</code>）！',
    },

    /* ==================== B4: 配列と構造体 ==================== */
    'b4:4-1-1': {
      focusFn: 'matrix_print',
      essence: '2次元配列 <code class="ic">A[i][j]</code> を「外側が行 <code class="ic">i</code>、内側が列 <code class="ic">j</code>」の2重ループで走査し、<b><code class="ic">" %9.5f"</code>（全体幅9文字・小数点以下5桁）で符号や桁数が違っても縦の列がピシッと揃うように出力する</b>課題です。',
      steps: [
        '行ループ <code class="ic">for (i = 0; i &lt; n; i++)</code> の中で列ループ <code class="ic">for (j = 0; j &lt; n; j++)</code> を回す',
        '内側では改行なしの <code class="ic">printf(" %9.5f", A[i][j]);</code> で横に並べ、1行出し終えた直後に外側ループで <code class="ic">printf("\\n");</code> する',
      ],
      phrases: ['ph-double-io'],
      pitfall: '内側ループの中で <code class="ic">\\n</code> を出してしまうと、行列ではなく縦1列になってしまいます。',
    },
    'b4:4-1-2': {
      focusFn: 'matrix_scan',
      essence: '2次元配列の各要素 <code class="ic">A[i][j]</code> に標準入力から実数を読み込みます。配列引数 <code class="ic">double A[N][N]</code> は呼び出し元の配列そのものを指すため、関数内の <code class="ic">scanf</code> で直接中身が埋まります。',
      steps: [
        '2重ループでプロンプト <code class="ic">fprintf(stderr, "[%d][%d] ", i, j);</code> を出す',
        '<code class="ic">scanf("%lf", &amp;A[i][j]);</code> で要素 <code class="ic">A[i][j]</code> の番地に実数を読み込む',
      ],
      phrases: ['ph-stderr', 'ph-double-io'],
      pitfall: '<code class="ic">A</code> は配列ですが、<code class="ic">A[i][j]</code> は1個の <code class="ic">double</code> 変数なので <code class="ic">&amp;A[i][j]</code> の <code class="ic">&amp;</code> が必須です！',
    },
    'b4:4-1-3': {
      focusFn: 'matrix_sum',
      essence: '行列の和 $Y = A + B$ は、同じ位置 $(i, j)$ 同士を足して <code class="ic">Y[i][j] = A[i][j] + B[i][j];</code> と代入する最も素直な2重ループです。',
      steps: [
        '<code class="ic">assert(n &lt;= N);</code> でサイズ前提を確認する',
        '<code class="ic">i = 0..n-1, j = 0..n-1</code> の2重ループで <code class="ic">Y[i][j] = A[i][j] + B[i][j];</code> を計算する',
      ],
      phrases: [],
      pitfall: 'ループ上限は最大枠 <code class="ic">N</code> ではなく、実際に使っているサイズ <code class="ic">n</code> です。',
    },
    'b4:4-1-4': {
      focusFn: 'matrix_trans2',
      essence: '別の行列 <code class="ic">Y</code> に転置行列 $Y = A^T$ を入れる場合は、元の <code class="ic">A</code> が壊れないため <b>全要素を走査して行と列の添字を入れ替える <code class="ic">Y[i][j] = A[j][i];</code></b> だけで完成します。',
      steps: [
        '<code class="ic">i = 0..n-1, j = 0..n-1</code> の全要素ループを回す',
        '<code class="ic">Y</code> の $(i, j)$ 成分に <code class="ic">A</code> の $(j, i)$ 成分を代入する',
      ],
      phrases: [],
      pitfall: '次の 4-1(5)（自分自身の転置）との違いを意識しよう。別配列 <code class="ic">Y</code> があるときは全要素 <code class="ic">j = 0..n-1</code> にコピーが必要です！',
    },
    'b4:4-1-5': {
      focusFn: 'matrix_trans1',
      essence: '<b>B4・中間試験の最頻出ポイント！</b> 別の配列を使わず <code class="ic">A</code> 自身を転置するには、<b>対角線より右上（<code class="ic">j = i + 1</code> から <code class="ic">n - 1</code>）だけ</b>を <code class="ic">A[j][i]</code> と1回ずつ <code class="ic">tmp</code> で交換します。',
      steps: [
        '一時変数 <code class="ic">double tmp;</code> を用意する',
        '外側 <code class="ic">for (i = 0; i &lt; n; i++)</code>、内側 <b><code class="ic">for (j = i + 1; j &lt; n; j++)</code></b> にする',
        '<code class="ic">tmp = A[i][j]; A[i][j] = A[j][i]; A[j][i] = tmp;</code> の3行スワップで入れ替える',
      ],
      phrases: ['ph-swap-tri'],
      pitfall: '内側を <code class="ic">j = 0</code> から回すと、上三角で交換したペアを下三角でもう一度交換してしまい、元の行列に完全に戻ってしまいます！',
      lines: {
        'matrix.c': {
          'for (j=i+1; j<n; j++) {': '<b>最大の急所</b>: 対角要素（<code class="ic">j == i</code>）は動かさず、対角より右上のペアだけを1回ずつ選ぶことで二重交換を防ぐ',
        },
      },
    },
    'b4:4-1-6': {
      focusFn: ['vector_print', 'vector_scan'],
      essence: '$n$ 次元縦ベクトルを 1次元配列 <code class="ic">double x[N]</code> で表し、1重ループで入出力します。縦ベクトルなので出力時は要素ごとに改行します。',
      steps: [
        '<code class="ic">vector_scan</code>: <code class="ic">i = 0..n-1</code> で <code class="ic">stderr</code> に案内を出し <code class="ic">scanf("%lf", &amp;x[i]);</code>',
        '<code class="ic">vector_print</code>: <code class="ic">i = 0..n-1</code> で <code class="ic">printf(" %9.5f\\n", x[i]);</code>',
      ],
      phrases: ['ph-stderr', 'ph-double-io'],
      pitfall: '<code class="ic">matrix_print</code> と違い、縦ベクトルなので各要素の後ろに毎回 <code class="ic">\\n</code> を付けます。',
    },
    'b4:4-1-7': {
      focusFn: 'matrix_vector_prod',
      essence: '行列とベクトルの積 $y_i = \\sum_{j=0}^{n-1} A_{ij} x_j$ を実装し、自分でテスト用 <code class="ic">matrix7test.c</code> も書いてリンクします。<b>内積ループの直前の <code class="ic">y[i] = 0.0;</code></b> が生命線です。',
      steps: [
        '<code class="ic">matrix_vector_prod</code>: 各行 <code class="ic">i</code> でまず <code class="ic">y[i] = 0.0;</code> と初期化し、<code class="ic">j</code> ループで <code class="ic">y[i] += A[i][j] * x[j];</code> を累積する',
        '<code class="ic">matrix7test.c</code>: サイズ <code class="ic">n</code>、行列 <code class="ic">A</code>、ベクトル <code class="ic">x</code> を読み込み、積 <code class="ic">y</code> を計算して <code class="ic">A, x, y</code> を順に表示する',
      ],
      phrases: ['ph-mat-prod', 'ph-header'],
      pitfall: '<code class="ic">y[i] = 0.0;</code> を <code class="ic">j</code> ループの中に書くと最後の1項だけになり、書かないとゴミ値に足されてバグります。必ず <code class="ic">i</code> ループ直下・<code class="ic">j</code> ループの直前！',
    },
    'b4:4-2-1': {
      essence: '24bit ビットマップ画像の各画素は <code class="ic">pixel_t</code>（赤 <code class="ic">r</code>, 緑 <code class="ic">g</code>, 青 <code class="ic">b</code> が各 0〜255）の構造体です。<b>全画素を2重ループで巡り、赤成分 <code class="ic">img[i][j].r</code> だけを 0.8 倍に抑える</b>と青緑が相対的に際立ち涼しげな色調になります。',
      steps: [
        '縦 <code class="ic">i = 0 .. hd-&gt;biHeight - 1</code>、横 <code class="ic">j = 0 .. hd-&gt;biWidth - 1</code> の2重ループを回す',
        '<code class="ic">img[i][j].r = img[i][j].r * 0.8;</code> で赤の輝度だけを減衰させる',
      ],
      phrases: ['ph-arrow-addr'],
      pitfall: '<code class="ic">hd</code> はポインタなので <code class="ic">hd-&gt;biHeight</code>（アロー）、<code class="ic">img[i][j]</code> は構造体の実体なので <code class="ic">img[i][j].r</code>（ドット）です！',
    },
    'b4:4-2-2': {
      essence: 'カラー画像を白黒（グレースケール）にするには、<b>各画素の R, G, B がすべて同じ明るさ値 <code class="ic">gray = (r + g + b) / 3</code> になるように揃えます</b>。書き換え途中で元の値が消えないよう一旦変数 <code class="ic">m</code> に受けるのがコツです。',
      steps: [
        '各画素で3色の平均 <code class="ic">m = (img[i][j].r + img[i][j].g + img[i][j].b) / 3;</code> を先に計算する',
        '<code class="ic">img[i][j].r = img[i][j].g = img[i][j].b = m;</code> と3成分すべてに同じ値を代入する',
      ],
      phrases: [],
      pitfall: '先に <code class="ic">img[i][j].r = (...)/3;</code> と上書きしてからその新しい <code class="ic">.r</code> を使って <code class="ic">.g</code> を計算してしまうミスに注意！ <code class="ic">unsigned char</code> 同士の和も一旦 <code class="ic">int</code> で計算されるので 255 を超えても溢れません。',
    },
    'b4:4-2-3': {
      essence: '画像の上下左右の外周8画素の帯（フレーム領域）だけを条件式で判定し、好きなピンク色（赤が強く、緑を抑え、青を少し混ぜた色）で塗りつぶします。',
      steps: [
        '各座標 <code class="ic">(i, j)</code> が「下端 <code class="ic">i &lt; 8</code> または 上端 <code class="ic">i &gt;= h - 8</code> または 左端 <code class="ic">j &lt; 8</code> または 右端 <code class="ic">j &gt;= w - 8</code>」に当たるかを <code class="ic">||</code> で判定する',
        '該当する画素に一様なピンク色（例: <code class="ic">r = 255, g = 140, b = 190</code>）をセットし、内側の画素は触らない',
      ],
      phrases: [],
      pitfall: '上端・右端の境界は <code class="ic">biHeight - 8</code> 以上（<code class="ic">&gt;=</code>）です。<code class="ic">&gt;</code> にすると7画素幅になってしまいます（<code class="ic">w-8, w-7, ..., w-1</code> でちょうど8個）。',
    },
    'b4:4-2-4': {
      essence: '画像の左右反転（鏡像）は、各行 <code class="ic">i</code> において<b>左端からの列 <code class="ic">j</code> と右端からの列 <code class="ic">biWidth - 1 - j</code> の画素構造体 <code class="ic">pixel_t</code> を丸ごとスワップ</b>します。',
      steps: [
        '一時変数 <code class="ic">pixel_t tmp;</code> を用意する（構造体は <code class="ic">=</code> で r,g,b ごと一括代入できる！）',
        '横方向のループ上限を <b>左半分 <code class="ic">j &lt; hd-&gt;biWidth / 2</code></b> に制限する',
        '<code class="ic">img[i][j]</code> と <code class="ic">img[i][hd-&gt;biWidth - 1 - j]</code> を <code class="ic">tmp</code> で交換する',
      ],
      phrases: ['ph-swap-tri'],
      pitfall: '1) <code class="ic">j &lt; hd-&gt;biWidth</code> まで回すと左右2回交換されて元の画像に戻ります！ 2) 反対側の添字は <code class="ic">biWidth - j</code> ではなく <b><code class="ic">biWidth - 1 - j</code></b>（<code class="ic">j=0</code> の相手は末尾 <code class="ic">w-1</code>）！',
    },
    'b4:4-2-5': {
      essence: '画像の右半分（<code class="ic">x = biWidth / 2</code> から）を $16 \\times 16$ のタイルに区切り、<b>ブロック内 256 画素の RGB 平均を求めて、そのブロック内全画素に塗り戻す</b>4重ループ（ブロック位置2重 × ブロック内走査2重）の構造を学びます。',
      steps: [
        'ブロック左上座標 <code class="ic">(y, x)</code> を <code class="ic">y += 16, x += 16</code> の16刻みで進める（<code class="ic">x</code> は <code class="ic">biWidth / 2</code> 開始）',
        '各ブロックで <code class="ic">int sr = 0, sg = 0, sb = 0;</code>（255×256は65280になるため必ず <code class="ic">int</code> 型！）に256画素分を合計する',
        '平均値 <code class="ic">sr / 256, sg / 256, sb / 256</code> を同じ $16 \\times 16$ ブロック内の全画素に代入する',
      ],
      phrases: [],
      pitfall: '合計変数 <code class="ic">sr, sg, sb</code> を <code class="ic">unsigned char</code> にすると 255 を超えた瞬間に桁あふれして真っ暗なモザイクになります！',
    },
    'b4:4-2-6': {
      essence: '縦方向を半分に縮小するには、出力ヘッダの高さ <code class="ic">hd-&gt;biHeight</code> を半分に更新し、新しい第 <code class="ic">i</code> 行に<b>元の第 <code class="ic">2*i</code> 行と第 <code class="ic">2*i+1</code> 行の上下2画素の平均</b>を詰めていきます。',
      steps: [
        '<code class="ic">hd-&gt;biHeight = hd-&gt;biHeight / 2;</code> で画像の高さを半分にする',
        '<code class="ic">i = 0 .. 新biHeight - 1</code> を小さい方から順に回し、<code class="ic">(img[2*i][j].r + img[2*i+1][j].r) / 2</code> を <code class="ic">img[i][j].r</code>（g, b も同様）に格納する',
      ],
      phrases: [],
      pitfall: '<code class="ic">i</code> が小さい順（0, 1, 2...）なら参照元 <code class="ic">2*i, 2*i+1</code> は常に書き込み先 <code class="ic">i</code> 以上のため、別配列なしでも未処理のデータを壊さずに縮小できます。',
    },
    'b4:4-3': {
      essence: 'バラバラだったヘッダ <code class="ic">hd</code> と画素配列 <code class="ic">img</code> を1つの構造体 <code class="ic">bmp_data_t</code> に統合します。<b>ポインタ <code class="ic">bmp</code> からメンバーをたどる複合記法 <code class="ic">bmp-&gt;header.biWidth</code> と <code class="ic">bmp-&gt;img[i][j].r</code></b> に機械的に書き換える練習です。',
      steps: [
        '<code class="ic">image2.c</code>: <code class="ic">&amp;hd-&gt;xxx</code> を <code class="ic">&amp;bmp-&gt;header.xxx</code> に、<code class="ic">&amp;img[i][j].b</code> を <code class="ic">&amp;bmp-&gt;img[i][j].b</code> に書き換える',
        '<code class="ic">image2collapse.c</code>: <code class="ic">main</code> のローカル変数は巨大なので <code class="ic">static bmp_data_t bmp;</code> とし、<code class="ic">bmp-&gt;header</code> と <code class="ic">bmp-&gt;img</code> を使って縦縮小を書く',
      ],
      phrases: ['ph-arrow-addr', 'ph-header'],
      pitfall: '<code class="ic">bmp</code> はポインタだから <code class="ic">-&gt;</code>、その中の <code class="ic">header</code> や <code class="ic">img[i][j]</code> は構造体の実体だから <code class="ic">.</code> になります！',
    },
    'b4:o4-1': {
      focusFn: ['matrix_vector_print', 'matrix_copy', 'vector_copy', 'gauss_jordan'],
      essence: '連立一次方程式 $Ax = b$ を解く<b>Gauss-Jordan の掃き出し法</b>です。第 $k$ ステップで「①第 $k$ 行を対角要素 $p=A_{kk}$ で割って 1 にする（規格化）」「②他のすべての行 $i \\ne k$ から第 $k$ 行の $m=A_{ik}$ 倍を引いて第 $k$ 列を 0 にする（消去）」を繰り返すと、$A$ が単位行列になり $b$ に解が現れます。',
      steps: [
        '<code class="ic">k = 0..n-1</code> のループで、まず <code class="ic">p = A[k][k]</code> を退避してから <code class="ic">A[k][0..n-1]</code> と <code class="ic">b[k]</code> をすべて <code class="ic">p</code> で割る',
        '<code class="ic">i = 0..n-1</code>（ただし <code class="ic">i == k</code> は <code class="ic">continue</code>）について、消去係数 <code class="ic">m = A[i][k]</code> を先に退避してから、<code class="ic">A[i][j] -= A[k][j] * m</code> と <code class="ic">b[i] -= b[k] * m</code> を行う',
        '各ステップの終わりに <code class="ic">&lt;k行目&gt;</code> と拡大係数行列を表示する',
      ],
      phrases: [],
      pitfall: '割る数 <code class="ic">p = A[k][k]</code> や引く倍率 <code class="ic">m = A[i][k]</code> を変数に退避せずループ内で直接 <code class="ic">A[k][k]</code> や <code class="ic">A[i][k]</code> を使うと、途中で自分自身が 1 や 0 に書き換わって計算が崩壊します！',
    },
    'b4:o4-2': {
      essence: '画像を反時計回りに90度回転させると、<b>横幅と高さが入れ替わります</b>。BMP の <code class="ic">img[0]</code> が画像の「一番下の行」であることに注意して座標変換 <code class="ic">out-&gt;img[j][h - 1 - i] = in-&gt;img[i][j]</code> を導きます。',
      steps: [
        '<code class="ic">out-&gt;header = in-&gt;header;</code> でヘッダ一式を丸ごとコピーしたあと、<code class="ic">biWidth = h; biHeight = w;</code> と幅・高さを入れ替える',
        '元画像の <code class="ic">(下から i 行目, 左から j 列目)</code> は反時計回り90度回転で <code class="ic">(下から j 行目, 左から h - 1 - i 列目)</code> に移るのでそのままコピーする',
      ],
      phrases: ['ph-arrow-addr'],
      pitfall: '出力画像の幅と高さが変わるため、同じ配列の上書きではなく入力用 <code class="ic">in</code> と出力用 <code class="ic">out</code> の2つの <code class="ic">static bmp_data_t</code> を使います。',
    },

    /* ==================== B5: 動的割当て ==================== */
    'b5:5-1': {
      essence: '<b>動的メモリ割当ての原点！</b> 入力された個数 <code class="ic">n</code> に合わせて実行時に <code class="ic">malloc(sizeof(int) * n)</code> でヒープから配列を借り、<b>「配列の先頭番地は return で返し、要素数 n はポインタ引数 <code class="ic">*pn</code> で返す」</b>王道パターンです。',
      steps: [
        '<code class="ic">scanf("%d", &amp;n);</code> で個数を読み、<code class="ic">a = malloc(sizeof(int) * n);</code> でちょうどのサイズを確保する',
        '直後に <code class="ic">if (a == NULL)</code> で失敗検査をして、OK なら <code class="ic">n</code> 個の整数を <code class="ic">&amp;a[i]</code> に読み込む',
        '<code class="ic">*pn = n;</code> で呼び出し元にサイズを伝え、<code class="ic">return a;</code> でヒープ配列の番地を返す（ここではまだ <code class="ic">free</code> しない！）',
      ],
      phrases: ['ph-malloc', 'ph-ptr-out'],
      pitfall: 'この関数内で <code class="ic">free(a)</code> してしまうと、呼び出し元が受け取った瞬間に解放済みメモリになってしまいます（使い終わる <code class="ic">main</code> 側で <code class="ic">free</code> する）。',
    },
    'b5:5-2': {
      essence: 'データの最小値 <code class="ic">min</code> と最大値 <code class="ic">max</code> を調べてから、<b>本当に必要な幅 <code class="ic">size = max - min + 1</code> 個分だけのカウント配列 <code class="ic">cnt</code> を <code class="ic">malloc</code> する</b>課題です。使い終わった <code class="ic">cnt</code> と <code class="ic">a</code> の両方を漏れなく <code class="ic">free</code> します。',
      steps: [
        '<code class="ic">a = new_array_scan(&amp;n);</code> でデータを取得し、<code class="ic">a[0]</code> を初期値として <code class="ic">min, max</code> を求める',
        '<code class="ic">size = max - min + 1;</code> で <code class="ic">cnt</code> を <code class="ic">malloc</code> し、<b>必ず 0 で初期化</b>してから <code class="ic">cnt[a[i] - min]++</code> で集計する',
        '1回以上出た値 <code class="ic">i + min</code> を出力したあと、<code class="ic">free(cnt); free(a);</code> で2つとも返却する',
      ],
      phrases: ['ph-malloc', 'ph-hist-init'],
      pitfall: '1) <code class="ic">malloc</code> 直後のヒープ領域は 0 ではなくゴミ値が入っているので <code class="ic">cnt[i] = 0</code> が必須！ 2) <code class="ic">new_array_scan</code> の中で借りた <code class="ic">a</code> の <code class="ic">free(a)</code> も忘れないこと！',
    },
    'b5:5-3': {
      essence: '文字列の動的確保で<b>1バイトの狂いも許されない「<code class="ic">+ 1</code>（終端 <code class="ic">\'\\0\'</code> の分）」</b>を体得する課題です。長さ <code class="ic">len</code> の文字列を2回繰り返すなら、必要なバイト数は <b><code class="ic">2 * len + 1</code></b> です。',
      steps: [
        '<code class="ic">len = strlen(s);</code> を求め、<code class="ic">malloc(sizeof(char) * (2 * len + 1))</code> でぴったり確保して NULL 検査する',
        '<code class="ic">i = 0..len-1</code> で前半 <code class="ic">d[i] = s[i]</code> と後半 <code class="ic">d[len + i] = s[i]</code> にコピーする',
        '最後に必ず <code class="ic">d[2 * len] = \'\\0\';</code> で終端ヌル文字を置いて <code class="ic">return d;</code>',
      ],
      phrases: ['ph-strlen1', 'ph-malloc'],
      pitfall: '確保サイズを <code class="ic">2 * len</code> にすると 1 バイト足りず範囲外エラー、大きめに <code class="ic">100</code> などにすると「ちょうどのサイズ」違反で不合格になります。',
      lines: {
        'strdouble.c': {
          'd = malloc(sizeof(char)*(2*len+1));': '<b>核心のバイト数</b>: 文字本体 <code class="ic">2 * len</code> 文字 ＋ 最後の終端記号 <code class="ic">\'\\0\'</code> の <b>1 バイト</b>でちょうど <code class="ic">2*len+1</code>',
          "d[2*len] = '\\0';": '<b>文字列の封印</b>: コピーした文字の直後に <code class="ic">\'\\0\'</code> を置かないと <code class="ic">printf("%s")</code> がどこまでも暴走する',
        },
      },
    },
    'b5:5-4': {
      essence: '固定2次元配列 <code class="ic">char line[1000][128]</code> だと短い行でも毎回128バイト消費しますが、<b>ポインタ配列 <code class="ic">char *line[MAXLINE]</code> にして各行を <code class="ic">strlen(s) + 1</code> バイトだけ <code class="ic">malloc</code></b> すれば無駄ゼロで保存できます。',
      steps: [
        '<code class="ic">while (fgets(s, LINELEN, stdin) != NULL)</code> で1行ずつ一時バッファ <code class="ic">s</code> に読む',
        '<code class="ic">line[n] = malloc(sizeof(char) * (strlen(s) + 1));</code> でその行にぴったりの領域を借り、<code class="ic">strcpy(line[n], s);</code> でコピーして <code class="ic">n++</code>',
        '<code class="ic">for (i = n - 1; i &gt;= 0; i--)</code> で下の行から逆順に出力し、最後に <code class="ic">0..n-1</code> の <code class="ic">line[i]</code> をすべて <code class="ic">free</code> する',
      ],
      phrases: ['ph-fgets', 'ph-strlen1', 'ph-malloc'],
      pitfall: '<code class="ic">fgets</code> が読んだ <code class="ic">s</code> にはすでに改行 <code class="ic">\\n</code> が含まれているため、出力は <code class="ic">printf("%s", line[i]);</code>（<code class="ic">\\n</code> を付けない）にします。',
    },
    'b5:5-5': {
      focusFn: ['pref_new', 'pref_print'],
      essence: '構造体1個分のメモリをヒープに確保する<b>コンストラクタ関数 <code class="ic">pref_new</code></b> を作ります。<code class="ic">sizeof(pref_t)</code> で構造体サイズを借り、アロー演算子 <code class="ic">p-&gt;...</code> でメンバーを埋めてポインタを返します。',
      steps: [
        '<code class="ic">pref.h</code> に <code class="ic">pref_t</code> の定義とプロトタイプ宣言を書く',
        '<code class="ic">pref_new</code> で <code class="ic">p = malloc(sizeof(pref_t));</code> → NULL チェック → <code class="ic">strncpy(p-&gt;name, name, NAMELEN); p-&gt;name[NAMELEN] = \'\\0\';</code> で安全に県名をコピーし、面積・人口を代入して <code class="ic">return p;</code>',
        '<code class="ic">pref_print</code> で <code class="ic">printf("%-10s %9.2f %9d\\n", ...);</code>（県名は <code class="ic">%-10s</code> で左揃え）を出力する',
      ],
      phrases: ['ph-malloc', 'ph-arrow-addr', 'ph-header'],
      pitfall: '<code class="ic">strncpy</code> はコピー元が長いと <code class="ic">\'\\0\'</code> を付けない仕様があるため、直後に <code class="ic">p-&gt;name[NAMELEN] = \'\\0\';</code> を書くのがプロの安全策です。',
    },
    'b5:5-6': {
      essence: 'バラバラのポインタ変数 <code class="ic">a, b, c</code> を<b>構造体ポインタの配列 <code class="ic">pref_t *p[3]</code></b> にまとめることで、表示も <code class="ic">free</code> も <code class="ic">for</code> ループで一括処理できるようになることを体験します。',
      steps: [
        '<code class="ic">pref_t *p[3];</code> を宣言し、<code class="ic">p[0], p[1], p[2]</code> に <code class="ic">pref_new(...)</code> の戻り値を代入する',
        'ループで <code class="ic">pref_print(p[i]);</code> を呼び、別のループで <code class="ic">free(p[i]);</code> で全県分のヒープ領域を解放する',
      ],
      phrases: ['ph-malloc'],
      pitfall: '<code class="ic">p</code> 自体はローカル配列なので <code class="ic">free(p)</code> はしません。解放するのは <code class="ic">pref_new</code> が <code class="ic">malloc</code> した各要素 <code class="ic">free(p[i])</code> です！',
    },
    'b5:5-7': {
      essence: '標準入力から1県読んで動的確保して返す <code class="ic">pref_new_scan</code> と、EOF まで読んで逆順に出す <code class="ic">pref3main.c</code> です。<b>EOF で読めなかったときに、直前に <code class="ic">malloc</code> していた構造体を忘れず <code class="ic">free(p)</code> してから <code class="ic">return NULL;</code> する</b>のが最大の急所です！',
      steps: [
        '<code class="ic">pref_new_scan</code>: <code class="ic">p = malloc(sizeof(pref_t))</code> したあと、<code class="ic">scanf("%15s %lf %d", p-&gt;name, &amp;p-&gt;area, &amp;p-&gt;population) != 3</code> なら <b><code class="ic">free(p); return NULL;</code></b>',
        '<code class="ic">pref3main.c</code>: <code class="ic">while ((q = pref_new_scan()) != NULL)</code> で <code class="ic">p[n++] = q;</code> に蓄え、逆順出力後に <code class="ic">p[0..n-1]</code> をすべて <code class="ic">free</code> する',
      ],
      phrases: ['ph-malloc', 'ph-arrow-addr'],
      pitfall: 'EOF のときに <code class="ic">free(p)</code> せずに <code class="ic">return NULL;</code> すると、最後の1回分の <code class="ic">pref_t</code>（32バイト）が誰も触れなくなりメモリリーク判定で不合格になります！',
      lines: {
        'pref.c': {
          'free(p);          /* 読めなかったら借りた領域を返してから */': '<b>リーク防止の急所</b>: 先に <code class="ic">malloc</code> した後に EOF に気づいた場合、そのまま <code class="ic">return NULL</code> すると借りっぱなしになるため必ず返却してから戻る',
        },
      },
    },
    'b5:5-8-1': {
      focusFn: ['istack_new', 'istack_delete'],
      essence: '構造体 <code class="ic">istack_t</code> の中に動的配列ポインタ <code class="ic">int *data</code> を持つ<b>2段構えの動的データ構造</b>です。<b>作るときは「外箱 → 中身」、壊すときは逆の「中身 → 外箱」の順</b>に処理します。',
      steps: [
        '<code class="ic">istack_new</code>: ① <code class="ic">s = malloc(sizeof(istack_t))</code>、② <code class="ic">s-&gt;size = size; s-&gt;sp = 0;</code>、③ <code class="ic">s-&gt;data = malloc(sizeof(int) * size)</code> で両方 NULL チェックして <code class="ic">return s;</code>',
        '<code class="ic">istack_delete</code>: ①先に中身の配列 <code class="ic">free(s-&gt;data);</code> を解放し、②次に構造体本体 <code class="ic">free(s);</code> を解放する',
      ],
      phrases: ['ph-malloc'],
      pitfall: '<code class="ic">istack_delete</code> で先に <code class="ic">free(s);</code> を実行すると、解放済みの <code class="ic">s</code> から <code class="ic">s-&gt;data</code> を読む不正アクセスになってしまいます！',
    },
    'b5:5-8-2': {
      focusFn: 'istack_push',
      essence: 'スタックポインタ <code class="ic">s-&gt;sp</code> は「現在入っている個数 ＝ 次にデータを入れる添字」を表します。まずは満杯（<code class="ic">s-&gt;sp &gt;= s-&gt;size</code>）なら何もしない基本版 <code class="ic">istack_push</code> を作ります。',
      steps: [
        '<code class="ic">if (s-&gt;sp &gt;= s-&gt;size) { return; }</code> で満杯ガードを入れる',
        '<code class="ic">s-&gt;data[s-&gt;sp] = d;</code> で末尾の空き位置にデータを書き、<code class="ic">s-&gt;sp++;</code> で位置を1つ進める',
      ],
      phrases: ['ph-arrow-addr'],
      pitfall: '<code class="ic">s-&gt;sp++</code> を先に実行すると <code class="ic">data[0]</code> が空いたままになり、最後の要素で範囲外書き込みを起こします。',
    },
    'b5:5-8-3': {
      focusFn: 'istack_pop',
      essence: '<code class="ic">istack_pop</code> は push の完全な逆再生です。<b><code class="ic">s-&gt;sp</code> は「次の空き位置」を指しているので、先に <code class="ic">s-&gt;sp--</code> で1つ戻してから <code class="ic">s-&gt;data[s-&gt;sp]</code> を返します</b>（LIFO: 後入れ先出し）。',
      steps: [
        '<code class="ic">if (s-&gt;sp &lt;= 0) { return 0; }</code> で空スタックのときは 0 を返す',
        '<code class="ic">s-&gt;sp--;</code> で末尾要素の位置に戻し、<code class="ic">return s-&gt;data[s-&gt;sp];</code> でその値を返す',
      ],
      phrases: ['ph-arrow-addr'],
      pitfall: '<code class="ic">sp--</code> する前に <code class="ic">s-&gt;data[s-&gt;sp]</code> を読むと、まだ何も入っていない未初期化枠を読んでしまいます！',
    },
    'b5:5-8-4': {
      focusFn: ['istack_empty', 'istack_full'],
      essence: 'C言語では比較演算子 <code class="ic">==</code> の結果自体が「真なら <code class="ic">1</code>、偽なら <code class="ic">0</code>」の評価値を持つため、空判定・満杯判定は1行でスッキリ書けます。',
      steps: [
        '<code class="ic">istack_empty</code>: <code class="ic">return s-&gt;sp == 0;</code>',
        '<code class="ic">istack_full</code>: <code class="ic">return s-&gt;sp == s-&gt;size;</code>',
      ],
      phrases: [],
      pitfall: '<code class="ic">=</code>（代入）と <code class="ic">==</code>（比較）を打ち間違えると、判定するたびにスタックが壊れます！',
    },
    'b5:5-8-5': {
      focusFn: 'istack_push',
      essence: '満杯のときに諦めるのではなく、<b><code class="ic">realloc</code> でデータ配列 <code class="ic">s-&gt;data</code> の容量を2倍に動的拡張してから追加する</b>ことで、実質無限に積めるスタックへ進化させます。',
      steps: [
        '<code class="ic">if (istack_full(s))</code> のとき、<code class="ic">int *p = realloc(s-&gt;data, sizeof(int) * s-&gt;size * 2);</code> を呼ぶ',
        '<code class="ic">if (p == NULL)</code> ならエラー終了し、成功したら <code class="ic">s-&gt;data = p;</code> と <b><code class="ic">s-&gt;size = s-&gt;size * 2;</code></b> を更新する',
        'その後に通常通り <code class="ic">s-&gt;data[s-&gt;sp] = d; s-&gt;sp++;</code> を実行する',
      ],
      phrases: ['ph-realloc'],
      pitfall: '<code class="ic">realloc</code> の第2引数は要素数ではなく<b>バイト数</b>です。<code class="ic">sizeof(int)</code> を掛け忘れないこと！ また <code class="ic">realloc</code> が自動で旧領域を解放してくれるので、自分で <code class="ic">free(s-&gt;data)</code> を書いてはいけません。',
    },
    'b5:5-8-6': {
      essence: '5-8(1)〜(5) で育てた <code class="ic">istack.c</code> の全6関数が連携して正しく動き、拡張後もデータの欠損やメモリリークがないかを総合テスト <code class="ic">istacktest.c</code> で検証します。',
      steps: [
        '<code class="ic">istack_new</code>, <code class="ic">delete</code>, <code class="ic">empty</code>, <code class="ic">full</code>, <code class="ic">push</code>（realloc対応）, <code class="ic">pop</code> がすべて揃っていることを確認して実行・採点する',
      ],
      phrases: ['ph-realloc', 'ph-malloc'],
      pitfall: '終了時に「free 忘れ」が出ないか（<code class="ic">s-&gt;data</code> と <code class="ic">s</code> の両方が解放されているか）を確認しよう。',
    },
    'b5:o5-1': {
      essence: '$n \\times n$ 行列を <b>長さ $n^2$ の1次元動的配列 <code class="ic">double *A = malloc(sizeof(double) * n * n)</code></b> で表現します。2次元の座標 $(i, j)$ を1次元の通し番号 <b><code class="ic">i * n + j</code></b> に変換するのが核心です。',
      steps: [
        '<code class="ic">matrixd_new</code> で <code class="ic">sizeof(double) * n * n</code> を1回の <code class="ic">malloc</code> で確保し、<code class="ic">matrixd_delete</code> は <code class="ic">free(A)</code> 1回で解放する',
        '入出力や和の関数では、従来の <code class="ic">A[i][j]</code> をすべて <code class="ic">A[i * n + j]</code> に置き換える',
      ],
      phrases: ['ph-malloc'],
      pitfall: '第 <code class="ic">i</code> 行の先頭までに1行 <code class="ic">n</code> 個 × <code class="ic">i</code> 行分の要素があるので、添字は <code class="ic">i * n + j</code> です（最大枠 <code class="ic">N</code> ではなく実行時の <code class="ic">n</code> を掛ける！）。',
    },
    'b5:o5-2': {
      essence: 'ダブルポインタ <code class="ic">double **A</code> を使い、<b>「各行へのポインタを並べる配列」と「各行の実データ配列」を2段階で <code class="ic">malloc</code> する</b>ことで、動的サイズなのに自然な <code class="ic">A[i][j]</code> 記法でアクセスできるようにします。',
      steps: [
        '<code class="ic">matrixdd_new</code>: まず <code class="ic">A = malloc(sizeof(double *) * n);</code>（ポインタのサイズ！）を確保し、ループで <code class="ic">A[i] = malloc(sizeof(double) * n);</code> を <code class="ic">n</code> 行分確保する',
        '<code class="ic">matrixdd_delete</code>: 逆順で、まずループで各行 <code class="ic">free(A[i]);</code> を解放してから、最後に <code class="ic">free(A);</code> を解放する',
      ],
      phrases: ['ph-malloc'],
      pitfall: '1段目の確保サイズは <code class="ic">sizeof(double *) * n</code>（ポインタ配列）、2段目は <code class="ic">sizeof(double) * n</code>（実数配列）です。解放の順序を逆にすると <code class="ic">A[i]</code> がすべてリークします！',
    },

    /* ==================== B6: リスト処理 ==================== */
    'b6:6-1': {
      focusFn: ['insert_node', 'list_print'],
      essence: '連結リストの基礎となる2関数です。<b>節点 <code class="ic">n</code> の直後に新節点を割り込ませる2本の矢印操作</b>と、<b>ダミー節点の次（<code class="ic">head_p-&gt;next</code>）から <code class="ic">NULL</code> までたどる走査</b>を完璧にマスターします。',
      steps: [
        '<code class="ic">insert_node</code>: <code class="ic">new_node = create_node(val);</code> を作り、<b>① <code class="ic">new_node-&gt;next = n-&gt;next;</code> → ② <code class="ic">n-&gt;next = new_node;</code></b> の順でつないで <code class="ic">return new_node;</code>',
        '<code class="ic">list_print</code>: <code class="ic">printf("[");</code> の後、<code class="ic">for (p = head_p-&gt;next; p != NULL; p = p-&gt;next)</code> で <code class="ic">" %d"</code> を出力し、最後に <code class="ic">printf(" ]\\n");</code>',
      ],
      phrases: ['ph-list-ins', 'ph-list-walk'],
      pitfall: '1) <code class="ic">insert_node</code> の2行の順番を逆にすると後ろのリストが消滅します！ 2) <code class="ic">list_print</code> を <code class="ic">p = head_p</code> から始めるとダミーの 0 まで表示されてしまいます！',
    },
    'b6:6-2': {
      focusFn: 'list_find',
      essence: 'ダミーの次 <code class="ic">head_p-&gt;next</code> から終端 <code class="ic">NULL</code> まで順にたどり、値 <code class="ic">val</code> を持つ節点が見つかったら<b>その節点へのポインタ <code class="ic">p</code> を返し、最後まで無ければ <code class="ic">NULL</code> を返す</b>線形探索です。',
      steps: [
        '<code class="ic">for (p = head_p-&gt;next; p != NULL; p = p-&gt;next)</code> で全データ節点を走査する',
        '<code class="ic">if (p-&gt;val == val) { return p; }</code> で見つけ次第その番地を返す',
        'ループを抜けたら（見つからなかったら）<code class="ic">return NULL;</code>',
      ],
      phrases: ['ph-list-walk'],
      pitfall: '隠しテストで戻り値のポインタ自体が検査されます。見つかったときに別の節点やダミーを返さないよう注意！',
    },
    'b6:6-3': {
      focusFn: 'list_insert_uniq',
      essence: '既に作った部品（<code class="ic">list_find</code> と <code class="ic">list_insert</code>）を組み合わせて、「重複のない集合（セット）」を実現します。',
      steps: [
        '<code class="ic">p = list_find(head_p, val);</code> で既に同じ値があるか探す',
        '<code class="ic">p != NULL</code>（既にある）なら挿入せずそのまま <code class="ic">return p;</code>、無ければ <code class="ic">return list_insert(head_p, val);</code> で先頭に挿入して返す',
      ],
      phrases: ['ph-list-walk', 'ph-list-ins'],
      pitfall: '既にあるときも仕様どおり「見つかったその節点のポインタ <code class="ic">p</code>」を返します（<code class="ic">NULL</code> ではない点に注意）。',
    },
    'b6:6-4': {
      essence: '<code class="ic">clock()</code> で (1) <code class="ic">n</code> 個の重複なし挿入、(2) 必ず見つかる検索（hit）、(3) 別の乱数列での検索（miss）の CPU 時間を測り、<b>リスト探索が1回あたり $O(n)$（全体で $O(n^2)$）かかる理由</b>を実験データから考察します。',
      steps: [
        '(1) <code class="ic">myrand_init()</code> 後、<code class="ic">clock()</code> で挟んで <code class="ic">list_insert_uniq</code> を <code class="ic">n</code> 回呼ぶ',
        '(2) もう一度 <b><code class="ic">myrand_init()</code> を呼んで同じ乱数列を再現</b>し、<code class="ic">list_find(...) != NULL</code> なら <code class="ic">found++</code> で hit 時間を測る',
        '(3) <b><code class="ic">myrand_init()</code> を呼ばずに</b>続きの新しい乱数で <code class="ic">list_find</code> を <code class="ic">n</code> 回呼んで miss 時間を測り、最後に <code class="ic">list_delete(head_p); free(head_p);</code>',
      ],
      phrases: ['ph-clock'],
      pitfall: 'hit は平均でリストの半分（$n/2$ 個）で止まりますが、miss は毎回リストの最後まで全部（$n$ 個）調べるため、miss の方が約2倍時間がかかります（考察のポイント！）。',
    },
    'b6:6-5': {
      focusFn: 'list_insert_delete_dup',
      essence: '配布の <code class="ic">remove_node(p)</code> は「<b><code class="ic">p</code> の直後の節点</b>」を削除する仕様です。したがって <code class="ic">list_find</code> で見つけた節点 <code class="ic">q</code> を消すには、<b>ダミー <code class="ic">head_p</code> から <code class="ic">p-&gt;next != q</code> の間たどって「<code class="ic">q</code> の1つ手前の節点 <code class="ic">p</code>」を見つける</b>必要があります。',
      steps: [
        '<code class="ic">q = list_find(head_p, val);</code> を呼び、<code class="ic">q == NULL</code> なら <code class="ic">return list_insert(head_p, val);</code>',
        '見つかったら <code class="ic">for (p = head_p; p-&gt;next != q; p = p-&gt;next) {}</code> で直前の節点 <code class="ic">p</code> まで進む',
        '<code class="ic">remove_node(p);</code> で <code class="ic">q</code> を削除・<code class="ic">free</code> し、<code class="ic">return NULL;</code> を返す',
      ],
      phrases: ['ph-list-lookahead'],
      pitfall: '<code class="ic">remove_node(q);</code> と書いてしまうと、<code class="ic">q</code> 自身ではなく「<code class="ic">q</code> の次の無関係な節点」が消えてしまいます！',
    },
    'b6:o6-6': {
      focusFn: 'list_insert_delete_dup2',
      essence: '課題 6-5 では <code class="ic">list_find</code> と手前探しの2回リストを走査していましたが、<b>最初からダミー <code class="ic">head_p</code> から出発して1歩先 <code class="ic">p-&gt;next-&gt;val</code> を先読みすれば、たった1回の走査で削除まで完結</b>します！',
      steps: [
        '<code class="ic">for (p = head_p; p-&gt;next != NULL; p = p-&gt;next)</code> で1つ先を覗きながら進む',
        '<code class="ic">if (p-&gt;next-&gt;val == val)</code> ならその場で <code class="ic">remove_node(p); return NULL;</code>',
        '最後まで無ければ先頭に <code class="ic">return insert_node(head_p, val);</code>',
      ],
      phrases: ['ph-list-lookahead', 'ph-list-ins'],
      pitfall: 'テスト用の <code class="ic">list6test.c</code> でも終了時に <code class="ic">list_delete(head_p); free(head_p);</code> を忘れないようにしましょう。',
    },
    'b6:o6-6t': {
      essence: '2回走査版 <code class="ic">list_insert_delete_dup</code> と 1回走査版 <code class="ic">dup2</code> に全く同じ乱数列（<code class="ic">% (n/10)</code> で重複が多く発生する条件）を与え、実行時間の違いを比較します。',
      steps: [
        '2つの空リスト <code class="ic">head1, head2</code> を用意し、それぞれ <code class="ic">myrand_init()</code> で同じ乱数列を入れて <code class="ic">clock()</code> で計測する',
        '最後に両方のリストを <code class="ic">list_delete</code> &amp; <code class="ic">free</code> する',
      ],
      phrases: ['ph-clock'],
      pitfall: '重複して削除されるときは <code class="ic">dup</code> が「見つけるまで＋手前まで」と2回同じ区間を走るため、<code class="ic">dup2</code> の方が速くなります。',
    },
    'b6:o6-7': {
      focusFn: 'list_sorted_insert_uniq',
      essence: 'リストを常に<b>小さい順（昇順）に保ったまま挿入する</b>には、先読みループで <code class="ic">p-&gt;next-&gt;val &lt; val</code> の間だけ進み、最初に <code class="ic">val</code> 以上の節点が現れた直前 <code class="ic">p</code> で止まって <code class="ic">insert_node(p, val)</code> を呼びます。',
      steps: [
        '<code class="ic">list_find</code> で既に同じ値があればその節点を返す',
        '<code class="ic">for (p = head_p; p-&gt;next != NULL &amp;&amp; p-&gt;next-&gt;val &lt; val; p = p-&gt;next) {}</code> で挿入位置の直前 <code class="ic">p</code> まで進む',
        '<code class="ic">return insert_node(p, val);</code> で <code class="ic">p</code> の直後に挿入する',
      ],
      phrases: ['ph-list-lookahead', 'ph-list-ins'],
      pitfall: '条件式の <code class="ic">p-&gt;next != NULL</code> を必ず左側に書くこと（右に書くと末尾で NULL 参照クラッシュします）！',
    },
    'b6:o6-8': {
      focusFn: ['list_sorted_insert_uniq2', 'list_sorted_find'],
      essence: 'リストが昇順に並んでいる性質を最大限に活かします！ <b>探索中に <code class="ic">val</code> より大きい値が現れた時点で「これより後ろには絶対に無い」と確定するため、途中で走査を打ち切れます</b>。',
      steps: [
        '<code class="ic">list_sorted_insert_uniq2</code>: <code class="ic">p-&gt;next-&gt;val &lt; val</code> の間だけ進み、止まった位置で <code class="ic">p-&gt;next != NULL &amp;&amp; p-&gt;next-&gt;val == val</code> なら既存節点 <code class="ic">p-&gt;next</code> を返し、そうでなければ <code class="ic">insert_node(p, val)</code>（1回走査！）',
        '<code class="ic">list_sorted_find</code>: <code class="ic">p-&gt;val &lt; val</code> の間だけ進み、止まった節点 <code class="ic">p</code> が <code class="ic">p != NULL &amp;&amp; p-&gt;val == val</code> なら <code class="ic">p</code>、違えば <code class="ic">NULL</code> を返す',
      ],
      phrases: ['ph-list-lookahead', 'ph-list-walk'],
      pitfall: '終端（全要素が <code class="ic">val</code> より小さい場合）では <code class="ic">p</code> や <code class="ic">p-&gt;next</code> が <code class="ic">NULL</code> になっているので、値比較の前に必ず <code class="ic">!= NULL</code> チェックを挟みます。',
    },
    'b6:o6-8t': {
      essence: '課題 6-4 のリストをソート版（<code class="ic">list_sorted_insert_uniq2</code> と <code class="ic">list_sorted_find</code>）に置き換えて計算時間を計測します。miss 検索でも平均 $n/2$ 個で打ち切れるため約2倍速くなりますが、それでもオーダーは $O(n)$ のままです。',
      steps: [
        '<code class="ic">list4time.c</code> の呼び出し関数を <code class="ic">list_sorted_insert_uniq2</code> と <code class="ic">list_sorted_find</code> に変更して計測・考察する',
      ],
      phrases: ['ph-clock'],
      pitfall: '出力ラベルや <code class="ic">found</code> カウントの形式を配布仕様に合わせましょう。',
    },
    'b6:6-9': {
      focusFn: ['tree_insert_uniq', 'tree_print'],
      essence: '<b>二分探索木（Binary Search Tree）の核！</b> 「左の子 &lt; 自分 &lt; 右の子」の不変条件を守りながら再帰で節点を挿入し、<b>通りがけ順（左→自分→右）で再帰表示すると一切ソート処理を書かなくても昇順に出力される</b>美しさを体験します。',
      steps: [
        '<code class="ic">tree_insert_uniq</code>: <code class="ic">n == NULL</code> なら <code class="ic">create_node(val)</code>。<code class="ic">val &lt; n-&gt;data</code> なら <code class="ic">n-&gt;left = tree_insert_uniq(n-&gt;left, val);</code>、<code class="ic">val &gt; n-&gt;data</code> なら <code class="ic">n-&gt;right = ...</code>、等しければ何もしないで最後に <code class="ic">return n;</code>',
        '<code class="ic">tree_print</code>: <code class="ic">if (n != NULL)</code> のときだけ、<code class="ic">tree_print(n-&gt;left);</code> → <code class="ic">printf(" %d", n-&gt;data);</code> → <code class="ic">tree_print(n-&gt;right);</code>',
      ],
      phrases: ['ph-tree-rec'],
      pitfall: '再帰呼び出しの戻り値を <code class="ic">n-&gt;left = ...</code> に受け取り忘れると、せっかく <code class="ic">create_node</code> した葉が親とつながらずメモリリークになります！',
    },
    'b6:o6-10': {
      focusFn: 'tree_find',
      essence: '二分探索木の探索 <code class="ic">tree_find</code> です。根からスタートし、探す値 <code class="ic">val</code> が小さければ左の枝 <code class="ic">n = n-&gt;left</code>、大きければ右の枝 <code class="ic">n = n-&gt;right</code> へ降りるだけで、1ステップごとに候補が半分に絞られます（$O(\\log n)$）。',
      steps: [
        '<code class="ic">while (n != NULL)</code>（または再帰）で節点をたどる',
        '<code class="ic">val == n-&gt;data</code> なら見つかったので <code class="ic">return n;</code>、小さければ <code class="ic">n = n-&gt;left;</code>、大きければ <code class="ic">n = n-&gt;right;</code>',
        '<code class="ic">NULL</code>（葉の先）まで降りてしまったら存在しないので <code class="ic">return NULL;</code>',
      ],
      phrases: ['ph-tree-rec'],
      pitfall: 'リストと違ってダミー節点はないため、引数の根 <code class="ic">n</code> そのものから比較を始めます。',
    },
    'b6:o6-11': {
      essence: '課題 6-4 と全く同じ件数 <code class="ic">n</code> の挿入・検索を二分探索木で実行し、<b>$O(n)$ のリストでは数秒かかった処理が、$O(\\log n)$ の二分木では数ミリ秒（数百倍高速！）で終わる</b>劇的な計算量の差を実証します。',
      steps: [
        '木の根を <code class="ic">tree_node_t *root = NULL;</code>（空の木）で初期化する',
        '挿入時は必ず <b><code class="ic">root = tree_insert_uniq(root, myrand());</code></b> と根ポインタを受け取り直す',
        '(2) hit と (3) miss を <code class="ic">tree_find(root, myrand())</code> で計測し、最後に <code class="ic">tree_delete(root);</code> で全節点を解放する',
      ],
      phrases: ['ph-clock', 'ph-tree-rec'],
      pitfall: '最初は <code class="ic">root == NULL</code> なので、<code class="ic">root = tree_insert_uniq(...)</code> と代入しないと <code class="ic">root</code> がずっと <code class="ic">NULL</code> のままになります！',
    },

    /* ==================== T1: 中間試験対策（模擬3回＋腕試し） ==================== */
    't1:q1': {
      essence: '<b>【第1回 問1・ポインタ引数】</b> 総秒数 <code class="ic">t</code> を 3600（1時間）と 60（1分）の商・剰余に分解し、3つのポインタの指す先 <code class="ic">*h, *m, *s</code> に格納する鉄板問題です。',
      steps: [
        '時間: <code class="ic">*h = t / 3600;</code>',
        '分（1時間に満たない残り秒数を60で割る）: <code class="ic">*m = (t % 3600) / 60;</code>',
        '秒: <code class="ic">*s = t % 60;</code>（関数内で printf は絶対に書かない！）',
      ],
      phrases: ['ph-ptr-out', 'ph-header'],
      pitfall: '分を <code class="ic">t / 60</code> と書くと 3661 秒のときに 61 分になってしまいます。必ず <code class="ic">t % 3600 / 60</code>（または <code class="ic">(t / 60) % 60</code>）で 0〜59 に収めること！',
    },
    't1:q2': {
      essence: '<b>【第1回 問2・構造体ポインタ】</b> <code class="ic">point_t *</code> への入力（<code class="ic">&amp;p-&gt;x</code> と <code class="ic">EOF</code> 返却）、外積による三角形の面積 $|(x_b-x_a)(y_c-y_a)-(x_c-x_a)(y_b-y_a)|/2$、重心座標のポインタ格納の3点セットです。',
      steps: [
        '<code class="ic">point_scan</code>: <code class="ic">fprintf(stderr, ...)</code> のあと <code class="ic">if (scanf("%lf%lf", &amp;p-&gt;x, &amp;p-&gt;y) == EOF) return EOF;</code>、読めたら <code class="ic">return 1;</code>',
        '<code class="ic">tri_area</code>: <code class="ic">fabs(...) / 2.0</code> で面積を計算して戻り値で返す（<code class="ic">#include &lt;math.h&gt;</code> を忘れずに！）',
        '<code class="ic">centroid</code>: 結果用ポインタ <code class="ic">g</code> のメンバー <code class="ic">g-&gt;x</code> と <code class="ic">g-&gt;y</code> に3頂点の平均を代入する',
      ],
      phrases: ['ph-arrow-addr', 'ph-eof', 'ph-eps'],
      pitfall: '外積は頂点の並び順で負になることがあるため、必ず <code class="ic">fabs</code>（実数用の絶対値）を通します（<code class="ic">abs</code> は整数に切り捨てられるので NG！）。',
    },
    't1:q3': {
      essence: '<b>【第1回 問3・乱数と配列分布】</b> 課題 3-10 のサイコロ2個版（和の範囲 2〜12）です。配布 <code class="ic">dice2.c</code> が<b>わざと <code class="ic">c[s] = rand();</code> でゴミを入れてから関数を呼ぶ</b>ため、ゼロ初期化の徹底が試されます。',
      steps: [
        '<code class="ic">dice_throw</code>: <code class="ic">i = 0..n-1</code> に <code class="ic">rand() % 6 + 1</code> を入れる',
        '<code class="ic">dice2_distr</code>: まず <code class="ic">s = D2_MIN(2) 〜 D2_MAX(12)</code> の <code class="ic">c[s] = 0;</code> を行い、次に <code class="ic">c[d1[i] + d2[i]]++</code> で数える',
      ],
      phrases: ['ph-rand', 'ph-hist-init'],
      pitfall: '再現テストのため <code class="ic">srand</code> は呼ばないこと。また <code class="ic">c[s] = 0</code> の上限は <code class="ic">&lt;= D2_MAX</code> です。',
    },
    't1:q4': {
      essence: '<b>【第1回 問4・2次元配列の行列積】</b> 行列の積 $C_{ij} = \\sum_{k=0}^{n-1} A_{ik} B_{kj}$（3重ループ）と、対角成分の和であるトレース $\\mathrm{tr}(A) = \\sum_{i=0}^{n-1} A_{ii}$（1重ループ）を実装します。',
      steps: [
        '<code class="ic">matrix_mult</code>: <code class="ic">i, j</code> の2重ループ内で<b>まず <code class="ic">C[i][j] = 0.0;</code></b> とし、内側 <code class="ic">k = 0..n-1</code> で <code class="ic">C[i][j] += A[i][k] * B[k][j];</code>',
        '<code class="ic">matrix_trace</code>: <code class="ic">double t = 0.0;</code> に <code class="ic">A[i][i]</code> を <code class="ic">i = 0..n-1</code> まで足して返す',
      ],
      phrases: ['ph-mat-prod'],
      pitfall: '配布 <code class="ic">matmain.c</code> は <code class="ic">C[i][j] = 99.0</code> を仕込んでから呼びます。<code class="ic">C[i][j] = 0.0;</code> を忘れると全要素が 99 ズレます！',
    },
    't1:r2q1': {
      essence: '<b>【第2回 問1・ポインタによる3要素ソート】</b> 2つの <code class="ic">int *</code> の中身を入れ替える補助関数 <code class="ic">swap_int</code> を作ると、3つの比較交換（バブルソート3ステップ: a-b, b-c, a-b）がミスなく書けます。',
      steps: [
        '<code class="ic">swap_int(int *x, int *y)</code> で <code class="ic">int t = *x; *x = *y; *y = t;</code> を作る',
        '<code class="ic">if (*a &gt; *b) swap_int(a, b);</code> → <code class="ic">if (*b &gt; *c) swap_int(b, c);</code>（これで最大値が *c に確定）→ もう一度 <code class="ic">if (*a &gt; *b) swap_int(a, b);</code>',
      ],
      phrases: ['ph-ptr-out'],
      pitfall: '<code class="ic">sort3</code> の中では <code class="ic">a, b, c</code> はすでにポインタなので、<code class="ic">swap_int(a, b)</code> には <code class="ic">&amp;</code> を付けずにそのまま渡します！',
    },
    't1:r2q2': {
      essence: '<b>【第2回 問2・文字配列を含む構造体ポインタ】</b> <code class="ic">item_t *p</code> の入力で、<b>文字配列メンバー <code class="ic">p-&gt;name</code> には <code class="ic">&amp;</code> を付けず、整数メンバー <code class="ic">&amp;p-&gt;price, &amp;p-&gt;qty</code> には <code class="ic">&amp;</code> を付ける</b>区別がポイントです。',
      steps: [
        '<code class="ic">item_scan</code>: <code class="ic">scanf(NM_FMT, p-&gt;name)</code>, <code class="ic">&amp;p-&gt;price</code>, <code class="ic">&amp;p-&gt;qty</code> のいずれかが <code class="ic">EOF</code> なら <code class="ic">return EOF;</code>、成功なら <code class="ic">return 1;</code>',
        '<code class="ic">item_discount</code>: 整数切り捨てで <code class="ic">p-&gt;price = p-&gt;price * (100 - pct) / 100;</code>（先に掛けてから 100 で割る！）',
        '<code class="ic">item_total</code>: <code class="ic">return p-&gt;price * p-&gt;qty;</code>',
      ],
      phrases: ['ph-arrow-addr', 'ph-eof'],
      pitfall: '<code class="ic">p-&gt;price / 100 * (100 - pct)</code> のように先に整数除算すると 150 円が 1 円になってしまいます。整数演算の割引は必ず「先に掛けて後から割る」！',
    },
    't1:r2q3': {
      essence: '<b>【第2回 問3・乱数集計と最長連長（ランレングス）】</b> 出目のカウントに加え、隣り合う要素 <code class="ic">d[i] == d[i - 1]</code> を比べて現在の連続回数 <code class="ic">len</code> と過去最大 <code class="ic">best</code> を更新します。',
      steps: [
        '<code class="ic">dice_throw</code> と <code class="ic">dice_count</code>（<code class="ic">c[1..6] = 0</code> 初期化 → <code class="ic">c[d[i]]++</code>）を実装する',
        '<code class="ic">longest_run</code>: <code class="ic">len = 1, best = 1, *val = d[0]</code> で初期化し、<code class="ic">i = 1..n-1</code> で前回と同じなら <code class="ic">len++</code>、違えば <code class="ic">len = 1</code> にリセット。<code class="ic">len &gt; best</code> のときだけ <code class="ic">best = len; *val = d[i];</code>',
      ],
      phrases: ['ph-rand', 'ph-hist-init', 'ph-ptr-out'],
      pitfall: '同じ最長記録が複数あるとき「最初に出た方の目」を残す場合は <code class="ic">&gt;=</code> ではなく厳密な <code class="ic">len &gt; best</code> で更新します。また <code class="ic">n == 1</code> でも正しく動くよう初期値を <code class="ic">*val = d[0], best = 1</code> にしておくこと！',
    },
    't1:r2q4': {
      essence: '<b>【第2回 問4・$A + A^T$ と対称行列判定】</b> 全ペアについて $A_{ij} == A_{ji}$ が成り立つかを調べる<b>全称判定パターン（1つでも違う箇所が見つかったら即 <code class="ic">return 0;</code>、全部通過したら <code class="ic">return 1;</code>）</b>です。',
      steps: [
        '<code class="ic">matrix_add_trans</code>: 2重ループで <code class="ic">Y[i][j] = A[i][j] + A[j][i];</code>',
        '<code class="ic">matrix_is_sym</code>: 2重ループで <code class="ic">if (A[i][j] != A[j][i]) { return 0; }</code>、ループを最後まで抜けたら <code class="ic">return 1;</code>',
      ],
      phrases: [],
      pitfall: 'ループの中で <code class="ic">if (A[i][j] == A[j][i]) return 1;</code> と書いてしまうと、<code class="ic">A[0][0] == A[0][0]</code> の1マス目だけで即「対称！」と誤判定して終わってしまいます！',
    },
    't1:r3q1': {
      essence: '<b>【第3回 問1・3ポインタ同時の統計量返却】</b> EOF までの実数配列読み込みと、最小・最大・平均の計算です。先頭要素 <code class="ic">a[0]</code> による初期化を徹底しましょう。',
      steps: [
        '<code class="ic">array_scan</code>: <code class="ic">n = 0..N_MAX-1</code> で <code class="ic">stderr</code> にプロンプトを出し、<code class="ic">scanf("%lf", &amp;a[n]) == EOF</code> で <code class="ic">break</code> して <code class="ic">return n;</code>',
        '<code class="ic">array_stat</code>: <code class="ic">*min = a[0]; *max = a[0]; s = 0.0;</code> から始め、<code class="ic">0..n-1</code> を走査して更新し、最後に <code class="ic">*ave = s / n;</code>',
      ],
      phrases: ['ph-ptr-out', 'ph-eof', 'ph-double-io'],
      pitfall: '最小値を <code class="ic">0.0</code> で初期化すると、正の数ばかりのデータで最小値が 0.0 になって不正解になります。',
    },
    't1:r3q2': {
      essence: '<b>【第3回 問2・入れ子の構造体ポインタ】</b> <code class="ic">circle_t *p</code> の中に <code class="ic">point_t c</code> が入っているため、<b><code class="ic">p</code> はポインタで <code class="ic">-&gt;</code>、<code class="ic">c</code> は実体で <code class="ic">.</code> となり <code class="ic">p-&gt;c.x</code>（番地は <code class="ic">&amp;p-&gt;c.x</code>）</b>と書きます。',
      steps: [
        '<code class="ic">circle_scan</code>: <code class="ic">scanf("%lf%lf%lf", &amp;p-&gt;c.x, &amp;p-&gt;c.y, &amp;p-&gt;r) == EOF</code> なら <code class="ic">EOF</code>、成功なら <code class="ic">1</code>',
        '<code class="ic">circle_area</code>: <code class="ic">PI * p-&gt;r * p-&gt;r</code> を返す',
        '<code class="ic">circle_relation</code>: 中心間距離 $d$ と半径の和 $r_1+r_2$・半径の差 $|r_1-r_2|$ を許容誤差 <code class="ic">EPS</code> 付きで比較して 0(離れる) / 1(外接) / 3(包含・内接) / 2(交わる) を返す',
      ],
      phrases: ['ph-arrow-addr', 'ph-eps'],
      pitfall: '<code class="ic">p-&gt;c-&gt;x</code> ではなく <code class="ic">p-&gt;c.x</code> です！ また外接判定 <code class="ic">fabs(d - (p-&gt;r + q-&gt;r)) &lt;= EPS</code> を先に判定しておくと境界の誤差に強くなります。',
    },
    't1:r3q3': {
      essence: '<b>【第3回 問3・10点刻みヒストグラムの100点境界】</b> 0〜100点を <code class="ic">s[i] / 10</code> で階級に分けると、<b>100点だけが <code class="ic">k = 10</code> になり、90〜100点の枠 <code class="ic">c[9]</code> に入れる境界補正</b>が必要になります。',
      steps: [
        '<code class="ic">score_gen</code>: 0〜50 の一様乱数2個の和 <code class="ic">rand() % 51 + rand() % 51</code> を入れる',
        '<code class="ic">score_hist</code>: <code class="ic">c[0..N_CLASS-1] = 0</code> で初期化した後、<code class="ic">k = s[i] / 10; if (k &gt;= N_CLASS) k = N_CLASS - 1; c[k]++;</code>',
      ],
      phrases: ['ph-rand', 'ph-hist-init'],
      pitfall: '0〜50 の個数は 51 個なので <code class="ic">% 51</code> です（<code class="ic">% 50</code> にすると 100 点が出ません）。また <code class="ic">k == 10</code> の補正を忘れると <code class="ic">c[10]</code> で配列外破壊を起こします！',
    },
    't1:r3q4': {
      essence: '<b>【第3回 問4・行和と列和の同時計算＆行の入れ替え】</b> 2重ループ1回で「第 <code class="ic">i</code> 行の和 <code class="ic">r[i] += A[i][j]</code>」と「第 <code class="ic">j</code> 列の和 <code class="ic">c[j] += A[i][j]</code>」を一気に求め、指定された2つの行を列ループで丸ごと交換します。',
      steps: [
        '<code class="ic">row_col_sum</code>: まず <code class="ic">r[0..n-1]</code> と <code class="ic">c[0..n-1]</code> を両方 <code class="ic">0.0</code> に初期化してから、2重ループで <code class="ic">r[i] += A[i][j]; c[j] += A[i][j];</code>',
        '<code class="ic">row_swap</code>: 列 <code class="ic">j = 0..n-1</code> の1重ループで <code class="ic">A[i][j]</code> と <code class="ic">A[k][j]</code> を <code class="ic">tmp</code> でスワップする',
      ],
      phrases: ['ph-mat-prod', 'ph-swap-tri'],
      pitfall: '列和の添字は <code class="ic">c[i]</code> ではなく列番号の <b><code class="ic">c[j]</code></b> です！',
    },
    't1:x1': {
      essence: '<b>【腕試し1・配布 sample.c の技法】</b> EOF までの配列入力に加え、<b>負の値が来たら即 <code class="ic">stderr</code> に出して <code class="ic">exit(1);</code> で異常終了する仕様（終了コード検査）</b>と、データ0件のガードを実装します。',
      steps: [
        '<code class="ic">n = 0..N_ARRAY-1</code> のループで <code class="ic">scanf("%lf", &amp;a[n]) == EOF</code> なら <code class="ic">break</code>、負数ならエラー出力して <code class="ic">exit(1);</code>',
        'ループ後 <code class="ic">n == 0</code> なら <code class="ic">"no data\\n"</code> を <code class="ic">stderr</code> に出して <code class="ic">exit(1);</code>',
        '平均 <code class="ic">ave</code> を求めてから偏差平方和 <code class="ic">(a[i] - ave) * (a[i] - ave)</code> の平均 <code class="ic">var</code> を計算し、標準偏差 <code class="ic">sqrt(var)</code> を出力する',
      ],
      phrases: ['ph-stderr', 'ph-eof', 'ph-double-io'],
      pitfall: '異常終了時は <code class="ic">return 0;</code> ではなく必ず終了ステータス 1（<code class="ic">exit(1);</code>）で終わること（本番でも終了コードが採点されます）！',
    },
    't1:x2': {
      essence: '<b>【腕試し2・文字列処理の総点検】</b> 基準単語 <code class="ic">key</code> を読み、続く単語列から「総数」「<code class="ic">strcmp == 0</code> による一致数」「<code class="ic">strlen</code> 比較と <code class="ic">strcpy</code> による最長単語」を求めます。',
      steps: [
        '<code class="ic">key</code> を <code class="ic">scanf("%31s", key)</code> で読み（EOFなら異常終了）、最初の最長候補として <code class="ic">strcpy(longest, key);</code> しておく',
        '無限ループで <code class="ic">w</code> を EOF まで読み、<code class="ic">n++</code>、<code class="ic">strcmp(w, key) == 0</code> なら <code class="ic">same++</code>、<code class="ic">strlen(w) &gt; strlen(longest)</code> なら <code class="ic">strcpy(longest, w);</code>',
        '総単語数・一致数・最長単語とその文字数を出力する',
      ],
      phrases: ['ph-strcmp', 'ph-nullchar', 'ph-eof'],
      pitfall: '同じ最大の長さの単語が後から来たとき「最初のものを残す」仕様なら <code class="ic">&gt;=</code> ではなく厳密な <code class="ic">&gt;</code> にします。また文字列の保存は <code class="ic">longest = w;</code> ではなく必ず <code class="ic">strcpy(longest, w);</code>！',
    },
  },
};
