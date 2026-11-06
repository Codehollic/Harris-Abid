#!/usr/bin/env python3
"""Rebuild the portable one-file website from its editable source files."""
import base64
from pathlib import Path
import mimetypes

root = Path(__file__).resolve().parent
html = (root / 'index.html').read_text(encoding='utf-8')
html = html.replace(
    '<link rel="stylesheet" href="styles.css"><script src="script.js" defer></script>',
    '<style>' + (root / 'styles.css').read_text(encoding='utf-8') + '</style>'
)
html = html.replace('<script src="swarm.js" defer></script>', '')
html = html.replace('</body>', '<script>' + (root / 'script.js').read_text(encoding='utf-8') + '</script><script>' + (root / 'swarm.js').read_text(encoding='utf-8') + '</script></body>')
for image in sorted((root / 'assets').iterdir()):
    if image.is_file() and image.suffix.lower() in {'.png', '.webp', '.jpg', '.jpeg'}:
        mime = mimetypes.guess_type(image.name)[0] or 'application/octet-stream'
        data = 'data:' + mime + ';base64,' + base64.b64encode(image.read_bytes()).decode('ascii')
        html = html.replace('assets/' + image.name, data)
(root / 'standalone.html').write_text(html, encoding='utf-8')
print('Created standalone.html with embedded styling, scripts and images.')
