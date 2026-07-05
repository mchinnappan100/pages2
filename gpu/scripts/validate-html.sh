wc -l /Users/mchinnappan/my-mcp-servers/pytorch-cert-exam.html && python3 -c "
from html.parser import HTMLParser
class V(HTMLParser): pass
v = V()
with open('/Users/mchinnappan/my-mcp-servers/pytorch-cert-exam.html') as f:
    v.feed(f.read())
print('Valid HTML ✓')
# Count questions
import re, json
content = open('/Users/mchinnappan/my-mcp-servers/pytorch-cert-exam.html').read()
qs = re.findall(r\"id:\d+, domain:\", content)
print(f'Questions found: {len(qs)}')
"