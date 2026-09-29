import json,struct,sys,math
p=sys.argv[1]; d=open(p,'rb').read(); l=struct.unpack('<I',d[12:16])[0]; j=json.loads(d[20:20+l]); b=d[20+l+8:]
def acc(i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0)
    n={'SCALAR':1,'VEC3':3,'VEC4':4}[a['type']]; v=struct.unpack_from('<%df'%(a['count']*n),b,off); return [v[k*n:(k+1)*n] for k in range(a['count'])]
names=[n.get('name') for n in j['nodes']]
for a in j['animations']:
    if not any(k in a['name'] for k in sys.argv[2].split(',')): continue
    for c in a['channels']:
        if names[c['target']['node']] in ('root','Root') and c['target']['path']=='translation':
            s=a['samplers'][c['sampler']]; t=acc(s['input']); v=acc(s['output'])
            dist=math.dist(v[0],v[-1]); dur=t[-1][0]-t[0][0]
            print('%-22s dur %.2fs  root disp %.2f  speed %.2f units/s  delta=%s'%(a['name'],dur,dist,dist/dur if dur else 0,[round(x,2) for x in [v[-1][i]-v[0][i] for i in range(3)]]))
