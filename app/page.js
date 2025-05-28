'use client'
import { useState, useEffect } from 'react';

export default function AlphabetCircle() {
  const radius = 181;
  const letterRadius = 21;
  
  const [typedWord, setTypedWord] = useState('');
  const [recentLetter, setRecentLetter] = useState(null);
  const [isUppercase, setIsUppercase] = useState(true);

  const [keystrokeLog, setKeystrokeLog] = useState([]);
  const [startTime, setStartTime] = useState(null);

  const now = () => new Date().getTime();

  useEffect(() => {
    if (typedWord.length === 1 && keystrokeLog.length === 0) {
      setStartTime(now());
    }
  }, [typedWord]);

  const logKeystroke = (type, value) => {
    setKeystrokeLog(prev => [...prev, { time: now(), type, value }]);
  };
  
  const generateAlphabet = () => {
    const startCharCode = isUppercase ? 65 : 97; // ASCII for 'A' or 'a'
    return Array.from({ length: 26 }, (_, i) => String.fromCharCode(startCharCode + i));
  };
  
  const alphabet = generateAlphabet();
  
  const calculatePosition = (index, totalItems) => {
    const angle = (index * 2 * Math.PI) / totalItems - Math.PI / 2; 
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return { x, y, angle };
  };
  
  const handleLetterClick = (letter) => {
    setTypedWord(prev => prev + letter);
    setRecentLetter(letter);
    logKeystroke('letter', letter);

    setTimeout(() => {
      if (recentLetter === letter) {
        setRecentLetter(null);
      }
    }, 500);
  };
  
  const handleBackspace = () => {
    setTypedWord(prev => prev.slice(0, -1));
    logKeystroke('backspace', '<');
  };
  
  const handleClear = () => {
    setTypedWord('');
    setKeystrokeLog([]);
    setStartTime(null);
    logKeystroke('clear', 'X');
  };
  
  const toggleCase = () => {
    setIsUppercase(prev => !prev);
    logKeystroke('shift', 'shift');
  };

  const handleSpace = () => {
    setTypedWord(prev => prev + " ");
    logKeystroke('space', ' ');
  };

  useEffect(() => {
    if (typedWord.length > 0) {
      console.log('Keystroke Log:', keystrokeLog);
      console.log('Current Text:', typedWord);
      if (startTime) {
        const elapsedSec = (now() - startTime) / 1000;
        const adjustedWPM = ((typedWord.length - 1) / elapsedSec) * (60 / 5);
        console.log('Elapsed Time:', elapsedSec.toFixed(2), 'sec');
        console.log('Adjusted WPM:', adjustedWPM.toFixed(2));
      }
    }
  }, [typedWord]);
  
  return (
    <div className="flex flex-col items-center p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">DialBoard</h2>
      
      <div className="mb-6 w-full max-w-md">
        <div className="flex items-center mb-2">
          <div className="flex-grow p-3 bg-white border border-gray-300 rounded-lg text-xl font-medium min-h-12">
            {typedWord || <span className="text-gray-400">Type a word...</span>}
          </div>
        </div>
      </div>
      
      <div className="relative" style={{ 
        width: `${radius * 2 + letterRadius * 2}px`, 
        height: `${radius * 2 + letterRadius * 2}px` 
      }}>
        {/* <div 
          className="absolute border-2 border-gray-300 rounded-full"
          style={{
            width: `${radius * 2}px`,
            height: `${radius * 2}px`,
            top: `${letterRadius}px`,
            left: `${letterRadius}px`
          }}
        /> */}
        
        <div
          className="absolute ml-5 grid grid-cols-2 gap-3 items-center justify-center"
          style={{
            width: `${radius}px`,
            height: `${radius}px`,
            top: `${radius + letterRadius - radius/2}px`,
            left: `${radius + letterRadius - radius/2}px`
          }}
        >
          <button onClick={toggleCase} className={`px-4  -ml-3 py-10 ${isUppercase ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg w-24 text-sm font-medium`}>Shift</button>

          <button onClick={handleBackspace} className="px-4 py-10 bg-gray-200 hover:bg-gray-300 rounded-lg w-24 text-sm font-medium"> Backspace </button>
          
          <button onClick={handleClear} className="px-4 -ml-3  py-10 bg-gray-200 hover:bg-gray-300 rounded-lg w-24 text-sm font-medium">Clear</button>

          <button onClick={handleSpace} className="px-4 py-10 bg-gray-200 hover:bg-gray-300 rounded-lg w-24 text-sm font-medium">Space</button>
        
        </div>
        
        {alphabet.map((letter, index) => {
          const { x, y } = calculatePosition(index, alphabet.length);
          return (
            <div
              key={letter}
              className={`absolute flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 ${
                recentLetter === letter ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 hover:bg-blue-100'
              }`}
              style={{
                width: `${letterRadius * 2}px`,
                height: `${letterRadius * 2}px`,
                top: `${y + radius + letterRadius}px`,
                left: `${x + radius + letterRadius}px`,
                border: '2px solid',
                borderColor: recentLetter === letter ? 'rgb(59, 130, 246)' : 'rgb(209, 213, 219)'
              }}
              onClick={() => handleLetterClick(letter)}
            >
              <span className="font-bold">{letter}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}