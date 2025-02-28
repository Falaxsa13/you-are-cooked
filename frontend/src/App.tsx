import { useState, useRef } from "react";

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcribedText, setTranscribedText] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      // Use the recorder's actual MIME type for the blob
      const mimeType = mediaRecorder.mimeType;
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      setAudioBlob(audioBlob);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUpload = async () => {
    if (!audioBlob) return alert("No audio recorded!");

    const formData = new FormData();
    // Choose an appropriate extension based on the MIME type
    const extension = audioBlob.type.includes("webm") ? "webm" : "wav";
    formData.append("file", audioBlob, `recording.${extension}`);

    try {
      const response = await fetch("http://localhost:5000/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setTranscribedText(data.transcription);
    } catch (error) {
      console.error("Error transcribing audio:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Voice Recorder</h1>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      {audioBlob && (
        <div>
          <audio controls src={URL.createObjectURL(audioBlob)}></audio>
          <button onClick={handleUpload}>Transcribe</button>
        </div>
      )}
      {transcribedText && (
        <p>
          <strong>Transcription:</strong> {transcribedText}
        </p>
      )}
    </div>
  );
}
