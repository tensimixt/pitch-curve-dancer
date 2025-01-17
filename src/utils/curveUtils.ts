import { Point } from '@/types/canvas';

export const drawCurve = (
  context: CanvasRenderingContext2D,
  points: Point[],
  canvasWidth: number,
  canvasHeight: number
) => {
  // Clear canvas
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw curve
  if (points.length > 1) {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    // Draw smooth curve through points
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Calculate control points for smoother curves
      let cp1x, cp1y, cp2x, cp2y;
      
      // If it's the first segment
      if (i === 0) {
        // Control points for first segment
        cp1x = current.x + (next.x - current.x) / 3;
        cp1y = current.y + (next.y - current.y) / 3;
        cp2x = next.x - (next.x - current.x) / 3;
        cp2y = next.y - (next.y - current.y) / 3;
      } else {
        // Calculate control points based on previous and next points
        const prev = points[i - 1];
        
        // Calculate the direction vector
        const dx = next.x - prev.x;
        const dy = next.y - prev.y;
        
        // First control point
        cp1x = current.x + dx / 4;
        cp1y = current.y + dy / 4;
        
        // Second control point
        cp2x = next.x - dx / 4;
        cp2y = next.y - dy / 4;
      }
      
      // Draw the bezier curve segment
      context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
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
};