# BVH FK analyzer: prints head height (fraction of standing), chest facing, planar displacement relative to initial facing.
import sys,re,numpy as np
def rot(axis,a):
    a=np.radians(a);c,s=np.cos(a),np.sin(a)
    if axis=='X': return np.array([[1,0,0],[0,c,-s],[0,s,c]])
    if axis=='Y': return np.array([[c,0,s],[0,1,0],[-s,0,c]])
    return np.array([[c,-s,0],[s,c,0],[0,0,1]])
def parse(p):
    t=open(p).read(); h,m=t.split('MOTION')
    toks=h.split(); joints=[];stack=[];i=0;cur=None
    while i<len(toks):
        k=toks[i]
        if k in('ROOT','JOINT'): joints.append(dict(name=toks[i+1],parent=stack[-1] if stack else -1,ch=[]));cur=len(joints)-1;i+=2
        elif k=='End': joints.append(dict(name='End',parent=stack[-1],ch=[],end=1));cur=len(joints)-1;i+=2
        elif k=='{': stack.append(cur);i+=1
        elif k=='}': stack.pop();i+=1
        elif k=='OFFSET': joints[cur]['off']=np.array(list(map(float,toks[i+1:i+4])));i+=4
        elif k=='CHANNELS': n=int(toks[i+1]);joints[cur]['ch']=toks[i+2:i+2+n];i+=2+n
        else: i+=1
    ml=m.strip().split('\n'); ft=float(ml[1].split(':')[1])
    data=np.array([list(map(float,l.split())) for l in ml[2:] if l.strip()])
    return joints,ft,data
def fk(joints,row):
    P={};R={};c=0
    for j,J in enumerate(joints):
        r=np.eye(3);pos=J['off'].copy()
        for ch in J['ch']:
            v=row[c];c+=1
            if ch.endswith('position'): pos['XYZ'.index(ch[0])]=v
            else: r=r@rot(ch[0],v)
        if J['parent']<0: P[j]=pos;R[j]=r
        else: pp=J['parent'];P[j]=P[pp]+R[pp]@J['off'];R[j]=R[pp]@r
    return P,R
p=sys.argv[1]; step=float(sys.argv[2]) if len(sys.argv)>2 else 0.25
joints,ft,data=parse(p); data=data[1:] if not data[0][3:6].any() else data; names=[j['name'] for j in joints]
def ix(*c):
    for x in c:
        if x in names: return names.index(x)
hi=ix('Head','UpperNeckJoint'); ch=0
li,ri=ix('LeftUpLeg','LeftHipJoint'),ix('RightUpLeg','RightHipJoint'); la,ra=ix('LeftArm','LeftShoulderJoint'),ix('RightArm','RightShoulderJoint'); sp=ix('Spine','LowerSpineJoint')
def chestf(P):
    v=np.cross(P[la]-P[ra],P[hi]-P[sp]); return v/np.linalg.norm(v)
P0,R0=fk(joints,data[0]); L=P0[li]-P0[ri]; L[1]=0; L/=np.linalg.norm(L); f0=np.cross(L,[0,1,0]); r0=-L
# standing head height: max over first 1s
zero=np.zeros(data.shape[1]); Pr,_=fk(joints,zero); H=Pr[hi][1]-min(v[1] for v in Pr.values())
floor=min(min(v[1] for v in fk(joints,data[k])[0].values()) for k in range(0,len(data),max(1,len(data)//60)))
H0=max(fk(joints,data[k])[0][hi][1]-floor for k in range(0,min(len(data),int(1/ft)),10))
if H0>1.3*H: H=H0
n=int(step/ft); print(p.split('/')[-1],'dur %.2f'%(len(data)*ft),'headH',round(H,1),' (t headFrac fwd side chestFacingUp)')
out=[]
for k in range(0,len(data),n):
    P,R=fk(joints,data[k]); d=P[hi]-P0[hi]; fwd=chestf(P)
    ax=P[hi]-P[0]; hz=np.hypot(np.dot(ax,r0),np.dot(ax,f0)); axd=np.degrees(np.arctan2(np.dot(ax,r0),np.dot(ax,f0))) if hz>0.4*np.linalg.norm(ax) else 0
    out.append('%.2f:%.2f %+.1f %+.1f %+.1f %s'%(k*ft,(P[hi][1]-floor)/H,np.dot(d,f0)/H,np.dot(d,r0)/H,fwd[1],('a%+d'%axd) if axd else ''))
print(' | '.join(out))
