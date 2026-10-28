# Tile screenshots into contact sheets:  python scripts/sheet.py "qa/shots/he-desktop-light-home-*.png" qa/sheet.jpg [cols] [width]
import sys, glob
from PIL import Image, ImageDraw
pattern, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
w = int(sys.argv[4]) if len(sys.argv) > 4 else 480
files = sorted(glob.glob(pattern))
if not files: sys.exit('no files for ' + pattern)
ims = [Image.open(f).convert('RGB') for f in files]
th = [int(im.height * w / im.width) for im in ims]
rh = min(max(th), int(w * 1.6))
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * w, rows * (rh + 18)), 'white')
d = ImageDraw.Draw(S)
for i, im in enumerate(ims):
    im = im.resize((w, th[i]))
    if im.height > rh: im = im.crop((0, 0, w, rh))
    x, y = (i % cols) * w, (i // cols) * (rh + 18)
    S.paste(im, (x, y + 18))
    d.text((x + 4, y + 2), files[i].split('/')[-1].split('\\')[-1][:70], fill='black')
S.save(out, quality=85)
print(out, S.size, len(files))
