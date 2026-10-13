/* =========================================================================
 *  CLab — 学習用 C サブセット・インタプリタ
 *  - メモリを「番地 → セル」のモデルで再現し, 全ステップの変化を記録する
 *  - 未初期化・型不一致・不正番地・NULL 参照などを日本語で指摘する
 * ========================================================================= */
(function (global) {
  'use strict';

  /* ---------- エラー ---------- */
  class CError extends Error {
    constructor(msg, loc) { super(msg); this.loc = loc || null; this.isC = true; }
  }

  /* ---------- 型 ---------- */
  const T = {
    int: { k: 'int', size: 4, name: 'int' },
    long: { k: 'long', size: 8, name: 'long' },
    char: { k: 'char', size: 1, name: 'char' },
    float: { k: 'double', size: 4, name: 'float' },
    double: { k: 'double', size: 8, name: 'double' },
    void: { k: 'void', size: 1, name: 'void' },
  };
  const ptr = (to) => ({ k: 'ptr', to, size: 8 });
  const arr = (of, n) => ({ k: 'arr', of, n, size: of.size * n });
  const isInt = (t) => t.k === 'int' || t.k === 'long' || t.k === 'char';
  const isArith = (t) => isInt(t) || t.k === 'double';
  const isScalar = (t) => isArith(t) || t.k === 'ptr';
  const cellKind = (t) => (t.k === 'ptr' ? 'ptr' : t.name === 'float' ? 'double' : t.k);
  function typeStr(t) {
    if (!t) return '?';
    if (t.k === 'ptr') return typeStr(t.to) + ' *';
    if (t.k === 'arr') return typeStr(t.of) + '[' + t.n + ']';
    if (t.k === 'struct') return t.name;
    if (t.unsigned) return 'unsigned ' + t.name;
    return t.name;
  }
  const kindLabel = { int: 'int', long: 'long', char: 'char', double: 'double', ptr: 'ポインタ' };

  /* ---------- 字句解析 ---------- */
  const PUNCT = ['...', '<<=', '>>=', '->', '++', '--', '<<', '>>', '<=', '>=', '==', '!=', '&&', '||',
    '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=',
    '+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~', '?', ':', ';', ',', '.', '(', ')', '[', ']', '{', '}'];

  function tokenize(src, file) {
    src = src.replace(/\r\n?/g, '\n').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\u3000/g, ' ');
    const toks = [];
    let i = 0, line = 1, bol = true;
    const n = src.length;
    const err = (m) => { throw new CError(m, { file, line }); };
    while (i < n) {
      const c = src[i];
      if (c === '\n') { line++; i++; bol = true; continue; }
      if (c === ' ' || c === '\t') { i++; continue; }
      if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') {
        i += 2;
        while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; }
        i += 2; continue;
      }
      if (c === '#' && bol) {
        let j = i; while (j < n && src[j] !== '\n') j++;
        toks.push({ ty: 'dir', v: src.slice(i + 1, j).trim(), file, line });
        i = j; continue;
      }
      bol = false;
      if (/[A-Za-z_]/.test(c)) {
        let j = i; while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
        toks.push({ ty: 'id', v: src.slice(i, j), file, line }); i = j; continue;
      }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1]))) {
        let m = /^0[xX][0-9a-fA-F]+[uUlL]*/.exec(src.slice(i, i + 40));
        if (m) { toks.push({ ty: 'num', v: parseInt(m[0].replace(/[uUlL]/g, ''), 16), isF: false, isL: /[lL]/.test(m[0]), file, line }); i += m[0].length; continue; }
        m = /^([0-9]*\.[0-9]*([eE][+-]?[0-9]+)?|[0-9]+[eE][+-]?[0-9]+)[fFlL]?/.exec(src.slice(i, i + 60));
        if (m && /[.eE]/.test(m[0])) { toks.push({ ty: 'num', v: parseFloat(m[0]), isF: true, file, line }); i += m[0].length; continue; }
        m = /^[0-9]+[uUlL]*/.exec(src.slice(i, i + 40));
        toks.push({ ty: 'num', v: parseInt(m[0], 10), isF: false, isL: /[lL]/.test(m[0]), file, line }); i += m[0].length; continue;
      }
      if (c === '"' || c === "'") {
        let j = i + 1, s = '';
        while (j < n && src[j] !== c) {
          if (src[j] === '\n') err('文字列が閉じられていません');
          if (src[j] === '\\' || src[j] === '¥') {
            const e = src[j + 1]; j += 2;
            s += e === 'n' ? '\n' : e === 't' ? '\t' : e === '0' ? '\0' : e === 'r' ? '\r' : e;
          } else { s += src[j++]; }
        }
        if (j >= n) err('文字列/文字定数が閉じられていません');
        if (c === '"') toks.push({ ty: 'str', v: s, file, line });
        else toks.push({ ty: 'num', v: s.charCodeAt(0) || 0, isChar: true, file, line });
        i = j + 1; continue;
      }
      let p = null;
      for (const q of PUNCT) if (src.startsWith(q, i)) { p = q; break; }
      if (!p) err('解釈できない文字「' + c + '」があります');
      toks.push({ ty: 'p', v: p, file, line }); i += p.length;
    }
    return toks;
  }

  /* ---------- 前処理 (#include "..." / #define) ---------- */
  const BUILTIN_DEFINES = {
    EOF: [{ ty: 'p', v: '-' }, { ty: 'num', v: 1 }], NULL: [{ ty: 'num', v: 0 }],
    RAND_MAX: [{ ty: 'num', v: 2147483647 }], DBL_EPSILON: [{ ty: 'num', v: 2.220446049250313e-16, isF: true }],
    M_PI: [{ ty: 'num', v: Math.PI, isF: true }], true: [{ ty: 'num', v: 1 }], false: [{ ty: 'num', v: 0 }],
  };
  function preprocess(mainName, files) {
    const defines = {};
    const out = [];
    const included = new Set();
    function expand(tok, depth) {
      if (tok.ty === 'id' && defines[tok.v] && depth < 20) {
        for (const t of defines[tok.v]) expand({ ...t, file: tok.file, line: tok.line }, depth + 1);
      } else if (tok.ty === 'id' && BUILTIN_DEFINES[tok.v] && !defines[tok.v]) {
        if (tok.v === 'EOF') out.push({ ty: 'p', v: '(', file: tok.file, line: tok.line });
        for (const t of BUILTIN_DEFINES[tok.v]) out.push({ ...t, file: tok.file, line: tok.line });
        if (tok.v === 'EOF') out.push({ ty: 'p', v: ')', file: tok.file, line: tok.line });
      } else out.push(tok);
    }
    function run(name) {
      if (included.has(name)) return;
      included.add(name);
      const src = files[name];
      const toks = tokenize(src, name);
      for (const tk of toks) {
        if (tk.ty === 'dir') {
          let m;
          if ((m = /^include\s*"([^"]+)"/.exec(tk.v))) {
            if (files[m[1]] === undefined) throw new CError('#include "' + m[1] + '" — ファイル ' + m[1] + ' が見つかりません', { file: name, line: tk.line });
            run(m[1]);
          } else if (/^include\s*</.test(tk.v)) { /* 標準ヘッダは組込み */ }
          else if ((m = /^define\s+([A-Za-z_]\w*)\s*(.*)$/.exec(tk.v))) {
            if (/^\(/.test(tk.v.slice(tk.v.indexOf(m[1]) + m[1].length))) throw new CError('関数形式マクロには対応していません', { file: name, line: tk.line });
            const body = tokenize(m[2].replace(/;\s*$/, ''), name).filter((t) => t.ty !== 'dir');
            defines[m[1]] = body;
          } else if (/^(ifndef|ifdef|endif|pragma|undef|if|else)/.test(tk.v)) { /* 無視 */ }
          else throw new CError('未対応のプリプロセッサ指令: #' + tk.v, { file: name, line: tk.line });
        } else expand(tk, 0);
      }
    }
    run(mainName);
    out.push({ ty: 'eof', v: '<EOF>', file: mainName, line: 99999 });
    return out;
  }

  /* ---------- 構文解析 ---------- */
  const BASE_KW = new Set(['int', 'double', 'float', 'char', 'void', 'long', 'short', 'unsigned', 'signed', 'const', 'static', 'struct', 'volatile', 'size_t']);

  function parse(toks) {
    let pos = 0;
    const typedefs = { size_t: T.long, FILE: T.int };
    const structs = {};
    const peek = (o = 0) => toks[pos + o];
    const next = () => toks[pos++];
    const loc = (t) => ({ file: (t || peek()).file, line: (t || peek()).line });
    const err = (m, t) => { throw new CError(m, loc(t)); };
    const isP = (v, o = 0) => peek(o).ty === 'p' && peek(o).v === v;
    const isId = (v, o = 0) => peek(o).ty === 'id' && peek(o).v === v;
    function eat(v) {
      const t = peek();
      if (t.ty === 'p' && t.v === v) return next();
      if (v === ';') err('「;」が足りません (直前の行の末尾を確認してください)', toks[pos - 1] || t);
      err('「' + v + '」が必要な場所に「' + t.v + '」があります', t);
    }
    function ident() { const t = peek(); if (t.ty !== 'id') err('名前 (識別子) が必要です: 「' + t.v + '」', t); return next().v; }
    const isTypeStart = (o = 0) => { const t = peek(o); return t.ty === 'id' && (BASE_KW.has(t.v) || typedefs[t.v] !== undefined); };

    function layoutStruct(name, fields) {
      let off = 0, al = 1;
      const fs = fields.map((f) => {
        const a = alignOf(f.type); al = Math.max(al, a);
        off = Math.ceil(off / a) * a;
        const r = { name: f.name, type: f.type, off }; off += f.type.size; return r;
      });
      return { k: 'struct', name, fields: fs, size: Math.ceil(off / al) * al };
    }
    function alignOf(t) { if (t.k === 'arr') return alignOf(t.of); if (t.k === 'struct') return Math.max(...t.fields.map((f) => alignOf(f.type))); return t.size; }

    function baseType() {
      let isStatic = false, unsigned = false, longs = 0, base = null, seen = false;
      for (;;) {
        const t = peek();
        if (t.ty !== 'id') break;
        if (t.v === 'const' || t.v === 'volatile' || t.v === 'signed') { next(); seen = true; continue; }
        if (t.v === 'static') { next(); isStatic = true; continue; }
        if (t.v === 'unsigned') { next(); unsigned = true; seen = true; continue; }
        if (t.v === 'long') { next(); longs++; seen = true; continue; }
        if (t.v === 'short') { next(); seen = true; base = base || T.int; continue; }
        if (base) break;
        if (t.v === 'int' || t.v === 'char' || t.v === 'double' || t.v === 'float' || t.v === 'void') { next(); base = T[t.v]; seen = true; continue; }
        if (t.v === 'struct') {
          next();
          let sname = null;
          if (peek().ty === 'id') sname = next().v;
          if (isP('{')) {
            next();
            const fields = [];
            while (!isP('}')) {
              const bt = baseType().type;
              do { const d = declarator(bt); fields.push({ name: d.name, type: d.type }); } while (isP(',') && next());
              eat(';');
            }
            next();
            base = layoutStruct(sname ? 'struct ' + sname : '(無名構造体)', fields);
            if (sname) structs[sname] = base;
          } else {
            if (!sname || !structs[sname]) err('構造体 ' + sname + ' は定義されていません');
            base = structs[sname];
          }
          seen = true; continue;
        }
        if (!seen && typedefs[t.v] !== undefined) { next(); base = typedefs[t.v]; seen = true; continue; }
        break;
      }
      if (!seen) err('型名が必要です: 「' + peek().v + '」');
      if (!base || (base === T.int && longs)) base = longs ? T.long : T.int;
      if (base === T.double && longs) base = T.double;
      if (unsigned && isInt(base)) base = { ...base, unsigned: true };
      return { type: base, isStatic };
    }
    function declarator(bt, abstract) {
      let t = bt;
      while (isP('*')) { next(); while (isId('const')) next(); t = ptr(t); }
      let name = null, nameTok = peek();
      if (peek().ty === 'id' && !abstract) name = next().v;
      else if (peek().ty === 'id' && abstract && !isTypeStart()) name = next().v;
      const dims = [];
      while (isP('[')) {
        next();
        if (isP(']')) { dims.push(null); next(); }
        else { dims.push(constExpr(expr())); eat(']'); }
      }
      for (let i = dims.length - 1; i >= 0; i--) t = { ...arr(t, dims[i] || 0), open: dims[i] === null };
      return { name, type: t, tok: nameTok };
    }
    function constExpr(e) {
      if (e.k === 'num') return e.v;
      if (e.k === 'bin') {
        const a = constExpr(e.a), b = constExpr(e.b);
        switch (e.op) { case '+': return a + b; case '-': return a - b; case '*': return a * b; case '/': return Math.trunc(a / b); }
      }
      if (e.k === 'sizeofT') return e.t.size;
      if (e.k === 'un' && e.op === '-') return -constExpr(e.a);
      throw new CError('配列の大きさには定数を指定してください', e.loc);
    }

    /* 式 */
    const ASG = new Set(['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=']);
    const BIN = [['||'], ['&&'], ['|'], ['^'], ['&'], ['==', '!='], ['<', '>', '<=', '>='], ['<<', '>>'], ['+', '-'], ['*', '/', '%']];
    function expr() {
      let e = assign();
      while (isP(',')) { const t = next(); e = { k: 'comma', a: e, b: assign(), loc: loc(t) }; }
      return e;
    }
    function assign() {
      const l = cond();
      if (peek().ty === 'p' && ASG.has(peek().v)) { const t = next(); return { k: 'asg', op: t.v, a: l, b: assign(), loc: loc(t) }; }
      return l;
    }
    function cond() {
      const c = bin(0);
      if (isP('?')) { const t = next(); const a = expr(); eat(':'); const b = cond(); return { k: 'cond', c, a, b, loc: loc(t) }; }
      return c;
    }
    function bin(lv) {
      if (lv >= BIN.length) return unary();
      let a = bin(lv + 1);
      while (peek().ty === 'p' && BIN[lv].includes(peek().v)) { const t = next(); a = { k: 'bin', op: t.v, a, b: bin(lv + 1), loc: loc(t) }; }
      return a;
    }
    function typeName() { const bt = baseType().type; return declarator(bt, true).type; }
    function unary() {
      const t = peek();
      if (t.ty === 'p') {
        if (t.v === '++' || t.v === '--') { next(); return { k: 'pre', op: t.v, a: unary(), loc: loc(t) }; }
        if (['&', '*', '-', '+', '!', '~'].includes(t.v)) { next(); return { k: 'un', op: t.v, a: unary(), loc: loc(t) }; }
        if (t.v === '(' && isTypeStart(1)) { next(); const ty = typeName(); eat(')'); return { k: 'cast', t: ty, a: unary(), loc: loc(t) }; }
      }
      if (t.ty === 'id' && t.v === 'sizeof') {
        next();
        if (isP('(') && isTypeStart(1)) { next(); const ty = typeName(); eat(')'); return { k: 'sizeofT', t: ty, loc: loc(t) }; }
        return { k: 'sizeofE', a: unary(), loc: loc(t) };
      }
      return postfix();
    }
    function postfix() {
      let e = primary();
      for (;;) {
        const t = peek();
        if (t.ty !== 'p') break;
        if (t.v === '[') { next(); const i = expr(); eat(']'); e = { k: 'idx', a: e, i, loc: loc(t) }; }
        else if (t.v === '(') {
          next(); const args = [];
          if (!isP(')')) { do { args.push(assign()); } while (isP(',') && next()); }
          eat(')'); e = { k: 'call', f: e, args, loc: loc(t) };
        } else if (t.v === '.' || t.v === '->') { next(); e = { k: 'mem', a: e, name: ident(), arrow: t.v === '->', loc: loc(t) }; }
        else if (t.v === '++' || t.v === '--') { next(); e = { k: 'post', op: t.v, a: e, loc: loc(t) }; }
        else break;
      }
      return e;
    }
    function primary() {
      const t = next();
      if (t.ty === 'num') return { k: 'num', v: t.v, t: t.isF ? T.double : t.isL ? T.long : t.isChar ? T.int : t.v > 2147483647 ? T.long : T.int, loc: loc(t) };
      if (t.ty === 'str') { let s = t.v; while (peek().ty === 'str') s += next().v; return { k: 'str', s, loc: loc(t) }; }
      if (t.ty === 'id') { if (BASE_KW.has(t.v) && t.v !== 'size_t') err('ここに型名「' + t.v + '」は書けません', t); return { k: 'id', name: t.v, loc: loc(t) }; }
      if (t.ty === 'p' && t.v === '(') { const e = expr(); eat(')'); return e; }
      err(t.ty === 'eof' ? 'プログラムが途中で終わっています (「}」の数を確認してください)' : '式が必要な場所に「' + t.v + '」があります', t);
    }

    /* 文 */
    function declStmt(isGlobal) {
      const t0 = peek();
      const { type: bt, isStatic } = baseType();
      const decls = [];
      if (isP(';')) { next(); return { k: 'decl', decls, loc: loc(t0) }; }
      do {
        const d = declarator(bt);
        if (!d.name) err('変数名が必要です');
        let init = null;
        if (isP('=')) { next(); init = isP('{') ? initList() : assign(); }
        decls.push({ name: d.name, type: d.type, init, isStatic, loc: loc(d.tok) });
      } while (isP(',') && next());
      eat(';');
      return { k: 'decl', decls, loc: loc(t0), isGlobal };
    }
    function initList() {
      const t = eat('{'); const items = [];
      while (!isP('}')) { items.push(isP('{') ? initList() : assign()); if (!isP('}')) eat(','); }
      next(); return { k: 'list', items, loc: loc(t) };
    }
    function block() {
      const t = eat('{'); const body = [];
      while (!isP('}')) { if (peek().ty === 'eof') err('「}」が足りません', t); body.push(stmt()); }
      next(); return { k: 'block', body, loc: loc(t) };
    }
    function stmt() {
      const t = peek();
      if (t.ty === 'p' && t.v === '{') return block();
      if (t.ty === 'p' && t.v === ';') { next(); return { k: 'empty', loc: loc(t) }; }
      if (t.ty === 'id') {
        switch (t.v) {
          case 'if': { next(); eat('('); const c = expr(); eat(')'); const a = stmt(); let b = null; if (isId('else')) { next(); b = stmt(); } return { k: 'if', c, a, b, loc: loc(t) }; }
          case 'while': { next(); eat('('); const c = expr(); eat(')'); return { k: 'while', c, body: stmt(), loc: loc(t) }; }
          case 'do': { next(); const body = stmt(); if (!isId('while')) err('do に対応する while がありません'); next(); eat('('); const c = expr(); eat(')'); eat(';'); return { k: 'do', c, body, loc: loc(t) }; }
          case 'for': {
            next(); eat('(');
            let init = null;
            if (isTypeStart()) init = declStmt(false);
            else { if (!isP(';')) init = { k: 'expr', e: expr(), loc: loc(t) }; eat(';'); }
            const c = isP(';') ? null : expr(); eat(';');
            const step = isP(')') ? null : expr(); eat(')');
            return { k: 'for', init, c, step, body: stmt(), loc: loc(t) };
          }
          case 'return': { next(); const e = isP(';') ? null : expr(); eat(';'); return { k: 'return', e, loc: loc(t) }; }
          case 'break': next(); eat(';'); return { k: 'break', loc: loc(t) };
          case 'continue': next(); eat(';'); return { k: 'continue', loc: loc(t) };
          case 'else': err('対応する if がない else です', t);
        }
        if (isTypeStart() && !(peek(1).ty === 'p' && ['=', '(', '[', '.', '->', '++', '--'].includes(peek(1).v) && typedefs[t.v] === undefined && !BASE_KW.has(t.v))) return declStmt(false);
      }
      const e = expr(); eat(';');
      return { k: 'expr', e, loc: loc(t) };
    }

    /* 外部宣言 */
    const funcs = {}, globals = [];
    while (peek().ty !== 'eof') {
      if (isId('typedef')) {
        next();
        const bt = baseType().type;
        const d = declarator(bt);
        typedefs[d.name] = d.type.k === 'struct' ? { ...d.type, name: d.name } : d.type;
        if (d.type.k === 'struct') { const nt = typedefs[d.name]; for (const k in structs) if (structs[k] === d.type) structs[k] = nt; }
        eat(';'); continue;
      }
      if (isP(';')) { next(); continue; }
      const save = pos;
      const t0 = peek();
      const { type: bt, isStatic } = baseType();
      if (isP(';')) { next(); continue; }
      const d = declarator(bt);
      if (isP('(')) {
        next();
        const params = [];
        if (isId('void') && peek(1).ty === 'p' && peek(1).v === ')') next();
        else if (!isP(')')) {
          do {
            const pbt = baseType().type;
            const pd = declarator(pbt, true);
            let pt = pd.type; if (pt.k === 'arr') pt = ptr(pt.of);
            params.push({ name: pd.name, type: pt });
          } while (isP(',') && next());
        }
        eat(')');
        if (isP(';')) { next(); if (!funcs[d.name]) funcs[d.name] = { name: d.name, ret: d.type, params, body: null, loc: loc(t0) }; continue; }
        if (!isP('{')) err('関数本体の「{」が必要です');
        const body = block();
        if (funcs[d.name] && funcs[d.name].body) err('関数 ' + d.name + ' が二重に定義されています', t0);
        funcs[d.name] = { name: d.name, ret: d.type, params, body, loc: loc(t0) };
        continue;
      }
      pos = save;
      globals.push(declStmt(true));
      void isStatic;
    }
    return { funcs, globals };
  }

  const utf8 = (s) => Array.from(new TextEncoder().encode(s));
  const strBytes = (s) => utf8(s).length;

  /* ---------- glibc 互換 rand() ---------- */
  function GlibcRand() {
    let r = [], k = 0;
    this.seed = function (s) {
      s = s >>> 0; if (s === 0) s = 1;
      r = new Array(344);
      r[0] = s | 0;
      for (let i = 1; i < 31; i++) {
        let v = (16807 * r[i - 1]) % 2147483647; if (v < 0) v += 2147483647; r[i] = v;
      }
      for (let i = 31; i < 34; i++) r[i] = r[i - 31];
      for (let i = 34; i < 344; i++) r[i] = (r[i - 31] + r[i - 3]) >>> 0;
      k = 344;
    };
    this.next = function () {
      const v = (r[k - 31] + r[k - 3]) >>> 0; r[k] = v; k++;
      if (r.length > 4096) { r = r.slice(k - 34); k = 34; }
      return v >>> 1;
    };
    this.seed(1);
  }

  /* ---------- 実行 ---------- */
  const STACK_BASE = 100, GLOBAL_BASE = 50000, STR_BASE = 60000;

  function run(files, mainName, opt) {
    opt = opt || {};
    const maxSnaps = opt.maxSnaps || 2500;
    const maxOps = opt.maxOps || 4000000;
    const stdin = opt.stdin || '';
    const res = { steps: [], out: '', err: '', error: null, exit: 0, truncated: false };
    let prog;
    const units = Array.isArray(mainName) ? mainName : [mainName];
    mainName = units[0];
    try {
      prog = { funcs: {}, globals: [] };
      for (const u of units) {
        const p = parse(preprocess(u, files));
        for (const k in p.funcs) {
          const f = p.funcs[k];
          if (f.body && prog.funcs[k] && prog.funcs[k].body) throw new CError('関数 ' + k + ' が複数のファイルで定義されています (リンクエラー)', f.loc);
          if (f.body || !prog.funcs[k]) prog.funcs[k] = f;
        }
        prog.globals.push(...p.globals);
      }
    }
    catch (e) { if (!e.isC) { e = new CError('構文の解析に失敗しました: ' + e.message, null); } res.error = { msg: e.message, loc: e.loc, phase: 'compile' }; return res; }

    const mem = new Map();
    let log = [];
    const setCell = (a, c) => { log.push({ a, o: mem.has(a) ? mem.get(a) : null, n: c }); if (c) mem.set(a, c); else mem.delete(a); };
    const frames = [];
    const gscope = new Map();
    const gvars = [];
    let gtop = GLOBAL_BASE, stop = STR_BASE;
    const strLits = new Map();
    let inPos = 0, ops = 0, out = '', errOut = '';
    const rng = new GlibcRand();
    let curLoc = null;
    const staticStore = new Map();

    const fail = (m, l) => { throw new CError(m, l || curLoc); };
    const fmtA = (a) => String(a) + ' (0x' + a.toString(16) + ')';

    function nameAt(a) {
      const all = [];
      for (const f of frames) for (const v of f.vars) all.push(v);
      for (const v of gvars) all.push(v);
      for (const v of all) { const r = sub(v.name, v.addr, v.t, a); if (r) return r; }
      return null;
      function sub(nm, base, t, x) {
        if (x < base || x >= base + t.size) return null;
        if (t.k === 'arr') { const i = Math.floor((x - base) / t.of.size); return sub(nm + '[' + i + ']', base + i * t.of.size, t.of, x); }
        if (t.k === 'struct') { for (const f of t.fields) { const r = sub(nm + '.' + f.name, base + f.off, f.type, x); if (r) return r; } return null; }
        return x === base ? nm : null;
      }
    }

    function alignOfT(t) { if (t.k === 'arr') return alignOfT(t.of); if (t.k === 'struct') return Math.max(1, ...t.fields.map((f) => alignOfT(f.type))); return Math.min(4, t.size); }
    function alloc(addr, t, zero) {
      if (t.k === 'arr') { for (let i = 0; i < t.n; i++) alloc(addr + i * t.of.size, t.of, zero); return; }
      if (t.k === 'struct') { for (const f of t.fields) alloc(addr + f.off, f.type, zero); return; }
      setCell(addr, { t: cellKind(t), v: zero ? 0 : undefined });
    }
    function freeRange(addr, t) {
      if (t.k === 'arr') { for (let i = 0; i < t.n; i++) freeRange(addr + i * t.of.size, t.of); return; }
      if (t.k === 'struct') { for (const f of t.fields) freeRange(addr + f.off, f.type); return; }
      if (mem.has(addr)) setCell(addr, null);
    }
    function load(a, t) {
      if (t.k === 'arr' || t.k === 'struct') return a;
      const c = mem.get(a);
      if (a === 0) fail('NULL ポインタ (0 番地) の中身を読もうとしました');
      if (!c) fail(fmtA(a) + ' 番地は確保されていない領域です。存在しない変数の番地を読もうとしています (不正なメモリアクセス)');
      const want = cellKind(t);
      if (c.t !== want && !(isIntK(c.t) && isIntK(want) && c.t !== 'char' && want !== 'char')) {
        fail('型の不一致: ' + fmtA(a) + ' 番地' + (nameAt(a) ? ' (' + nameAt(a) + ')' : '') + ' には ' + kindLabel[c.t] + ' 型の値がありますが, ' + typeStr(t) + ' として読もうとしました。ポインタの型と変数の型を合わせてください');
      }
      if (c.v === undefined) fail('未初期化の値を読みました: ' + (nameAt(a) || fmtA(a) + ' 番地') + ' にはまだ値が代入されていません');
      return c.v;
    }
    const isIntK = (k) => k === 'int' || k === 'long' || k === 'char';
    function store(a, t, v) {
      if (a === 0) fail('NULL ポインタ (0 番地) に書き込もうとしました');
      if (t.k === 'struct') { memcpy(a, v, t); return; }
      const c = mem.get(a);
      if (!c) fail(fmtA(a) + ' 番地は確保されていない領域です。存在しない場所に書き込もうとしています (不正なメモリアクセス)');
      if (c.ro) fail('文字列定数は書き換えられません');
      const want = cellKind(t);
      if (c.t !== want && !(isIntK(c.t) && isIntK(want) && c.t !== 'char' && want !== 'char')) {
        fail('型の不一致: ' + fmtA(a) + ' 番地' + (nameAt(a) ? ' (' + nameAt(a) + ')' : '') + ' は ' + kindLabel[c.t] + ' 型の領域ですが, ' + typeStr(t) + ' として書き込もうとしました');
      }
      const nc = { t: c.t, v: conv(v, t) };
      if (t.k === 'ptr') nc.to = t.to.k;
      setCell(a, nc);
    }
    function memcpy(dst, src, t) {
      if (t.k === 'arr') { for (let i = 0; i < t.n; i++) memcpy(dst + i * t.of.size, src + i * t.of.size, t.of); return; }
      if (t.k === 'struct') { for (const f of t.fields) memcpy(dst + f.off, src + f.off, f.type); return; }
      const c = mem.get(src);
      if (!c) fail('コピー元の領域が存在しません');
      const d = mem.get(dst);
      if (!d) fail('コピー先の領域が存在しません');
      setCell(dst, { t: d.t, v: c.v });
    }
    function conv(v, t) {
      if (v === undefined) return v;
      switch (t.k) {
        case 'int': return t.unsigned ? Math.trunc(v) >>> 0 : Math.trunc(v) | 0;
        case 'char': return (Math.trunc(v) << 24) >> 24;
        case 'long': return Math.trunc(v);
        case 'double': return t.name === 'float' ? Math.fround(v) : +v;
        case 'ptr': return Math.trunc(v);
      }
      return v;
    }

    function strAddr(s) {
      if (strLits.has(s)) return strLits.get(s);
      const a = stop;
      const b = utf8(s);
      for (let i = 0; i <= b.length; i++) setCell(a + i, { t: 'char', v: i < b.length ? b[i] : 0, ro: true });
      stop += b.length + 1; stop = Math.ceil(stop / 4) * 4;
      strLits.set(s, a);
      return a;
    }
    function readStr(a) {
      const bytes = [];
      for (let i = 0; i < 100000; i++) {
        const c = mem.get(a + i);
        if (!c) fail('文字列の終わり (\\0) が見つからないまま確保領域の外に出ました');
        if (c.v === undefined) fail('未初期化の文字を読みました (文字列が \\0 で終わっていない可能性)');
        if (c.v === 0) break;
        bytes.push(c.v & 255);
      }
      return new TextDecoder().decode(new Uint8Array(bytes));
    }
    function writeStr(a, s, max) {
      const b = utf8(s);
      const n = max === undefined ? b.length : Math.min(b.length, max);
      for (let i = 0; i < n; i++) store(a + i, T.char, b[i]);
      if (max === undefined || n < max) store(a + n, T.char, 0);
    }

    /* スコープ */
    function lookup(name) {
      const f = frames[frames.length - 1];
      if (f) for (let i = f.scopes.length - 1; i >= 0; i--) if (f.scopes[i].has(name)) return f.scopes[i].get(name);
      return gscope.get(name);
    }
    function declare(d, isGlobal) {
      const f = frames[frames.length - 1];
      let t = d.type;
      if (t.k === 'arr' && t.open) {
        if (!d.init) fail('配列 ' + d.name + ' の要素数がありません', d.loc);
        const n = d.init.k === 'list' ? d.init.items.length : d.init.k === 'str' ? strBytes(d.init.s) + 1 : 0;
        t = arr(t.of, n);
      }
      if (t.k === 'void') fail('void 型の変数は宣言できません', d.loc);
      if (isGlobal || d.isStatic) {
        const key = (d.isStatic && f ? f.fn + '::' : '') + d.name;
        let v = staticStore.get(key);
        if (!v) {
          const al = alignOfT(t); const addr = Math.ceil(gtop / al) * al; gtop = addr + t.size;
          v = { name: d.isStatic && f ? d.name + ' (static)' : d.name, addr, t };
          alloc(addr, t, true);
          staticStore.set(key, v); gvars.push(v);
          if (d.init) initVar(addr, t, d.init);
        }
        const sym = { addr: v.addr, t };
        if (isGlobal) gscope.set(d.name, sym); else f.scopes[f.scopes.length - 1].set(d.name, sym);
        return;
      }
      const scope = f.scopes[f.scopes.length - 1];
      if (scope.has(d.name)) fail('変数 ' + d.name + ' が二重に宣言されています', d.loc);
      const al = alignOfT(t); const addr = Math.ceil(f.top / al) * al; f.top = addr + t.size;
      const sym = { addr, t };
      scope.set(d.name, sym);
      f.vars.push({ name: d.name, addr, t, scopeDepth: f.scopes.length });
      alloc(addr, t, false);
      if (d.init) initVar(addr, t, d.init);
    }
    function initVar(addr, t, init) {
      if (t.k === 'arr') {
        if (init.k === 'str' && t.of.k === 'char') { const b = utf8(init.s); if (b.length >= t.n + 1) fail('文字列が配列に入りきりません'); for (let i = 0; i < t.n; i++) store(addr + i, T.char, i < b.length ? b[i] : 0); return; }
        if (init.k !== 'list') fail('配列の初期化には { } を使います');
        if (init.items.length > t.n) fail('初期化子の数が配列の要素数を超えています');
        for (let i = 0; i < t.n; i++) {
          if (i < init.items.length) initVar(addr + i * t.of.size, t.of, init.items[i]);
          else zeroFill(addr + i * t.of.size, t.of);
        }
        return;
      }
      if (t.k === 'struct') {
        if (init.k === 'list') {
          t.fields.forEach((f, i) => { if (i < init.items.length) initVar(addr + f.off, f.type, init.items[i]); else zeroFill(addr + f.off, f.type); });
          return;
        }
        const v = rv(init); if (v.t.k !== 'struct') fail('構造体に構造体以外を代入できません'); memcpy(addr, v.v, t); return;
      }
      const v = rv(init.k === 'list' ? init.items[0] : init);
      checkAssign(t, v);
      store(addr, t, v.v);
    }
    function zeroFill(a, t) {
      if (t.k === 'arr') { for (let i = 0; i < t.n; i++) zeroFill(a + i * t.of.size, t.of); return; }
      if (t.k === 'struct') { for (const f of t.fields) zeroFill(a + f.off, f.type); return; }
      store(a, t, 0);
    }
    function checkAssign(t, v) {
      if (t.k === 'ptr' && isArith(v.t) && v.v !== 0 && !v.isConst0) {
        if (!(v.t.k === 'long' || v.t.k === 'int')) fail('ポインタに ' + typeStr(v.t) + ' の値は代入できません');
        if (!opt.lax) fail('ポインタ ' + typeStr(t) + ' に整数 ' + v.v + ' を代入しています。番地を代入するなら & を付けるか (' + typeStr(t) + ') でキャストしてください');
      }
      if (isArith(t) && v.t.k === 'ptr') fail(typeStr(t) + ' 型の変数にポインタ (番地) を代入しようとしています。値が欲しいなら * を付けて中身を取り出してください');
      if (t.k === 'ptr' && v.t.k === 'ptr' && t.to.k !== 'void' && v.t.to.k !== 'void' && typeStr(t) !== typeStr(v.t)) {
        fail('型の不一致: ' + typeStr(t) + ' に ' + typeStr(v.t) + ' を代入しようとしています (指す先の型が違います)');
      }
      if (t.k === 'struct' && v.t.k !== 'struct') fail('構造体に構造体以外を代入できません');
    }

    /* 式の評価 */
    function tick() { if (++ops > maxOps) fail('実行ステップが多すぎます。無限ループになっていないか確認してください'); }
    function decay(r) {
      if (r.t.k === 'arr') return { v: r.addr, t: ptr(r.t.of) };
      return r;
    }
    function lv(e) {
      tick();
      switch (e.k) {
        case 'id': {
          const s = lookup(e.name);
          if (!s) {
            if (funcs[e.name] || BUILTINS[e.name]) fail(e.name + ' は関数です', e.loc);
            fail('変数 ' + e.name + ' は宣言されていません', e.loc);
          }
          return { addr: s.addr, t: s.t };
        }
        case 'un':
          if (e.op === '*') {
            const p = decay(rv(e.a));
            if (p.t.k !== 'ptr') fail('「*」はポインタ (番地) にしか付けられません。' + typeStr(p.t) + ' 型の値に付けています', e.loc);
            if (p.t.to.k === 'void') fail('void * のままでは中身を読めません。(int *) などにキャストしてください', e.loc);
            if (p.v === 0) fail('NULL ポインタ (0 番地) の中身を参照しようとしました', e.loc);
            return { addr: p.v, t: p.t.to };
          }
          break;
        case 'idx': {
          let a = decay(rv(e.a)), i = decay(rv(e.i));
          if (a.t.k !== 'ptr' && i.t.k === 'ptr') { const x = a; a = i; i = x; }
          if (a.t.k !== 'ptr') fail('[ ] は配列かポインタにしか付けられません', e.loc);
          if (!isInt(i.t)) fail('添字は整数でなければなりません', e.loc);
          const addr = a.v + i.v * a.t.to.size;
          if (!mem.has(addr) && a.t.to.k !== 'struct' && a.t.to.k !== 'arr') fail('添字 ' + i.v + ' は範囲外です (' + fmtA(addr) + ' 番地は確保されていません)', e.loc);
          return { addr, t: a.t.to };
        }
        case 'mem': {
          let base, st;
          if (e.arrow) {
            const p = decay(rv(e.a));
            if (p.t.k !== 'ptr' || p.t.to.k !== 'struct') fail('「->」は構造体へのポインタに使います' + (p.t.k === 'struct' ? '。構造体変数そのものには「.」を使ってください' : ''), e.loc);
            if (p.v === 0) fail('NULL ポインタに -> を使いました', e.loc);
            base = p.v; st = p.t.to;
          } else {
            const s = lv(e.a);
            if (s.t.k !== 'struct') fail('「.」は構造体変数に使います' + (s.t.k === 'ptr' ? '。ポインタには「->」を使ってください' : ''), e.loc);
            base = s.addr; st = s.t;
          }
          const f = st.fields.find((x) => x.name === e.name);
          if (!f) fail(typeStr(st) + ' にメンバー ' + e.name + ' はありません', e.loc);
          return { addr: base + f.off, t: f.type };
        }
      }
      fail('この式には代入できません (左辺値ではありません)', e.loc);
    }
    function rv(e) {
      tick();
      switch (e.k) {
        case 'num': return { v: e.v, t: e.t, isConst0: e.v === 0 };
        case 'str': return { v: strAddr(e.s), t: ptr(T.char) };
        case 'id': {
          const s = lookup(e.name);
          if (!s) {
            if (e.name === 'stdout') return { v: -1, t: ptr(T.int), stream: 1 };
            if (e.name === 'stderr') return { v: -2, t: ptr(T.int), stream: 2 };
            if (e.name === 'stdin') return { v: -3, t: ptr(T.int), stream: 0 };
          }
          const l = lv(e);
          if (l.t.k === 'arr') return { v: l.addr, t: l.t, addr: l.addr };
          if (l.t.k === 'struct') return { v: l.addr, t: l.t, addr: l.addr };
          return { v: load(l.addr, l.t), t: l.t, addr: l.addr };
        }
        case 'idx': case 'mem': {
          const l = lv(e);
          if (l.t.k === 'arr' || l.t.k === 'struct') return { v: l.addr, t: l.t, addr: l.addr };
          return { v: load(l.addr, l.t), t: l.t, addr: l.addr };
        }
        case 'comma': rv(e.a); return rv(e.b);
        case 'cond': return truthy(rv(e.c)) ? decay(rv(e.a)) : decay(rv(e.b));
        case 'cast': {
          const v = decay(rv(e.a));
          if (e.t.k === 'void') return { v: 0, t: T.void };
          if (e.t.k === 'ptr' && v.t.k === 'double') fail('実数をポインタにはキャストできません', e.loc);
          return { v: conv(v.v, e.t), t: e.t };
        }
        case 'sizeofT': return { v: e.t.size, t: T.long };
        case 'sizeofE': { const t = typeOf(e.a); return { v: t.size, t: T.long }; }
        case 'un': {
          if (e.op === '&') {
            if (e.a.k === 'un' && e.a.op === '*') { const p = decay(rv(e.a.a)); return { v: p.v, t: p.t }; }
            const l = lv(e.a);
            return { v: l.addr, t: ptr(l.t) };
          }
          if (e.op === '*') {
            const l = lv(e);
            if (l.t.k === 'arr' || l.t.k === 'struct') return { v: l.addr, t: l.t, addr: l.addr };
            return { v: load(l.addr, l.t), t: l.t, addr: l.addr };
          }
          const a = decay(rv(e.a));
          if (e.op === '!') return { v: truthy(a) ? 0 : 1, t: T.int };
          if (a.t.k === 'ptr') fail('ポインタに単項「' + e.op + '」は使えません', e.loc);
          if (e.op === '-') return { v: conv(-a.v, promote(a.t)), t: promote(a.t) };
          if (e.op === '+') return { v: a.v, t: promote(a.t) };
          if (e.op === '~') return { v: ~a.v, t: promote(a.t) };
          break;
        }
        case 'pre': case 'post': {
          const l = lv(e.a);
          const old = load(l.addr, l.t);
          const d = e.op === '++' ? 1 : -1;
          const nv = l.t.k === 'ptr' ? old + d * l.t.to.size : old + d;
          store(l.addr, l.t, nv);
          return { v: e.k === 'pre' ? conv(nv, l.t) : old, t: l.t };
        }
        case 'asg': {
          const l = lv(e.a);
          if (l.t.k === 'arr') fail('配列には = でまとめて代入できません', e.loc);
          let v;
          if (e.op === '=') {
            v = decay(rv(e.b));
            if (l.t.k === 'struct') { if (v.t.k !== 'struct') fail('構造体に構造体以外を代入できません', e.loc); memcpy(l.addr, v.v, l.t); return { v: l.addr, t: l.t }; }
            checkAssign(l.t, v);
          } else {
            const cur = { v: load(l.addr, l.t), t: l.t };
            v = binop(e.op.slice(0, -1), cur, decay(rv(e.b)), e.loc);
          }
          store(l.addr, l.t, v.v);
          return { v: conv(v.v, l.t), t: l.t };
        }
        case 'bin': {
          if (e.op === '&&') { if (!truthy(decay(rv(e.a)))) return { v: 0, t: T.int }; return { v: truthy(decay(rv(e.b))) ? 1 : 0, t: T.int }; }
          if (e.op === '||') { if (truthy(decay(rv(e.a)))) return { v: 1, t: T.int }; return { v: truthy(decay(rv(e.b))) ? 1 : 0, t: T.int }; }
          return binop(e.op, decay(rv(e.a)), decay(rv(e.b)), e.loc);
        }
        case 'call': return call(e);
        case 'list': fail('{ } は初期化にしか使えません', e.loc);
      }
      fail('評価できない式です', e.loc);
    }
    function typeOf(e) {
      // sizeof 用 (副作用なしで型を求める)
      switch (e.k) {
        case 'id': { const s = lookup(e.name); if (!s) fail('変数 ' + e.name + ' は宣言されていません', e.loc); return s.t; }
        case 'idx': { const a = typeOf(e.a); return a.k === 'arr' ? a.of : a.k === 'ptr' ? a.to : fail('[ ] の型が不正です'); }
        case 'un': if (e.op === '*') { const a = typeOf(e.a); return a.k === 'arr' ? a.of : a.to; } if (e.op === '&') return ptr(typeOf(e.a)); return promote(typeOf(e.a));
        case 'mem': { let st = typeOf(e.a); if (e.arrow) st = st.to; const f = st.fields.find((x) => x.name === e.name); return f.type; }
        case 'num': return e.t;
        case 'str': return arr(T.char, strBytes(e.s) + 1);
        case 'cast': return e.t;
        default: { const saveLog = log.length; const v = rv(e); if (log.length !== saveLog) fail('sizeof の中で副作用のある式は使えません'); return v.t; }
      }
    }
    const promote = (t) => (t.k === 'char' ? T.int : t);
    function truthy(v) { return v.v !== 0; }
    function arithT(a, b) {
      if (a.k === 'double' || b.k === 'double') return T.double;
      if (a.k === 'long' || b.k === 'long') return a.unsigned || b.unsigned ? { ...T.long, unsigned: true } : T.long;
      return a.unsigned || b.unsigned ? { ...T.int, unsigned: true } : T.int;
    }
    function binop(op, a, b, l) {
      if (a.t.k === 'ptr' || b.t.k === 'ptr') {
        if (op === '+' || op === '-') {
          if (a.t.k === 'ptr' && b.t.k === 'ptr' && op === '-') return { v: (a.v - b.v) / a.t.to.size, t: T.long };
          if (a.t.k === 'ptr' && isInt(b.t)) return { v: a.v + (op === '+' ? 1 : -1) * b.v * a.t.to.size, t: a.t };
          if (op === '+' && b.t.k === 'ptr' && isInt(a.t)) return { v: b.v + a.v * b.t.to.size, t: b.t };
          fail('ポインタ同士の足し算や, ポインタと実数の計算はできません', l);
        }
        if (['==', '!=', '<', '>', '<=', '>='].includes(op)) return { v: cmp(op, a.v, b.v), t: T.int };
        fail('ポインタに演算子「' + op + '」は使えません', l);
      }
      if (a.t.k === 'struct' || b.t.k === 'struct') fail('構造体どうしを演算することはできません', l);
      if (a.t.k === 'void' || b.t.k === 'void') fail('void の値は使えません', l);
      const t = arithT(a.t, b.t);
      const x = a.v, y = b.v;
      switch (op) {
        case '+': return { v: conv(x + y, t), t };
        case '-': return { v: conv(x - y, t), t };
        case '*': return { v: conv(t.k === 'int' && !t.unsigned ? Math.imul(x, y) : x * y, t), t };
        case '/':
          if (t.k !== 'double' && y === 0) fail('0 で割り算をしました', l);
          return { v: t.k === 'double' ? x / y : conv(Math.trunc(x / y), t), t };
        case '%':
          if (t.k === 'double') fail('% は整数にしか使えません (実数には fmod を使います)', l);
          if (y === 0) fail('0 で剰余を求めました', l);
          return { v: conv(x % y, t), t };
        case '==': case '!=': case '<': case '>': case '<=': case '>=': return { v: cmp(op, x, y), t: T.int };
        case '&': case '|': case '^': case '<<': case '>>': {
          if (t.k === 'double') fail('ビット演算は整数にしか使えません', l);
          const X = BigInt(Math.trunc(x)), Y = BigInt(Math.trunc(y));
          let r = op === '&' ? X & Y : op === '|' ? X | Y : op === '^' ? X ^ Y : op === '<<' ? X << Y : X >> Y;
          if (t.k === 'long' && t.unsigned) r = BigInt.asUintN(64, r);
          return { v: conv(Number(r), t), t };
        }
      }
      fail('未対応の演算子 ' + op, l);
    }
    function cmp(op, x, y) {
      switch (op) { case '==': return x === y ? 1 : 0; case '!=': return x !== y ? 1 : 0; case '<': return x < y ? 1 : 0; case '>': return x > y ? 1 : 0; case '<=': return x <= y ? 1 : 0; default: return x >= y ? 1 : 0; }
    }

    /* 書式 */
    function fmtNum(spec, v) {
      const m = /^%([-+0 #]*)(\d+|\*)?(?:\.(\d+))?(hh|h|ll|l|z)?([diufeEgGxXcsp])$/.exec(spec);
      if (!m) return spec;
      const [, flags, width, precS, , conv2] = m;
      const prec = precS !== undefined ? +precS : null;
      let s;
      switch (conv2) {
        case 'd': case 'i': s = String(Math.trunc(v)); break;
        case 'u': s = String(Math.trunc(v) >>> 0); break;
        case 'f': s = (+v).toFixed(prec === null ? 6 : prec); if (s === '-0' || /^-0\.0*$/.test(s)) s = s.slice(1); break;
        case 'e': case 'E': { s = (+v).toExponential(prec === null ? 6 : prec).replace(/e([+-])(\d)$/, 'e$10$2'); if (conv2 === 'E') s = s.toUpperCase(); break; }
        case 'g': case 'G': s = String(+(+v).toPrecision(prec === null ? 6 : prec || 1)); break;
        case 'x': s = (Math.trunc(v) >>> 0).toString(16); break;
        case 'X': s = (Math.trunc(v) >>> 0).toString(16).toUpperCase(); break;
        case 'c': s = String.fromCharCode(v); break;
        case 'p': s = v === 0 ? '(nil)' : '0x' + Math.trunc(v).toString(16); break;
        default: s = String(v);
      }
      if (flags.includes('+') && /[dif]/.test(conv2) && v >= 0) s = '+' + s;
      const w = width ? +width : 0;
      if (s.length < w) {
        if (flags.includes('-')) s = s.padEnd(w);
        else if (flags.includes('0') && /[diufeEgGxX]/.test(conv2)) { const neg = s[0] === '-' || s[0] === '+'; s = neg ? s[0] + s.slice(1).padStart(w - 1, '0') : s.padStart(w, '0'); }
        else s = s.padStart(w);
      }
      return s;
    }
    function doPrintf(fmtV, args, l) {
      const fmt = readStr(fmtV.v);
      let r = '', ai = 0;
      const re = /%%|%[-+0 #]*(\d+|\*)?(?:\.\d+)?(hh|h|ll|l|z|L)?[diufeEgGxXcsp]|%/g;
      let last = 0, m;
      while ((m = re.exec(fmt))) {
        r += fmt.slice(last, m.index); last = re.lastIndex;
        const sp = m[0];
        if (sp === '%%') { r += '%'; continue; }
        if (sp === '%') { r += '%'; continue; }
        if (ai >= args.length) fail('printf の書式 ' + sp + ' に対応する引数が足りません', l);
        const a = args[ai++];
        const c = sp[sp.length - 1];
        if (c === 's') {
          if (a.t.k !== 'ptr') fail('%s には文字列 (char の配列/ポインタ) を渡してください', l);
          let s = readStr(a.v);
          const pm = /\.(\d+)/.exec(sp); if (pm) s = s.slice(0, +pm[1]);
          const wm = /^%(-?)(\d+)/.exec(sp); if (wm && s.length < +wm[2]) s = wm[1] ? s.padEnd(+wm[2]) : s.padStart(+wm[2]);
          r += s; continue;
        }
        if ('fFeEgG'.includes(c)) {
          if (a.t.k !== 'double') fail('printf の ' + sp + ' に ' + typeStr(a.t) + ' 型の値を渡しています。%f には double を渡してください (整数なら %d)', l);
        } else if ('dixXuc'.includes(c)) {
          if (a.t.k === 'double') fail('printf の ' + sp + ' に double 型の値を渡しています。実数には %f を使ってください', l);
          if (a.t.k === 'ptr') fail('printf の ' + sp + ' にポインタ (番地) を渡しています。番地を表示するなら %p, 中身なら * を付けてください', l);
        } else if (c === 'p') {
          if (a.t.k !== 'ptr') fail('%p にはポインタ (番地) を渡してください。変数の番地なら & を付けます', l);
        }
        r += fmtNum(sp.replace(/(hh|h|ll|l|z|L)(?=[a-zA-Z]$)/, ''), a.v);
      }
      r += fmt.slice(last);
      return r;
    }
    function doScanf(fmtV, args, l) {
      const fmt = readStr(fmtV.v);
      let count = 0, ai = 0;
      const skipWs = () => { while (inPos < stdin.length && /\s/.test(stdin[inPos])) inPos++; };
      const re = /%(\d+)?(hh|h|ll|l|L)?([dfeEgsciup])|(\s+)|([^%\s]+)/g;
      let m;
      while ((m = re.exec(fmt))) {
        if (m[4]) { skipWs(); continue; }
        if (m[5]) { skipWs(); if (stdin.startsWith(m[5], inPos)) { inPos += m[5].length; continue; } return count; }
        const w = m[1] ? +m[1] : Infinity, c = m[3], L = m[2];
        if (c !== 'c') skipWs();
        if (inPos >= stdin.length) return count === 0 ? -1 : count;
        if (ai >= args.length) fail('scanf の書式に対応する引数が足りません', l);
        const p = args[ai++];
        if (p.t.k !== 'ptr') fail('scanf には変数の番地を渡す必要があります。変数名の前に & を付けてください (配列名・文字列は & 不要)', l);
        const rest = stdin.slice(inPos);
        let mm;
        if (c === 'd' || c === 'i' || c === 'u') {
          mm = /^[+-]?\d+/.exec(rest); if (!mm) return count;
          if (!isInt(p.t.to)) fail('scanf の %d には int 型変数の番地を渡してください (double なら %lf)', l);
          store(p.v, p.t.to, parseInt(mm[0], 10));
        } else if ('feEg'.includes(c)) {
          mm = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(rest); if (!mm) return count;
          if (p.t.to.k !== 'double') fail('scanf の %' + (L || '') + c + ' には double 型変数の番地を渡してください', l);
          if (p.t.to.name === 'double' && L !== 'l' && L !== 'L') fail('double 型を scanf で読むときは %f ではなく %lf を使います', l);
          store(p.v, p.t.to, parseFloat(mm[0]));
        } else if (c === 's') {
          mm = /^\S+/.exec(rest); let s = mm[0]; if (s.length > w) s = s.slice(0, w);
          if (p.t.to.k !== 'char') fail('%s には char 配列を渡してください (& は不要です)', l);
          writeStr(p.v, s); inPos += s.length; count++; continue;
        } else if (c === 'c') {
          store(p.v, p.t.to, stdin.charCodeAt(inPos)); inPos++; count++; continue;
        } else if (c === 'p') {
          mm = /^(0[xX][0-9a-fA-F]+|\d+)/.exec(rest); if (!mm) return count;
          if (p.t.to.k !== 'ptr') fail('scanf の %p にはポインタ変数の番地を渡してください', l);
          setCell(p.v, { t: 'ptr', v: parseInt(mm[0]) });
        }
        inPos += mm[0].length; count++;
      }
      return count;
    }

    const num = (v) => ({ v, t: T.double });
    const BUILTINS = {
      printf: (a, l) => { if (!a.length) fail('printf に引数がありません', l); const s = doPrintf(a[0], a.slice(1), l); out += s; return { v: s.length, t: T.int }; },
      fprintf: (a, l) => { const st = a[0]; if (!st || !st.stream) fail('fprintf の第1引数には stdout か stderr を指定します', l); const s = doPrintf(a[1], a.slice(2), l); if (st.stream === 2) errOut += s; else out += s; return { v: s.length, t: T.int }; },
      scanf: (a, l) => ({ v: doScanf(a[0], a.slice(1), l), t: T.int }),
      puts: (a) => { out += readStr(a[0].v) + '\n'; return { v: 1, t: T.int }; },
      putchar: (a) => { out += String.fromCharCode(a[0].v); return { v: a[0].v, t: T.int }; },
      getchar: () => { if (inPos >= stdin.length) return { v: -1, t: T.int }; return { v: stdin.charCodeAt(inPos++), t: T.int }; },
      sqrt: (a, l) => { if (a[0].v < 0) fail('負の数の平方根 sqrt(' + a[0].v + ') を求めました', l); return num(Math.sqrt(a[0].v)); },
      fabs: (a) => num(Math.abs(a[0].v)), abs: (a) => ({ v: Math.abs(a[0].v) | 0, t: T.int }),
      pow: (a) => num(Math.pow(a[0].v, a[1].v)), floor: (a) => num(Math.floor(a[0].v)), ceil: (a) => num(Math.ceil(a[0].v)),
      log: (a) => num(Math.log(a[0].v)), exp: (a) => num(Math.exp(a[0].v)), cos: (a) => num(Math.cos(a[0].v)), sin: (a) => num(Math.sin(a[0].v)),
      fmod: (a) => num(a[0].v % a[1].v), round: (a) => num(Math.sign(a[0].v) * Math.round(Math.abs(a[0].v))),
      rand: () => ({ v: rng.next(), t: T.int }), srand: (a) => { rng.seed(a[0].v); return { v: 0, t: T.void }; },
      time: () => ({ v: 1700000000, t: T.long }),
      strlen: (a) => ({ v: strBytes(readStr(a[0].v)), t: T.long }),
      strcpy: (a) => { writeStr(a[0].v, readStr(a[1].v)); return a[0]; },
      strncpy: (a) => { const b = utf8(readStr(a[1].v)); const n = a[2].v; for (let i = 0; i < n; i++) store(a[0].v + i, T.char, i < b.length ? b[i] : 0); return a[0]; },
      strcmp: (a) => { const x = readStr(a[0].v), y = readStr(a[1].v); return { v: x < y ? -1 : x > y ? 1 : 0, t: T.int }; },
      assert: (a, l) => { if (!truthy(a[0])) fail('assert に失敗しました (条件が偽)', l); return { v: 0, t: T.void }; },
      exit: (a) => { throw { exitCode: a[0] ? a[0].v : 0 }; },
    };

    const funcs = prog.funcs;
    function call(e) {
      if (e.f.k !== 'id') fail('関数ポインタには対応していません', e.loc);
      const name = e.f.name;
      const fn = funcs[name];
      if (fn && fn.body) {
        if (fn.params.length !== e.args.length) fail('関数 ' + name + ' の引数の数が違います (必要: ' + fn.params.length + ' 個, 渡した数: ' + e.args.length + ' 個)', e.loc);
        const vals = e.args.map((a, i) => {
          const v = decay(rv(a));
          const pt = fn.params[i].type;
          if (pt.k === 'ptr' && isArith(v.t) && !v.isConst0) fail('関数 ' + name + ' の第' + (i + 1) + '引数はポインタ (' + typeStr(pt) + ') です。変数の値ではなく番地を渡すために & を付けてください', e.loc);
          if (isArith(pt) && v.t.k === 'ptr') fail('関数 ' + name + ' の第' + (i + 1) + '引数は ' + typeStr(pt) + ' 型です。ポインタ (番地) ではなく値を渡してください', e.loc);
          if (pt.k === 'ptr' && v.t.k === 'ptr' && pt.to.k !== 'void' && v.t.to.k !== 'void' && typeStr(pt) !== typeStr(v.t)) fail('関数 ' + name + ' の第' + (i + 1) + '引数の型が違います (必要: ' + typeStr(pt) + ', 渡した値: ' + typeStr(v.t) + ')', e.loc);
          if (pt.k === 'struct' && (v.t.k !== 'struct' || v.t.name !== pt.name)) fail('関数 ' + name + ' の第' + (i + 1) + '引数には ' + typeStr(pt) + ' を渡してください' + (v.t.k === 'ptr' ? ' (ポインタを渡すなら仮引数を ' + typeStr(pt) + ' * にします)' : ''), e.loc);
          return v;
        });
        return invoke(fn, vals, e.loc);
      }
      if (BUILTINS[name]) {
        if (name === 'scanf') e.args.forEach((a, i) => {
          if (i > 0 && a.k === 'id') { const s0 = lookup(a.name); if (s0 && isArith(s0.t)) fail('scanf の第' + (i + 1) + '引数が変数 ' + a.name + ' の「値」になっています。scanf には番地を渡すので &' + a.name + ' と書いてください', e.loc); }
        });
        const vals = e.args.map((a) => decay(rv(a)));
        return BUILTINS[name](vals, e.loc);
      }
      if (fn) fail('関数 ' + name + ' はプロトタイプ宣言だけで, 本体が定義されていません (分割したファイルを確認してください)', e.loc);
      fail('関数 ' + name + ' は定義されていません', e.loc);
    }
    function invoke(fn, vals, callLoc) {
      if (frames.length > 120) fail('関数呼び出しが深すぎます (再帰が止まっていない?)');
      const prev = frames[frames.length - 1];
      const base = prev ? Math.ceil(prev.top / 20) * 20 + 20 : STACK_BASE;
      const f = { fn: fn.name, base, top: base, scopes: [new Map()], vars: [], callLoc };
      frames.push(f);
      fn.params.forEach((p, i) => {
        if (!p.name) return;
        declare({ name: p.name, type: p.type, init: null, loc: fn.loc }, false);
        const s = lookup(p.name);
        if (p.type.k === 'struct') memcpy(s.addr, vals[i].v, p.type);
        else store(s.addr, p.type, vals[i].v);
      });
      let r;
      try { r = execBlock(fn.body, true); }
      catch (ex) { throw ex; }
      let ret = { v: 0, t: fn.ret };
      if (r && r.sig === 'ret') {
        if (fn.ret.k === 'void' && r.v) fail('void 関数 ' + fn.name + ' は値を返せません');
        if (r.v) {
          if (fn.ret.k === 'struct') { ret = { v: r.v.v, t: fn.ret, tmpStruct: true }; }
          else { if (fn.ret.k === 'ptr' && r.v.t.k === 'ptr' && frames[frames.length - 1] === f && r.v.v >= f.base && r.v.v < f.top && fn.name !== 'main') r.v.dangling = true; ret = { v: conv(r.v.v, fn.ret), t: fn.ret }; }
        }
      }
      if (fn.name !== 'main') {
        for (const v of f.vars) freeRange(v.addr, v.t);
        frames.pop();
      }
      return ret;
    }

    function snap(l) {
      curLoc = l;
      if (res.steps.length >= maxSnaps) { res.truncated = true; return; }
      res.steps.push({
        loc: l,
        frames: frames.map((f) => ({ fn: f.fn, base: f.base, vars: f.vars.slice(), callLoc: f.callLoc })),
        globals: gvars.slice(),
        log, out: out.length, err: errOut.length,
      });
      log = [];
    }

    function execBlock(b, isFnBody) {
      const f = frames[frames.length - 1];
      if (!isFnBody) f.scopes.push(new Map());
      try {
        for (const s of b.body) { const r = exec(s); if (r) return r; }
      } finally {
        if (!isFnBody) {
          const depth = f.scopes.length;
          const keep = [];
          for (const v of f.vars) { if (v.scopeDepth >= depth) freeRange(v.addr, v.t); else keep.push(v); }
          f.vars = keep;
          f.scopes.pop();
        }
      }
      return null;
    }
    function exec(s) {
      tick();
      switch (s.k) {
        case 'block': return execBlock(s, false);
        case 'empty': return null;
        case 'decl': snap(s.loc); for (const d of s.decls) declare(d, false); return null;
        case 'expr': snap(s.loc); rv(s.e); return null;
        case 'if': snap(s.loc); if (truthy(decay(rv(s.c)))) return exec(s.a); if (s.b) return exec(s.b); return null;
        case 'while':
          for (;;) {
            snap(s.loc);
            if (!truthy(decay(rv(s.c)))) return null;
            const r = exec(s.body);
            if (r) { if (r.sig === 'brk') return null; if (r.sig === 'ret') return r; }
          }
        case 'do':
          for (;;) {
            const r = exec(s.body);
            if (r) { if (r.sig === 'brk') return null; if (r.sig === 'ret') return r; }
            snap(s.loc);
            if (!truthy(decay(rv(s.c)))) return null;
          }
        case 'for': {
          const f = frames[frames.length - 1];
          f.scopes.push(new Map());
          try {
            if (s.init) { if (s.init.k === 'decl') { snap(s.loc); for (const d of s.init.decls) declare(d, false); } else { snap(s.loc); rv(s.init.e); } }
            for (;;) {
              if (s.c) { snap(s.loc); if (!truthy(decay(rv(s.c)))) return null; }
              const r = exec(s.body);
              if (r) { if (r.sig === 'brk') return null; if (r.sig === 'ret') return r; }
              if (s.step) rv(s.step);
            }
          } finally {
            const depth = f.scopes.length; const keep = [];
            for (const v of f.vars) { if (v.scopeDepth >= depth) freeRange(v.addr, v.t); else keep.push(v); }
            f.vars = keep; f.scopes.pop();
          }
        }
        case 'return': snap(s.loc); return { sig: 'ret', v: s.e ? decay(rv(s.e)) : null };
        case 'break': snap(s.loc); return { sig: 'brk' };
        case 'continue': snap(s.loc); return { sig: 'cont' };
      }
      fail('未対応の文です', s.loc);
    }

    try {
      for (const g of prog.globals) for (const d of g.decls) declare(d, true);
      const main = funcs.main;
      if (!main || !main.body) throw new CError('main 関数がありません', null);
      const r = invoke(main, [], null);
      res.exit = r.v | 0;
      snap({ file: mainName, line: -1, end: true });
    } catch (e) {
      if (e && e.exitCode !== undefined) { res.exit = e.exitCode; snap({ file: mainName, line: -1, end: true }); }
      else {
        const isC = e && e.isC;
        res.error = { msg: isC ? e.message : '内部エラー: ' + (e && e.message), loc: (e && e.loc) || curLoc, phase: 'runtime' };
        res.truncated = false;
        if (res.steps.length >= maxSnaps) res.steps.pop();
        snap(res.error.loc || curLoc);
        res.steps[res.steps.length - 1].error = res.error;
      }
    }
    if (res.steps.length && log.length) { res.steps[res.steps.length - 1].log = res.steps[res.steps.length - 1].log.concat(log); log = []; }
    res.out = out; res.err = errOut;
    res.nameAt = null;
    return res;
  }

  global.CLab = { run, typeStr, tokenize, CError, kindLabel };
})(window);
