# Convert a full single-file HTML document into Artifact page content (no doctype/html/head/body tags).
import re, sys
src, out, title = sys.argv[1], sys.argv[2], sys.argv[3]
h = open(src, encoding='utf-8').read()
head = re.search(r'<head[^>]*>(.*?)</head>', h, re.S | re.I)
body = re.search(r'<body([^>]*)>(.*)</body>', h, re.S | re.I)
hd = head.group(1) if head else ''
hd = re.sub(r'<meta[^>]*(charset|name="viewport")[^>]*>\s*', '', hd, flags=re.I)
hd = re.sub(r'<title>.*?</title>\s*', '', hd, flags=re.S | re.I)
attrs = body.group(1).strip() if body else ''
inner = body.group(2) if body else h
fix = f'<script>document.body.setAttribute("data-x","1");{"".join(f"document.body.setAttribute({a!r},{v!r});" for a, v in re.findall(r"([\w-]+)=\"([^\"]*)\"", attrs))}</script>\n' if attrs else ''
# module scripts in the head are deferred, so keeping them before the body content is safe
open(out, 'w', encoding='utf-8').write(f'<title>{title}</title>\n{hd.strip()}\n{fix}{inner.strip()}\n')
print(out, round(len(open(out).read()) / 1e6, 2), 'MB', 'body attrs:', attrs or 'none')
