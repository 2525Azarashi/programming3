#!/usr/bin/env python3
"""Generate public/static/js/units/t2-data.js verified with gcc."""
import json
import os
import subprocess
import tempfile

SAMPLE_C = """#include <stdio.h>     /* 標準入出力関数等の利用に必要 */
#include <stdlib.h>    /* rand, exit, malloc 等の利用に必要 */
#include <math.h>      /* sqrt, fabs 等の利用に必要 */
#include <string.h>    /* strcpy, strlen, strcmp 等に必要 */

#define STRLEN 63

int main(void)
{
  double *b = NULL;
  char s1[STRLEN+1];
  char s2[STRLEN+1];
  char s3[STRLEN+1];

    b = malloc(sizeof(double));
    if (b==NULL) {
      fprintf(stderr, "malloc failed\\n");
      exit(1);
    }
    *b = 10;
    printf("*b = %5.3f\\n", *b);
    free(b);
    b = NULL;

    strcpy(s1,"China");
    strcpy(s2,"Japan");
    strcpy(s3,"Russia");
    printf("%d\\n", strcmp(s2,s2)); /* 0 を出力 */
    printf("%d\\n", strcmp(s1,s2)); /* 負数を出力 */
    printf("%d\\n", strcmp(s3,s2)); /* 正数を出力 */

    return 0;
}
"""

FILES = {
    "sample.c": SAMPLE_C,

    # ==================== Set 1 ====================
    # q1: B5 (5-1) 動的 double 配列の確保と逆順格納 darray.c
    "darray.h": """double *darray_rev(int n, double a[]);
""",
    "darraymain.c": """#include <stdio.h>
#include <stdlib.h>
#include "darray.h"

int main(void)
{
  double a[64];
  double *b;
  int n, i;
  while (1) {
    fprintf(stderr, "n = ");
    if (scanf("%d", &n) == EOF) { break; }
    for (i = 0; i < n; i++) {
      scanf("%lf", &a[i]);
    }
    b = darray_rev(n, a);
    for (i = 0; i < n; i++) {
      printf(" %.2f", b[i]);
    }
    printf("\\n");
    free(b);
    b = NULL;
  }
  return 0;
}
""",
    "darray.c": """#include <stdio.h>
#include <stdlib.h>
#include "darray.h"

double *darray_rev(int n, double a[])
{
  double *b;
  int i;
  b = malloc(sizeof(double) * n);
  if (b == NULL) {
    fprintf(stderr, "malloc failed\\n");
    exit(1);
  }
  for (i = 0; i < n; i++) {
    b[i] = a[n - 1 - i];
  }
  return b;
}
""",

    # q2: B6 (6-4) 単方向リストへの重複なし昇順挿入 listuniq.c
    "listuniq.h": """typedef struct node {
  int val;
  struct node *next;
} node_t;

node_t *new_node(int val, node_t *next);
void list_print(node_t *head);
void list_free(node_t *head);
int list_insert_uniq(node_t *head, int val);
""",
    "listuniqmain.c": """#include <stdio.h>
#include <stdlib.h>
#include "listuniq.h"

node_t *new_node(int val, node_t *next)
{
  node_t *p = malloc(sizeof(node_t));
  if (p == NULL) {
    fprintf(stderr, "malloc failed\\n");
    exit(1);
  }
  p->val = val;
  p->next = next;
  return p;
}

void list_print(node_t *head)
{
  node_t *p;
  printf("[");
  for (p = head->next; p != NULL; p = p->next) {
    printf(" %d", p->val);
  }
  printf(" ]\\n");
}

void list_free(node_t *head)
{
  node_t *p = head, *nx;
  while (p != NULL) {
    nx = p->next;
    free(p);
    p = nx;
  }
}

int main(void)
{
  node_t *head = new_node(0, NULL);
  int x, r;
  while (scanf("%d", &x) != EOF) {
    r = list_insert_uniq(head, x);
    printf("ins %d -> %d : ", x, r);
    list_print(head);
  }
  list_free(head);
  return 0;
}
""",
    "listuniq.c": """#include <stdio.h>
#include "listuniq.h"

int list_insert_uniq(node_t *head, int val)
{
  node_t *p;
  for (p = head; p->next != NULL; p = p->next) {
    if (p->next->val == val) {
      return 0;
    }
    if (p->next->val > val) {
      break;
    }
  }
  p->next = new_node(val, p->next);
  return 1;
}
""",

    # q3: B7 (7-2) 単純選択法の関数 selsort.c
    "selsort.h": """void selection_sort(int n, double *a);
""",
    "selsortmain.c": """#include <stdio.h>
#include "selsort.h"

int main(void)
{
  double a[64];
  int n, i;
  while (scanf("%d", &n) != EOF) {
    for (i = 0; i < n; i++) {
      scanf("%lf", &a[i]);
    }
    selection_sort(n, a);
    for (i = 0; i < n; i++) {
      printf(" %.2f", a[i]);
    }
    printf("\\n");
  }
  return 0;
}
""",
    "selsort.c": """#include "selsort.h"

void selection_sort(int n, double *a)
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
""",

    # q4: B8 (8-4) db_t の整列配列に対する二分探索 (整数キー id) dbbin.c
    "dbbin.h": """#define MAX_RECORDS 64
#define STRLEN 31

typedef struct {
  int id;
  char name[STRLEN + 1];
  int score;
} record_t;

typedef struct {
  int n;
  record_t entry[MAX_RECORDS];
} db_t;

int db_binary_search(db_t *db, int key_id);
""",
    "dbbinmain.c": """#include <stdio.h>
#include "dbbin.h"

int main(void)
{
  db_t db;
  int i, q, idx;
  if (scanf("%d", &db.n) == EOF) { return 0; }
  for (i = 0; i < db.n; i++) {
    scanf("%d %31s %d", &db.entry[i].id, db.entry[i].name, &db.entry[i].score);
  }
  while (scanf("%d", &q) != EOF) {
    idx = db_binary_search(&db, q);
    if (idx >= 0) {
      printf("%d -> [%d] %s (%d)\\n", q, idx, db.entry[idx].name, db.entry[idx].score);
    } else {
      printf("%d -> NOT FOUND\\n", q);
    }
  }
  return 0;
}
""",
    "dbbin.c": """#include "dbbin.h"

int db_binary_search(db_t *db, int key_id)
{
  int low = 0;
  int high = db->n - 1;
  int mid;
  while (low <= high) {
    mid = (low + high) / 2;
    if (db->entry[mid].id == key_id) {
      return mid;
    } else if (db->entry[mid].id < key_id) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return -1;
}
""",

    # ==================== Set 2 ====================
    # r2q1: B5 (5-3) 2つの文字列を動的確保したぴったりの領域に連結 strjoin.c
    "strjoin.h": """char *str_join(char *s1, char *s2);
""",
    "strjoinmain.c": """#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "strjoin.h"

#define STRLEN 63

int main(void)
{
  char s1[STRLEN + 1], s2[STRLEN + 1];
  char *p;
  while (scanf("%63s %63s", s1, s2) != EOF) {
    p = str_join(s1, s2);
    printf("%s (len=%d)\\n", p, (int)strlen(p));
    free(p);
    p = NULL;
  }
  return 0;
}
""",
    "strjoin.c": """#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "strjoin.h"

char *str_join(char *s1, char *s2)
{
  int len = strlen(s1) + strlen(s2);
  char *p = malloc(sizeof(char) * (len + 1));
  if (p == NULL) {
    fprintf(stderr, "malloc failed\\n");
    exit(1);
  }
  strcpy(p, s1);
  strcat(p, s2);
  return p;
}
""",

    # r2q2: B6 (6-5) 重複時は節点を削除、未登録なら昇順挿入 listtoggle.c
    "listtoggle.h": """typedef struct node {
  int val;
  struct node *next;
} node_t;

node_t *new_node(int val, node_t *next);
void list_print(node_t *head);
void list_free(node_t *head);
void list_insert_delete_dup(node_t *head, int val);
""",
    "listtogglemain.c": """#include <stdio.h>
#include <stdlib.h>
#include "listtoggle.h"

node_t *new_node(int val, node_t *next)
{
  node_t *p = malloc(sizeof(node_t));
  if (p == NULL) {
    fprintf(stderr, "malloc failed\\n");
    exit(1);
  }
  p->val = val;
  p->next = next;
  return p;
}

void list_print(node_t *head)
{
  node_t *p;
  printf("[");
  for (p = head->next; p != NULL; p = p->next) {
    printf(" %d", p->val);
  }
  printf(" ]\\n");
}

void list_free(node_t *head)
{
  node_t *p = head, *nx;
  while (p != NULL) {
    nx = p->next;
    free(p);
    p = nx;
  }
}

int main(void)
{
  node_t *head = new_node(0, NULL);
  int x;
  while (scanf("%d", &x) != EOF) {
    list_insert_delete_dup(head, x);
    printf("op %d : ", x);
    list_print(head);
  }
  list_free(head);
  return 0;
}
""",
    "listtoggle.c": """#include <stdio.h>
#include <stdlib.h>
#include "listtoggle.h"

void list_insert_delete_dup(node_t *head, int val)
{
  node_t *p, *del;
  for (p = head; p->next != NULL; p = p->next) {
    if (p->next->val == val) {
      del = p->next;
      p->next = del->next;
      free(del);
      return;
    }
    if (p->next->val > val) {
      break;
    }
  }
  p->next = new_node(val, p->next);
}
""",

    # r2q3: B7 (7-4) 単純挿入法の関数 inssort.c
    "inssort.h": """void insertion_sort(int n, double *a);
""",
    "inssortmain.c": """#include <stdio.h>
#include "inssort.h"

int main(void)
{
  double a[64];
  int n, i;
  while (scanf("%d", &n) != EOF) {
    for (i = 0; i < n; i++) {
      scanf("%lf", &a[i]);
    }
    insertion_sort(n, a);
    for (i = 0; i < n; i++) {
      printf(" %.2f", a[i]);
    }
    printf("\\n");
  }
  return 0;
}
""",
    "inssort.c": """#include "inssort.h"

void insertion_sort(int n, double *a)
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
""",

    # r2q4: B8 (8-4) db_t の文字列キー (辞書順整列済み) 二分探索 dbstr.c
    "dbstr.h": """#define MAX_RECORDS 64
#define STRLEN 63

typedef struct {
  char key[STRLEN + 1];
  int price;
} item_rec_t;

typedef struct {
  int n;
  item_rec_t entry[MAX_RECORDS];
} db_t;

int db_search_name(db_t *db, char *key);
""",
    "dbstrmain.c": """#include <stdio.h>
#include "dbstr.h"

int main(void)
{
  db_t db;
  char q[STRLEN + 1];
  int i, price;
  if (scanf("%d", &db.n) == EOF) { return 0; }
  for (i = 0; i < db.n; i++) {
    scanf("%63s %d", db.entry[i].key, &db.entry[i].price);
  }
  while (scanf("%63s", q) != EOF) {
    price = db_search_name(&db, q);
    if (price >= 0) {
      printf("%s : %d yen\\n", q, price);
    } else {
      printf("%s : NO ITEM\\n", q);
    }
  }
  return 0;
}
""",
    "dbstr.c": """#include <string.h>
#include "dbstr.h"

int db_search_name(db_t *db, char *key)
{
  int low = 0;
  int high = db->n - 1;
  int mid, c;
  while (low <= high) {
    mid = (low + high) / 2;
    c = strcmp(key, db->entry[mid].key);
    if (c == 0) {
      return db->entry[mid].price;
    } else if (c < 0) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return -1;
}
""",

    # ==================== Set 3 ====================
    # r3q1: B5 (5-1 応用) 条件を満たす要素だけを詰めた動的 int 配列 filterpos.c
    "filterpos.h": """int *alloc_positives(int n, int a[], int *out_m);
""",
    "filterposmain.c": """#include <stdio.h>
#include <stdlib.h>
#include "filterpos.h"

int main(void)
{
  int a[64];
  int *b;
  int n, m, i;
  while (scanf("%d", &n) != EOF) {
    for (i = 0; i < n; i++) {
      scanf("%d", &a[i]);
    }
    m = -1;
    b = alloc_positives(n, a, &m);
    printf("m=%d :", m);
    for (i = 0; i < m; i++) {
      printf(" %d", b[i]);
    }
    printf("\\n");
    if (b != NULL) {
      free(b);
      b = NULL;
    }
  }
  return 0;
}
""",
    "filterpos.c": """#include <stdio.h>
#include <stdlib.h>
#include "filterpos.h"

int *alloc_positives(int n, int a[], int *out_m)
{
  int i, k = 0, cnt = 0;
  int *b;
  for (i = 0; i < n; i++) {
    if (a[i] > 0) { cnt++; }
  }
  *out_m = cnt;
  if (cnt == 0) {
    return NULL;
  }
  b = malloc(sizeof(int) * cnt);
  if (b == NULL) {
    fprintf(stderr, "malloc failed\\n");
    exit(1);
  }
  for (i = 0; i < n; i++) {
    if (a[i] > 0) {
      b[k] = a[i];
      k++;
    }
  }
  return b;
}
""",

    # r3q2: B6 (6-3/6-5 応用) 文字列リストの探索と条件削除 strlist.c
    "strlist.h": """#define STRLEN 31

typedef struct snode {
  char word[STRLEN + 1];
  struct snode *next;
} snode_t;

snode_t *new_snode(char *w, snode_t *next);
void slist_print(snode_t *head);
void slist_free(snode_t *head);
snode_t *slist_find(snode_t *head, char *key);
int slist_remove(snode_t *head, char *key);
""",
    "strlistmain.c": """#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "strlist.h"

snode_t *new_snode(char *w, snode_t *next)
{
  snode_t *p = malloc(sizeof(snode_t));
  if (p == NULL) {
    fprintf(stderr, "malloc failed\\n");
    exit(1);
  }
  strcpy(p->word, w);
  p->next = next;
  return p;
}

void slist_print(snode_t *head)
{
  snode_t *p;
  printf("[");
  for (p = head->next; p != NULL; p = p->next) {
    printf(" %s", p->word);
  }
  printf(" ]\\n");
}

void slist_free(snode_t *head)
{
  snode_t *p = head, *nx;
  while (p != NULL) {
    nx = p->next;
    free(p);
    p = nx;
  }
}

int main(void)
{
  snode_t *head = new_snode("", NULL);
  char cmd[8], w[STRLEN + 1];
  while (scanf("%7s %31s", cmd, w) != EOF) {
    if (strcmp(cmd, "add") == 0) {
      head->next = new_snode(w, head->next);
    } else if (strcmp(cmd, "find") == 0) {
      printf("find %s -> %s\\n", w, slist_find(head, w) != NULL ? "YES" : "NO");
    } else if (strcmp(cmd, "del") == 0) {
      printf("del %s -> %d : ", w, slist_remove(head, w));
      slist_print(head);
    }
  }
  slist_free(head);
  return 0;
}
""",
    "strlist.c": """#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "strlist.h"

snode_t *slist_find(snode_t *head, char *key)
{
  snode_t *p;
  for (p = head->next; p != NULL; p = p->next) {
    if (strcmp(p->word, key) == 0) {
      return p;
    }
  }
  return NULL;
}

int slist_remove(snode_t *head, char *key)
{
  snode_t *p, *del;
  for (p = head; p->next != NULL; p = p->next) {
    if (strcmp(p->next->word, key) == 0) {
      del = p->next;
      p->next = del->next;
      free(del);
      return 1;
    }
  }
  return 0;
}
""",

    # r3q3: B7 (7-2/7-4/7-8 融合) 構造体配列の単純挿入法 recsort.c (score 降順, 同点なら id 昇順)
    "recsort.h": """#define STRLEN 31

typedef struct {
  int id;
  char name[STRLEN + 1];
  int score;
} student_t;

void sort_students(int n, student_t *a);
""",
    "recsortmain.c": """#include <stdio.h>
#include "recsort.h"

int main(void)
{
  student_t a[64];
  int n, i;
  if (scanf("%d", &n) == EOF) { return 0; }
  for (i = 0; i < n; i++) {
    scanf("%d %31s %d", &a[i].id, a[i].name, &a[i].score);
  }
  sort_students(n, a);
  for (i = 0; i < n; i++) {
    printf("%d %s %d\\n", a[i].id, a[i].name, a[i].score);
  }
  return 0;
}
""",
    "recsort.c": """#include "recsort.h"

static int comes_before(student_t x, student_t y)
{
  if (x.score != y.score) {
    return x.score > y.score;
  }
  return x.id < y.id;
}

void sort_students(int n, student_t *a)
{
  int k, i;
  student_t tmp;
  for (k = 1; k <= n - 1; k++) {
    for (i = k; 1 <= i; i--) {
      if (!comes_before(a[i], a[i - 1])) {
        break;
      }
      tmp = a[i];
      a[i] = a[i - 1];
      a[i - 1] = tmp;
    }
  }
}
""",

    # r3q4: B7 + B8 融合 db_t を key 昇順にソートしてから二分探索する dbsortfind.c
    "dbsortfind.h": """#define MAX_RECORDS 64
#define STRLEN 63

typedef struct {
  char word[STRLEN + 1];
  int count;
} entry_t;

typedef struct {
  int n;
  entry_t entry[MAX_RECORDS];
} db_t;

void db_sort(db_t *db);
entry_t *db_bsearch(db_t *db, char *word);
""",
    "dbsortfindmain.c": """#include <stdio.h>
#include "dbsortfind.h"

int main(void)
{
  db_t db;
  char q[STRLEN + 1];
  entry_t *p;
  int i;
  if (scanf("%d", &db.n) == EOF) { return 0; }
  for (i = 0; i < db.n; i++) {
    scanf("%63s %d", db.entry[i].word, &db.entry[i].count);
  }
  db_sort(&db);
  printf("sorted:");
  for (i = 0; i < db.n; i++) {
    printf(" %s", db.entry[i].word);
  }
  printf("\\n");
  while (scanf("%63s", q) != EOF) {
    p = db_bsearch(&db, q);
    if (p != NULL) {
      printf("%s -> %d\\n", q, p->count);
    } else {
      printf("%s -> NONE\\n", q);
    }
  }
  return 0;
}
""",
    "dbsortfind.c": """#include <stdio.h>
#include <string.h>
#include "dbsortfind.h"

void db_sort(db_t *db)
{
  int k, i, min;
  entry_t tmp;
  for (k = 0; k <= db->n - 2; k++) {
    min = k;
    for (i = k + 1; i < db->n; i++) {
      if (strcmp(db->entry[i].word, db->entry[min].word) < 0) {
        min = i;
      }
    }
    tmp = db->entry[k];
    db->entry[k] = db->entry[min];
    db->entry[min] = tmp;
  }
}

entry_t *db_bsearch(db_t *db, char *word)
{
  int low = 0;
  int high = db->n - 1;
  int mid, c;
  while (low <= high) {
    mid = (low + high) / 2;
    c = strcmp(word, db->entry[mid].word);
    if (c == 0) {
      return &db->entry[mid];
    } else if (c < 0) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return NULL;
}
""",

    # ==================== Extra (腕試し 2 問) ====================
    # x1: B5 (5-3) 文字列の複製 mystrdup.c (malloc 厳格チェック特訓)
    "mystrdup.h": """char *my_strdup_upper(char *s);
""",
    "mystrdupmain.c": """#include <stdio.h>
#include <stdlib.h>
#include "mystrdup.h"

int main(void)
{
  char buf[64];
  char *p;
  while (scanf("%63s", buf) != EOF) {
    p = my_strdup_upper(buf);
    printf("%s -> %s\\n", buf, p);
    free(p);
    p = NULL;
  }
  return 0;
}
""",
    "mystrdup.c": """#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "mystrdup.h"

char *my_strdup_upper(char *s)
{
  int len = strlen(s);
  int i;
  char *p = malloc(sizeof(char) * (len + 1));
  if (p == NULL) {
    fprintf(stderr, "malloc failed\\n");
    exit(1);
  }
  for (i = 0; i <= len; i++) {
    if ('a' <= s[i] && s[i] <= 'z') {
      p[i] = s[i] - 'a' + 'A';
    } else {
      p[i] = s[i];
    }
  }
  return p;
}
""",

    # x2: B7 (7-7) 文字列配列のソート wordsort.c
    "wordsort.h": """#define STRLEN 63

void string_sort(int n, char (*a)[STRLEN + 1]);
""",
    "wordsortmain.c": """#include <stdio.h>
#include "wordsort.h"

int main(void)
{
  char a[32][STRLEN + 1];
  int n, i;
  if (scanf("%d", &n) == EOF) { return 0; }
  for (i = 0; i < n; i++) {
    scanf("%63s", a[i]);
  }
  string_sort(n, a);
  for (i = 0; i < n; i++) {
    printf("%s\\n", a[i]);
  }
  return 0;
}
""",
    "wordsort.c": """#include <string.h>
#include "wordsort.h"

void string_sort(int n, char (*a)[STRLEN + 1])
{
  int k, i, min;
  char tmp[STRLEN + 1];
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
""",
}

SPECS = {
    "darray": {
        "units": ["darraymain.c", "darray.c"],
        "inputs": [
            "4\n1.5 -2.0 3.25 0.0\n3\n10.0 20.5 30.0\n",
            "1\n42.5\n5\n1 2 3 4 5\n",
            "2\n-9.5 9.5\n",
        ],
    },
    "listuniq": {
        "units": ["listuniqmain.c", "listuniq.c"],
        "inputs": [
            "30 10 20 10 40 20 5\n",
            "5 5 5\n",
            "50 40 30 20 10 25 30\n",
        ],
    },
    "selsort": {
        "units": ["selsortmain.c", "selsort.c"],
        "inputs": [
            "5\n6.0 2.0 4.0 9.0 8.0\n4\n-1.5 3.0 -4.2 0.0\n",
            "1\n7.5\n6\n9 8 7 6 5 4\n",
            "5\n2.5 1.0 2.5 0.5 1.0\n",
        ],
    },
    "dbbin": {
        "units": ["dbbinmain.c", "dbbin.c"],
        "inputs": [
            "6\n102 Sato 85\n108 Suzuki 72\n115 Takahashi 91\n123 Tanaka 68\n130 Ito 95\n142 Watanabe 79\n115 100 142 120 102\n",
            "1\n500 Only 88\n500 499 501\n",
            "5\n10 A 1\n20 B 2\n30 C 3\n40 D 4\n50 E 5\n10 20 30 40 50 25\n",
        ],
    },
    "strjoin": {
        "units": ["strjoinmain.c", "strjoin.c"],
        "inputs": [
            "Chiba Univ\nHello World\nC Lang\n",
            "a b\nabcdefghij klmnopqrst\n",
            "Pointer Memory\n",
        ],
    },
    "listtoggle": {
        "units": ["listtogglemain.c", "listtoggle.c"],
        "inputs": [
            "20 10 30 20 5 10 25\n",
            "10 10 10 10\n",
            "40 20 30 10 40 10\n",
        ],
    },
    "inssort": {
        "units": ["inssortmain.c", "inssort.c"],
        "inputs": [
            "5\n6.0 2.0 4.0 9.0 8.0\n4\n3.5 -2.0 3.5 -5.0\n",
            "1\n99.0\n6\n6 5 4 3 2 1\n",
            "5\n1 2 3 4 5\n",
        ],
    },
    "dbstr": {
        "units": ["dbstrmain.c", "dbstr.c"],
        "inputs": [
            "6\nApple 150\nBanana 120\nGrape 380\nLemon 100\nMelon 900\nPeach 260\nGrape Orange Apple Peach AAA ZZZ\n",
            "1\nJapan 50\nJapan China Russia\n",
            "4\nC 10\nGo 20\nPython 30\nRust 40\nC Rust Java Go\n",
        ],
    },
    "filterpos": {
        "units": ["filterposmain.c", "filterpos.c"],
        "inputs": [
            "6\n-3 5 0 8 -1 2\n4\n-5 0 -2 -9\n",
            "5\n10 20 30 40 50\n1\n0\n",
            "3\n-1 7 -2\n",
        ],
    },
    "strlist": {
        "units": ["strlistmain.c", "strlist.c"],
        "inputs": [
            "add Japan\nadd China\nadd Russia\nfind China\nfind USA\ndel China\nfind China\ndel USA\ndel Russia\n",
            "add A\ndel A\nfind A\nadd B\nfind B\n",
            "add X\nadd Y\ndel X\ndel Y\ndel Z\n",
        ],
    },
    "recsort": {
        "units": ["recsortmain.c", "recsort.c"],
        "inputs": [
            "5\n103 Sato 80\n101 Suzuki 95\n105 Takahashi 80\n102 Tanaka 70\n104 Ito 95\n",
            "1\n200 Solo 60\n",
            "4\n4 D 50\n2 B 50\n3 C 50\n1 A 50\n",
        ],
    },
    "dbsortfind": {
        "units": ["dbsortfindmain.c", "dbsortfind.c"],
        "inputs": [
            "5\nRussia 30\nJapan 50\nChina 40\nIndia 20\nBrazil 10\nJapan USA Brazil Russia\n",
            "1\nOnly 7\nOnly None\n",
            "4\ndelta 4\nalpha 1\ncharlie 3\nbravo 2\nalpha delta echo bravo\n",
        ],
    },
    "mystrdup": {
        "units": ["mystrdupmain.c", "mystrdup.c"],
        "inputs": [
            "Japan\nhello_123\nChibaUniv\n",
            "a\nZ\nabcXYZ\n",
        ],
    },
    "wordsort": {
        "units": ["wordsortmain.c", "wordsort.c"],
        "inputs": [
            "5\nRussia\nChina\nJapan\nBrazil\nIndia\n",
            "4\nbanana\napple\nbanana\napricot\n",
            "1\nsingle\n",
        ],
    },
}


def main():
    with tempfile.TemporaryDirectory() as td:
        for name, content in FILES.items():
            with open(os.path.join(td, name), "w", encoding="utf-8") as f:
                f.write(content)

        # Verify official sample.c
        exe_s = os.path.join(td, "sample.out")
        subprocess.run(["gcc", "-Wall", "-Wextra", "-O2", os.path.join(td, "sample.c"), "-lm", "-o", exe_s], check=True)
        rs = subprocess.run([exe_s], capture_output=True, text=True, check=True)
        sample_info = {"exp": rs.stdout}

        tests = {}
        for key, sp in SPECS.items():
            exe = os.path.join(td, f"{key}.out")
            cmd = ["gcc", "-Wall", "-Wextra", "-O2"] + [os.path.join(td, u) for u in sp["units"]] + ["-lm", "-o", exe]
            subprocess.run(cmd, check=True)
            tlist = []
            for inp in sp["inputs"]:
                r = subprocess.run([exe], input=inp, capture_output=True, text=True)
                tlist.append({
                    "stdin": inp,
                    "expect": r.stdout,
                    "exit": r.returncode,
                })
            tests[key] = tlist

    out_obj = {
        "files": FILES,
        "tests": tests,
        "sample": sample_info,
    }
    out_path = os.path.join(os.path.dirname(__file__), "..", "public", "static", "js", "units", "t2-data.js")
    out_path = os.path.abspath(out_path)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("/* T2 中間試験対策 — 生成ファイル (tools/gen_t2.py): 問題ファイルと gcc (Linux/glibc) で求めた期待値 */\n")
        f.write("window.T2_DATA = ")
        json.dump(out_obj, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    print("Generated", out_path, "successfully! sample stdout =", repr(sample_info["exp"]))


if __name__ == "__main__":
    main()
