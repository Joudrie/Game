import io,sys,zipfile,urllib.request,os,ssl
class RF(io.RawIOBase):
    def __init__(s,url):
        s.url=url; s.pos=0
        r=urllib.request.urlopen(urllib.request.Request(url,headers={'Range':'bytes=0-0'})); s.size=int(r.headers['Content-Range'].split('/')[1])
    def seekable(s): return True
    def readable(s): return True
    def tell(s): return s.pos
    def seek(s,o,w=0):
        s.pos = o if w==0 else (s.pos+o if w==1 else s.size+o); return s.pos
    def read(s,n=-1):
        if n<0: n=s.size-s.pos
        if n==0 or s.pos>=s.size: return b''
        end=min(s.pos+n,s.size)-1
        req=urllib.request.Request(s.url,headers={'Range':'bytes=%d-%d'%(s.pos,end)})
        d=urllib.request.urlopen(req).read(); s.pos+=len(d); return d
    def readinto(s,b):
        d=s.read(len(b)); b[:len(d)]=d; return len(d)
url=sys.argv[1]; mode=sys.argv[2]
z=zipfile.ZipFile(io.BufferedReader(RF(url),buffer_size=1<<20))
if mode=='list':
    for i in z.infolist(): print(i.filename,i.file_size,i.compress_size)
else:
    out=sys.argv[3]
    for name in sys.argv[4:]:
        d=z.read(name); p=os.path.join(out,os.path.basename(name)); open(p,'wb').write(d); print('wrote',p,len(d))
