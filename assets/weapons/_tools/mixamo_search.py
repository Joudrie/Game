import json,subprocess,sys,urllib.parse
def q(term,typ):
    out=[]
    for page in range(1,6):
        u=f"https://www.mixamo.com/api/v1/products?page={page}&limit=96&order=&type={typ}&query={urllib.parse.quote(term)}"
        r=json.loads(subprocess.run(['curl','-s','-m','30',u,'-H','X-Api-Key: mixamo2'],capture_output=True,text=True).stdout)
        out+=r['results']
        if page>=r['pagination']['num_pages']: break
    return out
typ=sys.argv[1]
for t in sys.argv[2:]:
    res=q(t,typ)
    print(f"=== {typ} '{t}': {len(res)}")
    for p in res:
        if typ=='MotionPack':
            print(f"- {p['name']} ({len(p.get('motions',[]))}): {p['description'][:900]}")
        else:
            print(f"- {p['name']} :: {p['description'][:80]}")
