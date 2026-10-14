/* B1 章で使うサンプルコード (配布資料の例題) */
(function () {
  'use strict';
  const R = String.raw;
  window.B1_CODE = {
    sq: R`#include <stdio.h>

#define N 10

int main(void)
{
    int i;
    for (i=1; i<=N; i++) {
        printf("%d %d\n", i, i*i);
    }

    return 0;
}
`,
    sq2bad: R`#include <stdio.h>

int main(void)
{
    int n;
    int i;

    printf("nを入力して下さい: ");
    scanf("%d", &n);

    for (i=1; i<=n; i++) {
        printf("%d %d\n", i, i*i);
    }

    return 0;
}
`,
    sq2: R`#include <stdio.h>

int main(void)
{
    int n;
    int i;

    fprintf(stderr, "nを入力して下さい: ");
    scanf("%d", &n);

    for (i=1; i<=n; i++) {
        printf("%d %d\n", i, i*i);
    }

    return 0;
}
`,
    ave: R`#include <stdio.h>
#include <math.h>  /* 平方根関数 sqrt を用いる場合に必要 */

#define REPEAT 3    /* 繰り返し回数 */

int main(void)
{
    int r;
    double a;
    double b;
    double ave_a;  /* 相加平均 */
    double ave_m;  /* 相乗平均 */

    for (r=0; r<REPEAT; r++) {
        fprintf(stderr, "2つの実数 a, b を入力して下さい: ");
        scanf("%lf", &a);
        scanf("%lf", &b);
        ave_a = (a+b)/2;
        ave_m = sqrt(a*b);
        printf("%0.3f %0.3f\n", ave_a, ave_m);
    }

    return 0;
}
`,
    ave3: R`#include <stdio.h>
#include <math.h>

int main(void)
{
    double a;
    double b;
    double ave_a;  /* 相加平均 */
    double ave_m;  /* 相乗平均 */

    for (;;) {  /* 無限ループ */
        fprintf(stderr, "2つの実数 a, b を入力して下さい: ");
        if (scanf("%lf", &a)==EOF) { break; }  /* 入力がなければ脱出 */
        if (scanf("%lf", &b)==EOF) { break; }
        ave_a = (a+b)/2;
        ave_m = sqrt(a*b);
        printf("%0.3f %0.3f\n", ave_a, ave_m);
    }

    return 0;
}
`,
    count: R`#include <stdio.h>
#include <assert.h>
#define MAX_I  4  /* 入力する整数の最大値 */

int main(void)
{
    int i;
    int c[MAX_I+1];  /* c[i] は iの出現回数 */

    /* カウンタの初期化 */
    for (i=0; i<=MAX_I; i++) { c[i] = 0; }

    /* 入力とカウント */
    for (;;) {
        fprintf(stderr, "0〜4 の整数を入力: ");
        if (scanf("%d", &i)==EOF) { break; }
        assert(0<=i && i<=MAX_I);  /* i が 0〜4 の範囲か */
        c[i]++;  /* i の出現回数を1増やす */
    }

    for (i=0; i<=MAX_I; i++) {
        printf("%d %d\n", i, c[i]);
    }

    return 0;
}
`,
    counte: R`#include <stdio.h>
#include <string.h>  /* strcmp 等の文字列関数使用時に必要 */

#define W_LEN 31     /* 文字列 w の最大文字数 */
#define W_FMT "%31s" /* 文字列 w を読み込むフォーマット */

int main(void)
{
    int i;
    int n_e;
    char w[W_LEN+1];

    for (;;) {
        fprintf(stderr, "英単語を入力して下さい (END で終了): ");
        scanf(W_FMT, w);
        if (strcmp(w,"END")==0) { break; }  /* 終了判定 */

        n_e = 0;
        for (i=0; w[i]!='\0'; i++) {  /* 文字列走査の決まった書き方 */
            if (w[i]=='e') { n_e++; }
        }
        printf("%d\n", n_e);
    }

    return 0;
}
`,
    str: R`#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[8];

    strcpy(s, "Hi!");
    printf("%s は %d 文字\n", s, (int)strlen(s));

    s[2] = '\0';
    printf("%s\n", s);
    return 0;
}
`,
    err1: '#include <stdio.h>\n\nint main(void)\n{\n    int i;\n    for (i=1; i<=3; i++)\u3000{\n        printf("%d\\n", i);\n    }\n    return 0;\n}\n',
    err2: '#include <stdio.h>\n\nint main(void)\n{\n    int i;\n    for (i=1; i<=3; i++) {\n        prinf("%d\\n", i);\n    }\n    return 0;\n}\n',
    err3: '#include <stdio.h>\n\nint main(void)\n{\n    int i\n    for (i=1; i<=3; i++) {\n        printf("%d\\n", i);\n    }\n    return 0;\n}\n',
    ovf: R`#include <stdio.h>

int main(void)
{
    int x = 2147483647;   /* int の最大値 */

    x = x + 1;
    printf("%d\n", x);
    return 0;
}
`,
    chr: R`#include <stdio.h>

int main(void)
{
    char c = 'A';

    printf("%c %d\n", c, c);
    printf("%c\n", c + 2);
    return 0;
}
`,
    streq: R`#include <stdio.h>
#include <string.h>

int main(void)
{
    char w[32];

    scanf("%31s", w);
    if (w == "END") {
        printf("一致\n");
    } else {
        printf("不一致\n");
    }
    return 0;
}
`,
    sizeofs: R`#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[] = "abc";

    printf("%d %d\n", (int)strlen(s), (int)sizeof(s));
    return 0;
}
`,
  };
})();
