import json, subprocess, os, sys
W='/home/user/b3_work'
def run(d, srcs, stdin):
    exe='/tmp/gx'
    subprocess.run(['gcc','-o',exe]+[os.path.join(W,d,s) for s in srcs]+['-lm'],check=True)
    r=subprocess.run([exe],input=stdin.encode(),capture_output=True)
    return r.stdout.decode()
def rd(d,f): return open(os.path.join(W,d,f)).read()
spec={
 'b1':{
  'sol':{'1-1':['san.c'],'1-3':['san2.c'],'1-4':['dist.c'],'1-5':['gpa.c'],'1-6':['wt.c'],'1-7':['aiueo.c'],'1-8':['match.c'],'o1-1':['poker.c'],'o1-2':['nsol_ceq.c']},
  'given':{},
  'exp':{'1-1':[('san.c',),''],'1-3':[('san2.c',),'77\n'],'1-4':[('dist.c',),rd('b2','dist-in.txt')],'1-5':[('gpa.c',),rd('b1','gpa-in.txt')],
         '1-6a':[('wt.c',),'3\n1.1 2.2 3.3\n0 1 1 2\n'],'1-6b':[('wt.c',),'5\n10.3 15.7 23.3 32.1 8.5\n0 1 0 2 4 3 1 2 4 3 1 0\n'],
         '1-7':[('aiueo.c',),'these\nKwansei\nprogramming\nqq\n'],'1-8':[('match.c',),rd('b1','match-in.txt')],'o1-1':[('poker.c',),rd('b1','poker-in.txt')],'o1-2':[('nsol_ceq.c',),rd('b1','ceq-in.txt')]},
 },
 'b2':{
  'sol':{'2-1':['dist2.c'],'2-2':['qeq.c'],'2-3':['dist3main.c','dist3.c','dist3.h'],'2-4':['qeq2main.c','qeq2.c','qeq2.h'],'2-5':['bisection.c'],'2-6':['body.c'],'2-7':['dist4.c'],'2-8':['irand.c'],'o2-1':['newton.c'],'o2-2':['omiai.c']},
  'given':{'2-5':['bisection.h','bisection_main.c'],'2-7':['dist4.h','dist4main.c'],'o2-1':['newton.h','newton_main.c']},
  'exp':{'2-1':[('dist2.c',),rd('b2','dist-in.txt')],'2-2':[('qeq.c',),rd('b2','qeq-in.txt')],'2-5':[('bisection_main.c','bisection.c'),rd('b2','bis-in.txt')],
         '2-6':[('body.c',),'Taro\n175.4\n65.3\nHanako\n157.3\n48.8\nq\n'],'2-7':[('dist4main.c','dist4.c'),rd('b2','dist-in.txt')],'o2-1':[('newton_main.c','newton.c'),rd('b2','newton-in.txt')],
         'o2-2':[('omiai.c',),''],'2-8':[('irand.c',),'7 8 10\n']},
 }}
for u,S in spec.items():
    D={'sol':{},'given':{},'exp':{},'inp':{}}
    for k,fs in S['sol'].items(): D['sol'][k]={f:rd(u,f) for f in fs}
    for k,fs in S['given'].items(): D['given'][k]={f:rd(u,f) for f in fs}
    for k,(srcs,inp) in S['exp'].items(): D['exp'][k]=run(u,list(srcs),inp); D['inp'][k]=inp
    js='/* 自動生成 (b3_work/gen/gen.py): gcc で検証済みの模範解答・配布ファイル・期待値 */\nwindow.%s_DATA = %s;\n'%(u.upper(),json.dumps(D,ensure_ascii=False,indent=1))
    open('/home/user/webapp/public/static/js/units/%s-data.js'%u,'w').write(js)
    for k,v in D['exp'].items(): print(u,k,repr(v[:120]))
