# PIII LAB — プログラミング実習Ⅲ 学習サイト

## 概要
- **目的**: プログラミング実習Ⅲの理解を最大化する。直感的な理解（メモリ・入出力・リンクの可視化）を最優先し、予想・実験・課題によるアウトプットを重視。
- **公開中の単元**
  - **B1 Cプログラミングの基礎事項** — bit と型 / stdin・stdout・stderr / リダイレクトと diff / EOF / 配列と文字列（課題 1-1〜1-8, オプション O1-1, O1-2）
  - **B2 分割コンパイル** — 関数とプロトタイプ宣言 / コンパイルとリンク / ヘッダ / 構造体 / 乱数（課題 2-1〜2-8, オプション 2-1, 2-2）
  - **B3 ポインタ** — 番地 / & と * / ポインタ引数 / 構造体・配列へのポインタ（課題 3-1〜3-10, オプション 2 題）
  - **B4 配列と構造体** — 2 次元配列と行列 / 構造体の配列 pixel_t / 配列を持つ構造体 / ビットマップ画像処理（課題 4-1 (1)〜(7), 4-2 (1)〜(6), 4-3, オプション 2 題）
  - **T1 中間試験対策** (`/t1`) — 試験の形式 / 採点基準 (diff -Bw) / 当日の手順チェックリスト / 配布サンプルプログラムの解説・実行 / 重点復習マップ / **重点問題まとめ 7 題（資料が名指しした 例題(3-4) 課題(3-4)(3-5) 例題(3-5) 課題(3-7) 課題(3-10) 課題(4-1) を「何を作る・必要な要素・解くステップ・落とし穴」に分解）+ 本番で 1 問を解く 7 ステップ** / リダイレクト・diff・分割コンパイルのドリル / **70 分タイマー付き模擬試験 3 回分（第1回 基本 / 第2回 標準 / 第3回 応用, 各 4 問 20 点満点）+ 腕試し 2 問（隠しテスト + 題意チェック）。回ごとにタイマー・得点を別々に記録、ラボのタブで回を切替**
  - **B5 動的割当て** (`/b5`) — sizeof / malloc / free / 文字列 (strlen+1) / 構造体 (pref_t) / スタック istack と realloc。課題 5-1〜5-8 (12) + オプション 2。判定は diff に加え「割り当てバイト数がちょうどか」「free 忘れ (リーク) がないか」まで自動チェック
  - **B6 リスト処理** (`/b6`) — 自己参照構造体 / ダミー節点 / insert_node・list_print・list_find・insert_uniq・delete_dup / 先読み走査 / clock() による計算時間 O(n) / 二分探索木 (中間順表示・tree_find・O(log n))。課題 6-1〜6-5, 6-9 (6) + オプション 6-6〜6-8, 6-10, 6-11 (8)。表示の diff に加えて、隠しテストで関数の**戻り値** (find の NULL など) と free 忘れを判定。計算時間の課題は gcc の実測表を考察欄に表示
- 回ごとに PDF を受け取り、単元を追加していく構成。

## 主な機能
- **学習用 C インタプリタ**（`interp.js`）: ブラウザ内で C のサブセットを実行。番地モデル（main は 100 番地〜）、型チェック、未初期化・NULL・範囲外・`&` 忘れ・書式の不一致・全角文字（gcc の `stray '\343'` 相当）を日本語で診断。複数ファイルのリンク、プロトタイプ未宣言の警告（implicit declaration）、glibc 互換 `rand()`。stdout / stderr / キーボード入力の「端末での見え方」も記録。
- **メモリトレーサー**（`memviz.js`）: 1 行ずつ実行し、データ領域・番地・値・ポインタの矢印を表示。出力欄は **端末 / stdout / stderr** を切り替え可能。
- **仮想ターミナル**（`shell.js`）: `gcc [-c] [-o]`, `./a < in > out 2> err`, `diff [-w] [-B]`, `cat`, `ls`, `rm`。`.o` を使った分割コンパイル、`undefined reference` / `multiple definition` のリンクエラー、キーボード入力と Ctrl+D (EOF) を再現。ミッション付き。
- **可視化ウィジェット**（`widgets.js`）: int / float / double / char の bit パターン, 標準入出力とリダイレクトの流れ図, コンパイル→リンクの番地確定図。
- **予想問題** / **ポインタ実験室**（REPL）/ **よくある間違い**の実行診断。
- **課題ラボ**: CodeMirror エディタ、期待値 diff の自動判定（数値許容誤差指定可）、段階ヒント、模範解答、ステップ実行、「ターミナル」で配布資料どおりの gcc → リダイレクト → diff 手順、`.c` ダウンロード。
- **レポート生成**: B2 と同形式の `B1.txt` / `B2.txt` / `B3.txt` / `B4.txt`。B1 のオプション課題は別レポート **O1.txt** に分けて生成。
- 進捗・コード・メモは localStorage に自動保存。

## URL
- **GitHub**: https://github.com/2525Azarashi/programming3 (main ブランチ)
- `/` — 単元一覧
- `/t1` — 中間試験 T1 対策（`#mock` 模擬試験, `#procedure` 当日の手順）
- `/b6` — B6 リスト処理（`#lab` 課題ラボ, `#report` B6.txt 生成）
- `/b5` — B5 動的割当て（`#lab` 課題ラボ, `#report` B5.txt 生成）
- `/b1`, `/b2`, `/b3`, `/b4` — 各単元（`#lab` 課題ラボ, `#report` レポート, `#task-2-5` など課題直リンク）
- `/api/units` — 単元一覧 JSON

## 構成 / 単元の追加方法
- `src/index.tsx` — Hono。`UNITS` に単元を登録（`extra` で追加スクリプト `<id>-code.js` 等を読み込み）。
- `public/static/js/units/index.js` — ホームの単元一覧。
- `public/static/js/units/<id>-data.js`（gcc で検証した模範解答・配布ファイル・期待値, 自動生成）, `<id>-tasks.js`（課題定義）, `<id>-code.js`（章のサンプルコード）, `<id>.js`（章コンテンツ）。
- ブロック種別: `prose, point, callout, code, compare, tracer, predict, repl, cheat, mistakes, bits, flow, linkviz, shell, lab, report, html`。
- 課題定義: `tests[{stdin, expect, tol, inName, expName}]`, `check`, `custom`（テキスト課題）, `link`（リンクするファイル）, `given`（配布ファイル）, `optional`, `summary`, `reportTitle`, `noRun`, `noKufu`（レポートで「工夫した点」を出さない）, `observe`/`obsTitle`（考察欄）。
- 検証: 全単元で「模範解答はすべて合格・スターターはすべて不合格」を自動テスト済み（B1〜B6 76 課題 + T1 14 題, `node /home/user/qa/verify_all.js b1 b2 b3 b4 b5 b6 t1`）。

## データ
- サーバ側ストレージなし（静的 + localStorage）。

## デプロイ
- **Vercel**: リポジトリ直下の `vercel.json` で設定済み（Framework: Other, Build: `npm run build:static`, Output: `out`）。
  `scripts/build-static.mjs` が Hono アプリから `/`, `/t1`, `/b1`〜`/b4` の HTML を書き出し、`public/static` をコピーして静的サイトにする（サーバ不要。全機能がブラウザ内で動作）。
  Vercel の Project Settings で Output Directory / Build Command を手動で上書きしている場合は解除（または上記に合わせる）。
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
  - `rotator` 回転ワード (ホーム), `countUp/autoCount` 数字のカウントアップ, `magnet` / `tilt` / リップル / / 開幕カーテン
- `public/static/js/infog.js` (`window.Infog.make(spec)`) — 画面に入ると描かれるインフォグラフィック
  - `bars` 棒グラフ / `layout` bit 配置 / `pipeline` 工程図 (パケットが流れる) / `histo` 乱数シミュレーション / `donut` / `memstrip` 番地の物差し + ポインタの矢印 / `stats` / `compare2`
- 配置データ: `public/static/js/units/infog-data.js` → `window.INFOG[unit][chapId] = { top: spec, at: { blockIndex: spec } }`
- `prefers-reduced-motion` ではすべて静止表示
- 課題ラボ: 進捗ダッシュボード (リング + カウンタ + 課題ストリップ) がクリアのたびにアニメーション更新
- 目次: 章ごとの読了ゲージ (スクロール連動, 読了で ✓) / ページ遷移ワイプ / タスク切替・カードの段階登場

## B4 で追加した仕組み
- **インタプリタ拡張**: `unsigned char` / `short` (2 バイト) の正しい桁あふれ, `fopen` / `fread` / `fwrite` / `fclose` を**仮想ファイルシステム** (`run(..., {vfs: {'in.bmp': Uint8Array}})` → `res.vfs['out.bmp']`) で実行。4KB 以上の static / 大域配列は別領域 (1,000,000 番地〜) に配置。ローカル変数領域は約 290KB。
- **画像課題の自動判定**: in.bmp は配布 PDF の猫画像を 128×80 に縮小 (サイト版 image1.h / image2.h は MAX_X = MAX_Y = 128)。gcc で模範解答を実行した out.bmp (b4-data.js の `ref`) と**全画素比較**。フレーム課題のみ色が自由なので「外周 8 画素が一様なピンク系 + 内側不変」で判定。出力はエディタ下に in / あなたの out / 期待 の 3 枚を canvas で表示し, マウスで `img[y][x]` と r,g,b を読める。
- **ターミナル**: `gcc …` → `./a` で仮想 out.bmp が生成され, 画像が表示される (`Shell({vfs, onVfs})`)。
- **matrix.c の共有保存**: 課題 4-1 (1)〜(7) とオプション 1 は `share: ['matrix.c']` で同じファイルを育てる。
- **ウィジェット** (b4-code.js): 行列アニメーション (和 / 転置 2 種 / 行列×ベクトル), 色合成 (pixel_t), 画像ギャラリー。
- **インフォグラフィック追加**: `grid2d` (表 ⇄ 1 列のメモリをハイライト連動), `pixels` (r,g,b のバーが色になる)。
- gcc 検証済み解答・生成スクリプト: `/home/user/b3_work/b4/`, `/home/user/b3_work/gen/gen_b4.py`。検証: `node /home/user/qa/verify_all.js b1 b2 b3 b4` (全模範解答 OK・全スターター NG)。

## UX パターン (ux.js)
- **Toast**: `U.toast(msg, {type, dur, action, onAction})` — 積み重ね・ホバーで一時停止・スワイプで消す・「元に戻す」ボタン。
- **Bottom Sheet**: `U.sheet({...})` / `U.ask({...}) → Promise<bool>` — `confirm()` をすべて置換。ドラッグで閉じる。デスクトップでは中央モーダル。
- **Swipe Action**: 課題タイルを右スワイプ = 開く, 左スワイプ = 完了 / リセット（取り消し可）。
- **Pull to Refresh**: タッチ端末で進捗・インフォグラフィックを再描画。
- **Skeleton Screen**: エディタ読み込み中・画像処理中。
- **Auto Complete**: 検索パレット（Ctrl/Cmd+K, `/`。あいまい一致・ゴースト補完・履歴）と、エディタの C 補完（構造体メンバー・スニペット・ライブラリ関数, Ctrl+Space）。

## T1 中間試験対策の仕組み
- ファイル: `units/t1-data.js`（`/home/user/b3_work/gen/gen_t1.py` が問題ファイルと gcc の期待値から生成）, `t1-tasks.js`, `t1.js`, `t1-talk.js`, `INFOG.t1`。
- 採点は本番と同じ方針: 問題文の入力で diff、さらに **表示していない入力 (隠しテスト)** を `diff -Bw` 相当で照合し、終了ステータス (`exit(1)`) と**題意チェック**（ポインタで返しているか, ループ上限を決め打ちしていないか 等）も行う。全部通れば 5 点。
- 70 分タイマーは localStorage に開始時刻を保存（ページを閉じても進む）。残り 35 / 10 / 5 分でトースト。得点ボード・合格ライン (10 点) 表示。
- 当日の手順チェックリスト（自動保存）, diff -Bw 体験ウィジェット, B3 / B4 の進捗と連動した重点復習マップ。
- 模擬問題は**非公式**の練習問題（出題範囲から作成）。

## インタプリタのヒープ対応 (B5 で追加)
- `malloc` / `calloc` / `realloc` / `free` / `fgets` / `strcat` / `strncmp` / `memset` を実装。ヒープは 5000000 番地〜。
- 範囲外アクセス・free 後の使用・二重 free・free できない番地・未初期化の読み出しを実行時エラーで検出。終了時の未返却ブロックは `res.heap.leaks` (課題ラボでは「free 忘れ」表示)。
- メモリ図に紫の「ヒープ」領域を表示 (ブロックはポインタの型から配列/構造体として描画、malloc/free/realloc をキャプションで説明)。
- gcc 検証済み解答・生成: `/home/user/b3_work/b5/`, `gen/gen_b5.py` (データ), `gen/rep_b5.py` (レポート)。

## 課題ラボのエディタ (使いやすさ)
- ツールバー: **コピー** (表示中のファイル / Ctrl+Shift+C)・**全部** (自分のファイルをファイル名付きでまとめてコピー)・**クリア** (空にする。トーストの「元に戻す」で復元)・元に戻す / やり直す・コメント切替 (Ctrl+/)・整形 (Shift+Alt+F)・文字サイズ A−/A＋ (保存される)・**全画面** (Esc で戻る)。
- 配布ファイルのタブでは「読み取り専用」バッジを表示し、クリア等を無効化 (コピーは可)。
- ステータスバー: カーソル位置・行数/文字数・自動保存の状態。Tab / Shift+Tab で選択範囲のインデント、Ctrl+S で即保存。
- 結果欄の「コピー」で実行結果 (stdout) を、解説・よくある間違い・模範解答・ステップ実行のコードもワンクリックでコピー可能。

## B6 で追加した仕組み
- インタプリタ: 自己参照構造体 (`struct list_node_s *next;`)・`typedef struct 名 {...} 型;`・`clock_t` / `time_t` / `clock()` / `CLOCKS_PER_SEC` に対応。
- 隠しテスト (`b6-tasks.js` の `hidden`): 配布 test 用 main とは別の検査用 main をリンクして、list_find / insert_uniq / delete_dup / sorted_find / tree_find の戻り値を確認。
- 計算時間の課題 (6-4, Opt-6t, Opt-8t, Opt-11): ブラウザでは n = 200 で動作と found 件数を確認し、考察欄に gcc の実測表 (n = 5000〜25000, 1 個あたり µs) を表示。
- gcc 検証済み解答・生成: `/home/user/b3_work/b6/`, `gen/gen_b6.py` (データ), `gen/rep_b6.py` (レポート B6.txt + 提出 zip)。
