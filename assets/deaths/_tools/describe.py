# Reads analyzer output (bvh_fall.py / glb_motion.py) on stdin, prints an automatic motion description per clip.
import sys,re
def dirname(a):
    a=((a+180)%360)-180
    if abs(a)<=35: return 'forward'
    if abs(a)>=145: return 'backward'
    if 35<a<145: return 'to its right' 
    return 'to its left'
def facing(cf):
    return 'face-up' if cf>0.5 else ('face-down' if cf<-0.5 else 'on its side')
def desc(samples):
    # samples: list of (t,h,fwd,side,cf,a or None)
    h=[s[1] for s in samples]; T=samples[-1][0]
    fin=samples[-1]; mn=min(h); i_mn=h.index(mn)
    out=[]
    start=next((s[0] for s in samples if s[1]<0.9),None)
    ground=next((s for s in samples if s[1]<0.3),None)
    if ground and fin[1]<0.35:
        a=next((s[5] for s in samples if s[1]<0.3 and s[5] is not None),None)
        a_end=fin[5]
        out.append('falls %s (starts ~%.2fs, on ground ~%.2fs), ends %s'%(dirname(a) if a is not None else '?',start or 0,ground[0],facing(fin[4])))
        if a is not None and a_end is not None and abs(((a_end-a+180)%360)-180)>60: out.append('body twists/rolls after landing (%s -> %s)'%(dirname(a),dirname(a_end)))
        d=(fin[2]**2+fin[3]**2)**.5
        out.append('head travels %.1f body-heights %s%s'%(d,'back' if fin[2]<-0.2 else ('forward' if fin[2]>0.2 else 'sideways'), ' (thrown far)' if d>1.8 else ''))
        if start and ground[0]-start>1.0: out.append('slow collapse (%.1fs from first sag to ground)'%(ground[0]-start))
        if any(s[1]<0.75 for s in samples) and any(0.3<s[1]<0.65 for s in samples if s[0]<ground[0]) : out.append('passes through kneel/crouch height before ground')
        hmax=max(h[:max(1,h.index(ground[1]))]) if ground else 1
        if hmax>1.08: out.append('rises/airborne before landing (head %.2fx)'%hmax)
    elif ground and fin[1]>0.8:
        out.append('goes to ground (~%.2fs) and recovers to standing by %.2fs'%(ground[0],T))
    elif h[0]<0.5 and fin[1]>0.8:
        out.append('starts on ground %s, gets up to standing'%facing(samples[0][4]))
    else:
        d=max(((s[2]**2+s[3]**2)**.5) for s in samples)
        out.append('stays upright (lowest head %.2f at %.2fs), max head displacement %.1f body-heights, ends %s'%(mn,samples[i_mn][0],d,'recovered' if abs(fin[1]-h[0])<0.1 else 'head at %.2f'%fin[1]))
        fwdmin=min(s[2] for s in samples); fwdmax=max(s[2] for s in samples); sd=max(samples,key=lambda s:abs(s[3]))[3]
        if fwdmin<-0.15: out.append('recoils backward %.1f'%-fwdmin)
        if fwdmax>0.15: out.append('lurches forward %.1f'%fwdmax)
        if abs(sd)>0.15: out.append('sways %s %.1f'%('right' if sd>0 else 'left',abs(sd)))
    return '; '.join(out)
name=None
for line in sys.stdin:
    line=line.rstrip('\n')
    m=re.match(r'^(\S.*?) dur ([\d.]+) ',line)
    if m and not '|' in line: name=m.group(1); dur=m.group(2); continue
    if '|' not in line: continue
    if line.startswith('  '):  # glb format: name dur | samples
        parts=line.split(' | '); head=parts[0].split(); name=' '.join(head[:-1]); dur=head[-1].rstrip('s'); parts=parts[1:]
    else: parts=line.split(' | ')
    S=[]
    for p in parts:
        f=p.split(); t,h=f[0].split(':'); a=None
        if len(f)>4 and f[4].startswith('a'): a=float(f[4][1:])
        S.append((float(t),float(h),float(f[1]),float(f[2]),float(f[3]),a))
    print('%s\t%s\t%s'%(name,dur,desc(S)))
