#!/usr/bin/env python3
"""
gen_b8.py — B8 二分探索とハッシュのデータ生成スクリプト
配布資料「[B8] 二分探索とハッシュ」の全課題 (8-1〜8-7, オプション 8-1) を
gcc でコンパイル・実行・実測し, public/static/js/units/b8-data.js を生成する。
"""
import json, os, re, subprocess, tempfile, urllib.request

IATA_MINI_CSV = """AAC,Al Arish : Egypt - Al Arish Airport
FCO,Rome : Italy Leonardo Da Vinci/Fiumicino
ITM,Osaka : Japan Itami International Was Osaka
JFK,New York : NY : USA John F Kennedy Intl Airport
JRO,Kilimanjaro : Tanzania Kilimanjaro
KIX,Osaka : Japan Kansai International
NRT,Tokyo : Japan - Narita
PEK,Beijing : China Peking Capital Airport
SAF,Santa Fe : NM : USA Santa Fe Municipal Airport
SFO,San Francisco : CA : USA San Francisco Intl Airport
"""

# ブラウザ内フルセット検証用サブセット (32空港, 昇順ソート済み, test2-in.txt のヒット15件すべて + CPU計測キーすべて含む)
IATA_MEDIUM_CSV_LINES = [
    ("AAC", "Al Arish : Egypt - Al Arish Airport"),
    ("AAL", "Aalborg : Denmark Aalborg"),
    ("AET", "Allakaket : AK : USA"),
    ("AMM", "Amman : Jordan Queen Alia International"),
    ("BKK", "Bangkok : Thailand Bangkok International Airport"),
    ("CDG", "Paris : France Charles De Gaulle"),
    ("CTS", "Sapporo : Japan Chitose"),
    ("CXI", "Christmas Island : Australia - Cassidy Airport"),
    ("DEL", "Delhi : India Indira Gandhi International Airport"),
    ("DXB", "Dubai : United Arab Emirates Dubai International Airport"),
    ("FCO", "Rome : Italy Leonardo Da Vinci/Fiumicino"),
    ("FRA", "Frankfurt : Germany Frankfurt International"),
    ("FUK", "Fukuoka : Japan Itazuke"),
    ("HKG", "Hong Kong : Hong Kong"),
    ("ICN", "Incheon [Seoul] : South Korea - Incheon International Airport"),
    ("ILI", "Iliamna : AK : USA"),
    ("ITM", "Osaka : Japan Itami International Was Osaka"),
    ("IYK", "Inyokern : CA : USA Inyokern Airport"),
    ("JFK", "New York : NY : USA John F Kennedy Intl Airport"),
    ("JRO", "Kilimanjaro : Tanzania Kilimanjaro"),
    ("KIX", "Osaka : Japan Kansai International"),
    ("LAX", "Los Angeles : CA : USA Los Angeles Intl Airport"),
    ("LHR", "London : England : United Kingdom Heathrow"),
    ("MVD", "Montevideo : Uruguay Carrasco"),
    ("NRT", "Tokyo : Japan - Narita"),
    ("ORD", "Chicago : IL : USA - O'hare International Airport"),
    ("PEK", "Beijing : China Peking Capital Airport"),
    ("SAF", "Santa Fe : NM : USA Santa Fe Municipal Airport"),
    ("SFO", "San Francisco : CA : USA San Francisco Intl Airport"),
    ("SIN", "Singapore : Singapore Changi International Airport"),
    ("SJW", "Shijiazhuang : China Shijiazhuang"),
    ("SYD", "Sydney : New South Wales : Australia Sydney /KingsfordSmith/ Airport"),
    ("TPE", "Taipei : Taiwan Chiang Kai Shek"),
    ("TSR", "Timisoara : Romania Timisoara"),
    ("XIL", "Xilinhot : China"),
    ("YFB", "Iqaluit : Northwest Territories : Canada - Iqaluit-Frobisher Bay Airport"),
    ("ZRH", "Zurich : Switzerland Zurich"),
    ("ZYL", "Sylhet : Bangladesh - Sylhet Airport"),
]
assert IATA_MEDIUM_CSV_LINES == sorted(IATA_MEDIUM_CSV_LINES, key=lambda x: x[0])
IATA_SUB_CSV = "".join(f"{c},{d}\n" for c, d in IATA_MEDIUM_CSV_LINES)


def build_iata_2700_csv():
    """Photius の空港データから配布資料準拠の 2700 件 CSV (昇順・各アンカー位置一致) を構築"""
    raw = urllib.request.urlopen("http://www.photius.com/wfb2001/airport_codes_alpha.html", timeout=20).read().decode("iso-8859-1", errors="replace")
    by_code = {}
    for line in raw.splitlines():
        clean = re.sub(r"<[^>]+>", "", line).strip()
        m = re.match(r"^([A-Z]{3})\s*-\s*(.+)$", clean)
        if m:
            code, desc = m.group(1), m.group(2).strip().replace(", ", " : ")
            if "\t" in desc:
                desc = desc.split("\t")[0].strip()
            if all(32 <= ord(ch) <= 126 for ch in desc) and "?" not in desc and len(desc) <= 127:
                by_code.setdefault(code, desc)
    items = sorted(by_code.items())
    must = {c for c, _ in IATA_MEDIUM_CSV_LINES}
    anchors = [("AAC", 0), ("CXI", 499), ("IYK", 999), ("MVD", 1499), ("SJW", 1999), ("YFB", 2499), ("ZYL", 2699)]
    selected = []
    for k in range(len(anchors) - 1):
        c_start, idx_start = anchors[k]
        c_end, idx_end = anchors[k + 1]
        need = idx_end - idx_start
        pool = [it for it in items if c_start <= it[0] < c_end]
        must_in = [it for it in pool if it[0] in must]
        rest_in = [it for it in pool if it[0] not in must]
        take_n = need - len(must_in)
        step = len(rest_in) / take_n
        picked_rest = [rest_in[int(i * step)] for i in range(take_n)]
        seg = sorted(must_in + picked_rest)
        assert len(seg) == need
        selected.extend(seg)
    selected.append(("ZYL", by_code["ZYL"]))
    assert len(selected) == 2700
    for code, idx in anchors:
        assert selected[idx][0] == code
    return "".join(f"{c},{d}\n" for c, d in selected)


IATA_DB_H_MINI = """/*
  次の行の __USE_MINI__ が定義されていると iata_mini.csv が,
  次の行がコメントアウトされていると iata_data.csv が使われる
*/
#define __USE_MINI__

#ifdef __USE_MINI__
/* テスト版の定義 */
#define IATA_F "iata_mini.csv"  /* 空港データのファイル */
#define MAX_RECORDS 16 /* レコード数の上限 */
#else
/* フルセット版の定義 */
#define IATA_F "iata_data.csv"  /* 空港データのファイル */
#define MAX_RECORDS 6000  /* レコード数の上限 */
#endif

#define KEY_LEN 3  /* 空港コード (キー) の文字数 */
#define KEY_FMT "%3s"  /* 空港コード (キー) の入力用フォーマット */
#define DATA_LEN 127  /* 空港データの最大文字数 */
#define LINE_LEN (KEY_LEN + 1 + DATA_LEN + 1)  /* 1行の最大文字数 */

/* 1 レコードのデータ */
typedef struct {
  char key[KEY_LEN+1];  /* 空港コード (キー) */
  char* data;  /* 空港の詳細データ (文字配列) へのポインタ */
} record_t;

/* データベース (全データ) */
typedef struct {
  int n;  /* データ (レコード) 数 */
  record_t record[MAX_RECORDS];  /* データ (レコード) の配列 */
} db_t;

void db_init(db_t *db); /* 初期化 */
void db_load(db_t *db); /* ファイルからデータを読み込む */
void db_delete(db_t *db); /* データの破棄 */
void db_dump(db_t *db); /* ダンプ (全データ出力) */

char *db_linear_search(db_t *db, char key[]); /* 線形探索 */
char *db_binary_search(db_t *db, char key[]); /* 二分探索 */

int db_hash_f(char key[]); /* ハッシュ関数 */
void db_hash_load(db_t *db); /* データを読み込む (ハッシュ用) */
char *db_hash_search(db_t *db, char key[]); /* ハッシュによる探索 */
"""

# ブラウザ内でフルセット挙動を高速検証するための iata_db.h (#define __USE_MINI__ コメントアウト版, MAX_RECORDS=80)
IATA_DB_H_SUB = IATA_DB_H_MINI.replace("#define __USE_MINI__", "/* #define __USE_MINI__ */").replace("#define MAX_RECORDS 6000", "#define MAX_RECORDS 80")
IATA_DB_H_FULL_GCC = IATA_DB_H_MINI.replace("#define __USE_MINI__", "/* #define __USE_MINI__ */")

IATA_DB2_H_SUB = """#define IATA_F "iata_data.csv"  /* 空港データのファイル */
#define MAX_RECORDS 64  /* レコード数の上限 (本番フルセットでは 2700) */

#define KEY_LEN 3  /* 空港コード (キー) の文字数 */
#define KEY_FMT "%3s"  /* 空港コード (キー) の入力用フォーマット */
#define DATA_LEN 127  /* 空港データの最大文字数 */
#define LINE_LEN (KEY_LEN + 1 + DATA_LEN + 1)  /* 1行の最大文字数 */

/* 1 レコードのデータ */
typedef struct record_s {
  char key[KEY_LEN+1];  /* 空港コード (キー) */
  char* data;  /* 空港データの詳細へのポインタ */
  struct record_s *next;  /* 次の節点 */
} record_t;

/* データベース (全データ) */
typedef struct {
  int n;  /* データ (レコード) 数 */
  record_t record[MAX_RECORDS];  /* データ (レコード) の配列 */
} db_t;

int db_hash_f(char key[]); /* ハッシュ関数 */

void db_init(db_t *db); /* データベースの初期化 */
void db_delete(db_t *db); /* データの破棄 */
void db_hash_load(db_t *db); /* データベースにファイルからデータを読み込む (ハッシュ用) */
char *db_hash_search(db_t *db, char key[]); /* ハッシュによる探索 */
"""

IATA_DB2_H_FULL_GCC = IATA_DB2_H_SUB.replace("#define MAX_RECORDS 64  /* レコード数の上限 (本番フルセットでは 2700) */", "#define MAX_RECORDS 2700  /* レコード数の上限 */")

IATA_DB_STARTER = """#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>

#include "iata_db.h"

/* c が改行記号かどうか判定するマクロ */
#define IS_EOL(c) ((c)=='\\n' || (c)=='\\r')

/* iata_db.c の内部だけで使用する関数 */
static char *fgetss(char *line, int len, FILE* fp);
static void extract_data(char line[], char key[], char data[]);
static void record_set(record_t *r, char key[], char data[]);


void db_init(db_t *db)
/* db_t 型変数の初期化 */
{
  int i;
  db->n = 0;
  for (i=0; i<MAX_RECORDS; i++) {
    strcpy(db->record[i].key, "");
    db->record[i].data = NULL;
  }
}


void db_load(db_t *db)
/* db_t 型変数にファイル IATA_F からデータを読み込む */
{
  FILE *fp;
  char line[LINE_LEN+1];
  char key[KEY_LEN+1];
  char data[DATA_LEN+1];

  /* ファイルのオープン */
  if ((fp=fopen(IATA_F, "r"))==NULL) {
    fprintf(stderr, "ファイル (%s) が開けません\\n", IATA_F);
    exit(1);
  }

  /* データの読み込み */
  while (fgetss(line, LINE_LEN, fp) != NULL) {
    /* 入力データ数が収容可能最大レコード数を超えたらエラー */
    if (MAX_RECORDS<=db->n) {
      fprintf(stderr, "MAX_RECORDS(%d) <= n(%d)\\n", MAX_RECORDS, db->n);
      exit(1);
    }
    /* line から key と data を切り出す */
    extract_data(line, key, data);
    /* db->n 番目のレコードに key と data を格納し, db->n を1増やす */
    record_set(&db->record[db->n], key, data);
    db->n++;
  }

  fclose(fp);
}


void db_delete(db_t *db)
/* db_t 型変数の領域を解放 */
{
  int i;
  for (i=0; i<(MAX_RECORDS); i++) {
    if (db->record[i].data != NULL) {
      free(db->record[i].data);
      db->record[i].data = NULL;
    }
  }
}


static void record_set(record_t *r, char key[], char data[])
/* r の指すレコードに key と data を書き込む (data は動的割当て) */
{
  assert(r!=NULL);
  assert(key!=NULL);
  assert(data!=NULL);
  /* key */
  assert(strlen(key)<=KEY_LEN);
  strcpy(r->key, key);
  /* data */
  assert(strlen(data)<=DATA_LEN);
  r->data = malloc(sizeof(char)*(strlen(data)+1));
  strcpy(r->data, data);
}


static char *fgetss(char *line, int len, FILE* fp)
{
  int ll = 0;
  int c;
  for (;;) {
    c = fgetc(fp);
    if ( (c=='\\n') || feof(fp) ) { break; }
    if (ll<len) {
      line[ll++] = c;
    }
  }
  if ( feof(fp) && (ll==0) ) { return NULL; }
  else {
    line[ll++] = '\\n';
    line[ll++] = '\\0';
    return line;
  }
}


static void extract_data(char line[], char key[], char data[])
/* line から key と data を抽出する */
{
  assert(line!=NULL);
  assert(key!=NULL);
  assert(data!=NULL);
  int k;

  /* ファイルの1行が長過ぎて line に収容できていないことがないかのチェック */
  /* line の末尾が改行でない → 1行が長過ぎるのでエラー */
  if (! IS_EOL( line[strlen(line)-1] ) ) {
    fprintf(stderr, "line length exceeded line size\\n");
    fprintf(stderr, "line = \\"%s\\"\\n", line);
    exit(1);
  }

  /* 先頭の KEY_LEN 文字が key */
  int p_key = 0;
  for (k=0; k<KEY_LEN; k++) {
    key[k] = line[p_key+k];
  }
  key[k] = '\\0';

  /* KEY_LEN+1 文字目以降改行記号までが data */
  int p_data = KEY_LEN+1;
  for (k=0; k<DATA_LEN; k++) {
    if (IS_EOL(line[p_data+k])) { break; }
    data[k] = line[p_data+k];
  }
  data[k] = '\\0';
}


void db_dump(db_t *db)
/* db_t 型変数の全データを出力する */
{
  /* 課題 (8-1) : この関数を完成させよ */
}

/* 課題 (8-2), (8-4), (8-6) の関数をここに追加していく */
"""

# Note: In handout page 4, db_delete loops `for (i=0; i<(db->n); i++)` originally,
# wait! In 8-6 (hash_load), records are scattered across 0..MAX_RECORDS-1, NOT 0..db->n-1!
# Wait: in C, `free(NULL)` is a safe no-op! If `db_delete` loops `for (i=0; i<MAX_RECORDS; i++) { free(db->record[i].data); db->record[i].data = NULL; }` or checks `!= NULL`, let's check handout page 4!
# Handout page 4 literally has:
# void db_delete(db_t *db)
# {
#   int i;
#   for (i=0; i<(db->n); i++) {
#     free(db->record[i].data);
#     db->record[i].data = NULL;
#   }
# }
# WAIT A SECOND! Look closely at handout page 4 vs task 8-6!
# If a student keeps `for (i=0; i<(db->n); i++)` from page 4 and runs `iata_test6a.c` (where `db->n` is 10 or 0 if student didn't increment `db->n`, and records are at indices 0, 2, 3, 5, 7, 10, 11, 12, 14, 15!!):
# Indices 10, 11, 12, 14, 15 are >= 10 (`db->n`)! In `iata_test6a.c`, `db_delete(&db)` is called!
# If `db_delete` only frees `0 .. db->n - 1`, then indices 10, 11, 12, 14, 15 would NOT be freed by `db_delete` if `db_delete` used `i < db->n`!
# Wait: let's check! In `interp.js`, unfreed blocks at program exit trigger `res.heap.leaks`!
# That's why checking this right now is SO IMPORTANT!
# If handout's `db_delete` has `i < db->n`, and a student doesn't touch `db_delete` in 8-6, then `db->record[10..15].data` wouldn't be freed unless `db_delete` loops `MAX_RECORDS` OR we check how `db_delete` is written!
# Wait: in C `free(NULL)` does nothing (and in `interp.js` line 557: `if (a === 0) return null;` - `free(NULL)` is already a no-op!).
# In our starter `iata_db.c`, if `db_delete` loops `i < MAX_RECORDS` (or if we check leaks carefully), wait: what if a student copies handout's `iata_db.c` verbatim where `db_delete` has `for (i=0; i<(db->n); i++)`?
# Both! We should:
# 1) Keep `db_delete` in starter as `for (i=0; i<MAX_RECORDS; i++) { free(db->record[i].data); db->record[i].data = NULL; }` (or explain in 8-6 hint that `db_delete` should loop `MAX_RECORDS` so hashed slots >= n are also freed, AND in 8-6 task check don't penalize if leak comes only from handout's `i < db->n` in `db_delete`, while our model solution frees all `MAX_RECORDS` cleanly!). Even better: in starter `iata_db.c`, let's check page 4 again: page 4 has `for (i=0; i<(db->n); i++)`, and `free(NULL)` works in `interp.js`. If we put `for (i=0; i<MAX_RECORDS; i++)` in starter with a comment `/* ハッシュ法でも全要素解放できるよう MAX_RECORDS まで走査 */`, then students using the starter won't hit surprise leaks in 8-6, AND if someone pastes `i < db->n`, we can give a super helpful hint! Let's make sure `free(db->record[i].data)` works when `data == NULL` (line 557 `if (a === 0) return null;` — yes, `free(NULL)` is valid standard C and valid in `interp.js`!).

IATA_DB_COMPLETE = IATA_DB_STARTER.replace(
    """void db_dump(db_t *db)
/* db_t 型変数の全データを出力する */
{
  /* 課題 (8-1) : この関数を完成させよ */
}

/* 課題 (8-2), (8-4), (8-6) の関数をここに追加していく */""",
    """void db_dump(db_t *db)
/* db_t 型変数の全データを出力する */
{
  int i;
  for (i = 0; i < MAX_RECORDS; i++) {
    printf("[%4d]", i);
    if (db->record[i].data != NULL) {
      printf(" %s %s", db->record[i].key, db->record[i].data);
    }
    printf("\\n");
  }
}


char *db_linear_search(db_t *db, char key[])
/* 線形探索 */
{
  int i;
  for (i = 0; i < db->n; i++) {
    if (strcmp(db->record[i].key, key) == 0) {
      return db->record[i].data;
    }
  }
  return NULL;
}


char *db_binary_search(db_t *db, char key[])
/* 二分探索 */
{
  int low = 0;
  int high = db->n - 1;
  int mid;
  int cmp;

  while (low <= high) {
    mid = (low + high) / 2;
    cmp = strcmp(db->record[mid].key, key);
    if (cmp == 0) {
      return db->record[mid].data;
    }
    else if (cmp < 0) {
      low = mid + 1;
    }
    else {
      high = mid - 1;
    }
  }
  return NULL;
}


int db_hash_f(char key[])
/* ハッシュ関数 */
{
  int i;
  int v = 0;
  for (i = 0; key[i] != '\\0'; i++) {
    v = (v << 5) + (key[i] - 'A');
  }
  return v % MAX_RECORDS;
}


void db_hash_load(db_t *db)
/* データを読み込む (closed hash 用) */
{
  FILE *fp;
  char line[LINE_LEN+1];
  char key[KEY_LEN+1];
  char data[DATA_LEN+1];
  int h;
  int m = MAX_RECORDS;

  if ((fp = fopen(IATA_F, "r")) == NULL) {
    fprintf(stderr, "ファイル (%s) が開けません\\n", IATA_F);
    exit(1);
  }

  while (fgetss(line, LINE_LEN, fp) != NULL) {
    if (MAX_RECORDS <= db->n) {
      fprintf(stderr, "MAX_RECORDS(%d) <= n(%d)\\n", MAX_RECORDS, db->n);
      exit(1);
    }
    extract_data(line, key, data);
    h = db_hash_f(key);
    while (db->record[h].data != NULL) {
      h++;
      if (h == m) { h = h - m; }
    }
    record_set(&db->record[h], key, data);
    db->n++;
  }

  fclose(fp);
}


char *db_hash_search(db_t *db, char key[])
/* ハッシュによる探索 (closed hash) */
{
  int h = db_hash_f(key);
  int m = MAX_RECORDS;
  int count = 0;

  while (db->record[h].data != NULL && count < m) {
    if (strcmp(db->record[h].key, key) == 0) {
      return db->record[h].data;
    }
    h++;
    if (h == m) { h = h - m; }
    count++;
  }
  return NULL;
}"""
)

GIVEN = {
    "iata_mini.csv": IATA_MINI_CSV,
    "iata_data.csv": IATA_SUB_CSV,
    "iata_db.h": IATA_DB_H_MINI,
    "iata_db_full.h": IATA_DB_H_SUB,
    "iata_test1.c": """#include <stdio.h>
#include "iata_db.h"

int main(void)
{
  db_t db;
  db_init(&db);  /* db の初期化 */
  db_load(&db);  /* iata_mini.csv からデータを読み込む */
  db_dump(&db);  /* 読み込んでいるデータを出力する */
  db_delete(&db);  /* db の破棄 */
  return 0;
}
""",
    "iata_test2.c": """#include <stdio.h>
#include "iata_db.h"

int main(void)
{
  db_t db;
  char key[KEY_LEN+1];
  char *data;

  db_init(&db);
  db_load(&db);

  /* 空港コードを入力するとデータを出力; EOFまで繰り返し実行 */
  for (;;) {
    fprintf(stderr, "key = ");
    if (scanf(KEY_FMT, key)==EOF) { break; }
    data = db_linear_search(&db, key);
    if (data==NULL) { printf("NO RECORD\\n"); }
    else { printf("%s => %s\\n", key, data); }
  }

  db_delete(&db);
  return 0;
}
""",
    "iata_test4.c": """#include <stdio.h>
#include "iata_db.h"

int main(void)
{
  db_t db;
  char key[KEY_LEN+1];
  char *data;

  db_init(&db);
  db_load(&db);

  /* 空港コードを入力するとデータを出力; EOFまで繰り返し実行 */
  for (;;) {
    fprintf(stderr, "key = ");
    if (scanf(KEY_FMT, key)==EOF) { break; }
    data = db_binary_search(&db, key);
    if (data==NULL) { printf("NO RECORD\\n"); }
    else { printf("%s => %s\\n", key, data); }
  }

  db_delete(&db);
  return 0;
}
""",
    "iata_test6a.c": """#include <stdio.h>
#include "iata_db.h"

int main(void)
{
  db_t db;

  db_init(&db);
  db_hash_load(&db);
  db_dump(&db);
  db_delete(&db);

  return 0;
}
""",
    "iata_test6b.c": """#include <stdio.h>
#include "iata_db.h"

int main(void)
{
  db_t db;
  char code[KEY_LEN+1];
  char *data;

  db_init(&db);
  db_hash_load(&db);

  /* 空港コードを入力するとデータを出力; EOFまで繰り返し実行 */
  for (;;) {
    fprintf(stderr, "code = ");
    if (scanf(KEY_FMT, code)==EOF) { break; }
    data = db_hash_search(&db, code);
    if (data==NULL) { printf("NO RECORD\\n"); }
    else { printf("%s => %s\\n", code, data); }
  }

  db_delete(&db);
  return 0;
}
""",
    "iata_db2.h": IATA_DB2_H_SUB,
    "iata_test9.c": """#include <stdio.h>
#include "iata_db2.h"

int main(void)
{
  db_t db;
  char key[KEY_LEN+1];
  char *data;

  db_init(&db);
  db_hash_load(&db);

  for (;;) {
    fprintf(stderr, "key = ");
    if (scanf(KEY_FMT, key)==EOF) { break; }
    data = db_hash_search(&db, key);
    if (data==NULL) { printf("NO RECORD\\n"); }
    else { printf("%s => %s\\n", key, data); }
  }

  db_delete(&db);
  return 0;
}
""",
}

STARTERS = {
    "iata_db.c": IATA_DB_STARTER,
    "iata_cpu1.c": """#include <stdio.h>
#include <time.h>
#include "iata_db.h"

/* ブラウザでの動作確認用は 100 回 (実機 gcc で計測する際は 100000 などに増やす) */
#define N_REPEAT 100

int main(void)
{
  db_t db;
  char key[KEY_LEN+1];
  char *data;

  db_init(&db);
  db_load(&db);

  /* key を入力する毎に db_linear_search を N_REPEAT 回繰り返して CPU 時間を stderr に出力 */
  for (;;) {
    fprintf(stderr, "key = ");
    if (scanf(KEY_FMT, key)==EOF) { break; }
    /** ここを埋めて完成させよ **/
  }

  db_delete(&db);
  return 0;
}
""",
    "iata_cpu2.c": """#include <stdio.h>
#include <time.h>
#include "iata_db.h"

/* ブラウザでの動作確認用は 100 回 (実機 gcc で計測する際は 100000〜1000000 に増やす) */
#define N_REPEAT 100

int main(void)
{
  db_t db;
  char key[KEY_LEN+1];
  char *data;

  db_init(&db);
  db_load(&db);

  /* key を入力する毎に db_binary_search を N_REPEAT 回繰り返して CPU 時間を stderr に出力 */
  for (;;) {
    fprintf(stderr, "key = ");
    if (scanf(KEY_FMT, key)==EOF) { break; }
    /** ここを埋めて完成させよ **/
  }

  db_delete(&db);
  return 0;
}
""",
    "iata_cpu3.c": """#include <stdio.h>
#include <time.h>
#include "iata_db.h"

/* ブラウザでの動作確認用は 100 回 (実機 gcc で計測する際は 100000〜1000000 に増やす) */
#define N_REPEAT 100

int main(void)
{
  db_t db;
  char key[KEY_LEN+1];
  char *data;

  db_init(&db);
  /* 注意: ハッシュ法では db_load ではなく db_hash_load を呼ぶ! */
  /** ここを埋めて完成させよ **/

  db_delete(&db);
  return 0;
}
""",
    "iata_db2.c": """#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>

#include "iata_db2.h"

#define IS_EOL(c) ((c)=='\\n' || (c)=='\\r')

/* オープンハッシュ法 (チェイン法):
   db->record[h] をダミー頭節点 (または先頭ポインタ保持節点) として,
   同じハッシュ値 h を持つレコードを next ポインタの線形リストでつないで記憶する */

int db_hash_f(char key[])
{
  int i;
  int v = 0;
  for (i = 0; key[i] != '\\0'; i++) {
    v = (v << 5) + (key[i] - 'A');
  }
  return v % MAX_RECORDS;
}

void db_init(db_t *db)
{
  /* db->n と db->record[0..MAX_RECORDS-1] を初期化する */
}

void db_delete(db_t *db)
{
  /* 各バケットの線形リストの節点と data 文字列をすべて free する */
}

void db_hash_load(db_t *db)
{
  /* IATA_F から読み込み, h = db_hash_f(key) 番目のリストに新節点を挿入する */
}

char *db_hash_search(db_t *db, char key[])
{
  /* h = db_hash_f(key) 番目のリストをたどり, key が一致する data (なければ NULL) を返す */
  return NULL;
}
""",
}

CPU1_SOL = """#include <stdio.h>
#include <time.h>
#include "iata_db.h"

#define N_REPEAT 100

int main(void)
{
  db_t db;
  char key[KEY_LEN+1];
  char *data = NULL;
  int i;
  clock_t clk_start, clk_end;

  db_init(&db);
  db_load(&db);

  for (;;) {
    fprintf(stderr, "key = ");
    if (scanf(KEY_FMT, key) == EOF) { break; }
    clk_start = clock();
    for (i = 0; i < N_REPEAT; i++) {
      data = db_linear_search(&db, key);
    }
    clk_end = clock();
    fprintf(stderr, "cpu = %11.6f [sec]\\n", (double)(clk_end - clk_start) / CLOCKS_PER_SEC);
    if (data == NULL) { printf("NO RECORD\\n"); }
    else { printf("%s => %s\\n", key, data); }
  }

  db_delete(&db);
  return 0;
}
"""

CPU2_SOL = CPU1_SOL.replace("db_linear_search", "db_binary_search")
CPU3_SOL = CPU1_SOL.replace("db_load(&db);", "db_hash_load(&db);").replace("db_linear_search", "db_hash_search")

IATA_DB2_SOL = """#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>

#include "iata_db2.h"

#define IS_EOL(c) ((c)=='\\n' || (c)=='\\r')

static char *fgetss(char *line, int len, FILE *fp)
{
  int ll = 0;
  int c;
  for (;;) {
    c = fgetc(fp);
    if ((c == '\\n') || feof(fp)) { break; }
    if (ll < len) {
      line[ll++] = c;
    }
  }
  if (feof(fp) && (ll == 0)) { return NULL; }
  line[ll++] = '\\n';
  line[ll++] = '\\0';
  return line;
}

static void extract_data(char line[], char key[], char data[])
{
  int k;
  if (!IS_EOL(line[strlen(line) - 1])) {
    fprintf(stderr, "line length exceeded line size\\n");
    exit(1);
  }
  for (k = 0; k < KEY_LEN; k++) {
    key[k] = line[k];
  }
  key[k] = '\\0';
  for (k = 0; k < DATA_LEN; k++) {
    if (IS_EOL(line[KEY_LEN + 1 + k])) { break; }
    data[k] = line[KEY_LEN + 1 + k];
  }
  data[k] = '\\0';
}

int db_hash_f(char key[])
{
  int i;
  int v = 0;
  for (i = 0; key[i] != '\\0'; i++) {
    v = (v << 5) + (key[i] - 'A');
  }
  return v % MAX_RECORDS;
}

void db_init(db_t *db)
{
  int i;
  db->n = 0;
  for (i = 0; i < MAX_RECORDS; i++) {
    strcpy(db->record[i].key, "");
    db->record[i].data = NULL;
    db->record[i].next = NULL;
  }
}

void db_delete(db_t *db)
{
  int i;
  record_t *p, *next_p;
  for (i = 0; i < MAX_RECORDS; i++) {
    p = db->record[i].next;
    while (p != NULL) {
      next_p = p->next;
      free(p->data);
      free(p);
      p = next_p;
    }
    db->record[i].next = NULL;
  }
  db->n = 0;
}

void db_hash_load(db_t *db)
{
  FILE *fp;
  char line[LINE_LEN + 1];
  char key[KEY_LEN + 1];
  char data[DATA_LEN + 1];
  int h;
  record_t *node;

  if ((fp = fopen(IATA_F, "r")) == NULL) {
    fprintf(stderr, "ファイル (%s) が開けません\\n", IATA_F);
    exit(1);
  }

  while (fgetss(line, LINE_LEN, fp) != NULL) {
    extract_data(line, key, data);
    h = db_hash_f(key);
    node = malloc(sizeof(record_t));
    if (node == NULL) { exit(1); }
    strcpy(node->key, key);
    node->data = malloc(sizeof(char) * (strlen(data) + 1));
    if (node->data == NULL) { exit(1); }
    strcpy(node->data, data);
    node->next = db->record[h].next;
    db->record[h].next = node;
    db->n++;
  }

  fclose(fp);
}

char *db_hash_search(db_t *db, char key[])
{
  int h = db_hash_f(key);
  record_t *p;
  for (p = db->record[h].next; p != NULL; p = p->next) {
    if (strcmp(p->key, key) == 0) {
      return p->data;
    }
  }
  return NULL;
}
"""

TEST2_IN = """AAC
CDG
FCO
JFK
JRO
KIX
AAA
NRT
ICN
SYD
LHR
PEK
SAF
ZZZ
ITM
SFO
HND
ZYL
"""

CPU_IN = """AAC
CXI
IYK
MVD
SJW
YFB
ZYL
AAA
LLL
ZZZ
"""

INP = {
    "test2_in": TEST2_IN,
    "cpu_in": CPU_IN,
}

SOL = {
    "8-1": {"iata_db.c": IATA_DB_COMPLETE},
    "8-2": {"iata_db.c": IATA_DB_COMPLETE},
    "8-3": {"iata_cpu1.c": CPU1_SOL, "iata_db.c": IATA_DB_COMPLETE},
    "8-4": {"iata_db.c": IATA_DB_COMPLETE},
    "8-5": {"iata_cpu2.c": CPU2_SOL, "iata_db.c": IATA_DB_COMPLETE},
    "8-6-1": {"iata_db.c": IATA_DB_COMPLETE},
    "8-6-2": {"iata_db.c": IATA_DB_COMPLETE},
    "8-7": {"iata_cpu3.c": CPU3_SOL, "iata_db.c": IATA_DB_COMPLETE},
    "o8-1": {"iata_db2.c": IATA_DB2_SOL},
}


def run_gcc(files_map, compile_units, stdin="", flags=None):
    flags = flags or []
    with tempfile.TemporaryDirectory() as d:
        for fn, content in files_map.items():
            with open(os.path.join(d, fn), "w") as f:
                f.write(content)
        exe = os.path.join(d, "a.out")
        cmd = ["gcc", "-Wall", "-Wextra"] + flags + ["-o", exe] + [os.path.join(d, u) for u in compile_units]
        subprocess.run(cmd, cwd=d, check=True)
        r = subprocess.run([exe], cwd=d, input=stdin.encode(), capture_output=True, check=True)
        return r.stdout.decode()


def measure_b8_timing(full_csv):
    """2700件フルセットの iata_data.csv で線形探索・二分探索・クローズドハッシュ・オープンハッシュを gcc (-O0 / -O2) で実測"""
    keys = ["AAC", "CXI", "IYK", "MVD", "SJW", "YFB", "ZYL", "AAA", "LLL", "ZZZ"]
    # N_REPEAT = 100000 (10万回) で線形探索を基準にし、二分探索・ハッシュは高精度計測のため 100万回計測して 10万回あたりに換算
    bench_c = """#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include "iata_db.h"

int main(int argc, char **argv)
{
  int mode = atoi(argv[1]); /* 0: linear, 1: binary, 2: hash */
  int rep = atoi(argv[2]);
  static db_t db;
  char key[KEY_LEN+1];
  volatile char *sink = NULL;
  int i;

  db_init(&db);
  if (mode == 2) db_hash_load(&db);
  else db_load(&db);

  while (scanf(KEY_FMT, key) != EOF) {
    clock_t t0 = clock();
    if (mode == 0) {
      for (i = 0; i < rep; i++) sink = db_linear_search(&db, key);
    } else if (mode == 1) {
      for (i = 0; i < rep; i++) sink = db_binary_search(&db, key);
    } else {
      for (i = 0; i < rep; i++) sink = db_hash_search(&db, key);
    }
    clock_t t1 = clock();
    /* 10万回あたりの秒数に正規化して出力 */
    double sec_per_100k = ((double)(t1 - t0) / CLOCKS_PER_SEC) * (100000.0 / rep);
    printf("%s %.6f %d\\n", key, sec_per_100k, sink != NULL ? 1 : 0);
  }
  db_delete(&db);
  return 0;
}
"""
    bench_open_c = """#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include "iata_db2.h"

int main(int argc, char **argv)
{
  int rep = atoi(argv[1]);
  static db_t db;
  char key[KEY_LEN+1];
  volatile char *sink = NULL;
  int i;

  db_init(&db);
  db_hash_load(&db);

  while (scanf(KEY_FMT, key) != EOF) {
    clock_t t0 = clock();
    for (i = 0; i < rep; i++) sink = db_hash_search(&db, key);
    clock_t t1 = clock();
    double sec_per_100k = ((double)(t1 - t0) / CLOCKS_PER_SEC) * (100000.0 / rep);
    printf("%s %.6f %d\\n", key, sec_per_100k, sink != NULL ? 1 : 0);
  }
  db_delete(&db);
  return 0;
}
"""
    # また、2700件フルセットでの正確な比較回数 (cmp_count) も計測してデータ化する!
    cmp_c = """#include <stdio.h>
#include <string.h>
#include "iata_db.h"

int main(void)
{
  static db_t db_lin, db_hash;
  char key[KEY_LEN+1];
  db_init(&db_lin); db_load(&db_lin);
  db_init(&db_hash); db_hash_load(&db_hash);

  while (scanf(KEY_FMT, key) != EOF) {
    int c_lin = 0, c_bin = 0, c_hash = 0;
    int i;
    for (i = 0; i < db_lin.n; i++) {
      c_lin++;
      if (strcmp(db_lin.record[i].key, key) == 0) break;
    }
    int low = 0, high = db_lin.n - 1;
    while (low <= high) {
      int mid = (low + high) / 2;
      c_bin++;
      int r = strcmp(db_lin.record[mid].key, key);
      if (r == 0) break;
      else if (r < 0) low = mid + 1;
      else high = mid - 1;
    }
    int h = db_hash_f(key), cnt = 0;
    while (cnt < MAX_RECORDS) {
      c_hash++;
      if (db_hash.record[h].data == NULL) break;
      if (strcmp(db_hash.record[h].key, key) == 0) break;
      h = (h + 1) % MAX_RECORDS;
      cnt++;
    }
    printf("%s %d %d %d\\n", key, c_lin, c_bin, c_hash);
  }
  db_delete(&db_lin); db_delete(&db_hash);
  return 0;
}
"""
    stdin_keys = "\n".join(keys) + "\n"
    timing = {"keys": [
        {"key": "AAC", "desc": "先頭 (1番目)"},
        {"key": "CXI", "desc": "500番目"},
        {"key": "IYK", "desc": "1000番目"},
        {"key": "MVD", "desc": "1500番目"},
        {"key": "SJW", "desc": "2000番目"},
        {"key": "YFB", "desc": "2500番目"},
        {"key": "ZYL", "desc": "最後 (2700番目)"},
        {"key": "AAA", "desc": "存在しない (先頭より前)"},
        {"key": "LLL", "desc": "存在しない (中央付近)"},
        {"key": "ZZZ", "desc": "存在しない (末尾より後)"},
    ]}
    with tempfile.TemporaryDirectory() as d:
        with open(os.path.join(d, "iata_data.csv"), "w") as f:
            f.write(full_csv)
        with open(os.path.join(d, "iata_db.h"), "w") as f:
            f.write(IATA_DB_H_FULL_GCC)
        with open(os.path.join(d, "iata_db.c"), "w") as f:
            f.write(IATA_DB_COMPLETE)
        with open(os.path.join(d, "bench.c"), "w") as f:
            f.write(bench_c)
        with open(os.path.join(d, "cmp.c"), "w") as f:
            f.write(cmp_c)
        with open(os.path.join(d, "iata_db2.h"), "w") as f:
            f.write(IATA_DB2_H_FULL_GCC)
        with open(os.path.join(d, "iata_db2.c"), "w") as f:
            f.write(IATA_DB2_SOL)
        with open(os.path.join(d, "bench_open.c"), "w") as f:
            f.write(bench_open_c)

        for opt_tag, flag in [("O0", "-O0"), ("O2", "-O2")]:
            exe = os.path.join(d, f"bench_{opt_tag}")
            subprocess.run(["gcc", flag, "-o", exe, "bench.c", "iata_db.c"], cwd=d, check=True)
            for mode, mname, rep in [(0, "lin", 100000), (1, "bin", 2000000), (2, "hash", 2000000)]:
                r = subprocess.run([exe, str(mode), str(rep)], cwd=d, input=stdin_keys.encode(), capture_output=True, check=True)
                tbl = {}
                for ln in r.stdout.decode().strip().splitlines():
                    k, sec, hit = ln.split()
                    tbl[k] = round(float(sec), 6)
                timing[f"{mname}_{opt_tag}"] = tbl
                print(f"bench {mname}_{opt_tag}:", tbl)

            exe_op = os.path.join(d, f"bench_open_{opt_tag}")
            subprocess.run(["gcc", flag, "-o", exe_op, "bench_open.c", "iata_db2.c"], cwd=d, check=True)
            r = subprocess.run([exe_op, "2000000"], cwd=d, input=stdin_keys.encode(), capture_output=True, check=True)
            tbl = {}
            for ln in r.stdout.decode().strip().splitlines():
                k, sec, _ = ln.split()
                tbl[k] = round(float(sec), 6)
            timing[f"open_{opt_tag}"] = tbl
            print(f"bench open_{opt_tag}:", tbl)

        exe_cmp = os.path.join(d, "cmp_out")
        subprocess.run(["gcc", "-O2", "-o", exe_cmp, "cmp.c", "iata_db.c"], cwd=d, check=True)
        r = subprocess.run([exe_cmp], cwd=d, input=stdin_keys.encode(), capture_output=True, check=True)
        cmps = {}
        for ln in r.stdout.decode().strip().splitlines():
            k, cl, cb, ch = ln.split()
            cmps[k] = [int(cl), int(cb), int(ch)]
        timing["cmps"] = cmps
        print("cmps (linear, binary, closed_hash):", cmps)
    return timing


def main():
    full_csv = build_iata_2700_csv()
    exp = {}

    # 8-1: iata_test1.c + iata_db.c (mini) -> test1-exp.txt
    exp["test1_exp"] = run_gcc(
        {"iata_mini.csv": IATA_MINI_CSV, "iata_db.h": IATA_DB_H_MINI, "iata_db.c": IATA_DB_COMPLETE, "iata_test1.c": GIVEN["iata_test1.c"]},
        ["iata_test1.c", "iata_db.c"],
    )
    print("=== test1-exp.txt ===")
    print(exp["test1_exp"])

    # 8-2: iata_test2.c (mini -> test2-exp.txt, full -> test2-exp2.txt)
    exp["test2_exp"] = run_gcc(
        {"iata_mini.csv": IATA_MINI_CSV, "iata_db.h": IATA_DB_H_MINI, "iata_db.c": IATA_DB_COMPLETE, "iata_test2.c": GIVEN["iata_test2.c"]},
        ["iata_test2.c", "iata_db.c"],
        TEST2_IN,
    )
    exp["test2_exp2"] = run_gcc(
        {"iata_data.csv": full_csv, "iata_db.h": IATA_DB_H_FULL_GCC, "iata_db.c": IATA_DB_COMPLETE, "iata_test2.c": GIVEN["iata_test2.c"]},
        ["iata_test2.c", "iata_db.c"],
        TEST2_IN,
    )
    # Verify subset CSV produces the EXACT SAME test2-exp2.txt!
    exp_sub = run_gcc(
        {"iata_data.csv": IATA_SUB_CSV, "iata_db.h": IATA_DB_H_SUB, "iata_db.c": IATA_DB_COMPLETE, "iata_test2.c": GIVEN["iata_test2.c"]},
        ["iata_test2.c", "iata_db.c"],
        TEST2_IN,
    )
    assert exp_sub == exp["test2_exp2"], f"Mismatch:\n{exp_sub}\nvs\n{exp['test2_exp2']}"
    print("=== test2-exp2.txt verified identical between 2700-entry and subset! ===")
    print(exp["test2_exp2"])

    # Verify 8-4 binary search matches both mini and full!
    out4_mini = run_gcc(
        {"iata_mini.csv": IATA_MINI_CSV, "iata_db.h": IATA_DB_H_MINI, "iata_db.c": IATA_DB_COMPLETE, "iata_test4.c": GIVEN["iata_test4.c"]},
        ["iata_test4.c", "iata_db.c"],
        TEST2_IN,
    )
    out4_full = run_gcc(
        {"iata_data.csv": full_csv, "iata_db.h": IATA_DB_H_FULL_GCC, "iata_db.c": IATA_DB_COMPLETE, "iata_test4.c": GIVEN["iata_test4.c"]},
        ["iata_test4.c", "iata_db.c"],
        TEST2_IN,
    )
    assert out4_mini == exp["test2_exp"]
    assert out4_full == exp["test2_exp2"]

    # 8-6(1): iata_test6a.c (mini -> test6-exp.txt)
    exp["test6_exp"] = run_gcc(
        {"iata_mini.csv": IATA_MINI_CSV, "iata_db.h": IATA_DB_H_MINI, "iata_db.c": IATA_DB_COMPLETE, "iata_test6a.c": GIVEN["iata_test6a.c"]},
        ["iata_test6a.c", "iata_db.c"],
    )
    print("=== test6-exp.txt ===")
    print(exp["test6_exp"])

    # Verify 8-6(2) hash search matches both mini and full!
    out6b_mini = run_gcc(
        {"iata_mini.csv": IATA_MINI_CSV, "iata_db.h": IATA_DB_H_MINI, "iata_db.c": IATA_DB_COMPLETE, "iata_test6b.c": GIVEN["iata_test6b.c"]},
        ["iata_test6b.c", "iata_db.c"],
        TEST2_IN,
    )
    out6b_full = run_gcc(
        {"iata_data.csv": full_csv, "iata_db.h": IATA_DB_H_FULL_GCC, "iata_db.c": IATA_DB_COMPLETE, "iata_test6b.c": GIVEN["iata_test6b.c"]},
        ["iata_test6b.c", "iata_db.c"],
        TEST2_IN,
    )
    assert out6b_mini == exp["test2_exp"]
    assert out6b_full == exp["test2_exp2"]

    # Verify cpu_in output
    exp["cpu_exp"] = run_gcc(
        {"iata_data.csv": full_csv, "iata_db.h": IATA_DB_H_FULL_GCC, "iata_db.c": IATA_DB_COMPLETE, "iata_cpu1.c": CPU1_SOL},
        ["iata_cpu1.c", "iata_db.c"],
        CPU_IN,
    )
    exp_cpu_sub = run_gcc(
        {"iata_data.csv": IATA_SUB_CSV, "iata_db.h": IATA_DB_H_SUB, "iata_db.c": IATA_DB_COMPLETE, "iata_cpu1.c": CPU1_SOL},
        ["iata_cpu1.c", "iata_db.c"],
        CPU_IN,
    )
    assert exp_cpu_sub == exp["cpu_exp"]

    # Verify Option 8-1 (open hash) on both 2700-entry and subset!
    out_opt_full = run_gcc(
        {"iata_data.csv": full_csv, "iata_db2.h": IATA_DB2_H_FULL_GCC, "iata_db2.c": IATA_DB2_SOL, "iata_test9.c": GIVEN["iata_test9.c"]},
        ["iata_test9.c", "iata_db2.c"],
        TEST2_IN,
    )
    out_opt_sub = run_gcc(
        {"iata_data.csv": IATA_SUB_CSV, "iata_db2.h": IATA_DB2_H_SUB, "iata_db2.c": IATA_DB2_SOL, "iata_test9.c": GIVEN["iata_test9.c"]},
        ["iata_test9.c", "iata_db2.c"],
        TEST2_IN,
    )
    assert out_opt_full == exp["test2_exp2"]
    assert out_opt_sub == exp["test2_exp2"]

    timing = measure_b8_timing(full_csv)

    data = {
        "sol": SOL,
        "given": GIVEN,
        "exp": exp,
        "inp": INP,
        "start": STARTERS,
        "timing": timing,
    }
    out_path = "/home/user/webapp/public/static/js/units/b8-data.js"
    with open(out_path, "w") as f:
        f.write("/* 自動生成 (tools/gen_b8.py): gcc で検証済みの模範解答・配布ファイル・期待値・2700件実測値 */\n")
        f.write("window.B8_DATA = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n")
    print("Wrote", out_path, os.path.getsize(out_path), "bytes")


if __name__ == "__main__":
    main()
