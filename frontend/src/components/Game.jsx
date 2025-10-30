

// // Game.js: Main component for the word unscramble game with emotion detection and video/image switching
// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import JSConfetti from 'js-confetti';
// import { useNavigate } from 'react-router-dom';
// import '../styles/game.css';
// import videoFile from '../assets/video.mp4';
// import dogImage from '../assets/dog.png';
// import catImage from '../assets/cat.png';
// import tigerImage from '../assets/tiger.png';
// import zebraImage from '../assets/zebra.png';
// import monkeyImage from '../assets/monkey.png';
// import horseImage from '../assets/horse.png';
// import gameBackImage from '../assets/Gameback.jpg';
// import tigerLaughVideo from '../assets/tigerlaugh.mp4';
// import happyDogGIF from '../assets/Happy_Dog_GIF.gif';
// import useEmotionDetection from './EmotionDetection/useEmotionDetection';

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
//   const [currentEmotion, setCurrentEmotion] = useState(null);
//   const [questionEmotions, setQuestionEmotions] = useState([]);
//   const [recentReport, setRecentReport] = useState(null);
//   const [reportError, setReportError] = useState(null);
//   const [isGameRunning, setIsGameRunning] = useState(false);
//   const [readyToNavigate, setReadyToNavigate] = useState(false);

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const emotionDisplayRef = useRef(null);
//   const confettiRef = useRef(null);
//   const navigate = useNavigate();

//   const emotionColors = {
//     happy: 'rgba(167, 139, 250, 0.3)', // Soft purple
//     sad: 'rgba(253, 186, 116, 0.3)', // Warm peach
//     angry: 'rgba(110, 231, 183, 0.3)', // Mint green
//     surprise: 'rgba(244, 114, 182, 0.3)', // Muted pink
//     fear: 'rgba(252, 231, 122, 0.3)', // Soft yellow
//     disgust: 'rgba(245, 194, 143, 0.3)', // Warm beige
//     neutral: 'rgba(255, 245, 235, 0.3)', // Light cream
//   };

//   useEffect(() => {
//     confettiRef.current = new JSConfetti();
//   }, []);

//   useEffect(() => {
//     if (gameStarted && !gameCompleted) {
//       setIsGameRunning(true);
//     }
//     if (gameCompleted) {
//       setIsGameRunning(false); // Stop camera
//       confettiRef.current.addConfetti({
//         confettiColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'], // Vibrant colors
//         confettiRadius: 6, // Larger particles
//         confettiNumber: 300, // High density
//         spread: 80, // Full-screen effect
//         origin: { y: 0.5 }, // Centered
//       });
//       // UPDATE: Increased cleanup delay to 1000ms
//       const cleanupTimer = setTimeout(() => {
//         setReadyToNavigate(true);
//       }, 1000); // Allow time for camera cleanup

//       return () => clearTimeout(cleanupTimer);
//     }
//   }, [gameStarted, gameCompleted]);

//   useEffect(() => {
//     if (readyToNavigate) {
//       const navigationTimer = setTimeout(() => {
//         localStorage.removeItem('child_token');
//         localStorage.removeItem('userId');
//         navigate('/');
//       }, 4000); // 5s total - 1000ms cleanup = 4000ms

//       return () => clearTimeout(navigationTimer);
//     }
//   }, [readyToNavigate, navigate]);

//   useEffect(() => {
//     if (gameCompleted) {
//       const fetchRecentReport = async () => {
//         try {
//           const userId = localStorage.getItem('userId');
//           const token = localStorage.getItem('child_token');
//           if (!userId || !token) {
//             throw new Error('User not logged in');
//           }

//           const response = await axios.get(`http://localhost:3000/child/game-reports/${userId}`, {
//             headers: { Authorization: `Bearer ${token}` },
//             params: { limit: 1 },
//           });

//           setRecentReport(response.data[0]);
//         } catch (err) {
//           setReportError('Failed to load recent game report');
//           console.error('Error fetching report:', err);
//         }
//       };

//       fetchRecentReport();
//     }
//   }, [gameCompleted]);

//   const handleEmotionsCollected = (emotions) => {
//     setQuestionEmotions(emotions);
//     const emotionCounts = emotions.reduce((acc, emotion) => {
//       acc[emotion] = (acc[emotion] || 0) + 1;
//       return acc;
//     }, {});
//     const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
//       emotionCounts[a] > emotionCounts[b] ? a : b
//     );
//     setCurrentEmotion(dominantEmotion.toLowerCase());

//     const userId = localStorage.getItem('userId');
//     if (!userId || !currentWord) return;

//     axios
//       .post(
//         'http://localhost:3000/child/save-emotion',
//         {
//           userId,
//           emotion: dominantEmotion.toLowerCase(),
//           question: currentWord.correct,
//         },
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem('child_token')}` },
//         }
//       )
//       .then((res) => console.log('Emotion saved:', res.data))
//       .catch((error) => console.error('Error saving emotion:', error));
//   };

//   useEmotionDetection(videoRef, canvasRef, emotionDisplayRef, isGameRunning, handleEmotionsCollected);

//   const words = [
//     { correct: 'dog', jumbled: 'gdo', image: dogImage },
//     { correct: 'cat', jumbled: 'tac', image: catImage },
//     { correct: 'tiger', jumbled: 'ietgr', image: tigerImage },
//     { correct: 'horse', jumbled: 'soehr', image: horseImage },
//   ];

//   useEffect(() => {
//     setShuffledWords([...words].sort(() => Math.random() - 0.5));
//   }, []);

//   useEffect(() => {
//     if (shuffledWords.length > 0) {
//       const word = shuffledWords[wordIndex];
//       setCurrentWord(word);
//       setLetters(word.jumbled.split(''));
//       setDropZones(Array(word.correct.length).fill(null));
//       setQuestionEmotions([]);
//     }
//   }, [wordIndex, shuffledWords]);

//   const handleDragStart = (e, letter) => {
//     e.dataTransfer.setData('text/plain', letter);
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//   };

//   const handleDrop = (e, index) => {
//     e.preventDefault();
//     const letter = e.dataTransfer.getData('text/plain');
//     const newDropZones = [...dropZones];
//     newDropZones[index] = letter;
//     setDropZones(newDropZones);

//     if (newDropZones.every((zone) => zone !== null)) {
//       const arrangedWord = newDropZones.join('');
//       const isCorrect = arrangedWord === currentWord.correct;
//       const newScore = isCorrect ? score + 1 : score;

//       axios
//         .post(
//           'http://localhost:3000/child/save-game',
//           {
//             userId: localStorage.getItem('userId'),
//             score: newScore,
//             emotions: questionEmotions,
//             question: currentWord.correct,
//             isCorrect,
//           },
//           {
//             headers: { Authorization: `Bearer ${localStorage.getItem('child_token')}` },
//           }
//         )
//         .then((res) => console.log('Game progress saved:', res.data))
//         .catch((error) => console.error('Error saving game progress:', error));

//       if (isCorrect) {
//         setFeedback('Correct!');
//         setScore(newScore);
//         if (newScore >= words.length) {
//           setGameCompleted(true);
//         } else {
//           setTimeout(() => {
//             setWordIndex((prev) => prev + 1);
//             setFeedback(null);
//             setDropZones(Array(currentWord.correct.length).fill(null));
//           }, 1000);
//         }
//       } else {
//         setFeedback('Try Again!');
//         setTimeout(() => {
//           setDropZones(Array(currentWord.correct.length).fill(null));
//           setFeedback(null);
//         }, 1000);
//       }
//     }
//   };

//   const shouldShowTigerVideo =
//     currentWord &&
//     currentWord.correct === 'tiger' &&
//     currentEmotion &&
//     ['happy', 'angry', 'sad'].includes(currentEmotion.toLowerCase());

//   const shouldShowDogGIF =
//     currentWord &&
//     currentWord.correct === 'dog' &&
//     currentEmotion &&
//     ['sad', 'neutral'].includes(currentEmotion.toLowerCase());

//   return (
//     <div
//       className="game-container"
//       style={
//         gameStarted
//           ? {
//               backgroundImage: `url(${gameBackImage})`,
//               backgroundSize: 'cover',
//               backgroundPosition: 'center',
//               backgroundRepeat: 'no-repeat',
//             }
//           : {}
//       }
//     >
//       {!gameStarted && (
//         <video autoPlay loop muted playsInline className="background-video">
//           <source src={videoFile} type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>
//       )}

//       {currentEmotion && (
//         <div
//           style={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             width: '100%',
//             height: '100%',
//             backgroundColor: emotionColors[currentEmotion.toLowerCase()],
//             zIndex: 0,
//             transition: 'background-color 0.5s ease',
//           }}
//         />
//       )}

//       {/* UPDATE: Keep video and canvas mounted to prevent null refs */}
//       <video
//         ref={videoRef}
//         style={{ display: isGameRunning ? 'none' : 'none' }} // Always mounted, hidden
//         autoPlay
//         playsInline
//         muted
//         width="640"
//         height="480"
//       />

//       <canvas
//         ref={canvasRef}
//         style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, display: isGameRunning ? 'block' : 'none' }}
//         width="640"
//         height="480"
//       />

//       {/* UPDATE: Ensure emotionDisplayRef is always mounted */}
//       <div
//         ref={emotionDisplayRef}
//         style={{
//           position: 'absolute',
//           top: '10px',
//           left: '10px',
//           color: 'white',
//           zIndex: 2,
//           display: isGameRunning || gameCompleted ? 'block' : 'none', // Keep during completion
//         }}
//       >
//         Emotion: N/A {/* Fallback text */}
//       </div>

//       <div className="content">
//         {!gameStarted ? (
//           <>
//             <h1>Welcome to the Game</h1>
//             <button onClick={() => setGameStarted(true)} className="start-button">
//               Start Game
//             </button>
//           </>
//         ) : !gameCompleted ? (
//           <div className="game-content">
//             <h1>What is this animal?</h1>
//             <div className="animal-container">
//               {currentWord && (
//                 shouldShowTigerVideo ? (
//                   <video
//                     autoPlay
//                     loop
//                     muted
//                     playsInline
//                     className="animal-video"
//                     src={tigerLaughVideo}
//                     type="video/mp4"
//                   >
//                     Your browser does not support the video tag.
//                   </video>
//                 ) : shouldShowDogGIF ? (
//                   <img src={happyDogGIF} alt="Happy Dog" className="animal-image" />
//                 ) : (
//                   <img src={currentWord.image} alt="Animal" className="animal-image" />
//                 )
//               )}
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
//                   className={`dropzone ${zone ? 'filled' : ''}`}
//                 >
//                   {zone || '_'}
//                 </div>
//               ))}
//             </div>

//             {feedback && (
//               <p className={`feedback ${feedback === 'Correct!' ? 'correct' : 'wrong'}`}>
//                 {feedback}
//               </p>
//             )}
//             <p className="score">Score: {score}</p>
//           </div>
//         ) : (
//           <div className="game-content">
//             <h1>Congratulations! You Won!</h1>
//             <p className="score">Final Score: {score}</p>
//             {reportError ? (
//               <p className="report-error">{reportError}</p>
//             ) : recentReport ? (
//               <div className="report-details">
//                 <h2>Latest Game Report</h2>
//                 <p><strong>Animal:</strong> {recentReport.question}</p>
//                 <p><strong>Score:</strong> {recentReport.score}</p>
//                 <p><strong>Emotion:</strong> {recentReport.emotions[0] || 'Unknown'}</p>
//                 <p><strong>Correct:</strong> {recentReport.isCorrect ? 'Yes' : 'No'}</p>
//                 <p><strong>Completed At:</strong> {new Date(recentReport.completedAt).toLocaleString()}</p>
//               </div>
//             ) : (
//               <p>Loading recent game report...</p>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Game;











import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import JSConfetti from 'js-confetti';
import { useNavigate } from 'react-router-dom';
import '../styles/game.css';
import videoFile from '../assets/video.mp4';
import dogImage from '../assets/dog.png';
import catImage from '../assets/cat.png';
import tigerImage from '../assets/tiger.png';
import zebraImage from '../assets/zebra.png';
import monkeyImage from '../assets/monkey.png';
import horseImage from '../assets/horse.png';
import gameBackImage from '../assets/Gameback.jpg';
import tigerLaughVideo from '../assets/tigerlaugh.mp4';
import happyDogGIF from '../assets/Happy_Dog_GIF.gif';
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
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [questionEmotions, setQuestionEmotions] = useState([]);
  const [recentReport, setRecentReport] = useState(null);
  const [reportError, setReportError] = useState(null);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [readyToNavigate, setReadyToNavigate] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const emotionDisplayRef = useRef(null);
  const confettiRef = useRef(null);
  const navigate = useNavigate();

  const emotionColors = {
    happy: 'rgba(167, 139, 250, 0.3)',
    sad: 'rgba(253, 186, 116, 0.3)',
    angry: 'rgba(110, 231, 183, 0.3)',
    surprise: 'rgba(244, 114, 182, 0.3)',
    fear: 'rgba(252, 231, 122, 0.3)',
    disgust: 'rgba(245, 194, 143, 0.3)',
    neutral: 'rgba(255, 245, 235, 0.3)',
  };

  useEffect(() => {
    confettiRef.current = new JSConfetti();
  }, []);

  useEffect(() => {
    if (gameStarted && !gameCompleted) {
      setIsGameRunning(true);
    }
    if (gameCompleted) {
      setIsGameRunning(false);
      confettiRef.current.addConfetti({
        confettiColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'],
        confettiRadius: 6,
        confettiNumber: 300,
        spread: 80,
        origin: { y: 0.5 },
      });
      const cleanupTimer = setTimeout(() => {
        setReadyToNavigate(true);
      }, 1000);
      return () => clearTimeout(cleanupTimer);
    }
  }, [gameStarted, gameCompleted]);

  useEffect(() => {
    if (readyToNavigate) {
      const navigationTimer = setTimeout(() => {
        localStorage.removeItem('child_token');
        localStorage.removeItem('userId');
        navigate('/');
      }, 4000);
      return () => clearTimeout(navigationTimer);
    }
  }, [readyToNavigate, navigate]);

  useEffect(() => {
    if (gameCompleted) {
      const fetchRecentReport = async () => {
        try {
          const userId = localStorage.getItem('userId');
          const token = localStorage.getItem('child_token');
          if (!userId || !token) {
            throw new Error('User not logged in');
          }

          const response = await axios.get(
            `http://localhost:3000/child/game-reports/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { limit: 1 },
            }
          );
          setRecentReport(response.data[0]);
        } catch (err) {
          setReportError('Failed to load recent game report');
          console.error('Error fetching report:', err);
        }
      };
      fetchRecentReport();
    }
  }, [gameCompleted]);

  const handleEmotionsCollected = (emotions) => {
    setQuestionEmotions(emotions);
    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});
    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b
    );
    setCurrentEmotion(dominantEmotion.toLowerCase());

    const userId = localStorage.getItem('userId');
    if (!userId || !currentWord) return;

    axios
      .post(
        'http://localhost:3000/child/save-emotion',
        {
          userId,
          emotion: dominantEmotion.toLowerCase(),
          question: currentWord.correct,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('child_token')}`,
          },
        }
      )
      .then((res) => console.log('Emotion saved:', res.data))
      .catch((error) => console.error('Error saving emotion:', error));
  };

  useEmotionDetection(
    videoRef,
    canvasRef,
    emotionDisplayRef,
    isGameRunning,
    handleEmotionsCollected
  );

  const words = [
    { correct: 'dog', jumbled: 'gdo', image: dogImage },
    { correct: 'cat', jumbled: 'tac', image: catImage },
    { correct: 'tiger', jumbled: 'ietgr', image: tigerImage },
    { correct: 'horse', jumbled: 'soehr', image: horseImage },
  ];

  useEffect(() => {
    setShuffledWords([...words].sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    if (shuffledWords.length > 0) {
      const word = shuffledWords[wordIndex];
      setCurrentWord(word);
      setLetters(word.jumbled.split(''));
      setDropZones(Array(word.correct.length).fill(null));
      setQuestionEmotions([]);
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
      const isCorrect = arrangedWord === currentWord.correct;
      const newScore = isCorrect ? score + 1 : score;

      axios
        .post(
          'http://localhost:3000/child/save-game',
          {
            userId: localStorage.getItem('userId'),
            score: newScore,
            emotions: questionEmotions,
            question: currentWord.correct,
            isCorrect,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('child_token')}`,
            },
          }
        )
        .then((res) => console.log('Game progress saved:', res.data))
        .catch((error) =>
          console.error('Error saving game progress:', error)
        );

      if (isCorrect) {
        setFeedback('Correct!');
        setScore(newScore);
        if (newScore >= words.length) {
          setGameCompleted(true);
        } else {
          setTimeout(() => {
            setWordIndex((prev) => prev + 1);
            setFeedback(null);
            setDropZones(Array(currentWord.correct.length).fill(null));
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

  const shouldShowTigerVideo =
    currentWord &&
    currentWord.correct === 'tiger' &&
    currentEmotion &&
    ['happy', 'angry', 'sad'].includes(currentEmotion.toLowerCase());

  const shouldShowDogGIF =
    currentWord &&
    currentWord.correct === 'dog' &&
    currentEmotion &&
    ['sad', 'neutral'].includes(currentEmotion.toLowerCase());

  // ✅ Extra safety: stop camera if Game unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  return (
    <div
      className="game-container"
      style={
        gameStarted
          ? {
              backgroundImage: `url(${gameBackImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : {}
      }
    >
      {!gameStarted && (
        <video autoPlay loop muted playsInline className="background-video">
          <source src={videoFile} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {currentEmotion && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor:
              emotionColors[currentEmotion.toLowerCase()],
            zIndex: 0,
            transition: 'background-color 0.5s ease',
          }}
        />
      )}

      <video
        ref={videoRef}
        style={{ display: 'none' }}
        autoPlay
        playsInline
        muted
        width="640"
        height="480"
      />

      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          display: isGameRunning ? 'block' : 'none',
        }}
        width="640"
        height="480"
      />

      <div
        ref={emotionDisplayRef}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          color: 'white',
          zIndex: 2,
          display: isGameRunning || gameCompleted ? 'block' : 'none',
        }}
      >
        Emotion: N/A
      </div>

      <div className="content">
        {!gameStarted ? (
          <>
            <h1>Welcome to the Game</h1>
            <button
              onClick={() => setGameStarted(true)}
              className="start-button"
            >
              Start Game
            </button>
          </>
        ) : !gameCompleted ? (
          <div className="game-content">
            <h1>What is this animal?</h1>
            <div className="animal-container">
              {currentWord &&
                (shouldShowTigerVideo ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="animal-video"
                    src={tigerLaughVideo}
                    type="video/mp4"
                  />
                ) : shouldShowDogGIF ? (
                  <img
                    src={happyDogGIF}
                    alt="Happy Dog"
                    className="animal-image"
                  />
                ) : (
                  <img
                    src={currentWord.image}
                    alt="Animal"
                    className="animal-image"
                  />
                ))}
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
              <p
                className={`feedback ${
                  feedback === 'Correct!' ? 'correct' : 'wrong'
                }`}
              >
                {feedback}
              </p>
            )}
            <p className="score">Score: {score}</p>
          </div>
        ) : (
          <div className="game-content">
            <h1>Congratulations! You Won!</h1>
            <p className="score">Final Score: {score}</p>
            {reportError ? (
              <p className="report-error">{reportError}</p>
            ) : recentReport ? (
              <div className="report-details">
                <h2>Latest Game Report</h2>
                <p>
                  <strong>Animal:</strong> {recentReport.question}
                </p>
                <p>
                  <strong>Score:</strong> {recentReport.score}
                </p>
                <p>
                  <strong>Emotion:</strong>{' '}
                  {recentReport.emotions[0] || 'Unknown'}
                </p>
                <p>
                  <strong>Correct:</strong>{' '}
                  {recentReport.isCorrect ? 'Yes' : 'No'}
                </p>
                <p>
                  <strong>Completed At:</strong>{' '}
                  {new Date(
                    recentReport.completedAt
                  ).toLocaleString()}
                </p>
                
              </div>
            ) : (
              <p>Loading recent game report...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
// ...existing
             
