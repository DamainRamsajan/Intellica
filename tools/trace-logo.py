#!/usr/bin/env python3
"""One-off: traces the supplied logo PNG into vector SVGs (the PNG has transparency; two colours: navy and teal).
Usage: python3 tools/trace-logo.py path/to/logo.png   -> site/assets/logo/*.svg and PNG sizes"""
import sys, cv2, numpy as np
src = sys.argv[1]
im = cv2.imread(src, cv2.IMREAD_UNCHANGED)
S = 3  # upscale for smoother curves
im = cv2.resize(im, None, fx=S, fy=S, interpolation=cv2.INTER_CUBIC)
a = im[..., 3]
b, g, r = im[..., 0].astype(int), im[..., 1].astype(int), im[..., 2].astype(int)
solid = a > 127
teal = solid & (g > 110) & (b > 110) & (r < 110)
navy = solid & ~teal

def paths(mask, region):
    m = (mask.astype(np.uint8)) * 255
    x0, y0, x1, y1 = [v * S for v in region]
    sub = np.zeros_like(m); sub[y0:y1, x0:x1] = m[y0:y1, x0:x1]
    cs, hier = cv2.findContours(sub, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    out = []
    for c in cs:
        if cv2.contourArea(c) < 12 * S * S: continue
        ap = cv2.approxPolyDP(c, 0.9, True)[:, 0, :] / S
        out.append('M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in ap) + 'Z')
    return ''.join(out)

H, W = im.shape[0] // S, im.shape[1] // S
regions = {'mark': (150, 90, 620, 620), 'word': (640, 140, 2040, 450), 'tag': (640, 470, 2040, 560)}
data = {k: {'navy': paths(navy, rg), 'teal': paths(teal, rg)} for k, rg in regions.items()}

def svg(vb, parts, navy_col, teal_col, bg=None):
    x, y, w, h = vb
    body = ''
    if bg: body += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{bg}"/>'
    for key in parts:
        if data[key]['navy']: body += f'<path fill="{navy_col}" fill-rule="evenodd" d="{data[key]["navy"]}"/>'
        if data[key]['teal']: body += f'<path fill="{teal_col}" fill-rule="evenodd" d="{data[key]["teal"]}"/>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {w} {h}" role="img" aria-label="Intellica">{body}</svg>\n'

import os
out = 'site/assets/logo'
os.makedirs(out, exist_ok=True)
LIGHT, TEAL_D, NAVY, TEAL = '#e8eeff', '#19c5c0', '#06214d', '#00a9a6'
# on dark backgrounds (the site): white navy parts, brighter teal
import re as _re
def slim(svg):
    # whole-pixel coordinates and implicit lineto: the logo is drawn at most ~70 px tall, so this is invisible and ~40% smaller
    def d(m):
        p = _re.sub(r'(-?\d+\.\d+)', lambda x: str(round(float(x.group(1)))), m.group(1))
        p = _re.sub(r'L(?=-?\d)', ' ', p)
        p = _re.sub(r'M(-?\d+ -?\d+) ', r'M\1 L', p)
        return ' d="' + _re.sub(r'\s+', ' ', p) + '"'
    return _re.sub(r' d="([^"]*)"', d, svg)
_svg = svg
svg = lambda *a, **k: slim(_svg(*a, **k))
open(f'{out}/intellica-mark.svg', 'w').write(svg((180, 100, 440, 500), ['mark'], LIGHT, TEAL_D))
open(f'{out}/intellica-logo.svg', 'w').write(svg((180, 100, 1840, 500), ['mark', 'word'], LIGHT, TEAL_D))
open(f'{out}/intellica-logo-tagline.svg', 'w').write(svg((180, 100, 1840, 480), ['mark', 'word', 'tag'], LIGHT, TEAL_D))
# on light backgrounds (documents, print, slides): the original colours
open(f'{out}/intellica-logo-on-light.svg', 'w').write(svg((180, 100, 1840, 480), ['mark', 'word', 'tag'], NAVY, TEAL))
open(f'{out}/intellica-mark-on-light.svg', 'w').write(svg((180, 100, 440, 500), ['mark'], NAVY, TEAL))
# favicon: the mark on a dark tile
open('site/assets/favicon.svg', 'w').write(svg((100, 62, 580, 580), ['mark'], LIGHT, TEAL_D, bg='#080c16').replace('role="img" aria-label="Intellica"', ''))
print({k: (len(v['navy']), len(v['teal'])) for k, v in data.items()})
