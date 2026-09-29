import re, sys, os, subprocess, html
SKIP={'blends','blend','obj','fbx','source','unity','unreal'}
def ls(fid):
    h=subprocess.run(['curl','-sL',f'https://drive.google.com/embeddedfolderview?id={fid}'],capture_output=True,text=True).stdout
    return [(html.unescape(t), kind, i) for kind,i,t in re.findall(r'href="https://drive.google.com/(drive/folders|file/d)/([A-Za-z0-9_-]+)[^"]*"[^>]*>.*?flip-entry-title">([^<]+)',h,re.S)]
def walk(fid,dest,listonly):
    os.makedirs(dest,exist_ok=True)
    for name,kind,i in ls(fid):
        p=os.path.join(dest,name)
        if kind=='drive/folders':
            if name.lower() in SKIP and '--all' not in sys.argv: print('skip dir',p); continue
            walk(i,p,listonly)
        else:
            print('file',p)
            if not listonly and not os.path.exists(p):
                subprocess.run(['gdown','-q',i,'-O',p])
walk(sys.argv[1],sys.argv[2],'--list' in sys.argv)
