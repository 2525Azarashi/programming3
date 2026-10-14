/* 単元一覧 — PDF を受け取るごとに ready: true の単元を追加する */
window.UNITS = window.UNITS || {};
window.UNIT_INDEX = [
  { id: 'b1', title: 'Cプログラミングの基礎事項', desc: 'bit と型・stdin / stdout / stderr・リダイレクトと diff・EOF・配列と文字列', ready: true },
  { id: 'b2', title: '分割コンパイル', desc: '関数とプロトタイプ宣言・コンパイルとリンク・ヘッダ・構造体・乱数', ready: true },
  { id: 'b3', title: 'ポインタ', desc: '番地・& と *・ポインタ引数・構造体/配列へのポインタ', ready: true },
  { id: 'b4', title: 'Coming next', desc: '次回の資料 PDF を送ると, ここに単元が追加されます', ready: false, note: '次回' },
];
