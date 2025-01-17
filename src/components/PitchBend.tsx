import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

const PitchBend = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPointIndex, setDragPointIndex] = useState<number | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  // Initialize canvas context
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setContext(ctx);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Draw function
  const draw = useCallback(() => {
    if (!context || !canvasRef.current) return;

    // Clear canvas
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw curve
    if (points.length > 1) {
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);

      // Draw smooth curve through points
      for (let i = 0; i < points.length - 1; i++) {
        const currentPoint = points[i];
        const nextPoint = points[i + 1];
        
        // Calculate control points
        const midX = (currentPoint.x + nextPoint.x) / 2;
        const midY = (currentPoint.y + nextPoint.y) / 2;
        
        if (i === 0) {
          // First segment
          context.quadraticCurveTo(
            currentPoint.x,
            currentPoint.y,
            midX,
            midY
          );
        }
        
        // Draw curve to midpoint using the next point as control point
        context.quadraticCurveTo(
          nextPoint.x,
          nextPoint.y,
          nextPoint.x,
          nextPoint.y
        );
      }

      context.strokeStyle = '#ffffff';
      context.lineWidth = 2;
      context.stroke();
    }

    // Draw points
    points.forEach((point) => {
      context.beginPath();
      context.arc(point.x, point.y, 5, 0, Math.PI * 2);
      context.fillStyle = '#00ff88';
      context.fill();
    });
  }, [points, context]);

  // Draw whenever points change
  useEffect(() => {
    draw();
  }, [points, draw]);

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