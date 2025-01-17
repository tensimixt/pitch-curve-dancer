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

  return (
    <div className="relative h-[550px] w-full rounded-md border">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-800 z-10">
        {/* Piano keys placeholder - we'll implement this later */}
        <div className="h-full flex flex-col">
          {Array.from({ length: 44 }).map((_, i) => (
            <div 
              key={i} 
              className="h-[25px] border-b border-gray-700 flex items-center justify-center text-xs text-gray-400"
            >
              {i}
            </div>
          ))}
        </div>
      </div>
      <div className="h-full w-full overflow-hidden pl-12">
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