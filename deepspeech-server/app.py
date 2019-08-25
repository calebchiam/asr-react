#!venv/bin/py
"""
Partly adapted from:
https://github.com/mozilla/DeepSpeech/blob/b420992b00a87fb2d9739d31822e0c1a14fc15d0/native_client/python/client.py
"""

import os
from flask import Flask, jsonify, make_response, request, send_file, redirect, url_for, flash
import json
from werkzeug.utils import secure_filename
import subprocess
from flask_cors import CORS
import sys
from timeit import default_timer as timer
import wave
import numpy as np
from deepspeech import Model

ds = None
FFMPEG_exe = "ffmpeg" # os.path.join(os.getcwd(), "ffmpeg-20190528-eae251e-win64-static", "bin", "ffmpeg.exe")
#"ffmpeg-20190528-eae251e-win64-static\\bin\\ffmpeg.exe"#"ffmpeg"

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'

app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), UPLOAD_FOLDER)
app.config['PROCESSED_FOLDER'] = os.path.join(os.getcwd(), PROCESSED_FOLDER)

pb_file = "./models/output_graph.pb"
alphabet_file = "./models/alphabet.txt"
lm_file = "./models/lm.binary"
trie_file = "./models/trie"

SAMPLE_RATE = 16000
N_FEATURES = 26
N_CONTEXT = 9
BEAM_WIDTH = 500
LM_ALPHA = 0.75
LM_BETA = 1.85

for folder in [app.config['UPLOAD_FOLDER'], app.config['PROCESSED_FOLDER']]:
    os.makedirs(folder, exist_ok=True)

with open("formats.json", 'r') as f:
    VALID_EXTS = set(json.load(f)['valid'])

# ffmpeg -i be_yourself.mp3 -acodec pcm_s16le -ac 1 -ar 16000 beyou.wav
# http://localhost:5000/convert_audio?input=wavs/be_yourself.mp3

def system_call(command):
    p = subprocess.Popen(command, stdout=subprocess.PIPE, shell=True)
    return p.stdout.read().decode()

def error_json(error_msg):
    return jsonify({"text": error_msg})

def validate_file(input, VALID_EXTS):
    ext = input.split(".")[-1]
    if "." not in input or ext.lower() not in VALID_EXTS:
        return error_json("Invalid audio filetype. Filetype must be one of: {}".format(VALID_EXTS))
    elif not os.path.isfile(input):
        return error_json("Could not find specified file: {}".format(input))
    return True

def generate_convert_command(input, output):
    return "{} -i {} -acodec pcm_s16le -ac 1 -ar 16000 {}".format(FFMPEG_exe, input, output)

@app.route('/', methods=['GET', 'POST'])
def home():
    return redirect('/convert_and_parse')

@app.route('/convert_and_parse', methods=['GET', 'POST'])
def convert_and_parse_audio():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)

        if file and validate_file(file.filename, VALID_EXTS):
            filename = secure_filename(file.filename)
            save_loc = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            if os.path.isfile(save_loc):
                os.remove(save_loc)
            file.save(save_loc)

            output = os.path.join(app.config['PROCESSED_FOLDER'], filename.split(".")[0] + "_processed.wav")

            if os.path.isfile(output):
                print("Deleting previous file")
                os.remove(output)

            print("Saving file at: {}".format(save_loc))
            print("Outputting processed file at: {}".format(output))

            c = generate_convert_command(save_loc, output)
            print(c)
            out = system_call(c)
            print(out)
            # system_call(generate_convert_command(save_loc, output))
            if not os.path.isfile(output):
                return error_json("Audio file conversion failed.")

            fin = wave.open(output, 'rb')
            fs = fin.getframerate()
            assert fs == SAMPLE_RATE
            audio = np.frombuffer(fin.readframes(fin.getnframes()), np.int16)
            audio_length = fin.getnframes() * (1/SAMPLE_RATE)
            fin.close()

            out = run_inference(ds, audio, fs, audio_length)

            return jsonify({"text": out.strip("\n")})

    return '''
    <!doctype html>
    <title>Automatic Speech Recognition</title>
    <h1>Upload audio file for speech-to-text transcription</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''

@app.errorhandler(404)
def not_found(error):
    return make_response(error_json("Not found"), 404)

def load_model_with_pb_alphabet(pb_file, alphabet_file):
    model_load_start = timer()
    ds = Model(pb_file, N_FEATURES, N_CONTEXT, alphabet_file, BEAM_WIDTH)
    model_load_end = timer() - model_load_start
    print('Loaded model in {:.3}s.'.format(model_load_end), file=sys.stderr)
    return ds

def load_language_model(model, alphabet_file, lm_file, trie_file):
    print('Loading language model from files {} {}'.format(lm_file, trie_file), file=sys.stderr)
    lm_load_start = timer()
    model.enableDecoderWithLM(alphabet_file, lm_file, trie_file, LM_ALPHA,LM_BETA)
    lm_load_end = timer() - lm_load_start
    print('Loaded language model in {:.3}s.'.format(lm_load_end), file=sys.stderr)
    return model

def run_inference(model, audio, fs, audio_length):
    print('Running inference.', file=sys.stderr)
    inference_start = timer()
    output = ds.stt(audio, fs)
    print(output)
    inference_end = timer() - inference_start
    print('Inference took %0.3fs for %0.3fs audio file.' % (inference_end, audio_length), file=sys.stderr)
    return output

if __name__ == '__main__':
    ds = load_model_with_pb_alphabet(pb_file, alphabet_file)
    ds = load_language_model(ds, alphabet_file, lm_file, trie_file)

    app.run()
