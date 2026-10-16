# PIII LAB — プログラミング実習Ⅲ 学習サイト

## 概要
- **目的**: プログラミング実習Ⅲの理解を最大化する。直感的な理解（メモリ・入出力・リンクの可視化）を最優先し、予想・実験・課題によるアウトプットを重視。
- **公開中の単元**
  - **B1 Cプログラミングの基礎事項** — bit と型 / stdin・stdout・stderr / リダイレクトと diff / EOF / 配列と文字列（課題 1-1〜1-8, オプション O1-1, O1-2）
  - **B2 分割コンパイル** — 関数とプロトタイプ宣言 / コンパイルとリンク / ヘッダ / 構造体 / 乱数（課題 2-1〜2-8, オプション 2-1, 2-2）
  - **B3 ポインタ** — 番地 / & と * / ポインタ引数 / 構造体・配列へのポインタ（課題 3-1〜3-10, オプション 2 題）
- 回ごとに PDF を受け取り、単元を追加していく構成。

## 主な機能
- **学習用 C インタプリタ**（`interp.js`）: ブラウザ内で C のサブセットを実行。番地モデル（main は 100 番地〜）、型チェック、未初期化・NULL・範囲外・`&` 忘れ・書式の不一致・全角文字（gcc の `stray '\343'` 相当）を日本語で診断。複数ファイルのリンク、プロトタイプ未宣言の警告（implicit declaration）、glibc 互換 `rand()`。stdout / stderr / キーボード入力の「端末での見え方」も記録。
- **メモリトレーサー**（`memviz.js`）: 1 行ずつ実行し、データ領域・番地・値・ポインタの矢印を表示。出力欄は **端末 / stdout / stderr** を切り替え可能。
- **仮想ターミナル**（`shell.js`）: `gcc [-c] [-o]`, `./a < in > out 2> err`, `diff [-w] [-B]`, `cat`, `ls`, `rm`。`.o` を使った分割コンパイル、`undefined reference` / `multiple definition` のリンクエラー、キーボード入力と Ctrl+D (EOF) を再現。ミッション付き。
- **可視化ウィジェット**（`widgets.js`）: int / float / double / char の bit パターン, 標準入出力とリダイレクトの流れ図, コンパイル→リンクの番地確定図。
- **予想問題** / **ポインタ実験室**（REPL）/ **よくある間違い**の実行診断。
- **課題ラボ**: CodeMirror エディタ、期待値 diff の自動判定（数値許容誤差指定可）、段階ヒント、模範解答、ステップ実行、「ターミナル」で配布資料どおりの gcc → リダイレクト → diff 手順、`.c` ダウンロード。
- **レポート生成**: B2 と同形式の `B1.txt` / `B2.txt` / `B3.txt`。B1 のオプション課題は別レポート **O1.txt** に分けて生成。
- 進捗・コード・メモは localStorage に自動保存。

## URL
- `/` — 単元一覧
- `/b1`, `/b2`, `/b3` — 各単元（`#lab` 課題ラボ, `#report` レポート, `#task-2-5` など課題直リンク）
- `/api/units` — 単元一覧 JSON

## 構成 / 単元の追加方法
- `src/index.tsx` — Hono。`UNITS` に単元を登録（`extra` で追加スクリプト `<id>-code.js` 等を読み込み）。
- `public/static/js/units/index.js` — ホームの単元一覧。
- `public/static/js/units/<id>-data.js`（gcc で検証した模範解答・配布ファイル・期待値, 自動生成）, `<id>-tasks.js`（課題定義）, `<id>-code.js`（章のサンプルコード）, `<id>.js`（章コンテンツ）。
- ブロック種別: `prose, point, callout, code, compare, tracer, predict, repl, cheat, mistakes, bits, flow, linkviz, shell, lab, report, html`。
- 課題定義: `tests[{stdin, expect, tol, inName, expName}]`, `check`, `custom`（テキスト課題）, `link`（リンクするファイル）, `given`（配布ファイル）, `optional`, `summary`, `reportTitle`, `noRun`。
- 検証: 全単元で「模範解答はすべて合格・スターターはすべて不合格」を自動テスト済み（32 課題）。

## データ
- サーバ側ストレージなし（静的 + localStorage）。

## デプロイ
- Cloudflare Pages（Hono + Vite）。未デプロイ（デプロイ方法: Genspark ホスティング or ご自身の Cloudflare アカウントを選択待ち）。
- 技術: Hono / TypeScript / Vanilla JS / CodeMirror 5 (CDN) / Google Fonts

## 今後
- B4 以降の単元追加（PDF 受領後）
- malloc/free 等の動的メモリ対応（単元に応じてインタプリタを拡張）

## 対話形式 (サカイ × リョウガ)
解説は基本的に **サカイ (TA, `s`, 左・シアン)** と **リョウガ (受講生, `r`, 右・アンバー)** の対話で進みます。
- 対話データ: `public/static/js/units/<unit>-talk.js` → `window.TALK.<unit>`
- 構造: `{ 章id: { talk, before:{i}, replace:{i}, after:{i}, explain:{predictId}, fix:[...] }, _tasks:{課題id} }`
  - `i` は `<unit>.js` の各章 `blocks` の **元のインデックス**
  - 1 行 = `[who, html]` (`who` = `s` / `r` / `n`(注記))
- 描画: `app.js` の `talk()` / `applyTalk()`。章リード・予想問題の解説・よくある間違いの直し方・課題の導入・ヒントが対話になります。

## デザイン — 「ぷにぷにメモリ帳」(可愛い UI)
- クリーム色の方眼ノート + 太いインク輪郭 (`--bw: 2px`) + ずらし影 (`--sh`) + パステル (pink / mint / lemon / sky / lav / peach)
- フォント: Zen Maru Gothic (本文) / Fredoka (英字見出し) / JetBrains Mono (コード)
- キャラクター: `U.face(who, mood)` (core.js) が SVG の顔を生成。mood = normal / happy / wow / think はセリフから `U.moodOf` で自動判定。まばたきアニメ付き
- ごほうび: 予想問題の正解・課題クリアで `U.confettiAt(el)` の紙吹雪
- ホーム: 跳ねる見出し, キャラ紹介カード, 浮かぶステッカー, マーキー, 単元カード (進捗バー)
- ターミナル / コンソールだけは夜色 (#3b2738) の “おもちゃパソコン”
- `prefers-reduced-motion` で全アニメ停止

## Kinetic Typography / UI アニメーション / インフォグラフィック
- `public/static/js/kinetic.js` (`window.Kinetic`)
  - `split(el)` 文字分割 → `watch(el)` で画面内に入ると 1 文字ずつバネで登場 (章見出し・単元タイトル・How 見出し)
  - スクロール速度で見出しが傾く (`--skew`), 章ごとの巨大アウトライン文字がスクロールで横に流れる (`ticker`)
  - `rotator` 回転ワード (ホーム), `countUp/autoCount` 数字のカウントアップ, `magnet` / `tilt` / リップル / カーソルフォロワー / 開幕カーテン
- `public/static/js/infog.js` (`window.Infog.make(spec)`) — 画面に入ると描かれるインフォグラフィック
  - `bars` 棒グラフ / `layout` bit 配置 / `pipeline` 工程図 (パケットが流れる) / `histo` 乱数シミュレーション / `donut` / `memstrip` 番地の物差し + ポインタの矢印 / `stats` / `compare2`
- 配置データ: `public/static/js/units/infog-data.js` → `window.INFOG[unit][chapId] = { top: spec, at: { blockIndex: spec } }`
- `prefers-reduced-motion` ではすべて静止表示
