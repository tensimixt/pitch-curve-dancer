import React from 'react';
import { Point } from '@/types/canvas';
import { drawCurve } from '@/utils/curveUtils';
import { usePointInteractions } from '@/hooks/usePointInteractions';

interface PitchCurveProps {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  points: Point[];
  setPoints: (points: Point[]) => void;
  addToHistory: (points: Point[]) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const PitchCurve: React.FC<PitchCurveProps> = ({
  context,
  width,
  height,
  points,
  setPoints,
  addToHistory,
  canvasRef,
}) => {
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

  React.useEffect(() => {
    drawCurve(context, points, width, height);
  }, [context, points, width, height]);

  return null;
};

export default PitchCurve;