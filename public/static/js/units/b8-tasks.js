/* B8 二分探索とハッシュ — 課題定義 (出典: 配布資料「[B8] 二分探索とハッシュ」) */
(function () {
  'use strict';
  const D = window.B8_DATA || { sol: {}, given: {}, exp: {}, inp: {}, start: {}, timing: {} };
  const G = D.given || {}, E = D.exp || {}, I = D.inp || {}, S = D.start || {};
  const pick = (...ks) => { const o = {}; ks.forEach((k) => (o[k] = G[k])); return o; };
  const noCmt = (s) => (s || '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const HP = (r) => (r && r.heap) || { sizes: [], leaks: [] };
  function leakMsg(outs) {
    const r = outs.find((x) => HP(x).leaks.length);
    if (!r) return null;
    const L = HP(r).leaks;
    return 'free 忘れ (メモリリーク) があります: 終了時に ' + L.length + ' ブロック (' + L.reduce((a, b) => a + b.n, 0) + ' バイト) が返却されていません (db_delete で MAX_RECORDS すべてを解放しているか確認しよう)';
  }

  function extractFnBody(code, fnName) {
    const c = noCmt(code);
    const re = new RegExp('\\b' + fnName + '\\s*\\([^)]*\\)\\s*\\{');
    const m = re.exec(c);
    if (!m) return '';
    let i = m.index + m[0].length, depth = 1;
    while (i < c.length && depth > 0) {
      if (c[i] === '{') depth++;
      else if (c[i] === '}') depth--;
      i++;
    }
    return c.slice(m.index + m[0].length, i - 1);
  }

  function cpuCompareTable(showModes) {
    const tm = D.timing || {};
    const keys = tm.keys || [];
    const cmps = tm.cmps || {};
    if (!keys.length) return '';
    let html = '<div class="b6-tbl-wrap"><table class="b6-tbl"><thead><tr><th>キー (位置)</th>';
    if (showModes.includes('lin')) html += '<th>線形 (-O0)</th><th>線形 (-O2)</th><th>線形比較</th>';
    if (showModes.includes('bin')) html += '<th>二分 (-O0)</th><th>二分 (-O2)</th><th>二分比較</th>';
    if (showModes.includes('hash')) html += '<th>ハッシュ (-O0)</th><th>ハッシュ (-O2)</th><th>ハッシュ比較</th>';
    html += '</tr></thead><tbody>';
    keys.forEach((it) => {
      const k = it.key;
      const c = cmps[k] || ['—', '—', '—'];
      html += '<tr><td><b>' + k + '</b> <small class="c-mute">' + it.desc + '</small></td>';
      if (showModes.includes('lin')) {
        html += '<td>' + (((tm.lin_O0 || {})[k]) ?? 0).toFixed(6) + '</td>' +
                '<td>' + (((tm.lin_O2 || {})[k]) ?? 0).toFixed(6) + '</td>' +
                '<td class="per">' + c[0] + '回</td>';
      }
      if (showModes.includes('bin')) {
        html += '<td>' + (((tm.bin_O0 || {})[k]) ?? 0).toFixed(6) + '</td>' +
                '<td>' + (((tm.bin_O2 || {})[k]) ?? 0).toFixed(6) + '</td>' +
                '<td class="per">' + c[1] + '回</td>';
      }
      if (showModes.includes('hash')) {
        html += '<td>' + (((tm.hash_O0 || {})[k]) ?? 0).toFixed(6) + '</td>' +
                '<td>' + (((tm.hash_O2 || {})[k]) ?? 0).toFixed(6) + '</td>' +
                '<td class="per">' + c[2] + '回</td>';
      }
      html += '</tr>';
    });
    html += '</tbody></table></div><div class="c-mute" style="font-size:11.5px;margin-top:4px">※ 数値は 2,700 件フルセット (<code class="ic">iata_data.csv</code>) に対する <b>10万回検索あたり [sec]</b> の gcc 実測値</div>';
    return html;
  }

  const share = ['iata_db.c'];
  const fullHdrFiles = { 'iata_db.h': G['iata_db_full.h'] };

  const tasks = [
    {
      id: '8-1', label: '8-1', short: 'db_dump (全レコード出力)', files: ['iata_db.c'], share,
      given: pick('iata_db.h', 'iata_test1.c', 'iata_mini.csv'),
      link: ['iata_test1.c', 'iata_db.c'], gcc: 'iata_test1.c iata_db.c',
      starter: { 'iata_db.c': S['iata_db.c'] },
      title: 'データベースの全スロット (0〜MAX_RECORDS-1) を出力する関数 db_dump',
      spec: '<p><code class="ic">iata_db.c</code> 中の <code class="ic">void db_dump(db_t *db)</code> を完成させ, <code class="ic">iata_test1.c</code> とリンクして <code class="ic">test1-exp.txt</code> と一致する出力が得られるようにせよ (<code class="ic">diff -Bw</code> で確認)。</p>' +
            '<ul><li><code class="ic">0〜9 (db-&gt;n - 1)</code> までではなく, <b><code class="ic">0〜15 (MAX_RECORDS - 1)</code> まで表示</b>されるようにすること。</li>' +
            '<li><code class="ic">record[i]</code> の <code class="ic">data</code> が <b><code class="ic">NULL</code> の場合には key と data を表示しない</b>ようにすること (<code class="ic">[  10]</code> のみ出力して改行)。</li></ul>' +
            '<pre class="code-mini">[   0] AAC Al Arish : Egypt - Al Arish Airport\n[   1] FCO Rome : Italy Leonardo Da Vinci/Fiumicino\n  ...\n[   9] SFO San Francisco : CA : USA San Francisco Intl Airport\n[  10]\n  ...\n[  15]</pre>' +
            '<p class="c-mute"><b>iata_db.c は課題 (8-1)〜(8-7) で共通</b>です (ここで書いたコードが次の課題へ引き継がれ、最終的に完成した <code class="ic">iata_db.c</code> が提出物になります)。</p>',
      tests: [
        { stdin: '', expect: E.test1_exp, label: 'iata_test1.c (iata_mini.csv 10件 + 空6枠)', expName: 'test1-exp.txt' },
      ],
      hints: [
        '添字部分の書式は 4 桁右揃えの <code class="ic">printf("[%4d]", i);</code> (たとえば i=0 なら空白3つ + 0 で <code class="ic">[   0]</code>)。',
        'ループ上限は <code class="ic">db-&gt;n</code> ではなく <b><code class="ic">MAX_RECORDS</code></b>! ハッシュ法 (8-6) でも空き枠が途中に混ざるため全枠走査が必要です。',
        '<code class="ic">if (db-&gt;record[i].data != NULL) { printf(" %s %s", db-&gt;record[i].key, db-&gt;record[i].data); }</code> のあとに <code class="ic">printf("\\n");</code> を出せば, 空スロットは <code class="ic">[  10]</code> だけで改行されます。',
      ],
      check(outs, src) {
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        const body = extractFnBody(src['iata_db.c'], 'db_dump');
        if (!/MAX_RECORDS/.test(body)) return { ok: false, msg: '16 と直書きせず, マクロ MAX_RECORDS を使ってループしてください (フルセット切替にも対応するため)' };
        return { ok: true, msg: '0〜MAX_RECORDS-1 の全枠表示と NULL 判定が完璧です! 8-6 のハッシュテーブル確認でもこのまま大活躍します。' };
      },
      summary: '0 から MAX_RECORDS-1 までの全レコードを走査し, data が NULL でない\nときのみ key と data を出力する関数 db_dump を iata_db.c に作成し,\niata_test1.c とリンクして test1-exp.txt との一致を確認した。',
      reportTitle: '課題 8.1',
    },
    {
      id: '8-2', label: '8-2', short: '線形探索 db_linear_search', files: ['iata_db.c'], share,
      given: pick('iata_db.h', 'iata_test2.c', 'iata_mini.csv', 'iata_data.csv'),
      link: ['iata_test2.c', 'iata_db.c'], gcc: 'iata_test2.c iata_db.c',
      starter: { 'iata_db.c': S['iata_db.c'] },
      title: '先頭から順に空港コードを検索する関数 db_linear_search',
      spec: '<p>空港データの検索を行う関数 <code class="ic">char *db_linear_search(db_t *db, char key[])</code> を作成し, <code class="ic">iata_db.c</code> に追加せよ。</p>' +
            '<ul><li><code class="ic">db</code> に格納されている全てのレコードを <code class="ic">record[0], record[1], …, record[db-&gt;n - 1]</code> と順に <code class="ic">key</code> が一致するまで探す (線形探索)。</li>' +
            '<li>一致するレコードが見つかればその <b><code class="ic">data</code> (文字配列へのポインタ)</b> を返し, 存在しなければ <b><code class="ic">NULL</code></b> を返す。</li>' +
            '<li>小型版 (<code class="ic">test2-exp.txt</code>) と <code class="ic">__USE_MINI__</code> をコメントアウトしたフルセット版 (<code class="ic">test2-exp2.txt</code>) の両方で自動検証します!</li></ul>',
      tests: [
        { stdin: I.test2_in, expect: E.test2_exp, label: '小型版 iata_mini.csv (test2-exp.txt)', inName: 'test2-in.txt', expName: 'test2-exp.txt' },
        { stdin: I.test2_in, expect: E.test2_exp2, label: 'フルセット版 iata_data.csv (test2-exp2.txt)', files: fullHdrFiles, inName: 'test2-in.txt', expName: 'test2-exp2.txt' },
      ],
      hints: [
        '<code class="ic">db_load</code> で詰めて読み込んだレコードは <code class="ic">0</code> から <code class="ic">db-&gt;n - 1</code> 番目に入っています (<code class="ic">for (i = 0; i &lt; db-&gt;n; i++)</code>)。',
        '文字列の一致判定は <code class="ic">==</code> ではなく <b><code class="ic">strcmp(db-&gt;record[i].key, key) == 0</code></b>!',
        '見つかったら即 <code class="ic">return db-&gt;record[i].data;</code>、ループを最後まで抜けたら <code class="ic">return NULL;</code>。関数内では <code class="ic">printf</code> しません。',
      ],
      check(outs, src) {
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        const body = extractFnBody(src['iata_db.c'], 'db_linear_search');
        if (!/strcmp\s*\(/.test(body)) return { ok: false, msg: '文字列キーの比較には strcmp を使ってください' };
        if (/printf/.test(body)) return { ok: false, msg: 'db_linear_search 内では printf せず, data ポインタまたは NULL を return してください' };
        return { ok: true, msg: '小型版・フルセット版ともに完全一致! ポインタ data (または NULL) を綺麗に返せています。' };
      },
      summary: 'record[0] から record[db->n-1] まで strcmp で順にキーを比較し,\n一致したレコードの data ポインタ (未発見時は NULL) を返す関数\ndb_linear_search を作成し, 小型版とフルセット版の両方で確認した。',
      reportTitle: '課題 8.2',
    },
    {
      id: '8-3', label: '8-3', short: '線形探索のCPU時間 iata_cpu1.c', files: ['iata_cpu1.c', 'iata_db.c'], share,
      given: pick('iata_db.h', 'iata_data.csv'),
      link: ['iata_cpu1.c', 'iata_db.c'], gcc: '-O2 iata_cpu1.c iata_db.c',
      starter: { 'iata_cpu1.c': S['iata_cpu1.c'], 'iata_db.c': S['iata_db.c'] },
      title: 'key を入力する毎に線形探索の CPU 時間を計測する iata_cpu1.c',
      spec: '<p><code class="ic">iata_test2.c</code> を書き換え, <code class="ic">key</code> を入力する毎に <code class="ic">db_linear_search</code> を繰り返し呼び出して消費した CPU 時間を <b>標準エラー出力 (<code class="ic">stderr</code>)</b> に表示するプログラム <b>iata_cpu1.c</b> を作成せよ。</p>' +
            '<ul><li>1 回の呼び出しでは短すぎるため, 1 回の <code class="ic">key</code> 入力に対して <code class="ic">data = db_linear_search(&amp;db, key);</code> を <code class="ic">N_REPEAT</code> 回 (実機では 10万回〜100万回, ブラウザ動作確認では 100回) 繰り返すループ全体を <code class="ic">clock()</code> で挟んで計測する。</li>' +
            '<li>CPU 時間は <code class="ic">fprintf(stderr, "cpu = %11.6f [sec]\\n", ...);</code> のように <b>stderr</b> に出し, 検索結果 (<code class="ic">key =&gt; data</code> または <code class="ic">NO RECORD</code>) は <b>stdout</b> に出力する。</li></ul>',
      tests: [
        { stdin: I.cpu_in, expect: E.cpu_exp, label: '指定10キー (AAC〜ZZZ) の検索と CPU 時間計測', files: fullHdrFiles, inName: 'cpu-in.txt', expName: 'cpu-exp.txt' },
      ],
      hints: [
        '<code class="ic">clk_start = clock();</code> → <code class="ic">for (i = 0; i &lt; N_REPEAT; i++) { data = db_linear_search(&amp;db, key); }</code> → <code class="ic">clk_end = clock();</code>',
        '秒数への変換は <code class="ic">(double)(clk_end - clk_start) / CLOCKS_PER_SEC</code>。出力先は <code class="ic">printf</code> ではなく <b><code class="ic">fprintf(stderr, ...)</code></b> にすること!',
        '計測ループの後に 1 回だけ <code class="ic">if (data == NULL) printf("NO RECORD\\n"); else printf("%s =&gt; %s\\n", key, data);</code> を出す (10万回 printf しないよう注意!)。',
      ],
      check(outs, src) {
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        const c = noCmt(src['iata_cpu1.c']);
        if (!/clock\s*\(\s*\)/.test(c) || !/CLOCKS_PER_SEC/.test(c)) return { ok: false, msg: 'clock() と CLOCKS_PER_SEC を使って CPU 時間を計測してください' };
        if (!/db_linear_search\s*\(/.test(c)) return { ok: false, msg: 'db_linear_search(&db, key) を呼び出して計測してください' };
        const errTxt = outs[0].err || '';
        const cpuLines = errTxt.split('\n').filter((l) => /cpu\s*=/.test(l));
        if (cpuLines.length < 10) return { ok: false, msg: 'stderr に「cpu = ... [sec]」が入力キーごと (10行) 出力されていません (fprintf(stderr, ...) を使っていますか?)' };
        return { ok: true, msg: '計測ループ・stderr への CPU 時間出力・stdout の検索結果がすべて完璧です! 下の考察欄で 2,700 件実測データを確認しよう。' };
      },
      observe: () =>
        '<p><b>2,700件フルセット gcc 実測表 (10万回検索あたり)</b> — 線形探索のキー位置と計算時間の関係</p>' +
        cpuCompareTable(['lin']) +
        '<p class="c-mute"><b>考察のポイント:</b> ① <b>格納位置との比例関係:</b> 先頭 <code class="ic">AAC</code> (1回目で一致) は約 0.001 秒と一瞬だが, 500番目 (<code class="ic">CXI</code>) → 1000番目 (<code class="ic">IYK</code>) → … → 2700番目 (<code class="ic">ZYL</code>) と後ろになるほど比較回数・CPU 時間が<b>ほぼ直線的に比例して増加</b>する (<code class="ic">O(n)</code>)。② <b>存在しないキー (<code class="ic">AAA, LLL, ZZZ</code>):</b> 辞書順で先頭より前の <code class="ic">AAA</code> であっても最後まで見ないと無いと分からないため, 常に全 2,700 件を比較する最悪時間になる。③ <code class="ic">-O2</code> 最適化によりループと比較処理が効率化され高速化される。</p>',
      obsLabel: '考察 (入力する空港コードの格納位置・有無と計算時間の関係, -O2 の効果)',
      obsTitle: '考察',
      noTrace: true,
      summary: 'key の入力ごとに db_linear_search を繰り返し呼び出して clock() で\nCPU 時間を計測する iata_cpu1.c を作成し, 2700件のデータに対して\nキーの格納位置や最適化 (-O2) の有無と計算時間の関係を考察した。',
      reportTitle: '課題 8.3',
    },
    {
      id: '8-4', label: '8-4', short: '二分探索 db_binary_search ★T2必出', files: ['iata_db.c'], share,
      given: pick('iata_db.h', 'iata_test4.c', 'iata_mini.csv', 'iata_data.csv'),
      link: ['iata_test4.c', 'iata_db.c'], gcc: 'iata_test4.c iata_db.c',
      starter: { 'iata_db.c': S['iata_db.c'] },
      title: '二分探索で O(log n) 検索を行う関数 db_binary_search',
      spec: '<p>二分探索により空港データの検索を行う関数 <code class="ic">char *db_binary_search(db_t *db, char key[])</code> を作成し, <code class="ic">iata_db.c</code> に追加せよ (引数と返り値は <code class="ic">db_linear_search</code> と同じ)。</p>' +
            '<ul><li>初期値は <code class="ic">low = 0, high = db-&gt;n - 1</code>。<code class="ic">high &lt; low</code> (すなわち <code class="ic">low &lt;= high</code> でなくなったとき) 探索を打ち切り <code class="ic">NULL</code> を返す。</li>' +
            '<li><code class="ic">mid = (high + low) / 2</code> とし, <code class="ic">strcmp(db-&gt;record[mid].key, key)</code> が <code class="ic">0</code> なら発見 (<code class="ic">data</code> を返す), 負 (<code class="ic">record[mid].key &lt; key</code>) なら後半 <code class="ic">low = mid + 1</code>, 正 (<code class="ic">key &lt; record[mid].key</code>) なら前半 <code class="ic">high = mid - 1</code> とする。</li></ul>' +
            '<p class="c-addr">★ 中間試験 T2 の最重要指定課題!「実行結果が合っていても二分探索になっていなければ 0 点」と明記されています。</p>',
      tests: [
        { stdin: I.test2_in, expect: E.test2_exp, label: '小型版 iata_mini.csv (test2-exp.txt)', inName: 'test2-in.txt', expName: 'test2-exp.txt' },
        { stdin: I.test2_in, expect: E.test2_exp2, label: 'フルセット版 iata_data.csv (test2-exp2.txt)', files: fullHdrFiles, inName: 'test2-in.txt', expName: 'test2-exp2.txt' },
      ],
      hints: [
        '継続条件は <code class="ic">while (low &lt;= high)</code> (<b><code class="ic">&lt;=</code> のイコール必須!</b> <code class="ic">low &lt; high</code> にすると残り1件のとき調べずに抜けてしまい AAC や ZYL を取りこぼします)。',
        '<code class="ic">int cmp = strcmp(db-&gt;record[mid].key, key);</code> と1回変数に受けるとスッキリ! <code class="ic">cmp == 0</code> で発見, <code class="ic">cmp &lt; 0</code> なら中央の方が辞書順で前なので <code class="ic">low = mid + 1;</code>, それ以外は <code class="ic">high = mid - 1;</code>。',
        '<code class="ic">low = mid</code> や <code class="ic">high = mid</code> にすると無限ループになるので必ず <b><code class="ic">+ 1</code> / <code class="ic">- 1</code></b> を付けよう!',
      ],
      check(outs, src) {
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        const body = extractFnBody(src['iata_db.c'], 'db_binary_search');
        if (!body) return { ok: false, msg: 'db_binary_search 関数が見つかりません' };
        if (/db_linear_search/.test(body)) return { ok: false, msg: 'T2 厳格チェック: db_linear_search を呼び出しています (二分探索で実装してください!)' };
        if (!/\/\s*2|>>\s*1/.test(body)) return { ok: false, msg: 'T2 厳格チェック: 中央の位置 mid = (low + high) / 2 を求めて範囲を半分に絞る二分探索になっていません' };
        if (/for\s*\([^;]*;\s*\w+\s*<\s*db\s*->\s*n\s*;\s*\w+\s*\+\+/.test(body)) return { ok: false, msg: 'T2 厳格チェック: 先頭から 1 ずつ増やす線形探索ループが含まれています' };
        return { ok: true, msg: '小型版・フルセット版とも完全一致 & 二分探索アルゴリズム確認 OK! 2,700件でも最大12回の比較で仕留められます!' };
      },
      summary: 'low = 0, high = db->n - 1 から mid = (low + high) / 2 のキーを\nstrcmp で比較し, 探索範囲を半分ずつ絞り込む関数 db_binary_search を\niata_db.c に追加し, 線形探索と同一の出力が得られることを確認した。',
      reportTitle: '課題 8.4',
    },
    {
      id: '8-5', label: '8-5', short: '二分探索のCPU時間 iata_cpu2.c', files: ['iata_cpu2.c', 'iata_db.c'], share,
      given: pick('iata_db.h', 'iata_data.csv'),
      link: ['iata_cpu2.c', 'iata_db.c'], gcc: '-O2 iata_cpu2.c iata_db.c',
      starter: { 'iata_cpu2.c': S['iata_cpu2.c'], 'iata_db.c': S['iata_db.c'] },
      title: '二分探索の CPU 時間を計測し線形探索と比較する iata_cpu2.c',
      spec: '<p>課題 (8-3) の <code class="ic">iata_cpu1.c</code> の <code class="ic">db_linear_search</code> を <b><code class="ic">db_binary_search</code></b> に書き換えて <b>iata_cpu2.c</b> を作成し, 二分探索の計算時間を計測して線形探索と比較・考察せよ。</p>',
      tests: [
        { stdin: I.cpu_in, expect: E.cpu_exp, label: '指定10キー (AAC〜ZZZ) の二分探索と CPU 時間計測', files: fullHdrFiles, inName: 'cpu-in.txt', expName: 'cpu-exp.txt' },
      ],
      hints: [
        '8-3 の <code class="ic">iata_cpu1.c</code> をコピーし, ループ内の呼び出しを <code class="ic">data = db_binary_search(&amp;db, key);</code> に変えるだけです!',
        '実機で 10万回だと <code class="ic">0.005 sec</code> 程度と非常に速いため, 差が見えにくければ 100万回などに増やして実験しよう。',
      ],
      check(outs, src) {
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        const c = noCmt(src['iata_cpu2.c']);
        if (!/db_binary_search\s*\(/.test(c)) return { ok: false, msg: 'db_binary_search(&db, key) を呼び出して計測してください' };
        if (/db_linear_search\s*\(/.test(c)) return { ok: false, msg: 'db_linear_search が残っています。db_binary_search に書き換えてください' };
        if (!/clock\s*\(\s*\)/.test(c)) return { ok: false, msg: 'clock() で CPU 時間を計測してください' };
        const cpuLines = (outs[0].err || '').split('\n').filter((l) => /cpu\s*=/.test(l));
        if (cpuLines.length < 10) return { ok: false, msg: 'stderr に各キーの「cpu = ... [sec]」を出力してください' };
        return { ok: true, msg: '二分探索の時間計測 OK! 下の考察欄で線形探索との圧倒的なスピード差を確認しよう。' };
      },
      observe: () =>
        '<p><b>2,700件フルセット gcc 実測比較表 (10万回検索あたり)</b> — 線形探索 vs 二分探索</p>' +
        cpuCompareTable(['lin', 'bin']) +
        '<p class="c-mute"><b>考察のポイント:</b> ① <b>圧倒的な高速化 (<code class="ic">O(log n)</code>):</b> 2,700 件に対して <code class="ic">log₂(2700) ≈ 11.4</code> なので, どのキーでも <b>9〜12 回の比較 (約 0.005 秒 / 10万回)</b> で完了し, 末尾 <code class="ic">ZYL</code> や未登録キーでは線形探索 (約 0.80 秒) より <b>約 160 倍高速</b>! ② <b>位置によらずほぼ一定:</b> 線形探索と違い, 500番目でも 2700番目でも存在しないキーでも時間が変わらない。③ 唯一の例外は先頭 <code class="ic">AAC</code> で, 線形探索は 1 回目で当たるため <code class="ic">AAC</code> だけは線形探索の方がわずかに速い。</p>',
      obsLabel: '考察 (二分探索の計算時間と線形探索との比較)',
      obsTitle: '考察',
      noTrace: true,
      summary: 'iata_cpu1.c の検索関数を db_binary_search に変更した iata_cpu2.c を\n作成して CPU 時間を計測し, キーの位置によらずほぼ一定時間 O(log n) で\n高速に検索できることを線形探索と比較して考察した。',
      reportTitle: '課題 8.5',
    },
    {
      id: '8-6-1', label: '8-6(1)', short: 'ハッシュ格納 db_hash_load', files: ['iata_db.c'], share,
      given: pick('iata_db.h', 'iata_test6a.c', 'iata_mini.csv'),
      link: ['iata_test6a.c', 'iata_db.c'], gcc: 'iata_test6a.c iata_db.c',
      starter: { 'iata_db.c': S['iata_db.c'] },
      title: 'ハッシュ関数 db_hash_f とクローズドハッシュ読込 db_hash_load',
      spec: '<p>クローズドハッシュ法 (オープンアドレス法) 用のハッシュ関数 <code class="ic">db_hash_f</code> とデータ読込関数 <code class="ic">void db_hash_load(db_t *db)</code> を <code class="ic">iata_db.c</code> に追加し, <code class="ic">iata_test6a.c</code> とリンクして <code class="ic">test6-exp.txt</code> と一致することを確認せよ。</p>' +
            '<pre class="code-mini">int db_hash_f(char key[])\n{\n  int i;\n  int v = 0;\n  for (i=0; key[i]!=\'\\0\'; i++) {\n    v = (v&lt;&lt;5) + (key[i]-\'A\');\n  }\n  return v % MAX_RECORDS;\n}</pre>' +
            '<ul><li><code class="ic">db_load</code> を参考に作成する。格納先を <code class="ic">db-&gt;n</code> 番目ではなく <b><code class="ic">h</code> 番目 (<code class="ic">&amp;db-&gt;record[h]</code>)</b> にする。</li>' +
            '<li>まず <code class="ic">h = db_hash_f(key);</code> とし, <b>配列の <code class="ic">h</code> 番目に既にデータが格納されていれば (<code class="ic">db-&gt;record[h].data != NULL</code>), 空きが見つかるまで <code class="ic">h</code> を 1 ずつ増やす</b> (ただし <code class="ic">h == MAX_RECORDS</code> になったら <code class="ic">MAX_RECORDS</code> を引いて <code class="ic">0</code> に戻す)。</li></ul>',
      tests: [
        { stdin: '', expect: E.test6_exp, label: 'iata_test6a.c (10件ハッシュ格納後の db_dump)', expName: 'test6-exp.txt' },
      ],
      hints: [
        '「<code class="ic">h</code> 番目に既にデータが入っているか」は <code class="ic">db_init</code> を見ると分かる通り <b><code class="ic">db-&gt;record[h].data != NULL</code></b> (または <code class="ic">db-&gt;record[h].key[0] != \'\\0\'</code>) で判定できます!',
        '空き探しのループ: <code class="ic">while (db-&gt;record[h].data != NULL) { h++; if (h == MAX_RECORDS) { h = 0; } }</code> (または <code class="ic">h = (h + 1) % MAX_RECORDS;</code>)。',
        '空きが見つかったら <code class="ic">record_set(&amp;db-&gt;record[h], key, data); db-&gt;n++;</code>! なお <code class="ic">db_delete</code> のループ上限が <code class="ic">db-&gt;n</code> になっていると [10]〜[15] が free されないので <code class="ic">MAX_RECORDS</code> になっているかも確認しよう。',
      ],
      check(outs, src) {
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        const c = noCmt(src['iata_db.c']);
        if (!/db_hash_f\s*\(/.test(c)) return { ok: false, msg: 'db_hash_f を定義して呼び出してください' };
        return { ok: true, msg: 'test6-exp.txt と完全一致! SFO が [14]→[15]→[0] と末尾から先頭へ巡回して格納される動きまで完璧です!' };
      },
      summary: 'ハッシュ関数 db_hash_f と, 衝突時に空きスロットが見つかるまで添字を\n1 ずつ進めて (末尾で 0 に戻して) 格納する関数 db_hash_load を作成し,\niata_test6a.c により test6-exp.txt と一致することを確認した。',
      reportTitle: '課題 8.6 (1)',
    },
    {
      id: '8-6-2', label: '8-6(2)', short: 'ハッシュ探索 db_hash_search', files: ['iata_db.c'], share,
      given: pick('iata_db.h', 'iata_test6b.c', 'iata_mini.csv', 'iata_data.csv'),
      link: ['iata_test6b.c', 'iata_db.c'], gcc: 'iata_test6b.c iata_db.c',
      starter: { 'iata_db.c': S['iata_db.c'] },
      title: 'クローズドハッシュ法で O(1) 検索を行う関数 db_hash_search',
      spec: '<p><code class="ic">db_hash_load</code> で格納された <code class="ic">db</code> 中から <code class="ic">key</code> が一致するレコードを探し, その <code class="ic">data</code> (なければ <code class="ic">NULL</code>) を返す関数 <code class="ic">char *db_hash_search(db_t *db, char key[])</code> を <code class="ic">iata_db.c</code> に追加せよ。</p>' +
            '<ul><li>まず <code class="ic">h = db_hash_f(key);</code> とする。</li>' +
            '<li><code class="ic">db-&gt;record[h]</code> が<b>空 (<code class="ic">data == NULL</code>) ならば所望のデータは存在しない</b>ので <code class="ic">NULL</code> を返す。</li>' +
            '<li><code class="ic">db-&gt;record[h].key</code> が <code class="ic">key</code> と一致すれば <code class="ic">db-&gt;record[h].data</code> を返す。</li>' +
            '<li>どちらでもなければ <code class="ic">h</code> を 1 ずつ増やして (<code class="ic">MAX_RECORDS</code> で 0 に戻し, 最大でも 1 周分まで) 順に調べる。</li></ul>',
      tests: [
        { stdin: I.test2_in, expect: E.test2_exp, label: '小型版 iata_mini.csv (test2-exp.txt)', inName: 'test2-in.txt', expName: 'test2-exp.txt' },
        { stdin: I.test2_in, expect: E.test2_exp2, label: 'フルセット版 iata_data.csv (test2-exp2.txt)', files: fullHdrFiles, inName: 'test2-in.txt', expName: 'test2-exp2.txt' },
      ],
      hints: [
        '検索を打ち切る条件が最重要! <b>空スロット (<code class="ic">db-&gt;record[h].data == NULL</code>) に出会ったら、それより後ろに目的のキーがあることは絶対にない</b>ので即ループ終了 (<code class="ic">return NULL;</code>)!',
        '念のためテーブルが満杯でも無限ループしないよう, 調べた回数 <code class="ic">count &lt; MAX_RECORDS</code> も条件に入れておくと完璧です。',
        '<code class="ic">while (db-&gt;record[h].data != NULL &amp;&amp; count &lt; MAX_RECORDS) { if (strcmp(db-&gt;record[h].key, key) == 0) return db-&gt;record[h].data; h = (h + 1) % MAX_RECORDS; count++; } return NULL;</code>',
      ],
      check(outs, src) {
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        const body = extractFnBody(src['iata_db.c'], 'db_hash_search');
        if (!/db_hash_f\s*\(/.test(body)) return { ok: false, msg: 'db_hash_search ではまず db_hash_f(key) で開始位置 h を求めてください' };
        return { ok: true, msg: '小型版・フルセット版とも完全一致! これで提出対象の iata_db.c の全関数がすべて完成しました 🎉' };
      },
      summary: 'h = db_hash_f(key) から開始し, 空スロット (data == NULL) に達するまで\nh を巡回させながら strcmp でキーを照合する関数 db_hash_search を作成し,\n小型版とフルセット版の両方で正しく検索できることを確認した。',
      reportTitle: '課題 8.6 (2)',
    },
    {
      id: '8-7', label: '8-7', short: 'ハッシュ法のCPU時間 iata_cpu3.c', files: ['iata_cpu3.c', 'iata_db.c'], share,
      given: pick('iata_db.h', 'iata_data.csv'),
      link: ['iata_cpu3.c', 'iata_db.c'], gcc: '-O2 iata_cpu3.c iata_db.c',
      starter: { 'iata_cpu3.c': S['iata_cpu3.c'], 'iata_db.c': S['iata_db.c'] },
      title: 'ハッシュ法の CPU 時間を計測し 3 手法を総合比較する iata_cpu3.c',
      spec: '<p>課題 (8-3) の <code class="ic">iata_cpu1.c</code> に対して下記の 2 点を変更して <b>iata_cpu3.c</b> を作成し, ハッシュ法の計算時間を計測して線形探索・二分探索と比較・考察せよ。</p>' +
            '<ul><li><code class="ic">db_load</code> を <b><code class="ic">db_hash_load</code></b> に変更する (※ ここを変え忘れると正しく検索できない!)</li>' +
            '<li><code class="ic">db_linear_search</code> を <b><code class="ic">db_hash_search</code></b> に変更する</li></ul>',
      tests: [
        { stdin: I.cpu_in, expect: E.cpu_exp, label: '指定10キー (AAC〜ZZZ) のハッシュ検索と CPU 時間計測', files: fullHdrFiles, inName: 'cpu-in.txt', expName: 'cpu-exp.txt' },
      ],
      hints: [
        '<b>最大のうっかりポイント:</b> 検索関数だけ <code class="ic">db_hash_search</code> に変えて、最初の読み込みを <code class="ic">db_load(&amp;db);</code> のままにするとハッシュ位置に入っていないので見つかりません! 必ず <b><code class="ic">db_hash_load(&amp;db);</code></b> に変更しよう。',
      ],
      check(outs, src) {
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        const c = noCmt(src['iata_cpu3.c']);
        if (!/db_hash_load\s*\(/.test(c)) return { ok: false, msg: '読み込みを db_hash_load(&db) に変更してください' };
        if (!/db_hash_search\s*\(/.test(c)) return { ok: false, msg: '検索を db_hash_search(&db, key) に変更してください' };
        if (!/clock\s*\(\s*\)/.test(c)) return { ok: false, msg: 'clock() で CPU 時間を計測してください' };
        const cpuLines = (outs[0].err || '').split('\n').filter((l) => /cpu\s*=/.test(l));
        if (cpuLines.length < 10) return { ok: false, msg: 'stderr に各キーの「cpu = ... [sec]」を出力してください' };
        return { ok: true, msg: '3 手法すべての実装・計測コンプリート! 下の総合比較表で O(n) → O(log n) → O(1) の進化を確認しよう!' };
      },
      observe: () =>
        '<p><b>2,700件フルセット gcc 実測・総合比較表 (10万回検索あたり)</b> — 線形探索 vs 二分探索 vs ハッシュ法</p>' +
        cpuCompareTable(['lin', 'bin', 'hash']) +
        '<p class="c-mute"><b>考察のポイント:</b> ① <b>ハッシュ法の O(1) 性能:</b> 多くのキーで<b>比較 1 回 (約 0.0008 秒 / 10万回)</b> で即座にヒットし, 二分探索 (約 0.0048 秒, 9〜12回比較) と比べてもさらに <b>約 5〜6 倍高速</b>、線形探索の末尾と比べると <b>約 900 倍以上高速</b>! 存在しないキー (<code class="ic">AAA, LLL, ZZZ</code>) も空スロットを見て 1〜2 回で終了する。② <b>衝突 (クラスタリング) の影響:</b> <code class="ic">YFB</code> のようにハッシュ値の密集地帯に当たると連続衝突 (39回比較, 約 0.014 秒) が起きて二分探索より遅くなるケースもある。これを解消するのが MAX_RECORDS を大きく取ることや、オプション課題 8-1 のオープンハッシュ法である。</p>',
      obsLabel: '考察 (ハッシュ法の計算時間と線形探索・二分探索との総合比較)',
      obsTitle: '考察',
      noTrace: true,
      summary: 'db_hash_load と db_hash_search を用いて CPU 時間を計測する iata_cpu3.c\nを作成し, 平均 O(1) で最も高速に検索できる一方, 衝突集中時には比較回数\nが増える特性について線形探索・二分探索と比較して考察した。',
      reportTitle: '課題 8.7',
    },
    {
      id: 'o8-1', label: 'Opt-1', short: 'オープンハッシュ法 iata_db2.c', optional: true, files: ['iata_db2.c'],
      given: pick('iata_db2.h', 'iata_test9.c', 'iata_data.csv'),
      link: ['iata_test9.c', 'iata_db2.c'], gcc: 'iata_test9.c iata_db2.c',
      starter: { 'iata_db2.c': S['iata_db2.c'] },
      title: 'ハッシュ値ごとに線形リストを構成するオープンハッシュ法 iata_db2.c',
      spec: '<p>オープンハッシュ法 (チェイン法 / open hash) により空港データの検索を行えるよう, 自己参照構造体 <code class="ic">typedef struct record_s { char key[KEY_LEN+1]; char *data; struct record_s *next; } record_t;</code> を用いた <b>iata_db2.c</b> を実装し, <code class="ic">iata_test9.c</code> とリンクして動作確認せよ。</p>' +
            '<ul><li>配布資料 p.20 の図の通り, 配列の各要素 <code class="ic">db-&gt;record[h]</code> を<b>ダミーの頭節点</b> (<code class="ic">data = NULL, next = リスト先頭</code>) とし, 同じハッシュ値 <code class="ic">h</code> を持つデータを <code class="ic">malloc(sizeof(record_t))</code> で確保した節点の線形リストとしてつなぐ。</li>' +
            '<li><code class="ic">db_delete</code> では, 各バケットの線形リストをたどり, <b>文字列 <code class="ic">p-&gt;data</code> と節点 <code class="ic">p</code> の両方</b>を残らず <code class="ic">free</code> すること (リーク検査あり!)。</li></ul>',
      tests: [
        { stdin: I.test2_in, expect: E.test2_exp2, label: 'iata_test9.c (フルセット検索 + 全ノード解放チェック)', inName: 'test2-in.txt', expName: 'test2-exp2.txt' },
      ],
      hints: [
        '<b>B6 (リスト処理) × B8 (ハッシュ) の合体技!</b> <code class="ic">db_init</code> では全 <code class="ic">i = 0..MAX_RECORDS-1</code> について <code class="ic">db-&gt;record[i].data = NULL; db-&gt;record[i].next = NULL;</code> に初期化します。',
        '挿入 (<code class="ic">db_hash_load</code>): <code class="ic">h = db_hash_f(key);</code> を求め, <code class="ic">node = malloc(sizeof(record_t));</code> と <code class="ic">node-&gt;data = malloc(sizeof(char)*(strlen(data)+1));</code> を確保してコピーしたら, ダミー直後に <code class="ic">node-&gt;next = db-&gt;record[h].next; db-&gt;record[h].next = node;</code> の黄金 2 行でつなぐだけ!',
        '検索 (<code class="ic">db_hash_search</code>): <code class="ic">for (p = db-&gt;record[db_hash_f(key)].next; p != NULL; p = p-&gt;next)</code> で <code class="ic">strcmp(p-&gt;key, key) == 0</code> を探す。解放 (<code class="ic">db_delete</code>) では <code class="ic">next_p = p-&gt;next; free(p-&gt;data); free(p);</code> の順番を守ろう!',
      ],
      check(outs, src) {
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        const c = noCmt(src['iata_db2.c']);
        if (!/->\s*next/.test(c)) return { ok: false, msg: 'next ポインタを使った線形リスト (オープンハッシュ) で実装してください' };
        if (!/malloc\s*\(\s*sizeof\s*\(\s*record_t\s*\)/.test(c) && !/malloc\s*\(\s*sizeof\s*\(\s*struct\s+record_s\s*\)/.test(c)) {
          return { ok: false, msg: 'リストの各節点を malloc(sizeof(record_t)) で動的に割り当ててください' };
        }
        return { ok: true, msg: 'オープンハッシュ法の構築・検索・2段階 free (p->data と p) までメモリリークゼロで完全制覇です! 🏆' };
      },
      summary: 'record_t に next ポインタを持たせ, 各ハッシュ値 db->record[h] から\n線形リストとしてデータを記憶・検索・解放するオープンハッシュ法を\niata_db2.c に実装し, iata_test9.c とリンクして動作を確認した。',
      reportTitle: 'オプション課題 8.1',
    },
  ];

  tasks.forEach((t) => { t.solution = D.sol[t.id] || {}; });
  window.B8_TASKS = tasks;
})();
