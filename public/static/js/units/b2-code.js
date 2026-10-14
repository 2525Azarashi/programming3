/* B2 章で使うサンプルコード (配布資料の例題) */
(function () {
  'use strict';
  const R = String.raw;
  window.B2_CODE = {
    ave4: R`#include <stdio.h>
#include <math.h>

double arithmetic_mean(double, double); /* 関数のプロトタイプ宣言 */
double geometric_mean(double, double);  /* 関数のプロトタイプ宣言 */

int main(void)
{
    double a;
    double b;
    double ave_a; /* 相加平均 */
    double ave_m; /* 相乗平均 */

    for (;;) {
        fprintf(stderr, "2つの実数 a, b を入力して下さい: ");
        if (scanf("%lf", &a)==EOF) { break; }
        if (scanf("%lf", &b)==EOF) { break; }
        ave_a = arithmetic_mean(a,b);   /* 関数の呼び出し */
        ave_m = geometric_mean(a,b);    /* 関数の呼び出し */
        printf("%0.3f %0.3f\n", ave_a, ave_m);
    }

    return 0;
}

double arithmetic_mean(double x, double y)   /* 関数の定義 (本体) */
{
    double a = (x+y)/2;
    return a;
}

double geometric_mean(double x, double y)    /* 関数の定義 (本体) */
{
    double a = sqrt(x*y);
    return a;
}
`,
    noproto: R`#include <stdio.h>

int main(void)
{
    double m = arithmetic_mean(1.0, 2.0);
    printf("%0.3f\n", m);
    return 0;
}

double arithmetic_mean(double x, double y)
{
    return (x+y)/2;
}
`,
    scope: R`#include <stdio.h>

int twice(int a)
{
    a = a * 2;
    return a;
}

int main(void)
{
    int a = 5;
    int b;

    b = twice(a);
    printf("%d %d\n", a, b);
    return 0;
}
`,
    ave5h: R`double arithmetic_mean(double, double); /* 関数のプロトタイプ宣言 */
double geometric_mean(double, double);  /* 関数のプロトタイプ宣言 */
`,
    ave5main: R`#include <stdio.h>
#include "ave5.h"

int main(void)
{
    double a;
    double b;
    double ave_a; /* 相加平均 */
    double ave_m; /* 相乗平均 */

    for (;;) {
        fprintf(stderr, "2つの実数 a, b を入力して下さい: ");
        if (scanf("%lf", &a)==EOF) { break; }
        if (scanf("%lf", &b)==EOF) { break; }
        ave_a = arithmetic_mean(a,b);
        ave_m = geometric_mean(a,b);
        printf("%0.3f %0.3f\n", ave_a, ave_m);
    }
    return 0;
}
`,
    ave5: R`#include <stdio.h>
#include <math.h>
#include "ave5.h"

double arithmetic_mean(double x, double y)   /* 関数の定義 (本体) */
{
    double a = (x+y)/2;
    return a;
}

double geometric_mean(double x, double y)    /* 関数の定義 (本体) */
{
    double a = sqrt(x*y);
    return a;
}
`,
    item: R`#include <stdio.h>
#include <string.h>   /* strcpy を使うため */
#define NM_LEN 31

typedef struct {
    char name[NM_LEN+1];   /* 品物の名前 */
    int price;             /* 価格 */
    double weight;         /* 重量 */
} item_t;

void item_print(item_t x);
int item_sum_price(item_t a, item_t b, item_t c);

int main(void)
{
    item_t a, b, c; /* 3つの品物 */

    strcpy(a.name, "apple");  a.price = 120; a.weight = 205.82;
    strcpy(b.name, "banana"); b.price = 220; b.weight = 423.64;
    strcpy(c.name, "cherry"); c.price = 150; c.weight = 270.53;

    item_print(a);
    printf("%d\n", item_sum_price(a,b,c));
    return 0;
}

void item_print(item_t x)
{
    printf("%s", x.name);
    printf(",%d", x.price);
    printf(",%0.2f", x.weight);
    printf("\n");
}

int item_sum_price(item_t a, item_t b, item_t c)
{
    return a.price + b.price + c.price;
}
`,
    structcopy: R`#include <stdio.h>

typedef struct {
    double x;   /* x座標 */
    double y;   /* y座標 */
} point_t;

void move(point_t p)
{
    p.x = p.x + 10;
}

int main(void)
{
    point_t q;
    q.x = 1.0;
    q.y = 2.0;

    move(q);
    printf("%0.1f %0.1f\n", q.x, q.y);
    return 0;
}
`,
    rand1: R`#include <stdio.h>
#include <stdlib.h>   /* rand() を使うときには stdlib.h が必要 */

int main(void)
{
    int i, seed, r;

    printf("乱数の最大値 RAND_MAX = %d\n", RAND_MAX);
    fprintf(stderr, "乱数の種となる整数を入力して下さい > ");
    scanf("%d", &seed);
    srand(seed); /* 種の設定 */

    /* 一様乱数を 10 回発生させて表示 */
    for (i=0; i<10; i++) {
        r = rand();
        printf("%d\n", r);
    }
    return 0;
}
`,
    rand1013: R`#include <stdio.h>
#include <stdlib.h>   /* rand() を使うときには stdlib.h が必要 */

int rand_10_13()
{
    int r = rand() % 4 + 10;
    return r;
}

int main( void )
{
    int i, r;
    for (i=0; i<30; i++) {
        r = rand_10_13();
        printf("%3d", r);
    }
    printf("\n");
    return 0;
}
`,
    dice: R`#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int i;
    srand(1);
    for (i = 0; i < 5; i++) {
        printf("%d ", rand() % 6 + 1);
    }
    printf("\n");
    return 0;
}
`,
  };
})();
