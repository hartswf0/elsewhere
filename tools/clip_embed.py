"""Embed every page picture with OpenCLIP, on your own machine, and write tools/clip.json for the build.

Run from the repository root:
    pip install open_clip_torch torch pillow
    python tools/clip_embed.py              # ViT-B-32 / laion2b_s34b_b79k, CPU is fine (about 1,700 images)

It reads views/*.webp (several views of each page) and thumbs/*.webp (each page's picture), and writes
tools/clip.json:
    {"model": ..., "files": {"views/abc-1.webp": "<base64 of 512 int8 values>", ...},
     "looks": {"views/abc-1.webp": {"a title screen": 0.31, ...}, ...}}
The build (gen9.py) uses it to: fold pictures that look the same, mark down title screens and menus when choosing
a page's best view, find "looks like" neighbours across repositories, and tag each picture with how it looks.
Commit tools/clip.json and rebuild; nothing else is needed.
"""
import base64, glob, json, os, sys
import numpy as np
import torch, open_clip
from PIL import Image

MODEL, PRETRAINED = os.environ.get('CLIP_MODEL', 'ViT-B-32'), os.environ.get('CLIP_PRETRAINED', 'laion2b_s34b_b79k')
LOOKS = [
    'a title screen with a start button', 'a menu of options', 'a page of text', 'a diagram', 'a data dashboard',
    'a 3D scene', 'a video game in play', 'a film still', 'a timeline editor', 'a grid of thumbnails',
    'a map', 'a node graph', 'a drawing tool', 'abstract generative art', 'a chat interface', 'a slide presentation',
    'a dark interface', 'a colourful interface', 'a blank or loading screen',
]

def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    files = sorted(glob.glob(os.path.join(root, 'views', '*.webp')) + glob.glob(os.path.join(root, 'thumbs', '*.webp')))
    if not files:
        sys.exit('No pictures found in views/ or thumbs/. Run this from the repository.')
    dev = 'cuda' if torch.cuda.is_available() else ('mps' if torch.backends.mps.is_available() else 'cpu')
    model, _, pre = open_clip.create_model_and_transforms(MODEL, pretrained=PRETRAINED, device=dev)
    tok = open_clip.get_tokenizer(MODEL)
    model.eval()
    with torch.no_grad():
        t = model.encode_text(tok(LOOKS).to(dev)); t = t / t.norm(dim=-1, keepdim=True)
    out, looks = {}, {}
    B = 32
    for i in range(0, len(files), B):
        batch = files[i:i + B]
        ims = torch.stack([pre(Image.open(f).convert('RGB')) for f in batch]).to(dev)
        with torch.no_grad():
            e = model.encode_image(ims); e = e / e.norm(dim=-1, keepdim=True)
            p = (100 * e @ t.T).softmax(dim=-1).cpu().numpy()
        e = e.cpu().numpy()
        for f, v, pr in zip(batch, e, p):
            rel = os.path.relpath(f, root).replace(os.sep, '/')
            q = np.clip(np.round(v * 127 / max(1e-6, np.abs(v).max())), -127, 127).astype(np.int8)
            out[rel] = base64.b64encode(q.tobytes()).decode()
            top = np.argsort(-pr)[:3]
            looks[rel] = {LOOKS[k]: round(float(pr[k]), 3) for k in top}
        print(f'{min(i + B, len(files))}/{len(files)}', end='\r', flush=True)
    json.dump({'model': MODEL + '/' + PRETRAINED, 'looks_vocab': LOOKS, 'files': out, 'looks': looks},
              open(os.path.join(root, 'tools', 'clip.json'), 'w'))
    print(f'\nwrote tools/clip.json: {len(out)} pictures, model {MODEL}/{PRETRAINED}')

if __name__ == '__main__':
    main()
