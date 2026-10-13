/* 自動生成: 検証済み模範解答と配布ファイル */
window.B3_DATA = {
 "sol": {
  "3-1": {
   "pointer1.c": "#include <stdio.h>\n\nint main(void)\n{\n  int a = 1;\n  int b = 2;\n  double x = 1.5;\n  double y = 2.5;\n\n  printf(\"a の番地は %p\\n\", (void *)&a);\n  printf(\"b の番地は %p\\n\", (void *)&b);\n  printf(\"x の番地は %p\\n\", (void *)&x);\n  printf(\"y の番地は %p\\n\", (void *)&y);\n\n  return 0;\n}\n"
  },
  "3-2": {
   "pointer2.c": "#include <stdio.h>\n\nint main(void)\n{\n  int a = 1;\n  int b = 2;\n  double x = 1.5;\n  double y = 2.5;\n\n  printf(\"a の番地は %p\\n\", (void *)&a);\n  printf(\"b の番地は %p\\n\", (void *)&b);\n  printf(\"x の番地は %p\\n\", (void *)&x);\n  printf(\"y の番地は %p\\n\", (void *)&y);\n\n  /* 表示された番地を直接指定して値を書き換える (番地は実行環境に合わせて変更する) */\n  *((int *)0x64) = 1111;      /* a に 1111 を書き込む */\n  *((int *)0x68) = 2222;      /* b に 2222 を書き込む */\n  *((double *)0x6c) = 3.14;   /* x に 3.14 を書き込む */\n  *((double *)0x74) = 2.71;   /* y に 2.71 を書き込む */\n\n  printf(\"\\n\");\n  printf(\"a の値 = %d\\n\", a);\n  printf(\"b の値 = %d\\n\", b);\n  printf(\"x の値 = %f\\n\", x);\n  printf(\"y の値 = %f\\n\", y);\n\n  return 0;\n}\n"
  },
  "3-3": {
   "pointer3.c": "#include <stdio.h>\n\nint main(void)\n{\n  int a = 1;\n  int b = 2;\n  double x = 1.5;\n  double y = 2.5;\n  int *pi;\n  double *pd;\n\n  printf(\"a の番地は %p\\n\", (void *)&a);\n  printf(\"b の番地は %p\\n\", (void *)&b);\n  printf(\"x の番地は %p\\n\", (void *)&x);\n  printf(\"y の番地は %p\\n\", (void *)&y);\n\n  /* ポインタ変数を用いて b に 4 を足し, x を 2 倍する */\n  pi = &b;\n  *pi = *pi + 4;\n  pd = &x;\n  *pd = *pd * 2;\n\n  printf(\"a = %d, b = %d, x = %f, y = %f\\n\", a, b, x, y);\n\n  /* 入力した番地の double 型の内容を表示 (0 で終了) */\n  for (;;) {\n    fprintf(stderr, \"番地を入力 : \");\n    if (scanf(\"%p\", (void **)&pd) == EOF) { break; }\n    if (pd == NULL) { break; }\n    printf(\"%p 番地の内容は %f\\n\", (void *)pd, *pd);\n  }\n\n  return 0;\n}\n"
  },
  "3-4": {
   "divrem.c": "#include <stdio.h>\n\nvoid divrem(int x, int y, int *q, int *r)\n{\n  *q = x / y;   /* 商を q 番地に格納 */\n  *r = x % y;   /* 剰余を r 番地に格納 */\n}\n\nint main(void)\n{\n  int x = 10, y = 3;\n  int q, r;\n  divrem(x, y, &q, &r);\n  printf(\"x / y = %d ... %d\\n\", q, r);\n  return 0;\n}\n"
  },
  "3-5": {
   "ave6.c": "#include <math.h>\n#include \"ave6.h\"\n\nvoid ave(double a, double b, double *p_a, double *p_m)\n{\n  *p_a = (a + b) / 2.0;   /* 相加平均 */\n  *p_m = sqrt(a * b);     /* 相乗平均 */\n}\n"
  },
  "3-6": {
   "qeq3.c": "#include <math.h>\n#include \"qeq3.h\"\n\nint qeq(double a, double b, double c, double *x1, double *x2)\n{\n  double d = b * b - 4 * a * c;   /* 判別式 */\n  double s1, s2, t;\n\n  if (d > 0) {\n    s1 = (-b - sqrt(d)) / (2 * a);\n    s2 = (-b + sqrt(d)) / (2 * a);\n    if (s1 > s2) { t = s1; s1 = s2; s2 = t; }   /* 小さい方を先に */\n    *x1 = s1;\n    *x2 = s2;\n    return 2;\n  }\n  else if (d == 0) {\n    *x1 = -b / (2 * a);\n    return 1;\n  }\n  return 0;\n}\n"
  },
  "3-7": {
   "dist5.c": "#include <stdio.h>\n#include <math.h>\n#include \"dist5.h\"\n\nint point_scan(point_t *p)\n{\n  if (scanf(\"%lf\", &p->x) == EOF) { return EOF; }\n  if (scanf(\"%lf\", &p->y) == EOF) { return EOF; }\n  return 1;\n}\n\ndouble dist(point_t *p1, point_t *p2)\n{\n  double dx = p2->x - p1->x;\n  double dy = p2->y - p1->y;\n  return sqrt(dx * dx + dy * dy);\n}\n"
  },
  "3-8": {
   "arrayp.c": "#include <stdio.h>\n\nint main(void)\n{\n  int x[] = {0, 10, 20, 30, 40};\n  int k, i;\n  int *p;\n\n  /* 1. 要素数 */\n  k = sizeof(x) / sizeof(x[0]);\n  printf(\"1. k = %d\\n\", k);\n\n  /* 2. x[i] のアドレス */\n  printf(\"2.\\n\");\n  for (i = 0; i < k; i++) {\n    printf(\"  &x[%d] = %p\\n\", i, (void *)&x[i]);\n  }\n\n  /* 3. x の値 */\n  printf(\"3. x = %p\\n\", (void *)x);\n\n  /* 4. x+i の値 */\n  printf(\"4.\\n\");\n  for (i = 0; i < k; i++) {\n    printf(\"  x+%d = %p\\n\", i, (void *)(x + i));\n  }\n\n  /* 5. *(x+i) の値 */\n  printf(\"5.\\n\");\n  for (i = 0; i < k; i++) {\n    printf(\"  *(x+%d) = %d\\n\", i, *(x + i));\n  }\n\n  /* 6. p = &x[2] */\n  p = &x[2];\n  printf(\"6. p = %p, p+2 = %p, p[2] = %d\\n\", (void *)p, (void *)(p + 2), p[2]);\n\n  return 0;\n}\n"
  },
  "3-9": {
   "ave_max.c": "#include <stdio.h>\n#include \"ave_max.h\"\n\nint array_scan(int a[ ])\n{\n  int i;\n  for (i = 0; i < MAX; i++) {   /* 最大サイズを超えて読まない */\n    if (scanf(\"%d\", &a[i]) == EOF) { break; }\n  }\n  return i;\n}\n\nvoid array_ave_max(int n, int a[ ], double *ave, int *max)\n{\n  int i;\n  int sum = 0;\n\n  *max = a[0];\n  for (i = 0; i < n; i++) {\n    sum += a[i];\n    if (a[i] > *max) { *max = a[i]; }\n  }\n  *ave = (double)sum / n;\n}\n"
  },
  "3-10": {
   "dice3sub.c": "#include <stdlib.h>\n#include \"dice3sub.h\"\n\nvoid dice_throw(int d[ ], int n)\n{\n  int i;\n  for (i = 0; i < n; i++) {\n    d[i] = rand() % 6 + 1;   /* 1〜6 の一様乱数 */\n  }\n}\n\nvoid dice3_distr(int n, int d1[ ], int d2[ ], int d3[ ], int c[ ])\n{\n  int i, s;\n\n  for (s = D3_MIN; s <= D3_MAX; s++) {   /* 回数を 0 に初期化 */\n    c[s] = 0;\n  }\n  for (i = 0; i < n; i++) {\n    s = d1[i] + d2[i] + d3[i];\n    c[s]++;\n  }\n}\n"
  },
  "opt1": {
   "exam100.c": "#include <stdio.h>\n#include <math.h>\n\n#define N_CLASS 21   /* 0-4, 5-9, ..., 95-99, 100 の 21 区間 */\n\ndouble myrand(void)\n{\n  static unsigned long r = 53402397UL;\n  r = (65539UL * r + 125654UL) & 0x7fffffffUL;\n  return r / (double) 0x80000000UL;\n}\n\n/* 平均 mu, 標準偏差 sigma の正規乱数 (ボックス=ミュラー法) */\ndouble nrand(double mu, double sigma)\n{\n  double u1, u2;\n  do { u1 = myrand(); } while (u1 <= 0.0);   /* log(0) を避ける */\n  u2 = myrand();\n  return mu + sigma * sqrt(-2.0 * log(u1)) * cos(2.0 * M_PI * u2);\n}\n\n/* 正規乱数を 0〜100 の整数点数に補正する */\nint score_rand(double mu, double sigma)\n{\n  int s = (int)floor(nrand(mu, sigma) + 0.5);   /* 四捨五入 */\n  if (s < 0)   { s = 0; }\n  if (s > 100) { s = 100; }\n  return s;\n}\n\nint main(void)\n{\n  double mu, sigma;\n  int n, i, s;\n  double sum = 0.0, sum2 = 0.0, ave, sd;\n  int count[N_CLASS] = {0};\n\n  fprintf(stderr, \"平均 = \");\n  if (scanf(\"%lf\", &mu) != 1) { return 1; }\n  fprintf(stderr, \"標準偏差 = \");\n  if (scanf(\"%lf\", &sigma) != 1) { return 1; }\n  fprintf(stderr, \"受験者数 = \");\n  if (scanf(\"%d\", &n) != 1 || n <= 0) { return 1; }\n\n  for (i = 0; i < n; i++) {\n    s = score_rand(mu, sigma);\n    sum  += s;\n    sum2 += (double)s * s;\n    count[s / 5]++;\n  }\n  ave = sum / n;\n  sd  = sqrt(sum2 / n - ave * ave);   /* 分散 = 二乗和の平均 - 平均の二乗 */\n\n  printf(\"受験者数 %d, 平均 %.2f, 標準偏差 %.2f\\n\", n, ave, sd);\n  for (i = 0; i < N_CLASS; i++) {\n    if (i < N_CLASS - 1) { printf(\"%3d-%3d: %6d\\n\", i * 5, i * 5 + 4, count[i]); }\n    else                 { printf(\"    100: %6d\\n\", count[i]); }\n  }\n  return 0;\n}\n"
  },
  "opt2": {
   "strpool.c": "#include <stdio.h>\n#include <string.h>\n\n#define POOL_SIZE 512\n#define WORD_MAX 32\n\nchar pool[POOL_SIZE];\nchar* word[WORD_MAX];\nchar* next;\n\nint main(void)\n{\n  char buf[POOL_SIZE];\n  int n = 0, i;\n  size_t len;\n\n  next = pool;\n  for (;;) {\n    if (n >= WORD_MAX) { break; }\n    fprintf(stderr, \"next word = \");\n    if (scanf(\"%511s\", buf) == EOF) { break; }\n    len = strlen(buf);\n    if (next + len + 1 > pool + POOL_SIZE) { break; }   /* pool があふれる */\n    strcpy(next, buf);      /* pool の空き位置に単語をコピー */\n    word[n++] = next;       /* 単語の先頭番地を記録 */\n    next += len + 1;        /* '\\0' の次を新しい空き位置にする */\n  }\n  fprintf(stderr, \"\\n\");\n\n  printf(\"pool    = (%p)\\n\", (void *)pool);\n  for (i = 0; i < n; i++) {\n    printf(\"word[%d] = (%p) \\\"%s\\\"\\n\", i, (void *)word[i], word[i]);\n  }\n  printf(\"next    = (%p)\\n\", (void *)next);\n  return 0;\n}\n"
  }
 },
 "given": {
  "3-5": {
   "ave6.h": "void ave(double a, double b, double *p_a, double *p_m);\n",
   "ave6main.c": "#include <stdio.h>\n#include \"ave6.h\"\n\nint main(void)\n{\n   double a;\n   double b;\n   double ave_a;      /* 相加平均 */\n   double ave_m;      /* 相乗平均 */\n   for (;;) {\n      fprintf(stderr, \"2つの実数 a, b を入力して下さい: \");\n      if (scanf(\"%lf\", &a)==EOF) { break; }\n      if (scanf(\"%lf\", &b)==EOF) { break; }\n      ave( a, b, &ave_a, &ave_m );\n      printf(\"%0.3f %0.3f\\n\", ave_a, ave_m);\n   }\n   return 0;\n}\n"
  },
  "3-6": {
   "qeq3.h": "int qeq(double a, double b, double c, double *x1, double *x2);\n",
   "qeq3main.c": "#include <stdio.h>\n#include <math.h>\n#include <float.h>\n#include <assert.h>\n#include \"qeq3.h\"\n\nint main(void)\n{\n   double a, b, c; /* 方程式の係数 */\n   int n;           /* 解の個数 */\n   double x1, x2;   /* 解 */\n   for (;;) {\n      scanf(\"%lf\", &a);\n      if (fabs(a)<DBL_EPSILON) { break; } /* aのゼロ判定 */\n      scanf(\"%lf\", &b);\n      scanf(\"%lf\", &c);\n      n = qeq(a,b,c,&x1,&x2);\n      if (n==0) {\n        printf(\"\\n\");\n      }\n      else if (n==1) {\n        printf(\"%0.5f\\n\", x1);\n      }\n      else if (n==2) {\n        printf(\"%0.5f %0.5f\\n\", x1, x2);\n      }\n      else {\n        assert(0); /* ここに来たらエラー */\n      }\n   }\n   return 0;\n}\n"
  },
  "3-7": {
   "dist5.h": "typedef struct {\n  double x;   /* x座標 */\n  double y;   /* y座標 */\n} point_t;\n\nint point_scan(point_t *p);\ndouble dist(point_t *p1, point_t *p2);\n",
   "dist5main.c": "#include <stdio.h>\n#include \"dist5.h\"\n\nint main(void)\n{\n   point_t p1, p2;\n   for (;;) {\n     if(point_scan(&p1)==EOF) { break; }\n     if(point_scan(&p2)==EOF) { break; }\n     printf(\"%0.4f\\n\", dist(&p1, &p2));\n   }\n   return 0;\n}\n"
  },
  "3-9": {
   "ave_max.h": "#define MAX 32\nint array_scan(int a[ ]);\nvoid array_ave_max(int n, int a[ ], double *ave, int *max);\n",
   "ave_max_main.c": "#include <stdio.h>\n#include \"ave_max.h\"\nint main(void)\n{\n   int a[MAX];\n   int n;\n   double ave;\n   int max;\n   n = array_scan(a);\n   array_ave_max(n, a, &ave, &max);\n   printf(\"%0.3f %d\\n\", ave, max);\n   return 0;\n}\n"
  },
  "3-10": {
   "dice3sub.h": "#define N_MAX 1024\n#define D3_MIN (1+1+1)\n#define D3_MAX (6+6+6)\nvoid dice_throw(int d[ ], int n);\nvoid dice3_distr(int n, int d1[ ], int d2[ ], int d3[ ], int c[ ]);\n",
   "dice3.c": "#include <stdio.h>\n#include <stdlib.h>\n#include <assert.h>\n#include \"dice3sub.h\"\n\nint main(void)\n{\n   int d1[N_MAX];   /* 1個目のサイコロの出目の系列 */\n   int d2[N_MAX];   /* 2個目のサイコロの出目の系列 */\n   int d3[N_MAX];   /* 3個目のサイコロの出目の系列 */\n   int n;           /* サイコロを振る回数 */\n   int c[D3_MAX+1]; /* 目の和の出現回数 */\n   int i;\n\n   fprintf(stderr, \"サイコロを振る回数 n = \");\n   scanf(\"%d\", &n);\n   assert(0<n && n<=N_MAX);\n   srand(1);\n   for (i=D3_MIN; i<=D3_MAX; i++) {\n      c[i] = rand();\n   }\n\n   srand(1);\n   dice_throw(d1, n);\n   dice_throw(d2, n);\n   dice_throw(d3, n);\n   dice3_distr(n, d1, d2, d3, c);\n   for (i=D3_MIN; i<=D3_MAX; i++) {\n      printf(\"%2d: %6d\\n\", i, c[i]);\n   }\n   return 0;\n}\n"
  }
 }
};
