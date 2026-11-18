#!/usr/bin/env python3
"""
gen_b7.py — B7 ソーティングのデータ生成スクリプト
配布資料「[B7] ソーティング」の全課題 (7-1〜7-8, オプション 7-1, 7-2) を
gcc でコンパイル・実行・実測し, public/static/js/units/b7-data.js を生成する。
"""
import json, os, subprocess, tempfile

GIVEN = {
    "swapmin_test.c": """#include <stdio.h>
#include <assert.h>
#define MAX_N 64
#define MAX_REPEAT 10
void swapmin(int n, double *a, int k);

int array_scan(double *a)
/* 整数 n を読み込み,
   続いて n 個のデータを a[0]〜a[n-1] に読み込み,
   最後に n を返す */
{
  int i;
  int n;
  fprintf(stderr, "n = ");
  scanf("%d",&n);
  assert(n<=MAX_N);
  for (i=0; i<n; i++) {
    fprintf(stderr, "[%d] : ", i);
    scanf("%lf", &a[i]);
  }
  return n;
}

void array_print(int n, double *a)
/* a[0]〜a[n-1] の値を表示する */
{
  int i;
  for (i=0; i<n; i++) {
    printf("[%d] %10.5f\\n", i, a[i]);
  }
}

int main(void)
{
  int n;
  int k;
  int i;
  double a[MAX_N];
  n = array_scan(a);
  array_print(n, a);
  /* k を入力し, swapmin(n, a , k) を呼び出す,
     という操作を繰り返す */
  for (i=0; i<MAX_REPEAT; i++) {
    fprintf(stderr, "k = ");
    if (scanf("%d",&k)==EOF) { break; }
    swapmin(n, a, k);
    printf("swapmin(n, a, %d)\\n", k);
    array_print(n, a);
  }
  return 0;
}
""",
    "sort_test.c": """#include <stdio.h>
#include <assert.h>
#define MAX_N 64

void sort(int n, double *a);

int array_scan(double *a)
{
  int i;
  int n;
  fprintf(stderr, "n = ");
  if (scanf("%d",&n)==EOF) { n = 0; }
  if (n != 0) {
    assert(0<n && n<=MAX_N);
    for (i=0; i<n; i++) {
      fprintf(stderr, "[%d] : ", i);
      scanf("%lf", &a[i]);
    }
  }
  return n;
}

void array_print(int n, double *a)
{
  int i;
  for (i=0; i<n; i++) {
    printf(" %0.1f", a[i]);
  }
  printf("\\n");
}

int main(void)
{
  int n;
  double a[MAX_N];
  while ( 0 < (n = array_scan(a)) ) {
    sort(n, a);
    array_print(n, a);
  }
  return 0;
}
""",
    "insert_test.c": """#include <stdio.h>
#include <assert.h>
#define MAX_N 64
#define MAX_REPEAT 10
void insert(int n, double *a, int k);

int array_scan(double *a)
{
  int i;
  int n;
  fprintf(stderr, "n = ");
  scanf("%d",&n);
  assert(n<=MAX_N);
  for (i=0; i<n; i++) {
    fprintf(stderr, "[%d] : ", i);
    scanf("%lf", &a[i]);
  }
  return n;
}

void array_print(int n, double *a)
{
  int i;
  for (i=0; i<n; i++) {
    printf("[%d] %10.5f\\n", i, a[i]);
  }
}

int main(void)
{
  int n;
  int k;
  int i;
  double a[MAX_N];
  n = array_scan(a);
  array_print(n, a);
  for (i=0; i<MAX_REPEAT; i++) {
    fprintf(stderr, "k = ");
    if (scanf("%d",&k)==EOF) { break; }
    insert(n, a, k);
    printf("insert(n, a, %d)\\n", k);
    array_print(n, a);
  }
  return 0;
}
""",
    "string_sort.h": """#define STRLEN 63
#define STRFMT "%63s"
void string_sort(int n, char (*a)[STRLEN+1]);
""",
    "string_sort_test.c": """#include <stdio.h>
#include <string.h>
#include <assert.h>
#include "string_sort.h"
#define MAX_N 64

int string_array_scan(char (*a)[STRLEN+1])
{
  int i;
  int n;
  fprintf(stderr, "n = ");
  scanf("%d",&n);
  assert(n<=MAX_N);
  for (i=0; i<n; i++) {
    fprintf(stderr, "[%d] : ", i);
    scanf(STRFMT, a[i]);
  }
  return n;
}

void string_array_print(int n, char (*a)[STRLEN+1])
{
  int i;
  for (i=0; i<n; i++) {
    printf("%s\\n", a[i]);
  }
}

int main(void)
{
  int n;
  char a[MAX_N][STRLEN+1];
  n = string_array_scan(a);
  string_sort(n, a);
  string_array_print(n, a);
  return 0;
}
""",
    "str_sort.h": """#define STRLEN 63
#define STRFMT "%63s"

typedef struct {
  char name[STRLEN+1];
  int age;
  double stature;
} record_t;
void str_sort(int n, record_t *a);
""",
    "str_sort_test.c": """#include <stdio.h>
#include <string.h>
#include <assert.h>
#include "str_sort.h"
#define MAX_N 64

int str_array_scan(record_t a[])
{
  int i;
  int n;
  fprintf(stderr, "n = ");
  scanf("%d",&n);
  assert(n<=MAX_N);
  for (i=0; i<n; i++) {
    fprintf(stderr, "[%d].name : ", i);
    scanf(STRFMT, a[i].name);
    fprintf(stderr, "[%d].age : ", i);
    scanf("%d", &a[i].age);
    fprintf(stderr, "[%d].stature : ", i);
    scanf("%lf", &a[i].stature);
  }
  return n;
}

void str_array_print(int n, record_t a[])
{
  int i;
  for (i=0; i<n; i++) {
    printf("%-10s", a[i].name);
    printf("%3d", a[i].age);
    printf("%7.2f", a[i].stature);
    printf("\\n");
  }
}

int main(void)
{
  int n;
  record_t a[MAX_N];

  n = str_array_scan(a);
  str_sort(n, a);
  str_array_print(n, a);
  return 0;
}
""",
}

STARTERS = {
    "swapmin.c": """void swapmin(int n, double *a, int k)
{
  /* a[k]〜a[n-1] の最小値 a[min] を探し, a[k] と交換する */
}
""",
    "selection_sort.c": """void sort(int n, double *a)
{
  /* 単純選択法: k = 0 〜 n-2 について swapmin 相当の処理を行う */
}
""",
    "insert.c": """void insert(int n, double *a, int k)
{
  /* i = k から左へ比較・交換を繰り返し, a[k] を適切な位置に挿入する */
}
""",
    "insertion_sort.c": """void sort(int n, double *a)
{
  /* 単純挿入法: k = 1 〜 n-1 について insert 相当の処理を行う */
}
""",
    "sort_cpu.c": """#include <stdio.h>
#include <stdlib.h>
#include <time.h> /* 時間計測に必要 */
#include <assert.h>
#define MIN_N 2 /* 完成後にもっと大きくする */
#define MAX_N 8 /* 完成後にもっと大きくする */
#define N_TEST 8

void sort(int n, double *a);

void array_set_rand(int n, double *a)
{
  /* a[0]〜a[n-1] に乱数のデータをセットする */
}

void array_set_sorted(int n, double *a)
{
  /* a[0]〜a[n-1] に正順 (0, 1, ..., n-1) のデータをセットする */
}

void array_set_reverse(int n, double *a)
{
  /* a[0]〜a[n-1] に逆順 (n, n-1, ..., 1) のデータをセットする */
}

void array_copy(int n, double *a, double *r)
{
  /* r[0]〜r[n-1] から a[0]〜a[n-1] にデータコピーする */
}

void sort_check(int n, double *a)
{
  int i;
  for (i=0; i<n-1; i++) {
    if (a[i]<=a[i+1]) {
      ; /* OK */
    }
    else {
      /* データが (a[i] と a[i+1] が) 昇順に並んでいない */
      fprintf(stderr, "sort error (a[%d]=%0.10f, a[%d]=%0.10f)\\n", i, a[i], i+1, a[i+1]);
      exit(1);
    }
  }
}

void sort_cpu(double *r)
{
  int n;
  int i;
  double *a;
  /* 初期データがちゃんと生成されているかの確認用 */
  for (i=0; i<N_TEST; i++) {
    printf("%18.5f\\n", r[i]);
  }
  /** ここを埋めて関数を完成させよ **/
}

int main(void)
{
  double *r;

  r = malloc(sizeof(double)*MAX_N);
  if (r==NULL) {
    fprintf(stderr, "malloc に失敗 (MAX_N = %d)\\n", MAX_N);
    exit(1);
  }
  printf("乱数\\n");
  array_set_rand(MAX_N, r);
  sort_cpu(r);
  printf("正順\\n");
  array_set_sorted(MAX_N, r);
  sort_cpu(r);

  printf("逆順\\n");
  array_set_reverse(MAX_N, r);
  sort_cpu(r);

  free(r);
  r = NULL;
  return 0;
}
""",
    "quick_sort.c": """void sort(int n, double *a)
{
  /* クイックソート: p = a[0] で分割し, 前半と後半を再帰的に sort する */
}
""",
    "string_sort.c": """#include <string.h>
#include "string_sort.h"

void string_sort(int n, char (*a)[STRLEN+1])
{
  /* 文字列の配列 a[0]〜a[n-1] を辞書順 (strcmp) にソートする */
}
""",
    "str_sort.c": """#include <string.h>
#include "str_sort.h"

void str_sort(int n, record_t *a)
{
  /* age の昇順, age が等しければ stature の昇順にソートする */
}
""",
    "bucket_sort.c": """#include <stdio.h>
#include <stdlib.h>

void sort(int n, double *a)
{
  /* バケツ法 (bucket sort): 区間を m = n/B 等分し, 各バケツをソートして連結 */
}
""",
    "dc_sort.c": """#include <stdio.h>
#include <stdlib.h>

void sort(int n, double *a)
{
  /* 頻度法 (distribution counting sort): c と d で格納先を決めて b に並べ, 最後に単純挿入法 */
}
""",
}

SOL = {
    "7-1": {
        "swapmin.c": """void swapmin(int n, double *a, int k)
{
  int i, min = k;
  double tmp;
  for (i = k + 1; i < n; i++) {
    if (a[i] < a[min]) {
      min = i;
    }
  }
  tmp = a[k];
  a[k] = a[min];
  a[min] = tmp;
}
"""
    },
    "7-2": {
        "selection_sort.c": """void sort(int n, double *a)
{
  int k, i, min;
  double tmp;
  for (k = 0; k <= n - 2; k++) {
    min = k;
    for (i = k + 1; i < n; i++) {
      if (a[i] < a[min]) {
        min = i;
      }
    }
    tmp = a[k];
    a[k] = a[min];
    a[min] = tmp;
  }
}
"""
    },
    "7-3": {
        "insert.c": """void insert(int n, double *a, int k)
{
  int i;
  double tmp;
  (void)n;
  for (i = k; 1 <= i; i--) {
    if (a[i - 1] <= a[i]) {
      break;
    }
    tmp = a[i];
    a[i] = a[i - 1];
    a[i - 1] = tmp;
  }
}
"""
    },
    "7-4": {
        "insertion_sort.c": """void sort(int n, double *a)
{
  int k, i;
  double tmp;
  for (k = 1; k <= n - 1; k++) {
    for (i = k; 1 <= i; i--) {
      if (a[i - 1] <= a[i]) {
        break;
      }
      tmp = a[i];
      a[i] = a[i - 1];
      a[i - 1] = tmp;
    }
  }
}
"""
    },
    "7-5": {
        "sort_cpu.c": """#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <assert.h>
#define MIN_N 2
#define MAX_N 8
#define N_TEST 8

void sort(int n, double *a);

void array_set_rand(int n, double *a)
{
  int i;
  for (i = 0; i < n; i++) {
    a[i] = rand();
  }
}

void array_set_sorted(int n, double *a)
{
  int i;
  for (i = 0; i < n; i++) {
    a[i] = i;
  }
}

void array_set_reverse(int n, double *a)
{
  int i;
  for (i = 0; i < n; i++) {
    a[i] = n - i;
  }
}

void array_copy(int n, double *a, double *r)
{
  int i;
  for (i = 0; i < n; i++) {
    a[i] = r[i];
  }
}

void sort_check(int n, double *a)
{
  int i;
  for (i = 0; i < n - 1; i++) {
    if (a[i] <= a[i + 1]) {
      ;
    }
    else {
      fprintf(stderr, "sort error (a[%d]=%0.10f, a[%d]=%0.10f)\\n", i, a[i], i + 1, a[i + 1]);
      exit(1);
    }
  }
}

void sort_cpu(double *r)
{
  int n;
  int i;
  double *a;
  clock_t clk_start, clk_end;

  for (i = 0; i < N_TEST; i++) {
    printf("%18.5f\\n", r[i]);
  }
  a = malloc(sizeof(double) * MAX_N);
  if (a == NULL) {
    fprintf(stderr, "malloc に失敗 (MAX_N = %d)\\n", MAX_N);
    exit(1);
  }
  for (n = MIN_N; n <= MAX_N; n *= 2) {
    printf("n = %9d ", n);
    array_copy(n, a, r);
    clk_start = clock();
    sort(n, a);
    clk_end = clock();
    sort_check(n, a);
    printf("cpu = %11.6f [sec]\\n", (double)(clk_end - clk_start) / CLOCKS_PER_SEC);
  }
  free(a);
  a = NULL;
}

int main(void)
{
  double *r;

  r = malloc(sizeof(double) * MAX_N);
  if (r == NULL) {
    fprintf(stderr, "malloc に失敗 (MAX_N = %d)\\n", MAX_N);
    exit(1);
  }
  printf("乱数\\n");
  array_set_rand(MAX_N, r);
  sort_cpu(r);
  printf("正順\\n");
  array_set_sorted(MAX_N, r);
  sort_cpu(r);
  printf("逆順\\n");
  array_set_reverse(MAX_N, r);
  sort_cpu(r);

  free(r);
  r = NULL;
  return 0;
}
"""
    },
    "7-6": {
        "quick_sort.c": """void sort(int n, double *a)
{
  int l = 0;
  int r = n - 1;
  double p = a[0];
  double tmp;

  while (l <= r) {
    while (a[l] < p) { l++; }
    while (a[r] > p) { r--; }
    if (l <= r) {
      tmp = a[l];
      a[l] = a[r];
      a[r] = tmp;
      l++;
      r--;
    }
  }
  if (0 < r) {
    sort(r + 1, a);
  }
  if (l < n - 1) {
    sort(n - l, &a[l]);
  }
}
"""
    },
    "7-7": {
        "string_sort.c": """#include <string.h>
#include "string_sort.h"

void string_sort(int n, char (*a)[STRLEN+1])
{
  int k, i, min;
  char tmp[STRLEN+1];
  for (k = 0; k <= n - 2; k++) {
    min = k;
    for (i = k + 1; i < n; i++) {
      if (strcmp(a[i], a[min]) < 0) {
        min = i;
      }
    }
    strcpy(tmp, a[k]);
    strcpy(a[k], a[min]);
    strcpy(a[min], tmp);
  }
}
"""
    },
    "7-8": {
        "str_sort.c": """#include <string.h>
#include "str_sort.h"

void str_sort(int n, record_t *a)
{
  int k, i, min;
  record_t tmp;
  for (k = 0; k <= n - 2; k++) {
    min = k;
    for (i = k + 1; i < n; i++) {
      if (a[i].age < a[min].age ||
          (a[i].age == a[min].age && a[i].stature < a[min].stature)) {
        min = i;
      }
    }
    tmp = a[k];
    a[k] = a[min];
    a[min] = tmp;
  }
}
"""
    },
    "o7-1": {
        "bucket_sort.c": """#include <stdio.h>
#include <stdlib.h>

static void ins_sort(int n, double *a)
{
  int k, i;
  double tmp;
  for (k = 1; k < n; k++) {
    for (i = k; i >= 1 && a[i - 1] > a[i]; i--) {
      tmp = a[i];
      a[i] = a[i - 1];
      a[i - 1] = tmp;
    }
  }
}

void sort(int n, double *a)
{
  int i, j, idx, m;
  double min, max, range;
  int *cnt, *pos;
  double **b;

  if (n <= 1) return;
  min = a[0];
  max = a[0];
  for (i = 1; i < n; i++) {
    if (a[i] < min) min = a[i];
    if (a[i] > max) max = a[i];
  }
  if (max == min) return;

  m = n / 16;
  if (m < 1) m = 1;
  range = max - min;

  cnt = malloc(sizeof(int) * m);
  pos = malloc(sizeof(int) * m);
  b = malloc(sizeof(double *) * m);
  if (cnt == NULL || pos == NULL || b == NULL) exit(1);

  for (i = 0; i < m; i++) {
    cnt[i] = 0;
    pos[i] = 0;
  }
  for (i = 0; i < n; i++) {
    idx = (int)((a[i] - min) / range * m);
    if (idx >= m) idx = m - 1;
    if (idx < 0) idx = 0;
    cnt[idx]++;
  }
  for (i = 0; i < m; i++) {
    if (cnt[i] > 0) {
      b[i] = malloc(sizeof(double) * cnt[i]);
      if (b[i] == NULL) exit(1);
    } else {
      b[i] = NULL;
    }
  }
  for (i = 0; i < n; i++) {
    idx = (int)((a[i] - min) / range * m);
    if (idx >= m) idx = m - 1;
    if (idx < 0) idx = 0;
    b[idx][pos[idx]] = a[i];
    pos[idx]++;
  }
  idx = 0;
  for (i = 0; i < m; i++) {
    if (cnt[i] > 1) ins_sort(cnt[i], b[i]);
    for (j = 0; j < cnt[i]; j++) {
      a[idx++] = b[i][j];
    }
    if (b[i] != NULL) free(b[i]);
  }
  free(b);
  free(pos);
  free(cnt);
}
"""
    },
    "o7-2": {
        "dc_sort.c": """#include <stdio.h>
#include <stdlib.h>

void sort(int n, double *a)
{
  int i, k, idx, m;
  double min, max, range, tmp;
  int *c, *d;
  double *b;

  if (n <= 1) return;
  min = a[0];
  max = a[0];
  for (i = 1; i < n; i++) {
    if (a[i] < min) min = a[i];
    if (a[i] > max) max = a[i];
  }
  if (max == min) return;

  m = n / 16;
  if (m < 1) m = 1;
  range = max - min;

  c = malloc(sizeof(int) * m);
  d = malloc(sizeof(int) * m);
  b = malloc(sizeof(double) * n);
  if (c == NULL || d == NULL || b == NULL) exit(1);

  for (i = 0; i < m; i++) c[i] = 0;
  for (i = 0; i < n; i++) {
    idx = (int)((a[i] - min) / range * m);
    if (idx >= m) idx = m - 1;
    if (idx < 0) idx = 0;
    c[idx]++;
  }
  d[0] = 0;
  for (i = 0; i < m - 1; i++) {
    d[i + 1] = d[i] + c[i];
  }
  for (i = 0; i < n; i++) {
    idx = (int)((a[i] - min) / range * m);
    if (idx >= m) idx = m - 1;
    if (idx < 0) idx = 0;
    b[d[idx]] = a[i];
    d[idx]++;
  }
  for (i = 0; i < n; i++) a[i] = b[i];

  /* だいたい整列されているので単純挿入法で O(n) で仕上げ */
  for (k = 1; k < n; k++) {
    for (i = k; i >= 1 && a[i - 1] > a[i]; i--) {
      tmp = a[i];
      a[i] = a[i - 1];
      a[i - 1] = tmp;
    }
  }

  free(b);
  free(d);
  free(c);
}
"""
    },
}

SOL["7-5"]["selection_sort.c"] = SOL["7-2"]["selection_sort.c"]

SORT_IN_TXT = """4 -0.1 1.1 0 3.1
4 -0.1 1.1 3.1 0
4 -0.1 0 1.1 3.1
4 -0.1 0 3.1 1.1
4 -0.1 3.1 1.1 0
4 -0.1 3.1 0 1.1
4 1.1 -0.1 0 3.1
4 1.1 -0.1 3.1 0
4 1.1 0 -0.1 3.1
4 1.1 0 3.1 -0.1
4 1.1 3.1 -0.1 0
4 1.1 3.1 0 -0.1
4 0 -0.1 1.1 3.1
4 0 -0.1 3.1 1.1
4 0 1.1 -0.1 3.1
4 0 1.1 3.1 -0.1
4 0 3.1 -0.1 1.1
4 0 3.1 1.1 -0.1
4 3.1 -0.1 1.1 0
4 3.1 -0.1 0 1.1
4 3.1 1.1 -0.1 0
4 3.1 1.1 0 -0.1
4 3.1 0 -0.1 1.1
4 3.1 0 1.1 -0.1
4 -0.1 -0.1 1.1 0
4 -0.1 -0.1 0 1.1
4 -0.1 1.1 0 -0.1
4 -0.1 1.1 -0.1 0
4 -0.1 0 -0.1 1.1
4 -0.1 0 1.1 -0.1
4 1.1 -0.1 -0.1 0
4 1.1 -0.1 0 -0.1
4 1.1 0 -0.1 -0.1
4 0 -0.1 -0.1 1.1
4 0 -0.1 1.1 -0.1
4 0 1.1 -0.1 -0.1
4 -0.1 -0.1 1.1 1.1
4 -0.1 1.1 -0.1 1.1
4 -0.1 1.1 1.1 -0.1
4 1.1 -0.1 -0.1 1.1
4 1.1 -0.1 1.1 -0.1
4 1.1 1.1 -0.1 -0.1
4 -0.1 -0.1 -0.1 1.1
4 -0.1 1.1 -0.1 -0.1
4 -0.1 -0.1 1.1 -0.1
4 -0.1 -0.1 -0.1 1.1
4 -0.1 -0.1 -0.1 -0.1
16 0.4 1.6 0.1 1.1 0.8 1.4 0.7 0.6 0.9 1.0 1.2 0.5 0.2 1.3 1.5 0.3
16 1.4 0.6 0.1 0.9 0.8 1.0 0.5 1.3 1.6 1.5 0.7 1.2 0.4 1.1 0.3 0.2
16 1.3 0.9 0.1 1.2 0.6 1.5 1.1 0.4 1.0 0.7 0.5 0.3 1.4 0.8 0.2 1.6
"""

INP = {
    "sw1": "5\n5 4 3 2 1\n0\n",
    "sw2": "5\n5 4 3 1 2\n1\n",
    "sw3": "5\n6 2 4 9 8\n0 1 2 3\n",
    "so_hand": "5\n1 2 3 4 5\n5\n5 4 3 2 1\n3\n0.3 0.2 0.1\n",
    "so_full": SORT_IN_TXT,
    "in1": "5\n2 4 6 8 5\n4\n",
    "in2": "5\n3 4 6 2 1\n3\n",
    "in3": "5\n6 2 4 9 8\n1 2 3 4\n",
    "str1": "5\ntanaka\nyamada\nsuzuki\nyamamoto\nnakamura\n",
    "str2": "6\norange\napple\nbanana\napple\ncherry\ngrape\n",
    "rec1": """6
yamada 22 160.5
yamamoto 22 177.4
suzuki 21 165.3
tanaka 20 170.0
nakamura 22 179.7
nakamura 21 175.3
""",
    "rec2": """5
sato 19 172.0
ito 21 168.5
kato 19 165.0
watanabe 21 168.5
takahashi 18 180.2
""",
}


def run_gcc(files_map, compile_units, stdin="", flags=None):
    flags = flags or []
    with tempfile.TemporaryDirectory() as d:
        for fn, content in files_map.items():
            with open(os.path.join(d, fn), "w") as f:
                f.write(content)
        exe = os.path.join(d, "a.out")
        cmd = ["gcc", "-Wall", "-Wextra"] + flags + ["-o", exe] + [os.path.join(d, u) for u in compile_units] + ["-lm"]
        subprocess.run(cmd, check=True)
        r = subprocess.run([exe], input=stdin.encode(), capture_output=True, check=True)
        return r.stdout.decode()


def measure_timing():
    """gcc (-O0 / -O2) で sort_cpu を実測 (n = 2048 〜 65536 or 131072)"""
    bench_driver = """#include <stdio.h>
#include <stdlib.h>
#include <time.h>

void sort(int n, double *a);

static void set_rand(int n, double *a) { int i; for (i=0; i<n; i++) a[i] = rand(); }
static void set_sorted(int n, double *a) { int i; for (i=0; i<n; i++) a[i] = i; }
static void set_rev(int n, double *a) { int i; for (i=0; i<n; i++) a[i] = n - i; }
static void copy_arr(int n, double *a, double *r) { int i; for (i=0; i<n; i++) a[i] = r[i]; }

int main(int argc, char **argv)
{
  int max_n = argc > 1 ? atoi(argv[1]) : 32768;
  double *r = malloc(sizeof(double) * max_n);
  double *a = malloc(sizeof(double) * max_n);
  int kind, n;
  for (kind = 0; kind < 3; kind++) {
    srand(1);
    if (kind == 0) set_rand(max_n, r);
    else if (kind == 1) set_sorted(max_n, r);
    else set_rev(max_n, r);
    for (n = 2048; n <= max_n; n *= 2) {
      clock_t t0, t1;
      copy_arr(n, a, r);
      t0 = clock();
      sort(n, a);
      t1 = clock();
      printf("%d %d %.6f\\n", kind, n, (double)(t1 - t0) / CLOCKS_PER_SEC);
    }
  }
  free(a); free(r);
  return 0;
}
"""
    timing = {}
    configs = [
        ("sel_O0", SOL["7-2"]["selection_sort.c"], ["-O0"], 32768),
        ("sel_O2", SOL["7-2"]["selection_sort.c"], ["-O2"], 65536),
        ("ins_O0", SOL["7-4"]["insertion_sort.c"], ["-O0"], 32768),
        ("ins_O2", SOL["7-4"]["insertion_sort.c"], ["-O2"], 65536),
        ("quick_O2", SOL["7-6"]["quick_sort.c"], ["-O2"], 65536),
        ("bucket_O2", SOL["o7-1"]["bucket_sort.c"], ["-O2"], 65536),
        ("dc_O2", SOL["o7-2"]["dc_sort.c"], ["-O2"], 65536),
    ]
    with tempfile.TemporaryDirectory() as d:
        with open(os.path.join(d, "bench.c"), "w") as f:
            f.write(bench_driver)
        for key, impl_src, flags, max_n in configs:
            with open(os.path.join(d, "impl.c"), "w") as f:
                f.write(impl_src)
            exe = os.path.join(d, "b_" + key)
            subprocess.run(["gcc"] + flags + ["-o", exe, os.path.join(d, "bench.c"), os.path.join(d, "impl.c")], check=True)
            # stack ulimit raised for quick_sort on sorted/reverse data (depth ~65536)
            r = subprocess.run(["bash", "-c", f"ulimit -s unlimited 2>/dev/null || ulimit -s 65536; {exe} {max_n}"], capture_output=True, check=True)
            tbl = {}
            for line in r.stdout.decode().strip().splitlines():
                k_s, n_s, sec_s = line.split()
                tbl.setdefault(n_s, [0.0, 0.0, 0.0])[int(k_s)] = round(float(sec_s), 6)
            timing[key] = tbl
            print("bench", key, tbl)
    return timing


def main():
    exp = {}
    exp["sw1"] = run_gcc({**GIVEN, **SOL["7-1"]}, ["swapmin_test.c", "swapmin.c"], INP["sw1"])
    exp["sw2"] = run_gcc({**GIVEN, **SOL["7-1"]}, ["swapmin_test.c", "swapmin.c"], INP["sw2"])
    exp["sw3"] = run_gcc({**GIVEN, **SOL["7-1"]}, ["swapmin_test.c", "swapmin.c"], INP["sw3"])

    exp["so_hand"] = run_gcc({**GIVEN, **SOL["7-2"]}, ["sort_test.c", "selection_sort.c"], INP["so_hand"])
    exp["so_full"] = run_gcc({**GIVEN, **SOL["7-2"]}, ["sort_test.c", "selection_sort.c"], INP["so_full"])

    # Verify insertion, quick, bucket, dc produce identical output on full test!
    for tid, fn in [("7-4", "insertion_sort.c"), ("7-6", "quick_sort.c"), ("o7-1", "bucket_sort.c"), ("o7-2", "dc_sort.c")]:
        out = run_gcc({**GIVEN, **SOL[tid]}, ["sort_test.c", fn], INP["so_full"])
        assert out == exp["so_full"], f"Mismatch in {tid}"

    exp["in1"] = run_gcc({**GIVEN, **SOL["7-3"]}, ["insert_test.c", "insert.c"], INP["in1"])
    exp["in2"] = run_gcc({**GIVEN, **SOL["7-3"]}, ["insert_test.c", "insert.c"], INP["in2"])
    exp["in3"] = run_gcc({**GIVEN, **SOL["7-3"]}, ["insert_test.c", "insert.c"], INP["in3"])

    exp["str1"] = run_gcc({**GIVEN, **SOL["7-7"]}, ["string_sort_test.c", "string_sort.c"], INP["str1"])
    exp["str2"] = run_gcc({**GIVEN, **SOL["7-7"]}, ["string_sort_test.c", "string_sort.c"], INP["str2"])

    exp["rec1"] = run_gcc({**GIVEN, **SOL["7-8"]}, ["str_sort_test.c", "str_sort.c"], INP["rec1"])
    exp["rec2"] = run_gcc({**GIVEN, **SOL["7-8"]}, ["str_sort_test.c", "str_sort.c"], INP["rec2"])

    # Also verify 7-5 runs cleanly in gcc
    out75 = run_gcc(SOL["7-5"], ["sort_cpu.c", "selection_sort.c"], "")
    assert "乱数" in out75 and "正順" in out75 and "逆順" in out75

    timing = measure_timing()

    data = {
        "sol": SOL,
        "given": GIVEN,
        "exp": exp,
        "inp": INP,
        "start": STARTERS,
        "timing": timing,
    }
    out_path = "/home/user/webapp/public/static/js/units/b7-data.js"
    with open(out_path, "w") as f:
        f.write("/* 自動生成 (tools/gen_b7.py): gcc で検証済みの模範解答・配布ファイル・期待値・計測値 */\n")
        f.write("window.B7_DATA = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n")
    print("Wrote", out_path, os.path.getsize(out_path), "bytes")


if __name__ == "__main__":
    main()
