/* 単元一覧 — PDF を受け取るごとに ready: true の単元を追加する */
window.UNITS = window.UNITS || {};
window.UNIT_INDEX = [
  { id: 'b1', title: 'C 言語の基礎', desc: '入出力・制御構造・関数の基本', ready: false, note: '資料待ち' },
  { id: 'b2', title: '関数と分割コンパイル', desc: '関数・ヘッダ・構造体・乱数', ready: false, note: '資料待ち' },
  { id: 'b3', title: 'ポインタ', desc: '番地・& と *・ポインタ引数・構造体/配列へのポインタ', ready: true },
  { id: 'b4', title: 'Coming next', desc: '次回の資料 PDF を送ると, ここに単元が追加されます', ready: false, note: '次回' },
];
