#!/usr/bin/env python3
"""Generate feature/index.html from the root index.html.

The public site has two equivalent entry points: / and /feature/. The root
page is the authored source; this rewrites its relative paths for /feature/.
Run from the repository root:  python3 tools/sync-feature-alias.py
"""
import pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
source = (root / 'index.html').read_text(encoding='utf-8')

def rewrite(match):
    attr, value = match.group(1), match.group(2)
    if value.startswith(('#', 'http:', 'https:', 'mailto:', 'data:')):
        return match.group(0)
    if value.startswith('feature/'):
        value = value[len('feature/'):]
    else:
        value = '../' + value
    return f'{attr}="{value}"'

alias = re.sub(r'\b(href|src)="([^"]*)"', rewrite, source)
alias = alias.replace('<html lang="en" data-motion="on">', '<html lang="en" data-motion="on">\n<!-- Generated from ../index.html by tools/sync-feature-alias.py. Edit the root page, then re-run. -->', 1)
(root / 'feature' / 'index.html').write_text(alias, encoding='utf-8')
print('feature/index.html written')
