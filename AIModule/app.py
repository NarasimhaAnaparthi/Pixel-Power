import torch
import whisper
from transformers import pipeline
import json
import googletrans
import spacy
import pytextrank
import moviepy.editor as mp
import re
from google.cloud.storage import blob
import gtts #!pip install gTTs
from google.cloud import storage
from google.oauth2 import service_account
import os
from moviepy.editor import *
from flask import Flask, request, jsonify
 
 
def merge_video_with_audio(video_file_path, audio):
    try:
        # Remove audio from the original video
        video = VideoFileClip(video_file_path)
        video_without_audio = video.without_audio()
        video_without_audio.write_videofile("Video_without_Audio.mp4", codec='libx264')
 
        # Merge the muted video with the provided audio
        muted_video_path = "Video_without_Audio.mp4"
        video_clip = VideoFileClip(muted_video_path)
        audio_clip = AudioFileClip(audio)
        final_clip = video_clip.set_audio(audio_clip)
        final_output_path = 'new.mp4'
        final_clip.write_videofile(final_output_path)
 
        return final_output_path
    except Exception as e:
        print(e)
 
 
def process_video(video_file, translation_language,audio_output_path):
    audio_file = os.path.join(audio_output_path, f"{os.path.splitext(os.path.basename(video_file))[0]}_Audio.mp3")
    my_clip = mp.VideoFileClip(video_file)
    print("Audio_File",audio_file)
    my_clip.audio.write_audiofile(audio_file)
    keywords = []
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    pipe = pipeline(
        "automatic-speech-recognition",
        model="openai/whisper-medium",
        chunk_length_s=30,
        device=device,
        generate_kwargs={"task": "transcribe", "language": "<|en|>"}
    )
    audio = whisper.load_audio(audio_file)
    prediction = pipe(audio.copy(), batch_size=8, return_timestamps=True)["chunks"]
    merged_text_english = ' '.join(entry['text'] for entry in prediction)
    translator = googletrans.Translator()
    translation = translator.translate(merged_text_english, dest=translation_language)
    cleaned_text=re.sub(r'[\x00-\x1F\x7F-\x9F\u2000-\u200F\u2028\u2029]+', '', translation.text, flags=re.UNICODE)
    converted_audio = gtts.gTTS(cleaned_text, lang=translation_language)
    converted_audio.save("Translated_Audio.mp3")
    nlp = spacy.load("/home/venkatakalyan/Pictures/physics_walla/whisper/en_core_web_sm-3.7.1/en_core_web_sm/en_core_web_sm-3.7.1/")
    nlp.add_pipe("textrank")
    doc = nlp(merged_text_english)
    for phrase in doc._.phrases[:8]:
        keywords.append(phrase.text)
    json_result = {}
    json_result = {
    "transcription": [
        {"timestamp": [float(segment['timestamp'][0]), float(segment['timestamp'][1])], "text": segment['text']}
        for segment in prediction
    ],
    "translated_text": cleaned_text,
    "keywords": keywords,
    "translated_video":"https://storage.googleapis.com/encode_project_pixelpower/Output_Video_Folder/Translated_video.mp4"
    }
 
    output_json = json.dumps(json_result, indent=4)
    #upload_to_gcs(output_json,gcs_url,json_file_name)
    return output_json
 
 
 
app = Flask(__name__)
@app.route('/process_video', methods=['POST'])
def process_video_route():
    try:
        data = request.get_json()
 
        video_url = data.get('video_url', "")
        translation_language = data.get('translation_language', "te")
        audio_output_path = ""
 
        result = process_video(video_file=video_url, translation_language=translation_language, audio_output_path=audio_output_path)
        print("result",result)
        # merge_video_with_audio(video_file_path=video_url, audio="Translated_Audio.mp3")
 
        # client = storage.Client(project='engro-poc')
        # bucket_name = 'encode_project_pixelpower'
        # blob_name = 'Output_Video_Folder/new.mp4'
        # bucket = client.get_bucket(bucket_name)
        # blob = bucket.blob(blob_name)
        # blob.upload_from_filename("new.mp4")
 
        return jsonify(result=json.loads(result), message="Processing successful")
 
    except Exception as e:
        return jsonify(error=str(e)), 500
 
if __name__ == '__main__':
    app.run(debug=True)