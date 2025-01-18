import React from 'react';

interface PianoKey {
  note: string;
  isBlackKey: boolean;
}

interface PianoKeysProps {
  pianoKeys: PianoKey[];
}

const PianoKeys: React.FC<PianoKeysProps> = ({ pianoKeys }) => {
  return (
    <div className="sticky left-0 w-16 flex-shrink-0 bg-gray-800 z-50">
      {pianoKeys.map(({ note, isBlackKey }, i) => (
        <div 
          key={i} 
          className={`relative h-[25px] border-b border-gray-700 flex items-center ${
            isBlackKey ? 'bg-gray-900' : 'bg-gray-100'
          }`}
        >
          <div className={`w-full h-full flex items-center justify-center text-xs ${
            isBlackKey ? 'text-gray-100' : 'text-gray-900'
          }`}>
            {note}
          </div>
          {isBlackKey && (
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gray-900 border-l border-gray-700" />
          )}
        </div>
      ))}
    </div>
  );
};

export default PianoKeys;