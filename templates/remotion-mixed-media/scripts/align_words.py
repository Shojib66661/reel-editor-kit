import json,difflib,re
Z=json.load(open('zip_words.json'))
txt="""Hey Texas! We're out here on a build site today in Frisco, Texas and we're just wrapping up a job. One of the upgrades that we offer with the Texas Proof Roof, this is an option, and this is High Profile Ridge. So if you've ever seen a roof, the ridge of the roof, it's just that piece that's like an accessory. It just really finishes off nicely. The difference, one of the differences, for instance, is oftentimes you can kind of see the edge of the ridge. With the High Profile Ridge, you're going to see a nice smooth finish. It just gives it a nice finished look. So again, we're out here in Frisco wrapping up the job, but just, you know, if you're looking to replace your roof less often, that's one of the things that we're known for, that we really shoot for, maybe that really sets us apart from other roofers. If you're looking to replace your roof less often, with the deductibles going up and up, every handful of years you're having to replace your roof, it's just not making sense anymore to use a standard roofing system. You want a Texas Proof roofing system. So give us a call at High Performance to find out what that means, what that looks like. Happy to give you a complimentary consultation and inspect your home exterior, let you know what the options are that are available. The industry is changing, insurance is changing, your roof needs to change as well. And give us a call."""
W=txt.split()
norm=lambda w: re.sub(r"[^a-z']","",w.lower())
a=[norm(w) for w in W]; b=[norm(w) for w,_ in Z]
sm=difflib.SequenceMatcher(None,a,b,autojunk=False)
t=[None]*len(W)
for blk in sm.get_matching_blocks():
    for k in range(blk.size): t[blk.a+k]=Z[blk.b+k][1]
# also for replace ops of equal length map directly
for op,i1,i2,j1,j2 in sm.get_opcodes():
    if op=='replace':
        for k in range(i2-i1):
            jj=j1+int(k*(j2-j1)/(i2-i1))
            if jj<j2: t[i1+k]=Z[jj][1]
# interpolate
n=len(W)
for i in range(n):
    if t[i] is None:
        p=i-1
        while p>=0 and t[p] is None: p-=1
        q=i+1
        while q<n and t[q] is None: q+=1
        tp=t[p] if p>=0 else 0; tq=t[q] if q<n else tp+0.5
        t[i]=tp+(tq-tp)*(i-p)/(q-p)
out=[]
for i,w in enumerate(W):
    end=t[i+1] if i+1<n else t[i]+0.45
    end=min(end,t[i]+0.8)
    out.append({'w':w,'s':round(t[i],2),'e':round(end,2)})
json.dump(out,open('words.json','w'),indent=0)
print(' '.join(f"{o['w']}@{o['s']}" for o in out))
