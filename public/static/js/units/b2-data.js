/* 自動生成 (b3_work/gen/gen.py): gcc で検証済みの模範解答・配布ファイル・期待値 */
window.B2_DATA = {
 "sol": {
  "2-1": {
   "dist2.c": "#include <stdio.h>\n#include <math.h>\n\n#define REPEAT 3\n\ndouble dist(double x1, double y1, double x2, double y2);\n\nint main(void)\n{\n    int r;\n    double x1, y1, x2, y2;\n\n    for (r = 0; r < REPEAT; r++) {\n        fprintf(stderr, \"x1 y1 x2 y2 を入力して下さい: \");\n        scanf(\"%lf %lf %lf %lf\", &x1, &y1, &x2, &y2);\n        printf(\"%0.4f\\n\", dist(x1, y1, x2, y2));\n    }\n    return 0;\n}\n\ndouble dist(double x1, double y1, double x2, double y2)\n{\n    double dx = x2 - x1;\n    double dy = y2 - y1;\n    return sqrt(dx * dx + dy * dy);\n}\n"
  },
  "2-2": {
   "qeq.c": "#include <stdio.h>\n#include <math.h>\n#include <float.h>\n\nvoid qeq(double a, double b, double c);\n\nint main(void)\n{\n    double a, b, c;\n\n    for (;;) {\n        fprintf(stderr, \"a b c を入力して下さい (a=0 で終了): \");\n        scanf(\"%lf\", &a);\n        if (fabs(a) < DBL_EPSILON) { break; }\n        scanf(\"%lf\", &b);\n        scanf(\"%lf\", &c);\n        qeq(a, b, c);\n    }\n    return 0;\n}\n\nvoid qeq(double a, double b, double c)\n{\n    double d = b * b - 4 * a * c;   /* 判別式 */\n    double x1, x2, t;\n\n    if (d > 0) {\n        x1 = (-b - sqrt(d)) / (2 * a);\n        x2 = (-b + sqrt(d)) / (2 * a);\n        if (x1 > x2) { t = x1; x1 = x2; x2 = t; }   /* 小さい順に */\n        printf(\"%0.5f %0.5f\\n\", x1, x2);\n    } else if (d == 0) {\n        printf(\"%0.5f\\n\", -b / (2 * a));\n    } else {\n        printf(\"\\n\");   /* 解なし: 改行のみ */\n    }\n}\n"
  },
  "2-3": {
   "dist3main.c": "#include <stdio.h>\n#include \"dist3.h\"\n\n#define REPEAT 3\n\nint main(void)\n{\n    int r;\n    double x1, y1, x2, y2;\n\n    for (r = 0; r < REPEAT; r++) {\n        fprintf(stderr, \"x1 y1 x2 y2 を入力して下さい: \");\n        scanf(\"%lf %lf %lf %lf\", &x1, &y1, &x2, &y2);\n        printf(\"%0.4f\\n\", dist(x1, y1, x2, y2));\n    }\n    return 0;\n}\n",
   "dist3.c": "#include <math.h>\n#include \"dist3.h\"\n\ndouble dist(double x1, double y1, double x2, double y2)\n{\n    double dx = x2 - x1;\n    double dy = y2 - y1;\n    return sqrt(dx * dx + dy * dy);\n}\n",
   "dist3.h": "double dist(double x1, double y1, double x2, double y2);\n"
  },
  "2-4": {
   "qeq2main.c": "#include <stdio.h>\n#include <math.h>\n#include <float.h>\n#include \"qeq2.h\"\n\nint main(void)\n{\n    double a, b, c;\n\n    for (;;) {\n        fprintf(stderr, \"a b c を入力して下さい (a=0 で終了): \");\n        scanf(\"%lf\", &a);\n        if (fabs(a) < DBL_EPSILON) { break; }\n        scanf(\"%lf\", &b);\n        scanf(\"%lf\", &c);\n        qeq(a, b, c);\n    }\n    return 0;\n}\n",
   "qeq2.c": "#include <stdio.h>\n#include <math.h>\n#include \"qeq2.h\"\n\nvoid qeq(double a, double b, double c)\n{\n    double d = b * b - 4 * a * c;   /* 判別式 */\n    double x1, x2, t;\n\n    if (d > 0) {\n        x1 = (-b - sqrt(d)) / (2 * a);\n        x2 = (-b + sqrt(d)) / (2 * a);\n        if (x1 > x2) { t = x1; x1 = x2; x2 = t; }   /* 小さい順に */\n        printf(\"%0.5f %0.5f\\n\", x1, x2);\n    } else if (d == 0) {\n        printf(\"%0.5f\\n\", -b / (2 * a));\n    } else {\n        printf(\"\\n\");   /* 解なし: 改行のみ */\n    }\n}\n",
   "qeq2.h": "void qeq(double a, double b, double c);\n"
  },
  "2-5": {
   "bisection.c": "#include <stdio.h>\n#include <math.h>\n#include \"bisection.h\"\n\n/* f(x) = ax^2 + bx + c */\ndouble f(double x, double a, double b, double c)\n{\n    return (a * x + b) * x + c;\n}\n\ndouble bisection(double x1, double x2, double a, double b, double c,\n                 double eps, int m)\n{\n    int i;\n    double f1, f2, xmid, fmid;\n\n    fprintf(stderr, \"%3s %14s %14s %14s %14s %14s %14s\\n\",\n            \"i\", \"x1\", \"x2\", \"f1\", \"f2\", \"xmid\", \"fmid\");\n    for (i = 1; ; i++) {\n        f1 = f(x1, a, b, c);\n        f2 = f(x2, a, b, c);\n        fprintf(stderr, \"%3d %14.9f %14.9f %14.9f %14.9f\", i, x1, x2, f1, f2);\n        if (fabs(f1) < eps) { fprintf(stderr, \"\\n\"); return x1; }   /* (1) */\n        if (fabs(f2) < eps) { fprintf(stderr, \"\\n\"); return x2; }   /* (2) */\n\n        xmid = (x1 + x2) / 2;\n        fmid = f(xmid, a, b, c);\n        fprintf(stderr, \" %14.9f %14.9f\\n\", xmid, fmid);\n        if (i >= m) { return xmid; }                                 /* (3) */\n\n        if ((f1 < 0) != (fmid < 0)) { x2 = xmid; }   /* 解は [x1, xmid] */\n        else                        { x1 = xmid; }   /* 解は [xmid, x2] */\n    }\n}\n"
  },
  "2-6": {
   "body.c": "#include <stdio.h>\n#include <string.h>\n\n#define NM_LEN 31\n#define NM_FMT \"%31s\"\n\ntypedef struct {\n  char name[NM_LEN+1];   /* 名前 */\n  double stature;        /* 身長 [cm] */\n  double weight;         /* 重量 [kg] */\n  double bmi;            /* BMI値 */\n} body_index_t;\n\nvoid body_index_print(body_index_t x);\ndouble bmi(body_index_t x);\n\nint main(void)\n{\n    body_index_t p;\n\n    for (;;) {\n        fprintf(stderr, \"name: \");\n        if (scanf(NM_FMT, p.name) == EOF) { break; }\n        if (strcmp(p.name, \"q\") == 0) { break; }\n        fprintf(stderr, \"stature [cm]: \");\n        scanf(\"%lf\", &p.stature);\n        fprintf(stderr, \"weight [kg]: \");\n        scanf(\"%lf\", &p.weight);\n\n        p.bmi = bmi(p);\n        body_index_print(p);\n    }\n    return 0;\n}\n\nvoid body_index_print(body_index_t x)\n{\n    printf(\"name: %s\\n\", x.name);\n    printf(\"stature: %0.1fcm\\n\", x.stature);\n    printf(\"weight: %0.1fkg\\n\", x.weight);\n    printf(\"BMI: %0.1f\\n\", x.bmi);\n}\n\ndouble bmi(body_index_t x)\n{\n    double height_m = x.stature / 100.0;   /* cm → m */\n    return x.weight / (height_m * height_m);\n}\n"
  },
  "2-7": {
   "dist4.c": "#include <math.h>\n#include \"dist4.h\"\n\ndouble dist(point_t p1, point_t p2)\n{\n    double dx = p2.x - p1.x;\n    double dy = p2.y - p1.y;\n    return sqrt(dx * dx + dy * dy);\n}\n"
  },
  "2-8": {
   "irand.c": "#include <stdio.h>\n#include <stdlib.h>\n\n#define V_MAX 1000   /* 区間の幅の上限 */\n\nint irand(int a, int b)\n{\n    return rand() % (b - a + 1) + a;   /* a 以上 b 以下 */\n}\n\nint main(void)\n{\n    int a, b, n, i, r;\n    int count[V_MAX];\n\n    fprintf(stderr, \"a, b, n を入力: \");\n    scanf(\"%d %d %d\", &a, &b, &n);\n    if (b < a || b - a + 1 > V_MAX) { return 1; }\n\n    for (i = 0; i <= b - a; i++) { count[i] = 0; }\n\n    for (i = 0; i < n; i++) {\n        r = irand(a, b);\n        printf(\"%d \", r);\n        count[r - a]++;    /* 値 r の出現回数 */\n    }\n    printf(\"\\n\");\n\n    for (i = 0; i <= b - a; i++) {\n        printf(\"%d: %d\\n\", a + i, count[i]);\n    }\n    return 0;\n}\n"
  },
  "o2-1": {
   "newton.c": "#include <stdio.h>\n#include <math.h>\n#include \"newton.h\"\n\ndouble newton(double a, double b, double c, double x0, double eps, int max_repeat)\n{\n    int i;\n    double fx, dfx, x1 = x0;\n\n    fprintf(stderr, \"%4s %14s %14s %14s\\n\", \"i\", \"x0\", \"f(x0)\", \"x1\");\n    for (i = 0; i < max_repeat; i++) {\n        fx  = (a * x0 + b) * x0 + c;   /* f(x0)  */\n        dfx = 2 * a * x0 + b;          /* f'(x0) */\n        x1 = x0 - fx / dfx;            /* 接線と x 軸の交点 */\n        fprintf(stderr, \"%4d %14.10f %14.10f %14.10f\\n\", i, x0, fx, x1);\n        if (fabs(x1 - x0) < eps) { return x1; }   /* 収束 */\n        x0 = x1;\n    }\n    return x1;\n}\n"
  },
  "o2-2": {
   "omiai.c": "#include <stdio.h>\n#include <stdlib.h>\n\n#define N_CHANCE 15\n#define N_SIM    100\n\n/* 1:2:4:2:1 の割合で 1〜5 のレベルを返す */\nint level_rand(void)\n{\n    int r = rand() % 10;\n    if (r < 1) { return 1; }\n    if (r < 3) { return 2; }\n    if (r < 7) { return 3; }\n    if (r < 9) { return 4; }\n    return 5;\n}\n\n/* 0 以上 1 未満の一様乱数 */\ndouble urand(void)\n{\n    return rand() / ((double)RAND_MAX + 1.0);\n}\n\n/* c 回目 (1〜15) に, レベル y の相手に yes と言うか */\nint x_accept(int c, int y)\n{\n    if (c <= 5)  { return y >= 4; }   /* 最初の 5 回はレベル 4 以上だけ */\n    if (c <= 10) { return y >= 3; }   /* 次の 5 回はレベル 3 以上 */\n    return 1;                          /* 残りは誰でも */\n}\n\nint main(void)\n{\n    int s, c, x, y, married;\n    int n_married = 0;\n    double sum_level = 0.0;\n\n    srand(1);\n    for (s = 0; s < N_SIM; s++) {\n        x = level_rand();           /* 自分のレベル (自分には分からない) */\n        married = 0;\n        for (c = 1; c <= N_CHANCE; c++) {\n            y = level_rand();       /* 相手のレベル */\n            double p = (0.19 * x) * (1.1 - 0.1 * y);\n            if (x_accept(c, y) && urand() < p) { married = y; break; }\n        }\n        if (married) { n_married++; sum_level += married; }\n        else         { sum_level += -5; }\n    }\n    printf(\"結婚できる確率: %0.2f\\n\", (double)n_married / N_SIM);\n    printf(\"相手のレベルの期待値: %0.2f\\n\", sum_level / N_SIM);\n    return 0;\n}\n"
  }
 },
 "given": {
  "2-5": {
   "bisection.h": "double bisection(\n   double x1,\n   double x2,\n   double a,\n   double b,\n   double c,\n   double eps,\n   int m\n);\n",
   "bisection_main.c": "#include <stdio.h>\n#include \"bisection.h\"\n#define MAX_REPEAT 10\n\nint main(void)\n{\n  int i;\n  for (i=0; i<MAX_REPEAT; i++) {\n    double x1, x2, a, b, c, eps;\n    int m;\n    fprintf(stderr, \"x1, x2, a, b, c, eps, m を入力 : \");\n    if (scanf(\"%lf %lf %lf %lf %lf %lf %d\",\n       &x1, &x2, &a, &b, &c, &eps, &m)==EOF) { break; }\n    fprintf(stderr, \"\\n\");\n    double x = bisection(x1,x2,a,b,c,eps,m);\n    printf(\"%0.8f\\n\", x);\n  }\n  return 0;\n}\n"
  },
  "2-7": {
   "dist4.h": "typedef struct {\n  double x;   /* x座標 */\n  double y;   /* y座標 */\n} point_t;\ndouble dist(point_t p1, point_t p2);\n",
   "dist4main.c": "#include <stdio.h>\n#include \"dist4.h\"\n\n#define REPEAT 3\nint main(void)\n{\n   point_t p1, p2;\n   int r;\n   for (r=0; r<REPEAT; r++) {\n      fprintf(stderr, \"p1 と p2 の座標 (それぞれ x と y) をスペース区切りで : \");\n      scanf(\"%lf %lf\", &p1.x, &p1.y);\n      fprintf(stderr, \"p2 の座標 (x と y): \");\n      scanf(\"%lf %lf\", &p2.x, &p2.y);\n      printf(\"%0.4f\\n\", dist(p1,p2));\n   }\n   return 0;\n}\n"
  },
  "o2-1": {
   "newton.h": "double newton(\n   double a,\n   double b,\n   double c,\n   double x0,\n   double eps,\n   int max_repeat\n);\n",
   "newton_main.c": "#include <stdio.h>\n#include \"newton.h\"\n#define MAX_REPEAT 10\nint main(void)\n{\n  int i;\n  for (i=0; i<MAX_REPEAT; i++) {\n    double a, b, c, x0, eps;\n    int max_repeat;\n    fprintf(stderr, \"a, b, c, x0, eps, max_repeat を入力 : \");\n    if (scanf(\"%lf %lf %lf %lf %lf %d\",\n    &a, &b, &c, &x0, &eps, &max_repeat)==EOF) {break;}\n    double x = newton(a,b,c,x0,eps,max_repeat);\n    printf(\"%23.20f\\n\", x);\n  }\n  return 0;\n}\n"
  }
 },
 "exp": {
  "2-1": "1.4142\n5.8310\n3.1396\n",
  "2-2": "-2.00000 -1.00000\n-1.00000\n\n-4.13746 -0.36254\n-0.74568 2.14568\n1.00000\n0.37417 3.05440\n0.81386 3.68614\n",
  "2-5": "1.50000000\n1.41420000\n1.41430000\n-1.60000000\n10.00000000\n1.43750000\n0.90128136\n",
  "2-6": "name: Taro\nstature: 175.4cm\nweight: 65.3kg\nBMI: 21.2\nname: Hanako\nstature: 157.3cm\nweight: 48.8kg\nBMI: 19.7\n",
  "2-7": "1.4142\n5.8310\n3.1396\n",
  "o2-1": " 0.26794919243112275131\n 0.41886116991581029412\n 0.41886116991581034963\n 0.26785714285714284921\n 0.41884028892455854587\n 0.41884028892455854587\n",
  "o2-2": "結婚できる確率: 0.99\n相手のレベルの期待値: 3.67\n",
  "2-8": "8 7 8 8 8 8 7 7 8 8 \n7: 3\n8: 7\n"
 },
 "inp": {
  "2-1": "0 0 1 1\n1 2 4 7\n1.11 2.22 3.33 4.44\n",
  "2-2": "1 3 2\n1 2 1\n1 1 1\n2 9 3\n-5 7 8\n-3 6 -3\n-7 24 -8\n2 -9 6\n0 1 1\n",
  "2-5": "0.4 2.0 2.0 0.2 -4.8 0.001 5\n1.4142 3.0 -1.0 0.0 2.0 0.001 3\n0.0 1.4143 -1.0 0.0 2.0 0.001 3\n-2.9 -1.3 2.0 0.2 -4.8 0.001 5\n9.9999 10.0001 1.0 0.0 -100.0 0.001 5\n0.0 2.0 1.0 0.0 -2.0 1e-6 5\n0.0 2.0 1.5 1.2 -2.3 1e-6 30\n",
  "2-6": "Taro\n175.4\n65.3\nHanako\n157.3\n48.8\nq\n",
  "2-7": "0 0 1 1\n1 2 4 7\n1.11 2.22 3.33 4.44\n",
  "o2-1": "1.00 -4.00 1.00 0.00 1e-20 10\n-2.00 8.00 -3.00 1.00 1e-20 5\n-2.00 8.00 -3.00 1.00 1e-20 10\n1.00 -4.00 1.00 0.00 0.05 10\n-2.00 8.00 -3.00 1.00 0.05 5\n-2.00 8.00 -3.00 1.00 0.05 10\n",
  "o2-2": "",
  "2-8": "7 8 10\n"
 }
};
