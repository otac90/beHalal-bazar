import json
import re

with open('en_translations.txt', 'r') as f:
    en_content = f.read()

# We will just parse the keys from en_content
keys = re.findall(r'^\s*([a-zA-Z0-9_]+):\s*(.*?),?$', en_content, re.MULTILINE)

en_dict = {}
for k, v in keys:
    # strip quotes
    val = v.strip().strip("'").strip('"')
    en_dict[k] = val

with open('keys.json', 'w') as f:
    json.dump(en_dict, f, indent=2)
