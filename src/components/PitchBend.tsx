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

  // Piano key data
  const pianoKeys = Array.from({ length: 44 }).map((_, i) => {
    const note = 43 - i;
    const isBlackKey = [1, 3, 6, 8, 10].includes(note % 12);
    return { note, isBlackKey };
  });

  return (
    <div className="relative h-[550px] w-full rounded-md border">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gray-800 z-10">
        {/* Piano keys */}
        <div className="h-full flex flex-col">
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
      </div>
      <div className="h-full w-full overflow-hidden pl-16">
        <ScrollArea className="h-full" orientation="horizontal">
          <div className="relative h-[1100px] w-[10000px]">
            <canvas 
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full rounded-lg bg-gray-900"
            />
          </div>
        </ScrollArea>
      </div>
      <UndoButton 
        onUndo={handleUndo} 
        disabled={historyIndex === 0} 
      />
    </div>
  );
};

export default PitchBend;