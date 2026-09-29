# glTF/GLB animation FK analyzer: per clip, samples head height (fraction of rest), planar displacement of head along initial facing,
# and chest-facing-up (+1 face up, -1 face down). Usage: glb_motion.py file.glb [clipSubstr...] [--step 0.25]
import json,struct,sys,re,numpy as np,os
def load(p):
    d=open(p,'rb').read()
    if d[:4]==b'glTF':
        l=struct.unpack('<I',d[12:16])[0]; j=json.loads(d[20:20+l]); b=d[20+l+8:]
        bufs=[b]
    else:
        j=json.loads(d); import base64,urllib.parse
        bufs=[base64.b64decode(bb['uri'].split(',',1)[1]) if bb['uri'].startswith('data:') else open(os.path.join(os.path.dirname(p),urllib.parse.unquote(bb['uri'])),'rb').read() for bb in j['buffers']]
    return j,bufs
NC={'SCALAR':1,'VEC3':3,'VEC4':4,'MAT4':16}
CT={5126:('f',4),5123:('H',2),5121:('B',1),5122:('h',2),5120:('b',1)}
def acc(j,bufs,i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; buf=bufs[bv.get('buffer',0)]
    n=NC[a['type']]; fmt,sz=CT[a['componentType']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0)
    stride=bv.get('byteStride',n*sz); out=np.zeros((a['count'],n))
    for k in range(a['count']): out[k]=struct.unpack_from('<%d%s'%(n,fmt),buf,off+k*stride)
    if a.get('normalized'): out/= {'H':65535,'B':255,'h':32767,'b':127}[fmt]
    return out
def qmat(q):
    x,y,z,w=q; return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
def main():
    args=sys.argv[1:]; step=0.25
    if '--step' in args: i=args.index('--step'); step=float(args[i+1]); del args[i:i+2]
    p=args[0]; filt=args[1:]
    j,bufs=load(p); nodes=j['nodes']; N=len(nodes)
    parent=[-1]*N
    for i,n in enumerate(nodes):
        for c in n.get('children',[]): parent[c]=i
    def base(i):
        n=nodes[i]; return dict(t=np.array(n.get('translation',[0,0,0.])),r=np.array(n.get('rotation',[0,0,0,1.])),s=np.array(n.get('scale',[1,1,1.])))
    names=[n.get('name','') for n in nodes]
    skin=j['skins'][0]['joints'] if j.get('skins') else list(range(N))
    def find(pats,excl=()):
        for pat in pats:
            for i in skin:
                nm=names[i].lower()
                if re.search(pat,nm) and not any(e in nm for e in excl): return i
    head=find([r'(^|[^a-z])head$',r'head(?!top|_end|end)',r'head'],('end','top','nub'))
    hips=find([r'hips?$',r'pelvis',r'hip',r'root'])
    la=find([r'(upper_?arm|arm)[._]?l$',r'left_?(upper)?arm',r'l_?upperarm',r'upperarm_l',r'arm\.l',r'shoulder.*l$',r'left'],('fore','low','hand','leg'))
    ra=find([r'(upper_?arm|arm)[._]?r$',r'right_?(upper)?arm',r'r_?upperarm',r'upperarm_r',r'arm\.r',r'shoulder.*r$',r'right'],('fore','low','hand','leg'))
    def world(pose):
        W=[None]*N
        def g(i):
            if W[i] is not None: return W[i]
            b=pose[i]; M=np.eye(4); M[:3,:3]=qmat(b['r'])*b['s']; M[:3,3]=b['t']
            W[i]=M if parent[i]<0 else g(parent[i])@M; return W[i]
        return [g(i)[:3,3] for i in range(N)] if False else g
    print('##',os.path.basename(p),'head=%s hips=%s larm=%s rarm=%s'%(names[head] if head is not None else None,names[hips] if hips is not None else None,names[la] if la is not None else None,names[ra] if ra is not None else None))
    restg=world({i:base(i) for i in range(N)}); H=restg(head)[1,3]-min(0,0)
    for a in j.get('animations',[]):
        nm=a.get('name','')
        if filt and not any(f.lower() in nm.lower() for f in filt): continue
        ch=[]
        for c in a['channels']:
            s=a['samplers'][c['sampler']]; ch.append((c['target'].get('node'),c['target']['path'],acc(j,bufs,s['input'])[:,0],acc(j,bufs,s['output'])))
        dur=max(c[2][-1] for c in ch)
        def pose(t):
            P={i:base(i) for i in range(N)}
            for n,path,ti,vo in ch:
                if n is None: continue
                key={'translation':'t','rotation':'r','scale':'s'}.get(path)
                if key is None: continue
                if t<=ti[0]: v=vo[0]
                elif t>=ti[-1]: v=vo[-1]
                else:
                    k=np.searchsorted(ti,t)-1; f=(t-ti[k])/(ti[k+1]-ti[k]); v0,v1=vo[k],vo[k+1]
                    if key=='r' and np.dot(v0,v1)<0: v1=-v1
                    v=v0*(1-f)+v1*f
                    if key=='r': v=v/np.linalg.norm(v)
                P[n][key]=np.array(v)
            return P
        # find ground: min over joints? use rest head height; normalise by head height at t=0
        g0=world(pose(0)); h0=g0(head)[:3,3]
        L=g0(la)[:3,3]-g0(ra)[:3,3] if la is not None and ra is not None else np.array([1.,0,0]); L[1]=0; L/=np.linalg.norm(L)+1e-9; f0=np.cross(L,[0,1,0]); r0=-L
        Hn=max(h0[1],restg(head)[1,3],1e-6); out=[]
        # ground reference: min y of all skin joints at t0
        t=0.0
        while t<=dur+1e-6:
            g=world(pose(t)); hp=g(head)[:3,3]; d=hp-h0
            cf=0
            if la is not None:
                v=np.cross(g(la)[:3,3]-g(ra)[:3,3],hp-g(hips)[:3,3]); cf=v[1]/(np.linalg.norm(v)+1e-9)
            ax=hp-g(hips)[:3,3]; axd=np.degrees(np.arctan2(np.dot(ax,r0),np.dot(ax,f0))) if np.hypot(np.dot(ax,r0),np.dot(ax,f0))>0.4*np.linalg.norm(ax) else 0
            out.append('%.2f:%.2f %+.1f %+.1f %+.1f %s'%(t,hp[1]/Hn,np.dot(d,f0)/Hn,np.dot(d,r0)/Hn,cf,('a%+d'%axd) if axd else ''))
            t+=step
        print('  %-32s %.2fs | '%(nm,dur)+' | '.join(out))
main()
