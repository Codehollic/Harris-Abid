#!/usr/bin/env python3
"""Rebuild the portable one-file website from its editable source files."""
import base64
import re
from pathlib import Path
import mimetypes

root = Path(__file__).resolve().parent
html = (root / 'index.html').read_text(encoding='utf-8')
# One embedded copy per image: drop the preload hint and responsive variants.
html = re.sub(r'<link rel="preload" as="image"[^>]*>', '', html)
html = re.sub(r' (srcset|sizes)="[^"]*"', '', html)
html = html.replace(
    '<link rel="stylesheet" href="styles.css"><script src="script.js" defer></script>',
    '<style>' + (root / 'styles.css').read_text(encoding='utf-8') + '</style>'
)
html = html.replace('<script src="swarm.js" defer></script>', '')
html = html.replace('</body>', '<script>' + (root / 'script.js').read_text(encoding='utf-8') + '</script><script>' + (root / 'swarm.js').read_text(encoding='utf-8') + '</script></body>')
for image in sorted((root / 'assets').iterdir()):
    # og-card.jpg is referenced by absolute URL for social previews; leave it as a link.
    if image.is_file() and image.name != 'og-card.jpg' and image.suffix.lower() in {'.png', '.webp', '.jpg', '.jpeg'}:
        mime = mimetypes.guess_type(image.name)[0] or 'application/octet-stream'
        data = 'data:' + mime + ';base64,' + base64.b64encode(image.read_bytes()).decode('ascii')
        html = html.replace('assets/' + image.name, data)
(root / 'standalone.html').write_text(html, encoding='utf-8')
print('Created standalone.html with embedded styling, scripts and images.')
