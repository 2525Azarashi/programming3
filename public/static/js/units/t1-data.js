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
