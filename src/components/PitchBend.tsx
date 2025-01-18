import React, { useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCanvas } from '@/hooks/useCanvas';
import UndoButton from './UndoButton';
import { usePointsHistory } from '@/hooks/usePointsHistory';
import { useNotes } from '@/hooks/useNotes';
import Grid from './Grid';
import PitchCurve from './PitchCurve';
import NotesLayer from './NotesLayer';

const PitchBend = () => {
  const { canvasRef, context } = useCanvas();
  const {
    points,
    setPoints,
    historyIndex: pointsHistoryIndex,
    handleUndo: handlePointsUndo,
    addToHistory,
  } = usePointsHistory();

  const {
    historyIndex: notesHistoryIndex,
    handleUndo: handleNotesUndo
  } = useNotes();

  const handleUndoClick = () => {
    if (notesHistoryIndex > 0) {
      handleNotesUndo();
    } else {
      handlePointsUndo();
    }
  };

  // Generate piano keys with note names
  const generateNoteNames = () => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const startOctave = 6;
    const totalKeys = 44;
    
    let currentOctave = startOctave;
    let noteIndex = 0;
    const pianoKeys = [];
    
    for (let i = 0; i < totalKeys; i++) {
      const noteName = notes[noteIndex];
      const fullNoteName = `${noteName}${currentOctave}`;
      const isBlackKey = noteName.includes('#');
      
      pianoKeys.push({ note: fullNoteName, isBlackKey });
      
      noteIndex = (noteIndex + 1) % 12;
      if (noteIndex === 0) {
        currentOctave--;
      }
    }
    
    return pianoKeys;
  };

  const pianoKeys = generateNoteNames();

  const notesLayer = NotesLayer({ context, canvasRef });

  return (
    <div className="relative h-[550px] w-full rounded-md border">
      <ScrollArea className="h-full" orientation="horizontal">
        <div className="flex h-[1100px] w-[10000px] relative">
          {/* Fixed piano keys column */}
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

          {/* Canvas area */}
          <div className="relative flex-grow">
            <canvas 
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full rounded-lg bg-gray-900"
              onMouseDown={notesLayer.handleNoteMouseDown}
              onMouseMove={notesLayer.handleNoteMouseMove}
              onMouseUp={notesLayer.handleNoteMouseUp}
              onMouseLeave={notesLayer.handleNoteMouseUp}
            />
            {context && canvasRef.current && (
              <>
                <Grid 
                  context={context} 
                  width={canvasRef.current.width} 
                  height={canvasRef.current.height} 
                />
                <PitchCurve
                  context={context}
                  width={canvasRef.current.width}
                  height={canvasRef.current.height}
                  points={points}
                  setPoints={setPoints}
                  addToHistory={addToHistory}
                  canvasRef={canvasRef}
                />
              </>
            )}
          </div>
        </div>
      </ScrollArea>
      <UndoButton 
        onUndo={handleUndoClick} 
        disabled={pointsHistoryIndex === 0 && notesHistoryIndex === 0} 
      />
    </div>
  );
};

export default PitchBend;