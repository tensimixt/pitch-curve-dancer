import { useEffect, useRef, useState } from 'react';

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Set canvas width to match client width
      canvas.width = canvas.clientWidth;
      
      // Calculate height based on number of notes (25px per note)
      const numberOfNotes = 44; // Total number of notes in our scale
      const noteHeight = 25;
      canvas.height = numberOfNotes * noteHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setContext(ctx);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return { canvasRef, context };
};