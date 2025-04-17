import React, { useState, useEffect, useRef } from 'react';
import './../styles/game.css';
import videoFile from '../assets/video.mp4';
import dogImage from '../assets/dog.png';
import catImage from '../assets/cat.png';
import tigerImage from '../assets/tiger.png';
import zebraImage from '../assets/zebra.png';
import monkeyImage from '../assets/monkey.png';
import horseImage from '../assets/horse.png';
import useEmotionDetection from './EmotionDetection/useEmotionDetection';

const Game = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [letters, setLetters] = useState([]);
  const [dropZones, setDropZones] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [emotion, setEmotion] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const emotionDisplayRef = useRef(null);

  useEmotionDetection(videoRef, canvasRef, emotionDisplayRef, gameStarted, setEmotion);

  const words = [
    { correct: 'dog', jumbled: 'gdo', image: dogImage },
    { correct: 'cat', jumbled: 'tac', image: catImage },
    { correct: 'tiger', jumbled: 'ietgr', image: tigerImage },
    { correct: 'zebra', jumbled: 'abezr', image: zebraImage },
    { correct: 'monkey', jumbled: 'mkyoen', image: monkeyImage },
    { correct: 'horse', jumbled: 'soehr', image: horseImage },
  ];

  // Emotion to background color mapping (dyslexia-friendly)
  const emotionColors = {
    happy: 'rgba(255, 215, 0, 0.5)',    // Gold, semi-transparent
    sad: 'rgba(135, 206, 235, 0.5)',   // Sky Blue
    angry: 'rgba(255, 69, 0, 0.5)',     // Orange Red
    surprise: 'rgba(152, 251, 152, 0.5)', // Pale Green
    fear: 'rgba(221, 160, 221, 0.5)',   // Plum
    disgust: 'rgba(176, 196, 222, 0.5)', // Light Steel Blue
    neutral: 'rgba(245, 245, 245, 0.5)', // Whitesmoke
  };

  useEffect(() => {
    setShuffledWords([...words].sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    if (shuffledWords.length > 0) {
      const word = shuffledWords[wordIndex];
      setCurrentWord(word);
      setLetters(word.jumbled.split(''));
      setDropZones(Array(word.correct.length).fill(null));
    }
  }, [wordIndex, shuffledWords]);

  const handleDragStart = (e, letter) => {
    e.dataTransfer.setData('text/plain', letter);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const letter = e.dataTransfer.getData('text/plain');
    const newDropZones = [...dropZones];
    newDropZones[index] = letter;
    setDropZones(newDropZones);

    if (newDropZones.every((zone) => zone !== null)) {
      const arrangedWord = newDropZones.join('');
      if (arrangedWord === currentWord.correct) {
        setFeedback('Correct!');
        const newScore = score + 1;
        setScore(newScore);

        if (newScore >= words.length) {
          setGameCompleted(true);
        } else {
          setTimeout(() => {
            setWordIndex((prevIndex) => prevIndex + 1);
            setFeedback(null);
          }, 1000);
        }
      } else {
        setFeedback('Try Again!');
        setTimeout(() => {
          setDropZones(Array(currentWord.correct.length).fill(null));
          setFeedback(null);
        }, 1000);
      }
    }
  };

  return (
    <div className="game-container">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="background-video">
        <source src={videoFile} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Emotion Overlay */}
      {emotion && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: emotionColors[emotion.toLowerCase()],
            zIndex: 0, // Above video, below content
            transition: 'background-color 0.5s ease',
          }}
        />
      )}

      {/* Hidden Webcam Feed */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        autoPlay
        playsInline
        muted
        width="640"
        height="480"
      />

      {/* Face Detection Canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        width="640"
        height="480"
      />

      {/* Emotion Display */}
      <div
        ref={emotionDisplayRef}
        style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', zIndex: 2 }}
      />

      {/* Game Content */}
      <div className="content">
        {!gameStarted ? (
          <>
            <h1>Welcome to the Game</h1>
            <button onClick={() => setGameStarted(true)} className="start-button">
              Start Game
            </button>
          </>
        ) : !gameCompleted ? (
          <div className="game-content">
            <h1>What is this animal?</h1>
            <div className="animal-container">
              {currentWord && <img src={currentWord.image} alt="Animal" className="animal-image" />}
            </div>

            <div className="letters-container">
              {letters.map((letter, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, letter)}
                  className="draggable-letter"
                >
                  {letter}
                </div>
              ))}
            </div>

            <div className="dropzones-container">
              {dropZones.map((zone, index) => (
                <div
                  key={index}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`dropzone ${zone ? 'filled' : ''}`}
                >
                  {zone || '_'}
                </div>
              ))}
            </div>

            {feedback && (
              <p className={`feedback ${feedback === 'Correct!' ? 'correct' : 'wrong'}`}>
                {feedback}
              </p>
            )}
            <p className="score">Score: {score}</p>
          </div>
        ) : (
          <div className="game-content">
            <h2>Congratulations! You Won!</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;








// import React, { useState, useEffect, useRef } from "react";
// import "./../styles/game.css";
// import videoFile from "../assets/video.mp4";
// import dogImage from "../assets/dog.png";
// import catImage from "../assets/cat.png";
// import tigerImage from "../assets/tiger.png";
// import zebraImage from "../assets/zebra.png";
// import monkeyImage from "../assets/monkey.png";
// import horseImage from "../assets/horse.png";
// import useClipEmotionDetection from "./EmotionDetection/clipEmotionDetection";

// const Game = () => {
//   const [gameStarted, setGameStarted] = useState(false);
//   const [gameCompleted, setGameCompleted] = useState(false);
//   const [wordIndex, setWordIndex] = useState(0);
//   const [shuffledWords, setShuffledWords] = useState([]);
//   const [currentWord, setCurrentWord] = useState(null);
//   const [letters, setLetters] = useState([]);
//   const [dropZones, setDropZones] = useState([]);
//   const [score, setScore] = useState(0);
//   const [feedback, setFeedback] = useState(null);
//   const [gameState, setGameState] = useState("neutral,question1");
//   const [emotionAnalysisActive, setEmotionAnalysisActive] = useState(false);
//   const [lastAnalysisTime, setLastAnalysisTime] = useState(0);
//   const [backgroundPattern, setBackgroundPattern] = useState(null);

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const emotionDisplayRef = useRef(null);

//   const { emotion, emotionProbs, action, loading, analyzeEmotion } = useClipEmotionDetection(
//     videoRef,
//     gameState
//   );

//   // Track game state for the model
//   useEffect(() => {
//     if (feedback) {
//       const newGameState = `${emotion || "neutral"},${feedback === "Correct!" ? "correct" : "wrong"},word${wordIndex}`;
//       setGameState(newGameState);
//     }
//   }, [feedback, emotion, wordIndex]);

//   // Periodic emotion analysis
//   useEffect(() => {
//     if (!gameStarted || gameCompleted || loading) return;

//     const emotionAnalysisInterval = setInterval(() => {
//       const currentTime = Date.now();
//       // Only trigger analysis if at least 5 seconds have passed since the last one
//       if (currentTime - lastAnalysisTime >= 5000) {
//         console.log("Triggering periodic emotion analysis");
//         analyzeEmotion();
//         setLastAnalysisTime(currentTime);
//       }
//     }, 1000); // Check every second, but only analyze if 5 seconds have passed

//     return () => clearInterval(emotionAnalysisInterval);
//   }, [gameStarted, gameCompleted, loading, analyzeEmotion, lastAnalysisTime]);

//   // Analyze emotion when game state changes
//   useEffect(() => {
//     if (gameStarted && !gameCompleted && !loading) {
//       const currentTime = Date.now();
//       if (currentTime - lastAnalysisTime >= 3000) { // At least 3s between analyses
//         console.log("Analyzing emotion after game state change", gameState);
//         analyzeEmotion();
//         setLastAnalysisTime(currentTime);
//       }
//     }
//   }, [gameState, gameStarted, gameCompleted]);

//   // Analyze emotion when current word changes
//   useEffect(() => {
//     if (currentWord && gameStarted && !loading && !gameCompleted) {
//       console.log(`Analyzing emotion for new word: ${currentWord.correct}`);
//       const currentTime = Date.now();
//       if (currentTime - lastAnalysisTime >= 2000) { // Only if 2s elapsed since last analysis
//         analyzeEmotion();
//         setLastAnalysisTime(currentTime);
//       }
//     }
//   }, [currentWord, gameStarted, loading, gameCompleted, analyzeEmotion, lastAnalysisTime]);

//   // Apply game difficulty adjustments based on AI action
//   useEffect(() => {
//     if (!action) return;
    
//     console.log("AI suggested action:", action);
    
//     // Implement difficulty adjustment based on action
//     if (action === "Reduce Difficulty") {
//       // Example: Show a hint
//       if (dropZones.some(zone => zone === null)) {
//         const correctWord = currentWord.correct;
//         const currentGuess = dropZones.map(z => z || '_').join('');
//         console.log("Reducing difficulty - showing hint");
//         // Find first empty position and fill it with correct letter
//         const firstEmptyIdx = dropZones.findIndex(z => z === null);
//         if (firstEmptyIdx >= 0) {
//           const newDropZones = [...dropZones];
//           newDropZones[firstEmptyIdx] = correctWord[firstEmptyIdx];
//           setDropZones(newDropZones);
//         }
//       }
//     } else if (action === "Increase Difficulty") {
//       // Example: Could add a time limit or other challenge
//       console.log("Increasing difficulty - no implementation yet");
//     }
    
//   }, [action, currentWord, dropZones]);

//   // Update background pattern when emotion changes
//   useEffect(() => {
//     if (emotion) {
//       // Set the pattern based on emotion
//       const pattern = emotionPatterns[emotion.toLowerCase()];
//       setBackgroundPattern(pattern);
      
//       console.log(`Emotion changed to: ${emotion} - updating background`);
//     }
//   }, [emotion]);

//   const words = [
//     { correct: "dog", jumbled: "gdo", image: dogImage },
//     { correct: "cat", jumbled: "tac", image: catImage },
//     { correct: "tiger", jumbled: "ietgr", image: tigerImage },
//     { correct: "zebra", jumbled: "abezr", image: zebraImage },
//     { correct: "monkey", jumbled: "mkyoen", image: monkeyImage },
//     { correct: "horse", jumbled: "soehr", image: horseImage },
//   ];

//   // Enhanced emotion colors for better visual feedback
//   const emotionColors = {
//     happy: "rgba(255, 215, 0, 0.6)",       // Brighter gold
//     sad: "rgba(100, 149, 237, 0.6)",       // Cornflower blue
//     angry: "rgba(255, 69, 0, 0.7)",        // Stronger orange red
//     surprised: "rgba(50, 205, 50, 0.6)",   // Brighter green
//     fear: "rgba(186, 85, 211, 0.6)",       // Medium orchid
//     disgust: "rgba(106, 90, 205, 0.6)",    // Slate blue
//     neutral: "rgba(245, 245, 245, 0.2)",   // Light whitesmoke
//     confused: "rgba(221, 160, 221, 0.7)",  // Brighter plum
//     bored: "rgba(119, 136, 153, 0.6)",     // Light slate gray
//   };

//   // Background patterns based on emotion
//   const emotionPatterns = {
//     happy: "/assets/trail1.png",
//     sad: "/assets/dashboardbg1.png",
//     angry: "/assets/background-pattern.png",
//     surprised: "/assets/trail2.png",
//     neutral: null, // No pattern for neutral
//     confused: "/assets/background-pattern.png",
//     bored: null,   // No pattern for bored
//   };

//   useEffect(() => {
//     setShuffledWords([...words].sort(() => Math.random() - 0.5));
//   }, []);

//   useEffect(() => {
//     if (shuffledWords.length > 0) {
//       const word = shuffledWords[wordIndex];
//       setCurrentWord(word);
//       setLetters(word.jumbled.split(""));
//       setDropZones(Array(word.correct.length).fill(null));
//     }
//   }, [wordIndex, shuffledWords]);

//   const handleDragStart = (e, letter) => {
//     e.dataTransfer.setData("text/plain", letter);
//   };

//   const handleDragOver = (e) => e.preventDefault();
          
//   const handleDrop = (e, index) => {
//     e.preventDefault();
//     const letter = e.dataTransfer.getData("text/plain");
//     const newDropZones = [...dropZones];
//     newDropZones[index] = letter;
//     setDropZones(newDropZones);

//     if (newDropZones.every((zone) => zone !== null)) {
//       const arrangedWord = newDropZones.join("");
//       if (arrangedWord === currentWord.correct) {
//         setFeedback("Correct!");
//         const newScore = score + 1;
//         setScore(newScore);

//         // Trigger emotion analysis on correct answer
//         if (!loading) {
//           analyzeEmotion();
//           setLastAnalysisTime(Date.now());
//         }

//         if (newScore >= words.length) {
//           setGameCompleted(true);
//         } else {
//           setTimeout(() => {
//             setWordIndex((prevIndex) => prevIndex + 1);
//             setFeedback(null);
//           }, 1000);
//         }
//       } else {
//         setFeedback("Try Again!");
        
//         // Trigger emotion analysis on wrong answer
//         if (!loading) {
//           analyzeEmotion();
//           setLastAnalysisTime(Date.now());
//         }
        
//         setTimeout(() => {
//           setDropZones(Array(currentWord.correct.length).fill(null));
//           setFeedback(null);
//         }, 1000);
//       }
//     }
//   };

//   const startGame = () => {
//     setGameStarted(true);
//     // Start webcam access
//     navigator.mediaDevices.getUserMedia({ video: true })
//       .then((stream) => {
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//           // Wait a moment for camera to initialize
//           setTimeout(() => {
//             analyzeEmotion();
//             setLastAnalysisTime(Date.now());
//             setEmotionAnalysisActive(true);
//           }, 2000);
//         }
//       })
//       .catch((err) => {
//         console.error("Error accessing webcam:", err);
//         alert("Please allow camera access to play this game with dynamic adjustments");
//       });
//   };

//   // EmotionDebugger component for detailed emotion feedback
//   const EmotionDebugger = ({ emotion, emotionProbs, action }) => {
//     if (!emotion) return null;
    
//     // Format probabilities for display
//     const formattedProbs = emotionProbs ? 
//       Object.entries(emotionProbs)
//         .sort((a, b) => b[1] - a[1])
//         .map(([emotion, prob]) => `${emotion}: ${(prob * 100).toFixed(1)}%`)
//         .slice(0, 3)
//         .join(', ')
//       : 'No data';
    
//     return (
//       <div style={{
//         position: 'absolute',
//         top: '10px',
//         right: '10px',
//         backgroundColor: 'rgba(0,0,0,0.7)',
//         color: 'white',
//         padding: '8px',
//         borderRadius: '4px',
//         fontSize: '12px',
//         zIndex: 1000,
//         maxWidth: '300px'
//       }}>
//         <div><strong>Detected:</strong> {emotion}</div>
//         <div><strong>Top Emotions:</strong> {formattedProbs}</div>
//         {action && <div><strong>AI Action:</strong> {action}</div>}
//         <div style={{fontSize: '10px', marginTop: '4px'}}>
//           Last updated: {new Date().toLocaleTimeString()}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="game-container">
//       <video autoPlay loop muted playsInline className="background-video">
//         <source src={videoFile} type="video/mp4" />
//         Your browser does not support the video tag.
//       </video>

//       {emotion && (
//         <div
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             backgroundColor: emotionColors[emotion.toLowerCase()] || "rgba(245, 245, 245, 0.5)",
//             backgroundImage: backgroundPattern ? `url(${backgroundPattern})` : 'none',
//             backgroundRepeat: "repeat",
//             backgroundSize: "300px",
//             zIndex: 0,
//             transition: "background-color 0.5s ease, background-image 0.5s ease",
//           }}
//         />
//       )}

//       {/* Hidden Webcam Feed */}
//       <video
//         ref={videoRef}
//         style={{ display: "none" }}
//         autoPlay
//         playsInline
//         muted
//         width="640"
//         height="480"
//       />

//       <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }} />

//       {/* Enhanced emotion debugger */}
//       <EmotionDebugger 
//         emotion={emotion} 
//         emotionProbs={emotionProbs} 
//         action={action} 
//       />

//       <div className="content">
//         {!gameStarted ? (
//           <>
//             <h1>Welcome to the Game</h1>
//             <button onClick={startGame} className="start-button">
//               Start Game
//             </button>
//           </>
//         ) : !gameCompleted ? (
//           <div className="game-content">
//             <h1>What is this animal?</h1>
//             <div className="animal-container">
//               {currentWord && <img src={currentWord.image} alt="Animal" className="animal-image" />}
//             </div>

//             <div className="letters-container">
//               {letters.map((letter, index) => (
//                 <div
//                   key={index}
//                   draggable
//                   onDragStart={(e) => handleDragStart(e, letter)}
//                   className="draggable-letter"
//                 >
//                   {letter}
//                 </div>
//               ))}
//             </div>

//             <div className="dropzones-container">
//               {dropZones.map((zone, index) => (
//                 <div
//                   key={index}
//                   onDragOver={handleDragOver}
//                   onDrop={(e) => handleDrop(e, index)}
//                   className={`dropzone ${zone ? "filled" : ""}`}
//                 >
//                   {zone || "_"}
//                 </div>
//               ))}
//             </div>

//             {feedback && (
//               <p className={`feedback ${feedback === "Correct!" ? "correct" : "wrong"}`}>
//                 {feedback}
//               </p>
//             )}
//             <p className="score">Score: {score}</p>
//           </div>
//         ) : (
//           <div className="game-content">
//             <h2>Congratulations! You Won!</h2>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Game;
