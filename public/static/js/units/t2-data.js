/* T2 中間試験対策 — 生成ファイル (tools/gen_t2.py): 問題ファイルと gcc (Linux/glibc) で求めた期待値 */
window.T2_DATA = {
  "files": {
    "sample.c": "#include <stdio.h>     /* 標準入出力関数等の利用に必要 */\n#include <stdlib.h>    /* rand, exit, malloc 等の利用に必要 */\n#include <math.h>      /* sqrt, fabs 等の利用に必要 */\n#include <string.h>    /* strcpy, strlen, strcmp 等に必要 */\n\n#define STRLEN 63\n\nint main(void)\n{\n  double *b = NULL;\n  char s1[STRLEN+1];\n  char s2[STRLEN+1];\n  char s3[STRLEN+1];\n\n    b = malloc(sizeof(double));\n    if (b==NULL) {\n      fprintf(stderr, \"malloc failed\\n\");\n      exit(1);\n    }\n    *b = 10;\n    printf(\"*b = %5.3f\\n\", *b);\n    free(b);\n    b = NULL;\n\n    strcpy(s1,\"China\");\n    strcpy(s2,\"Japan\");\n    strcpy(s3,\"Russia\");\n    printf(\"%d\\n\", strcmp(s2,s2)); /* 0 を出力 */\n    printf(\"%d\\n\", strcmp(s1,s2)); /* 負数を出力 */\n    printf(\"%d\\n\", strcmp(s3,s2)); /* 正数を出力 */\n\n    return 0;\n}\n",
    "darray.h": "double *darray_rev(int n, double a[]);\n",
    "darraymain.c": "#include <stdio.h>\n#include <stdlib.h>\n#include \"darray.h\"\n\nint main(void)\n{\n  double a[64];\n  double *b;\n  int n, i;\n  while (1) {\n    fprintf(stderr, \"n = \");\n    if (scanf(\"%d\", &n) == EOF) { break; }\n    for (i = 0; i < n; i++) {\n      scanf(\"%lf\", &a[i]);\n    }\n    b = darray_rev(n, a);\n    for (i = 0; i < n; i++) {\n      printf(\" %.2f\", b[i]);\n    }\n    printf(\"\\n\");\n    free(b);\n    b = NULL;\n  }\n  return 0;\n}\n",
    "darray.c": "#include <stdio.h>\n#include <stdlib.h>\n#include \"darray.h\"\n\ndouble *darray_rev(int n, double a[])\n{\n  double *b;\n  int i;\n  b = malloc(sizeof(double) * n);\n  if (b == NULL) {\n    fprintf(stderr, \"malloc failed\\n\");\n    exit(1);\n  }\n  for (i = 0; i < n; i++) {\n    b[i] = a[n - 1 - i];\n  }\n  return b;\n}\n",
    "listuniq.h": "typedef struct node {\n  int val;\n  struct node *next;\n} node_t;\n\nnode_t *new_node(int val, node_t *next);\nvoid list_print(node_t *head);\nvoid list_free(node_t *head);\nint list_insert_uniq(node_t *head, int val);\n",
    "listuniqmain.c": "#include <stdio.h>\n#include <stdlib.h>\n#include \"listuniq.h\"\n\nnode_t *new_node(int val, node_t *next)\n{\n  node_t *p = malloc(sizeof(node_t));\n  if (p == NULL) {\n    fprintf(stderr, \"malloc failed\\n\");\n    exit(1);\n  }\n  p->val = val;\n  p->next = next;\n  return p;\n}\n\nvoid list_print(node_t *head)\n{\n  node_t *p;\n  printf(\"[\");\n  for (p = head->next; p != NULL; p = p->next) {\n    printf(\" %d\", p->val);\n  }\n  printf(\" ]\\n\");\n}\n\nvoid list_free(node_t *head)\n{\n  node_t *p = head, *nx;\n  while (p != NULL) {\n    nx = p->next;\n    free(p);\n    p = nx;\n  }\n}\n\nint main(void)\n{\n  node_t *head = new_node(0, NULL);\n  int x, r;\n  while (scanf(\"%d\", &x) != EOF) {\n    r = list_insert_uniq(head, x);\n    printf(\"ins %d -> %d : \", x, r);\n    list_print(head);\n  }\n  list_free(head);\n  return 0;\n}\n",
    "listuniq.c": "#include <stdio.h>\n#include \"listuniq.h\"\n\nint list_insert_uniq(node_t *head, int val)\n{\n  node_t *p;\n  for (p = head; p->next != NULL; p = p->next) {\n    if (p->next->val == val) {\n      return 0;\n    }\n    if (p->next->val > val) {\n      break;\n    }\n  }\n  p->next = new_node(val, p->next);\n  return 1;\n}\n",
    "selsort.h": "void selection_sort(int n, double *a);\n",
    "selsortmain.c": "#include <stdio.h>\n#include \"selsort.h\"\n\nint main(void)\n{\n  double a[64];\n  int n, i;\n  while (scanf(\"%d\", &n) != EOF) {\n    for (i = 0; i < n; i++) {\n      scanf(\"%lf\", &a[i]);\n    }\n    selection_sort(n, a);\n    for (i = 0; i < n; i++) {\n      printf(\" %.2f\", a[i]);\n    }\n    printf(\"\\n\");\n  }\n  return 0;\n}\n",
    "selsort.c": "#include \"selsort.h\"\n\nvoid selection_sort(int n, double *a)\n{\n  int k, i, min;\n  double tmp;\n  for (k = 0; k <= n - 2; k++) {\n    min = k;\n    for (i = k + 1; i < n; i++) {\n      if (a[i] < a[min]) {\n        min = i;\n      }\n    }\n    tmp = a[k];\n    a[k] = a[min];\n    a[min] = tmp;\n  }\n}\n",
    "dbbin.h": "#define MAX_RECORDS 64\n#define STRLEN 31\n\ntypedef struct {\n  int id;\n  char name[STRLEN + 1];\n  int score;\n} record_t;\n\ntypedef struct {\n  int n;\n  record_t entry[MAX_RECORDS];\n} db_t;\n\nint db_binary_search(db_t *db, int key_id);\n",
    "dbbinmain.c": "#include <stdio.h>\n#include \"dbbin.h\"\n\nint main(void)\n{\n  db_t db;\n  int i, q, idx;\n  if (scanf(\"%d\", &db.n) == EOF) { return 0; }\n  for (i = 0; i < db.n; i++) {\n    scanf(\"%d %31s %d\", &db.entry[i].id, db.entry[i].name, &db.entry[i].score);\n  }\n  while (scanf(\"%d\", &q) != EOF) {\n    idx = db_binary_search(&db, q);\n    if (idx >= 0) {\n      printf(\"%d -> [%d] %s (%d)\\n\", q, idx, db.entry[idx].name, db.entry[idx].score);\n    } else {\n      printf(\"%d -> NOT FOUND\\n\", q);\n    }\n  }\n  return 0;\n}\n",
    "dbbin.c": "#include \"dbbin.h\"\n\nint db_binary_search(db_t *db, int key_id)\n{\n  int low = 0;\n  int high = db->n - 1;\n  int mid;\n  while (low <= high) {\n    mid = (low + high) / 2;\n    if (db->entry[mid].id == key_id) {\n      return mid;\n    } else if (db->entry[mid].id < key_id) {\n      low = mid + 1;\n    } else {\n      high = mid - 1;\n    }\n  }\n  return -1;\n}\n",
    "strjoin.h": "char *str_join(char *s1, char *s2);\n",
    "strjoinmain.c": "#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include \"strjoin.h\"\n\n#define STRLEN 63\n\nint main(void)\n{\n  char s1[STRLEN + 1], s2[STRLEN + 1];\n  char *p;\n  while (scanf(\"%63s %63s\", s1, s2) != EOF) {\n    p = str_join(s1, s2);\n    printf(\"%s (len=%d)\\n\", p, (int)strlen(p));\n    free(p);\n    p = NULL;\n  }\n  return 0;\n}\n",
    "strjoin.c": "#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include \"strjoin.h\"\n\nchar *str_join(char *s1, char *s2)\n{\n  int len = strlen(s1) + strlen(s2);\n  char *p = malloc(sizeof(char) * (len + 1));\n  if (p == NULL) {\n    fprintf(stderr, \"malloc failed\\n\");\n    exit(1);\n  }\n  strcpy(p, s1);\n  strcat(p, s2);\n  return p;\n}\n",
    "listtoggle.h": "typedef struct node {\n  int val;\n  struct node *next;\n} node_t;\n\nnode_t *new_node(int val, node_t *next);\nvoid list_print(node_t *head);\nvoid list_free(node_t *head);\nvoid list_insert_delete_dup(node_t *head, int val);\n",
    "listtogglemain.c": "#include <stdio.h>\n#include <stdlib.h>\n#include \"listtoggle.h\"\n\nnode_t *new_node(int val, node_t *next)\n{\n  node_t *p = malloc(sizeof(node_t));\n  if (p == NULL) {\n    fprintf(stderr, \"malloc failed\\n\");\n    exit(1);\n  }\n  p->val = val;\n  p->next = next;\n  return p;\n}\n\nvoid list_print(node_t *head)\n{\n  node_t *p;\n  printf(\"[\");\n  for (p = head->next; p != NULL; p = p->next) {\n    printf(\" %d\", p->val);\n  }\n  printf(\" ]\\n\");\n}\n\nvoid list_free(node_t *head)\n{\n  node_t *p = head, *nx;\n  while (p != NULL) {\n    nx = p->next;\n    free(p);\n    p = nx;\n  }\n}\n\nint main(void)\n{\n  node_t *head = new_node(0, NULL);\n  int x;\n  while (scanf(\"%d\", &x) != EOF) {\n    list_insert_delete_dup(head, x);\n    printf(\"op %d : \", x);\n    list_print(head);\n  }\n  list_free(head);\n  return 0;\n}\n",
    "listtoggle.c": "#include <stdio.h>\n#include <stdlib.h>\n#include \"listtoggle.h\"\n\nvoid list_insert_delete_dup(node_t *head, int val)\n{\n  node_t *p, *del;\n  for (p = head; p->next != NULL; p = p->next) {\n    if (p->next->val == val) {\n      del = p->next;\n      p->next = del->next;\n      free(del);\n      return;\n    }\n    if (p->next->val > val) {\n      break;\n    }\n  }\n  p->next = new_node(val, p->next);\n}\n",
    "inssort.h": "void insertion_sort(int n, double *a);\n",
    "inssortmain.c": "#include <stdio.h>\n#include \"inssort.h\"\n\nint main(void)\n{\n  double a[64];\n  int n, i;\n  while (scanf(\"%d\", &n) != EOF) {\n    for (i = 0; i < n; i++) {\n      scanf(\"%lf\", &a[i]);\n    }\n    insertion_sort(n, a);\n    for (i = 0; i < n; i++) {\n      printf(\" %.2f\", a[i]);\n    }\n    printf(\"\\n\");\n  }\n  return 0;\n}\n",
    "inssort.c": "#include \"inssort.h\"\n\nvoid insertion_sort(int n, double *a)\n{\n  int k, i;\n  double tmp;\n  for (k = 1; k <= n - 1; k++) {\n    for (i = k; 1 <= i; i--) {\n      if (a[i - 1] <= a[i]) {\n        break;\n      }\n      tmp = a[i];\n      a[i] = a[i - 1];\n      a[i - 1] = tmp;\n    }\n  }\n}\n",
    "dbstr.h": "#define MAX_RECORDS 64\n#define STRLEN 63\n\ntypedef struct {\n  char key[STRLEN + 1];\n  int price;\n} item_rec_t;\n\ntypedef struct {\n  int n;\n  item_rec_t entry[MAX_RECORDS];\n} db_t;\n\nint db_search_name(db_t *db, char *key);\n",
    "dbstrmain.c": "#include <stdio.h>\n#include \"dbstr.h\"\n\nint main(void)\n{\n  db_t db;\n  char q[STRLEN + 1];\n  int i, price;\n  if (scanf(\"%d\", &db.n) == EOF) { return 0; }\n  for (i = 0; i < db.n; i++) {\n    scanf(\"%63s %d\", db.entry[i].key, &db.entry[i].price);\n  }\n  while (scanf(\"%63s\", q) != EOF) {\n    price = db_search_name(&db, q);\n    if (price >= 0) {\n      printf(\"%s : %d yen\\n\", q, price);\n    } else {\n      printf(\"%s : NO ITEM\\n\", q);\n    }\n  }\n  return 0;\n}\n",
    "dbstr.c": "#include <string.h>\n#include \"dbstr.h\"\n\nint db_search_name(db_t *db, char *key)\n{\n  int low = 0;\n  int high = db->n - 1;\n  int mid, c;\n  while (low <= high) {\n    mid = (low + high) / 2;\n    c = strcmp(key, db->entry[mid].key);\n    if (c == 0) {\n      return db->entry[mid].price;\n    } else if (c < 0) {\n      high = mid - 1;\n    } else {\n      low = mid + 1;\n    }\n  }\n  return -1;\n}\n",
    "filterpos.h": "int *alloc_positives(int n, int a[], int *out_m);\n",
    "filterposmain.c": "#include <stdio.h>\n#include <stdlib.h>\n#include \"filterpos.h\"\n\nint main(void)\n{\n  int a[64];\n  int *b;\n  int n, m, i;\n  while (scanf(\"%d\", &n) != EOF) {\n    for (i = 0; i < n; i++) {\n      scanf(\"%d\", &a[i]);\n    }\n    m = -1;\n    b = alloc_positives(n, a, &m);\n    printf(\"m=%d :\", m);\n    for (i = 0; i < m; i++) {\n      printf(\" %d\", b[i]);\n    }\n    printf(\"\\n\");\n    if (b != NULL) {\n      free(b);\n      b = NULL;\n    }\n  }\n  return 0;\n}\n",
    "filterpos.c": "#include <stdio.h>\n#include <stdlib.h>\n#include \"filterpos.h\"\n\nint *alloc_positives(int n, int a[], int *out_m)\n{\n  int i, k = 0, cnt = 0;\n  int *b;\n  for (i = 0; i < n; i++) {\n    if (a[i] > 0) { cnt++; }\n  }\n  *out_m = cnt;\n  if (cnt == 0) {\n    return NULL;\n  }\n  b = malloc(sizeof(int) * cnt);\n  if (b == NULL) {\n    fprintf(stderr, \"malloc failed\\n\");\n    exit(1);\n  }\n  for (i = 0; i < n; i++) {\n    if (a[i] > 0) {\n      b[k] = a[i];\n      k++;\n    }\n  }\n  return b;\n}\n",
    "strlist.h": "#define STRLEN 31\n\ntypedef struct snode {\n  char word[STRLEN + 1];\n  struct snode *next;\n} snode_t;\n\nsnode_t *new_snode(char *w, snode_t *next);\nvoid slist_print(snode_t *head);\nvoid slist_free(snode_t *head);\nsnode_t *slist_find(snode_t *head, char *key);\nint slist_remove(snode_t *head, char *key);\n",
    "strlistmain.c": "#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include \"strlist.h\"\n\nsnode_t *new_snode(char *w, snode_t *next)\n{\n  snode_t *p = malloc(sizeof(snode_t));\n  if (p == NULL) {\n    fprintf(stderr, \"malloc failed\\n\");\n    exit(1);\n  }\n  strcpy(p->word, w);\n  p->next = next;\n  return p;\n}\n\nvoid slist_print(snode_t *head)\n{\n  snode_t *p;\n  printf(\"[\");\n  for (p = head->next; p != NULL; p = p->next) {\n    printf(\" %s\", p->word);\n  }\n  printf(\" ]\\n\");\n}\n\nvoid slist_free(snode_t *head)\n{\n  snode_t *p = head, *nx;\n  while (p != NULL) {\n    nx = p->next;\n    free(p);\n    p = nx;\n  }\n}\n\nint main(void)\n{\n  snode_t *head = new_snode(\"\", NULL);\n  char cmd[8], w[STRLEN + 1];\n  while (scanf(\"%7s %31s\", cmd, w) != EOF) {\n    if (strcmp(cmd, \"add\") == 0) {\n      head->next = new_snode(w, head->next);\n    } else if (strcmp(cmd, \"find\") == 0) {\n      printf(\"find %s -> %s\\n\", w, slist_find(head, w) != NULL ? \"YES\" : \"NO\");\n    } else if (strcmp(cmd, \"del\") == 0) {\n      printf(\"del %s -> %d : \", w, slist_remove(head, w));\n      slist_print(head);\n    }\n  }\n  slist_free(head);\n  return 0;\n}\n",
    "strlist.c": "#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include \"strlist.h\"\n\nsnode_t *slist_find(snode_t *head, char *key)\n{\n  snode_t *p;\n  for (p = head->next; p != NULL; p = p->next) {\n    if (strcmp(p->word, key) == 0) {\n      return p;\n    }\n  }\n  return NULL;\n}\n\nint slist_remove(snode_t *head, char *key)\n{\n  snode_t *p, *del;\n  for (p = head; p->next != NULL; p = p->next) {\n    if (strcmp(p->next->word, key) == 0) {\n      del = p->next;\n      p->next = del->next;\n      free(del);\n      return 1;\n    }\n  }\n  return 0;\n}\n",
    "recsort.h": "#define STRLEN 31\n\ntypedef struct {\n  int id;\n  char name[STRLEN + 1];\n  int score;\n} student_t;\n\nvoid sort_students(int n, student_t *a);\n",
    "recsortmain.c": "#include <stdio.h>\n#include \"recsort.h\"\n\nint main(void)\n{\n  student_t a[64];\n  int n, i;\n  if (scanf(\"%d\", &n) == EOF) { return 0; }\n  for (i = 0; i < n; i++) {\n    scanf(\"%d %31s %d\", &a[i].id, a[i].name, &a[i].score);\n  }\n  sort_students(n, a);\n  for (i = 0; i < n; i++) {\n    printf(\"%d %s %d\\n\", a[i].id, a[i].name, a[i].score);\n  }\n  return 0;\n}\n",
    "recsort.c": "#include \"recsort.h\"\n\nstatic int comes_before(student_t x, student_t y)\n{\n  if (x.score != y.score) {\n    return x.score > y.score;\n  }\n  return x.id < y.id;\n}\n\nvoid sort_students(int n, student_t *a)\n{\n  int k, i;\n  student_t tmp;\n  for (k = 1; k <= n - 1; k++) {\n    for (i = k; 1 <= i; i--) {\n      if (!comes_before(a[i], a[i - 1])) {\n        break;\n      }\n      tmp = a[i];\n      a[i] = a[i - 1];\n      a[i - 1] = tmp;\n    }\n  }\n}\n",
    "dbsortfind.h": "#define MAX_RECORDS 64\n#define STRLEN 63\n\ntypedef struct {\n  char word[STRLEN + 1];\n  int count;\n} entry_t;\n\ntypedef struct {\n  int n;\n  entry_t entry[MAX_RECORDS];\n} db_t;\n\nvoid db_sort(db_t *db);\nentry_t *db_bsearch(db_t *db, char *word);\n",
    "dbsortfindmain.c": "#include <stdio.h>\n#include \"dbsortfind.h\"\n\nint main(void)\n{\n  db_t db;\n  char q[STRLEN + 1];\n  entry_t *p;\n  int i;\n  if (scanf(\"%d\", &db.n) == EOF) { return 0; }\n  for (i = 0; i < db.n; i++) {\n    scanf(\"%63s %d\", db.entry[i].word, &db.entry[i].count);\n  }\n  db_sort(&db);\n  printf(\"sorted:\");\n  for (i = 0; i < db.n; i++) {\n    printf(\" %s\", db.entry[i].word);\n  }\n  printf(\"\\n\");\n  while (scanf(\"%63s\", q) != EOF) {\n    p = db_bsearch(&db, q);\n    if (p != NULL) {\n      printf(\"%s -> %d\\n\", q, p->count);\n    } else {\n      printf(\"%s -> NONE\\n\", q);\n    }\n  }\n  return 0;\n}\n",
    "dbsortfind.c": "#include <stdio.h>\n#include <string.h>\n#include \"dbsortfind.h\"\n\nvoid db_sort(db_t *db)\n{\n  int k, i, min;\n  entry_t tmp;\n  for (k = 0; k <= db->n - 2; k++) {\n    min = k;\n    for (i = k + 1; i < db->n; i++) {\n      if (strcmp(db->entry[i].word, db->entry[min].word) < 0) {\n        min = i;\n      }\n    }\n    tmp = db->entry[k];\n    db->entry[k] = db->entry[min];\n    db->entry[min] = tmp;\n  }\n}\n\nentry_t *db_bsearch(db_t *db, char *word)\n{\n  int low = 0;\n  int high = db->n - 1;\n  int mid, c;\n  while (low <= high) {\n    mid = (low + high) / 2;\n    c = strcmp(word, db->entry[mid].word);\n    if (c == 0) {\n      return &db->entry[mid];\n    } else if (c < 0) {\n      high = mid - 1;\n    } else {\n      low = mid + 1;\n    }\n  }\n  return NULL;\n}\n",
    "mystrdup.h": "char *my_strdup_upper(char *s);\n",
    "mystrdupmain.c": "#include <stdio.h>\n#include <stdlib.h>\n#include \"mystrdup.h\"\n\nint main(void)\n{\n  char buf[64];\n  char *p;\n  while (scanf(\"%63s\", buf) != EOF) {\n    p = my_strdup_upper(buf);\n    printf(\"%s -> %s\\n\", buf, p);\n    free(p);\n    p = NULL;\n  }\n  return 0;\n}\n",
    "mystrdup.c": "#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include \"mystrdup.h\"\n\nchar *my_strdup_upper(char *s)\n{\n  int len = strlen(s);\n  int i;\n  char *p = malloc(sizeof(char) * (len + 1));\n  if (p == NULL) {\n    fprintf(stderr, \"malloc failed\\n\");\n    exit(1);\n  }\n  for (i = 0; i <= len; i++) {\n    if ('a' <= s[i] && s[i] <= 'z') {\n      p[i] = s[i] - 'a' + 'A';\n    } else {\n      p[i] = s[i];\n    }\n  }\n  return p;\n}\n",
    "wordsort.h": "#define STRLEN 63\n\nvoid string_sort(int n, char (*a)[STRLEN + 1]);\n",
    "wordsortmain.c": "#include <stdio.h>\n#include \"wordsort.h\"\n\nint main(void)\n{\n  char a[32][STRLEN + 1];\n  int n, i;\n  if (scanf(\"%d\", &n) == EOF) { return 0; }\n  for (i = 0; i < n; i++) {\n    scanf(\"%63s\", a[i]);\n  }\n  string_sort(n, a);\n  for (i = 0; i < n; i++) {\n    printf(\"%s\\n\", a[i]);\n  }\n  return 0;\n}\n",
    "wordsort.c": "#include <string.h>\n#include \"wordsort.h\"\n\nvoid string_sort(int n, char (*a)[STRLEN + 1])\n{\n  int k, i, min;\n  char tmp[STRLEN + 1];\n  for (k = 0; k <= n - 2; k++) {\n    min = k;\n    for (i = k + 1; i < n; i++) {\n      if (strcmp(a[i], a[min]) < 0) {\n        min = i;\n      }\n    }\n    strcpy(tmp, a[k]);\n    strcpy(a[k], a[min]);\n    strcpy(a[min], tmp);\n  }\n}\n"
  },
  "tests": {
    "darray": [
      {
        "stdin": "4\n1.5 -2.0 3.25 0.0\n3\n10.0 20.5 30.0\n",
        "expect": " 0.00 3.25 -2.00 1.50\n 30.00 20.50 10.00\n",
        "exit": 0
      },
      {
        "stdin": "1\n42.5\n5\n1 2 3 4 5\n",
        "expect": " 42.50\n 5.00 4.00 3.00 2.00 1.00\n",
        "exit": 0
      },
      {
        "stdin": "2\n-9.5 9.5\n",
        "expect": " 9.50 -9.50\n",
        "exit": 0
      }
    ],
    "listuniq": [
      {
        "stdin": "30 10 20 10 40 20 5\n",
        "expect": "ins 30 -> 1 : [ 30 ]\nins 10 -> 1 : [ 10 30 ]\nins 20 -> 1 : [ 10 20 30 ]\nins 10 -> 0 : [ 10 20 30 ]\nins 40 -> 1 : [ 10 20 30 40 ]\nins 20 -> 0 : [ 10 20 30 40 ]\nins 5 -> 1 : [ 5 10 20 30 40 ]\n",
        "exit": 0
      },
      {
        "stdin": "5 5 5\n",
        "expect": "ins 5 -> 1 : [ 5 ]\nins 5 -> 0 : [ 5 ]\nins 5 -> 0 : [ 5 ]\n",
        "exit": 0
      },
      {
        "stdin": "50 40 30 20 10 25 30\n",
        "expect": "ins 50 -> 1 : [ 50 ]\nins 40 -> 1 : [ 40 50 ]\nins 30 -> 1 : [ 30 40 50 ]\nins 20 -> 1 : [ 20 30 40 50 ]\nins 10 -> 1 : [ 10 20 30 40 50 ]\nins 25 -> 1 : [ 10 20 25 30 40 50 ]\nins 30 -> 0 : [ 10 20 25 30 40 50 ]\n",
        "exit": 0
      }
    ],
    "selsort": [
      {
        "stdin": "5\n6.0 2.0 4.0 9.0 8.0\n4\n-1.5 3.0 -4.2 0.0\n",
        "expect": " 2.00 4.00 6.00 8.00 9.00\n -4.20 -1.50 0.00 3.00\n",
        "exit": 0
      },
      {
        "stdin": "1\n7.5\n6\n9 8 7 6 5 4\n",
        "expect": " 7.50\n 4.00 5.00 6.00 7.00 8.00 9.00\n",
        "exit": 0
      },
      {
        "stdin": "5\n2.5 1.0 2.5 0.5 1.0\n",
        "expect": " 0.50 1.00 1.00 2.50 2.50\n",
        "exit": 0
      }
    ],
    "dbbin": [
      {
        "stdin": "6\n102 Sato 85\n108 Suzuki 72\n115 Takahashi 91\n123 Tanaka 68\n130 Ito 95\n142 Watanabe 79\n115 100 142 120 102\n",
        "expect": "115 -> [2] Takahashi (91)\n100 -> NOT FOUND\n142 -> [5] Watanabe (79)\n120 -> NOT FOUND\n102 -> [0] Sato (85)\n",
        "exit": 0
      },
      {
        "stdin": "1\n500 Only 88\n500 499 501\n",
        "expect": "500 -> [0] Only (88)\n499 -> NOT FOUND\n501 -> NOT FOUND\n",
        "exit": 0
      },
      {
        "stdin": "5\n10 A 1\n20 B 2\n30 C 3\n40 D 4\n50 E 5\n10 20 30 40 50 25\n",
        "expect": "10 -> [0] A (1)\n20 -> [1] B (2)\n30 -> [2] C (3)\n40 -> [3] D (4)\n50 -> [4] E (5)\n25 -> NOT FOUND\n",
        "exit": 0
      }
    ],
    "strjoin": [
      {
        "stdin": "Chiba Univ\nHello World\nC Lang\n",
        "expect": "ChibaUniv (len=9)\nHelloWorld (len=10)\nCLang (len=5)\n",
        "exit": 0
      },
      {
        "stdin": "a b\nabcdefghij klmnopqrst\n",
        "expect": "ab (len=2)\nabcdefghijklmnopqrst (len=20)\n",
        "exit": 0
      },
      {
        "stdin": "Pointer Memory\n",
        "expect": "PointerMemory (len=13)\n",
        "exit": 0
      }
    ],
    "listtoggle": [
      {
        "stdin": "20 10 30 20 5 10 25\n",
        "expect": "op 20 : [ 20 ]\nop 10 : [ 10 20 ]\nop 30 : [ 10 20 30 ]\nop 20 : [ 10 30 ]\nop 5 : [ 5 10 30 ]\nop 10 : [ 5 30 ]\nop 25 : [ 5 25 30 ]\n",
        "exit": 0
      },
      {
        "stdin": "10 10 10 10\n",
        "expect": "op 10 : [ 10 ]\nop 10 : [ ]\nop 10 : [ 10 ]\nop 10 : [ ]\n",
        "exit": 0
      },
      {
        "stdin": "40 20 30 10 40 10\n",
        "expect": "op 40 : [ 40 ]\nop 20 : [ 20 40 ]\nop 30 : [ 20 30 40 ]\nop 10 : [ 10 20 30 40 ]\nop 40 : [ 10 20 30 ]\nop 10 : [ 20 30 ]\n",
        "exit": 0
      }
    ],
    "inssort": [
      {
        "stdin": "5\n6.0 2.0 4.0 9.0 8.0\n4\n3.5 -2.0 3.5 -5.0\n",
        "expect": " 2.00 4.00 6.00 8.00 9.00\n -5.00 -2.00 3.50 3.50\n",
        "exit": 0
      },
      {
        "stdin": "1\n99.0\n6\n6 5 4 3 2 1\n",
        "expect": " 99.00\n 1.00 2.00 3.00 4.00 5.00 6.00\n",
        "exit": 0
      },
      {
        "stdin": "5\n1 2 3 4 5\n",
        "expect": " 1.00 2.00 3.00 4.00 5.00\n",
        "exit": 0
      }
    ],
    "dbstr": [
      {
        "stdin": "6\nApple 150\nBanana 120\nGrape 380\nLemon 100\nMelon 900\nPeach 260\nGrape Orange Apple Peach AAA ZZZ\n",
        "expect": "Grape : 380 yen\nOrange : NO ITEM\nApple : 150 yen\nPeach : 260 yen\nAAA : NO ITEM\nZZZ : NO ITEM\n",
        "exit": 0
      },
      {
        "stdin": "1\nJapan 50\nJapan China Russia\n",
        "expect": "Japan : 50 yen\nChina : NO ITEM\nRussia : NO ITEM\n",
        "exit": 0
      },
      {
        "stdin": "4\nC 10\nGo 20\nPython 30\nRust 40\nC Rust Java Go\n",
        "expect": "C : 10 yen\nRust : 40 yen\nJava : NO ITEM\nGo : 20 yen\n",
        "exit": 0
      }
    ],
    "filterpos": [
      {
        "stdin": "6\n-3 5 0 8 -1 2\n4\n-5 0 -2 -9\n",
        "expect": "m=3 : 5 8 2\nm=0 :\n",
        "exit": 0
      },
      {
        "stdin": "5\n10 20 30 40 50\n1\n0\n",
        "expect": "m=5 : 10 20 30 40 50\nm=0 :\n",
        "exit": 0
      },
      {
        "stdin": "3\n-1 7 -2\n",
        "expect": "m=1 : 7\n",
        "exit": 0
      }
    ],
    "strlist": [
      {
        "stdin": "add Japan\nadd China\nadd Russia\nfind China\nfind USA\ndel China\nfind China\ndel USA\ndel Russia\n",
        "expect": "find China -> YES\nfind USA -> NO\ndel China -> 1 : [ Russia Japan ]\nfind China -> NO\ndel USA -> 0 : [ Russia Japan ]\ndel Russia -> 1 : [ Japan ]\n",
        "exit": 0
      },
      {
        "stdin": "add A\ndel A\nfind A\nadd B\nfind B\n",
        "expect": "del A -> 1 : [ ]\nfind A -> NO\nfind B -> YES\n",
        "exit": 0
      },
      {
        "stdin": "add X\nadd Y\ndel X\ndel Y\ndel Z\n",
        "expect": "del X -> 1 : [ Y ]\ndel Y -> 1 : [ ]\ndel Z -> 0 : [ ]\n",
        "exit": 0
      }
    ],
    "recsort": [
      {
        "stdin": "5\n103 Sato 80\n101 Suzuki 95\n105 Takahashi 80\n102 Tanaka 70\n104 Ito 95\n",
        "expect": "101 Suzuki 95\n104 Ito 95\n103 Sato 80\n105 Takahashi 80\n102 Tanaka 70\n",
        "exit": 0
      },
      {
        "stdin": "1\n200 Solo 60\n",
        "expect": "200 Solo 60\n",
        "exit": 0
      },
      {
        "stdin": "4\n4 D 50\n2 B 50\n3 C 50\n1 A 50\n",
        "expect": "1 A 50\n2 B 50\n3 C 50\n4 D 50\n",
        "exit": 0
      }
    ],
    "dbsortfind": [
      {
        "stdin": "5\nRussia 30\nJapan 50\nChina 40\nIndia 20\nBrazil 10\nJapan USA Brazil Russia\n",
        "expect": "sorted: Brazil China India Japan Russia\nJapan -> 50\nUSA -> NONE\nBrazil -> 10\nRussia -> 30\n",
        "exit": 0
      },
      {
        "stdin": "1\nOnly 7\nOnly None\n",
        "expect": "sorted: Only\nOnly -> 7\nNone -> NONE\n",
        "exit": 0
      },
      {
        "stdin": "4\ndelta 4\nalpha 1\ncharlie 3\nbravo 2\nalpha delta echo bravo\n",
        "expect": "sorted: alpha bravo charlie delta\nalpha -> 1\ndelta -> 4\necho -> NONE\nbravo -> 2\n",
        "exit": 0
      }
    ],
    "mystrdup": [
      {
        "stdin": "Japan\nhello_123\nChibaUniv\n",
        "expect": "Japan -> JAPAN\nhello_123 -> HELLO_123\nChibaUniv -> CHIBAUNIV\n",
        "exit": 0
      },
      {
        "stdin": "a\nZ\nabcXYZ\n",
        "expect": "a -> A\nZ -> Z\nabcXYZ -> ABCXYZ\n",
        "exit": 0
      }
    ],
    "wordsort": [
      {
        "stdin": "5\nRussia\nChina\nJapan\nBrazil\nIndia\n",
        "expect": "Brazil\nChina\nIndia\nJapan\nRussia\n",
        "exit": 0
      },
      {
        "stdin": "4\nbanana\napple\nbanana\napricot\n",
        "expect": "apple\napricot\nbanana\nbanana\n",
        "exit": 0
      },
      {
        "stdin": "1\nsingle\n",
        "expect": "single\n",
        "exit": 0
      }
    ]
  },
  "sample": {
    "exp": "*b = 10.000\n0\n-7\n8\n"
  }
};
