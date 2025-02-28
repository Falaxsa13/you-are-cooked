from fastapi import FastAPI, File, UploadFile
import openai
import os

app = FastAPI()

openai.api_key = "your_openai_api_key"


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    file_path = f"temp/{file.filename}"

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    # Use Whisper API for transcription
    audio_file = open(file_path, "rb")
    transcript = openai.Audio.transcribe("whisper-1", audio_file)

    return {"transcription": transcript["text"]}
