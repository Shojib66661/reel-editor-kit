import onnxruntime as ort, cv2, numpy as np, os
sess=ort.InferenceSession('models/u2net_human_seg.onnx',providers=['CPUExecutionProvider'])
inp=sess.get_inputs()[0].name
cap=cv2.VideoCapture('roof.mp4'); i=0
mean=np.array([0.485,0.456,0.406]); std=np.array([0.229,0.224,0.225])
while True:
    ok,fr=cap.read()
    if not ok or i>=2160: break
    p=f'masks/{i:05d}.png'
    if not os.path.exists(p):
        im=cv2.cvtColor(cv2.resize(fr,(320,320),interpolation=cv2.INTER_AREA),cv2.COLOR_BGR2RGB).astype(np.float32)
        im=im/im.max(); im=(im-mean)/std
        x=im.transpose(2,0,1)[None].astype(np.float32)
        o=sess.run(None,{inp:x})[0][0,0]
        o=(o-o.min())/(o.max()-o.min()+1e-8)
        m=cv2.resize(o,(720,1280),interpolation=cv2.INTER_LINEAR)
        cv2.imwrite(p,(m*255).astype(np.uint8))
    i+=1
    if i%100==0: print(i,flush=True)
print('done')
