import { useState, useCallback } from 'react';
import { Point } from '@/types/canvas';

interface UsePointInteractionsProps {
  points: Point[];
  setPoints: (points: Point[]) => void;
  addToHistory: (points: Point[]) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const usePointInteractions = ({
  points,
  setPoints,
  addToHistory,
  canvasRef,
}: UsePointInteractionsProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPointIndex, setDragPointIndex] = useState<number | null>(null);

  const getMousePos = (e: MouseEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const findNearestPoint = (pos: Point): number | null => {
    for (let i = 0; i < points.length; i++) {
      const dx = points[i].x - pos.x;
      const dy = points[i].y - pos.y;
      if (Math.sqrt(dx * dx + dy * dy) < 10) {
        return i;
      }
    }
    return null;
  };

  const isPointNearCurve = (pos: Point): { isNear: boolean, insertIndex: number } => {
    if (points.length < 2) return { isNear: false, insertIndex: points.length };

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const A = pos.x - p1.x;
      const B = pos.y - p1.y;
      const C = p2.x - p1.x;
      const D = p2.y - p1.y;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;

      if (lenSq !== 0) param = dot / lenSq;

      let xx, yy;

      if (param < 0) {
        xx = p1.x;
        yy = p1.y;
      } else if (param > 1) {
        xx = p2.x;
        yy = p2.y;
      } else {
        xx = p1.x + param * C;
        yy = p1.y + param * D;
      }

      const dx = pos.x - xx;
      const dy = pos.y - yy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 15 && param >= 0 && param <= 1) {
        return { isNear: true, insertIndex: i + 1 };
      }
    }

    return { isNear: false, insertIndex: points.length };
  };

  const handleMouseDown = useCallback((e: MouseEvent) => {
    const pos = getMousePos(e);
    const pointIndex = findNearestPoint(pos);

    if (pointIndex !== null) {
      setIsDragging(true);
      setDragPointIndex(pointIndex);
    } else {
      const { isNear, insertIndex } = isPointNearCurve(pos);
      if (isNear) {
        const newPoints = [...points];
        newPoints.splice(insertIndex, 0, pos);
        setPoints(newPoints);
        addToHistory(newPoints);
        console.log('Added point on curve at:', pos);
      } else {
        const newPoints = [...points, pos];
        setPoints(newPoints);
        addToHistory(newPoints);
        console.log('Added new point at:', pos);
      }
    }
  }, [points, setPoints, addToHistory]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || dragPointIndex === null) return;
    
    const pos = getMousePos(e);
    const newPoints = points.map((p, i) => 
      i === dragPointIndex ? pos : p
    );
    setPoints(newPoints);
  }, [isDragging, dragPointIndex, points, setPoints]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragPointIndex !== null) {
      addToHistory([...points]);
    }
    setIsDragging(false);
    setDragPointIndex(null);
  }, [isDragging, dragPointIndex, points, addToHistory]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};