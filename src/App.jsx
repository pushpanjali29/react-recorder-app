// import { useState } from 'react'
// import { ReactMediaRecorder, useReactMediaRecorder } from 'react-media-recorder'

// function App() {
// const {status, startRecording,stopRecording, mediaBlobUrl} = useReactMediaRecorder({video:true})
//   return (
//         <div>
//           <p>{status}</p>
//           <button onClick={startRecording}>Start Recording</button>
//           <button onClick={stopRecording}>Stop Recording</button>
//           <video src={mediaBlobUrl} controls autoPlay loop />
//         </div>
//   )
// }

// export default App
import React, { useState, useRef } from 'react';

const Recorder = () => {
  const [mode, setMode] = useState('video'); // 'audio' or 'video'
  const [recording, setRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordedURL, setRecordedURL] = useState(null);

  const videoRef = useRef(null);

  const handleModeChange = (e) => {
    setMode(e.target.value);
    cleanup(); // clear previous recordings when switching mode
  };

  const startStream = async () => {
    try {
      const constraints = mode === 'audio' ? { audio: true } : { audio: true, video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);

      if (videoRef.current && mode === 'video') {
        videoRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setRecordedChunks([]);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: mode === 'audio' ? 'audio/webm' : 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedURL(url);
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Error starting media stream:', err);
    }
  };

  const stopStream = () => {
    mediaRecorder.stop();
    mediaStream.getTracks().forEach((track) => track.stop());
    setRecording(false);
  };

  const cleanup = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    setMediaStream(null);
    setRecordedChunks([]);
    setRecordedURL(null);
    setRecording(false);
  };

  const downloadRecording = () => {
    if (!recordedURL) return;
    const a = document.createElement('a');
    a.href = recordedURL;
    a.download = mode === 'audio' ? 'audio-recording.webm' : 'video-recording.webm';
    a.click();
    URL.revokeObjectURL(recordedURL);
  };

  return (
    <div>
      <h2>Recorder Application</h2>

      <div>
        <label>Select Mode: </label>
        <select value={mode} onChange={handleModeChange} disabled={recording}>
          <option value="audio">Audio</option>
          <option value="video">Video</option>
        </select>
      </div>

      {mode === 'video' && <video ref={videoRef} autoPlay muted width="480" height="360" />}

      <div style={{ margin: '10px 0' }}>
        {!recording && <button onClick={startStream}>Start Recording</button>}
        {recording && <button onClick={stopStream}>Stop Recording</button>}
      </div>

      {recordedURL && (
        <div>
          <h3>Preview:</h3>
          {mode === 'audio' ? (
            <audio src={recordedURL} controls />
          ) : (
            <video src={recordedURL} controls width="480" />
          )}
          <br />
          <button onClick={downloadRecording}>Download</button>
        </div>
      )}
    </div>
  );
};

export default Recorder;
