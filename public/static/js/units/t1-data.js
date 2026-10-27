/* T1 中間試験対策 — 生成ファイル (gen_t1.py): 問題ファイルと gcc (Linux/glibc) で求めた期待値 */
window.T1_DATA = {
"files": {
"hms.h": "void hms(int t, int *h, int *m, int *s);\n",
"hmsmain.c": "#include <stdio.h>\n#include \"hms.h\"\n\nint main(void)\n{\n  int t, h, m, s;\n  while (1) {\n    fprintf(stderr, \"t (sec) = \");\n    if (scanf(\"%d\", &t) == EOF) { break; }\n    h = -1; m = -1; s = -1;\n    hms(t, &h, &m, &s);\n    printf(\"%d sec = %d:%02d:%02d\\n\", t, h, m, s);\n  }\n  return 0;\n}\n",
"hms.c": "#include \"hms.h\"\n\nvoid hms(int t, int *h, int *m, int *s)\n{\n  *h = t / 3600;\n  *m = t % 3600 / 60;\n  *s = t % 60;\n}\n",
"tri.h": "typedef struct {\n  double x;\n  double y;\n} point_t;\n\nint point_scan(point_t *p);\ndouble tri_area(point_t *a, point_t *b, point_t *c);\nvoid centroid(point_t *a, point_t *b, point_t *c, point_t *g);\n",
"trimain.c": "#include <stdio.h>\n#include \"tri.h\"\n\nint main(void)\n{\n  point_t a, b, c, g;\n  while (point_scan(&a) != EOF && point_scan(&b) != EOF && point_scan(&c) != EOF) {\n    centroid(&a, &b, &c, &g);\n    printf(\"S = %.4f  G = (%.4f, %.4f)\\n\", tri_area(&a, &b, &c), g.x, g.y);\n  }\n  return 0;\n}\n",
"tri.c": "#include <stdio.h>\n#include <math.h>\n#include \"tri.h\"\n\nint point_scan(point_t *p)\n{\n  fprintf(stderr, \"x y = \");\n  if (scanf(\"%lf%lf\", &p->x, &p->y) == EOF) { return EOF; }\n  return 1;\n}\n\ndouble tri_area(point_t *a, point_t *b, point_t *c)\n{\n  double s = (b->x - a->x) * (c->y - a->y) - (c->x - a->x) * (b->y - a->y);\n  return fabs(s) / 2.0;\n}\n\nvoid centroid(point_t *a, point_t *b, point_t *c, point_t *g)\n{\n  g->x = (a->x + b->x + c->x) / 3.0;\n  g->y = (a->y + b->y + c->y) / 3.0;\n}\n",
"dice2sub.h": "#define D2_MIN 2\n#define D2_MAX 12\n\nvoid dice_throw(int d[], int n);\nvoid dice2_distr(int n, int d1[], int d2[], int c[]);\n",
"dice2.c": "#include <stdio.h>\n#include <stdlib.h>\n#include \"dice2sub.h\"\n#define N_MAX 10000\n\nint main(void)\n{\n  int d1[N_MAX], d2[N_MAX];\n  int c[D2_MAX+1];\n  int n, s, k;\n  fprintf(stderr, \"n = \");\n  scanf(\"%d\", &n);\n  if (n < 1 || n > N_MAX) { fprintf(stderr, \"1 <= n <= %d\\n\", N_MAX); exit(1); }\n  dice_throw(d1, n);\n  dice_throw(d2, n);\n  for (s=0; s<=D2_MAX; s++) { c[s] = rand(); }   /* わざとゴミを入れる */\n  dice2_distr(n, d1, d2, c);\n  for (s=D2_MIN; s<=D2_MAX; s++) {\n    printf(\"%2d: %5d \", s, c[s]);\n    for (k=0; k<c[s]*100/n; k++) { printf(\"*\"); }\n    printf(\"\\n\");\n  }\n  return 0;\n}\n",
"dice2sub.c": "#include <stdlib.h>\n#include \"dice2sub.h\"\n\nvoid dice_throw(int d[], int n)\n{\n  int i;\n  for (i=0; i<n; i++) {\n    d[i] = rand() % 6 + 1;\n  }\n}\n\nvoid dice2_distr(int n, int d1[], int d2[], int c[])\n{\n  int i, s;\n  for (s=D2_MIN; s<=D2_MAX; s++) { c[s] = 0; }\n  for (i=0; i<n; i++) {\n    c[d1[i] + d2[i]]++;\n  }\n}\n",
"mat.h": "#define N 4\n\nvoid matrix_scan(int n, double A[N][N]);\nvoid matrix_print(int n, double A[N][N]);\nvoid matrix_mult(int n, double A[N][N], double B[N][N], double C[N][N]);\ndouble matrix_trace(int n, double A[N][N]);\n",
"matmain.c": "#include <stdio.h>\n#include \"mat.h\"\n\nint main(void)\n{\n  double A[N][N], B[N][N], C[N][N];\n  int n, i, j;\n  fprintf(stderr, \"n = \");\n  scanf(\"%d\", &n);\n  matrix_scan(n, A);\n  matrix_scan(n, B);\n  for (i=0; i<N; i++) { for (j=0; j<N; j++) { C[i][j] = 99.0; } }  /* わざとゴミを入れる */\n  matrix_mult(n, A, B, C);\n  printf(\"C = AB\\n\");\n  matrix_print(n, C);\n  printf(\"tr(C) = %.3f\\n\", matrix_trace(n, C));\n  return 0;\n}\n",
"matio.c": "#include <stdio.h>\n#include \"mat.h\"\n\nvoid matrix_scan(int n, double A[N][N])\n{\n  int i, j;\n  for (i=0; i<n; i++) {\n    for (j=0; j<n; j++) {\n      fprintf(stderr, \"A[%d][%d] = \", i, j);\n      scanf(\"%lf\", &A[i][j]);\n    }\n  }\n}\n\nvoid matrix_print(int n, double A[N][N])\n{\n  int i, j;\n  for (i=0; i<n; i++) {\n    for (j=0; j<n; j++) {\n      printf(\" %8.3f\", A[i][j]);\n    }\n    printf(\"\\n\");\n  }\n}\n",
"matcalc.c": "#include \"mat.h\"\n\nvoid matrix_mult(int n, double A[N][N], double B[N][N], double C[N][N])\n{\n  int i, j, k;\n  for (i=0; i<n; i++) {\n    for (j=0; j<n; j++) {\n      C[i][j] = 0.0;\n      for (k=0; k<n; k++) {\n        C[i][j] += A[i][k] * B[k][j];\n      }\n    }\n  }\n}\n\ndouble matrix_trace(int n, double A[N][N])\n{\n  int i;\n  double t = 0.0;\n  for (i=0; i<n; i++) { t += A[i][i]; }\n  return t;\n}\n",
"stat.c": "#include <stdio.h>\n#include <math.h>\n#include <stdlib.h>\n#define N_ARRAY 10\n\nint main(void)\n{\n  double a[N_ARRAY];\n  double sum = 0.0, var = 0.0, ave;\n  int n, i;\n  for (n=0; n<N_ARRAY; n++) {\n    fprintf(stderr, \"a[%d] = \", n);\n    if (scanf(\"%lf\", &a[n]) == EOF) { break; }\n    if (a[n] < 0) {\n      fprintf(stderr, \"a[%d]<0\\n\", n);\n      exit(1);\n    }\n  }\n  if (n == 0) {\n    fprintf(stderr, \"no data\\n\");\n    exit(1);\n  }\n  for (i=0; i<n; i++) { sum += a[i]; }\n  ave = sum / n;\n  for (i=0; i<n; i++) { var += (a[i] - ave) * (a[i] - ave); }\n  var /= n;\n  printf(\"n = %d\\n\", n);\n  printf(\"ave = %.3f\\n\", ave);\n  printf(\"sd = %.3f\\n\", sqrt(var));\n  return 0;\n}\n",
"word.c": "#include <stdio.h>\n#include <string.h>\n#define STR_LEN 31\n#define STR_FMT \"%31s\"\n\nint main(void)\n{\n  char key[STR_LEN+1], w[STR_LEN+1], longest[STR_LEN+1];\n  int same = 0, n = 0;\n  fprintf(stderr, \"key = \");\n  if (scanf(STR_FMT, key) == EOF) { return 1; }\n  strcpy(longest, key);\n  while (1) {\n    fprintf(stderr, \"word = \");\n    if (scanf(STR_FMT, w) == EOF) { break; }\n    n++;\n    if (strcmp(w, key) == 0) { same++; }\n    if (strlen(w) > strlen(longest)) { strcpy(longest, w); }\n  }\n  printf(\"words = %d\\n\", n);\n  printf(\"same as %s = %d\\n\", key, same);\n  printf(\"longest = %s (%d)\\n\", longest, (int)strlen(longest));\n  return 0;\n}\n",
"sort3.h": "void sort3(int *a, int *b, int *c);\n",
"sort3main.c": "#include <stdio.h>\n#include \"sort3.h\"\n\nint main(void)\n{\n  int a, b, c;\n  while (1) {\n    fprintf(stderr, \"a b c = \");\n    if (scanf(\"%d%d%d\", &a, &b, &c) == EOF) { break; }\n    sort3(&a, &b, &c);\n    printf(\"%d %d %d\\n\", a, b, c);\n  }\n  return 0;\n}\n",
"sort3.c": "#include \"sort3.h\"\n\nvoid swap_int(int *x, int *y)\n{\n  int t = *x;\n  *x = *y;\n  *y = t;\n}\n\nvoid sort3(int *a, int *b, int *c)\n{\n  if (*a > *b) { swap_int(a, b); }\n  if (*b > *c) { swap_int(b, c); }\n  if (*a > *b) { swap_int(a, b); }\n}\n",
"item.h": "#define NM_LEN 31\n#define NM_FMT \"%31s\"\n\ntypedef struct {\n  char name[NM_LEN+1];  /* 品名 */\n  int price;            /* 単価 */\n  int qty;              /* 個数 */\n} item_t;\n\nint item_scan(item_t *p);\nvoid item_discount(item_t *p, int pct);\nint item_total(item_t *p);\n",
"itemmain.c": "#include <stdio.h>\n#include \"item.h\"\n\nint main(void)\n{\n  item_t a;\n  int pct, sum = 0;\n  fprintf(stderr, \"pct = \");\n  scanf(\"%d\", &pct);\n  while (item_scan(&a) != EOF) {\n    item_discount(&a, pct);\n    printf(\"%s %d x %d = %d\\n\", a.name, a.price, a.qty, item_total(&a));\n    sum += item_total(&a);\n  }\n  printf(\"total = %d\\n\", sum);\n  return 0;\n}\n",
"item.c": "#include <stdio.h>\n#include \"item.h\"\n\nint item_scan(item_t *p)\n{\n  fprintf(stderr, \"name price qty = \");\n  if (scanf(NM_FMT, p->name) == EOF) { return EOF; }\n  if (scanf(\"%d\", &p->price) == EOF) { return EOF; }\n  if (scanf(\"%d\", &p->qty) == EOF) { return EOF; }\n  return 1;\n}\n\nvoid item_discount(item_t *p, int pct)\n{\n  p->price = p->price * (100 - pct) / 100;\n}\n\nint item_total(item_t *p)\n{\n  return p->price * p->qty;\n}\n",
"dicerun.h": "#define N_MAX 10000\n\nvoid dice_throw(int d[], int n);\nvoid dice_count(int d[], int n, int c[]);\nint longest_run(int d[], int n, int *val);\n",
"dicerunmain.c": "#include <stdio.h>\n#include <stdlib.h>\n#include \"dicerun.h\"\n\nint main(void)\n{\n  int d[N_MAX];\n  int c[7];\n  int n, k, len, v;\n  fprintf(stderr, \"n = \");\n  scanf(\"%d\", &n);\n  if (n < 1 || n > N_MAX) { fprintf(stderr, \"1 <= n <= %d\\n\", N_MAX); exit(1); }\n  dice_throw(d, n);\n  for (k=0; k<=6; k++) { c[k] = rand(); }   /* わざとゴミを入れる */\n  dice_count(d, n, c);\n  for (k=1; k<=6; k++) { printf(\"%d: %5d\\n\", k, c[k]); }\n  len = longest_run(d, n, &v);\n  printf(\"longest run: %d x %d\\n\", v, len);\n  return 0;\n}\n",
"dicerun.c": "#include <stdlib.h>\n#include \"dicerun.h\"\n\nvoid dice_throw(int d[], int n)\n{\n  int i;\n  for (i=0; i<n; i++) {\n    d[i] = rand() % 6 + 1;\n  }\n}\n\nvoid dice_count(int d[], int n, int c[])\n{\n  int i, k;\n  for (k=1; k<=6; k++) { c[k] = 0; }\n  for (i=0; i<n; i++) {\n    c[d[i]]++;\n  }\n}\n\nint longest_run(int d[], int n, int *val)\n{\n  int i, len = 1, best = 1;\n  *val = d[0];\n  for (i=1; i<n; i++) {\n    if (d[i] == d[i-1]) { len++; } else { len = 1; }\n    if (len > best) { best = len; *val = d[i]; }\n  }\n  return best;\n}\n",
"sym.h": "#define N 4\n\nvoid matrix_scan(int n, double A[N][N]);\nvoid matrix_print(int n, double A[N][N]);\nvoid matrix_add_trans(int n, double A[N][N], double Y[N][N]);\nint matrix_is_sym(int n, double A[N][N]);\n",
"symmain.c": "#include <stdio.h>\n#include \"sym.h\"\n\nint main(void)\n{\n  double A[N][N], Y[N][N];\n  int n, i, j;\n  fprintf(stderr, \"n = \");\n  scanf(\"%d\", &n);\n  matrix_scan(n, A);\n  for (i=0; i<N; i++) { for (j=0; j<N; j++) { Y[i][j] = 99.0; } }  /* わざとゴミを入れる */\n  matrix_add_trans(n, A, Y);\n  printf(\"A\\n\");\n  matrix_print(n, A);\n  printf(\"A + A^T\\n\");\n  matrix_print(n, Y);\n  printf(\"A: %s\\n\", matrix_is_sym(n, A) ? \"symmetric\" : \"not symmetric\");\n  printf(\"A + A^T: %s\\n\", matrix_is_sym(n, Y) ? \"symmetric\" : \"not symmetric\");\n  return 0;\n}\n",
"symio.c": "#include <stdio.h>\n#include \"sym.h\"\n\nvoid matrix_scan(int n, double A[N][N])\n{\n  int i, j;\n  for (i=0; i<n; i++) {\n    for (j=0; j<n; j++) {\n      fprintf(stderr, \"A[%d][%d] = \", i, j);\n      scanf(\"%lf\", &A[i][j]);\n    }\n  }\n}\n\nvoid matrix_print(int n, double A[N][N])\n{\n  int i, j;\n  for (i=0; i<n; i++) {\n    for (j=0; j<n; j++) {\n      printf(\" %8.3f\", A[i][j]);\n    }\n    printf(\"\\n\");\n  }\n}\n",
"sym.c": "#include \"sym.h\"\n\nvoid matrix_add_trans(int n, double A[N][N], double Y[N][N])\n{\n  int i, j;\n  for (i=0; i<n; i++) {\n    for (j=0; j<n; j++) {\n      Y[i][j] = A[i][j] + A[j][i];\n    }\n  }\n}\n\nint matrix_is_sym(int n, double A[N][N])\n{\n  int i, j;\n  for (i=0; i<n; i++) {\n    for (j=0; j<n; j++) {\n      if (A[i][j] != A[j][i]) { return 0; }\n    }\n  }\n  return 1;\n}\n",
"minmax.h": "#define N_MAX 100\n\nint array_scan(double a[]);\nvoid array_stat(int n, double a[], double *min, double *max, double *ave);\n",
"minmaxmain.c": "#include <stdio.h>\n#include <stdlib.h>\n#include \"minmax.h\"\n\nint main(void)\n{\n  double a[N_MAX];\n  double mn = -1.0, mx = -1.0, av = -1.0;\n  int n;\n  n = array_scan(a);\n  if (n == 0) { fprintf(stderr, \"no data\\n\"); exit(1); }\n  array_stat(n, a, &mn, &mx, &av);\n  printf(\"n = %d\\n\", n);\n  printf(\"min = %.2f\\n\", mn);\n  printf(\"max = %.2f\\n\", mx);\n  printf(\"ave = %.3f\\n\", av);\n  return 0;\n}\n",
"minmax.c": "#include <stdio.h>\n#include \"minmax.h\"\n\nint array_scan(double a[])\n{\n  int n;\n  for (n=0; n<N_MAX; n++) {\n    fprintf(stderr, \"a[%d] = \", n);\n    if (scanf(\"%lf\", &a[n]) == EOF) { break; }\n  }\n  return n;\n}\n\nvoid array_stat(int n, double a[], double *min, double *max, double *ave)\n{\n  int i;\n  double s = 0.0;\n  *min = a[0];\n  *max = a[0];\n  for (i=0; i<n; i++) {\n    if (a[i] < *min) { *min = a[i]; }\n    if (a[i] > *max) { *max = a[i]; }\n    s += a[i];\n  }\n  *ave = s / n;\n}\n",
"circle.h": "typedef struct {\n  double x;\n  double y;\n} point_t;\n\ntypedef struct {\n  point_t c;   /* 中心 */\n  double r;    /* 半径 */\n} circle_t;\n\nint circle_scan(circle_t *p);\ndouble circle_area(circle_t *p);\nint circle_relation(circle_t *p, circle_t *q);\n",
"circlemain.c": "#include <stdio.h>\n#include \"circle.h\"\n\nint main(void)\n{\n  circle_t a, b;\n  const char *rel[] = { \"separate\", \"touch\", \"intersect\", \"contain\" };\n  while (circle_scan(&a) != EOF && circle_scan(&b) != EOF) {\n    printf(\"S1 = %.3f, S2 = %.3f, %s\\n\", circle_area(&a), circle_area(&b), rel[circle_relation(&a, &b)]);\n  }\n  return 0;\n}\n",
"circle.c": "#include <stdio.h>\n#include <math.h>\n#include \"circle.h\"\n\n#define PI 3.14159265358979\n#define EPS 1e-9\n\nint circle_scan(circle_t *p)\n{\n  fprintf(stderr, \"x y r = \");\n  if (scanf(\"%lf%lf%lf\", &p->c.x, &p->c.y, &p->r) == EOF) { return EOF; }\n  return 1;\n}\n\ndouble circle_area(circle_t *p)\n{\n  return PI * p->r * p->r;\n}\n\n/* 0: 離れている 1: 外接 2: 交わる 3: 一方が他方を含む (内接を含む) */\nint circle_relation(circle_t *p, circle_t *q)\n{\n  double dx = p->c.x - q->c.x, dy = p->c.y - q->c.y;\n  double d = sqrt(dx * dx + dy * dy);\n  if (d > p->r + q->r + EPS) { return 0; }\n  if (fabs(d - (p->r + q->r)) <= EPS) { return 1; }\n  if (d < fabs(p->r - q->r) + EPS) { return 3; }\n  return 2;\n}\n",
"hist.h": "#define N_MAX 10000\n#define N_CLASS 10\n\nvoid score_gen(int s[], int n);\nvoid score_hist(int s[], int n, int c[]);\n",
"histmain.c": "#include <stdio.h>\n#include <stdlib.h>\n#include \"hist.h\"\n\nint main(void)\n{\n  int s[N_MAX];\n  int c[N_CLASS];\n  int n, k, m;\n  fprintf(stderr, \"n = \");\n  scanf(\"%d\", &n);\n  if (n < 1 || n > N_MAX) { fprintf(stderr, \"1 <= n <= %d\\n\", N_MAX); exit(1); }\n  score_gen(s, n);\n  for (k=0; k<N_CLASS; k++) { c[k] = rand(); }   /* わざとゴミを入れる */\n  score_hist(s, n, c);\n  for (k=0; k<N_CLASS; k++) {\n    printf(\"%3d-%3d: %5d \", k * 10, k == N_CLASS - 1 ? 100 : k * 10 + 9, c[k]);\n    for (m=0; m<c[k]*50/n; m++) { printf(\"#\"); }\n    printf(\"\\n\");\n  }\n  return 0;\n}\n",
"hist.c": "#include <stdlib.h>\n#include \"hist.h\"\n\n/* 0〜100 点: 0〜50 の一様乱数 2 個の和 (山形の分布) */\nvoid score_gen(int s[], int n)\n{\n  int i;\n  for (i=0; i<n; i++) {\n    s[i] = rand() % 51 + rand() % 51;\n  }\n}\n\n/* 10 点刻み. ただし 100 点は 90-100 の階級に入れる */\nvoid score_hist(int s[], int n, int c[])\n{\n  int i, k;\n  for (k=0; k<N_CLASS; k++) { c[k] = 0; }\n  for (i=0; i<n; i++) {\n    k = s[i] / 10;\n    if (k >= N_CLASS) { k = N_CLASS - 1; }\n    c[k]++;\n  }\n}\n",
"matrow.h": "#define N 5\n\nvoid matrix_scan(int n, double A[N][N]);\nvoid matrix_print(int n, double A[N][N]);\nvoid row_col_sum(int n, double A[N][N], double r[N], double c[N]);\nvoid row_swap(int n, double A[N][N], int i, int k);\n",
"matrowmain.c": "#include <stdio.h>\n#include \"matrow.h\"\n\nint main(void)\n{\n  double A[N][N], r[N], c[N];\n  int n, i, k, j;\n  fprintf(stderr, \"n = \");\n  scanf(\"%d\", &n);\n  matrix_scan(n, A);\n  fprintf(stderr, \"i k = \");\n  scanf(\"%d%d\", &i, &k);\n  for (j=0; j<N; j++) { r[j] = 99.0; c[j] = 99.0; }   /* わざとゴミを入れる */\n  row_col_sum(n, A, r, c);\n  printf(\"row sum:\");\n  for (j=0; j<n; j++) { printf(\" %.2f\", r[j]); }\n  printf(\"\\ncol sum:\");\n  for (j=0; j<n; j++) { printf(\" %.2f\", c[j]); }\n  printf(\"\\nswap row %d and %d\\n\", i, k);\n  row_swap(n, A, i, k);\n  matrix_print(n, A);\n  return 0;\n}\n",
"matrowio.c": "#include <stdio.h>\n#include \"matrow.h\"\n\nvoid matrix_scan(int n, double A[N][N])\n{\n  int i, j;\n  for (i=0; i<n; i++) {\n    for (j=0; j<n; j++) {\n      fprintf(stderr, \"A[%d][%d] = \", i, j);\n      scanf(\"%lf\", &A[i][j]);\n    }\n  }\n}\n\nvoid matrix_print(int n, double A[N][N])\n{\n  int i, j;\n  for (i=0; i<n; i++) {\n    for (j=0; j<n; j++) {\n      printf(\" %8.3f\", A[i][j]);\n    }\n    printf(\"\\n\");\n  }\n}\n",
"matrow.c": "#include \"matrow.h\"\n\nvoid row_col_sum(int n, double A[N][N], double r[N], double c[N])\n{\n  int i, j;\n  for (i=0; i<n; i++) { r[i] = 0.0; c[i] = 0.0; }\n  for (i=0; i<n; i++) {\n    for (j=0; j<n; j++) {\n      r[i] += A[i][j];\n      c[j] += A[i][j];\n    }\n  }\n}\n\nvoid row_swap(int n, double A[N][N], int i, int k)\n{\n  int j;\n  double tmp;\n  for (j=0; j<n; j++) {\n    tmp = A[i][j];\n    A[i][j] = A[k][j];\n    A[k][j] = tmp;\n  }\n}\n",
"sample.c": "#include <stdio.h>    /* 標準入出力関数に必要 */\n#include <math.h>     /* sqrt, fabs 等に必要 */\n#include <stdlib.h>   /* rand や exit 等に必要 */\n#include <string.h>   /* strcpy, strlen, strcmp 等に必要 */\n\n#define N_ARRAY 5\n#define N_RAND 10\n#define STR_LEN 31\n#define STR_FMT \"%31s\"\n\ndouble mult(double x, double y)\n{\n  double m = x * y;\n  return m;\n}\n\nvoid int_rand(void)\n{\n  int i;\n  printf(\"RAND_MAX = %d\\n\", RAND_MAX);\n  for (i=0; i<N_RAND; i++) {\n    printf(\"rand() = %d\\n\", rand());\n  }\n}\n\nvoid str_scan_cpy(void)\n{\n  char name1[STR_LEN+1];\n  char name2[STR_LEN+1];\n  strcpy(name1, \"Apple\");\n  printf(\"name1 = %s\\n\", name1);\n  fprintf(stderr, \"name2 (string) = \");\n  scanf(STR_FMT, name2);\n  printf(\"name2 = %s\\n\", name2);\n  if (strcmp(name1,name2)==0) { printf(\"name1 == name2\\n\"); }\n  else { printf(\"name1 != name2\\n\"); }\n}\n\nvoid double_scan_sqrt(void)\n{\n  int i;\n  int n;\n  double a[N_ARRAY];\n  for (n=0; n<N_ARRAY; n++) {\n    fprintf(stderr, \"a[%d] (double) = \", n);\n    if (scanf(\"%lf\", &a[n])==EOF) { break; }\n  }\n  for (i=0; i<n; i++) {\n    if (a[i]<0) {\n      fprintf(stderr, \"a[%d]<0\", i);\n      exit(1);\n    }\n    a[i] = mult(sqrt(a[i]),a[i]);\n  }\n  for (i=0; i<n; i++) {\n    printf(\"%5.3f\\n\", a[i]);\n  }\n}\n\nint main(void)\n{\n  int_rand();\n  str_scan_cpy();\n  double_scan_sqrt();\n  return 0;\n}\n"
},
"tests": {
"hms": [
{
"stdin": "0\n59\n60\n3599\n3661\n86399\n",
"expect": "0 sec = 0:00:00\n59 sec = 0:00:59\n60 sec = 0:01:00\n3599 sec = 0:59:59\n3661 sec = 1:01:01\n86399 sec = 23:59:59\n",
"exit": 0
},
{
"stdin": "7200\n45296\n1\n100000\n",
"expect": "7200 sec = 2:00:00\n45296 sec = 12:34:56\n1 sec = 0:00:01\n100000 sec = 27:46:40\n",
"exit": 0
},
{
"stdin": "5\n",
"expect": "5 sec = 0:00:05\n",
"exit": 0
}
],
"tri": [
{
"stdin": "0 0 4 0 0 3\n1 1 3 2 2 5\n-1.5 2 3.5 -1 0.5 4.25\n",
"expect": "S = 6.0000  G = (1.3333, 1.0000)\nS = 3.5000  G = (2.0000, 2.6667)\nS = 8.6250  G = (0.8333, 1.7500)\n",
"exit": 0
},
{
"stdin": "0 0 1 1 2 2\n3 4 0 0 4 -3\n10 10 10 20 0 10\n",
"expect": "S = 0.0000  G = (1.0000, 1.0000)\nS = 12.5000  G = (2.3333, 0.3333)\nS = 50.0000  G = (6.6667, 13.3333)\n",
"exit": 0
},
{
"stdin": "0 0 0 3 4 0\n2 2 -1 5 -3 -2\n",
"expect": "S = 6.0000  G = (1.3333, 1.0000)\nS = 13.5000  G = (-0.6667, 1.6667)\n",
"exit": 0
}
],
"dice2": [
{
"stdin": "1000\n",
"expect": " 2:    21 **\n 3:    51 *****\n 4:    88 ********\n 5:   107 **********\n 6:   137 *************\n 7:   176 *****************\n 8:   125 ************\n 9:   117 ***********\n10:    89 ********\n11:    63 ******\n12:    26 **\n",
"exit": 0
},
{
"stdin": "1\n",
"expect": " 2:     0 \n 3:     0 \n 4:     0 \n 5:     0 \n 6:     0 \n 7:     1 ****************************************************************************************************\n 8:     0 \n 9:     0 \n10:     0 \n11:     0 \n12:     0 \n",
"exit": 0
},
{
"stdin": "10000\n",
"expect": " 2:   289 **\n 3:   575 *****\n 4:   872 ********\n 5:  1110 ***********\n 6:  1442 **************\n 7:  1602 ****************\n 8:  1333 *************\n 9:  1128 ***********\n10:   833 ********\n11:   540 *****\n12:   276 **\n",
"exit": 0
},
{
"stdin": "20\n",
"expect": " 2:     0 \n 3:     4 ********************\n 4:     2 **********\n 5:     1 *****\n 6:     3 ***************\n 7:     1 *****\n 8:     4 ********************\n 9:     3 ***************\n10:     1 *****\n11:     0 \n12:     1 *****\n",
"exit": 0
}
],
"mat": [
{
"stdin": "2\n1 2\n3 4\n5 6\n7 8\n",
"expect": "C = AB\n   19.000   22.000\n   43.000   50.000\ntr(C) = 69.000\n",
"exit": 0
},
{
"stdin": "3\n1 0 2\n-1 3 1\n0.5 2 -2\n2 1 0\n0 -1 4\n1.5 0 1\n",
"expect": "C = AB\n    5.000    1.000    2.000\n   -0.500   -4.000   13.000\n   -2.000   -1.500    6.000\ntr(C) = 7.000\n",
"exit": 0
},
{
"stdin": "4\n1 2 0 0\n0 1 2 0\n0 0 1 2\n2 0 0 1\n1 0 0 0\n0 2 0 0\n0 0 3 0\n1 1 1 1\n",
"expect": "C = AB\n    1.000    4.000    0.000    0.000\n    0.000    2.000    6.000    0.000\n    2.000    2.000    5.000    2.000\n    3.000    1.000    1.000    1.000\ntr(C) = 9.000\n",
"exit": 0
},
{
"stdin": "1\n-2.5\n4\n",
"expect": "C = AB\n  -10.000\ntr(C) = -10.000\n",
"exit": 0
}
],
"stat": [
{
"stdin": "1 2 3 4 5\n",
"expect": "n = 5\nave = 3.000\nsd = 1.414\n",
"exit": 0
},
{
"stdin": "2.5 2.5 2.5\n",
"expect": "n = 3\nave = 2.500\nsd = 0.000\n",
"exit": 0
},
{
"stdin": "3 -1 4\n",
"expect": "",
"exit": 1
},
{
"stdin": "1 2 3 4 5 6 7 8 9 10 11 12\n",
"expect": "n = 10\nave = 5.500\nsd = 2.872\n",
"exit": 0
},
{
"stdin": "",
"expect": "",
"exit": 1
},
{
"stdin": "10 20\n",
"expect": "n = 2\nave = 15.000\nsd = 5.000\n",
"exit": 0
}
],
"word": [
{
"stdin": "Apple\nBanana Apple apple\nCherry Apple\n",
"expect": "words = 5\nsame as Apple = 2\nlongest = Banana (6)\n",
"exit": 0
},
{
"stdin": "C\nC C++ Java C Python C\n",
"expect": "words = 6\nsame as C = 3\nlongest = Python (6)\n",
"exit": 0
},
{
"stdin": "pneumonoultramicroscopic\n",
"expect": "words = 0\nsame as pneumonoultramicroscopic = 0\nlongest = pneumonoultramicroscopic (24)\n",
"exit": 0
},
{
"stdin": "apple\nApple APPLE apple pie\n",
"expect": "words = 4\nsame as apple = 1\nlongest = apple (5)\n",
"exit": 0
}
],
"sort3": [
{
"stdin": "3 1 2\n5 5 1\n-1 -7 0\n",
"expect": "1 2 3\n1 5 5\n-7 -1 0\n",
"exit": 0
},
{
"stdin": "1 2 3\n3 2 1\n2 3 1\n",
"expect": "1 2 3\n1 2 3\n1 2 3\n",
"exit": 0
},
{
"stdin": "4 4 4\n-5 0 -5\n100 -100 0\n",
"expect": "4 4 4\n-5 -5 0\n-100 0 100\n",
"exit": 0
},
{
"stdin": "2 1 3\n1 3 2\n",
"expect": "1 2 3\n1 2 3\n",
"exit": 0
}
],
"item": [
{
"stdin": "20\napple 120 3\nbanana 98 5\n",
"expect": "apple 96 x 3 = 288\nbanana 78 x 5 = 390\ntotal = 678\n",
"exit": 0
},
{
"stdin": "0\npen 150 2\n",
"expect": "pen 150 x 2 = 300\ntotal = 300\n",
"exit": 0
},
{
"stdin": "35\nnote 199 7\ncake 333 1\ntea 101 10\n",
"expect": "note 129 x 7 = 903\ncake 216 x 1 = 216\ntea 65 x 10 = 650\ntotal = 1769\n",
"exit": 0
},
{
"stdin": "10\n",
"expect": "total = 0\n",
"exit": 0
},
{
"stdin": "99\ngold 1000 3\n",
"expect": "gold 10 x 3 = 30\ntotal = 30\n",
"exit": 0
}
],
"dicerun": [
{
"stdin": "30\n",
"expect": "1:     3\n2:     9\n3:     6\n4:     4\n5:     5\n6:     3\nlongest run: 3 x 3\n",
"exit": 0
},
{
"stdin": "1\n",
"expect": "1:     0\n2:     1\n3:     0\n4:     0\n5:     0\n6:     0\nlongest run: 2 x 1\n",
"exit": 0
},
{
"stdin": "2\n",
"expect": "1:     0\n2:     1\n3:     0\n4:     0\n5:     1\n6:     0\nlongest run: 2 x 1\n",
"exit": 0
},
{
"stdin": "5000\n",
"expect": "1:   812\n2:   822\n3:   869\n4:   827\n5:   828\n6:   842\nlongest run: 1 x 5\n",
"exit": 0
}
],
"sym": [
{
"stdin": "2\n1 2\n3 4\n",
"expect": "A\n    1.000    2.000\n    3.000    4.000\nA + A^T\n    2.000    5.000\n    5.000    8.000\nA: not symmetric\nA + A^T: symmetric\n",
"exit": 0
},
{
"stdin": "1\n-2.5\n",
"expect": "A\n   -2.500\nA + A^T\n   -5.000\nA: symmetric\nA + A^T: symmetric\n",
"exit": 0
},
{
"stdin": "3\n1 2 3\n2 5 6\n3 6 9\n",
"expect": "A\n    1.000    2.000    3.000\n    2.000    5.000    6.000\n    3.000    6.000    9.000\nA + A^T\n    2.000    4.000    6.000\n    4.000   10.000   12.000\n    6.000   12.000   18.000\nA: symmetric\nA + A^T: symmetric\n",
"exit": 0
},
{
"stdin": "4\n1 0 0 2\n0 1 0 0\n0 0 1 0\n0 0 0 1\n",
"expect": "A\n    1.000    0.000    0.000    2.000\n    0.000    1.000    0.000    0.000\n    0.000    0.000    1.000    0.000\n    0.000    0.000    0.000    1.000\nA + A^T\n    2.000    0.000    0.000    2.000\n    0.000    2.000    0.000    0.000\n    0.000    0.000    2.000    0.000\n    2.000    0.000    0.000    2.000\nA: not symmetric\nA + A^T: symmetric\n",
"exit": 0
}
],
"minmax": [
{
"stdin": "3.5 -1 8 2.25\n",
"expect": "n = 4\nmin = -1.00\nmax = 8.00\nave = 3.188\n",
"exit": 0
},
{
"stdin": "-3 -1.5 -8 -2\n",
"expect": "n = 4\nmin = -8.00\nmax = -1.50\nave = -3.625\n",
"exit": 0
},
{
"stdin": "42\n",
"expect": "n = 1\nmin = 42.00\nmax = 42.00\nave = 42.000\n",
"exit": 0
},
{
"stdin": "",
"expect": "",
"exit": 1
},
{
"stdin": "5 5 5 5\n",
"expect": "n = 4\nmin = 5.00\nmax = 5.00\nave = 5.000\n",
"exit": 0
},
{
"stdin": "0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1.0 1.1 1.2\n",
"expect": "n = 12\nmin = 0.10\nmax = 1.20\nave = 0.650\n",
"exit": 0
},
{
"stdin": "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101\n",
"expect": "n = 100\nmin = 1.00\nmax = 100.00\nave = 50.500\n",
"exit": 0
}
],
"circle": [
{
"stdin": "0 0 1  3 0 1\n0 0 1  2 0 1\n0 0 2  1 0 2\n0 0 5  1 1 1\n",
"expect": "S1 = 3.142, S2 = 3.142, separate\nS1 = 3.142, S2 = 3.142, touch\nS1 = 12.566, S2 = 12.566, intersect\nS1 = 78.540, S2 = 3.142, contain\n",
"exit": 0
},
{
"stdin": "1 1 1  1 1 4\n0 0 1.5  3 0 1.5\n0 0 3  1 0 2\n",
"expect": "S1 = 3.142, S2 = 50.265, contain\nS1 = 7.069, S2 = 7.069, touch\nS1 = 28.274, S2 = 12.566, contain\n",
"exit": 0
},
{
"stdin": "2 2 1  2 2 1\n-1 -1 0.5  1 1 0.5\n",
"expect": "S1 = 3.142, S2 = 3.142, contain\nS1 = 0.785, S2 = 0.785, separate\n",
"exit": 0
}
],
"hist": [
{
"stdin": "500\n",
"expect": "  0-  9:     9 \n 10- 19:    41 ####\n 20- 29:    38 ###\n 30- 39:    68 ######\n 40- 49:    92 #########\n 50- 59:   100 ##########\n 60- 69:    62 ######\n 70- 79:    52 #####\n 80- 89:    26 ##\n 90-100:    12 #\n",
"exit": 0
},
{
"stdin": "1\n",
"expect": "  0-  9:     0 \n 10- 19:     0 \n 20- 29:     0 \n 30- 39:     0 \n 40- 49:     0 \n 50- 59:     1 ##################################################\n 60- 69:     0 \n 70- 79:     0 \n 80- 89:     0 \n 90-100:     0 \n",
"exit": 0
},
{
"stdin": "10000\n",
"expect": "  0-  9:   205 #\n 10- 19:   617 ###\n 20- 29:  1020 #####\n 30- 39:  1414 #######\n 40- 49:  1774 ########\n 50- 59:  1741 ########\n 60- 69:  1401 #######\n 70- 79:   964 ####\n 80- 89:   589 ##\n 90-100:   275 #\n",
"exit": 0
},
{
"stdin": "37\n",
"expect": "  0-  9:     0 \n 10- 19:     3 ####\n 20- 29:     2 ##\n 30- 39:     8 ##########\n 40- 49:     6 ########\n 50- 59:     7 #########\n 60- 69:     4 #####\n 70- 79:     4 #####\n 80- 89:     2 ##\n 90-100:     1 #\n",
"exit": 0
}
],
"matrow": [
{
"stdin": "3\n1 2 3\n4 5 6\n7 8 9\n0 2\n",
"expect": "row sum: 6.00 15.00 24.00\ncol sum: 12.00 15.00 18.00\nswap row 0 and 2\n    7.000    8.000    9.000\n    4.000    5.000    6.000\n    1.000    2.000    3.000\n",
"exit": 0
},
{
"stdin": "1\n-4.5\n0 0\n",
"expect": "row sum: -4.50\ncol sum: -4.50\nswap row 0 and 0\n   -4.500\n",
"exit": 0
},
{
"stdin": "5\n1 0 0 0 2\n0 3 0 0 0\n0 0 5 0 0\n4 0 0 7 0\n0 0 6 0 9\n1 4\n",
"expect": "row sum: 3.00 3.00 5.00 11.00 15.00\ncol sum: 5.00 3.00 11.00 7.00 11.00\nswap row 1 and 4\n    1.000    0.000    0.000    0.000    2.000\n    0.000    0.000    6.000    0.000    9.000\n    0.000    0.000    5.000    0.000    0.000\n    4.000    0.000    0.000    7.000    0.000\n    0.000    3.000    0.000    0.000    0.000\n",
"exit": 0
},
{
"stdin": "4\n1.5 2 0 -1\n3 3 3 3\n0 0 0 1\n-2 4 6 8\n3 3\n",
"expect": "row sum: 2.50 12.00 1.00 16.00\ncol sum: 2.50 9.00 9.00 11.00\nswap row 3 and 3\n    1.500    2.000    0.000   -1.000\n    3.000    3.000    3.000    3.000\n    0.000    0.000    0.000    1.000\n   -2.000    4.000    6.000    8.000\n",
"exit": 0
}
]
},
"sample": {
"in": "Apple\n1 4 9\n",
"exp": "RAND_MAX = 2147483647\nrand() = 1804289383\nrand() = 846930886\nrand() = 1681692777\nrand() = 1714636915\nrand() = 1957747793\nrand() = 424238335\nrand() = 719885386\nrand() = 1649760492\nrand() = 596516649\nrand() = 1189641421\nname1 = Apple\nname2 = Apple\nname1 == name2\n1.000\n8.000\n27.000\n",
"in2": "apple\n1 4 -9 16\n",
"exp2": "RAND_MAX = 2147483647\nrand() = 1804289383\nrand() = 846930886\nrand() = 1681692777\nrand() = 1714636915\nrand() = 1957747793\nrand() = 424238335\nrand() = 719885386\nrand() = 1649760492\nrand() = 596516649\nrand() = 1189641421\nname1 = Apple\nname2 = apple\nname1 != name2\n",
"rc2": 1
}
};
