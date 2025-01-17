import React, { useEffect, useState, useCallback } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { drawCurve } from '@/utils/curveUtils';
import { Point } from '@/types/canvas';

const PitchBend = () => {
  const { canvasRef, context } = useCanvas();
  const [points, setPoints] = useState<Point[]>([]);
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

  const handleMouseDown = useCallback((e: MouseEvent) => {
    const pos = getMousePos(e);
    const pointIndex = findNearestPoint(pos);

    if (pointIndex !== null) {
      setIsDragging(true);
      setDragPointIndex(pointIndex);
    } else {
      setPoints(prev => [...prev, pos]);
      console.log('Added point at:', pos);
    }
  }, [points]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || dragPointIndex === null) return;
    
    const pos = getMousePos(e);
    setPoints(prev => prev.map((p, i) => 
      i === dragPointIndex ? pos : p
    ));
  }, [isDragging, dragPointIndex]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragPointIndex(null);
  }, []);

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
    <canvas 
      ref={canvasRef}
      className="w-full h-[500px] rounded-lg bg-gray-900"
    />
  );
};

export default PitchBend;