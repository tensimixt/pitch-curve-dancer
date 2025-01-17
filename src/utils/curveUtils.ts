import { Point } from '@/types/canvas';

const NOTES = [
  'C7', 'B6', 'A#6', 'A6', 'G#6', 'G6', 'F#6', 'F6', 'E6', 'D#6', 'D6', 'C#6', 'C6',
  'B5', 'A#5', 'A5', 'G#5', 'G5', 'F#5', 'F5', 'E5', 'D#5', 'D5', 'C#5', 'C5',
  'B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4', 'C4',
  'B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3', 'E3', 'D#3', 'D3', 'C#3', 'C3'
];

const isBlackKey = (note: string) => note.includes('#');

export const drawGrid = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  // Clear canvas
  context.clearRect(0, 0, width, height);

  // Draw horizontal lines for each note
  const noteHeight = 25; // Fixed height per note
  
  NOTES.forEach((note, index) => {
    const y = index * noteHeight;
    
    // Fill key background color for the entire row
    context.fillStyle = isBlackKey(note) ? '#222222' : '#ffffff';
    context.fillRect(0, y, 50, noteHeight);
    
    context.beginPath();
    context.strokeStyle = '#2a2a2a';
    context.lineWidth = 1;
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
    
    // Draw note label with contrasting color
    context.fillStyle = isBlackKey(note) ? '#ffffff' : '#666666';
    context.font = '12px monospace';
    context.fillText(note, 5, y + 15);

    // Highlight C notes with a slightly brighter line
    if (note.startsWith('C')) {
      context.beginPath();
      context.strokeStyle = '#3a3a3a';
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
  });
  
  // Draw vertical time markers
  const timeMarkerWidth = 100; // pixels per time unit
  const totalTimeMarkers = Math.ceil(width / timeMarkerWidth);
  
  context.beginPath();
  context.strokeStyle = '#2a2a2a';
  
  for (let i = 0; i <= totalTimeMarkers; i++) {
    const x = i * timeMarkerWidth;
    context.moveTo(x, 0);
    context.lineTo(x, height);
  }
  
  context.stroke();
  
  // Add time marker labels
  for (let i = 0; i <= totalTimeMarkers; i++) {
    const x = i * timeMarkerWidth;
    context.fillStyle = '#666666';
    context.fillText(`${i}s`, x + 5, 15);
  }
};

export const drawCurve = (
  context: CanvasRenderingContext2D,
  points: Point[],
  canvasWidth: number,
  canvasHeight: number
) => {
  // Draw grid first
  drawGrid(context, canvasWidth, canvasHeight);

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

    context.strokeStyle = '#00ff88';
    context.lineWidth = 2;
    context.stroke();
  }

  // Draw points
  points.forEach((point) => {
    context.beginPath();
    context.arc(point.x, point.y, 5, 0, Math.PI * 2);
    context.fillStyle = '#00ff88';
    context.fill();
    context.strokeStyle = '#003311';
    context.lineWidth = 2;
    context.stroke();
  });
};