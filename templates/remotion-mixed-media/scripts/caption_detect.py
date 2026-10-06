import cv2, numpy as np, json, sys
def detect(fr):
    f=fr.astype(np.int16); b,g,r=f[...,0],f[...,1],f[...,2]
    mn=np.minimum(np.minimum(r,g),b); mx=np.maximum(np.maximum(r,g),b)
    white=(mn>232)&(mx-mn<30)
    blue=(b>150)&(b-r>90)&(g>60)&(g<170)
    M=(white|blue).astype(np.uint8)
    lum=(0.3*r+0.59*g+0.11*b)
    n,lab,st,cen=cv2.connectedComponentsWithStats(M,8)
    keep=np.zeros(n,bool)
    dil=cv2.dilate(M,np.ones((11,11),np.uint8))
    ring=(dil>0)&(cv2.dilate(M,np.ones((5,5),np.uint8))==0)
    # mean lum of ring per component: approximate via dilated labels
    labd=cv2.dilate(lab.astype(np.float32),np.ones((11,11),np.uint8)).astype(np.int32)
    rs=np.bincount(labd[ring],weights=lum[ring],minlength=n); rc=np.bincount(labd[ring],minlength=n)
    boxes=[]
    for i in range(1,n):
        x,y,w,h,a=st[i]
        if a<40 or h<22 or h>70 or w>520 or w<4: continue
        if rc[i]==0: continue
        if rs[i]/rc[i]>125: continue
        boxes.append((x,y,w,h))
    # cluster rows
    rows={}
    for x,y,w,h in boxes:
        cy=(y+h/2)//20
        rows.setdefault(cy,[]).append((x,y,w,h))
    best=[]
    for k,bs in rows.items():
        if sum(b[2] for b in bs)<40: continue
        x0=min(b[0] for b in bs); x1=max(b[0]+b[2] for b in bs)
        y0=min(b[1] for b in bs); y1=max(b[1]+b[3] for b in bs)
        best.append([int(x0),int(y0),int(x1),int(y1),len(bs)])
    return best
if __name__=='__main__':
    for p in sys.argv[1:]:
        fr=cv2.imread(p); bs=detect(fr); print(p,bs)
        for x0,y0,x1,y1,n in bs: cv2.rectangle(fr,(x0,y0),(x1,y1),(0,0,255),3)
        cv2.imwrite(p.replace('.png','_det.png'),fr)
