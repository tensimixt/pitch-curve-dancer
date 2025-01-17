import React, { useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCanvas } from '@/hooks/useCanvas';
import { drawCurve } from '@/utils/curveUtils';
import UndoButton from './UndoButton';
import { usePointsHistory } from '@/hooks/usePointsHistory';
import { usePointInteractions } from '@/hooks/usePointInteractions';

const PitchBend = () => {
  const { canvasRef, context } = useCanvas();
  const {
    points,
    setPoints,
    historyIndex,
    handleUndo,
    addToHistory,
  } = usePointsHistory();

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = usePointInteractions({
    points,
    setPoints,
    addToHistory,
    canvasRef,
  });

  useEffect(() => {
    if (!context || !canvasRef.current) return;
    drawCurve(context, points, canvasRef.current.width, canvasRef.current.height);
  }, [points, context]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  // Piano key data with note names
  const getNoteLabel = (index: number): string => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteIndex = index % 12;
    const octave = Math.floor(index / 12) - 1; // Starting from C-1
    return `${notes[noteIndex]}${octave}`;
  };

  // Generate 132 keys (11 octaves * 12 notes = 132 keys from C-1 to B9)
  const pianoKeys = Array.from({ length: 132 }).map((_, i) => {
    const note = getNoteLabel(i);
    const isBlackKey = note.includes('#');
    return { note, isBlackKey };
  });

  return (
    <div className="relative h-[550px] w-full rounded-md border">
      <ScrollArea className="h-full" orientation="horizontal">
        <div className="flex h-[3300px] w-[10000px]">
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
            />
          </div>
        </div>
      </ScrollArea>
      <UndoButton 
        onUndo={handleUndo} 
        disabled={historyIndex === 0} 
      />
    </div>
  );
};

export default PitchBend;