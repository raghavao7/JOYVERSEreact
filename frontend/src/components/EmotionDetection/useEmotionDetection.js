import { useEffect } from 'react';
import * as mpFaceMesh from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

const useEmotionDetection = (videoRef, canvasRef, emotionDisplayRef, isRunning, setEmotion) => {
  useEffect(() => {
    if (!isRunning || !videoRef.current || !canvasRef.current) return;

    const faceMesh = new mpFaceMesh.FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: false, // Changed to false to get 468 landmarks
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(async (results) => {
      const canvasCtx = canvasRef.current.getContext('2d');
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        const flatLandmarks = landmarks.flatMap(pt => [pt.x, pt.y, pt.z]);
        console.log(`Sending landmarks length: ${flatLandmarks.length}`); // Debug log

        try {
          const response = await fetch('http://localhost:5000/detect_emotion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ landmarks: flatLandmarks }),
          });

          const data = await response.json();
          if (data.emotion) {
            emotionDisplayRef.current.innerText = `Emotion: ${data.emotion}`;
            setEmotion(data.emotion);
          } else {
            emotionDisplayRef.current.innerText = `Emotion: ${data.error || 'N/A'}`;
            setEmotion(null);
            console.error('Server response:', data); // Log error details
          }
        } catch (error) {
          console.error('Emotion detection failed:', error);
          emotionDisplayRef.current.innerText = 'Emotion: Error';
          setEmotion(null);
        }
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await faceMesh.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();

    return () => {
      camera.stop();
    };
  }, [isRunning, videoRef, canvasRef, emotionDisplayRef, setEmotion]);
};

export default useEmotionDetection;