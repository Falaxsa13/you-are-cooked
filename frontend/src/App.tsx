import { useState } from "react";

export default function App() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [transcribedText, setTranscribedText] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please upload an audio file!");

    const formData = new FormData();
    formData.append("file", file);

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
      <h1>Cooked Generator</h1>
      <input
        type="text"
        value={text}
        onChange={handleTextChange}
        placeholder="Enter text"
      />
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload & Transcribe</button>
      {transcribedText && (
        <p>
          <strong>Transcription:</strong> {transcribedText}
        </p>
      )}
    </div>
  );
}
