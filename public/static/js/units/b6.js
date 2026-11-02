/* =========================================================================
 *  B6 リスト処理 — 章コンテンツ
 *  出典: 配布資料「[B6] リスト処理」と講義スライド「B6.pdf」
 * ========================================================================= */
(function () {
  'use strict';
  const { h, icon } = U;
  const C = {
    p0: "#include <stdio.h>\n\ntypedef struct list_node_s {\n    int val;\n    struct list_node_s *next;\n} list_node_t;\n\nint main(void)\n{\n    list_node_t a, b, c;\n\n    a.val = 10; a.next = &b;\n    b.val = 20; b.next = &c;\n    c.val = 30; c.next = NULL;\n\n    printf(\"%d %d\\n\", (int)sizeof(list_node_t), a.next->next->val);\n    return 0;\n}\n",
    demo: "#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct list_node_s {\n    int val;\n    struct list_node_s *next;\n} list_node_t;\n\nlist_node_t* create_node(int val)\n{\n    list_node_t *new_node = malloc(sizeof(list_node_t));\n    new_node->val = val;\n    new_node->next = NULL;\n    return new_node;\n}\n\n/* n の直後に挿入 (スライド「insert_node()」) */\nlist_node_t* insert_node(list_node_t *n, int val)\n{\n    list_node_t *new_node = create_node(val);\n    new_node->next = n->next;   /* (1) 新しい節点の次 = n の次 */\n    n->next = new_node;         /* (2) n の次 = 新しい節点 */\n    return new_node;\n}\n\nint main(void)\n{\n    list_node_t *head_p = create_node(0);   /* ダミー */\n    list_node_t *p, *next;\n\n    insert_node(head_p, 3);\n    insert_node(head_p, 5);\n    insert_node(head_p, 4);\n\n    for (p = head_p->next; p != NULL; p = p->next) {\n        printf(\" %d\", p->val);\n    }\n    printf(\"\\n\");\n\n    for (p = head_p; p != NULL; p = next) {   /* 後始末 */\n        next = p->next;\n        free(p);\n    }\n    return 0;\n}\n",
    p2: "#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct list_node_s {\n    int val;\n    struct list_node_s *next;\n} list_node_t;\n\nlist_node_t* create_node(int val)\n{\n    list_node_t *new_node = malloc(sizeof(list_node_t));\n    new_node->val = val;\n    new_node->next = NULL;\n    return new_node;\n}\n\nint main(void)\n{\n    list_node_t *head_p = create_node(0);\n    list_node_t *p;\n    int v[] = {7, 2, 9, 4}, i, cnt = 0;\n\n    for (i = 0; i < 4; i++) {          /* 先頭に挿入 → [ 4 9 2 7 ] */\n        p = create_node(v[i]);\n        p->next = head_p->next;\n        head_p->next = p;\n    }\n    for (p = head_p; p->next != NULL; p = p->next) {   /* 先読み */\n        if (p->next->val == 2) break;\n        cnt++;\n    }\n    printf(\"%d %d\\n\", p->val, cnt);\n    return 0;\n}\n",
    p3: "#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct list_node_s {\n    int val;\n    struct list_node_s *next;\n} list_node_t;\n\nlist_node_t* create_node(int val)\n{\n    list_node_t *new_node = malloc(sizeof(list_node_t));\n    new_node->val = val;\n    new_node->next = NULL;\n    return new_node;\n}\n\nstatic void remove_node(list_node_t *p)   /* p の直後を削除 */\n{\n    list_node_t *old = p->next;\n    p->next = old->next;\n    free(old);\n}\n\nint main(void)\n{\n    list_node_t *head_p = create_node(0), *p;\n    int v[] = {3, 5, 4}, i;\n\n    for (i = 0; i < 3; i++) {          /* [ 4 5 3 ] */\n        p = create_node(v[i]);\n        p->next = head_p->next;\n        head_p->next = p;\n    }\n    remove_node(head_p->next);          /* ← どれが消える? */\n\n    for (p = head_p->next; p != NULL; p = p->next) printf(\" %d\", p->val);\n    printf(\"\\n\");\n    while (head_p != NULL) { p = head_p->next; free(head_p); head_p = p; }\n    return 0;\n}\n",
    tree: "#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct tree_node_s {\n    struct tree_node_s *left;\n    struct tree_node_s *right;\n    int data;\n} tree_node_t;\n\ntree_node_t* tree_insert(tree_node_t *n, int val)\n{\n    if (n == NULL) {\n        n = malloc(sizeof(tree_node_t));\n        n->data = val;\n        n->left = NULL;\n        n->right = NULL;\n    }\n    else if (val < n->data) {\n        n->left = tree_insert(n->left, val);     /* 小さければ左へ */\n    }\n    else {\n        n->right = tree_insert(n->right, val);   /* そうでなければ右へ */\n    }\n    return n;\n}\n\nvoid tree_print(tree_node_t *n)   /* 原型と同じ順番 */\n{\n    if (n != NULL) {\n        printf(\" %d\", n->data);\n        tree_print(n->left);\n        tree_print(n->right);\n    }\n}\n\nvoid tree_delete(tree_node_t *n)\n{\n    if (n != NULL) {\n        tree_delete(n->left);\n        tree_delete(n->right);\n        free(n);\n    }\n}\n\nint main(void)\n{\n    tree_node_t *root = NULL;\n    int v[] = {5, 3, 8, 1, 4}, i;\n\n    for (i = 0; i < 5; i++) {\n        root = tree_insert(root, v[i]);\n    }\n    printf(\"[\");\n    tree_print(root);\n    printf(\" ]\\n\");\n    tree_delete(root);\n    return 0;\n}\n",
    m1: "#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct list_node_s {\n    int val;\n    struct list_node_s *next;\n} list_node_t;\n\nint main(void)\n{\n    list_node_t head = {0, NULL}, *n = &head, *p;\n    list_node_t *new_node = malloc(sizeof(list_node_t));\n    int k = 0;\n\n    new_node->val = 3;\n    n->next = new_node;           /* 順番が逆! */\n    new_node->next = n->next;     /* = new_node 自身を指してしまう */\n\n    for (p = head.next; p != NULL; p = p->next) {\n        printf(\" %d\", p->val);\n        if (++k == 8) { printf(\" ...(止まらない)\"); break; }\n    }\n    printf(\"\\n\");\n    free(new_node);\n    return 0;\n}\n",
    m3: "#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct list_node_s {\n    int val;\n    struct list_node_s *next;\n} list_node_t;\n\nint main(void)\n{\n    list_node_t head = {0, NULL}, *p;\n    list_node_t *a = malloc(sizeof(list_node_t));\n    a->val = 3; a->next = NULL; head.next = a;\n\n    /* 9 を探す: && の左右が逆 */\n    for (p = &head; p->next->val != 9 && p->next != NULL; p = p->next) {\n    }\n    printf(\"not reached\\n\");\n    free(a);\n    return 0;\n}\n",
    m4: "#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct list_node_s {\n    int val;\n    struct list_node_s *next;\n} list_node_t;\n\nint main(void)\n{\n    list_node_t *head_p = malloc(sizeof(list_node_t)), *p;\n    int i;\n    head_p->next = NULL;\n    for (i = 1; i <= 3; i++) {\n        p = malloc(sizeof(list_node_t));\n        p->val = i; p->next = head_p->next; head_p->next = p;\n    }\n    /* 全部 free したい */\n    for (p = head_p->next; p != NULL; p = p->next) {\n        free(p);              /* free した p の next を次で読む! */\n    }\n    free(head_p);\n    return 0;\n}\n",
    m5: "#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct tree_node_s {\n    struct tree_node_s *left;\n    struct tree_node_s *right;\n    int data;\n} tree_node_t;\n\ntree_node_t* tree_insert(tree_node_t *n, int val)\n{\n    if (n == NULL) {\n        n = malloc(sizeof(tree_node_t));\n        n->data = val; n->left = NULL; n->right = NULL;\n    }\n    else if (val < n->data) n->left = tree_insert(n->left, val);\n    else if (val > n->data) n->right = tree_insert(n->right, val);\n    return n;\n}\n\nint main(void)\n{\n    tree_node_t *root = NULL;\n    tree_insert(root, 5);      /* 戻り値を root に入れていない */\n    tree_insert(root, 3);\n    printf(\"%s\\n\", root == NULL ? \"root は NULL のまま\" : \"OK\");\n    return 0;\n}\n"
  };

  function hero(heroMem) {
    return h('section.u-hero',
      h('div.u-hero-grid',
        h('div',
          h('div.code-id', 'UNIT B6 — LINKED LIST & BINARY TREE'),
          h('h1', 'リスト処理', h('br'), h('em', 'p = p->next')),
          h('p.tag', '配列は「並べて置く」。リストは「矢印でつなぐ」。', h('br'), h('span', 'つなぎ方を変えるだけで, 挿入も削除も一瞬。でも探すのは先頭から。')),
          h('div.u-stats',
            h('div', h('b', '9'), '章'),
            h('div', h('b', '5+9'), '課題 (オプション含む)'),
            h('div', h('b', '5'), '予想問題')),
          h('div.cta',
            h('a.btn.ptr', { href: '#intro' }, '学習を始める', icon('arrow')),
            h('a.btn', { href: '#lab' }, '課題ラボへ'),
            h('a.btn.ghost', { href: '#report' }, 'レポート作成'))),
        heroMem()));
  }

  const chapters = [
    {
      id: 'intro', num: '00', group: 'はじめに', kicker: 'Algorithms + Data Structures', navTitle: 'データ構造の地図',
      title: 'アルゴリズム + データ構造 = プログラム。',
      lead: 'B5 のスタックに続いて, B6 では「リスト」と「二分木」を作る。どちらも malloc で 1 個ずつ借りた節点 (ノード) を, ポインタでつないだデータ構造。',
      blocks: [
        { type: 'callout', kind: 'info', html: '<b>この先の地図</b> (スライドより) — データ構造: スタック (B5) / <b>リスト (B6)</b> / <b>二分木 (B6)</b>。アルゴリズム: ソート (B7) / 探索・ハッシュ (B8)。今日作る list.c と tree.c は, この後の単元の土台になる。' },
        { type: 'point', n: 1, title: '配列は長さが<b>固定</b>, リストは長さを<b>自由に変えられる</b>', sub: '配列の途中に 1 個入れるには後ろを全部ずらす必要がある。リストは矢印 (next) を 2 本つなぎ替えるだけ。その代わり「k 番目」に直接飛べない。' },
      ],
    },
    {
      id: 'node', num: '01', group: '1. リスト', kicker: '自己参照構造体', navTitle: '節点と矢印',
      title: '自分と同じ型を指す, 構造体。',
      lead: '節点 = データ (val) + 次の節点への矢印 (next)。next の型は「自分と同じ構造体へのポインタ」— これを自己参照構造体と呼ぶ。',
      blocks: [
        { type: 'point', n: 2, title: '<code>struct list_node_s *next;</code> — 構造体の中で, 自分自身の型を指す', sub: 'typedef の名前 list_node_t は宣言が終わるまで使えないので, 中では <code class="ic">struct list_node_s</code> と書く。<code class="ic">_s</code> は structure, <code class="ic">_t</code> は type の印。' },
        { type: 'predict', id: 'p0', code: C.p0, hl: [12, 13, 14, 16], q: 'a → b → c とつないだ。<code class="ic">sizeof(list_node_t)</code> と <code class="ic">a.next-&gt;next-&gt;val</code> は? (このサイト / gcc 64bit)', choices: ['<code>8 20</code>', '<code>16 30</code>', '<code>12 30</code>'], answer: 1, explain: 'int (4) + ポインタ (8) = 12 だが, ポインタの位置合わせで <b>16</b> バイト。a.next は b の番地, その next は c の番地, その val は <b>30</b>。矢印を 2 回たどった。' },
        { type: 'tracer', code: C.p0, name: 'スライド「ポインタと矢印表現」', title: 'a.next には b の<b>番地</b>が入る。NULL (0) は「どこも指さない」= リストの終わり' },
      ],
    },
    {
      id: 'insert', num: '02', group: '1. リスト', kicker: '課題 6-1 insert_node', navTitle: '挿入 (2 行)',
      title: 'つなぎ替えは 2 行。順番がすべて。',
      lead: '先頭の節点は中身を持たない「ダミー (ヘッダ)」。だから空のリストでも head_p はいつも 1 個の節点を指していて, 「先頭への挿入」も「途中への挿入」も同じ insert_node で書ける。',
      blocks: [
        { type: 'point', n: 3, title: '<code>new_node-&gt;next = n-&gt;next;</code> → <code>n-&gt;next = new_node;</code>', sub: '(1) 新しい節点に「n の次だった節点」を覚えさせる → (2) n の矢印を新しい節点へ。逆にすると (1) の時点で n の次がもう new_node になっていて, 後ろが行方不明になる。' },
        { type: 'tracer', code: C.demo, name: 'スライド「insert_node()」', title: 'ダミーの直後に 3, 5, 4 を挿入 — ヒープに 16 バイトの節点が並び, next の矢印 (番地) が書き換わっていく' },
        { type: 'predict', id: 'p1', code: C.demo, hl: [31, 32, 33], q: 'ダミーの直後に 3 → 5 → 4 の順で挿入して表示。出力は?', placeholder: '例:  3 5 4', explain: 'いつも<b>ダミーの直後 = 先頭</b>に入れるので, 後から入れたものほど前に来る。答えは <b> 4 5 3</b> (list1test.c の動作例と同じ並び)。' },
        { type: 'mistakes', items: [
          { title: 'つなぎ替えの順番が逆', code: C.m1, fix: 'n->next を先に new_node にすると, 次の行の n->next はもう new_node — 自分自身を指す輪ができ, 表示が終わらない。<b>先に新しい節点の next を設定</b>してから n をつなぎ替える。' },
        ] },
        { type: 'callout', kind: 'tip', html: '<b>list_print</b>: <code class="ic">for (p = head_p-&gt;next; p != NULL; p = p-&gt;next)</code> — ダミーは表示しないので <b>head_p-&gt;next から</b>。<code class="ic">printf("[");</code> → 各要素 <code class="ic">" %d"</code> → <code class="ic">" ]\\n"</code>。' },
      ],
    },
    {
      id: 'traverse', num: '03', group: '1. リスト', kicker: '課題 6-2, 6-3 走査', navTitle: '走査の 3 つの型',
      title: 'for 文 1 本で, 先頭から順にたどる。',
      lead: '配列の for (i=0; i<n; i++) に当たるのが for (p = …; p != NULL; p = p->next)。目的によって 3 つの型を使い分ける。',
      blocks: [
        { type: 'point', n: 4, title: '型 A: <code>p = head_p-&gt;next; p != NULL</code> — 各節点を見る (print, find)', sub: '見つけたら <code class="ic">return p;</code>, 最後まで無ければ <code class="ic">return NULL;</code>。list_insert_uniq は find して無いときだけ list_insert。' },
        { type: 'point', n: 5, title: '型 B: <code>p = head_p; p-&gt;next != NULL</code> で <code>p-&gt;next-&gt;val</code> を見る — <b>先読み</b>', sub: '見つかった時点で p は目的の節点の<b>直前</b>。削除 (remove_node(p)) や「p の直後に挿入」(昇順挿入) にそのまま使える。ダミーから始めるので先頭の節点も特別扱い不要。' },
        { type: 'predict', id: 'p2', code: C.p2, hl: [28, 29, 30, 31], q: 'リストは [ 4 9 2 7 ]。先読みで値 2 を探して break。<code class="ic">p-&gt;val</code> と <code class="ic">cnt</code> は?', placeholder: '例: 2 3', explain: 'p はダミー → 4 → 9 と進み, p が 9 のとき p->next->val が 2 になって止まる。p は 2 の<b>直前</b>の 9, 進んだ回数は 2。答えは <b>9 2</b>。' },
        { type: 'mistakes', items: [
          { title: '&& の左右が逆', code: C.m3, fix: '末尾で p->next が NULL になったとき, 先に <code class="ic">p-&gt;next-&gt;val</code> を読んでしまう。<b>&& は左から評価され, 左が偽なら右は評価されない</b>ので, <code class="ic">p-&gt;next != NULL &amp;&amp; p-&gt;next-&gt;val != 9</code> の順に書く。' },
        ] },
      ],
    },
    {
      id: 'delete', num: '04', group: '1. リスト', kicker: '課題 6-5 削除', navTitle: '削除 remove_node',
      title: '消すには, 1 つ手前の節点が要る。',
      lead: 'remove_node(p) は「p の直後」を外して free する。目的の節点 q そのものではなく, その直前の p を渡すのがポイント — 片方向リストは後ろへしか進めないから。',
      blocks: [
        { type: 'point', n: 6, title: '<code>p-&gt;next = old-&gt;next; free(old);</code>', sub: 'p の矢印を「消す節点の次」へ付け替えてから返却。6-5 は list_find で q を見つけた後, もう一度ダミーから <code class="ic">p-&gt;next != q</code> の間進めて直前 p を求める (2 回走査)。オプション 6-6 は先読みで 1 回に。' },
        { type: 'predict', id: 'p3', code: C.p3, hl: [34], q: 'リストは [ 4 5 3 ]。<code class="ic">remove_node(head_p-&gt;next)</code> の後の表示は?', choices: ['<code> 5 3</code> — 先頭の 4 が消える', '<code> 4 3</code>', '<code> 4 5</code>'], answer: 1, explain: 'head_p->next は 4 の節点。remove_node はその<b>直後</b>, つまり 5 を消す → <b> 4 3</b>。先頭の 4 を消したいなら remove_node(head_p) — ダミーがあるから先頭も同じ関数で消せる。' },
        { type: 'mistakes', items: [
          { title: 'free した節点の next を読む', code: C.m4, fix: 'for の更新 <code class="ic">p = p-&gt;next</code> は free の<b>後</b>に実行される。返却済みの領域を読むことになる。list_delete のように <code class="ic">next = p-&gt;next;</code> を先に取っておいてから free する。' },
        ] },
      ],
    },
    {
      id: 'time', num: '05', group: '1. リスト', kicker: '課題 6-4 計算時間', navTitle: '計算時間 O(n)',
      title: 'n が 5 倍なら, 1 個あたりも 5 倍。',
      lead: 'list_find は先頭から 1 つずつ見ていく。n 個入ったリストなら平均 n/2 個 (見つからなければ n 個)。だから 1 回の時間は n に比例し, n 回行う合計は n² に比例する。',
      blocks: [
        { type: 'point', n: 7, title: '<code>clk_start = clock();</code> … <code>(double)(clk_end-clk_start)/CLOCKS_PER_SEC</code>', sub: '<code class="ic">&lt;time.h&gt;</code> が必要。clock() はプログラムが使った CPU 時間。乱数は myrand_init() でいつも同じ系列を作り直せるので, 「(1) と同じ乱数」で検索できる。' },
        { type: 'callout', kind: 'info', html: '<b>このサイトのインタプリタはブラウザ内で動くので, gcc より数百倍遅い</b>。課題ラボでは n = 200 で動作だけ確かめ, 本番の計測は gcc (<code class="ic">gcc list4time.c list.c myrand.c</code> → <code class="ic">echo 10000 | ./a.out</code>) で行おう。課題ラボの「考察」欄に, サンドボックスの gcc で測った表があります。' },
        { type: 'callout', kind: 'tip', html: '<b>考察の書き方</b>: 「合計時間」ではなく「<b>1 個あたり = 合計 ÷ n</b>」を n ごとに並べる。n を 2 倍にしたとき 1 個あたりも約 2 倍 → O(n)。ほぼ変わらない → O(1) や O(log n)。その理由を「1 回の操作で何個の節点を見るか」で説明する。' },
      ],
    },
    {
      id: 'tree', num: '06', group: '2. 二分木', kicker: '課題 6-9 二分探索木', navTitle: '二分木',
      title: '小さければ左, 大きければ右。',
      lead: '二分木の節点は矢印を 2 本 (left, right) 持つ。「左の子孫 < 自分 < 右の子孫」を守って入れておくと, 探すときに毎回半分を捨てられる — 二分探索木。',
      blocks: [
        { type: 'point', n: 8, title: '<code>root = tree_insert_uniq(root, v);</code> — 再帰で空き (NULL) を探して作る', sub: 'NULL に着いたら create_node して返し, 親がそれを left / right に受け取る。原型の最後の else は「大きいか<b>等しい</b>」なので, 6-9 では <code class="ic">else if (val &gt; n-&gt;data)</code> にして等しいときは何もしない。' },
        { type: 'tracer', code: C.tree, name: '教科書 6.2.1 二分木', title: '5, 3, 8, 1, 4 を挿入 — ヒープに 24 バイトの節点ができ, left / right の番地でつながる' },
        { type: 'predict', id: 'p4', code: C.tree, hl: [30, 31, 32], q: '原型の tree_print (自分 → 左 → 右) で, 5, 3, 8, 1, 4 を入れた木を表示すると?', choices: ['<code>[ 1 3 4 5 8 ]</code>', '<code>[ 5 3 1 4 8 ]</code>', '<code>[ 5 3 8 1 4 ]</code>'], answer: 1, explain: '根 5 → 左の部分木 (3 → 1 → 4) → 右の部分木 (8) の順で <b>[ 5 3 1 4 8 ]</b> (先行順)。課題 6-9 で printf を 2 つの再帰の<b>間</b>に移す (左 → 自分 → 右 = 中間順) と, 昇順 [ 1 3 4 5 8 ] になる。' },
        { type: 'mistakes', items: [
          { title: '戻り値を root に入れ忘れる', code: C.m5, fix: 'root が NULL のとき, tree_insert の中で作った節点の番地は<b>戻り値でしか</b>外に出てこない (引数 n は値渡しのコピー)。必ず <code class="ic">root = tree_insert_uniq(root, v);</code>。' },
        ] },
        { type: 'callout', kind: 'tip', html: '<b>tree_find (オプション 6-10)</b> は再帰しなくても書ける: <code class="ic">while (n != NULL) { if (val == n-&gt;data) return n; n = (val &lt; n-&gt;data) ? n-&gt;left : n-&gt;right; }</code>。たどるのは根から 1 本の道だけ — ランダムな入力なら長さ約 log₂n。n = 25000 でも 15 回ほど。' },
      ],
    },
    {
      id: 'summary', num: '07', group: 'まとめ', kicker: 'Cheat sheet', navTitle: 'チートシート',
      title: 'B6 を 6 枚で。',
      blocks: [
        { type: 'cheat', items: [
          { c: 'struct list_node_s *next;', d: '自己参照構造体。中では typedef 名ではなく struct 名で書く。', code: 'typedef struct list_node_s {\n  int val;\n  struct list_node_s *next;\n} list_node_t;' },
          { c: 'insert_node(n, v)', d: 'n の直後に挿入。<b>新しい節点の next が先</b>。', code: 'new_node->next = n->next;\nn->next = new_node;' },
          { c: 'for (p = head_p->next; p; …)', d: '各節点を見る (print / find)。ダミーは飛ばす。', code: 'for (p = head_p->next; p != NULL; p = p->next)\n  if (p->val == val) return p;\nreturn NULL;' },
          { c: 'p->next->val (先読み)', d: '直前の節点 p を保ったまま探す。削除・昇順挿入に。', code: 'for (p = head_p; p->next != NULL; p = p->next)\n  if (p->next->val == val) { remove_node(p); … }' },
          { c: 'O(n) と O(log n)', d: 'リストの探索は 1 回 O(n), n 回で n²。二分探索木は 1 回 O(log n)。', code: '/* n: 5000 → 25000 (5 倍) */\n/* list: 1 個あたり 約 5 倍 */\n/* tree: ほぼ変わらない */' },
          { c: 'root = tree_insert_uniq(root, v)', d: '小さければ左・大きければ右・等しければ何もしない。表示は左→自分→右。', code: 'if (n != NULL) {\n  tree_print(n->left);\n  printf(" %d", n->data);\n  tree_print(n->right);\n}' },
        ] },
      ],
    },
    {
      id: 'lab', num: '08', group: '課題', kicker: 'Assignment Lab', navTitle: '課題ラボ',
      title: 'つないで, たどって, 外す。',
      lead: '表示の diff に加えて, 表に出ない「戻り値」(find が NULL を返すか, 削除時に NULL か…) を隠しテストで確かめます。free 忘れも検出。コードとメモは自動保存。',
      blocks: [
        { type: 'callout', kind: 'tip', html: '<b>list.c は 6-1〜6-5 とオプション 6-6〜6-8 で, tree.c は 6-9〜6-11 で共通</b>のファイルです。どのタブで書いても同じ内容が保存されます。提出する list.c は最後まで進めた完成版を。「メモリで追う」ではヒープに節点が 1 つずつ現れ, next の番地でつながる様子が見えます。' },
        { type: 'lab' },
      ],
    },
    {
      id: 'report', num: '09', group: '課題', kicker: 'Report', navTitle: 'レポート作成',
      title: 'レポートを, 自動で組み立てる。',
      lead: '課題ラボの実行結果と「工夫した点」「感想」「考察」のメモから, B5 と同じ形式のレポート (B6.txt) を生成します。6-1 と 6-9 は資料の指示どおり「遂行状況・実行結果・感想」のみ。',
      blocks: [{ type: 'report' }],
    },
  ];

  window.UNITS.b6 = {
    title: 'リスト処理', source: '[B6] リスト処理 / B6 講義スライド', hero, chapters, tasks: window.B6_TASKS || [],
    predictCount: 5,
  };
})();
