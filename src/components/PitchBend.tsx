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

  // Piano key data with proper note names
  const pianoKeys = [
    'C7', 'B6', 'A#6', 'A6', 'G#6', 'G6', 'F#6', 'F6', 'E6', 'D#6', 'D6', 'C#6',
    'C6', 'B5', 'A#5', 'A5', 'G#5', 'G5', 'F#5', 'F5', 'E5', 'D#5', 'D5', 'C#5',
    'C5', 'B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4',
    'C4', 'B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3', 'E3', 'D#3', 'D3', 'C#3'
  ].map(note => ({
    note,
    isBlackKey: note.includes('#')
  }));

  return (
    <div className="relative h-[550px] w-full rounded-md border">
      <ScrollArea className="h-full" orientation="horizontal">
        <div className="flex h-[1100px] w-[10000px]">
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