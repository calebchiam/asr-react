import json
import os
import requests

url = "http://127.0.0.1:5000/convert_and_parse"

with open("ext_to_mimetype.json", 'r') as f:
    ext_to_mimetype = json.load(f)


def send_request(input_audio):
    payload = {}
    ext = input_audio.split(".")[-1]
    files = {
     'file': (os.path.basename(input_audio),
              open(input_audio, 'rb'),
              ext_to_mimetype[ext])
    }
    r = requests.post(url, files=files)
    return r.json()

if __name__ == "__main__":
    response_json = send_request("wavs/be_yourself.mp3")
    print(response_json)
