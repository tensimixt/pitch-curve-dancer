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

    if (points.length === 2) {
      // For just 2 points, draw a straight line
      context.lineTo(points[1].x, points[1].y);
    } else {
      // For 3 or more points, create smooth curves
      for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        
        if (i === 0) {
          // First segment
          const afterNext = points[i + 2];
          const controlX = next.x - (afterNext.x - curr.x) * 0.2;
          const controlY = next.y - (afterNext.y - curr.y) * 0.2;
          context.quadraticCurveTo(controlX, controlY, next.x, next.y);
        } else if (i === points.length - 2) {
          // Last segment
          const prev = points[i - 1];
          const controlX = curr.x + (next.x - prev.x) * 0.2;
          const controlY = curr.y + (next.y - prev.y) * 0.2;
          context.quadraticCurveTo(controlX, controlY, next.x, next.y);
        } else {
          // Middle segments
          const prev = points[i - 1];
          const afterNext = points[i + 2];
          
          // Calculate control points based on surrounding points
          const controlX1 = curr.x + (next.x - prev.x) * 0.2;
          const controlY1 = curr.y + (next.y - prev.y) * 0.2;
          const controlX2 = next.x - (afterNext.x - curr.x) * 0.2;
          const controlY2 = next.y - (afterNext.y - curr.y) * 0.2;
          
          context.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, next.x, next.y);
        }
      }
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