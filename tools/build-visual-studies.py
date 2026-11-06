#!/usr/bin/env python3
"""Refresh the isolated study page from the published page; never edits it."""
from pathlib import Path
import json
import re

root = Path(__file__).resolve().parent.parent
lab = root / 'experiments/20261106'
source = (root / 'index.html').read_text()

def rewrite(match):
    attr, value = match.group(1), match.group(2)
    if value.startswith(('#', 'http:', 'https:', 'mailto:', 'data:')):
        return match.group(0)
    return f'{attr}="../../{value}"'

page = re.sub(r'\b(href|src)="([^"]*)"', rewrite, source)
page = page.replace('<title>Crossing Lives — Work in progress</title>', '<title>Crossing Lives — visual experiment, not adopted</title>')
controller = (root / 'feature/edition.js').read_text()
current_version = re.search(r"const V = '([^']+)';", controller).group(1)
versions = dict.fromkeys(['20261105-edition', current_version])
mapping = {'imports': {f'../../feature/{name}.js?v={version}': f'./{name}.js'
                       for version in versions for name in ['photo-type', 'miniature']}}
head = '<meta name="robots" content="noindex,nofollow">\n'
head += '<link rel="stylesheet" href="study.css">\n'
head += '<script type="importmap">' + json.dumps(mapping) + '</script>\n'
head += '<script src="study-bridge.js" defer></script>\n'
page = page.replace('</head>', head + '</head>')

guide = '''
    <details class="guide-story" id="guide-story">
      <summary><span>What changed for her?</span><span aria-hidden="true">＋</span></summary>
      <div class="guide-story-body">
        <p class="guide-story-source">The guide’s account · paraphrased</p>
        <ol class="guide-story-parts">
          <li><span data-facet-glyph="work"></span><div><h3>Work she wanted</h3><p>Guiding was a long-held ambition; earlier career expectations had led her to other work.</p></div></li>
          <li><span data-facet-glyph="home"></span><div><h3>Room to change</h3><p>She prepared financially for a different balance of costs, income and work.</p></div></li>
          <li><span data-facet-glyph="ties"></span><div><h3>A useful lead</h3><p>Friends told her about an opportunity to qualify as a guide.</p></div></li>
        </ol>
        <p class="guide-story-link"><button type="button" class="pw side-hk" data-place="hk-family">Family visits to Hong Kong continued ↗</button></p>
      </div>
    </details>
'''
start = page.index('<article class="step" data-scene="guide"')
end = page.index('</article>', start)
page = page[:end] + guide + page[end:]
page = '\n'.join(line.rstrip() for line in page.splitlines()) + '\n'
(lab / 'study.html').write_text('<!-- Generated from the reviewed page by tools/build-visual-studies.py. Isolated comparison only. -->\n' + page)
print('experiments/20261106/study.html written; production page untouched')
