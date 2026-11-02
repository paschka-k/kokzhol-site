#!/usr/bin/env python3
"""Idempotent: adds the customer-view preview (button card in #platform, kz-preview.css/js) to d/index.html. Run after every regeneration of the page.
usage: python tools/add-preview.py [path/to/d/index.html]"""
import sys, re
p = sys.argv[1] if len(sys.argv) > 1 else 'd/index.html'
s = open(p, encoding='utf-8').read()
if 'data-pv-open' in s:
    print('already present'); sys.exit(0)
card = ('      <div class="pv-cta rv"><p data-pv-note></p><button type="button" class="btn btn-secondary" data-pv-open aria-haspopup="dialog">Preview customer view</button></div>\n')
anchor = '      </div>\n      <div class="mock" aria-label="Demo of the hub goods receipt screen">'
assert s.count(anchor) == 1, 'anchor not found'
s = s.replace(anchor, card.replace('      <div', '        <div', 1) + anchor, 1)
s = s.replace('</head>', '<link rel="stylesheet" href="../assets/kz-preview.css">\n</head>', 1)
s = s.replace('</body>', '<script src="../assets/kz-preview.js" defer></script>\n</body>', 1)
open(p, 'w', encoding='utf-8').write(s); print('added')
