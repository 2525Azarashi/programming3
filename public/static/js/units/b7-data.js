/* 自動生成 (tools/gen_b7.py): gcc で検証済みの模範解答・配布ファイル・期待値・計測値 */
window.B7_DATA = {
 "sol": {
  "7-1": {
   "swapmin.c": "void swapmin(int n, double *a, int k)\n{\n  int i, min = k;\n  double tmp;\n  for (i = k + 1; i < n; i++) {\n    if (a[i] < a[min]) {\n      min = i;\n    }\n  }\n  tmp = a[k];\n  a[k] = a[min];\n  a[min] = tmp;\n}\n"
  },
  "7-2": {
   "selection_sort.c": "void sort(int n, double *a)\n{\n  int k, i, min;\n  double tmp;\n  for (k = 0; k <= n - 2; k++) {\n    min = k;\n    for (i = k + 1; i < n; i++) {\n      if (a[i] < a[min]) {\n        min = i;\n      }\n    }\n    tmp = a[k];\n    a[k] = a[min];\n    a[min] = tmp;\n  }\n}\n"
  },
  "7-3": {
   "insert.c": "void insert(int n, double *a, int k)\n{\n  int i;\n  double tmp;\n  (void)n;\n  for (i = k; 1 <= i; i--) {\n    if (a[i - 1] <= a[i]) {\n      break;\n    }\n    tmp = a[i];\n    a[i] = a[i - 1];\n    a[i - 1] = tmp;\n  }\n}\n"
  },
  "7-4": {
   "insertion_sort.c": "void sort(int n, double *a)\n{\n  int k, i;\n  double tmp;\n  for (k = 1; k <= n - 1; k++) {\n    for (i = k; 1 <= i; i--) {\n      if (a[i - 1] <= a[i]) {\n        break;\n      }\n      tmp = a[i];\n      a[i] = a[i - 1];\n      a[i - 1] = tmp;\n    }\n  }\n}\n"
  },
  "7-5": {
   "sort_cpu.c": "#include <stdio.h>\n#include <stdlib.h>\n#include <time.h>\n#include <assert.h>\n#define MIN_N 2\n#define MAX_N 8\n#define N_TEST 8\n\nvoid sort(int n, double *a);\n\nvoid array_set_rand(int n, double *a)\n{\n  int i;\n  for (i = 0; i < n; i++) {\n    a[i] = rand();\n  }\n}\n\nvoid array_set_sorted(int n, double *a)\n{\n  int i;\n  for (i = 0; i < n; i++) {\n    a[i] = i;\n  }\n}\n\nvoid array_set_reverse(int n, double *a)\n{\n  int i;\n  for (i = 0; i < n; i++) {\n    a[i] = n - i;\n  }\n}\n\nvoid array_copy(int n, double *a, double *r)\n{\n  int i;\n  for (i = 0; i < n; i++) {\n    a[i] = r[i];\n  }\n}\n\nvoid sort_check(int n, double *a)\n{\n  int i;\n  for (i = 0; i < n - 1; i++) {\n    if (a[i] <= a[i + 1]) {\n      ;\n    }\n    else {\n      fprintf(stderr, \"sort error (a[%d]=%0.10f, a[%d]=%0.10f)\\n\", i, a[i], i + 1, a[i + 1]);\n      exit(1);\n    }\n  }\n}\n\nvoid sort_cpu(double *r)\n{\n  int n;\n  int i;\n  double *a;\n  clock_t clk_start, clk_end;\n\n  for (i = 0; i < N_TEST; i++) {\n    printf(\"%18.5f\\n\", r[i]);\n  }\n  a = malloc(sizeof(double) * MAX_N);\n  if (a == NULL) {\n    fprintf(stderr, \"malloc に失敗 (MAX_N = %d)\\n\", MAX_N);\n    exit(1);\n  }\n  for (n = MIN_N; n <= MAX_N; n *= 2) {\n    printf(\"n = %9d \", n);\n    array_copy(n, a, r);\n    clk_start = clock();\n    sort(n, a);\n    clk_end = clock();\n    sort_check(n, a);\n    printf(\"cpu = %11.6f [sec]\\n\", (double)(clk_end - clk_start) / CLOCKS_PER_SEC);\n  }\n  free(a);\n  a = NULL;\n}\n\nint main(void)\n{\n  double *r;\n\n  r = malloc(sizeof(double) * MAX_N);\n  if (r == NULL) {\n    fprintf(stderr, \"malloc に失敗 (MAX_N = %d)\\n\", MAX_N);\n    exit(1);\n  }\n  printf(\"乱数\\n\");\n  array_set_rand(MAX_N, r);\n  sort_cpu(r);\n  printf(\"正順\\n\");\n  array_set_sorted(MAX_N, r);\n  sort_cpu(r);\n  printf(\"逆順\\n\");\n  array_set_reverse(MAX_N, r);\n  sort_cpu(r);\n\n  free(r);\n  r = NULL;\n  return 0;\n}\n",
   "selection_sort.c": "void sort(int n, double *a)\n{\n  int k, i, min;\n  double tmp;\n  for (k = 0; k <= n - 2; k++) {\n    min = k;\n    for (i = k + 1; i < n; i++) {\n      if (a[i] < a[min]) {\n        min = i;\n      }\n    }\n    tmp = a[k];\n    a[k] = a[min];\n    a[min] = tmp;\n  }\n}\n"
  },
  "7-6": {
   "quick_sort.c": "void sort(int n, double *a)\n{\n  int l = 0;\n  int r = n - 1;\n  double p = a[0];\n  double tmp;\n\n  while (l <= r) {\n    while (a[l] < p) { l++; }\n    while (a[r] > p) { r--; }\n    if (l <= r) {\n      tmp = a[l];\n      a[l] = a[r];\n      a[r] = tmp;\n      l++;\n      r--;\n    }\n  }\n  if (0 < r) {\n    sort(r + 1, a);\n  }\n  if (l < n - 1) {\n    sort(n - l, &a[l]);\n  }\n}\n"
  },
  "7-7": {
   "string_sort.c": "#include <string.h>\n#include \"string_sort.h\"\n\nvoid string_sort(int n, char (*a)[STRLEN+1])\n{\n  int k, i, min;\n  char tmp[STRLEN+1];\n  for (k = 0; k <= n - 2; k++) {\n    min = k;\n    for (i = k + 1; i < n; i++) {\n      if (strcmp(a[i], a[min]) < 0) {\n        min = i;\n      }\n    }\n    strcpy(tmp, a[k]);\n    strcpy(a[k], a[min]);\n    strcpy(a[min], tmp);\n  }\n}\n"
  },
  "7-8": {
   "str_sort.c": "#include <string.h>\n#include \"str_sort.h\"\n\nvoid str_sort(int n, record_t *a)\n{\n  int k, i, min;\n  record_t tmp;\n  for (k = 0; k <= n - 2; k++) {\n    min = k;\n    for (i = k + 1; i < n; i++) {\n      if (a[i].age < a[min].age ||\n          (a[i].age == a[min].age && a[i].stature < a[min].stature)) {\n        min = i;\n      }\n    }\n    tmp = a[k];\n    a[k] = a[min];\n    a[min] = tmp;\n  }\n}\n"
  },
  "o7-1": {
   "bucket_sort.c": "#include <stdio.h>\n#include <stdlib.h>\n\nstatic void ins_sort(int n, double *a)\n{\n  int k, i;\n  double tmp;\n  for (k = 1; k < n; k++) {\n    for (i = k; i >= 1 && a[i - 1] > a[i]; i--) {\n      tmp = a[i];\n      a[i] = a[i - 1];\n      a[i - 1] = tmp;\n    }\n  }\n}\n\nvoid sort(int n, double *a)\n{\n  int i, j, idx, m;\n  double min, max, range;\n  int *cnt, *pos;\n  double **b;\n\n  if (n <= 1) return;\n  min = a[0];\n  max = a[0];\n  for (i = 1; i < n; i++) {\n    if (a[i] < min) min = a[i];\n    if (a[i] > max) max = a[i];\n  }\n  if (max == min) return;\n\n  m = n / 16;\n  if (m < 1) m = 1;\n  range = max - min;\n\n  cnt = malloc(sizeof(int) * m);\n  pos = malloc(sizeof(int) * m);\n  b = malloc(sizeof(double *) * m);\n  if (cnt == NULL || pos == NULL || b == NULL) exit(1);\n\n  for (i = 0; i < m; i++) {\n    cnt[i] = 0;\n    pos[i] = 0;\n  }\n  for (i = 0; i < n; i++) {\n    idx = (int)((a[i] - min) / range * m);\n    if (idx >= m) idx = m - 1;\n    if (idx < 0) idx = 0;\n    cnt[idx]++;\n  }\n  for (i = 0; i < m; i++) {\n    if (cnt[i] > 0) {\n      b[i] = malloc(sizeof(double) * cnt[i]);\n      if (b[i] == NULL) exit(1);\n    } else {\n      b[i] = NULL;\n    }\n  }\n  for (i = 0; i < n; i++) {\n    idx = (int)((a[i] - min) / range * m);\n    if (idx >= m) idx = m - 1;\n    if (idx < 0) idx = 0;\n    b[idx][pos[idx]] = a[i];\n    pos[idx]++;\n  }\n  idx = 0;\n  for (i = 0; i < m; i++) {\n    if (cnt[i] > 1) ins_sort(cnt[i], b[i]);\n    for (j = 0; j < cnt[i]; j++) {\n      a[idx++] = b[i][j];\n    }\n    if (b[i] != NULL) free(b[i]);\n  }\n  free(b);\n  free(pos);\n  free(cnt);\n}\n"
  },
  "o7-2": {
   "dc_sort.c": "#include <stdio.h>\n#include <stdlib.h>\n\nvoid sort(int n, double *a)\n{\n  int i, k, idx, m;\n  double min, max, range, tmp;\n  int *c, *d;\n  double *b;\n\n  if (n <= 1) return;\n  min = a[0];\n  max = a[0];\n  for (i = 1; i < n; i++) {\n    if (a[i] < min) min = a[i];\n    if (a[i] > max) max = a[i];\n  }\n  if (max == min) return;\n\n  m = n / 16;\n  if (m < 1) m = 1;\n  range = max - min;\n\n  c = malloc(sizeof(int) * m);\n  d = malloc(sizeof(int) * m);\n  b = malloc(sizeof(double) * n);\n  if (c == NULL || d == NULL || b == NULL) exit(1);\n\n  for (i = 0; i < m; i++) c[i] = 0;\n  for (i = 0; i < n; i++) {\n    idx = (int)((a[i] - min) / range * m);\n    if (idx >= m) idx = m - 1;\n    if (idx < 0) idx = 0;\n    c[idx]++;\n  }\n  d[0] = 0;\n  for (i = 0; i < m - 1; i++) {\n    d[i + 1] = d[i] + c[i];\n  }\n  for (i = 0; i < n; i++) {\n    idx = (int)((a[i] - min) / range * m);\n    if (idx >= m) idx = m - 1;\n    if (idx < 0) idx = 0;\n    b[d[idx]] = a[i];\n    d[idx]++;\n  }\n  for (i = 0; i < n; i++) a[i] = b[i];\n\n  /* だいたい整列されているので単純挿入法で O(n) で仕上げ */\n  for (k = 1; k < n; k++) {\n    for (i = k; i >= 1 && a[i - 1] > a[i]; i--) {\n      tmp = a[i];\n      a[i] = a[i - 1];\n      a[i - 1] = tmp;\n    }\n  }\n\n  free(b);\n  free(d);\n  free(c);\n}\n"
  }
 },
 "given": {
  "swapmin_test.c": "#include <stdio.h>\n#include <assert.h>\n#define MAX_N 64\n#define MAX_REPEAT 10\nvoid swapmin(int n, double *a, int k);\n\nint array_scan(double *a)\n/* 整数 n を読み込み,\n   続いて n 個のデータを a[0]〜a[n-1] に読み込み,\n   最後に n を返す */\n{\n  int i;\n  int n;\n  fprintf(stderr, \"n = \");\n  scanf(\"%d\",&n);\n  assert(n<=MAX_N);\n  for (i=0; i<n; i++) {\n    fprintf(stderr, \"[%d] : \", i);\n    scanf(\"%lf\", &a[i]);\n  }\n  return n;\n}\n\nvoid array_print(int n, double *a)\n/* a[0]〜a[n-1] の値を表示する */\n{\n  int i;\n  for (i=0; i<n; i++) {\n    printf(\"[%d] %10.5f\\n\", i, a[i]);\n  }\n}\n\nint main(void)\n{\n  int n;\n  int k;\n  int i;\n  double a[MAX_N];\n  n = array_scan(a);\n  array_print(n, a);\n  /* k を入力し, swapmin(n, a , k) を呼び出す,\n     という操作を繰り返す */\n  for (i=0; i<MAX_REPEAT; i++) {\n    fprintf(stderr, \"k = \");\n    if (scanf(\"%d\",&k)==EOF) { break; }\n    swapmin(n, a, k);\n    printf(\"swapmin(n, a, %d)\\n\", k);\n    array_print(n, a);\n  }\n  return 0;\n}\n",
  "sort_test.c": "#include <stdio.h>\n#include <assert.h>\n#define MAX_N 64\n\nvoid sort(int n, double *a);\n\nint array_scan(double *a)\n{\n  int i;\n  int n;\n  fprintf(stderr, \"n = \");\n  if (scanf(\"%d\",&n)==EOF) { n = 0; }\n  if (n != 0) {\n    assert(0<n && n<=MAX_N);\n    for (i=0; i<n; i++) {\n      fprintf(stderr, \"[%d] : \", i);\n      scanf(\"%lf\", &a[i]);\n    }\n  }\n  return n;\n}\n\nvoid array_print(int n, double *a)\n{\n  int i;\n  for (i=0; i<n; i++) {\n    printf(\" %0.1f\", a[i]);\n  }\n  printf(\"\\n\");\n}\n\nint main(void)\n{\n  int n;\n  double a[MAX_N];\n  while ( 0 < (n = array_scan(a)) ) {\n    sort(n, a);\n    array_print(n, a);\n  }\n  return 0;\n}\n",
  "insert_test.c": "#include <stdio.h>\n#include <assert.h>\n#define MAX_N 64\n#define MAX_REPEAT 10\nvoid insert(int n, double *a, int k);\n\nint array_scan(double *a)\n{\n  int i;\n  int n;\n  fprintf(stderr, \"n = \");\n  scanf(\"%d\",&n);\n  assert(n<=MAX_N);\n  for (i=0; i<n; i++) {\n    fprintf(stderr, \"[%d] : \", i);\n    scanf(\"%lf\", &a[i]);\n  }\n  return n;\n}\n\nvoid array_print(int n, double *a)\n{\n  int i;\n  for (i=0; i<n; i++) {\n    printf(\"[%d] %10.5f\\n\", i, a[i]);\n  }\n}\n\nint main(void)\n{\n  int n;\n  int k;\n  int i;\n  double a[MAX_N];\n  n = array_scan(a);\n  array_print(n, a);\n  for (i=0; i<MAX_REPEAT; i++) {\n    fprintf(stderr, \"k = \");\n    if (scanf(\"%d\",&k)==EOF) { break; }\n    insert(n, a, k);\n    printf(\"insert(n, a, %d)\\n\", k);\n    array_print(n, a);\n  }\n  return 0;\n}\n",
  "string_sort.h": "#define STRLEN 63\n#define STRFMT \"%63s\"\nvoid string_sort(int n, char (*a)[STRLEN+1]);\n",
  "string_sort_test.c": "#include <stdio.h>\n#include <string.h>\n#include <assert.h>\n#include \"string_sort.h\"\n#define MAX_N 64\n\nint string_array_scan(char (*a)[STRLEN+1])\n{\n  int i;\n  int n;\n  fprintf(stderr, \"n = \");\n  scanf(\"%d\",&n);\n  assert(n<=MAX_N);\n  for (i=0; i<n; i++) {\n    fprintf(stderr, \"[%d] : \", i);\n    scanf(STRFMT, a[i]);\n  }\n  return n;\n}\n\nvoid string_array_print(int n, char (*a)[STRLEN+1])\n{\n  int i;\n  for (i=0; i<n; i++) {\n    printf(\"%s\\n\", a[i]);\n  }\n}\n\nint main(void)\n{\n  int n;\n  char a[MAX_N][STRLEN+1];\n  n = string_array_scan(a);\n  string_sort(n, a);\n  string_array_print(n, a);\n  return 0;\n}\n",
  "str_sort.h": "#define STRLEN 63\n#define STRFMT \"%63s\"\n\ntypedef struct {\n  char name[STRLEN+1];\n  int age;\n  double stature;\n} record_t;\nvoid str_sort(int n, record_t *a);\n",
  "str_sort_test.c": "#include <stdio.h>\n#include <string.h>\n#include <assert.h>\n#include \"str_sort.h\"\n#define MAX_N 64\n\nint str_array_scan(record_t a[])\n{\n  int i;\n  int n;\n  fprintf(stderr, \"n = \");\n  scanf(\"%d\",&n);\n  assert(n<=MAX_N);\n  for (i=0; i<n; i++) {\n    fprintf(stderr, \"[%d].name : \", i);\n    scanf(STRFMT, a[i].name);\n    fprintf(stderr, \"[%d].age : \", i);\n    scanf(\"%d\", &a[i].age);\n    fprintf(stderr, \"[%d].stature : \", i);\n    scanf(\"%lf\", &a[i].stature);\n  }\n  return n;\n}\n\nvoid str_array_print(int n, record_t a[])\n{\n  int i;\n  for (i=0; i<n; i++) {\n    printf(\"%-10s\", a[i].name);\n    printf(\"%3d\", a[i].age);\n    printf(\"%7.2f\", a[i].stature);\n    printf(\"\\n\");\n  }\n}\n\nint main(void)\n{\n  int n;\n  record_t a[MAX_N];\n\n  n = str_array_scan(a);\n  str_sort(n, a);\n  str_array_print(n, a);\n  return 0;\n}\n"
 },
 "exp": {
  "sw1": "[0]    5.00000\n[1]    4.00000\n[2]    3.00000\n[3]    2.00000\n[4]    1.00000\nswapmin(n, a, 0)\n[0]    1.00000\n[1]    4.00000\n[2]    3.00000\n[3]    2.00000\n[4]    5.00000\n",
  "sw2": "[0]    5.00000\n[1]    4.00000\n[2]    3.00000\n[3]    1.00000\n[4]    2.00000\nswapmin(n, a, 1)\n[0]    5.00000\n[1]    1.00000\n[2]    3.00000\n[3]    4.00000\n[4]    2.00000\n",
  "sw3": "[0]    6.00000\n[1]    2.00000\n[2]    4.00000\n[3]    9.00000\n[4]    8.00000\nswapmin(n, a, 0)\n[0]    2.00000\n[1]    6.00000\n[2]    4.00000\n[3]    9.00000\n[4]    8.00000\nswapmin(n, a, 1)\n[0]    2.00000\n[1]    4.00000\n[2]    6.00000\n[3]    9.00000\n[4]    8.00000\nswapmin(n, a, 2)\n[0]    2.00000\n[1]    4.00000\n[2]    6.00000\n[3]    9.00000\n[4]    8.00000\nswapmin(n, a, 3)\n[0]    2.00000\n[1]    4.00000\n[2]    6.00000\n[3]    8.00000\n[4]    9.00000\n",
  "so_hand": " 1.0 2.0 3.0 4.0 5.0\n 1.0 2.0 3.0 4.0 5.0\n 0.1 0.2 0.3\n",
  "so_full": " -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 0.0 1.1 3.1\n -0.1 -0.1 0.0 1.1\n -0.1 -0.1 0.0 1.1\n -0.1 -0.1 0.0 1.1\n -0.1 -0.1 0.0 1.1\n -0.1 -0.1 0.0 1.1\n -0.1 -0.1 0.0 1.1\n -0.1 -0.1 0.0 1.1\n -0.1 -0.1 0.0 1.1\n -0.1 -0.1 0.0 1.1\n -0.1 -0.1 0.0 1.1\n -0.1 -0.1 0.0 1.1\n -0.1 -0.1 0.0 1.1\n -0.1 -0.1 1.1 1.1\n -0.1 -0.1 1.1 1.1\n -0.1 -0.1 1.1 1.1\n -0.1 -0.1 1.1 1.1\n -0.1 -0.1 1.1 1.1\n -0.1 -0.1 1.1 1.1\n -0.1 -0.1 -0.1 1.1\n -0.1 -0.1 -0.1 1.1\n -0.1 -0.1 -0.1 1.1\n -0.1 -0.1 -0.1 1.1\n -0.1 -0.1 -0.1 -0.1\n 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1.0 1.1 1.2 1.3 1.4 1.5 1.6\n 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1.0 1.1 1.2 1.3 1.4 1.5 1.6\n 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1.0 1.1 1.2 1.3 1.4 1.5 1.6\n",
  "in1": "[0]    2.00000\n[1]    4.00000\n[2]    6.00000\n[3]    8.00000\n[4]    5.00000\ninsert(n, a, 4)\n[0]    2.00000\n[1]    4.00000\n[2]    5.00000\n[3]    6.00000\n[4]    8.00000\n",
  "in2": "[0]    3.00000\n[1]    4.00000\n[2]    6.00000\n[3]    2.00000\n[4]    1.00000\ninsert(n, a, 3)\n[0]    2.00000\n[1]    3.00000\n[2]    4.00000\n[3]    6.00000\n[4]    1.00000\n",
  "in3": "[0]    6.00000\n[1]    2.00000\n[2]    4.00000\n[3]    9.00000\n[4]    8.00000\ninsert(n, a, 1)\n[0]    2.00000\n[1]    6.00000\n[2]    4.00000\n[3]    9.00000\n[4]    8.00000\ninsert(n, a, 2)\n[0]    2.00000\n[1]    4.00000\n[2]    6.00000\n[3]    9.00000\n[4]    8.00000\ninsert(n, a, 3)\n[0]    2.00000\n[1]    4.00000\n[2]    6.00000\n[3]    9.00000\n[4]    8.00000\ninsert(n, a, 4)\n[0]    2.00000\n[1]    4.00000\n[2]    6.00000\n[3]    8.00000\n[4]    9.00000\n",
  "str1": "nakamura\nsuzuki\ntanaka\nyamada\nyamamoto\n",
  "str2": "apple\napple\nbanana\ncherry\ngrape\norange\n",
  "rec1": "tanaka     20 170.00\nsuzuki     21 165.30\nnakamura   21 175.30\nyamada     22 160.50\nyamamoto   22 177.40\nnakamura   22 179.70\n",
  "rec2": "takahashi  18 180.20\nkato       19 165.00\nsato       19 172.00\nwatanabe   21 168.50\nito        21 168.50\n"
 },
 "inp": {
  "sw1": "5\n5 4 3 2 1\n0\n",
  "sw2": "5\n5 4 3 1 2\n1\n",
  "sw3": "5\n6 2 4 9 8\n0 1 2 3\n",
  "so_hand": "5\n1 2 3 4 5\n5\n5 4 3 2 1\n3\n0.3 0.2 0.1\n",
  "so_full": "4 -0.1 1.1 0 3.1\n4 -0.1 1.1 3.1 0\n4 -0.1 0 1.1 3.1\n4 -0.1 0 3.1 1.1\n4 -0.1 3.1 1.1 0\n4 -0.1 3.1 0 1.1\n4 1.1 -0.1 0 3.1\n4 1.1 -0.1 3.1 0\n4 1.1 0 -0.1 3.1\n4 1.1 0 3.1 -0.1\n4 1.1 3.1 -0.1 0\n4 1.1 3.1 0 -0.1\n4 0 -0.1 1.1 3.1\n4 0 -0.1 3.1 1.1\n4 0 1.1 -0.1 3.1\n4 0 1.1 3.1 -0.1\n4 0 3.1 -0.1 1.1\n4 0 3.1 1.1 -0.1\n4 3.1 -0.1 1.1 0\n4 3.1 -0.1 0 1.1\n4 3.1 1.1 -0.1 0\n4 3.1 1.1 0 -0.1\n4 3.1 0 -0.1 1.1\n4 3.1 0 1.1 -0.1\n4 -0.1 -0.1 1.1 0\n4 -0.1 -0.1 0 1.1\n4 -0.1 1.1 0 -0.1\n4 -0.1 1.1 -0.1 0\n4 -0.1 0 -0.1 1.1\n4 -0.1 0 1.1 -0.1\n4 1.1 -0.1 -0.1 0\n4 1.1 -0.1 0 -0.1\n4 1.1 0 -0.1 -0.1\n4 0 -0.1 -0.1 1.1\n4 0 -0.1 1.1 -0.1\n4 0 1.1 -0.1 -0.1\n4 -0.1 -0.1 1.1 1.1\n4 -0.1 1.1 -0.1 1.1\n4 -0.1 1.1 1.1 -0.1\n4 1.1 -0.1 -0.1 1.1\n4 1.1 -0.1 1.1 -0.1\n4 1.1 1.1 -0.1 -0.1\n4 -0.1 -0.1 -0.1 1.1\n4 -0.1 1.1 -0.1 -0.1\n4 -0.1 -0.1 1.1 -0.1\n4 -0.1 -0.1 -0.1 1.1\n4 -0.1 -0.1 -0.1 -0.1\n16 0.4 1.6 0.1 1.1 0.8 1.4 0.7 0.6 0.9 1.0 1.2 0.5 0.2 1.3 1.5 0.3\n16 1.4 0.6 0.1 0.9 0.8 1.0 0.5 1.3 1.6 1.5 0.7 1.2 0.4 1.1 0.3 0.2\n16 1.3 0.9 0.1 1.2 0.6 1.5 1.1 0.4 1.0 0.7 0.5 0.3 1.4 0.8 0.2 1.6\n",
  "in1": "5\n2 4 6 8 5\n4\n",
  "in2": "5\n3 4 6 2 1\n3\n",
  "in3": "5\n6 2 4 9 8\n1 2 3 4\n",
  "str1": "5\ntanaka\nyamada\nsuzuki\nyamamoto\nnakamura\n",
  "str2": "6\norange\napple\nbanana\napple\ncherry\ngrape\n",
  "rec1": "6\nyamada 22 160.5\nyamamoto 22 177.4\nsuzuki 21 165.3\ntanaka 20 170.0\nnakamura 22 179.7\nnakamura 21 175.3\n",
  "rec2": "5\nsato 19 172.0\nito 21 168.5\nkato 19 165.0\nwatanabe 21 168.5\ntakahashi 18 180.2\n"
 },
 "start": {
  "swapmin.c": "void swapmin(int n, double *a, int k)\n{\n  /* a[k]〜a[n-1] の最小値 a[min] を探し, a[k] と交換する */\n}\n",
  "selection_sort.c": "void sort(int n, double *a)\n{\n  /* 単純選択法: k = 0 〜 n-2 について swapmin 相当の処理を行う */\n}\n",
  "insert.c": "void insert(int n, double *a, int k)\n{\n  /* i = k から左へ比較・交換を繰り返し, a[k] を適切な位置に挿入する */\n}\n",
  "insertion_sort.c": "void sort(int n, double *a)\n{\n  /* 単純挿入法: k = 1 〜 n-1 について insert 相当の処理を行う */\n}\n",
  "sort_cpu.c": "#include <stdio.h>\n#include <stdlib.h>\n#include <time.h> /* 時間計測に必要 */\n#include <assert.h>\n#define MIN_N 2 /* 完成後にもっと大きくする */\n#define MAX_N 8 /* 完成後にもっと大きくする */\n#define N_TEST 8\n\nvoid sort(int n, double *a);\n\nvoid array_set_rand(int n, double *a)\n{\n  /* a[0]〜a[n-1] に乱数のデータをセットする */\n}\n\nvoid array_set_sorted(int n, double *a)\n{\n  /* a[0]〜a[n-1] に正順 (0, 1, ..., n-1) のデータをセットする */\n}\n\nvoid array_set_reverse(int n, double *a)\n{\n  /* a[0]〜a[n-1] に逆順 (n, n-1, ..., 1) のデータをセットする */\n}\n\nvoid array_copy(int n, double *a, double *r)\n{\n  /* r[0]〜r[n-1] から a[0]〜a[n-1] にデータコピーする */\n}\n\nvoid sort_check(int n, double *a)\n{\n  int i;\n  for (i=0; i<n-1; i++) {\n    if (a[i]<=a[i+1]) {\n      ; /* OK */\n    }\n    else {\n      /* データが (a[i] と a[i+1] が) 昇順に並んでいない */\n      fprintf(stderr, \"sort error (a[%d]=%0.10f, a[%d]=%0.10f)\\n\", i, a[i], i+1, a[i+1]);\n      exit(1);\n    }\n  }\n}\n\nvoid sort_cpu(double *r)\n{\n  int n;\n  int i;\n  double *a;\n  /* 初期データがちゃんと生成されているかの確認用 */\n  for (i=0; i<N_TEST; i++) {\n    printf(\"%18.5f\\n\", r[i]);\n  }\n  /** ここを埋めて関数を完成させよ **/\n}\n\nint main(void)\n{\n  double *r;\n\n  r = malloc(sizeof(double)*MAX_N);\n  if (r==NULL) {\n    fprintf(stderr, \"malloc に失敗 (MAX_N = %d)\\n\", MAX_N);\n    exit(1);\n  }\n  printf(\"乱数\\n\");\n  array_set_rand(MAX_N, r);\n  sort_cpu(r);\n  printf(\"正順\\n\");\n  array_set_sorted(MAX_N, r);\n  sort_cpu(r);\n\n  printf(\"逆順\\n\");\n  array_set_reverse(MAX_N, r);\n  sort_cpu(r);\n\n  free(r);\n  r = NULL;\n  return 0;\n}\n",
  "quick_sort.c": "void sort(int n, double *a)\n{\n  /* クイックソート: p = a[0] で分割し, 前半と後半を再帰的に sort する */\n}\n",
  "string_sort.c": "#include <string.h>\n#include \"string_sort.h\"\n\nvoid string_sort(int n, char (*a)[STRLEN+1])\n{\n  /* 文字列の配列 a[0]〜a[n-1] を辞書順 (strcmp) にソートする */\n}\n",
  "str_sort.c": "#include <string.h>\n#include \"str_sort.h\"\n\nvoid str_sort(int n, record_t *a)\n{\n  /* age の昇順, age が等しければ stature の昇順にソートする */\n}\n",
  "bucket_sort.c": "#include <stdio.h>\n#include <stdlib.h>\n\nvoid sort(int n, double *a)\n{\n  /* バケツ法 (bucket sort): 区間を m = n/B 等分し, 各バケツをソートして連結 */\n}\n",
  "dc_sort.c": "#include <stdio.h>\n#include <stdlib.h>\n\nvoid sort(int n, double *a)\n{\n  /* 頻度法 (distribution counting sort): c と d で格納先を決めて b に並べ, 最後に単純挿入法 */\n}\n"
 },
 "timing": {
  "sel_O0": {
   "2048": [
    0.006174,
    0.007209,
    0.007067
   ],
   "4096": [
    0.031746,
    0.029204,
    0.027071
   ],
   "8192": [
    0.134927,
    0.117492,
    0.09526
   ],
   "16384": [
    0.456151,
    0.423806,
    0.341942
   ],
   "32768": [
    1.717105,
    1.591871,
    1.50587
   ]
  },
  "sel_O2": {
   "2048": [
    0.00469,
    0.004423,
    0.003793
   ],
   "4096": [
    0.018621,
    0.017659,
    0.015211
   ],
   "8192": [
    0.073872,
    0.070639,
    0.060833
   ],
   "16384": [
    0.293769,
    0.26932,
    0.204818
   ],
   "32768": [
    0.987663,
    1.012462,
    0.916367
   ],
   "65536": [
    3.722761,
    4.064537,
    2.925529
   ]
  },
  "ins_O0": {
   "2048": [
    0.007531,
    6e-06,
    0.009634
   ],
   "4096": [
    0.029555,
    1.2e-05,
    0.037611
   ],
   "8192": [
    0.084587,
    2.4e-05,
    0.151352
   ],
   "16384": [
    0.309929,
    4.8e-05,
    0.646916
   ],
   "32768": [
    1.25976,
    9.4e-05,
    3.56259
   ]
  },
  "ins_O2": {
   "2048": [
    0.019332,
    3e-06,
    0.012554
   ],
   "4096": [
    0.065695,
    6e-06,
    0.050641
   ],
   "8192": [
    0.116093,
    1.1e-05,
    0.202998
   ],
   "16384": [
    0.430291,
    2.2e-05,
    0.818657
   ],
   "32768": [
    1.753649,
    4.3e-05,
    3.259123
   ],
   "65536": [
    7.563359,
    8.6e-05,
    14.045601
   ]
  },
  "quick_O2": {
   "2048": [
    0.000418,
    0.002606,
    0.001181
   ],
   "4096": [
    0.00082,
    0.008563,
    0.004283
   ],
   "8192": [
    0.001925,
    0.028853,
    0.058001
   ],
   "16384": [
    0.003727,
    0.073236,
    0.093523
   ],
   "32768": [
    0.007989,
    0.274936,
    0.279823
   ],
   "65536": [
    0.013699,
    1.136194,
    1.105085
   ]
  },
  "bucket_O2": {
   "2048": [
    0.00019,
    0.00016,
    0.000334
   ],
   "4096": [
    0.0004,
    0.000574,
    0.000676
   ],
   "8192": [
    0.000703,
    0.000537,
    0.001303
   ],
   "16384": [
    0.001491,
    0.000959,
    0.002663
   ],
   "32768": [
    0.002745,
    0.001596,
    0.005339
   ],
   "65536": [
    0.008845,
    0.002518,
    0.010916
   ]
  },
  "dc_O2": {
   "2048": [
    0.00027,
    4.1e-05,
    0.000268
   ],
   "4096": [
    0.000535,
    7.9e-05,
    0.000545
   ],
   "8192": [
    0.001166,
    0.000154,
    0.001031
   ],
   "16384": [
    0.002527,
    0.00039,
    0.002007
   ],
   "32768": [
    0.004359,
    0.000729,
    0.003986
   ],
   "65536": [
    0.008258,
    0.001539,
    0.007229
   ]
  }
 }
};
