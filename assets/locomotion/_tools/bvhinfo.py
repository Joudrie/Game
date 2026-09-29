import sys,re
for p in sys.argv[1:]:
    t=open(p,errors='ignore').read()
    joints=re.findall(r'(?:ROOT|JOINT)\s+(\S+)',t)
    fr=int(re.search(r'Frames:\s*(\d+)',t).group(1)); ft=float(re.search(r'Frame Time:\s*([\d.eE-]+)',t).group(1))
    print('%-45s joints=%d frames=%d fps=%.0f dur=%.2fs'%(p.split('/')[-1],len(joints),fr,1/ft,fr*ft))
    if len(sys.argv)==2 or p==sys.argv[1]: print('   joints:',' '.join(joints))
