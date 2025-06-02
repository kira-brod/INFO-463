'use client'
import { useState, useEffect, useMemo, useRef } from 'react';

export default function AlphabetCircle() {
  const radius = 200;
  const letterRadius = 21;

  const [typedWord, setTypedWord] = useState('');
  const [recentLetter, setRecentLetter] = useState(null);
  const [isUppercase, setIsUppercase] = useState(true);

  const [keystrokeLog, setKeystrokeLog] = useState([]); // array of session objects
  const [currentKeystrokes, setCurrentKeystrokes] = useState([]); // for current session

  const [startTime, setStartTime] = useState(null);
  const [clearClicked, setClearClicked] = useState(false)
  const [submitClicked, setSubmitClicked] = useState(false)
  const [shiftLocked, setShiftLocked] = useState(false);
  const [session, setSession] = useState([])
  const [indexSess, setIndexSess] = useState(0)
  const [isSymbolsMode, setIsSymbolsMode] = useState(false);





  const sentences = ["She packed twelve blue pens in her small bag",
    "Every bird sang sweet songs in the quiet dawn",
    "They watched clouds drift across the golden sky",
    "A clever mouse slipped past the sleepy cat",
    "Green leaves danced gently in the warm breeze",
    "He quickly wrote notes before the test began",
    "The tall man wore boots made of soft leather",
    "Old clocks ticked loudly in the silent room",
    "She smiled while sipping tea on the front porch",
    "We found a hidden path behind the old barn",
    "Sunlight streamed through cracks in the ceiling",
    "Dogs barked at shadows moving through the yard",
    "Rain tapped softly against the window glass",
    "Bright stars twinkled above the quiet valley",
    "He tied the package with ribbon and string",
    "A sudden breeze blew papers off the desk",
    "The curious child opened every single drawer",
    "Fresh apples fell from the heavy tree limbs",
    "The artist painted scenes from her memory",
    "They danced all night under the glowing moon"]

  const [sentence, setSentence] = useState(sentences[0])



  const now = () => new Date().getTime();

  const [status, setStatus] = useState('');

  const handleWriteJson = async () => {
    const res = await fetch('/api/write-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: keystrokeLog }),
    });

    const result = await res.json().catch(() => ({
      message: 'Error parsing server response',
      error: true,
    }));

    console.log(result);
    setStatus(result.message || 'Saved');
  };



  useEffect(() => {
    if (typedWord.length === 1 && keystrokeLog.length === 0) {
      setStartTime(now());
    }
  }, [typedWord]);

  useEffect(() => {
    if (recentLetter) {
      const updated = staticSuggestions[recentLetter.toUpperCase()] || [];
      setSuggestions(isUppercase ? updated : updated.map(l => l.toLowerCase()));
    }
  }, [isUppercase]);


  const logKeystroke = (type, value) => {
    setCurrentKeystrokes(prev => [...prev, { time: now(), type, value }]);
  };

  const generateAlphabet = () => {
    if (isSymbolsMode) {
      return ['.', ',', '?', '!', "'", '"', ':', ';', '-', '_', '(', ')', '/', '\\', '@', '#', '$', '%', '&', '*', '+', '='];
    }

    const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return isUppercase ? base : base.map(l => l.toLowerCase());
  };


  const alphabet = useMemo(() => generateAlphabet(), [isUppercase, isSymbolsMode]);


  const calculatePosition = (index, totalItems) => {
    const angle = (index * 2 * Math.PI) / totalItems - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return { x, y, angle };
  };

  const handleLetterClick = (letter) => {

    // if (clearClicked) {
    //   setKeystrokeLog([]);
    //   setClearClicked(false)
    // }

    if (submitClicked) {
      setSubmitClicked(false)
    }

    setTypedWord(prev => prev + letter);
    setRecentLetter(letter);
    logKeystroke('letter', letter);

    if (shiftTemporary && !shiftLocked) {
      setIsUppercase(false);
      setShiftTemporary(false);
    }


    const index = alphabet.indexOf(letter);
    const { x, y } = calculatePosition(index, alphabet.length);
    setLastClickedPos({ x, y });
    setSuggestions(getSuggestions(letter));

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
    setStartTime(null);
    setCurrentKeystrokes([]);
    logKeystroke('clear', 'X');
  };


  const handleSubmit = () => {
    setTypedWord(prev => prev + " ");
    setSubmitClicked(true);
    logKeystroke('submit', 'X');

    const newSession = {
      sessionId: keystrokeLog.length + 1,
      keystrokes: currentKeystrokes,
    };

    setKeystrokeLog(prev => [...prev, newSession]);
    setCurrentKeystrokes([]); // reset for next session

    console.log('New session added:', newSession);
  };


  const [shiftTemporary, setShiftTemporary] = useState(false);

  const lastShiftTapTime = useRef(0);


  const toggleCase = () => {
    const nowTap = Date.now();
    const timeSinceLastTap = nowTap - lastShiftTapTime.current;

    if (shiftLocked) {
      setIsUppercase(false);
      setShiftLocked(false);
      setShiftTemporary(false);
    }


    else if (timeSinceLastTap < 400) {
      setIsUppercase(true);
      setShiftLocked(true);
      setShiftTemporary(false);
    }


    else {
      setIsUppercase(true);
      setShiftTemporary(true);
      setShiftLocked(false);
    }

    lastShiftTapTime.current = nowTap;
    logKeystroke('shift', 'shift');
  };






  const handleSpace = () => {
    setTypedWord(prev => prev + " ");
    logKeystroke('space', ' ');
  };

  const handleRefresh = () => {
    setSentence(sentences[Math.floor(Math.random() * 20)])
  }

  useEffect(() => {
    if (typedWord.length > 0 || submitClicked) {
      console.log('Keystroke Log:', keystrokeLog);
      console.log('Current Text:', typedWord);
      if (clearClicked) {
        const elapsedSec = (now() - startTime) / 1000;
        const adjustedWPM = ((typedWord.length - 1) / elapsedSec) * (60 / 5);
        console.log('Elapsed Time:', elapsedSec.toFixed(2), 'sec');
        console.log('Adjusted WPM:', adjustedWPM.toFixed(2));
      }
    }
  }, [typedWord]);

  const [suggestions, setSuggestions] = useState([]);
  const [lastClickedPos, setLastClickedPos] = useState({ x: 0, y: 0 });

  const staticSuggestions = {
    A: ['N', 'L', 'T'],
    B: ['E', 'R', 'A'],
    C: ['H', 'O', 'K'],
    D: ['E', 'A', 'I'],
    E: ['R', 'S', 'D'],
    F: ['O', 'I', 'U'],
    G: ['H', 'O', 'A'],
    H: ['E', 'I', 'O'],
    I: ['N', 'S', 'T'],
    J: ['U', 'O', 'A'],
    K: ['E', 'I', 'O'],
    L: ['L', 'E', 'Y'],
    M: ['E', 'O', 'I'],
    N: ['G', 'T', 'E'],
    O: ['U', 'N', 'R'],
    P: ['L', 'A', 'E'],
    Q: ['U', 'I', 'A'],
    R: ['E', 'I', 'A'],
    S: ['T', 'H', 'I'],
    T: ['H', 'E', 'O'],
    U: ['S', 'R', 'L'],
    V: ['E', 'I', 'A'],
    W: ['A', 'E', 'O'],
    X: ['P', 'C', 'T'],
    Y: ['O', 'E', 'A'],
    Z: ['A', 'E', 'I'],
  };

  const getSuggestions = (lastLetter) => {
    const baseSuggestions = staticSuggestions[lastLetter.toUpperCase()] || [];
    return isUppercase ? baseSuggestions : baseSuggestions.map(l => l.toLowerCase());
  };


  return (
    <div className="flex flex-col items-center pt-3 p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">DialBoard</h2>
      <h3 className="text-xl font-bold mb-2">{sentence}</h3>
      <div className='grid grid-cols-3'>
        <button
          onClick={handleRefresh}
          className='px-4 mb-4 mx-10 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg w-24 text-sm font-medium'
        >
          Refresh
        </button>
        <button
          onClick={handleSubmit}
          className='px-4 mb-4 mx-10 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg w-24 text-sm font-medium'
        >
          Submit
        </button>
        <button
          onClick={handleWriteJson}
          className='px-4 mb-4 mx-10 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg w-24 text-sm font-medium'
        >
          Save
        </button>
      </div>

      <div className="mb-2 w-full max-w-md">
        <div className="flex items-center mb-2">
          <div className="flex-grow p-3 bg-white border border-gray-300 rounded-lg text-xl font-medium min-h-12">
            {typedWord || <span className="text-gray-400">Type a word...</span>}
          </div>
        </div>
      </div>

      <div
        className="relative"
        style={{
          width: `${radius * 2 + letterRadius * 2}px`,
          height: `${radius * 2 + letterRadius * 2}px`
        }}
      >
        <div
          className="absolute grid grid-cols-2 gap-3 items-center justify-center"
          style={{
            width: `${radius + 120}px`,
            height: `${radius + 120}px`,
            top: `${radius + letterRadius - (radius + 80) / 2}px`,
            left: `${radius + letterRadius - (radius + 60) / 2}px`
          }}
        >
          <button
            onClick={toggleCase}
            className={`rounded-tl-full px-4 py-10 ${isUppercase
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
              } rounded-lg w-36 h-36 text-sm font-medium`}
          >
            {shiftLocked ? 'Caps Lock' : shiftTemporary ? 'Shift ' : 'Shift'}
          </button>



          <button
            onClick={handleBackspace}
            className="rounded-tr-full px-4 py-10 bg-gray-200 hover:bg-gray-300 rounded-lg w-36 h-36 text-sm font-medium"
          >
            Backspace
          </button>

          <button
            onClick={handleClear}
            className="rounded-bl-full px-4 py-10 bg-gray-200 hover:bg-gray-300 rounded-lg w-36 h-36 text-sm font-medium"
          >
            Clear
          </button>

          <button
            onClick={handleSpace}
            className="rounded-br-full px-4 py-10 bg-gray-200 hover:bg-gray-300 rounded-lg w-36 h-36 text-sm font-medium"
          >
            Space
          </button>
          {/* Toggle Symbols Button - Center of the 4 control buttons */}

          <button
            onClick={() => {
              setIsSymbolsMode(prev => !prev);
              setRecentLetter(null);
              setSuggestions([]);
            }}
            className="absolute bg-fuchsia-300 hover:bg-fuchsia-400 rounded-full px-3 py-1 text-sm font-medium w-20 h-20 shadow"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 50,
            }}
          >
            {isSymbolsMode ? 'ABC' : '123'}
          </button>





        </div>

        {/* Letter Bubbles */}
        {alphabet.map((letter, index) => {
          const { x, y } = calculatePosition(index, alphabet.length);
          return (
            <div
              key={letter}
              className={`absolute flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 ${recentLetter === letter
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-800 hover:bg-blue-100'
                }`}
              style={{
                width: `${letterRadius * 2}px`,
                height: `${letterRadius * 2}px`,
                top: `${y + radius + letterRadius}px`,
                left: `${x + radius + letterRadius}px`,
                border: '2px solid',
                borderColor:
                  recentLetter === letter
                    ? 'rgb(59, 130, 246)'
                    : 'rgb(209, 213, 219)'
              }}
              onClick={() => handleLetterClick(letter)}
            >
              <span className="font-bold">{letter}</span>
            </div>
          );
        })}

        {/* Suggestion Bubbles */}
        {suggestions.map((sugg, i) => {
          const normalized =
            isUppercase && recentLetter
              ? recentLetter.toUpperCase()
              : recentLetter?.toLowerCase();
          const index = alphabet.indexOf(normalized);
          const baseAngle = (index * 2 * Math.PI) / alphabet.length - Math.PI / 2;
          const angleOffset = (i - 1) * (Math.PI / 15);
          const angle = baseAngle + angleOffset;
          const dist = radius + 50;

          const x = dist * Math.cos(angle);
          const y = dist * Math.sin(angle);

          return (
            <div
              key={sugg}
              className="absolute flex items-center justify-center rounded-full text-gray-800 bg-yellow-300 hover:bg-yellow-400 font-semibold transition-all shadow-md"
              style={{
                width: `${letterRadius * 2}px`,
                height: `${letterRadius * 2}px`,
                top: `${y + radius + letterRadius}px`,
                left: `${x + radius + letterRadius}px`,
                border: '2px solid #facc15',
                zIndex: 20,
                cursor: 'pointer'
              }}
              onClick={() => handleLetterClick(sugg)}
            >
              {sugg}
            </div>
          );
        })}
      </div>
    </div>
  );

}