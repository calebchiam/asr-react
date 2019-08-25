import json

with open("formats.txt", 'r') as f:
    formats = {"valid": []}
    for line in f:
        args = [x for x in line.split(" ") if x.strip() != ""]
        formats["valid"].append(args[1])
    with open("formats.json", 'w') as g:
        json.dump(formats, g)
