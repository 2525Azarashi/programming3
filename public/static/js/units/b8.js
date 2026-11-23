/* =========================================================================
 *  B8 二分探索とハッシュ — 章コンテンツ
 *  出典: 配布資料「[B8] 二分探索とハッシュ」と講義スライド「B8.pdf」
 * ========================================================================= */
(function () {
  'use strict';
  const { h, icon } = U;
  const W = window.B8_CODE || {};

  const C = {
    rec_tr: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define KEY_LEN 3
#define MAX_RECORDS 4

typedef struct {
    char key[KEY_LEN + 1];
    char *data;
} record_t;

typedef struct {
    int n;
    record_t record[MAX_RECORDS];
} db_t;

int main(void)
{
    db_t db;
    int i;
    db.n = 0;
    for (i = 0; i < MAX_RECORDS; i++) {
        strcpy(db.record[i].key, "");
        db.record[i].data = NULL;
    }

    strcpy(db.record[0].key, "AAC");
    db.record[0].data = malloc(sizeof(char) * (strlen("Al Arish") + 1));
    strcpy(db.record[0].data, "Al Arish");
    db.n++;

    strcpy(db.record[1].key, "ITM");
    db.record[1].data = malloc(sizeof(char) * (strlen("Osaka Itami") + 1));
    strcpy(db.record[1].data, "Osaka Itami");
    db.n++;

    for (i = 0; i < MAX_RECORDS; i++) {
        printf("[%4d]", i);
        if (db.record[i].data != NULL) {
            printf(" %s %s", db.record[i].key, db.record[i].data);
        }
        printf("\\n");
    }

    for (i = 0; i < MAX_RECORDS; i++) {
        free(db.record[i].data);
    }
    return 0;
}
`,
    p_dump: `#include <stdio.h>
#include <string.h>

typedef struct {
    char key[4];
    char *data;
} record_t;

int main(void)
{
    record_t r[3];
    int i, shown = 0;
    strcpy(r[0].key, "AAC"); r[0].data = "Egypt";
    strcpy(r[1].key, "");    r[1].data = NULL;
    strcpy(r[2].key, "KIX"); r[2].data = "Osaka";

    for (i = 0; i < 3; i++) {
        if (r[i].data != NULL) {
            shown++;
        }
    }
    printf("%d %s\\n", shown, r[2].key);
    return 0;
}
`,
    bsearch_tr: `#include <stdio.h>
#include <string.h>

typedef struct {
    char key[4];
    char *data;
} record_t;

char *bsearch_demo(int n, record_t r[], char key[])
{
    int low = 0, high = n - 1, mid, cmp;
    while (low <= high) {
        mid = (low + high) / 2;
        cmp = strcmp(r[mid].key, key);
        if (cmp == 0) { return r[mid].data; }
        else if (cmp < 0) { low = mid + 1; }
        else { high = mid - 1; }
    }
    return NULL;
}

int main(void)
{
    record_t r[6] = {
        {"AAC", "Egypt"}, {"FCO", "Rome"}, {"ITM", "Itami"},
        {"JFK", "NewYork"}, {"KIX", "Kansai"}, {"NRT", "Narita"}
    };
    char *ans = bsearch_demo(6, r, "KIX");
    printf("%s\\n", ans != NULL ? ans : "NO RECORD");
    return 0;
}
`,
    p_bsearch: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char keys[6][4] = {"AAC", "FCO", "ITM", "JFK", "KIX", "NRT"};
    int low = 0, high = 5, mid, steps = 0;

    while (low <= high) {
        mid = (low + high) / 2;
        steps++;
        if (strcmp(keys[mid], "JFK") == 0) { break; }
        else if (strcmp(keys[mid], "JFK") < 0) { low = mid + 1; }
        else { high = mid - 1; }
    }
    printf("%d %d\\n", mid, steps);
    return 0;
}
`,
    p_hash: `#include <stdio.h>

int db_hash_f(char key[])
{
    int i, v = 0;
    for (i = 0; key[i] != '\\0'; i++) {
        v = (v << 5) + (key[i] - 'A');
    }
    return v % 16;
}

int main(void)
{
    printf("%d %d\\n", db_hash_f("AAC"), db_hash_f("AAB"));
    return 0;
}
`,
    hash_tr: `#include <stdio.h>
#include <string.h>

#define M 8

typedef struct {
    char key[4];
    char *data;
} record_t;

int hash_f(char key[])
{
    int i, v = 0;
    for (i = 0; key[i] != '\\0'; i++) { v = (v << 5) + (key[i] - 'A'); }
    return v % M;
}

void put(record_t tbl[], char key[], char *data)
{
    int h = hash_f(key);
    while (tbl[h].data != NULL) {
        h = (h + 1) % M;
    }
    strcpy(tbl[h].key, key);
    tbl[h].data = data;
}

char *get(record_t tbl[], char key[])
{
    int h = hash_f(key), cnt = 0;
    while (tbl[h].data != NULL && cnt < M) {
        if (strcmp(tbl[h].key, key) == 0) { return tbl[h].data; }
        h = (h + 1) % M;
        cnt++;
    }
    return NULL;
}

int main(void)
{
    record_t tbl[M];
    int i;
    for (i = 0; i < M; i++) { strcpy(tbl[i].key, ""); tbl[i].data = NULL; }

    put(tbl, "AAC", "Egypt");   /* h = 2 */
    put(tbl, "PEK", "Beijing"); /* h = 3 */
    put(tbl, "NRT", "Narita");  /* h = 3 -> 衝突! 4 へ */

    printf("NRT => %s\\n", get(tbl, "NRT"));
    return 0;
}
`,
    p_probe: `#include <stdio.h>
#include <string.h>

int main(void)
{
    /* 添字 0..4 の 5 枠テーブル ("---" は空スロット) */
    char tbl[5][4] = {"SFO", "---", "AAC", "FCO", "JRO"};
    /* 本来 h = 3 だったキー "SFO" が 3 -> 4 -> 0 と巡回して [0] に入っている */
    int h = 3, probes = 0;

    while (strcmp(tbl[h], "---") != 0) {
        probes++;
        if (strcmp(tbl[h], "SFO") == 0) { break; }
        h++;
        if (h == 5) { h = 0; }
    }
    printf("%d %d\\n", h, probes);
    return 0;
}
`,
    m_streq: `#include <stdio.h>

int main(void)
{
    char k1[4] = "KIX";
    char k2[4] = "KIX";
    /* 文字列を == で比べると「中身」ではなく「配列の先頭番地」の比較になる! */
    if (k1 == k2) printf("一致!\\n");
    else printf("不一致! (別の箱なので番地が違う)\\n");
    return 0;
}
`,
    m_lt: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char keys[3][4] = {"AAC", "ITM", "KIX"};
    int low = 0, high = 2, mid, found = -1;
    /* バグ: low < high だと low == high (最後の1件 "KIX") を調べずに終わる! */
    while (low < high) {
        mid = (low + high) / 2;
        if (strcmp(keys[mid], "KIX") == 0) { found = mid; break; }
        else if (strcmp(keys[mid], "KIX") < 0) { low = mid + 1; }
        else { high = mid - 1; }
    }
    printf("found = %d (本来は 2 なのに見つからない!)\\n", found);
    return 0;
}
`,
    m_wrap: `#include <stdio.h>

int main(void)
{
    int m = 16;
    int h = 15; /* 配列の最後の枠 record[15] が埋まっていたとき… */
    h++;
    /* if (h == m) h = 0; を忘れると record[16] で配列外アクセス! */
    printf("そのまま h++ すると h = %d (範囲 0..15 を飛び出す!)\\n", h);
    h = h % m;
    printf("巡回させると h = %d (先頭に戻る!)\\n", h);
    return 0;
}
`,
  };

  function hero(heroMem) {
    return h('section.u-hero',
      h('div.u-hero-grid',
        h('div',
          h('div.code-id', 'UNIT B8 — BINARY SEARCH & HASH'),
          h('h1', '二分探索とハッシュ', h('br'), h('em', 'O(n) → O(log n) → O(1)')),
          h('p.tag', '世界の 2,700 空港から、たった一瞬で目的の空港を引き当てる。', h('br'), h('span', '順番に探す線形探索、半分ずつ絞る二分探索、番地を計算するハッシュ法。')),
          h('div.u-stats',
            h('div', h('b', '8'), '章'),
            h('div', h('b', '8+1'), '課題 (8-6は2問 + Opt)'),
            h('div', h('b', '4'), '予想問題')),
          h('div.cta',
            h('a.btn.ptr', { href: '#intro' }, '学習を始める', icon('arrow')),
            h('a.btn', { href: '#lab' }, '課題ラボへ'),
            h('a.btn.ghost', { href: '#report' }, 'レポート作成'))),
        heroMem()));
  }

  const chapters = [
    {
      id: 'intro', num: '00', group: 'はじめに', kicker: 'Overview & Memory Structure', navTitle: '探索の地図とメモリ構造',
      title: '2,700 件の空港データベースをどう記憶し, どう探すか。',
      lead: 'B8 では全世界の空港コード (KIX, ITM, NRT, JFK…) を構造体配列 db_t に格納して高速に検索するプログラム iata_db.c を完成させる。まずは 3 つの探索法の全体像と、ヒープを使ったレコードのメモリ構造を目で掴もう。',
      blocks: [
        { type: 'widget', make: () => W.essenceMap && W.essenceMap() },
        { type: 'widget', make: () => W.dbAnatomyLab && W.dbAnatomyLab() },
        { type: 'point', n: 1, title: '<code>key[4]</code> は構造体の中に直置き、<code>char *data</code> はヒープを指すポインタ', sub: '空港コードは必ず 3 文字なので <code class="ic">char key[KEY_LEN+1]</code> (4B) の固定配列。一方、空港の詳細名は長さが様々なので <code class="ic">record_set</code> 内で <code class="ic">malloc(sizeof(char)*(strlen(data)+1))</code> でちょうどの長さを借りて指す。未使用枠は <code class="ic">db_init</code> により <b><code class="ic">data == NULL</code></b> になっている。' },
        { type: 'callout', kind: 'info', html: '<b><code class="ic">#define __USE_MINI__</code> によるテスト切替:</b> <code class="ic">iata_db.h</code> 冒頭の <code class="ic">#define __USE_MINI__</code> が有効なら 10 空港の小型版 (<code class="ic">iata_mini.csv</code>, <code class="ic">MAX_RECORDS=16</code>)、コメントアウトすると 2,700 空港のフルセット版 (<code class="ic">iata_data.csv</code>, <code class="ic">MAX_RECORDS=6000</code>) に自動で切り替わります。' },
      ],
    },
    {
      id: 'linear', num: '01', group: '1. 線形探索 O(n)', kicker: '課題 8-1, 8-2 線形探索', navTitle: 'db_dump と線形探索',
      title: '全枠ダンプで中身を可視化し, 先頭から順に照合する。',
      lead: 'まずはデータベースの中身を丸ごと表示する db_dump (課題 8-1) と、record[0] から順番に strcmp で探す db_linear_search (課題 8-2) を作る。',
      blocks: [
        { type: 'point', n: 2, title: '<code>db_dump</code> は <code>0</code>〜<code>MAX_RECORDS-1</code> を回し、<code>data != NULL</code> のときだけ中身を表示', sub: 'あとで作るハッシュ法ではデータが <code class="ic">0〜db-&gt;n-1</code> に詰まらず飛び飛びに配置される。だから <code class="ic">db_dump</code> は必ず <code class="ic">MAX_RECORDS</code> まで回し、<code class="ic">data == NULL</code> の空枠は <code class="ic">[  10]</code> のように添字だけ出して改行する。' },
        { type: 'predict', id: 'p0', code: C.p_dump, hl: [17, 18, 19], q: '3 枠のうち <code class="ic">r[1].data</code> だけ <code class="ic">NULL</code> のとき、出力はどうなる?', choices: ['<code>2 KIX</code>', '<code>3 KIX</code>', '<code>2 AAC</code>'], answer: 0, explain: '<code class="ic">r[0].data</code> と <code class="ic">r[2].data</code> の 2 つが非 NULL なので <code class="ic">shown</code> は <b>2</b>、<code class="ic">r[2].key</code> は <b>KIX</b> です。' },
        { type: 'tracer', code: C.rec_tr, name: 'db_init → malloc格納 → db_dump → db_delete', title: 'record[i].data がヒープの文字列を指し、NULL 枠は添字だけ出力される流れを追う' },
        { type: 'mistakes', items: [
          { title: '文字列キーを key == db->record[i].key で比較してしまう', code: C.m_streq, fix: '<code class="ic">==</code> は文字の中身ではなく<b>配列の先頭番地どうし</b>を比較するため、同じ <code class="ic">"KIX"</code> が入っていても常に偽になります! 文字列の一致は必ず <code class="ic">strcmp(db-&gt;record[i].key, key) == 0</code> を使います。' },
        ] },
      ],
    },
    {
      id: 'binary', num: '02', group: '2. 二分探索 O(log n)', kicker: '課題 8-4 二分探索 ★T2必出', navTitle: '二分探索',
      title: '中央のキーと比べて, 毎回候補を 1/2 に絞り込む。',
      lead: 'iata_mini.csv も iata_data.csv も、あらかじめ空港コードの昇順 (辞書順) にソートされている。この性質を使えば、中央 mid との 1 回の比較で探索範囲を半分ずつ捨てられる!',
      blocks: [
        { type: 'widget', make: () => W.binarySearchLab && W.binarySearchLab() },
        { type: 'point', n: 3, title: '<code>while (low &lt;= high)</code> と <code>strcmp(record[mid].key, key)</code> の符号対応', sub: '① <code class="ic">cmp == 0</code>: 一致! <code class="ic">record[mid].data</code> を返す。<br>② <code class="ic">cmp &lt; 0</code>: <code class="ic">record[mid].key &lt; key</code> (目的のキーは中央より<b>後ろ</b>) → <code class="ic">low = mid + 1;</code><br>③ <code class="ic">cmp &gt; 0</code>: <code class="ic">key &lt; record[mid].key</code> (目的のキーは中央より<b>前</b>) → <code class="ic">high = mid - 1;</code>' },
        { type: 'predict', id: 'p1', code: C.p_bsearch, hl: [9, 10, 12, 13, 14], q: '6 空港 <code class="ic">{"AAC","FCO","ITM","JFK","KIX","NRT"}</code> から <code class="ic">"JFK"</code> を二分探索! 見つかったときの <code class="ic">mid</code> と比較回数 <code class="ic">steps</code> は?', choices: ['<code>3 3</code>', '<code>3 2</code>', '<code>3 4</code>'], answer: 0, explain: '1回目: low=0, high=5 → mid=2 ("ITM" &lt; "JFK") で low=3。2回目: low=3, high=5 → mid=4 ("KIX" &gt; "JFK") で high=3。3回目: low=3, high=3 → <b>mid=3 ("JFK")</b> で一致! よって出力は <b>3 3</b> (ここで <code class="ic">low &lt;= high</code> のイコールが効いています!)。' },
        { type: 'tracer', code: C.bsearch_tr, name: '二分探索 db_binary_search', title: 'low と high が mid を挟んで半分ずつ歩み寄り、"KIX" を引き当てるステップ実行' },
        { type: 'mistakes', items: [
          { title: 'ループ条件を while (low < high) にして最後の1件を取りこぼす', code: C.m_lt, fix: '<code class="ic">low == high</code> は「候補が残り 1 件に絞られた」状態で、まだその 1 件を調べていません! <code class="ic">low &lt; high</code> にすると先頭や末尾の要素が見つからなくなります。必ず <b><code class="ic">while (low &lt;= high)</code></b> と書きます。' },
        ] },
      ],
    },
    {
      id: 'hash', num: '03', group: '3. ハッシュ法 O(1)', kicker: '課題 8-6 クローズドハッシュ法', navTitle: 'ハッシュ関数と衝突解決',
      title: 'キーから格納番地を直接計算し, 衝突したら隣へずらす。',
      lead: '検索の平均計算時間を O(1) に短縮するのがハッシュ法! 空港コードの3文字から 0〜MAX_RECORDS-1 の整数 h を計算し、配列の h 番目に直接アクセスする。',
      blocks: [
        { type: 'widget', make: () => W.hashCollisionLab && W.hashCollisionLab() },
        { type: 'point', n: 4, title: '<code>v = (v &lt;&lt; 5) + (key[i] - \'A\')</code> — 32進数として整数化し <code>% MAX_RECORDS</code>', sub: '左に 5 ビットシフト (<code class="ic">v &lt;&lt; 5</code>) は <b>32 倍</b>と同じ。英大文字 A〜Z (0〜25) が 5 ビットに収まるため、3 文字が重ならず別々のビット位置に展開されて衝突しにくくなる。' },
        { type: 'predict', id: 'p2', code: C.p_hash, hl: [6, 7, 8], q: '<code class="ic">db_hash_f("AAC")</code> と <code class="ic">db_hash_f("AAB")</code> の出力は? (ヒント: \'A\'-\'A\'=0, \'B\'-\'A\'=1, \'C\'-\'A\'=2)', placeholder: '例: 2 1', explain: '1文字目 \'A\' で v=0、2文字目 \'A\' でも (0&lt;&lt;5)+0 = 0、3文字目で "AAC" は 0+2 = 2、"AAB" は 0+1 = 1。16 で割った余りもそのまま <b>2 1</b> です!' },
        { type: 'point', n: 5, title: 'クローズドハッシュの鉄則: 格納は空き (<code>data == NULL</code>) まで <code>h++</code>、検索も <code>data == NULL</code> で打ち切る', sub: '<code class="ic">h</code> が配列末尾 <code class="ic">MAX_RECORDS</code> に達したら <code class="ic">0</code> に戻す (巡回)。検索時に空スロットに出会ったら「もし登録されていたらこの空枠に入っていたはず = 存在しない」と即座に分かる! 通常は衝突を抑えるため配列サイズ <code class="ic">m</code> をデータ数 <code class="ic">n</code> の約 2 倍以上 (<code class="ic">6000 &gt; 2 × 2700</code>) に取る。' },
        { type: 'predict', id: 'p3', code: C.p_probe, hl: [11, 12, 13, 14, 15], q: '本来のハッシュ値が 3 だった <code class="ic">"SFO"</code> が 3 → 4 → 0 と巡回して <code class="ic">tbl[0]</code> に入っている。検索終了時の <code class="ic">h</code> と比較回数 <code class="ic">probes</code> は?', choices: ['<code>0 3</code>', '<code>0 2</code>', '<code>4 2</code>'], answer: 0, explain: 'h=3 ("FCO") で 1 回目 → h=4 ("JRO") で 2 回目 → h=5 になって <b>h=0 に巡回</b> → h=0 ("SFO") で 3 回目に一致して break! よって出力は <b>0 3</b> です。' },
        { type: 'tracer', code: C.hash_tr, name: 'クローズドハッシュの衝突と巡回探索', title: 'NRT が PEK と衝突して隣の枠へ入り、検索時に同じ道をたどって発見される様子' },
        { type: 'mistakes', items: [
          { title: 'h++ のあとに末尾 MAX_RECORDS から 0 へ戻す処理を忘れる', code: C.m_wrap, fix: '配列の添字は <code class="ic">0 〜 MAX_RECORDS - 1</code> なので、<code class="ic">h == MAX_RECORDS</code> になったら必ず <code class="ic">h = 0;</code> (または <code class="ic">h = (h + 1) % MAX_RECORDS;</code>) で先頭に折り返します (<code class="ic">test6-exp.txt</code> の SFO がまさにこれで [0] に入ります!)。' },
        ] },
      ],
    },
    {
      id: 'cpu', num: '04', group: '4. 計算時間とオープンハッシュ', kicker: '課題 8-3, 8-5, 8-7 CPU時間比較', navTitle: '3手法の計算時間比較',
      title: 'O(n) vs O(log n) vs O(1) — 2,700 件での実測対決。',
      lead: '課題 8-3 (線形), 8-5 (二分), 8-7 (ハッシュ) では、同じ 10 個の空港コードに対して 10 万回検索を繰り返し、clock() で CPU 時間を実測して比較する。',
      blocks: [
        { type: 'widget', make: () => W.benchExplorer && W.benchExplorer() },
        { type: 'callout', kind: 'tip', html: '<b>レポート考察 (8-3, 8-5, 8-7) の黄金テンプレート:</b><br>① <b>線形探索 (8-3):</b> 先頭 <code class="ic">AAC</code> は 1 回で終わるが、500番目 → 2700番目 (<code class="ic">ZYL</code>) と後ろに行くほど比較回数が比例して増え (<code class="ic">O(n)</code>)、未登録キー (<code class="ic">AAA, LLL, ZZZ</code>) は常に全 2,700 件調べる最悪時間になる。<br>② <b>二分探索 (8-5):</b> どの位置のキーでも未登録キーでも <b>9〜12 回の比較 (<code class="ic">log₂2700 ≈ 11.4</code>, <code class="ic">O(log n)</code>)</b> でほぼ一定時間となり、末尾付近では線形探索の約 150 倍以上速い。<br>③ <b>ハッシュ法 (8-7):</b> 大半のキーで<b>比較 1 回 (<code class="ic">O(1)</code>)</b> で即座に終わり二分探索よりさらに数倍速い。ただし <code class="ic">YFB</code> のように衝突が集中する場所では複数回のプローブが発生する。' },
      ],
    },
    {
      id: 'openhash', num: '05', group: '4. 計算時間とオープンハッシュ', kicker: 'オプション課題 8-1 オープンハッシュ法', navTitle: 'オープンハッシュ法',
      title: 'ハッシュ × 線形リスト — 隣の部屋を邪魔しない設計。',
      lead: 'オプション課題 8-1 では record_t に自己参照ポインタ struct record_s *next を追加し、ハッシュ値ごとに線形リストをつなぐオープンハッシュ法 (チェイン法) を iata_db2.c に実装する。',
      blocks: [
        { type: 'widget', make: () => W.openHashLab && W.openHashLab() },
        { type: 'point', n: 6, title: '<code>db-&gt;record[h]</code> をダミー頭節点にし、<code>db_delete</code> では文字列と節点の 2 つを <code>free</code>!', sub: 'B6 で学んだダミー節点付きリストがそのまま使える! <code class="ic">db_hash_load</code> では <code class="ic">node = malloc(sizeof(record_t))</code> を <code class="ic">db-&gt;record[h].next</code> の先頭に挿入し、<code class="ic">db_delete</code> では各バケットのリストをたどって <code class="ic">free(p-&gt;data); free(p);</code> の両方を解放する。' },
      ],
    },
    {
      id: 'summary', num: '06', group: 'まとめ', kicker: 'Cheat sheet', navTitle: 'チートシート',
      title: 'B8 を 6 枚で。',
      blocks: [
        { type: 'cheat', items: [
          { c: 'db_dump (8-1)', d: '<b>0〜MAX_RECORDS-1</b> 全枠を走査。data != NULL のときだけ key と data を表示。', code: 'for (i=0; i<MAX_RECORDS; i++) {\n  printf("[%4d]", i);\n  if (db->record[i].data != NULL)\n    printf(" %s %s", ...);\n  printf("\\n");\n}' },
          { c: '線形探索 (8-2)', d: '0〜db->n-1 を順に strcmp == 0 で照合。平均・最悪ともに <b>O(n)</b>。', code: 'for (i=0; i<db->n; i++)\n  if (strcmp(db->record[i].key, key)==0)\n    return db->record[i].data;\nreturn NULL;' },
          { c: '二分探索 (8-4 ★T2必出)', d: '<b>昇順ソート済み</b>が前提。low<=high の間 mid=(low+high)/2 で半分に絞る <b>O(log n)</b>。', code: 'while (low <= high) {\n  mid = (low + high) / 2;\n  cmp = strcmp(db->record[mid].key, key);\n  if (cmp == 0) return ...;\n  else if (cmp < 0) low = mid + 1;\n  else high = mid - 1;\n}' },
          { c: 'ハッシュ関数 (8-6)', d: '文字コードを 5bit シフト (×32) で重ね、MAX_RECORDS の剰余を返す。', code: 'for (i=0; key[i]!=\'\\0\'; i++)\n  v = (v<<5) + (key[i]-\'A\');\nreturn v % MAX_RECORDS;' },
          { c: 'クローズドハッシュ (8-6)', d: '衝突時は空き (data==NULL) まで (h+1)%m で進む。検索も <b>data==NULL で即終了</b>。平均 <b>O(1)</b>。', code: 'while (db->record[h].data != NULL\n       && cnt < MAX_RECORDS) {\n  if (strcmp(...) == 0) return ...;\n  h = (h + 1) % MAX_RECORDS; cnt++;\n}' },
          { c: 'オープンハッシュ (Opt 8-1)', d: 'record[h] をダミー頭節点にして next で線形リスト連結。解放時は p->data と p の両方 free。', code: 'for (p = db->record[h].next;\n     p != NULL; p = p->next)\n  if (strcmp(p->key, key) == 0)\n    return p->data;' },
        ] },
      ],
    },
    {
      id: 'lab', num: '07', group: '課題', kicker: 'Assignment Lab', navTitle: '課題ラボ',
      title: '書いて, 探して, 2,700 空港を制覇する。',
      lead: '課題 (8-1)〜(8-7) は同じ iata_db.c を段階的に育てていきます (最終的に完成した iata_db.c が提出対象!)。小型版とフルセット版の両方の自動 diff・メモリリーク検査・T2 厳格アルゴリズム判定付きです。',
      blocks: [
        { type: 'callout', kind: 'tip', html: '<b>進め方のコツ:</b> <b>8-1 (<code class="ic">db_dump</code>) → 8-2 (<code class="ic">db_linear_search</code>) → 8-4 (<code class="ic">db_binary_search</code>) → 8-6(1)(2) (<code class="ic">db_hash_load / search</code>)</b> で <code class="ic">iata_db.c</code> が丸ごと完成します! 8-3, 8-5, 8-7 はクリアすると「考察」欄に 2,700 件フルセットの gcc 実測表が表示されます。' },
        { type: 'lab' },
      ],
    },
    {
      id: 'report', num: '08', group: '課題', kicker: 'Report', navTitle: 'レポート作成',
      title: 'レポートを, 自動で組み立てる。',
      lead: '課題ラボの実行結果と「工夫した点」「感想」「考察 (8-3, 8-5, 8-7)」から B8.txt を生成します。完成した iata_db.c のダウンロード保存も忘れずに!',
      blocks: [{ type: 'report' }],
    },
  ];

  window.UNITS.b8 = {
    title: '二分探索とハッシュ', source: '[B8] 二分探索とハッシュ / B8 講義スライド', hero, chapters, tasks: window.B8_TASKS || [],
    predictCount: 4,
  };
})();
