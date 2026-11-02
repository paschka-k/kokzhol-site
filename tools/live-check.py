# -*- coding: utf-8 -*-
"""Live uptime and certificate check for the published Kökzhol site (P3 ops item).
usage: live-check.py <base url>   e.g. https://paschka-k.github.io/kokzhol-site/  or  https://kokzhol.kz/
Checks: every public path answers 200 with the expected content type; the HTML carries the canonical, one JSON-LD block
and the FAQ count; the TLS certificate of the host is valid for at least 21 more days. Exit 1 on any failure."""
import sys, ssl, socket, json, re, urllib.request, datetime
base = sys.argv[1].rstrip('/') + '/'
host = base.split('//')[1].split('/')[0]
fails = 0
def chk(name, ok, detail=''):
    global fails
    if not ok: fails += 1
    print(('  ok   ' if ok else '  FAIL ') + name + (f'  — {detail}' if detail and not ok else ''))

PATHS = [('', 'text/html'), ('b/', 'text/html'), ('d/', 'text/html'), ('track/', 'text/html'),
         ('robots.txt', 'text/plain'), ('sitemap.xml', 'xml'), ('llms.txt', 'text/plain'), ('llms-full.txt', 'text/plain'), ('site.webmanifest', ''),
         ('assets/og-image.png', 'image/png'), ('assets/temp-report-sample.pdf', 'application/pdf'),
         ('assets/kokzhol-fact-sheet-en.pdf', 'application/pdf'), ('assets/kokzhol-fact-sheet-ru.pdf', 'application/pdf'),
         ('assets/kokzhol-tender-checklist-en.pdf', 'application/pdf'), ('assets/kokzhol-tender-checklist-ru.pdf', 'application/pdf')]
print(base)
for p, ct in PATHS:
    try:
        r = urllib.request.urlopen(urllib.request.Request(base + p, headers={'User-Agent': 'kokzhol-live-check/1'}), timeout=30)
        body = r.read(); got = r.headers.get('Content-Type', '')
        chk(f'200 {p or "/"} ({len(body)} B)', r.status == 200 and ct in got, got)
        if p in ('', 'b/', 'd/'):
            s = body.decode('utf-8', 'replace')
            chk(f'  canonical on {p or "/"}', 'rel="canonical" href="https://kokzhol.kz/"' in s)
            lds = re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S)
            chk(f'  one JSON-LD block on {p or "/"}', len(lds) == 1)
            try:
                g = json.loads(lds[0])['@graph']; faq = [n for n in g if n['@type'] == 'FAQPage'][0]['mainEntity']
                chk(f'  FAQ ≥ 15 on {p or "/"}', len(faq) >= 15, str(len(faq)))
            except Exception as e:
                chk(f'  JSON-LD parses on {p or "/"}', False, str(e))
            chk(f'  no mangled UTF-8 on {p or "/"}', 'Ã' not in s and 'Ð' not in s)
    except Exception as e:
        chk(f'200 {p or "/"}', False, str(e))

if not base.startswith('https://'):
    print('  skip TLS check (plain http)')
else:
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.create_connection((host, 443), timeout=20), server_hostname=host) as sock:
            cert = sock.getpeercert()
        exp = datetime.datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z').replace(tzinfo=datetime.timezone.utc)
        days = (exp - datetime.datetime.now(datetime.timezone.utc)).days
        chk(f'TLS certificate valid >= 21 days ({days} days left, expires {exp.date()})', days >= 21)
    except Exception as e:
        chk('TLS certificate', False, str(e))
print('FAILURES:', fails); sys.exit(1 if fails else 0)
