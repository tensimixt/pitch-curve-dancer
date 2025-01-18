import React from 'react';
import { Note } from '@/types/canvas';

interface PitchCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
}

const PitchCanvas: React.FC<PitchCanvasProps> = ({
  canvasRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}) => {
  return (
    <div className="relative flex-grow">
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full rounded-lg bg-gray-900"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      />
    </div>
  );
};

export default PitchCanvas;