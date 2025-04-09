import { useEffect } from 'react';
import * as mpFaceMesh from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

const useEmotionDetection = (videoRef, canvasRef, emotionDisplayRef, isRunning) => {
  useEffect(() => {
    if (!isRunning || !videoRef.current || !canvasRef.current) return;

    const faceMesh = new mpFaceMesh.FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(async (results) => {
      const canvasCtx = canvasRef.current.getContext('2d');
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        console.log("Raw Landmarks in Hook:", landmarks); // <----- ADD THIS LINE
        const flatLandmarks = landmarks.flatMap(pt => [pt.x, pt.y, pt.z]);
        console.log("Flat Landmarks Sent:", flatLandmarks); // <----- ADD THIS LINE
        console.log("Length of Flat Landmarks:", flatLandmarks.length); // <----- ADD THIS LINE

        try {
          const response = await fetch('http://localhost:5000/detect_emotion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ landmarks: flatLandmarks }),
          });

          const data = await response.json();
          emotionDisplayRef.current.innerText = `Emotion: ${data.emotion || 'N/A'}`;
        } catch (error) {
          console.error('Emotion detection failed:', error);
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
  }, [isRunning, videoRef, canvasRef, emotionDisplayRef]);
};

export default useEmotionDetection;