"""Plain-text copy of the mocks, for reading, searching, diffing, or handing to an LLM.

Usage: python3 extract.py [page.html ...]   (default: index.html → mocks.md)

Keeps section titles, captions, and on-screen text in reading order. Drawings become
[drawing: label] with their text labels; buttons are [bracketed]; empty bars show their fill.
The mocks are the design; this output is disposable.
"""
import re, sys
from html.parser import HTMLParser
from pathlib import Path

BLOCK = {'div', 'p', 'li', 'ul', 'ol', 'section', 'main', 'figure', 'figcaption', 'h1', 'h2', 'h3', 'h4', 'header', 'footer', 'table', 'tr'}
SKIP = {'head', 'style', 'script', 'nav'}
HEADING = {'h1': '# ', 'h2': '## ', 'h3': '### ', 'figcaption': '#### '}

class Mocks(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.line, self.skip, self.svg, self.prefix = [], [], 0, None, ''

    def flush(self):
        text = ''
        for chunk in self.line:
            chunk = chunk.strip()
            if not chunk:
                continue
            glue = '' if not text or text.endswith(('[', '(')) or chunk.startswith((']', ')', ',', '.', ':', ';', '%')) else ' ' if text.endswith((':', '·', '=')) or chunk.startswith('·') else ' · '
            text += glue + chunk
        if text:
            self.out.append(self.prefix + text)
        self.line, self.prefix = [], ''

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if self.skip or tag in SKIP:
            self.skip += tag in SKIP
            return
        if self.svg is not None:
            return
        if tag == 'svg':
            self.svg = {'label': a.get('aria-label'), 'texts': [], 'in_text': False}
            return
        if tag in BLOCK:
            self.flush()
            if tag in HEADING:
                self.out.append('')
                self.prefix = HEADING[tag]
            if tag == 'section' and 'appendix' in (a.get('class') or ''):
                self.out += ['', '---', '', '_Appendix: working-session mocks, not the current design._']
        width = re.search(r'width:\s*([\d.]+%)', a.get('style') or '')
        if tag in ('s', 'b', 'i') and width:
            self.line.append(f'[{width.group(1)}]')
        if tag == 'button':
            on = 'on' in (a.get('class') or '').split() or a.get('aria-selected') == 'true' or a.get('aria-current') == 'true'
            self.line.append('[' + ('selected: ' if on else ''))
            if a.get('aria-label'):
                self.line.append(a['aria-label'])
        if tag == 'br':
            self.line.append(' ')

    def handle_endtag(self, tag):
        if self.skip:
            self.skip -= tag in SKIP
            return
        if self.svg is not None:
            if tag == 'svg':
                s, self.svg = self.svg, None
                labels = list(dict.fromkeys(t for t in s['texts'] if t))
                if s['label'] or labels:
                    note = '[drawing' + (f": {s['label']}" if s['label'] else '') + (f"; labels: {', '.join(labels[:40])}" + (' …' if len(labels) > 40 else '') if labels else '') + ']'
                    self.line.append(note)
            elif tag == 'text':
                self.svg['in_text'] = False
            return
        if tag == 'button':
            self.line.append(']')
        if tag in BLOCK:
            self.flush()

    def handle_data(self, data):
        if self.skip:
            return
        data = re.sub(r'\s+', ' ', data)
        if self.svg is not None:
            if data.strip():
                self.svg['texts'].append(data.strip())
            return
        self.line.append(data)

def top_items(line):
    """Split a line into its top-level bracketed items, or None if it is not only items."""
    items, depth, start = [], 0, None
    for i, c in enumerate(line):
        if c == '[':
            start = i if depth == 0 else start
            depth += 1
        elif c == ']':
            depth -= 1
            if depth == 0:
                items.append(line[start + 1:i])
        elif depth == 0 and c not in ' ·':
            return None
    return items if depth == 0 else None

def list_rows(text):
    """A long run of buttons is a list of rows: one per line."""
    out = []
    for line in text.split('\n'):
        items = top_items(line) if len(line) > 120 else None
        out += ['- ' + i for i in items] if items and len(items) > 1 else [line]
    return '\n'.join(out)

def extract(html):
    p = Mocks()
    p.feed(html)
    p.flush()
    text = '\n'.join(p.out)
    text = re.sub(r'\[\s*(selected: )?\s*\]', '', text)          # empty buttons
    text = re.sub(r'^ · ', '', text, flags=re.M)
    text = list_rows(re.sub(r'\n{3,}', '\n\n', text).strip())
    return text + '\n'

def main(pages):
    here = Path(__file__).resolve().parent
    for page in pages or [here / 'index.html']:
        page = Path(page)
        title = re.search(r'<title>(.*?)</title>', page.read_text(), re.S)
        out = page.with_name('mocks.md' if page.name == 'index.html' else page.stem + '.md')
        header = (f"<!-- Generated from {page.name} by extract.py. Edit the mocks, not this file. -->\n\n"
                  f"# {title.group(1).strip() if title else page.stem}\n\n")
        out.write_text(header + extract(page.read_text()))
        print(f'{out.name} · {out.stat().st_size / 1024:.0f} KB')

if __name__ == '__main__':
    main(sys.argv[1:])
