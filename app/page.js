'use client'
import { useState } from 'react';

export default function AlphabetCircle() {
  const radius = 181;
  const letterRadius = 21;
  
  const [typedWord, setTypedWord] = useState('');
  const [recentLetter, setRecentLetter] = useState(null);
  const [isUppercase, setIsUppercase] = useState(true);
  
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
    
    setTimeout(() => {
      if (recentLetter === letter) {
        setRecentLetter(null);
      }
    }, 500);
  };
  
  const handleBackspace = () => {
    setTypedWord(prev => prev.slice(0, -1));
  };
  
  const handleClear = () => {
    setTypedWord('');
  };
  
  const toggleCase = () => {
    setIsUppercase(prev => !prev);
  };
  
  return (
    <div className="flex flex-col items-center p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Alphabet Circle</h2>
      
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
        {/* Main circle */}
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
          className="absolute flex flex-col gap-3 items-center justify-center"
          style={{
            width: `${radius}px`,
            height: `${radius}px`,
            top: `${radius + letterRadius - radius/2}px`,
            left: `${radius + letterRadius - radius/2}px`
          }}
        >
          <button 
            onClick={toggleCase}
            className={`px-4 py-2 ${isUppercase ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg w-32 text-sm font-medium`}
          >
            Shift
          </button>

          <button 
            onClick={handleBackspace}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg w-32 text-sm font-medium"
          >
            Backspace
          </button>
          
          <button 
            onClick={handleClear}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg w-32 text-sm font-medium"
          >
            Clear
          </button>
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