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
};