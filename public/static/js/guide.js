/* =========================================================================
 *  PIII LAB — 理解を深めるガイド (Essentials / 定型フレーズ図鑑 / 1行ずつの意図解説)
 *  1) 単元エッセンシャル: 「なぜ必要?」「核心の原理」「絶対に外せない黄金ルール」
 *  2) 定型フレーズ図鑑: 覚えるべき C のイディオムを部品レベルで分解 + 暗記カード切替
 *  3) 課題の設計図 & 1行ずつの意図解説: 全90課題の模範解答・章のコードを1行ずつ解剖
 * ========================================================================= */
(function (g) {
  'use strict';
  const { h, esc, hlCode, store, icon, copyText, flashCopied } = U;

  U.ICONS.book = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8M8 11h6"/></svg>';
  U.ICONS.spark = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.2 6.3L20.5 10l-6.3 2.2L12 18.5l-2.2-6.3L3.5 10l6.3-1.7L12 2z"/><path d="M19 16l.9 2.6L22.5 19.5l-2.6.9L19 23l-.9-2.6-2.6-.9 2.6-.9L19 16z"/></svg>';
  U.ICONS.layers = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 12l10 5 10-5"/><path d="M2 17l10 5 10-5"/></svg>';
  U.ICONS.tag = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/></svg>';

  const DATA = () => g.GUIDE_DATA || { units: {}, phrases: [], tasks: {}, lineRules: [] };

  /* =========================================================================
   *  1. C コード 1行ずつの意図アナライザ (特化解説 + 精密構文ルールエンジン)
   * ========================================================================= */
  const KIND_META = {
    prep:  { label: '準備', cls: 'k-prep' },
    decl:  { label: '宣言', cls: 'k-decl' },
    io:    { label: '入出力', cls: 'k-io' },
    ctrl:  { label: '制御', cls: 'k-ctrl' },
    ptr:   { label: '番地/矢印', cls: 'k-ptr' },
    mem:   { label: '動的メモリ', cls: 'k-mem' },
    calc:  { label: '計算/更新', cls: 'k-calc' },
    ret:   { label: '返却', cls: 'k-ret' },
    str:   { label: '構造', cls: 'k-str' },
    cmt:   { label: '注釈', cls: 'k-cmt' },
  };

  /* 課題・ファイル単位のピンポイント行解説 (GUIDE_DATA.lineOverrides) を優先し、
     それ以外の行も C の構文・関数・イディオムから正確に意図を説明する */
  function analyzeFileLines(filename, src, ctx) {
    ctx = ctx || {};
    const rawLines = String(src || '').replace(/\r\n?/g, '\n').split('\n');
    if (rawLines.length > 1 && rawLines[rawLines.length - 1] === '') rawLines.pop();
    const hlLines = hlCode(rawLines.join('\n'));
    const ov = (ctx.overrides && (ctx.overrides[filename] || ctx.overrides['*'])) || {};

    let inBlockCmt = false;
    let braceDepth = 0;
    let curFunc = null;
    let inStruct = false;

    return rawLines.map((raw, idx) => {
      const ln = idx + 1;
      const t = raw.trim();
      const html = hlLines[idx] || ' ';

      // 空行
      if (!t) {
        return { ln, raw, html, empty: true, kind: 'str', why: '' };
      }

      // 複数行コメント追跡
      if (inBlockCmt) {
        if (t.includes('*/')) inBlockCmt = false;
        const clean = t.replace(/^\*+\s?/, '').replace(/\*\/$/, '').trim();
        return {
          ln, raw, html, kind: 'cmt',
          why: clean ? 'コメント（続き）: ' + esc(clean) : 'コメントブロックの終了（コンパイル時には無視されるメモ）',
        };
      }
      if (t.startsWith('/*')) {
        if (!t.includes('*/')) inBlockCmt = true;
        const clean = t.replace(/^\/\*+\s*/, '').replace(/\s*\*+\/$/, '').trim();
        return {
          ln, raw, html, kind: 'cmt',
          why: clean ? 'コメント: <b>' + esc(clean) + '</b> — 人間が処理の区切りや仕様を読むためのメモ（実行には影響しない）' : 'コメントの開始',
        };
      }
      if (t.startsWith('//')) {
        const clean = t.replace(/^\/\/+\s*/, '').trim();
        return { ln, raw, html, kind: 'cmt', why: 'コメント: <b>' + esc(clean) + '</b>' };
      }

      // 構造体定義追跡
      if (/^typedef\s+struct/.test(t) || /^struct\s+\w+\s*\{/.test(t)) inStruct = true;

      // 関数ヘッダ追跡 (インデントなしの型 + 名前 + 括弧)
      const noCmtLine = t.replace(/\/\*.*?\*\//g, '').replace(/\/\/.*$/, '').trim();
      if (braceDepth === 0 && !inStruct && /^[A-Za-z_][\w\s\*]*\b([A-Za-z_]\w*)\s*\([^;]*$/.test(noCmtLine) && !/^(if|for|while|switch)\b/.test(noCmtLine)) {
        const fm = /\b([A-Za-z_]\w*)\s*\(/.exec(noCmtLine);
        if (fm) curFunc = fm[1];
      }

      // 波括弧の深さ更新 (前後の判定用)
      const opens = (noCmtLine.match(/\{/g) || []).length;
      const closes = (noCmtLine.match(/\}/g) || []).length;
      const prevDepth = braceDepth;
      braceDepth = Math.max(0, braceDepth + opens - closes);

      // 1) 明示オーバーライド (行番号 or トリム文字列一致)
      if (ov[ln]) {
        const o = typeof ov[ln] === 'string' ? { why: ov[ln], kind: guessKind(noCmtLine) } : ov[ln];
        if (inStruct && braceDepth === 0 && noCmtLine.endsWith(';')) inStruct = false;
        return { ln, raw, html, kind: o.kind || guessKind(noCmtLine), why: o.why, phrase: o.phrase || matchPhraseId(noCmtLine), key: true };
      }
      if (ov[noCmtLine]) {
        const o = typeof ov[noCmtLine] === 'string' ? { why: ov[noCmtLine], kind: guessKind(noCmtLine) } : ov[noCmtLine];
        if (inStruct && braceDepth === 0 && noCmtLine.endsWith(';')) inStruct = false;
        return { ln, raw, html, kind: o.kind || guessKind(noCmtLine), why: o.why, phrase: o.phrase || matchPhraseId(noCmtLine), key: true };
      }

      // 2) テキストデータファイル (san-exp.txt 等)
      if (filename && !/\.(c|h)$/.test(filename)) {
        return { ln, raw, html, kind: 'io', why: `期待値データの ${ln} 行目: プログラムが標準出力に出すべき値 <code class="ic">${esc(t)}</code>` };
      }

      // 3) 行末インラインコメントの抽出（ヒントとして活用）
      const inlineCmtMatch = /\/\*\s*(.*?)\s*\*\/|\/\/\s*(.*)$/.exec(t);
      const inlineNote = inlineCmtMatch ? (inlineCmtMatch[1] || inlineCmtMatch[2] || '').trim() : '';

      const info = explainCLine(noCmtLine, { filename, curFunc, prevDepth, braceDepth, inStruct, inlineNote });
      if (inStruct && braceDepth === 0 && noCmtLine.endsWith(';')) inStruct = false;
      if (braceDepth === 0 && closes > 0) curFunc = null;

      return {
        ln, raw, html,
        kind: info.kind,
        why: info.why,
        phrase: info.phrase || matchPhraseId(noCmtLine),
        key: !!info.key,
      };
    });
  }

  function guessKind(s) {
    if (s.startsWith('#')) return 'prep';
    if (/\b(malloc|calloc|realloc|free)\s*\(/.test(s)) return 'mem';
    if (/\b(printf|fprintf|scanf|fgets|fopen|fread|fwrite|fclose|puts|putchar|getchar)\s*\(/.test(s)) return 'io';
    if (/^(if|else|for|while|do|switch|case|break|continue)\b/.test(s)) return 'ctrl';
    if (/^return\b|\bexit\s*\(/.test(s)) return 'ret';
    if (/->|\*\s*\w+\s*=|&\s*\w+/.test(s)) return 'ptr';
    if (/^(int|double|float|char|void|static|const|struct|typedef|size_t|clock_t|FILE|[a-z_]+_t)\b/.test(s)) return 'decl';
    if (/^[{}]$/.test(s)) return 'str';
    return 'calc';
  }

  function matchPhraseId(s) {
    const rules = [
      [/fprintf\s*\(\s*stderr/, 'ph-stderr'],
      [/scanf\s*\([^)]*\)\s*==\s*EOF|!=\s*1|!=\s*3/, 'ph-eof'],
      [/fgets\s*\([^)]*\)\s*!=\s*NULL/, 'ph-fgets'],
      [/strcmp\s*\([^)]*\)\s*==\s*0/, 'ph-strcmp'],
      [/\[\w+\]\s*!=\s*'\\0'/, 'ph-nullchar'],
      [/malloc\s*\(\s*sizeof/, 'ph-malloc'],
      [/strlen\s*\([^)]*\)\s*\+\s*1/, 'ph-strlen1'],
      [/realloc\s*\(/, 'ph-realloc'],
      [/free\s*\(/, 'ph-free'],
      [/rand\s*\(\s*\)\s*%/, 'ph-rand'],
      [/clock\s*\(\s*\)|CLOCKS_PER_SEC/, 'ph-clock'],
      [/new_node->next\s*=\s*\w+->next/, 'ph-list-ins'],
      [/p\s*=\s*head_p->next\s*;\s*p\s*!=\s*NULL/, 'ph-list-walk'],
      [/p->next\s*!=\s*NULL/, 'ph-list-lookahead'],
      [/tree_print\s*\(\s*n->left\s*\)|tree_insert/, 'ph-tree-rec'],
      [/mid\s*=\s*\(\s*low\s*\+\s*high\s*\)\s*\/\s*2/, 'ph-bsearch'],
      [/db_hash_f\s*\(/, 'ph-hash-probe'],
      [/&\s*\w+->\w+/, 'ph-arrow-addr'],
    ];
    for (const [re, id] of rules) if (re.test(s)) return id;
    return null;
  }

  /* 1行の C 構文を丁寧に日本語へ翻訳するルールエンジン */
  function explainCLine(s, st) {
    const note = st.inlineNote ? ` <span class="ln-sub">（${esc(st.inlineNote)}）</span>` : '';

    // --- プリプロセッサ ---
    let m;
    if ((m = /^#include\s*<([^>]+)>/.exec(s))) {
      const hdr = m[1];
      const map = {
        'stdio.h': '標準入出力のヘッダを読み込む（<code class="ic">printf</code>, <code class="ic">scanf</code>, <code class="ic">fprintf</code>, <code class="ic">stderr</code>, <code class="ic">EOF</code>, <code class="ic">FILE</code> を使うための準備）',
        'stdlib.h': '標準ライブラリのヘッダを読み込む（<code class="ic">malloc</code>, <code class="ic">free</code>, <code class="ic">realloc</code>, <code class="ic">rand</code>, <code class="ic">exit</code>, <code class="ic">NULL</code> を使う準備）',
        'math.h': '数学関数のヘッダを読み込む（平方根 <code class="ic">sqrt</code>, 絶対値 <code class="ic">fabs</code>, <code class="ic">log</code>, <code class="ic">cos</code>, <code class="ic">floor</code> などを使う準備）',
        'string.h': '文字列操作のヘッダを読み込む（長さ <code class="ic">strlen</code>, 比較 <code class="ic">strcmp</code>, コピー <code class="ic">strcpy</code> / <code class="ic">strncpy</code> を使う準備）',
        'float.h': '浮動小数点の定数ヘッダを読み込む（極小値 <code class="ic">DBL_EPSILON</code> などで実数の 0 判定をする準備）',
        'assert.h': '診断マクロ <code class="ic">assert(...)</code> を使うためのヘッダを読み込む（前提条件違反を即座に検出する）',
        'time.h': '時間計測のヘッダを読み込む（<code class="ic">clock()</code>, <code class="ic">clock_t</code>, <code class="ic">CLOCKS_PER_SEC</code> で CPU 時間を測る準備）',
      };
      return { kind: 'prep', why: map[hdr] || `標準ヘッダ <code class="ic">&lt;${esc(hdr)}&gt;</code> の宣言を取り込む` };
    }
    if ((m = /^#include\s*"([^"]+)"/.exec(s))) {
      return {
        kind: 'prep', key: true,
        why: `自作ヘッダ <code class="ic">"${esc(m[1])}"</code> を読み込む — <b>" "</b> は「同じフォルダを探す」指定。構造体型や関数のプロトタイプ宣言を複数ファイルで共有する`,
      };
    }
    if ((m = /^#define\s+(\w+)\s+(.+)$/.exec(s))) {
      return {
        kind: 'prep',
        why: `マクロ定数 <code class="ic">${esc(m[1])}</code> を <code class="ic">${esc(m[2])}</code> と定義 — 配列サイズや上限値に名前を付け、マジックナンバー（意味不明な直書き数値）をなくす` + note,
      };
    }

    // --- 波括弧のみ ---
    if (s === '{') {
      if (st.prevDepth === 0 && st.curFunc) {
        return { kind: 'str', why: `関数 <code class="ic">${esc(st.curFunc)}</code> の本体ブロック開始（ここでこの関数専用のローカル変数領域がスタックに作られる）` };
      }
      return { kind: 'str', why: 'ブロックの開始' };
    }
    if (s === '}') {
      if (st.braceDepth === 0 && st.curFunc) {
        return { kind: 'str', why: `関数 <code class="ic">${esc(st.curFunc)}</code> の本体ブロック終了（<code class="ic">void</code> 関数ならここで呼び出し元へ戻る）` };
      }
      return { kind: 'str', why: 'ブロック（ループまたは条件分岐）の終了' };
    }
    if ((m = /^\}\s*(\w+_t)\s*;/.exec(s))) {
      return { kind: 'decl', key: true, why: `ここまでで定義した構造体に <code class="ic">${esc(m[1])}</code> という型名を付ける（以降は <code class="ic">struct</code> を省いて変数宣言できる）` };
    }

    // --- 構造体定義とメンバー ---
    if (/^typedef\s+struct\s+(\w+)\s*\{/.exec(s)) {
      m = /^typedef\s+struct\s+(\w+)\s*\{/.exec(s);
      return { kind: 'decl', key: true, why: `自己参照構造体 <code class="ic">struct ${esc(m[1])}</code> の定義開始 — 中で自分自身へのポインタを持つため、先にタグ名 <code class="ic">${esc(m[1])}</code> を名乗る` };
    }
    if (/^typedef\s+struct\s*\{/.test(s)) {
      return { kind: 'decl', key: true, why: '複数の関連データを1つの「パック」にまとめる構造体型の定義開始' };
    }
    if (st.inStruct) {
      if ((m = /^struct\s+(\w+)\s*\*\s*(\w+)\s*;/.exec(s))) {
        return { kind: 'ptr', key: true, why: `メンバー <code class="ic">${esc(m[2])}</code>: <b>次の節点（または子節点）の番地</b>を入れる自己参照ポインタ。終端では <code class="ic">NULL</code> を入れて「行き止まり」を表す` + note };
      }
      if ((m = /^char\s+(\w+)\s*\[([^\]]+)\]\s*;/.exec(s))) {
        return { kind: 'decl', why: `構造体メンバー <code class="ic">${esc(m[1])}</code>: 文字列を格納する <code class="ic">char</code> 配列（終端 <code class="ic">'\\0'</code> の分を含めてサイズ <code class="ic">${esc(m[2])}</code>）` + note };
      }
      if ((m = /^([A-Za-z_][\w\s\*]*?)\s+(\w+(?:\[[^\]]+\])*)\s*;/.exec(s))) {
        return { kind: 'decl', why: `構造体メンバー <code class="ic">${esc(m[2])}</code>（型 <code class="ic">${esc(m[1].trim())}</code>）を定義` + note };
      }
    }

    // --- プロトタイプ宣言 / 関数ヘッダ ---
    if (st.prevDepth === 0 && /^[A-Za-z_][\w\s\*]*\b([A-Za-z_]\w*)\s*\([^)]*\)\s*;$/.test(s) && !/^(return|exit|free|printf|fprintf|scanf|assert|strcpy|strncpy|srand|myrand_init)\b/.test(s)) {
      m = /^([A-Za-z_][\w\s\*]*?)\s*\b([A-Za-z_]\w*)\s*\(([^)]*)\)\s*;$/.exec(s);
      if (m) {
        return {
          kind: 'decl', key: true,
          why: `関数 <code class="ic">${esc(m[2])}</code> の<b>プロトタイプ宣言</b>（末尾に <code class="ic">;</code>）— 「引数 <code class="ic">${esc(m[3] || 'なし')}</code> を受け取り <code class="ic">${esc(m[1].trim())}</code> を返す関数がある」とコンパイラに事前予告する`,
        };
      }
    }
    if (st.prevDepth === 0 && /^int\s+main\s*\(\s*(?:void)?\s*\)/.test(s)) {
      return { kind: 'decl', why: 'プログラム実行の出発点 <code class="ic">main</code> 関数（引数なし、終了ステータスを <code class="ic">int</code> で OS に返す）' };
    }
    if (st.prevDepth === 0 && (m = /^([A-Za-z_][\w\s\*]*?)\s*\b([A-Za-z_]\w*)\s*\(([^)]*)\)\s*$/.exec(s)) && !/^(if|for|while|switch)\b/.test(s)) {
      const retT = m[1].trim(), fn = m[2], args = m[3].trim();
      const ptrNote = /\*/.test(args) ? '（ポインタ引数で番地を受け取り、呼び出し元のデータにアクセスする）' : /\[\s*\]|\[\w+\]/.test(args) ? '（配列引数＝先頭要素の番地を受け取る）' : '';
      const retNote = retT === 'void' ? '戻り値なし（<code class="ic">void</code>）' : `結果として <code class="ic">${esc(retT)}</code> 型の値を返す`;
      return {
        kind: 'decl', key: true,
        why: `関数 <code class="ic">${esc(fn)}</code> の定義ヘッダ — 引数 <code class="ic">${esc(args || 'void')}</code> を受け取り、${retNote}${ptrNote}`,
      };
    }

    // --- assert ---
    if ((m = /^assert\s*\((.+)\)\s*;/.exec(s))) {
      return {
        kind: 'ctrl',
        why: `前提条件 <code class="ic">${esc(m[1])}</code> を検査 — 万が一成り立たなければ配列破壊が起きる前にその場で強制停止してバグを知らせる`,
      };
    }

    // --- return / exit ---
    if (s === 'return 0;') {
      return { kind: 'ret', why: st.curFunc === 'main' ? 'OS に「正常終了（終了コード 0）」を伝えてプログラムを終える' : '呼び出し元に <code class="ic">0</code>（偽 / 空 / 該当なし）を返して関数を終える' };
    }
    if (s === 'return 1;') {
      return { kind: 'ret', why: st.curFunc === 'main' ? '入力エラーなどの異常終了（コード 1）を呼び出し元 OS に伝えて終了する' : '呼び出し元に <code class="ic">1</code>（成功 / 真）を返して関数を終える' };
    }
    if (s === 'return EOF;') {
      return { kind: 'ret', key: true, why: '入力が終端（EOF）に達したことを呼び出し元へそのまま知らせて関数を終える' };
    }
    if (s === 'return NULL;') {
      return { kind: 'ret', key: true, why: '「該当する節点が見つからなかった / これ以上読めなかった」印として <code class="ic">NULL</code>（0番地）を返す' };
    }
    if ((m = /^return\s+(.+)\s*;/.exec(s))) {
      return { kind: 'ret', key: true, why: `計算結果（またはポインタ）<code class="ic">${esc(m[1])}</code> を呼び出し元に返してこの関数を終了する` + note };
    }
    if ((m = /^exit\s*\(\s*(\d+)\s*\)\s*;/.exec(s))) {
      return { kind: 'ret', key: true, why: `<code class="ic">main</code> 関数の外からでもプログラム全体を即座に終了する（ステータス <code class="ic">${m[1]}</code> = 異常終了）` };
    }

    // --- 動的メモリ (malloc / realloc / free) ---
    if ((m = /^(\w+(?:->\w+|\[\w+\])?)\s*=\s*malloc\s*\((.+)\)\s*;/.exec(s)) || (m = /^(?:[A-Za-z_]\w*\s*\*+\s*)(\w+)\s*=\s*malloc\s*\((.+)\)\s*;/.exec(s))) {
      const lhs = m[1], sz = m[2];
      const strHint = /\+\s*1/.test(sz) ? '。<b>+1 は文字列終端のヌル文字 <code class="ic">\'\\0\'</code> の 1 バイト分！</b>' : '';
      return {
        kind: 'mem', key: true,
        why: `OS のヒープ領域から <b><code class="ic">${esc(sz)}</code> バイト</b>を動的に借り、その先頭番地をポインタ <code class="ic">${esc(lhs)}</code> に格納する${strHint}` + note,
      };
    }
    if ((m = /realloc\s*\(([^,]+),\s*(.+)\)\s*;/.exec(s))) {
      return {
        kind: 'mem', key: true,
        why: `<code class="ic">realloc</code> で既存のヒープ領域 <code class="ic">${esc(m[1].trim())}</code> の中身を保ったまま <b><code class="ic">${esc(m[2].trim())}</code> バイトへ拡張（引っ越し）</b>する。番地が変わることがあるので一時ポインタで受け取る`,
      };
    }
    if ((m = /^free\s*\((.+)\)\s*;/.exec(s))) {
      return {
        kind: 'mem', key: true,
        why: `<code class="ic">malloc</code> で借りていたヒープ領域 <code class="ic">${esc(m[1].trim())}</code> を OS に返却する（返し忘れるとメモリリークになる）` + note,
      };
    }
    if ((m = /^(\w+(?:->\w+|\[\w+\])?)\s*=\s*NULL\s*;/.exec(s))) {
      return {
        kind: 'ptr',
        why: `ポインタ <code class="ic">${esc(m[1])}</code> に <code class="ic">NULL</code>（どこも指さない印）を入れる — <code class="ic">free</code> 後の誤使用（ぶら下がりポインタ）を防ぐ安全習慣`,
      };
    }

    // --- 入出力 (fprintf / printf / scanf / fgets / fopen / fread / fwrite / fclose) ---
    if ((m = /^fprintf\s*\(\s*stderr\s*,\s*(.+)\)\s*;/.exec(s))) {
      return {
        kind: 'io', key: true,
        why: `<b>標準エラー出力（stderr）</b>へメッセージを出す — <code class="ic">./a &gt; out.txt</code> でリダイレクトしてもファイルに混ざらず画面にだけ表示されるため、<code class="ic">diff</code> を邪魔しない` + note,
      };
    }
    if (/if\s*\(\s*scanf\s*\((.+)\)\s*==\s*EOF\s*\)/.test(s)) {
      const brk = /return/.test(s) ? '関数（プログラム）を終える' : '<code class="ic">break</code> で無限ループを脱出する';
      const ampNote = /&/.test(s) ? '（変数の前に <code class="ic">&amp;</code> を付けて書き込み先の番地を渡す）' : '（文字配列名はそれ自体が先頭番地なので <code class="ic">&amp;</code> は不要）';
      return {
        kind: 'io', key: true,
        why: `<b>EOF（入力の終わり）判定イディオム</b>: 標準入力から読み込み、データが尽きて <code class="ic">EOF</code> が返ったら${brk}${ampNote}`,
      };
    }
    if ((m = /if\s*\(\s*scanf\s*\((.+)\)\s*!=\s*(\d+)/.exec(s))) {
      return {
        kind: 'io', key: true,
        why: `<code class="ic">scanf</code> の戻り値（正しく読めた項目数）が <b>${m[2]} 個未満</b>なら入力失敗または EOF と判断してエラー処理・終了へ進む`,
      };
    }
    if (/^while\s*\(\s*fgets\s*\(([^,]+),\s*([^,]+),\s*stdin\s*\)\s*!=\s*NULL\s*\)/.test(s)) {
      m = /^while\s*\(\s*fgets\s*\(([^,]+),\s*([^,]+),\s*stdin\s*\)\s*!=\s*NULL\s*\)/.exec(s);
      return {
        kind: 'io', key: true,
        why: `標準入力から<b>1行ずつ（改行文字込みで）</b>配列 <code class="ic">${esc(m[1].trim())}</code> に読み込む。<code class="ic">fgets</code> は入力終了時に <code class="ic">NULL</code> を返すので、ファイル末尾まで繰り返す`,
      };
    }
    if ((m = /^scanf\s*\(\s*"([^"]+)"\s*,\s*(.+)\)\s*;/.exec(s))) {
      const fmt = m[1], args = m[2];
      const lfHint = /%lf/.test(fmt) ? '（<b>double の入力は <code class="ic">%lf</code></b> — printf の <code class="ic">%f</code> と違うので超重要！）' : /%p/.test(fmt) ? '（16進数の番地として読み込む）' : '';
      const ampHint = /&/.test(args) ? `書き込み先の<b>番地</b> <code class="ic">${esc(args)}</code> を渡す` : `配列の先頭番地 <code class="ic">${esc(args)}</code> を渡す`;
      return {
        kind: 'io', key: /%lf|%p|->/.test(s),
        why: `標準入力（stdin）から書式 <code class="ic">"${esc(fmt)}"</code> で値を読み取り、${ampHint}${lfHint}`,
      };
    }
    if ((m = /^printf\s*\(\s*"([^"]*)"(?:\s*,\s*(.+))?\)\s*;/.exec(s))) {
      const fmt = m[1], args = m[2];
      let fmtDesc = '';
      if (/%\d*\.\d+f/.test(fmt)) {
        const fm = /%(\d*)\.(\d+)f/.exec(fmt);
        fmtDesc = `（${fm[1] ? `全体幅 ${fm[1]} 文字で右揃え・` : ''}小数点以下 <b>${fm[2]} 桁</b>まで表示）`;
      } else if (/%p/.test(fmt)) {
        fmtDesc = '（<code class="ic">%p</code> でメモリの番地を 16 進数表示）';
      } else if (fmt === '\\n') {
        return { kind: 'io', why: '標準出力（stdout）に改行だけを出力する（行の区切りを整える）' };
      }
      return {
        kind: 'io',
        why: `標準出力（stdout）に ${args ? `<code class="ic">${esc(args)}</code> を` : ''}書式 <code class="ic">"${esc(fmt)}"</code> で出力する${fmtDesc}` + note,
      };
    }
    if (/fopen\s*\(/.test(s)) {
      const wb = /"wb"/.test(s);
      return { kind: 'io', key: true, why: `ファイルを<b>バイナリ${wb ? '書き出し（"wb"）' : '読み込み（"rb"）'}モード</b>で開き、失敗（<code class="ic">NULL</code>）していないか同時に検査する` };
    }
    if (/^(fread|fwrite)\s*\((.+)\)\s*;/.test(s)) {
      const isRead = s.startsWith('fread');
      return { kind: 'io', why: `ファイルからバイナリデータを直接${isRead ? 'メモリ番地へ読み込む' : 'ファイルへ書き出す'}（BMP 画像ヘッダや BGR 画素値 1 バイト単位の入出力）` };
    }
    if (/^fclose\s*\(/.test(s)) {
      return { kind: 'io', why: '使い終わったファイルを閉じてバッファを確定・OS 資源を解放する' };
    }

    // --- 文字列関数 ---
    if (/if\s*\(\s*strcmp\s*\(([^,]+),\s*([^)]+)\)\s*==\s*0\s*\)/.test(s)) {
      m = /strcmp\s*\(([^,]+),\s*([^)]+)\)/.exec(s);
      return {
        kind: 'ctrl', key: true,
        why: `<b>文字列の一致判定イディオム</b>: <code class="ic">${esc(m[1].trim())}</code> と <code class="ic">${esc(m[2].trim())}</code> の文字の並びが完全に同じ（<code class="ic">strcmp == 0</code>）かどうか判定する（<code class="ic">==</code> だと番地比較になってしまう！）`,
      };
    }
    if ((m = /^strncpy\s*\(([^,]+),\s*([^,]+),\s*([^)]+)\)\s*;/.exec(s))) {
      return {
        kind: 'calc', key: true,
        why: `文字列 <code class="ic">${esc(m[2].trim())}</code> を最大 <code class="ic">${esc(m[3].trim())}</code> 文字までに制限して <code class="ic">${esc(m[1].trim())}</code> に安全コピーする（配列あふれ防止）`,
      };
    }
    if ((m = /^strcpy\s*\(([^,]+),\s*([^)]+)\)\s*;/.exec(s))) {
      return {
        kind: 'calc', key: true,
        why: `文字列 <code class="ic">${esc(m[2].trim())}</code> を終端 <code class="ic">'\\0'</code> ごと <code class="ic">${esc(m[1].trim())}</code> のメモリ領域へ丸ごとコピーする（文字列は <code class="ic">=</code> で代入できないため）`,
      };
    }

    // --- break / continue / do ---
    if (s === 'break;') {
      return { kind: 'ctrl', key: true, why: '現在の一番内側のループを即座に脱出して、ループの直後の処理へ進む' + note };
    }
    if (s === 'continue;') {
      return { kind: 'ctrl', why: '今回の反復の残りをスキップして、ループの次の回（更新式）へ進む' + note };
    }
    if (s === 'do {' || s === 'do') {
      return { kind: 'ctrl', why: '<code class="ic">do-while</code> ループ開始 — 条件判定の前に最低1回は必ず本体を実行する' };
    }
    if ((m = /^}\s*while\s*\((.+)\)\s*;/.exec(s))) {
      return { kind: 'ctrl', why: `<code class="ic">do-while</code> の継続判定: <code class="ic">${esc(m[1].trim())}</code> が真ならもう一度やり直す` + note };
    }

    // --- 制御構文 (for / while / if / else) ---
    if (/^for\s*\(\s*;\s*;\s*\)/.test(s) || /^while\s*\(\s*1\s*\)/.test(s)) {
      return {
        kind: 'ctrl', key: true,
        why: '<b>無限ループの定型形</b> — 何回繰り返すか事前に分からないため、まず無限に回し、中の終了条件（<code class="ic">EOF</code> や番兵値）で <code class="ic">break</code> する',
      };
    }
    if ((m = /^for\s*\(\s*p\s*=\s*head_p->next\s*;\s*p\s*!=\s*NULL\s*;\s*p\s*=\s*p->next\s*\)/.exec(s))) {
      return {
        kind: 'ptr', key: true,
        why: '<b>リスト走査【型A】</b>: ダミー節点の次（<code class="ic">head_p-&gt;next</code> = 最初の実データ）から始め、<code class="ic">NULL</code>（終端）に当たるまで矢印 <code class="ic">p = p-&gt;next</code> で 1 節点ずつたどる',
      };
    }
    if (/^for\s*\(\s*p\s*=\s*head_p\s*;\s*p->next\s*!=\s*NULL/.test(s)) {
      return {
        kind: 'ptr', key: true,
        why: '<b>リスト先読み走査【型B】</b>: ダミー節点 <code class="ic">head_p</code> から始め、<b>1つ先の節点 <code class="ic">p-&gt;next</code></b> を調べながら進む（削除や昇順挿入に必要な「直前の節点 <code class="ic">p</code>」を手元に残すため！）',
      };
    }
    if ((m = /^for\s*\(\s*(\w+)\s*=\s*0\s*;\s*(\w+)\[\1\]\s*!=\s*'\\0'\s*;\s*\1\+\+\s*\)/.exec(s))) {
      return {
        kind: 'ctrl', key: true,
        why: `<b>文字列走査の定型ループ</b>: 先頭 0 文字目から、文字列の終わりを示すヌル文字 <code class="ic">'\\0'</code> に出会うまで 1 文字ずつ調べる`,
      };
    }
    if ((m = /^for\s*\(\s*(\w+)\s*=\s*([^;]+);\s*([^;]*);\s*([^)]+)\)/.exec(s))) {
      const v = m[1], init = m[2].trim(), cond = m[3].trim(), step = m[4].trim();
      const rev = /--/.test(step) ? '<b>後ろ（末尾）から逆順に</b> ' : '';
      const condPart = cond ? `<code class="ic">${esc(cond)}</code> の間、` : '終了条件に当たるまで ';
      return {
        kind: 'ctrl',
        why: `${rev}ループ変数 <code class="ic">${esc(v)}</code> を <code class="ic">${esc(init)}</code> から始め、${condPart}<code class="ic">${esc(step)}</code> しながら繰り返す` + note,
      };
    }
    if ((m = /^while\s*\((.+)\)\s*\{?$/.exec(s))) {
      return {
        kind: 'ctrl', key: true,
        why: `条件 <code class="ic">${esc(m[1].trim())}</code> が成り立つ間、ブロック内の処理を繰り返す` + note,
      };
    }
    if ((m = /^(?:}\s*)?else\s+if\s*\((.+)\)/.exec(s))) {
      const inlineBody = /\)\s*\{(.+)\}\s*$/.exec(s);
      const tail = inlineBody ? ` → 成り立てば <code class="ic">${esc(inlineBody[1].trim())}</code> を実行` : '';
      return {
        kind: 'ctrl',
        why: `前の条件に当てはまらず、さらに <code class="ic">${esc(m[1].trim())}</code> が成り立つ場合の分岐${tail}` + note,
      };
    }
    if (/^(?:}\s*)?else\b/.test(s)) {
      const inlineBody = /else\s*\{(.+)\}\s*$/.exec(s);
      return {
        kind: 'ctrl',
        why: '上のどの条件にも当てはまらなかった場合の処理' + (inlineBody ? `: <code class="ic">${esc(inlineBody[1].trim())}</code>` : '') + note,
      };
    }
    if ((m = /^if\s*\((.+)\)\s*\{\s*(.+)\s*\}\s*$/.exec(s))) {
      const cond = m[1].trim(), act = m[2].trim();
      return {
        kind: 'ctrl', key: /\|\||&&|fabs|EPS|DBL_EPSILON|NULL/.test(cond),
        why: `条件 <code class="ic">${esc(cond)}</code> を判定 → 成り立てば <code class="ic">${esc(act)}</code>` + note,
      };
    }
    if ((m = /^if\s*\((.+)\)\s*\{?\s*$/.exec(s))) {
      const cond = m[1].trim();
      if (/==\s*NULL/.test(cond)) {
        return {
          kind: 'mem', key: true,
          why: `<b>NULL チェック</b>: <code class="ic">${esc(cond)}</code> — メモリ確保（<code class="ic">malloc/realloc</code>）の失敗検査、またはリスト/二分木の終端（空）判定` + note,
        };
      }
      return {
        kind: 'ctrl', key: /\|\||&&|fabs|EPS|DBL_EPSILON/.test(cond),
        why: `条件 <code class="ic">${esc(cond)}</code> が成り立つかどうかを判定し、真ならブロック内へ進む` + note,
      };
    }

    // --- 時間計測 clock() ---
    if (/clk_(?:start|end)\s*=\s*clock\s*\(\s*\)/.test(s)) {
      const isStart = /clk_start/.test(s);
      return {
        kind: 'calc', key: true,
        why: `現在の CPU 経過時間（クロック数）を <code class="ic">${isStart ? 'clk_start（計測開始時刻）' : 'clk_end（計測終了時刻）'}</code> に記録する（差を <code class="ic">CLOCKS_PER_SEC</code> で割ると秒になる）`,
      };
    }
    if (/^myrand_init\s*\(\s*\)\s*;/.test(s)) {
      return {
        kind: 'calc', key: true,
        why: '乱数の種（シード）を初期状態にリセットする — <b>2回目も同じ乱数列を再現</b>して「必ず見つかる検索（hit）」を正確にテストするための仕掛け',
      };
    }
    if (/^srand\s*\((.+)\)\s*;/.test(s)) {
      return { kind: 'calc', why: '乱数生成器 <code class="ic">rand()</code> の初期シードを設定し、乱数列を初期化する' };
    }

    // --- リスト・二分木・ポインタ操作 ---
    if (/new_node->next\s*=\s*n->next/.test(s)) {
      return {
        kind: 'ptr', key: true,
        why: '<b>【最重要・手順1】</b> 新しい節点の <code class="ic">next</code> に「今まで <code class="ic">n</code> の次だった節点の番地」を先に覚えさせる（先に <code class="ic">n-&gt;next</code> を書き換えると後ろのリストが迷子になる！）',
      };
    }
    if (/n->next\s*=\s*new_node/.test(s)) {
      return {
        kind: 'ptr', key: true,
        why: '<b>【最重要・手順2】</b> 手順1で後ろをつないだ後で、節点 <code class="ic">n</code> の矢印 <code class="ic">n-&gt;next</code> を新しい節点へ切り替える（これで挿入完了！）',
      };
    }
    if (/p->next\s*=\s*old->next/.test(s)) {
      return {
        kind: 'ptr', key: true,
        why: '削除する節点 <code class="ic">old</code> を飛び越えて、直前の節点 <code class="ic">p</code> の矢印を「<code class="ic">old</code> の次」へつなぎ替える',
      };
    }
    if (/^\*\s*\(\s*\(\s*(int|double)\s*\*\s*\)\s*([0-9xXa-fA-F]+)\s*\)\s*=\s*(.+);/.test(s)) {
      m = /^\*\s*\(\s*\(\s*(int|double)\s*\*\s*\)\s*([0-9xXa-fA-F]+)\s*\)\s*=\s*(.+);/.exec(s);
      return {
        kind: 'ptr', key: true,
        why: `番地 <code class="ic">${esc(m[2])}</code> を「<code class="ic">${m[1]}</code> 型変数の番地」にキャスト（型変換）し、<code class="ic">*</code> でその番地の中身に直接 <code class="ic">${esc(m[3])}</code> を書き込む`,
      };
    }
    if ((m = /^\*\s*(\w+)\s*=\s*(.+)\s*;/.exec(s))) {
      return {
        kind: 'ptr', key: true,
        why: `ポインタ <code class="ic">${esc(m[1])}</code> が<b>指している先の変数（呼び出し元の変数）</b>に <code class="ic">${esc(m[2])}</code> を書き込む` + note,
      };
    }
    if ((m = /^(\w+)\s*=\s*&\s*([^;]+)\s*;/.exec(s))) {
      return {
        kind: 'ptr', key: true,
        why: `変数 <code class="ic">${esc(m[2].trim())}</code> の<b>メモリの番地</b>を <code class="ic">&amp;</code> で取り出し、ポインタ変数 <code class="ic">${esc(m[1])}</code> に格納する（矢印を向ける）`,
      };
    }
    if ((m = /^(\w+)->(\w+(?:\.\w+)?(?:\[[^\]]+\])*)\s*=\s*(.+)\s*;/.exec(s))) {
      return {
        kind: 'ptr', key: /left|right|next|sp|size|data/.test(m[2]),
        why: `ポインタ <code class="ic">${esc(m[1])}</code> が指す構造体のメンバー <code class="ic">${esc(m[2])}</code> に <code class="ic">${esc(m[3])}</code> をセットする（<code class="ic">${esc(m[1])}-&gt;${esc(m[2])}</code> は <code class="ic">(*${esc(m[1])}).${esc(m[2])}</code> と同じ）` + note,
      };
    }

    // --- 変数宣言 ---
    if ((m = /^(static\s+)?(const\s+)?(unsigned\s+long|unsigned\s+char|short|int|double|float|char|size_t|clock_t|FILE|[a-z_]+_t)\s*(\*+\s*)?(.+)\s*;$/.exec(s))) {
      const isStatic = !!m[1], isConst = !!m[2], ty = m[3], ptrPre = m[4] || '', rest = ptrPre + m[5];
      const staticNote = isStatic ? '<b>static 領域</b>（関数が終わっても消えず、大きなデータでもスタックあふれしない領域）に ' : '';
      const constNote = isConst ? '書き換え不可の定数として ' : '';
      const ptrHint = /\*/.test(rest) ? '（<code class="ic">*</code> 付きは値そのものではなく「番地」を入れるポインタ変数）' : /\[/.test(rest) ? '（連続したメモリ領域を配列として確保）' : '';
      const initHint = /=/.test(rest) ? '（宣言と同時に初期値をセットしてゴミ値を防ぐ）' : '';
      return {
        kind: 'decl', key: isStatic || /\*\*/.test(rest),
        why: `${staticNote}${constNote}<code class="ic">${esc(ty)}</code> 型の変数 <code class="ic">${esc(rest)}</code> をメモリ上に用意する${ptrHint}${initHint}` + note,
      };
    }

    // --- 複数行にまたがる関数ヘッダや fprintf 等 ---
    if (st.prevDepth === 0 && /^(static\s+)?[A-Za-z_][\w\s\*]*\b([A-Za-z_]\w*)\s*\([^;]*,$/.test(s)) {
      const fm = /\b([A-Za-z_]\w*)\s*\(/.exec(s);
      return { kind: 'decl', key: true, why: `関数 <code class="ic">${esc(fm ? fm[1] : s)}</code> の定義ヘッダ（引数が長いため次の行へ続く）` };
    }
    if (/^fprintf\s*\(\s*stderr\s*,/.test(s)) {
      return { kind: 'io', key: true, why: '<b>標準エラー出力（stderr）</b>へ途中経過や見出しを出力する（次の行の引数へ続く）' };
    }
    if (/^"[A-Za-z0-9_]/.test(s) && /\)\s*;$/.test(s)) {
      return { kind: 'io', why: '前の行の <code class="ic">printf / fprintf</code> に渡す残りの引数リスト' };
    }
    if (st.prevDepth === 0 && /\)\s*$/.test(s) && !s.includes('(')) {
      return { kind: 'decl', why: '前の行から続く関数ヘッダの残りの引数宣言' };
    }

    // --- 単独の関数呼び出し / 代入・計算 ---
    if ((m = /^([A-Za-z_]\w*)\s*\((.*)\)\s*;$/.exec(s))) {
      const fn = m[1], args = m[2];
      const amp = /&/.test(args) ? '（<code class="ic">&amp;</code> で変数の番地を渡し、関数の中で結果を書き込んでもらう）' : '';
      return {
        kind: 'calc', key: /&/.test(args),
        why: `関数 <code class="ic">${esc(fn)}</code> に引数 <code class="ic">${esc(args)}</code> を渡して呼び出す${amp}` + note,
      };
    }
    if ((m = /^(.+?)\s*(\+\+|--)\s*;$/.exec(s))) {
      const target = m[1].trim();
      const bucketHint = /\[.+\]/.test(target) ? '（出た値に対応する箱の出現回数を +1 カウントするバケット集計！）' : '';
      return {
        kind: 'calc', key: /\[.+\]/.test(target),
        why: `<code class="ic">${esc(target)}</code> の値を <b>1 ${m[2] === '++' ? '増やす' : '減らす'}</b>${bucketHint}` + note,
      };
    }
    if ((m = /^(.+?)\s*(\+=|-=|\*=|\/=|=)\s*(.+)\s*;$/.exec(s))) {
      const lhs = m[1].trim(), op = m[2], rhs = m[3].trim();
      const opMap = { '+=': 'に足し込む（累積）', '-=': 'から引く', '*=': 'に掛ける', '/=': 'を割る', '=': 'に計算結果・値を代入する' };
      const randHint = /rand\s*\(\s*\)\s*%/.test(rhs) ? ' — <code class="ic">rand() % 幅 + 最小値</code> で指定範囲の整数乱数を作る定型式' : '';
      return {
        kind: 'calc', key: /rand|sqrt|realloc|new_array_scan|pref_new|create_node|insert_node|tree_insert/.test(rhs),
        why: `<code class="ic">${esc(lhs)}</code> ${opMap[op] || 'を更新'}: <code class="ic">${esc(rhs)}</code>${randHint}` + note,
      };
    }

    return { kind: 'calc', why: `<code class="ic">${esc(s)}</code> を実行する` + note };
  }

  /* =========================================================================
   *  2. UI コンポーネント: 1行ずつの意図ビューア (Line-by-Line Annotated Code)
   * ========================================================================= */
  function annotatedCode(filesObj, opts) {
    opts = opts || {};
    const names = Object.keys(filesObj || {});
    if (!names.length) return h('div');
    let cur = names[0];
    let quizMode = false;     // 「意図を隠して自分で言えるかチェック」モード
    let onlyKey = false;      // 「核心の行だけハイライト」モード

    const fileTabs = names.length > 1 ? h('div.lbl-tabs', names.map((f) =>
      h('button' + (f === cur ? '.on' : ''), { type: 'button', 'data-f': f, onclick: () => { cur = f; [...fileTabs.children].forEach((b) => b.classList.toggle('on', b.dataset.f === f)); draw(); } }, f)
    )) : null;

    const btnQuiz = h('button.etb', {
      type: 'button',
      title: '解説を伏せて、各行の意図を自分の言葉で言えるかテストできます（行クリックで1行ずつ開示）',
      onclick: () => { quizMode = !quizMode; btnQuiz.classList.toggle('on', quizMode); wrap.classList.toggle('lbl-quiz', quizMode); },
    }, icon('eye'), h('span', '意図チェック（暗記）'));

    const btnKey = h('button.etb', {
      type: 'button',
      title: 'この課題で特に重要な核心行（★）を目立たせます',
      onclick: () => { onlyKey = !onlyKey; btnKey.classList.toggle('on', onlyKey); wrap.classList.toggle('lbl-focus-key', onlyKey); },
    }, icon('spark'), h('span', '核心行を強調'));

    const btnCopy = h('button.etb', {
      type: 'button',
      onclick: () => copyText(filesObj[cur] || '').then((ok) => ok && flashCopied(btnCopy)),
    }, icon('copy'), h('span', 'コードのみコピー'));

    const body = h('div.lbl-list');
    const wrap = h('div.lbl-box',
      h('div.lbl-head',
        h('div.lbl-title',
          h('span.chip.ptr', '1行ずつ解剖'),
          h('b', opts.title || 'コードの1行ずつの意図・役割'),
          h('span.c-mute.lbl-sub', '行をクリックするとマーク / 暗記モード時は1行ずつ答えを開けます')),
        h('div.lbl-ctrl', btnKey, btnQuiz, btnCopy)),
      fileTabs,
      body);

    function draw() {
      body.innerHTML = '';
      const rows = analyzeFileLines(cur, filesObj[cur] || '', { overrides: opts.overrides });
      rows.forEach((r) => {
        if (r.empty) {
          body.appendChild(h('div.lbl-row.empty', h('span.lbl-ln', String(r.ln)), h('span.lbl-code', ' '), h('span.lbl-why', '')));
          return;
        }
        const km = KIND_META[r.kind] || KIND_META.calc;
        const phBtn = r.phrase ? h('button.lbl-ph-tag', {
          type: 'button',
          title: 'この定型フレーズの詳しい解説を開く',
          onclick: (e) => { e.stopPropagation(); openPhraseModal(r.phrase); },
        }, '📌 定型フレーズ') : null;

        const rowEl = h('div.lbl-row' + (r.key ? '.is-key' : '') + (r.kind === 'cmt' ? '.is-cmt' : ''),
          { onclick: () => rowEl.classList.toggle('peek') },
          h('span.lbl-ln', String(r.ln), r.key ? h('i.lbl-star', { title: 'この課題の核心行' }, '★') : null),
          h('div.lbl-code', h('span', { html: r.html })),
          h('div.lbl-why',
            h('span.lbl-kind.' + km.cls, km.label),
            h('span.lbl-txt', { html: r.why }),
            phBtn));
        body.appendChild(rowEl);
      });
    }
    draw();
    return wrap;
  }

  /* =========================================================================
   *  3. 定型フレーズ詳細モーダル & フレーズカード描画
   * ========================================================================= */
  function findPhrase(id) {
    return (DATA().phrases || []).find((p) => p.id === id);
  }

  function renderPhraseDetail(p) {
    return h('div.ph-detail',
      h('div.ph-d-top',
        h('span.chip.ptr', p.unit.toUpperCase()),
        h('span.chip.val', p.cat),
        p.must ? h('span.chip.addr', '★ 暗記必須フレーズ') : null),
      h('pre.ph-code-big', { html: hlCode(p.code).join('\n') }),
      p.parts && p.parts.length ? h('div.ph-parts',
        h('h6', '🔍 フレーズの部品分解（どこが何を表している？）'),
        h('div.ph-parts-grid', p.parts.map((pt) =>
          h('div.ph-part', h('code.ic.p', pt[0]), h('span', { html: pt[1] }))
        ))) : null,
      h('div.ph-ess',
        h('div.ph-ess-row', h('b.c-val', '💡 何の意図？'), h('p', { html: p.intent })),
        p.trap ? h('div.ph-ess-row.trap', h('b.c-ptr', '⚠ よくある罠'), h('p', { html: p.trap })) : null,
        p.when ? h('div.ph-ess-row', h('b.c-ok', '🎯 いつ使う？'), h('p', { html: p.when })) : null));
  }

  function openPhraseModal(id) {
    const p = findPhrase(id);
    if (!p || !U.sheet) return;
    U.sheet({
      title: '定型フレーズ解説: ' + p.title,
      sub: p.unit.toUpperCase() + ' · ' + p.cat,
      face: 's',
      mood: 'happy',
      body: renderPhraseDetail(p),
      actions: [
        { label: 'フレーズをコピー', kind: 'ghost', onClick: () => { copyText(p.code); U.toast('フレーズをコピーしました'); return false; } },
        { label: '閉じる', kind: 'ptr', value: true },
      ],
    });
  }

  /* 単元ページ内に埋め込む「エッセンシャル + 覚えるべき定型フレーズ」セクション */
  function renderUnitEssentials(unitId) {
    const d = DATA();
    const u = (d.units || {})[unitId];
    const phrases = (d.phrases || []).filter((p) => p.unit === unitId || (p.also && p.also.includes(unitId)));
    if (!u && !phrases.length) return null;

    const savedKey = 'phrase_master:' + unitId;
    const mastered = store.get(savedKey, {});
    let flashMode = false;

    const sec = h('section.chap.ess-chap#essentials', { 'aria-labelledby': 'essentials-h' },
      h('div.chap-head.rv.in',
        h('div.chap-num.ess-badge', '★'),
        h('div',
          h('div.chap-kicker', 'Essentials & Key Phrases'),
          h('h2#essentials-h', u ? u.title : '理解のエッセンシャル & 覚えるべきフレーズ'),
          h('p.chap-lead', u ? u.lead : '丸暗記ではなく「なぜその1行・その記号が必要なのか」を本質から押さえ、手が勝手に動く定型フレーズとして身につけよう。'))));

    // A. エッセンシャル（本質理解の3本柱 + メンタルモデル）
    if (u && u.pillars) {
      const pilGrid = h('div.ess-pillars', u.pillars.map((pl, idx) =>
        h('div.ess-pillar', { style: { '--pi': idx } },
          h('div.ep-top', h('span.ep-num', 'ESSENTIAL ' + (idx + 1)), h('span.ep-tag', pl.tag)),
          h('h3.ep-h', { html: pl.title }),
          h('p.ep-why', { html: pl.why }),
          pl.contrast ? h('div.ep-vs',
            h('div.ng', h('b', '✗ ダメな直感 / ミス'), h('div', { html: pl.contrast[0] })),
            h('div.ok', h('b', '✓ 正しいメンタルモデル'), h('div', { html: pl.contrast[1] }))) : null,
          pl.rule ? h('div.ep-rule', h('span', '黄金ルール'), h('b', { html: pl.rule })) : null)
      ));
      sec.appendChild(h('div.blk', pilGrid));
    }

    // B. 覚えるべき定型フレーズカード一覧（フラッシュカードモード切替付き）
    if (phrases.length) {
      const cntEl = h('span.chip.ok', '');
      const updCnt = () => {
        const doneN = phrases.filter((p) => mastered[p.id]).length;
        cntEl.textContent = `習得 ${doneN} / ${phrases.length}`;
      };
      updCnt();

      const btnFlash = h('button.btn.sm', {
        type: 'button',
        onclick: () => {
          flashMode = !flashMode;
          btnFlash.classList.toggle('pri', flashMode);
          pGrid.classList.toggle('flash-mode', flashMode);
          btnFlash.lastChild.textContent = flashMode ? 'コードを表示に戻す' : '暗記テスト（コードを隠す）';
        },
      }, icon('eye'), h('span', '暗記テスト（コードを隠す）'));

      const btnAllPhrase = h('button.btn.sm.ghost', {
        type: 'button',
        onclick: () => openPhraseBook(unitId),
      }, icon('book'), h('span', '全単元のフレーズ図鑑を開く'));

      const pHead = h('div.ph-sec-head',
        h('div',
          h('div.blk-title', '📌 この単元で覚えるべき定型フレーズ（イディオム）'),
          h('p.c-mute', { style: { margin: '2px 0 0', fontSize: '13.5px' } }, 'C言語は「1文字の意味」が重い言語です。部品ごとの理由を理解した上で、そのまま書けるフレーズとして手に馴染ませよう。')),
        h('div.ph-sec-ctrl', cntEl, btnFlash, btnAllPhrase));

      const pGrid = h('div.ph-grid');
      phrases.forEach((p) => {
        const chk = h('button.ph-check' + (mastered[p.id] ? '.on' : ''), {
          type: 'button',
          onclick: (e) => {
            e.stopPropagation();
            mastered[p.id] = !mastered[p.id];
            store.set(savedKey, mastered);
            chk.classList.toggle('on', !!mastered[p.id]);
            card.classList.toggle('done', !!mastered[p.id]);
            chk.textContent = mastered[p.id] ? '✓ 覚えた!' : '○ 覚えたチェック';
            updCnt();
          },
        }, mastered[p.id] ? '✓ 覚えた!' : '○ 覚えたチェック');

        const codeMask = h('div.ph-code-wrap',
          h('pre.ph-code', { html: hlCode(p.code).join('\n') }),
          h('div.ph-mask-hint', 'クリックして正解コードを確認 👀'),
          h('button.cb-copy', {
            type: 'button',
            onclick: (e) => { e.stopPropagation(); copyText(p.code).then((ok) => ok && flashCopied(e.currentTarget)); },
            html: U.ICONS.copy + '<span>コピー</span>',
          }));
        codeMask.addEventListener('click', () => codeMask.classList.toggle('revealed'));

        const card = h('article.ph-card' + (mastered[p.id] ? '.done' : ''),
          h('div.ph-c-head',
            h('span.chip.val', p.cat),
            p.must ? h('span.ph-must', '★ 必須') : null,
            h('span.sp'),
            chk),
          h('h4.ph-c-title', p.title),
          codeMask,
          p.parts && p.parts.length ? h('div.ph-mini-parts', p.parts.map((pt) =>
            h('span.ph-mp', h('code', pt[0]), h('small', { html: pt[1] }))
          )) : null,
          h('p.ph-c-intent', { html: p.intent }),
          p.trap ? h('div.ph-c-trap', h('b', '落とし穴: '), h('span', { html: p.trap })) : null);
        pGrid.appendChild(card);
      });

      sec.appendChild(h('div.blk', pHead, pGrid));
    }

    return sec;
  }

  /* =========================================================================
   *  4. 全単元横断「定型フレーズ & エッセンシャル図鑑」モーダル (どこからでも呼べる)
   * ========================================================================= */
  function openPhraseBook(initialUnit) {
    if (!U.sheet) return;
    const all = DATA().phrases || [];
    let filterU = initialUnit || 'all';
    let q = '';
    let hideCode = false;

    const searchIn = h('input.phb-search', {
      type: 'search',
      placeholder: 'フレーズを検索（例: EOF, stderr, malloc, %lf, ->next, 転置, ポインタ…）',
      'aria-label': 'フレーズ検索',
    });
    const unitBtns = ['all', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b8', 't1', 't2'].map((u) =>
      h('button' + (u === filterU ? '.on' : ''), {
        type: 'button',
        'data-u': u,
        onclick: () => {
          filterU = u;
          unitBtns.forEach((b) => b.classList.toggle('on', b.dataset.u === u));
          renderList();
        },
      }, u === 'all' ? 'すべて (' + all.length + ')' : u.toUpperCase())
    );
    const toggleHide = h('button.etb', {
      type: 'button',
      onclick: () => {
        hideCode = !hideCode;
        toggleHide.classList.toggle('on', hideCode);
        listHost.classList.toggle('flash-mode', hideCode);
      },
    }, icon('eye'), h('span', '暗記モード'));

    const listHost = h('div.phb-list');
    function renderList() {
      listHost.innerHTML = '';
      const kw = q.trim().toLowerCase();
      const hits = all.filter((p) => {
        if (filterU !== 'all' && p.unit !== filterU && !(p.also && p.also.includes(filterU))) return false;
        if (!kw) return true;
        const hay = [p.title, p.cat, p.code, p.intent, p.trap || '', p.when || ''].join(' ').toLowerCase();
        return hay.includes(kw);
      });
      if (!hits.length) {
        listHost.appendChild(h('p.c-mute', { style: { padding: '20px', textAlign: 'center' } }, '該当するフレーズが見つかりませんでした。別のキーワードを試してみてね。'));
        return;
      }
      hits.forEach((p) => {
        const cw = h('div.ph-code-wrap',
          h('pre.ph-code', { html: hlCode(p.code).join('\n') }),
          h('div.ph-mask-hint', 'クリックで正解コードを表示 👀'),
          h('button.cb-copy', {
            type: 'button',
            onclick: (e) => { e.stopPropagation(); copyText(p.code).then((ok) => ok && flashCopied(e.currentTarget)); },
            html: U.ICONS.copy + '<span>コピー</span>',
          }));
        cw.addEventListener('click', () => cw.classList.toggle('revealed'));
        listHost.appendChild(h('div.phb-item',
          h('div.ph-c-head',
            h('span.chip.ptr', p.unit.toUpperCase()),
            h('span.chip.val', p.cat),
            p.must ? h('span.ph-must', '★ 暗記必須') : null,
            h('b.phb-t', p.title)),
          cw,
          p.parts && p.parts.length ? h('div.ph-mini-parts', p.parts.map((pt) =>
            h('span.ph-mp', h('code', pt[0]), h('small', { html: pt[1] }))
          )) : null,
          h('p.ph-c-intent', { html: p.intent }),
          p.trap ? h('div.ph-c-trap', h('b', '落とし穴: '), h('span', { html: p.trap })) : null));
      });
    }
    searchIn.addEventListener('input', () => { q = searchIn.value; renderList(); });
    renderList();

    const body = h('div.phb-wrap',
      h('div.phb-bar', searchIn, toggleHide),
      h('div.tabs.phb-tabs', unitBtns),
      listHost);

    U.sheet({
      cls: 'bs-wide',
      title: '覚えるべき C 定型フレーズ図鑑',
      sub: 'B1〜B6・中間試験 T1 の頻出イディオムを部品ごとに完全解説',
      face: 's',
      mood: 'happy',
      focus: '.phb-search',
      body,
    });
  }

  /* =========================================================================
   *  5. 課題ラボ用: 「課題の設計図（思考ステップ・使うフレーズ・核心）」+「1行ずつ解説」
   * ========================================================================= */
  function resolveTaskSolution(unitId, task) {
    if (task.solution && Object.keys(task.solution).length) return task.solution;
    const dKey = (unitId || '').toUpperCase() + '_DATA';
    const D = g[dKey];
    if (D && D.sol && D.sol[task.id]) return D.sol[task.id];
    if (task.id === '1-2' && g.B1_DATA && g.B1_DATA.exp && g.B1_DATA.exp['1-1']) {
      return { 'san-exp.txt': g.B1_DATA.exp['1-1'] };
    }
    return null;
  }

  /* 共有ファイル (matrix.c / list.c / istack.c / tree.c / pref.c) では、
     その課題で書く関数だけを切り出した「この課題の該当部分」も先頭タブとして用意する */
  function extractTaskFocusedSolution(unitId, task, fullSol) {
    if (!fullSol) return null;
    const gd = (DATA().tasks || {})[unitId + ':' + task.id] || {};
    if (!gd.focusFn) return fullSol;
    const out = {};
    const fns = Array.isArray(gd.focusFn) ? gd.focusFn : [gd.focusFn];
    const mainFile = task.files[0];
    const fullText = fullSol[mainFile];
    if (fullText) {
      const chunks = [];
      fns.forEach((fn) => {
        const re = new RegExp('(?:/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)*/\\s*)?(?:static\\s+)?[A-Za-z_][\\w\\s\\*]*\\b' + fn + '\\s*\\([^;{}]*\\)\\s*(?:/\\*[\\s\\S]*?\\*/\\s*)*\\{[\\s\\S]*?\\n\\}', 'm');
        const m = re.exec(fullText);
        if (m) chunks.push(m[0]);
      });
      if (chunks.length) {
        out[mainFile + '（' + task.label + ' の該当関数）'] = chunks.join('\n\n') + '\n';
      }
    }
    Object.keys(fullSol).forEach((k) => { out[k] = fullSol[k]; });
    return out;
  }

  /* 自動フォールバック生成（GUIDE_DATA.tasks に個別記述がない場合も必ず設計図を出す） */
  function getTaskGuideInfo(unitId, task, solObj) {
    const key = unitId + ':' + task.id;
    const explicit = (DATA().tasks || {})[key];
    if (explicit) return explicit;

    // フォールバック: 模範解答のキーフレーズを自動抽出
    const allCode = Object.values(solObj || {}).join('\n');
    const phs = (DATA().phrases || []).filter((p) => {
      if (p.detect && p.detect.test(allCode)) return true;
      return false;
    }).slice(0, 4).map((p) => p.id);

    return {
      essence: task.summary ? task.summary.replace(/\n/g, '') : task.title,
      steps: (task.hints || []).map((ht) => ht),
      phrases: phs,
    };
  }

  function renderTaskBlueprint(unitId, task) {
    const rawSol = resolveTaskSolution(unitId, task);
    const sol = extractTaskFocusedSolution(unitId, task, rawSol);
    const info = getTaskGuideInfo(unitId, task, rawSol);

    const wrap = h('div.tk-guide');

    // --- 1) 課題のエッセンシャル & 思考の設計図 (最初から見やすく開ける折りたたみ) ---
    const phraseChips = (info.phrases || []).map((pid) => {
      const p = findPhrase(pid);
      if (!p) return null;
      return h('button.tkg-ph', {
        type: 'button',
        onclick: () => openPhraseModal(pid),
        title: 'クリックで定型フレーズの部品解説を開く',
      }, h('span.tkg-ph-t', p.title), h('code', p.short || p.code.split('\n')[0]));
    }).filter(Boolean);

    const bpBody = h('div.tkg-body',
      h('div.tkg-ess',
        h('div.tkg-ess-badge', '🎯 この課題のエッセンシャル（本質）'),
        h('p', { html: info.essence })),
      info.steps && info.steps.length ? h('div.tkg-steps',
        h('h6', '🧭 コードに落とす思考ステップ（上から順に組み立てる）'),
        h('ol', info.steps.map((st) => h('li', { html: st })))) : null,
      phraseChips.length ? h('div.tkg-phrases',
        h('h6', '📌 この課題で使う「覚えるべき定型フレーズ」（クリックで部品分解）'),
        h('div.tkg-ph-list', phraseChips)) : null,
      info.pitfall ? h('div.tkg-pitfall',
        h('b', '⚠ 減点・バグになりやすい急所: '),
        h('span', { html: info.pitfall })) : null);

    const bpDetails = h('details.tkg-card', { open: true },
      h('summary.tkg-sum',
        h('span.tkg-ic', icon('spark')),
        h('div.tkg-sum-txt',
          h('b', '理解のためのエッセンシャル & 使う定型フレーズ'),
          h('small', '何のために何を書くか — 思考の設計図を確認してから書き始めよう')),
        h('span.tkg-chev', '▾')),
      bpBody);

    wrap.appendChild(bpDetails);

    // --- 2) スターターコード（配布骨格）の1行ずつ解説 + 模範解答の1行ずつ意図解説 ---
    const starterHost = h('div.tkg-lbl-host');
    let starterOpen = false;
    const btnStarterLbl = h('button.btn.sm', {
      type: 'button',
      onclick: () => {
        starterOpen = !starterOpen;
        if (!starterOpen) { starterHost.innerHTML = ''; btnStarterLbl.lastChild.textContent = 'スターター（初期コード）を1行ずつ読む'; return; }
        starterHost.innerHTML = '';
        const stFiles = Object.assign({}, task.starter || {}, task.given || {});
        starterHost.appendChild(annotatedCode(stFiles, {
          title: task.label + ' — 初期コード・配布ファイルの1行ずつの意味',
          overrides: info.lines,
        }));
        btnStarterLbl.lastChild.textContent = '初期コードの1行解説を閉じる';
      },
    }, icon('layers'), h('span', 'スターター（初期コード）を1行ずつ読む'));

    const solLblHost = h('div.tkg-lbl-host');
    let solOpen = false;
    const btnSolLbl = sol ? h('button.btn.sm.ghost', {
      type: 'button',
      onclick: () => {
        if (solOpen) {
          solOpen = false;
          solLblHost.innerHTML = '';
          btnSolLbl.lastChild.textContent = '完成コードの1行ずつの意図解説';
          return;
        }
        const openIt = () => {
          solOpen = true;
          solLblHost.innerHTML = '';
          solLblHost.appendChild(annotatedCode(sol, {
            title: task.label + ' — 完成コード 1行ずつの意図・フレーズ完全解説',
            overrides: info.lines,
          }));
          btnSolLbl.lastChild.textContent = '完成コードの1行解説を閉じる';
          setTimeout(() => solLblHost.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
        };
        const p = store.get('progress:' + unitId, { tasks: {} });
        if (p.tasks && p.tasks[task.id] === 'done') { openIt(); return; }
        if (U.ask) {
          U.ask({
            title: '完成コードの「1行ずつの意図解説」を開く？',
            sub: '課題 ' + task.label + ' ' + task.short,
            html: '模範解答のコードを<b>1行ずつ「なぜこの行があるのか・どの定型フレーズなのか」</b>まで分解して表示します。<br>読んだあとは<b>「意図チェック（暗記）」ボタン</b>や、白紙からの自力入力で定着させるのがおすすめです！',
            ok: '1行ずつ解説を見る',
            cancel: 'まずはヒントで考える',
            face: 's',
            mood: 'happy',
          }).then((y) => y && openIt());
        } else openIt();
      },
    }, icon('book'), h('span', '完成コードの1行ずつの意図解説')) : null;

    wrap.appendChild(h('div.tkg-bar',
      btnStarterLbl,
      btnSolLbl,
      h('span.sp'),
      h('button.btn.sm.ghost', { type: 'button', onclick: () => openPhraseBook(unitId) }, icon('tag'), h('span', '定型フレーズ図鑑'))));
    wrap.appendChild(starterHost);
    wrap.appendChild(solLblHost);

    return wrap;
  }

  /* 章の中の読み取り専用コードブロックにも「1行ずつの意図を見る」トグルを付与 */
  function enhanceCodeBlock(codeWrapEl, srcText, title) {
    if (!codeWrapEl || !srcText) return codeWrapEl;
    let open = false;
    const host = h('div.cb-lbl-host');
    const btn = h('button.cb-lbl-btn', {
      type: 'button',
      title: 'このコードの1行ずつの意図・役割を表示',
      onclick: (e) => {
        e.stopPropagation();
        open = !open;
        btn.classList.toggle('on', open);
        btn.querySelector('span').textContent = open ? '1行解説を閉じる' : '1行ずつの意図';
        if (!open) { host.innerHTML = ''; return; }
        host.innerHTML = '';
        host.appendChild(annotatedCode({ 'example.c': srcText }, { title: (title ? title.replace(/<[^>]+>/g, '') + ' — ' : '') + '1行ずつの意図' }));
      },
    });
    btn.innerHTML = U.ICONS.layers + '<span>1行ずつの意図</span>';
    codeWrapEl.appendChild(btn);
    return h('div.cb-outer', codeWrapEl, host);
  }

  g.Guide = {
    analyzeFileLines,
    annotatedCode,
    renderUnitEssentials,
    renderTaskBlueprint,
    enhanceCodeBlock,
    openPhraseBook,
    openPhraseModal,
    resolveTaskSolution,
    extractTaskFocusedSolution,
  };
})(window);
