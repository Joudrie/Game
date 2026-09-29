import json,struct,sys
def load(p):
    d=open(p,'rb').read()
    if d[:4]==b'glTF':
        l=struct.unpack('<I',d[12:16])[0]; j=json.loads(d[20:20+l]); binoff=20+l+8; b=d[binoff:]
    else:
        j=json.load(open(p)); b=None
    return j,b
def acc_max(j,b,i):
    a=j['accessors'][i]
    if 'max' in a: return a['max'][0]
    bv=j['bufferViews'][a['bufferView']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0)
    v=struct.unpack_from('<%df'%a['count'],b,off); return max(v)
for p in sys.argv[1:]:
    j,b=load(p)
    nodes=j.get('nodes',[])
    skins=j.get('skins',[])
    print('##',p,'meshes',len(j.get('meshes',[])),'skins',len(skins),'anims',len(j.get('animations',[])))
    for s in skins:
        names=[nodes[k].get('name') for k in s['joints']]
        print('  skin joints(%d):'%len(names),', '.join(names[:70]))
    for a in j.get('animations',[]):
        dur=max(acc_max(j,b,s['input']) for s in a['samplers'])
        print('  %-40s %.2fs'%(a.get('name'),dur))
