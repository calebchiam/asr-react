import json

ext_to_mimetype = {}

with open("formats.json", 'r') as f:
    VALID_EXTS = set(json.load(f)['valid'])

with open("mimetypes.csv", 'r') as f:
    for line in f:
        ext, mimetype = line.strip(".").split(",")
        if ext in VALID_EXTS:
            ext_to_mimetype[ext] = mimetype.strip("\n")

with open("ext_to_mimetype.json", 'w') as f:
    json.dump(ext_to_mimetype, f)
