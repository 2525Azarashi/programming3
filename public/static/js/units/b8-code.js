/* =========================================================================
 *  B8 二分探索とハッシュ — 直感から本質へ導くインタラクティブ・ビジュアルラボ
 *   0. essenceMap       : 30秒で掴む B8 4大テーマ (メモリ構造 / 二分探索 / クローズドハッシュ / オープンハッシュ)
 *   1. dbAnatomyLab     : db_t × record_t × malloc ヒープ領域の矢印解剖 & db_dump 体験
 *   2. binarySearchLab  : iata_mini.csv (10空港) 二分探索 vs 線形探索 ステップ対決 (strcmp 符号付き)
 *   3. hashCollisionLab : db_hash_f 計算機 & クローズドハッシュ (16枠) 衝突・巡回シミュレータ
 *   4. openHashLab      : クローズドハッシュ vs オープンハッシュ (線形リスト) 構造比較ラボ
 *   5. benchExplorer    : 2,700 空港フルセット gcc (-O0 / -O2) 実測タイム & 比較回数エクスプローラ
 * ========================================================================= */
(function () {
  'use strict';
  const { h, codeBlock, icon, esc } = U;
  const D = window.B8_DATA || { timing: {} };

  const MINI_RECS = [
    { key: 'AAC', city: 'Al Arish', detail: 'Al Arish : Egypt - Al Arish Airport', heap: 500 },
    { key: 'FCO', city: 'Rome', detail: 'Rome : Italy Leonardo Da Vinci/Fiumicino', heap: 540 },
    { key: 'ITM', city: 'Osaka(伊丹)', detail: 'Osaka : Japan Itami International Was Osaka', heap: 590 },
    { key: 'JFK', city: 'New York', detail: 'New York : NY : USA John F Kennedy Intl Airport', heap: 640 },
    { key: 'JRO', city: 'Kilimanjaro', detail: 'Kilimanjaro : Tanzania Kilimanjaro', heap: 700 },
    { key: 'KIX', city: 'Osaka(関空)', detail: 'Osaka : Japan Kansai International', heap: 740 },
    { key: 'NRT', city: 'Tokyo(成田)', detail: 'Tokyo : Japan - Narita', heap: 780 },
    { key: 'PEK', city: 'Beijing', detail: 'Beijing : China Peking Capital Airport', heap: 810 },
    { key: 'SAF', city: 'Santa Fe', detail: 'Santa Fe : NM : USA Santa Fe Municipal Airport', heap: 860 },
    { key: 'SFO', city: 'San Francisco', detail: 'San Francisco : CA : USA San Francisco Intl Airport', heap: 920 },
  ];

  function hashCalc(key, mod) {
    let v = 0;
    const steps = [];
    for (let i = 0; i < key.length; i++) {
      const d = key.charCodeAt(i) - 65;
      const prev = v;
      v = (v << 5) + d;
      steps.push({ ch: key[i], d, prev, v });
    }
    return { v, h: ((v % mod) + mod) % mod, steps };
  }

  /* -----------------------------------------------------------------------
   * 0. 30 秒で掴む「直感 → 本質」マップ (4 枚)
   * ----------------------------------------------------------------------- */
  function essenceMap() {
    const cards = [
      {
        tag: 'ESSENCE 01 · データ構造と線形探索',
        color: 'var(--peach)',
        intuition: '3文字キーは構造体の中に直置き、長い空港名はヒープに借りてポインタで指す',
        why: '空港名は長さがバラバラ (最大127文字)。全レコードに128バイト確保すると無駄が多いので、record_t には char *data (8バイト) だけ置き、実体は strlen(data)+1 バイトだけ malloc する。空スロットは data == NULL が目印!',
        essence: '空判定は data == NULL、文字列一致は strcmp(r.key, key) == 0。',
        code: 'for (i = 0; i < db->n; i++) {\n  if (strcmp(db->record[i].key, key) == 0)\n    return db->record[i].data;\n}\nreturn NULL;',
        jump: '#linear',
      },
      {
        tag: 'ESSENCE 02 · 二分探索 O(log n)',
        color: 'var(--pink)',
        intuition: 'キー昇順に並んだ辞書の「ど真ん中 mid」を開き、毎回半分をバッサリ捨てる',
        why: '2,700件あっても 1回比較するごとに 1350 → 675 → … → 1 と絞られ、最大12回 (log₂2700 ≈ 11.4) で必ず決着! 中間試験 T2 では線形探索で代用すると出力一致でも 0 点になる最重要アルゴリズム。',
        essence: 'while (low <= high) で mid = (low+high)/2、strcmp の正負で low=mid+1 / high=mid-1。',
        code: 'low = 0; high = db->n - 1;\nwhile (low <= high) {\n  mid = (low + high) / 2;\n  cmp = strcmp(db->record[mid].key, key);\n  if (cmp == 0) return db->record[mid].data;\n  else if (cmp < 0) low = mid + 1;\n  else high = mid - 1;\n}',
        jump: '#binary',
      },
      {
        tag: 'ESSENCE 03 · クローズドハッシュ O(1)',
        color: 'var(--sky)',
        intuition: 'キーから「部屋番号 h」を一発計算! 先客がいれば隣の空き部屋へずらす',
        why: '探すときも h 番の部屋から見始め、キーが違えば h+1, h+2… とたどる (末尾 m に達したら 0 へ戻る)。途中で空部屋 (data == NULL) に当たったら「これより先には絶対ない」と即座に打ち切れる!',
        essence: '格納は data != NULL の間 1 ずつ進め、検索は一致するか data == NULL で止める。',
        code: 'h = db_hash_f(key);\nwhile (db->record[h].data != NULL && count < MAX_RECORDS) {\n  if (strcmp(db->record[h].key, key) == 0)\n    return db->record[h].data;\n  h = (h + 1) % MAX_RECORDS;\n  count++;\n}\nreturn NULL;',
        jump: '#hash',
      },
      {
        tag: 'ESSENCE 04 · オープンハッシュ (Opt 8-1)',
        color: 'var(--mint)',
        intuition: '同じ部屋番号 h に衝突した人たちを、部屋ごとの「線形リスト」でぶら下げる',
        why: 'クローズドハッシュは混雑すると隣の部屋まで連鎖的に埋まる (クラスタリング) が、オープンハッシュなら別のハッシュ値の部屋を一切邪魔しない! B6 のダミー頭節点リストがそのまま活きる。',
        essence: 'db->record[h] をダミー頭節点にし、record[h].next に malloc した節点をつなぐ。',
        code: 'h = db_hash_f(key);\nfor (p = db->record[h].next; p != NULL; p = p->next) {\n  if (strcmp(p->key, key) == 0) return p->data;\n}\nreturn NULL;',
        jump: '#openhash',
      },
    ];

    let active = 0;
    const detail = h('div.b6-ess-detail');
    const tabs = h('div.b6-ess-grid');

    function renderDetail() {
      const c = cards[active];
      [...tabs.children].forEach((el, k) => el.classList.toggle('on', k === active));
      detail.innerHTML = '';
      detail.style.setProperty('--ec', c.color);
      detail.append(
        h('div.b6-ess-flow',
          h('div.b6-ess-step',
            h('span.b6-ess-pill', '1. 直感イメージ'),
            h('div.b6-ess-big', c.intuition),
            h('p', c.why)),
          h('div.b6-ess-arr', '⇒'),
          h('div.b6-ess-step.core',
            h('span.b6-ess-pill.ptr', '2. 本質 (C の骨格コード)'),
            h('div.b6-ess-big', c.essence),
            codeBlock(c.code),
            h('div', { style: { marginTop: '10px', textAlign: 'right' } },
              h('a.btn.sm.ptr', { href: c.jump }, 'この章で動かして確かめる', icon('arrow'))))
        )
      );
    }

    cards.forEach((c, k) => {
      tabs.appendChild(h('button.b6-ess-card' + (k === 0 ? '.on' : ''), {
        type: 'button',
        style: { '--ec': c.color },
        onclick: () => { active = k; renderDetail(); },
      },
      h('span.b6-ess-tag', c.tag),
      h('b', c.intuition),
      h('small', '→ ' + c.essence)));
    });

    renderDetail();
    return h('div.b6-ess',
      h('div.b6-ess-head',
        h('div',
          h('span.chip.ptr', 'FAST TRACK'),
          h('b.b6-wtitle', '読む前に 30 秒 — B8 探索アルゴリズム 4 大テーマの「直感 ⇒ 本質」マップ')),
        h('span.c-mute', { style: { fontSize: '12.5px' } }, 'カードを押すと「直感 → C の骨格」が切り替わります')),
      tabs,
      detail);
  }

  /* -----------------------------------------------------------------------
   * 1. db_t × record_t × ヒープ領域のメモリ構造ラボ (課題 8-1 直結)
   * ----------------------------------------------------------------------- */
  function dbAnatomyLab() {
    let sel = 2; // ITM
    let showNull = true;
    const leftHost = h('div.b8-mem-col');
    const rightHost = h('div.b8-mem-col');
    const dumpPreview = h('pre.b8-dump-pre');

    function paint() {
      leftHost.innerHTML = '';
      rightHost.innerHTML = '';
      leftHost.appendChild(h('div.b8-col-h', h('b', 'プログラムのメモリ: db_t db'), h('small', 'db.n = 10, MAX_RECORDS = 16')));
      rightHost.appendChild(h('div.b8-col-h', h('b', 'OS のヒープ領域 (malloc)'), h('small', 'strlen(data) + 1 バイトずつ確保')));

      const slots = showNull ? 16 : 10;
      let dumpTxt = '';
      for (let i = 0; i < slots; i++) {
        const rec = MINI_RECS[i] || null;
        const on = i === sel;
        const idxStr = '[' + String(i).padStart(4, ' ') + ']';
        dumpTxt += rec ? `${idxStr} ${rec.key} ${rec.detail}\n` : `${idxStr}\n`;
        if (!showNull && i >= 10) continue;

        if (!rec && i >= 11 && i <= 13 && showNull) {
          if (i === 11) {
            leftHost.appendChild(h('div.b8-slot-dots', '… [11]〜[13] も key="" / data=NULL …'));
          }
          continue;
        }

        const keyCells = rec ? [rec.key[0], rec.key[1], rec.key[2], '\\0'] : ['\\0', '·', '·', '·'];
        leftHost.appendChild(h('button.b8-slot' + (on ? '.on' : '') + (!rec ? '.empty' : ''), {
          type: 'button',
          onclick: () => { sel = i; paint(); },
        },
        h('span.b8-slot-idx', 'record[' + i + ']'),
        h('span.b8-key-boxes', keyCells.map((ch) => h('i', ch))),
        h('span.b8-ptr-box' + (rec ? '.live' : '.null'), rec ? '→ ' + rec.heap + '番地' : 'NULL')));

        if (rec) {
          rightHost.appendChild(h('div.b8-heap-blk' + (on ? '.on' : ''), {
            onclick: () => { sel = i; paint(); },
          },
          h('span.b8-heap-addr', rec.heap + '番地 (' + (rec.detail.length + 1) + 'B)'),
          h('code', '"' + rec.detail + '\\0"')));
        }
      }
      if (!showNull) {
        for (let i = 10; i < 16; i++) dumpTxt += '[' + String(i).padStart(4, ' ') + ']  ← db->n までしか回さないとこれが出ず diff NG!\n';
      }

      const cur = MINI_RECS[sel];
      dumpPreview.innerHTML =
        `<b>選択中: db.record[${sel}]</b> — ` +
        (cur
          ? `<code class="ic">key = "${cur.key}"</code> (構造体内の4バイト配列), <code class="ic">data = ${cur.heap}番地</code> (<code class="ic">data != NULL</code> なので出力する)\n`
          : `<code class="ic">key = ""</code>, <code class="ic">data = NULL</code> (<b>db_init</b> で初期化された空きスロット → <code class="ic">[${String(sel).padStart(4, ' ')}]</code> だけ出力して改行!)\n`) +
        '\n' + esc(dumpTxt.trimEnd());
    }

    const toggleBtn = h('button.btn.sm', {
      type: 'button',
      onclick: () => {
        showNull = !showNull;
        toggleBtn.textContent = showNull ? '空き枠 [10]〜[15] も表示中 (正解: MAX_RECORDS)' : '⚠ db->n (0〜9) までしか見ない場合';
        toggleBtn.classList.toggle('ng', !showNull);
        paint();
      },
    }, '空き枠 [10]〜[15] も表示中 (正解: MAX_RECORDS)');

    paint();
    return h('div.b6-wid',
      h('div.b6-wid-head',
        h('div.b6-wid-t', h('span.chip.val', 'MEMORY ANATOMY'), h('b', 'スライド p.3 & 資料 p.7 図解 — record_t の「key 直置き + data ポインタ」構造')),
        h('div.b6-wid-ctl', toggleBtn)),
      h('div.b8-mem-grid', leftHost, rightHost),
      dumpPreview);
  }

  /* -----------------------------------------------------------------------
   * 2. 二分探索 vs 線形探索 インタラクティブ比較ラボ (課題 8-2, 8-4 & T2 直結)
   * ----------------------------------------------------------------------- */
  function binarySearchLab() {
    const QUERIES = [
      { key: 'KIX', label: 'KIX (関空 · [5] に存在)' },
      { key: 'AAC', label: 'AAC (先頭 · [0] に存在)' },
      { key: 'SFO', label: 'SFO (末尾 · [9] に存在)' },
      { key: 'ITM', label: 'ITM (伊丹 · [2] に存在)' },
      { key: 'HND', label: 'HND (羽田 · mini に存在しない!)' },
      { key: 'ZZZ', label: 'ZZZ (末尾より後ろ · 存在しない!)' },
    ];
    let qi = 0, steps = [], si = 0;

    const cellsEl = h('div.t2-bs-cells');
    const msgEl = h('div.b6-sp-exp');
    const cmpBar = h('div.b8-vs-strip');

    function buildSteps(target) {
      const n = MINI_RECS.length;
      let low = 0, high = n - 1, cmpCnt = 0;
      const out = [];
      out.push({
        low, high, mid: -1, cmpCnt, phase: 'init',
        msg: `探索キー <code class="ic">key = "${target}"</code> — 初期範囲は <b>low = 0, high = db-&gt;n - 1 = ${n - 1}</b> (候補 ${n} 件)。`,
      });
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        cmpCnt++;
        const mk = MINI_RECS[mid].key;
        const c = mk < target ? -1 : mk > target ? 1 : 0;
        if (c === 0) {
          out.push({
            low, high, mid, cmpCnt, phase: 'hit',
            msg: `<b>発見! (${cmpCnt} 回目)</b> <code class="ic">mid = (${low}+${high})/2 = ${mid}</code> → <code class="ic">strcmp("${mk}", "${target}") == 0</code>! <br><b>return db-&gt;record[${mid}].data</b> ("${MINI_RECS[mid].detail}")`,
          });
          return out;
        } else if (c < 0) {
          const nl = mid + 1;
          out.push({
            low, high, mid, cmpCnt, phase: 'right',
            msg: `${cmpCnt} 回目: <code class="ic">mid = ${mid} ("${mk}")</code> → <code class="ic">strcmp("${mk}", "${target}") &lt; 0</code> ("${mk}" より辞書順で後ろ!)<br>左半分 [0..${mid}] を捨てて <b>low = mid + 1 = ${nl}</b> へ更新!`,
          });
          low = nl;
        } else {
          const nh = mid - 1;
          out.push({
            low, high, mid, cmpCnt, phase: 'left',
            msg: `${cmpCnt} 回目: <code class="ic">mid = ${mid} ("${mk}")</code> → <code class="ic">strcmp("${mk}", "${target}") &gt; 0</code> ("${mk}" より辞書順で前!)<br>右半分 [${mid}..${n - 1}] を捨てて <b>high = mid - 1 = ${nh}</b> へ更新!`,
          });
          high = nh;
        }
      }
      out.push({
        low, high, mid: -1, cmpCnt, phase: 'miss',
        msg: `<b>打ち切り (${cmpCnt} 回で確定):</b> <code class="ic">low (${low}) &gt; high (${high})</code> となり範囲が空になりました → <b>return NULL;</b> ("NO RECORD")`,
      });
      return out;
    }

    function linCount(target) {
      for (let i = 0; i < MINI_RECS.length; i++) {
        if (MINI_RECS[i].key === target) return i + 1;
      }
      return MINI_RECS.length;
    }

    function paint() {
      const target = QUERIES[qi].key;
      const st = steps[si];
      cellsEl.innerHTML = '';
      MINI_RECS.forEach((r, idx) => {
        const outRange = st.phase === 'miss' || idx < st.low || idx > st.high;
        const isMid = idx === st.mid;
        const isHit = st.phase === 'hit' && isMid;
        const cls = [
          outRange && !isHit ? 'out' : '',
          isMid && !isHit ? 'mid' : '',
          isHit ? 'hit' : '',
        ].filter(Boolean).join('.');
        cellsEl.appendChild(h('div.t2-bs-cell' + (cls ? '.' + cls : ''),
          h('div.t2-bs-ptr',
            idx === st.low && st.phase !== 'miss' ? h('span.b6-tag-p', 'low=' + st.low) : null,
            isMid ? h('span.t2-tag-m', 'mid=' + st.mid) : null,
            idx === st.high && st.phase !== 'miss' ? h('span.b6-tag-nx', 'high=' + st.high) : null),
          h('small', '[' + idx + ']'),
          h('b', r.key),
          h('em', r.city)));
      });

      const lc = linCount(target);
      const bc = steps[steps.length - 1].cmpCnt;
      cmpBar.innerHTML =
        `<span class="b6-va-badge">このキーの線形探索: <b>${lc}</b> 回比較</span> ` +
        `<span class="b6-va-badge ok">二分探索: <b>${bc}</b> 回比較</span> ` +
        `<span class="c-mute" style="font-size:12px">（2,700件フルセットなら線形 最大 <b>2,700 回</b> vs 二分 最大 <b>12 回</b>!）</span>`;

      msgEl.className = 'b6-sp-exp' + (st.phase === 'hit' ? ' ok' : st.phase === 'miss' ? ' ng' : '');
      msgEl.innerHTML = st.msg;
    }

    function selectQ(k) {
      qi = k;
      steps = buildSteps(QUERIES[qi].key);
      si = 0;
      [...qTabs.children].forEach((b, j) => b.classList.toggle('on', j === qi));
      paint();
    }

    const qTabs = h('div.tabs', QUERIES.map((q, k) =>
      h('button', { type: 'button', onclick: () => selectQ(k) }, q.label)
    ));

    selectQ(0);
    return h('div.b6-wid',
      h('div.b6-wid-head',
        h('div.b6-wid-t', h('span.chip.ptr', 'BINARY SEARCH'), h('b', 'iata_mini.csv (10空港) で追う db_binary_search — low / mid / high の動き')),
        h('div.b6-wid-ctl',
          h('button.btn.sm', { type: 'button', onclick: () => { si = Math.max(0, si - 1); paint(); } }, '← 戻る'),
          h('button.btn.sm.ptr', { type: 'button', onclick: () => { si = (si + 1) % steps.length; paint(); } }, '1 ステップ進める →'),
          h('button.btn.sm.ghost', { type: 'button', onclick: () => { si = steps.length - 1; paint(); } }, '結果へ'))),
      h('div', { style: { marginBottom: '10px' } }, qTabs),
      cellsEl,
      cmpBar,
      msgEl);
  }

  /* -----------------------------------------------------------------------
   * 3. ハッシュ関数 db_hash_f & クローズドハッシュ 16 枠シミュレータ (課題 8-6 直結)
   *    iata_mini.csv 10 件を順番に入れると test6-exp.txt と完全一致する様子を再現!
   * ----------------------------------------------------------------------- */
  function hashCollisionLab() {
    const M = 16;
    let loadCount = 10; // 0..10 件までスライダー/ボタンで挿入経過を見られる
    let probeKey = 'SFO'; // SFO は h=14→15→0 と2回衝突してラップアラウンドする最高の例!

    const calcBox = h('div.b8-hash-calc');
    const tableEl = h('div.b8-hash-grid');
    const traceEl = h('div.b6-sp-exp');
    const keyInput = h('input.b8-key-in', {
      type: 'text', value: probeKey, maxLength: 3,
      placeholder: '例: SFO',
      oninput: (e) => {
        const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
        e.target.value = v;
        if (v.length === 3) { probeKey = v; paint(); }
      },
    });

    const PRESET_KEYS = ['SFO', 'PEK', 'ITM', 'AAC', 'KIX', 'HND', 'AAA'];

    function buildTable(cnt) {
      const tbl = Array.from({ length: M }, () => null);
      const logs = [];
      for (let i = 0; i < cnt; i++) {
        const rec = MINI_RECS[i];
        const hc = hashCalc(rec.key, M);
        let h0 = hc.h, hCur = h0, hops = 0;
        const visited = [hCur];
        while (tbl[hCur] !== null) {
          hCur = (hCur + 1) % M;
          hops++;
          visited.push(hCur);
        }
        tbl[hCur] = { key: rec.key, city: rec.city, origH: h0, hops };
        logs.push({ key: rec.key, origH: h0, finalH: hCur, hops, visited });
      }
      return { tbl, logs };
    }

    function paint() {
      const { tbl } = buildTable(loadCount);
      const hc = hashCalc(probeKey, M);

      // 1) db_hash_f 計算式表示
      const stRows = hc.steps.map((s, idx) =>
        `i=${idx} ('${s.ch}'-'A'=${s.d}): v = (${s.prev} &lt;&lt; 5) + ${s.d} = <b>${s.v}</b>`
      ).join(' → ');
      calcBox.innerHTML =
        `<div class="b8-hc-formula"><span class="chip val">db_hash_f("${probeKey}")</span> ` +
        `${stRows} ⇒ <code class="ic">${hc.v} % 16 = <b>${hc.h}</b></code></div>`;

      // 2) probeKey を db_hash_search で探す軌跡
      const probeVisited = [];
      let ph = hc.h, foundAt = -1, stoppedNull = -1;
      for (let cnt = 0; cnt < M; cnt++) {
        probeVisited.push(ph);
        if (tbl[ph] === null) { stoppedNull = ph; break; }
        if (tbl[ph].key === probeKey) { foundAt = ph; break; }
        ph = (ph + 1) % M;
      }

      tableEl.innerHTML = '';
      for (let idx = 0; idx < M; idx++) {
        const cell = tbl[idx];
        const pStep = probeVisited.indexOf(idx);
        const isHit = idx === foundAt;
        const isStop = idx === stoppedNull;
        const cls = [
          cell ? 'filled' : 'empty',
          cell && cell.hops > 0 ? 'shifted' : '',
          pStep >= 0 ? 'probed' : '',
          isHit ? 'hit' : '',
          isStop ? 'stopnull' : '',
        ].filter(Boolean).join('.');

        tableEl.appendChild(h('button.b8-hcell' + (cls ? '.' + cls : ''), {
          type: 'button',
          onclick: () => { if (cell) { probeKey = cell.key; keyInput.value = probeKey; paint(); } },
        },
        pStep >= 0 ? h('span.b8-pstep', (pStep + 1) + '番目') : null,
        h('small', '[' + idx + ']'),
        h('b', cell ? cell.key : 'NULL'),
        h('span.b8-horig', cell ? (cell.hops ? `元h=${cell.origH}(+${cell.hops})` : `h=${cell.origH}`) : '空き')));
      }

      traceEl.className = 'b6-sp-exp ' + (foundAt >= 0 ? 'ok' : 'ng');
      const pathStr = probeVisited.map((p, k) => {
        if (p === foundAt) return `<b>[${p}] "${probeKey}" 一致!</b>`;
        if (p === stoppedNull) return `<b>[${p}] data==NULL (空!)</b>`;
        return `[${p}] "${tbl[p].key}"≠"${probeKey}"` + (p === M - 1 ? ' <span class="c-addr">(末尾15→0へ巡回!)</span>' : '');
      }).join(' → ');

      if (foundAt >= 0) {
        traceEl.innerHTML =
          `<b>検索トレース ("${probeKey}"):</b> 開始 <code class="ic">h = ${hc.h}</code> から ${pathStr}<br>` +
          `比較 <b>${probeVisited.length} 回</b>で発見! ` +
          (probeKey === 'SFO' && loadCount === 10
            ? '★ <b>test6-exp.txt で [0] が SFO になる理由:</b> SFO の本来のハッシュ値は <b>14</b> ですが、[14] に FCO、[15] に JRO が先に入っていたため <code class="ic">14 → 15 → 0 (h == m で 0 に戻す!)</code> と巡回して [0] に格納されています!'
            : '');
      } else {
        traceEl.innerHTML =
          `<b>検索トレース ("${probeKey}"):</b> 開始 <code class="ic">h = ${hc.h}</code> から ${pathStr}<br>` +
          `空スロット (<code class="ic">data == NULL</code>) に到達した時点で「これより先には存在しない」と確定し、わずか <b>${probeVisited.length} 回</b>で <code class="ic">return NULL;</code> できます!`;
      }
    }

    const qBtns = h('div.tabs', PRESET_KEYS.map((k) =>
      h('button', { type: 'button', onclick: () => { probeKey = k; keyInput.value = k; paint(); } },
        k === 'SFO' ? 'SFO (14→15→0巡回!)' : k === 'HND' ? 'HND (未登録)' : k)
    ));

    const stepCtl = h('div.b8-load-ctl',
      h('span.c-mute', { style: { fontSize: '12px' } }, 'iata_mini.csv 読込件数:'),
      h('button.btn.sm', { type: 'button', onclick: () => { loadCount = Math.max(1, loadCount - 1); cntSpan.textContent = loadCount + ' / 10 件'; paint(); } }, '−1'),
      (function () { return (window._b8cnt = h('b', { style: { fontFamily: 'var(--f-mono)', minWidth: '68px', textAlign: 'center' } }, '10 / 10 件')); })(),
      h('button.btn.sm', { type: 'button', onclick: () => { loadCount = Math.min(10, loadCount + 1); cntSpan.textContent = loadCount + ' / 10 件'; paint(); } }, '+1'),
      h('button.btn.sm.ghost', { type: 'button', onclick: () => { loadCount = 10; cntSpan.textContent = '10 / 10 件'; paint(); } }, '全10件 (= test6-exp.txt)'));
    const cntSpan = stepCtl.querySelector('b');

    paint();
    return h('div.b6-wid',
      h('div.b6-wid-head',
        h('div.b6-wid-t', h('span.chip.ptr', 'CLOSED HASH SIMULATOR'), h('b', 'db_hash_f 計算 & クローズドハッシュ (16枠) の衝突・巡回シミュレータ')),
        stepCtl),
      calcBox,
      h('div.b8-probe-bar',
        h('span', { style: { fontSize: '12.5px', fontWeight: '700' } }, '検索したい3文字キー:'),
        keyInput,
        qBtns),
      tableEl,
      traceEl);
  }

  /* -----------------------------------------------------------------------
   * 4. クローズドハッシュ vs オープンハッシュ (オプション課題 8-1) 比較ラボ
   * ----------------------------------------------------------------------- */
  function openHashLab() {
    // M = 8 バケットに 6 空港を入れて「隣のバケットを侵食するか vs リストでぶら下げるか」を比較
    const SAMPLE = [
      { key: 'AAC', h: 2 },
      { key: 'PEK', h: 2 }, // AAC と衝突!
      { key: 'NRT', h: 3 }, // クローズドだと PEK が [3] を奪っているため [4] へ押し出される二次衝突!
      { key: 'SFO', h: 6 },
      { key: 'JRO', h: 6 }, // SFO と衝突!
      { key: 'FCO', h: 7 }, // クローズドだと JRO が [7] を奪っているため [0] へ押し出される!
    ];
    let mode = 'open'; // 'open' | 'closed'
    const host = h('div');
    const note = h('div.b6-sp-exp.ok');

    function paint() {
      [...tabs.children].forEach((b) => b.classList.toggle('on', b.dataset.m === mode));
      host.innerHTML = '';
      if (mode === 'open') {
        const buckets = Array.from({ length: 8 }, () => []);
        SAMPLE.forEach((s) => buckets[s.h].unshift(s.key)); // 先頭挿入 (または末尾挿入)
        const wrap = h('div.b8-open-list');
        buckets.forEach((chain, idx) => {
          const row = h('div.b8-open-row',
            h('span.b8-open-head', `record[${idx}] (ダミー)`),
            h('span.b8-open-arr', chain.length ? '→' : '— NULL'));
          chain.forEach((k, j) => {
            row.appendChild(h('span.b8-open-node',
              h('b', k),
              h('small', 'data•'),
              h('i', j === chain.length - 1 ? 'NULL' : '→')));
          });
          wrap.appendChild(row);
        });
        host.appendChild(wrap);
        note.innerHTML =
          '<b>オープンハッシュ法 (オプション課題 8-1 / iata_db2.c):</b> <code class="ic">h = 2</code> で衝突した <b>AAC</b> と <b>PEK</b> は <code class="ic">record[2].next</code> の線形リストにぶら下がるため、隣の <code class="ic">record[3]</code> (NRT の部屋) を一切邪魔しません! <b>db_delete</b> では各バケットのリスト節点と <code class="ic">p-&gt;data</code> の<b>両方</b>を <code class="ic">free</code> します。';
      } else {
        const slots = Array(8).fill(null);
        SAMPLE.forEach((s) => {
          let p = s.h, hops = 0;
          while (slots[p] !== null) { p = (p + 1) % 8; hops++; }
          slots[p] = { key: s.key, orig: s.h, hops };
        });
        const grid = h('div.b8-hash-grid');
        slots.forEach((c, idx) => {
          grid.appendChild(h('div.b8-hcell.' + (c ? (c.hops ? 'filled.shifted' : 'filled') : 'empty'),
            h('small', '[' + idx + ']'),
            h('b', c ? c.key : 'NULL'),
            h('span.b8-horig', c ? (c.hops ? `元h=${c.orig}(+${c.hops}玉突き!)` : `h=${c.orig}`) : '空き')));
        });
        host.appendChild(grid);
        note.innerHTML =
          '<b>クローズドハッシュ法の「玉突き衝突 (クラスタリング)」:</b> PEK (元h=2) が隣の [3] にあふれたせいで、後から来た <b>NRT (本来のh=3) まで [4] へ押し出されてしまいます</b>。だからこそクローズドハッシュでは配列サイズ <code class="ic">MAX_RECORDS = 6000</code> をデータ数 2,700 の<b>約 2 倍以上</b>とって空き部屋を十分に確保しています!';
      }
    }

    const tabs = h('div.tabs', [
      ['open', 'オープンハッシュ法 (線形リスト / Opt 8-1)'],
      ['closed', 'クローズドハッシュ法 (玉突き衝突を見る)'],
    ].map(([m, lb]) => h('button', { type: 'button', 'data-m': m, onclick: () => { mode = m; paint(); } }, lb)));

    paint();
    return h('div.b6-wid',
      h('div.b6-wid-head',
        h('div.b6-wid-t', h('span.chip.val', 'OPEN VS CLOSED HASH'), h('b', '衝突したときどうする? — オープンハッシュ (チェイン法) と玉突き衝突の比較')),
        tabs),
      host,
      note);
  }

  /* -----------------------------------------------------------------------
   * 5. 2,700 空港フルセット実測ベンチマーク・エクスプローラ (8-3, 8-5, 8-7 対応)
   * ----------------------------------------------------------------------- */
  function benchExplorer() {
    const tm = D.timing || {};
    const keys = tm.keys || [
      { key: 'AAC', desc: '先頭 (1番目)' },
      { key: 'CXI', desc: '500番目' },
      { key: 'IYK', desc: '1000番目' },
      { key: 'MVD', desc: '1500番目' },
      { key: 'SJW', desc: '2000番目' },
      { key: 'YFB', desc: '2500番目' },
      { key: 'ZYL', desc: '最後 (2700番目)' },
      { key: 'AAA', desc: '存在しない' },
    ];
    let optFlag = 'O2';
    let selKey = 'ZYL';

    const body = h('div.b6-rc-body');
    const note = h('div.b6-rc-sum');

    function paint() {
      [...oTabs.children].forEach((b) => b.classList.toggle('on', b.dataset.o === optFlag));
      [...kTabs.children].forEach((b) => b.classList.toggle('on', b.dataset.k === selKey));

      const lin = ((tm['lin_' + optFlag] || {})[selKey]) || 0;
      const bin = ((tm['bin_' + optFlag] || {})[selKey]) || 0;
      const hsh = ((tm['hash_' + optFlag] || {})[selKey]) || 0;
      const opn = ((tm['open_' + optFlag] || {})[selKey]) || 0;
      const cmps = (tm.cmps && tm.cmps[selKey]) || [0, 0, 0];

      const rows = [
        { name: '① 線形探索 db_linear_search', tag: `比較 ${cmps[0]} 回 · O(n)`, v: lin, col: 'var(--pink)' },
        { name: '② 二分探索 db_binary_search', tag: `比較 ${cmps[1]} 回 · O(log n)`, v: bin, col: 'var(--sky)' },
        { name: '③ クローズドハッシュ db_hash_search', tag: `比較 ${cmps[2]} 回 · O(1)`, v: hsh, col: 'var(--mint)' },
        { name: '④ オープンハッシュ (Opt 8-1)', tag: 'リスト走査 · O(1)', v: opn, col: 'var(--lav)' },
      ];
      const mx = Math.max(...rows.map((r) => r.v), 0.01);
      body.innerHTML = '';
      rows.forEach((r) => {
        const pct = Math.max(0.6, Math.min(100, (r.v / mx) * 100));
        body.appendChild(h('div.b6-rc-row',
          h('div.b6-rc-lbl', h('b', r.name), ' ', h('span.b6-rc-tag', r.tag)),
          h('div.b6-rc-track', h('div.b6-rc-fill', { style: { width: pct + '%', background: r.col } })),
          h('div.b6-rc-num', h('b', (r.v * 1000).toFixed(2) + ' ms'), h('small', r.v.toFixed(6) + ' sec / 10万回'))));
      });

      const kInfo = keys.find((x) => x.key === selKey) || { key: selKey, desc: '' };
      if (selKey === 'AAC') {
        note.innerHTML = `<b>${selKey} (${kInfo.desc}):</b> 線形探索は<b>たまたま 1 番目で見つかる (比較 1 回)</b> ためハッシュ法と並んで最速! 逆に二分探索は真ん中 (1350番目) から半分ずつ寄せるため 11 回比較します。`;
      } else if (selKey === 'YFB') {
        note.innerHTML = `<b>${selKey} (${kInfo.desc}):</b> 線形探索は 2,500 回比較して大苦戦。またクローズドハッシュでもこの付近でクラスタリング (連続衝突 39 回) が起きて少し時間が増える一方、<b>二分探索はどんなキーでも安定して 11 回 (約 4.7 ms)</b> で終わります!`;
      } else if (['AAA', 'LLL', 'ZZZ'].includes(selKey)) {
        note.innerHTML = `<b>${selKey} (${kInfo.desc}):</b> 線形探索では<b>存在しないと分かるまでに必ず全 2,700 件を最後まで調べる最悪ケース</b>になります! 二分探索なら 11〜12 回、ハッシュ法なら空スロットを見て 1〜2 回で即座に「NO RECORD」と判定できます。`;
      } else {
        const speedup = bin > 0 ? Math.round(lin / bin) : '—';
        note.innerHTML = `<b>${selKey} (${kInfo.desc}) · gcc -${optFlag} 実測 (10万回検索):</b> 線形探索は格納位置に比例して遅くなりますが、<b>二分探索は約 ${speedup} 倍高速</b>、さらに<b>ハッシュ法は位置に無関係な O(1)</b> で完了します!`;
      }
    }

    const oTabs = h('div.tabs', [['O0', 'gcc -O0 (最適化なし)'], ['O2', 'gcc -O2 (最適化あり)']].map(([o, lb]) =>
      h('button', { type: 'button', 'data-o': o, onclick: () => { optFlag = o; paint(); } }, lb)
    ));
    const kTabs = h('div.tabs', keys.map((k) =>
      h('button', { type: 'button', 'data-k': k.key, onclick: () => { selKey = k.key; paint(); } }, `${k.key} (${k.desc})`)
    ));

    paint();
    return h('div.b6-wid',
      h('div.b6-wid-head',
        h('div.b6-wid-t', h('span.chip.addr', '2,700 AIRPORTS GCC BENCHMARK'), h('b', '2,700 空港 × 10万回検索の実測比較! キーの位置でどう変わるか?')),
        oTabs),
      h('div', { style: { marginBottom: '12px' } }, kTabs),
      body,
      note);
  }

  window.B8_CODE = { essenceMap, dbAnatomyLab, binarySearchLab, hashCollisionLab, openHashLab, benchExplorer };
})();
