/* =========================================================================
 *  B6 リスト処理 — 直感から本質へ導くインタラクティブ・ビジュアルラボ
 *   0. essenceMap : 30秒で掴む B6 の本質マップ (配列 vs リスト vs 二分探索木)
 *   1. vsArray    : 配列の「ずらし O(n)」 vs リストの「矢印 2 本 O(1)」同時比較
 *   2. spliceLab  : insert_node の順番シミュレータ (正順 vs 逆順 = 自己ループ事故)
 *   3. lookahead  : 通常走査 vs 先読み走査 (p->next->val) & remove_node(p) 体験
 *   4. raceLab    : スケーリング体感レース O(n) vs O(log n) + 実測グラフ連動
 *   5. bstLab     : 二分探索木ビルダー + 半分捨て探索 + 走査順 (先行/中間/後行)
 * ========================================================================= */
(function () {
  'use strict';
  const { h, codeBlock, icon } = U;
  const D = window.B6_DATA || { timing: {} };

  /* -----------------------------------------------------------------------
   * 0. 30秒で掴む「直感 → 本質」マップ
   *    スクロールする前に「なぜダミー？ なぜ2行の順？ なぜ先読み？ なぜ木？」を
   *    カードをめくる感覚で直感からC言語の1行へ結びつける
   * ----------------------------------------------------------------------- */
  function essenceMap() {
    const cards = [
      {
        tag: 'ESSENCE 01 · 構造',
        color: 'var(--peach)',
        intuition: '電車の車両を「連結器」でつなぐ',
        why: '車両がヤードのどこに散らばっていても、連結器さえつながっていれば 1 本の列車になる。途中に 1 両足すのも連結器を 2 か所付け替えるだけ。',
        essence: '並び順はメモリの番地順ではなく、ポインタ next が握る。',
        code: 'typedef struct list_node_s {\n  int val;\n  struct list_node_s *next;\n} list_node_t;',
        jump: '#node',
      },
      {
        tag: 'ESSENCE 02 · ダミーと挿入',
        color: 'var(--pink)',
        intuition: '先頭に「空っぽの機関車 (ダミー)」を常につけておく',
        why: '機関車があれば「先頭への連結」も「途中への連結」もすべて「ある車両の直後につなぐ」という 1 つの作業に統一でき、if 文の場合分けが消える。そして後ろの車両を先に握ってから手前を付け替える。',
        essence: 'ダミーで場合分けを消し、new->next を先に結んで鎖を切らない。',
        code: 'new_node->next = n->next;  /* ① 後ろを握る */\nn->next = new_node;        /* ② 手前を繋ぐ */',
        jump: '#insert',
      },
      {
        tag: 'ESSENCE 03 · 先読みと削除',
        color: 'var(--mint)',
        intuition: '片道切符の列車では「1 両手前」から次を覗く',
        why: '片方向リストは後ろへ戻れない。消したい車両に着いてからでは手前の連結器に手が届かないから、1 つ手前 p に立ったまま p->next->val を覗き見る。',
        essence: 'p = head_p から p->next を見る「先読み」で、常に直前 p を手元に残す。',
        code: 'for (p = head_p; p->next != NULL; p = p->next)\n  if (p->next->val == val) remove_node(p);',
        jump: '#traverse',
      },
      {
        tag: 'ESSENCE 04 · 計算量と二分木',
        color: 'var(--sky)',
        intuition: '一本道 (O(n)) を、二股の案内板 (O(log n)) に変える',
        why: 'リストは整列しても真ん中に飛べないため先頭から平均 n/2 個見るしかない。矢印を左右 2 本に増やして「小は左・大は右」にすれば、1 回の比較で残り半分をごっそり捨てられる。',
        essence: 'n=25,000 でもリストの 12,500 回が、二分探索木なら約 15 回になる。',
        code: 'while (n != NULL) {\n  if (val == n->data) return n;\n  n = (val < n->data) ? n->left : n->right;\n}',
        jump: '#tree',
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
            h('span.b6-ess-pill.ptr', '2. 本質 (C の言葉にすると)'),
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
          h('b.b6-wtitle', '読む前に 30 秒 — 直感から本質へワープする 4 枚の地図')),
        h('span.c-mute', { style: { fontSize: '12.5px' } }, 'カードを押すと「直感 → 本質のコード」が切り替わります')),
      tabs,
      detail);
  }

  /* -----------------------------------------------------------------------
   * 1. 配列 vs リスト: 「先頭に 1 個入れる」コストの比較
   * ----------------------------------------------------------------------- */
  function vsArray() {
    let n = 8;
    let running = false;
    let timer = null;
    const arrHost = h('div.b6-va-lane');
    const lstHost = h('div.b6-va-lane');
    const arrCnt = h('b.b6-va-cnt', '0');
    const lstCnt = h('b.b6-va-cnt', '0');
    const status = h('div.b6-va-msg', '「先頭に 99 を挿入!」を押して、配列とリストの仕事量の違いを見比べよう。');

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
      running = false;
      runBtn.textContent = '▶ 先頭に 99 を挿入!';
    }

    function buildIdle() {
      stop();
      arrCnt.textContent = '0 回';
      lstCnt.textContent = '0 本';
      arrHost.innerHTML = '';
      lstHost.innerHTML = '';
      const vals = Array.from({ length: n }, (_, i) => (i + 1) * 10);
      // 配列レーン
      const ag = h('div.b6-va-cells');
      vals.forEach((v, i) => ag.appendChild(h('div.b6-va-cell', { 'data-i': i }, h('small', 'a[' + i + ']'), h('b', String(v)))));
      ag.appendChild(h('div.b6-va-cell.empty', { 'data-i': n }, h('small', 'a[' + n + ']'), h('b', '空')));
      arrHost.appendChild(ag);

      // リストレーン
      const lg = h('div.b6-va-nodes');
      lg.appendChild(h('div.b6-va-node.dummy', h('small', 'head_p'), h('b', 'ダミー')));
      vals.slice(0, Math.min(n, 6)).forEach((v) => {
        lg.append(h('span.b6-va-ar', '→'), h('div.b6-va-node', h('small', 'node'), h('b', String(v))));
      });
      if (n > 6) lg.append(h('span.b6-va-ar', '→'), h('div.b6-va-node.more', h('small', '…'), h('b', '他 ' + (n - 6) + ' 個')));
      lg.append(h('span.b6-va-ar', '→'), h('span.b6-va-null', 'NULL'));
      lstHost.appendChild(lg);
      status.innerHTML = '要素数 <b>n = ' + n + '</b>。配列で先頭 <code class="ic">a[0]</code> に入れるには後ろを全部ずらす必要があります。';
    }

    function runSim() {
      if (running) { buildIdle(); return; }
      buildIdle();
      running = true;
      runBtn.textContent = '■ リセット';

      const cells = [...arrHost.querySelectorAll('.b6-va-cell')];
      let step = 0;
      // リスト側は最初の2ステップで完了させる
      const lg = lstHost.querySelector('.b6-va-nodes');
      const newEl = h('div.b6-va-node.new', h('small', 'new'), h('b', '99'));
      const newAr = h('span.b6-va-ar.new', '→');

      timer = setInterval(() => {
        cells.forEach((c) => c.classList.remove('moving', 'done'));
        // リスト側更新
        if (step === 0) {
          lg.insertBefore(newAr, lg.children[1]);
          lg.insertBefore(newEl, newAr);
          newEl.classList.add('step1');
          lstCnt.textContent = '1 本 (new->next = head->next)';
        } else if (step === 1) {
          newEl.classList.remove('step1');
          newEl.classList.add('done');
          lstCnt.textContent = '2 本で完了! (O(1))';
        }

        // 配列側: 後ろから1つずつずらす (k = n - 1 - step)
        if (step < n) {
          const k = n - 1 - step;
          const srcVal = (k + 1) * 10;
          cells[k + 1].querySelector('b').textContent = String(srcVal);
          cells[k + 1].classList.remove('empty');
          cells[k + 1].classList.add('moving');
          cells[k].querySelector('b').textContent = '→';
          cells[k].classList.add('moving');
          arrCnt.textContent = (step + 1) + ' 回ずらし中…';
          status.innerHTML = '配列: <code class="ic">a[' + (k + 1) + '] = a[' + k + ']</code> をコピー中… 一方リストは<b>矢印 2 本でもう終わっています!</b>';
        } else if (step === n) {
          cells[0].querySelector('b').textContent = '99';
          cells[0].classList.add('done');
          arrCnt.textContent = n + ' 回ずらし + 代入 1 回 (O(n))';
          status.innerHTML = '<b>比較完了!</b> n = ' + n + ' のとき配列は <b>' + n + ' 回</b>の移動。n = 10,000 なら 10,000 回になりますが、リストは n がいくつでも<b>たった 2 本の矢印操作</b>です。';
          clearInterval(timer);
          timer = null;
          running = false;
          runBtn.textContent = '↻ もう一度挿入する';
        }
        step++;
      }, n > 10 ? 220 : 340);
    }

    const runBtn = h('button.btn.sm.ptr', { type: 'button', onclick: runSim }, '▶ 先頭に 99 を挿入!');
    const sizeBtns = [5, 8, 14].map((v) => h('button.sh-chip' + (v === n ? '.on' : ''), {
      type: 'button',
      onclick: (e) => {
        n = v;
        [...e.currentTarget.parentNode.children].forEach((b) => b.classList.remove('on'));
        e.currentTarget.classList.add('on');
        buildIdle();
      },
    }, 'n = ' + v));

    const el = h('div.b6-wid',
      h('div.b6-wid-head',
        h('div.b6-wid-t', h('span.chip.val', 'COMPARE'), h('b', '配列の「全部ずらし」 vs リストの「矢印 2 本」')),
        h('div.b6-wid-ctl', h('span.c-mute', { style: { fontSize: '12px' } }, '要素数:'), sizeBtns, runBtn)),
      h('div.b6-va-body',
        h('div.b6-va-row',
          h('div.b6-va-meta', h('b', '配列 int a[]'), h('small', 'メモリに隙間なく並ぶ'), h('div.b6-va-badge.warn', '仕事量: ', arrCnt)),
          arrHost),
        h('div.b6-va-row',
          h('div.b6-va-meta', h('b', 'リスト list_node_t'), h('small', 'ポインタでつながる'), h('div.b6-va-badge.ok', '仕事量: ', lstCnt)),
          lstHost)),
      status);
    buildIdle();
    return el;
  }

  /* -----------------------------------------------------------------------
   * 2. insert_node 2行シミュレータ: なぜ順番を逆にすると大惨事になるのか？
   * ----------------------------------------------------------------------- */
  function spliceLab() {
    let mode = 'good'; // 'good' | 'bad'
    let step = 0; // 0: create_node直後, 1: 1行目実行後, 2: 2行目実行後

    const svgHost = h('div.b6-sp-svg');
    const codeHost = h('div.b6-sp-code');
    const expHost = h('div.b6-sp-exp');

    const MODES = {
      good: {
        label: '✓ 正しい順番 (後ろを先に握る)',
        lines: [
          'list_node_t *new_node = create_node(99);',
          'new_node->next = n->next;  /* ① 先に後ろを握る */',
          'n->next = new_node;        /* ② n の矢印を付け替え */',
        ],
        steps: [
          {
            hl: [1],
            msg: '<b>準備:</b> <code class="ic">create_node(99)</code> でヒープに新しい節点を作ったところ。まだ <code class="ic">n</code> (ダミー) は <b>[5]</b> を指しています。',
          },
          {
            hl: [2],
            msg: '<b>① <code class="ic">new_node-&gt;next = n-&gt;next;</code></b> — <code class="ic">n-&gt;next</code> (つまり [5] の番地) を <code class="ic">new_node-&gt;next</code> にコピー! これで <b>new_node と n の両方が [5] を握っている</b>安全な状態です。',
          },
          {
            hl: [3],
            msg: '<b>② <code class="ic">n-&gt;next = new_node;</code></b> — 安心して <code class="ic">n</code> の矢印を <code class="ic">new_node</code> に付け替え! <b>n → [99] → [5] → [3] → NULL</b> と一本の鎖がつながりました。',
          },
        ],
      },
      bad: {
        label: '✗ 逆の順番 (よくあるバグ!)',
        lines: [
          'list_node_t *new_node = create_node(99);',
          'n->next = new_node;        /* ① 先に n を変えてしまう! */',
          'new_node->next = n->next;  /* ② あっ… n->next はもう!? */',
        ],
        steps: [
          {
            hl: [1],
            msg: '<b>準備:</b> ここまでは同じ。<code class="ic">n</code> の直後に <code class="ic">new_node</code> (99) を入れたいのですが…',
          },
          {
            hl: [2],
            msg: '<b>① <code class="ic">n-&gt;next = new_node;</code> を先にやると…</b> <code class="ic">n</code> が持っていた <b>[5] への唯一の矢印が上書きされて消滅!</b> [5] と [3] はヒープの海に漂流 (メモリリーク) します。',
          },
          {
            hl: [3],
            msg: '<b>② <code class="ic">new_node-&gt;next = n-&gt;next;</code></b> — いま <code class="ic">n-&gt;next</code> に入っているのは <b>new_node 自身!</b> 自分を指す<b>無限ループの輪</b>ができ、<code class="ic">list_print</code> が永久に止まりません。',
          },
        ],
      },
    };

    function paint() {
      const M = MODES[mode];
      // SVG 描画
      const W = 680, H = 220;
      const box = (x, y, title, val, addr, cls, lost) => `
        <g class="sp-node ${cls || ''}" opacity="${lost ? 0.32 : 1}">
          <rect x="${x}" y="${y}" width="116" height="54" rx="12" fill="#fff" stroke="#3b2738" stroke-width="2.2"/>
          <line x1="${x + 68}" y1="${y}" x2="${x + 68}" y2="${y + 54}" stroke="#3b2738" stroke-width="1.8" stroke-dasharray="3 2"/>
          <text x="${x + 8}" y="${y - 7}" font-family="var(--f-mono)" font-size="11" font-weight="700" fill="#6a5265">${title}</text>
          <text x="${x + 112}" y="${y - 7}" text-anchor="end" font-family="var(--f-mono)" font-size="10" fill="#d97f00">${addr}</text>
          <text x="${x + 34}" y="${y + 33}" text-anchor="middle" font-family="var(--f-disp)" font-size="19" font-weight="700" fill="#3b2738">${val}</text>
          <circle cx="${x + 92}" cy="${y + 27}" r="5" fill="#f2467f"/>
          ${lost ? `<text x="${x + 58}" y="${y + 72}" text-anchor="middle" font-family="var(--f-jp)" font-size="11" font-weight="800" fill="#e5484d">行方不明 (リーク)</text>` : ''}
        </g>`;

      const lost = mode === 'bad' && step >= 1;
      let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="insert_node のポインタつなぎ替え図">
        <defs>
          <marker id="spa-ok" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#3b2738"/></marker>
          <marker id="spa-new" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#1497ab"/></marker>
          <marker id="spa-ptr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#f2467f"/></marker>
          <marker id="spa-bad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#e5484d"/></marker>
        </defs>`;

      // ノード配置: n(head) at (30, 34), [5] at (270, 34), [3] at (450, 34), new_node at (145, 138)
      s += box(28, 34, 'n (head_p)', '0', '@5000', 'dummy', false);
      s += box(268, 34, '元の先頭', '5', '@5016', '', lost);
      s += box(448, 34, '次の節点', '3', '@5032', '', lost);
      s += `<text x="625" y="66" font-family="var(--f-mono)" font-size="13" font-weight="700" fill="${lost ? '#b8a3b1' : '#6a5265'}">NULL</text>`;
      s += box(142, 142, 'new_node', '99', '@5048', 'new', false);

      // [5] -> [3] -> NULL (常時)
      s += `<path d="M360 61 L 444 61" stroke="#3b2738" stroke-width="2.2" opacity="${lost ? 0.28 : 1}" marker-end="url(#spa-ok)"/>`;
      s += `<path d="M540 61 L 614 61" stroke="#3b2738" stroke-width="2.2" opacity="${lost ? 0.28 : 1}" marker-end="url(#spa-ok)"/>`;

      // n->next の矢印 (起点: 120, 61)
      if ((mode === 'good' && step < 2) || (mode === 'bad' && step === 0)) {
        // n -> [5]
        s += `<path d="M120 61 L 264 61" stroke="#3b2738" stroke-width="2.4" fill="none" marker-end="url(#spa-ok)"/>`;
      } else {
        // n -> new_node
        const col = mode === 'bad' ? '#e5484d' : '#f2467f';
        const mk = mode === 'bad' ? 'spa-bad' : 'spa-ptr';
        s += `<path d="M120 61 C 145 61, 115 168, 138 168" stroke="${col}" stroke-width="3" fill="none" marker-end="url(#${mk})"/>`;
        if (mode === 'bad' && step === 1) {
          s += `<path d="M120 61 L 264 61" stroke="#e5484d" stroke-width="1.8" stroke-dasharray="5 5" opacity=".45" fill="none"/>`;
          s += `<text x="195" y="50" text-anchor="middle" font-family="var(--f-jp)" font-size="11" font-weight="900" fill="#e5484d">✕ 矢印が消えた!</text>`;
        }
      }

      // new_node->next の矢印 (起点: 234, 169)
      if (step === 0 || (mode === 'bad' && step === 1)) {
        s += `<text x="292" y="174" font-family="var(--f-mono)" font-size="12" font-weight="700" fill="#8a7184">→ NULL</text>`;
      } else if (mode === 'good' && step >= 1) {
        // new_node -> [5]
        s += `<path d="M234 169 C 275 169, 240 72, 265 68" stroke="#1497ab" stroke-width="3" fill="none" marker-end="url(#spa-new)"/>`;
        s += `<text x="318" y="148" font-family="var(--f-jp)" font-size="11.5" font-weight="800" fill="#1497ab">① 後ろを握った!</text>`;
      } else if (mode === 'bad' && step === 2) {
        // 自己ループ! new_node -> new_node
        s += `<path d="M234 169 C 315 169, 305 216, 200 212 C 155 210, 148 202, 162 198" stroke="#e5484d" stroke-width="3" fill="none" marker-end="url(#spa-bad)"/>`;
        s += `<text x="368" y="192" font-family="var(--f-jp)" font-size="12" font-weight="900" fill="#e5484d">∞ 自分自身を指して無限ループ!</text>`;
      }

      s += '</svg>';
      svgHost.innerHTML = s;

      codeHost.innerHTML = '';
      codeHost.appendChild(codeBlock(M.lines.join('\n'), { hl: M.steps[step].hl }));
      expHost.className = 'b6-sp-exp ' + (mode === 'bad' && step >= 1 ? 'ng' : step === 2 ? 'ok' : '');
      expHost.innerHTML = M.steps[step].msg;

      [...modeTabs.children].forEach((b) => b.classList.toggle('on', b.dataset.m === mode));
      [...stepBtns.children].forEach((b, k) => b.classList.toggle('on', k === step));
    }

    const modeTabs = h('div.tabs', [
      h('button', { type: 'button', 'data-m': 'good', onclick: () => { mode = 'good'; step = 0; paint(); } }, MODES.good.label),
      h('button', { type: 'button', 'data-m': 'bad', onclick: () => { mode = 'bad'; step = 0; paint(); } }, MODES.bad.label),
    ]);
    const stepBtns = h('div.b6-sp-steps', ['準備: create_node', '1 行目を実行', '2 行目を実行'].map((lb, k) =>
      h('button.btn.sm', { type: 'button', onclick: () => { step = k; paint(); } }, (k === 0 ? '0. ' : k + '. ') + lb)
    ));
    const nextBtn = h('button.btn.sm.ptr', { type: 'button', onclick: () => { step = (step + 1) % 3; paint(); } }, '次の瞬間を見る →');

    const el = h('div.b6-wid',
      h('div.b6-wid-head',
        h('div.b6-wid-t', h('span.chip.ptr', 'INTERACTIVE'), h('b', '2 行の順番シミュレータ — なぜ new->next が先なのか?')),
        modeTabs),
      svgHost,
      h('div.b6-sp-bottom', codeHost, h('div.b6-sp-side', h('div.b6-sp-bar', stepBtns, nextBtn), expHost)));
    paint();
    return el;
  }

  /* -----------------------------------------------------------------------
   * 3. 通常走査 vs 先読み走査 (p->next->val) & 削除シミュレータ
   * ----------------------------------------------------------------------- */
  function lookaheadLab() {
    const INIT = [4, 9, 2, 7];
    let vals = INIT.slice();
    let target = 2;
    let mode = 'lookahead'; // 'normal' | 'lookahead'
    let idx = 0; // normal: 0..vals.length (0 is vals[0]), lookahead: -1..vals.length-1 (-1 is dummy)
    let removed = false;

    const stage = h('div.b6-la-stage');
    const info = h('div.b6-la-info');
    const codeEl = h('div.b6-la-code');
    const delBtn = h('button.btn.sm.ptr', { type: 'button', onclick: doDelete }, '✂ remove_node(p) を実行!');

    function resetPos() {
      removed = false;
      idx = mode === 'lookahead' ? -1 : 0;
      paint();
    }

    function curFound() {
      if (removed) return false;
      if (mode === 'normal') return idx < vals.length && vals[idx] === target;
      return idx + 1 < vals.length && vals[idx + 1] === target;
    }

    function curEnd() {
      if (mode === 'normal') return idx >= vals.length;
      return idx + 1 >= vals.length;
    }

    function stepNext() {
      if (removed || curFound() || curEnd()) return;
      idx++;
      paint();
    }

    function doDelete() {
      if (mode !== 'lookahead' || !curFound() || removed) return;
      vals.splice(idx + 1, 1);
      removed = true;
      paint();
    }

    function paint() {
      stage.innerHTML = '';
      const row = h('div.b6-la-nodes');

      const mkNode = (label, v, pos) => {
        const isP = !removed && idx === pos;
        const isPeek = !removed && mode === 'lookahead' && idx + 1 === pos && pos < vals.length;
        const isHit = (mode === 'normal' && isP && v === target) || (isPeek && v === target);
        const cls = [
          pos === -1 ? 'dummy' : '',
          isP ? 'is-p' : '',
          isPeek ? 'is-peek' : '',
          isHit ? 'is-hit' : '',
        ].filter(Boolean).join('.');
        return h('div.b6-la-node' + (cls ? '.' + cls : ''),
          h('div.b6-la-badges',
            isP ? h('span.b6-tag-p', 'p はここ') : null,
            isPeek ? h('span.b6-tag-nx', 'p->next (覗き見)') : null),
          h('small', label),
          h('b', String(v)));
      };

      row.appendChild(mkNode('head_p (ダミー)', 0, -1));
      vals.forEach((v, k) => {
        row.append(h('span.b6-va-ar', '→'), mkNode('節点 ' + (k + 1), v, k));
      });
      row.append(h('span.b6-va-ar', '→'), h('span.b6-va-null' + (curEnd() && mode === 'normal' ? '.is-p' : ''), 'NULL'));
      stage.appendChild(row);

      const found = curFound();
      const end = curEnd();
      delBtn.style.display = mode === 'lookahead' && found && !removed ? '' : 'none';
      stepBtn.disabled = removed || found || end;

      if (mode === 'normal') {
        codeEl.innerHTML = '';
        codeEl.appendChild(codeBlock(
          '/* 型 A: 各節点そのものを見る (list_find) */\nfor (p = head_p->next; p != NULL; p = p->next) {\n    if (p->val == ' + target + ') break;\n}',
          { hl: [found ? 3 : 2] }
        ));
        if (found) {
          info.className = 'b6-la-info warn';
          info.innerHTML = '<b>値 ' + target + ' を発見!</b> <code class="ic">p</code> は [' + target + '] 自身を指しています。<br><b>でも注意:</b> ここから [' + target + '] を削除しようとしても、片方向リストなので<b>1つ手前の節点の next を書き換える手がかりがありません</b> (もう一度ダミーから走査し直す必要がある = 課題 6-5)。';
        } else if (end) {
          info.className = 'b6-la-info';
          info.innerHTML = '<code class="ic">p == NULL</code> に到達。値 ' + target + ' は見つかりませんでした (<code class="ic">return NULL;</code>)。';
        } else {
          info.className = 'b6-la-info';
          info.innerHTML = 'いま <code class="ic">p-&gt;val</code> は <b>' + vals[idx] + '</b> (' + target + ' ではない)。「1 歩進める」で <code class="ic">p = p-&gt;next</code> します。';
        }
      } else {
        codeEl.innerHTML = '';
        codeEl.appendChild(codeBlock(
          '/* 型 B: 1つ手前 p から p->next->val を先読み (Opt-6, Opt-7) */\nfor (p = head_p; p->next != NULL; p = p->next) {\n    if (p->next->val == ' + target + ') { remove_node(p); break; }\n}',
          { hl: [found || removed ? 3 : 2] }
        ));
        if (removed) {
          info.className = 'b6-la-info ok';
          info.innerHTML = '<b>削除完了!</b> <code class="ic">p</code> が手前にいたおかげで、<b>1 回の走査のまま</b> <code class="ic">remove_node(p)</code> で直後の [' + target + '] を外して <code class="ic">free</code> できました! 先頭要素 (4) を狙っても p = ダミー になるので特別扱い不要です。';
        } else if (found) {
          const pName = idx === -1 ? 'head_p (ダミー)' : '[' + vals[idx] + ']';
          info.className = 'b6-la-info ok';
          info.innerHTML = '<b>先読み成功!</b> <code class="ic">p-&gt;next-&gt;val == ' + target + '</code> なのでここでストップ! いま <code class="ic">p</code> は<b>直前の ' + pName + '</b> に立っています。右の「remove_node(p) を実行!」を押してみよう!';
        } else if (end) {
          info.className = 'b6-la-info';
          info.innerHTML = '<code class="ic">p-&gt;next == NULL</code> に到達。値 ' + target + ' はありませんでした。';
        } else {
          const pName = idx === -1 ? 'ダミー' : vals[idx];
          info.className = 'b6-la-info';
          info.innerHTML = '<code class="ic">p</code> は <b>' + pName + '</b> に立ち、1 つ先の <code class="ic">p-&gt;next-&gt;val</code> = <b>' + vals[idx + 1] + '</b> を覗いています。';
        }
      }

      [...mTabs.children].forEach((b) => b.classList.toggle('on', b.dataset.m === mode));
      [...tChips.children].forEach((b) => b.classList.toggle('on', +b.dataset.v === target));
    }

    const mTabs = h('div.tabs', [
      h('button', { type: 'button', 'data-m': 'lookahead', onclick: () => { mode = 'lookahead'; resetPos(); } }, '型 B: 先読み p->next->val (削除に直結)'),
      h('button', { type: 'button', 'data-m': 'normal', onclick: () => { mode = 'normal'; resetPos(); } }, '型 A: 通常 p->val (探索用)'),
    ]);
    const tChips = h('div.b6-wid-ctl',
      h('span.c-mute', { style: { fontSize: '12px' } }, '探す値:'),
      [4, 2, 7, 99].map((v) => h('button.sh-chip', { type: 'button', 'data-v': v, onclick: () => { vals = INIT.slice(); target = v; resetPos(); } }, v === 4 ? '4 (先頭!)' : v === 99 ? '99 (無い)' : String(v)))
    );
    const stepBtn = h('button.btn.sm.pri', { type: 'button', onclick: stepNext }, 'p = p->next (1 歩進める)');
    const rstBtn = h('button.btn.sm', { type: 'button', onclick: () => { vals = INIT.slice(); resetPos(); } }, icon('reset'), '最初から');

    const el = h('div.b6-wid',
      h('div.b6-wid-head',
        h('div.b6-wid-t', h('span.chip.ptr', 'SIMULATOR'), h('b', '「通常走査」と「先読み走査」— 止まった瞬間の p の位置に注目!')),
        mTabs),
      h('div.b6-la-bar', tChips, h('div.b6-wid-ctl', stepBtn, delBtn, rstBtn)),
      stage,
      h('div.b6-sp-bottom', codeEl, info));
    resetPos();
    return el;
  }

  /* -----------------------------------------------------------------------
   * 4. 計算量 O(n) vs O(log n) 体感レース (gcc 実測データ連動)
   * ----------------------------------------------------------------------- */
  function raceLab() {
    const NS = [5000, 10000, 15000, 20000, 25000];
    let n = 25000;
    const tm4 = (D.timing && D.timing.lt4) || {};
    const tm8 = (D.timing && D.timing.lt8) || {};
    const tm11 = (D.timing && D.timing.tt11) || {};

    const body = h('div.b6-rc-body');
    const summary = h('div.b6-rc-sum');

    function us(sec, cnt) { return sec ? (sec / cnt * 1e6) : 0; }

    function paint() {
      [...nBtns.children].forEach((b) => b.classList.toggle('on', +b.dataset.n === n));
      const lHit = us((tm4[n] || [])[1] || 0.048 * (n / 5000) * (n / 5000), n);
      const lMiss = us((tm4[n] || [])[2] || 0.18 * (n / 5000) * (n / 5000), n);
      const sHit = us((tm8[n] || [])[1] || 0.08 * (n / 5000) * (n / 5000), n);
      const tHit = us((tm11[n] || [])[1] || 0.002, n);

      const avgList = Math.round(n / 2);
      const avgTree = Math.max(1, Math.round(Math.log2(n)));
      const maxUs = 135;

      const rows = [
        {
          name: 'リスト list_find (hit)',
          tag: 'O(n)',
          cmp: '平均 ' + avgList.toLocaleString() + ' 個見る',
          val: lHit,
          total: ((tm4[n] || [])[1] || 0).toFixed(3) + ' 秒',
          col: 'var(--sky)',
        },
        {
          name: 'リスト list_find (miss)',
          tag: 'O(n)',
          cmp: '全部 ' + n.toLocaleString() + ' 個見る',
          val: lMiss,
          total: ((tm4[n] || [])[2] || 0).toFixed(3) + ' 秒',
          col: 'var(--pink)',
        },
        {
          name: '昇順リスト sorted_find (hit)',
          tag: 'O(n)',
          cmp: '整列しても飛べない (平均 ' + avgList.toLocaleString() + ' 個)',
          val: sHit,
          total: ((tm8[n] || [])[1] || 0).toFixed(3) + ' 秒',
          col: 'var(--lemon)',
        },
        {
          name: '二分探索木 tree_find (hit)',
          tag: 'O(log n)',
          cmp: '毎回半分捨てて 約 ' + avgTree + ' 回だけ!',
          val: tHit,
          total: ((tm11[n] || [])[1] || 0).toFixed(4) + ' 秒',
          col: 'var(--mint)',
        },
      ];

      body.innerHTML = '';
      rows.forEach((r) => {
        const pct = Math.max(1.2, Math.min(100, (r.val / maxUs) * 100));
        body.appendChild(h('div.b6-rc-row',
          h('div.b6-rc-lbl',
            h('div', h('b', r.name), ' ', h('span.b6-rc-tag', r.tag)),
            h('small', r.cmp)),
          h('div.b6-rc-track',
            h('div.b6-rc-fill', { style: { width: pct + '%', background: r.col } })),
          h('div.b6-rc-num',
            h('b', r.val < 1 ? r.val.toFixed(2) + ' µs' : r.val.toFixed(1) + ' µs'),
            h('small', 'n回合計 ' + r.total))));
      });

      const ratio = Math.max(1, Math.round(lHit / Math.max(0.05, tHit)));
      summary.innerHTML =
        '<b>n = ' + n.toLocaleString() + ' の本質:</b> ' +
        'n を 5,000 → ' + n.toLocaleString() + ' (' + (n / 5000) + ' 倍) にすると、リストの<b>1 個あたり時間</b>も約 ' + (n / 5000) + ' 倍に伸び、合計時間は <b>' + ((n / 5000) * (n / 5000)) + ' 倍 (O(n²))</b> に膨らみます。' +
        'また<b>昇順リスト (Opt-8) でも途中にジャンプできないため O(n) のまま</b>です。一方、二分探索木は 1 個あたり <b>約 ' + ratio + ' 倍高速</b>で、n が増えてもほとんど横ばいです。';
    }

    const nBtns = h('div.tabs', NS.map((v) =>
      h('button', { type: 'button', 'data-n': v, onclick: () => { n = v; paint(); } }, 'n = ' + v.toLocaleString())
    ));

    const el = h('div.b6-wid',
      h('div.b6-wid-head',
        h('div.b6-wid-t', h('span.chip.addr', 'GCC BENCHMARK'), h('b', 'n をスライスして比較! 1 回あたりの探索時間 (µs) と見る節点数')),
        nBtns),
      body,
      summary);
    paint();
    return el;
  }

  /* -----------------------------------------------------------------------
   * 5. 二分探索木 (BST) インタラクティブラボ
   *    - 値の挿入 / プリセット (バランス vs ソート済み最悪ケース)
   *    - tree_find の「半分ずつ捨てる」可視化
   *    - 先行順 (原型) vs 中間順 (課題 6-9 = 昇順!) のハイライト比較
   * ----------------------------------------------------------------------- */
  function bstLab() {
    let values = [5, 3, 8, 1, 4, 7, 9];
    let hiPath = [];      // 探索で通った値の配列
    let discarded = new Set(); // 探索で切り捨てた節点の値
    let foundVal = null;
    let orderSeq = [];    // 走査順アニメ用
    let orderTimer = null;
    let activeVisit = null;

    const svgHost = h('div.b6-bst-svg');
    const msgHost = h('div.b6-bst-msg');
    const valInput = h('input.b6-bst-in', { type: 'number', value: '6', min: -99, max: 99, 'aria-label': '値' });

    function buildTree(arr) {
      let root = null;
      function ins(node, v, depth, xMin, xMax) {
        if (!node) return { v, left: null, right: null, depth, x: (xMin + xMax) / 2 };
        if (v < node.v) node.left = ins(node.left, v, depth + 1, xMin, node.x);
        else if (v > node.v) node.right = ins(node.right, v, depth + 1, node.x, xMax);
        return node;
      }
      arr.forEach((v) => { root = ins(root, v, 0, 36, 644); });
      return root;
    }

    function collectSubtree(node, set) {
      if (!node) return;
      set.add(node.v);
      collectSubtree(node.left, set);
      collectSubtree(node.right, set);
    }

    function clearAnim() {
      if (orderTimer) { clearInterval(orderTimer); orderTimer = null; }
      hiPath = [];
      discarded = new Set();
      foundVal = null;
      orderSeq = [];
      activeVisit = null;
    }

    function doInsert() {
      const v = parseInt(valInput.value, 10);
      if (isNaN(v)) return;
      clearAnim();
      if (values.includes(v)) {
        // 既存ノードまでの道を表示
        runFind(v, true);
        msgHost.innerHTML = '<b>' + v + ' は既に木にあります!</b> <code class="ic">else if (val &gt; n-&gt;data)</code> にしたおかげで重複挿入されず、そのまま戻ります (課題 6-9 (1))。';
        return;
      }
      if (values.length >= 13) {
        msgHost.innerHTML = '図が見やすいよう 13 個までにしています。「リセット」やプリセットで試してね。';
        return;
      }
      values.push(v);
      runFind(v, true);
      msgHost.innerHTML = '<b>' + v + ' を挿入しました!</b> 根から大小を比べながら <code class="ic">NULL</code> の空き場所を見つけて新しい節点をつなぎました。';
    }

    function runFind(v, silent) {
      clearAnim();
      const root = buildTree(values);
      let cur = root;
      let steps = 0;
      while (cur) {
        steps++;
        hiPath.push(cur.v);
        if (v === cur.v) {
          foundVal = v;
          break;
        } else if (v < cur.v) {
          if (cur.right) collectSubtree(cur.right, discarded);
          cur = cur.left;
        } else {
          if (cur.left) collectSubtree(cur.left, discarded);
          cur = cur.right;
        }
      }
      paint();
      if (!silent) {
        const ign = discarded.size;
        msgHost.innerHTML = (foundVal !== null
          ? '<b>発見! (' + v + ')</b> '
          : '<b>NULL に到達 (' + v + ' は無い)</b> ') +
          '— 全 <b>' + values.length + '</b> 個のうち、比較したのはたった <b>' + steps + ' 回</b>! ' +
          (ign ? '薄くなった <b>' + ign + ' 個の節点は一度も見ずに切り捨て</b>ました (これが O(log n) の正体)。' : '');
      }
    }

    function runOrder(kind) {
      clearAnim();
      const root = buildTree(values);
      const seq = [];
      function pre(n) { if (!n) return; seq.push(n.v); pre(n.left); pre(n.right); }
      function ino(n) { if (!n) return; ino(n.left); seq.push(n.v); ino(n.right); }
      if (kind === 'pre') pre(root); else ino(root);

      let k = 0;
      const visited = [];
      const tick = () => {
        if (k >= seq.length) {
          clearInterval(orderTimer);
          orderTimer = null;
          activeVisit = null;
          paint();
          msgHost.innerHTML = (kind === 'in'
            ? '<b>中間順 (左 → 自分 → 右) 完了:</b> <code class="ic">[ ' + seq.join(' ') + ' ]</code> — <b>必ず小さい順 (昇順)</b> に並びます! (課題 6-9 (2))'
            : '<b>原型の順 (自分 → 左 → 右 = 先行順):</b> <code class="ic">[ ' + seq.join(' ') + ' ]</code> — 根が最初に出るので昇順になりません。');
          return;
        }
        activeVisit = seq[k];
        visited.push(seq[k]);
        orderSeq = visited.slice();
        paint();
        msgHost.innerHTML = (kind === 'in' ? '<b>中間順 (左→自分→右):</b> ' : '<b>原型 (自分→左→右):</b> ') +
          '<code class="ic">[ ' + visited.join(' ') + ' … ]</code>';
        k++;
      };
      tick();
      orderTimer = setInterval(tick, 480);
    }

    function paint() {
      const root = buildTree(values);
      const nodes = [];
      const edges = [];
      let maxD = 0;
      (function walk(n) {
        if (!n) return;
        if (n.depth > maxD) maxD = n.depth;
        nodes.push(n);
        if (n.left) { edges.push([n, n.left, 'L']); walk(n.left); }
        if (n.right) { edges.push([n, n.right, 'R']); walk(n.right); }
      })(root);

      const W = 680, H = Math.max(210, 76 + maxD * 62);
      const yOf = (d) => 36 + d * 58;
      let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="二分探索木の可視化">`;

      edges.forEach(([p, c, dir]) => {
        const onPath = hiPath.includes(p.v) && hiPath.includes(c.v);
        const dim = discarded.has(c.v);
        const x1 = p.x, y1 = yOf(p.depth), x2 = c.x, y2 = yOf(c.depth);
        s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${onPath ? '#f2467f' : '#3b2738'}" stroke-width="${onPath ? 3.2 : 2}" opacity="${dim ? 0.18 : 1}"/>`;
        s += `<text x="${(x1 + x2) / 2 + (dir === 'L' ? -8 : 8)}" y="${(y1 + y2) / 2 - 3}" text-anchor="middle" font-family="var(--f-mono)" font-size="10" font-weight="700" fill="${dim ? '#ccc' : dir === 'L' ? '#1497ab' : '#d97f00'}">${dir === 'L' ? '<左' : '右>'}</text>`;
      });

      nodes.forEach((n) => {
        const dim = discarded.has(n.v);
        const isHit = foundVal === n.v;
        const onP = hiPath.includes(n.v);
        const isAct = activeVisit === n.v;
        const ordIdx = orderSeq.indexOf(n.v);
        let fill = '#fff';
        if (isHit || isAct) fill = '#9fe6d6';
        else if (onP) fill = '#ffe27a';
        else if (ordIdx >= 0) fill = '#dcf5f8';

        const y = yOf(n.depth);
        s += `<g opacity="${dim ? 0.22 : 1}" style="cursor:pointer" data-v="${n.v}">
          <circle cx="${n.x}" cy="${y}" r="21" fill="${fill}" stroke="${isHit || isAct ? '#f2467f' : '#3b2738'}" stroke-width="${isHit || isAct ? 3.2 : 2.2}"/>
          <text x="${n.x}" y="${y + 6}" text-anchor="middle" font-family="var(--f-disp)" font-size="16" font-weight="700" fill="#3b2738">${n.v}</text>
          ${ordIdx >= 0 ? `<circle cx="${n.x + 17}" cy="${y - 16}" r="9" fill="#3b2738"/><text x="${n.x + 17}" y="${y - 12}" text-anchor="middle" font-family="var(--f-mono)" font-size="10" font-weight="700" fill="#fff">${ordIdx + 1}</text>` : ''}
        </g>`;
      });

      if (!nodes.length) {
        s += `<text x="${W / 2}" y="105" text-anchor="middle" font-family="var(--f-jp)" font-size="14" fill="#8a7184">root == NULL (空の木です — 上から値を挿入してみよう)</text>`;
      }
      s += '</svg>';
      svgHost.innerHTML = s;
      svgHost.querySelectorAll('g[data-v]').forEach((g) => {
        g.addEventListener('click', () => {
          const v = +g.getAttribute('data-v');
          valInput.value = String(v);
          runFind(v, false);
        });
      });
    }

    const presets = h('div.b6-bst-pre',
      h('span.c-mute', { style: { fontSize: '12px' } }, '木の形を試す:'),
      h('button.sh-chip', { type: 'button', onclick: () => { clearAnim(); values = [5, 3, 8, 1, 4, 7, 9]; paint(); msgHost.innerHTML = '<b>バランスの良い木 (高さ 2):</b> 7 個あっても最大 3 回の比較で見つかります。節点をクリックすると探索できます!'; } }, 'バランス木 (5,3,8,1,4,7,9)'),
      h('button.sh-chip', { type: 'button', onclick: () => { clearAnim(); values = [1, 2, 3, 4, 5, 6]; paint(); msgHost.innerHTML = '<b>⚠ 昇順に入れた木 (1→2→3→4→5→6):</b> 毎回右へ進むため<b>実質リストと同じ一直線 (O(n))</b> に退化! これが Opt-11 の考察の隠し味です。'; } }, '昇順データ (退化する例!)'),
      h('button.sh-chip', { type: 'button', onclick: () => { clearAnim(); values = []; paint(); msgHost.innerHTML = '<code class="ic">root = NULL</code> に戻しました。好きな順で挿入して木の形を作ってみよう。'; } }, '空にする')
    );

    const controls = h('div.b6-bst-ctl',
      valInput,
      h('button.btn.sm.pri', { type: 'button', onclick: doInsert }, '+ 挿入 (insert_uniq)'),
      h('button.btn.sm.ptr', { type: 'button', onclick: () => { const v = parseInt(valInput.value, 10); if (!isNaN(v)) runFind(v, false); } }, '🔍 探す (tree_find)'),
      h('span.b6-bst-sep'),
      h('button.btn.sm', { type: 'button', onclick: () => runOrder('pre') }, '原型: 自分→左→右'),
      h('button.btn.sm', { type: 'button', onclick: () => runOrder('in') }, '課題6-9: 左→自分→右 (昇順!)')
    );

    msgHost.innerHTML = '節点をクリックするか数字を入れて「🔍 探す」を押すと、<b>1 回の比較ごとに反対側の枝がごっそり薄くなって捨てられる</b>様子が見えます!';
    const el = h('div.b6-wid',
      h('div.b6-wid-head',
        h('div.b6-wid-t', h('span.chip.ok', 'BINARY SEARCH TREE'), h('b', '二分探索木シミュレータ — 「半分捨てる探索」と「昇順になる中間順走査」'))),
      controls,
      presets,
      svgHost,
      msgHost);
    paint();
    return el;
  }

  window.B6_CODE = { essenceMap, vsArray, spliceLab, lookaheadLab, raceLab, bstLab };
})();
