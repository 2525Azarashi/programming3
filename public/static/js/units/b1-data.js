/* 自動生成 (b3_work/gen/gen.py): gcc で検証済みの模範解答・配布ファイル・期待値 */
window.B1_DATA = {
 "sol": {
  "1-1": {
   "san.c": "#include <stdio.h>\n\n#define N 40\n\nint main(void)\n{\n    int i;\n\n    for (i = 1; i <= N; i++) {\n        /* 3 の倍数, または一の位か十の位が 3 */\n        if (i % 3 == 0 || i % 10 == 3 || i / 10 == 3) {\n            printf(\"%d\\n\", i);\n        }\n    }\n    return 0;\n}\n"
  },
  "1-3": {
   "san2.c": "#include <stdio.h>\n\nint main(void)\n{\n    int n, i;\n\n    fprintf(stderr, \"n を入力して下さい (1〜99): \");   /* プロンプトは stderr へ */\n    scanf(\"%d\", &n);\n\n    for (i = 1; i <= n; i++) {\n        if (i % 3 == 0 || i % 10 == 3 || i / 10 == 3) {\n            printf(\"%d\\n\", i);\n        }\n    }\n    return 0;\n}\n"
  },
  "1-4": {
   "dist.c": "#include <stdio.h>\n#include <math.h>\n\n#define REPEAT 3\n\nint main(void)\n{\n    int r;\n    double x1, y1, x2, y2;\n    double dx, dy;\n\n    for (r = 0; r < REPEAT; r++) {\n        fprintf(stderr, \"x1 y1 x2 y2 を入力して下さい: \");\n        scanf(\"%lf\", &x1);\n        scanf(\"%lf\", &y1);\n        scanf(\"%lf\", &x2);\n        scanf(\"%lf\", &y2);\n        dx = x2 - x1;\n        dy = y2 - y1;\n        printf(\"%0.4f\\n\", sqrt(dx * dx + dy * dy));\n    }\n    return 0;\n}\n"
  },
  "1-5": {
   "gpa.c": "#include <stdio.h>\n\nint main(void)\n{\n    int score;\n    int n = 0;\n    double gp;\n    double sum = 0.0;\n\n    for (;;) {\n        fprintf(stderr, \"素点を入力して下さい: \");\n        if (scanf(\"%d\", &score) == EOF) { break; }\n\n        if (score >= 90)      { gp = 4.0; }\n        else if (score >= 85) { gp = 3.5; }\n        else if (score >= 80) { gp = 3.0; }\n        else if (score >= 75) { gp = 2.5; }\n        else if (score >= 70) { gp = 2.0; }\n        else if (score >= 65) { gp = 1.5; }\n        else if (score >= 60) { gp = 1.0; }\n        else                  { gp = 0.0; }\n\n        printf(\"%0.1f\\n\", gp);\n        sum = sum + gp;\n        n++;\n    }\n    if (n > 0) {\n        printf(\"%0.3f\\n\", sum / n);\n    }\n    return 0;\n}\n"
  },
  "1-6": {
   "wt.c": "#include <stdio.h>\n\n#define N_MAX 10\n\nint main(void)\n{\n    int n, i, k;\n    double wt[N_MAX];\n    double sum = 0.0;\n\n    fprintf(stderr, \"n = \");\n    scanf(\"%d\", &n);\n    if (n < 1 || n > N_MAX) { return 1; }\n\n    for (i = 0; i < n; i++) {\n        fprintf(stderr, \"wt[%d] = \", i);\n        scanf(\"%lf\", &wt[i]);\n    }\n    for (;;) {\n        fprintf(stderr, \"品物の番号: \");\n        if (scanf(\"%d\", &k) == EOF) { break; }\n        if (k < 0 || k >= n) { continue; }   /* 範囲外の番号は無視 */\n        sum = sum + wt[k];\n    }\n    printf(\"%0.1f\\n\", sum);\n    return 0;\n}\n"
  },
  "1-7": {
   "aiueo.c": "#include <stdio.h>\n#include <string.h>\n\n#define W_LEN 31\n#define W_FMT \"%31s\"\n\nint main(void)\n{\n    int i;\n    char w[W_LEN+1];\n\n    for (;;) {\n        fprintf(stderr, \"英単語を入力して下さい (qq で終了): \");\n        if (scanf(W_FMT, w) == EOF) { break; }\n        if (strcmp(w, \"qq\") == 0) { break; }\n\n        for (i = 0; w[i] != '\\0'; i++) {\n            if (w[i] != 'a' && w[i] != 'i' && w[i] != 'u' && w[i] != 'e' && w[i] != 'o') {\n                w[i] = '*';\n            }\n        }\n        printf(\"%s\\n\", w);\n    }\n    return 0;\n}\n"
  },
  "1-8": {
   "match.c": "#include <stdio.h>\n\n#define K_MAX 10\n#define N_MAX 16\n\nint main(void)\n{\n    int k, n, m;\n    int a[K_MAX], b[N_MAX];\n    int i, j, r, found;\n\n    fprintf(stderr, \"k : \");\n    scanf(\"%d\", &k);\n    fprintf(stderr, \"%d個の整数 : \", k);\n    for (i = 0; i < k; i++) { scanf(\"%d\", &a[i]); }\n    fprintf(stderr, \"n : \");\n    scanf(\"%d\", &n);\n    fprintf(stderr, \"m : \");\n    scanf(\"%d\", &m);\n\n    for (r = 0; r < m; r++) {\n        fprintf(stderr, \"%d個の整数: \", n);\n        for (i = 0; i < n; i++) { scanf(\"%d\", &b[i]); }\n\n        found = 0;\n        for (i = 0; i + k <= n; i++) {        /* 開始位置 i を順に試す */\n            for (j = 0; j < k; j++) {\n                if (b[i + j] != a[j]) { break; }\n            }\n            if (j == k) { found = 1; break; }  /* k 個すべて一致 */\n        }\n        printf(\"%d\\n\", found);\n    }\n    return 0;\n}\n"
  },
  "o1-1": {
   "poker.c": "#include <stdio.h>\n\nint main(void)\n{\n    int c[14];   /* c[v] は数字 v の枚数 */\n    int i, v;\n    int n4, n3, n2;\n\n    for (;;) {\n        for (v = 1; v <= 13; v++) { c[v] = 0; }\n        fprintf(stderr, \"1〜13 の整数を 5 つ入力: \");\n        for (i = 0; i < 5; i++) {\n            if (scanf(\"%d\", &v) == EOF) { return 0; }\n            c[v]++;\n        }\n        n4 = 0; n3 = 0; n2 = 0;\n        for (v = 1; v <= 13; v++) {\n            if (c[v] == 4) { n4++; }\n            if (c[v] == 3) { n3++; }\n            if (c[v] == 2) { n2++; }\n        }\n        if (n4 == 1)                 { printf(\"four of a kind\\n\"); }\n        else if (n3 == 1 && n2 == 1) { printf(\"full house\\n\"); }\n        else if (n3 == 1)            { printf(\"three of a kind\\n\"); }\n        else if (n2 == 2)            { printf(\"two pair\\n\"); }\n        else if (n2 == 1)            { printf(\"one pair\\n\"); }\n        else                         { printf(\"no pair\\n\"); }\n    }\n    return 0;\n}\n"
  },
  "o1-2": {
   "nsol_ceq.c": "#include <stdio.h>\n#include <math.h>\n\n#define EPS 1e-9\n\nint main(void)\n{\n    double a, b, c, d;\n    double D, s1, s2, f1, f2, t;\n    int n;\n\n    for (;;) {\n        fprintf(stderr, \"a b c d を入力 (a=0 で終了): \");\n        if (scanf(\"%lf %lf %lf %lf\", &a, &b, &c, &d) == EOF) { break; }\n        if (fabs(a) < EPS) { break; }\n\n        /* f'(x) = 3a x^2 + 2b x + c の判別式 (の 1/4) */\n        D = b * b - 3 * a * c;\n        if (D <= 0) {\n            n = 1;   /* 単調: 実数解は 1 個 (D=0 なら 3 重解の場合も 1 個) */\n        } else {\n            s1 = (-b - sqrt(D)) / (3 * a);\n            s2 = (-b + sqrt(D)) / (3 * a);\n            f1 = ((a * s1 + b) * s1 + c) * s1 + d;   /* 極値 */\n            f2 = ((a * s2 + b) * s2 + c) * s2 + d;\n            t = f1 * f2;\n            if (fabs(f1) < EPS || fabs(f2) < EPS) { n = 2; }   /* 一方が 0: 重解 */\n            else if (t < 0) { n = 3; }   /* 極値が異符号 */\n            else { n = 1; }              /* 極値が同符号 */\n        }\n        printf(\"%d\\n\", n);\n    }\n    return 0;\n}\n"
  }
 },
 "given": {},
 "exp": {
  "1-1": "3\n6\n9\n12\n13\n15\n18\n21\n23\n24\n27\n30\n31\n32\n33\n34\n35\n36\n37\n38\n39\n",
  "1-3": "3\n6\n9\n12\n13\n15\n18\n21\n23\n24\n27\n30\n31\n32\n33\n34\n35\n36\n37\n38\n39\n42\n43\n45\n48\n51\n53\n54\n57\n60\n63\n66\n69\n72\n73\n75\n",
  "1-4": "1.4142\n5.8310\n3.1396\n",
  "1-5": "4.0\n4.0\n4.0\n3.5\n3.5\n3.0\n3.0\n3.0\n2.5\n2.5\n2.0\n2.0\n2.0\n1.5\n1.5\n1.0\n1.0\n1.0\n0.0\n0.0\n0.0\n0.0\n0.0\n0.0\n0.0\n0.0\n1.731\n",
  "1-6a": "8.8\n",
  "1-6b": "205.8\n",
  "1-7": "**e*e\n**a**ei\n**o**a**i**\n",
  "1-8": "1\n0\n1\n1\n0\n1\n0\n1\n0\n0\n",
  "o1-1": "four of a kind\nfull house\nthree of a kind\ntwo pair\none pair\nno pair\n",
  "o1-2": "3\n1\n1\n2\n3\n1\n3\n2\n"
 },
 "inp": {
  "1-1": "",
  "1-3": "77\n",
  "1-4": "0 0 1 1\n1 2 4 7\n1.11 2.22 3.33 4.44\n",
  "1-5": "100\n95\n90\n89\n85\n84\n81\n80\n79\n75\n74\n71\n70\n69\n65\n64\n61\n60\n59\n50\n45\n33\n21\n17\n6\n0\n",
  "1-6a": "3\n1.1 2.2 3.3\n0 1 1 2\n",
  "1-6b": "5\n10.3 15.7 23.3 32.1 8.5\n0 1 0 2 4 3 1 2 4 3 1 0\n",
  "1-7": "these\nKwansei\nprogramming\nqq\n",
  "1-8": "3\n2 5 3\n6\n10\n2 5 3 1 1 1\n1 2 3 4 5 6\n1 2 5 3 7 4\n1 7 8 2 5 3\n1 2 5 2 3 4\n2 5 3 2 5 4\n2 2 5 5 3 3\n2 5 2 5 3 2\n1 1 1 1 2 5\n3 5 2 1 1 1\n",
  "o1-1": "7 6 7 7 7\n9 1 9 1 9\n5 6 5 5 2\n8 3 3 7 8\n1 3 6 4 6\n1 3 9 2 4\n",
  "o1-2": "1 0 -1 0\n1 0 1 0\n1 -3 3 -1\n1 0 -3 2\n1 -6 11 -6\n-1 0 0 1\n2 3 -12 5\n-1 3 0 -4\n0 0 0 0\n"
 }
};
