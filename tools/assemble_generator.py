# Assemble generator/index.html from the source page and its data (types.json, decks2.json).
import sys
R = sys.argv[1]
src = open(R + '/generator/src/generator-src.html').read()
t = open(R + '/generator/src/types.json').read().replace('</', '<\\/')
d = open(R + '/generator/src/decks2.json').read().replace('</', '<\\/')
out = src.replace('__TYPES_JSON__', t).replace('__DECKS_JSON__', d)
head = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n'
open(R + '/generator/index.html', 'w').write(head + out + '\n</body>\n</html>\n')
open(sys.argv[2], 'w').write(out)
print('assembled', len(out) // 1024, 'KB')
