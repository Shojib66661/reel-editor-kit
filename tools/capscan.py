"""Run caption detection on every frame of a video -> json list of boxes per frame."""
import cv2, json, sys
sys.path.insert(0, __import__('os').path.dirname(__file__))
from caption_detect import detect
src, out = sys.argv[1], sys.argv[2]
scale = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
cap = cv2.VideoCapture(src); res = []
while True:
    ok, fr = cap.read()
    if not ok: break
    if scale != 1.0: fr = cv2.resize(fr, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    res.append(detect(fr))
json.dump(res, open(out, 'w'))
print(len(res), 'frames,', sum(1 for r in res if r), 'with hits')
