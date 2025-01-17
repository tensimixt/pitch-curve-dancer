import React, { useEffect, useState, useCallback } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { drawCurve } from '@/utils/curveUtils';
import { Point } from '@/types/canvas';
import { Button } from '@/components/ui/button';
import { Undo } from 'lucide-react';

const PitchBend = () => {
  const { canvasRef, context } = useCanvas();
  const [points, setPoints] = useState<Point[]>([]);
  const [pointsHistory, setPointsHistory] = useState<Point[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
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

      // Calculate the distance from point to line segment
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

      // Increased detection threshold for better usability
      if (distance < 15 && param >= 0 && param <= 1) {
        return { isNear: true, insertIndex: i + 1 };
      }
    }

    return { isNear: false, insertIndex: points.length };
  };

  const addToHistory = (newPoints: Point[]) => {
    const newHistory = pointsHistory.slice(0, historyIndex + 1);
    newHistory.push([...newPoints]);
    setPointsHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPoints([...pointsHistory[historyIndex - 1]]);
    }
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
  }, [points, pointsHistory, historyIndex]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || dragPointIndex === null) return;
    
    const pos = getMousePos(e);
    const newPoints = points.map((p, i) => 
      i === dragPointIndex ? pos : p
    );
    setPoints(newPoints);
  }, [isDragging, dragPointIndex, points]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragPointIndex !== null) {
      addToHistory([...points]);
    }
    setIsDragging(false);
    setDragPointIndex(null);
  }, [isDragging, dragPointIndex, points]);

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
    <div className="relative">
      <canvas 
        ref={canvasRef}
        className="w-full h-[500px] rounded-lg bg-gray-900"
      />
      <Button
        onClick={handleUndo}
        className="absolute top-4 right-4"
        variant="secondary"
        disabled={historyIndex === 0}
      >
        <Undo className="w-4 h-4 mr-2" />
        Undo
      </Button>
    </div>
  );
};

export default PitchBend;