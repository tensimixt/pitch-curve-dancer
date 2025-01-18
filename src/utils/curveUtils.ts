import { Point, Note } from '@/types/canvas';

const NOTES = [
  'C6', 'B5', 'A#5', 'A5', 'G#5', 'G5', 'F#5', 'F5', 'E5', 'D#5', 'D5', 'C#5', 'C5',
  'B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4', 'C4',
  'B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3', 'E3', 'D#3', 'D3', 'C#3', 'C3'
];

// Convert pixels to relative cents (-100 to +100 range per note)
export const pixelsToCents = (pixels: number, baseY: number): number => {
  const relativeDiff = baseY - pixels;
  return (relativeDiff / 12.5) * 50; // 25 pixels per note, so 12.5 pixels = 50 cents
};

// Convert relative cents to pixels
export const centsToPixels = (cents: number, baseY: number): number => {
  return baseY - ((cents * 12.5) / 50);
};

export const drawGrid = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  // Clear canvas
  context.clearRect(0, 0, width, height);

  const noteHeight = 25; // Height per note
  
  NOTES.forEach((note, index) => {
    const y = index * noteHeight;
    
    // Draw main note line (0 cents)
    context.beginPath();
    context.strokeStyle = '#2a2a2a';
    context.lineWidth = 1;
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
    
    // Draw +50 cents line
    context.beginPath();
    context.strokeStyle = '#1a1a1a';
    context.setLineDash([2, 2]);
    context.moveTo(0, y - noteHeight/4);
    context.lineTo(width, y - noteHeight/4);
    context.stroke();
    
    // Draw -50 cents line
    context.moveTo(0, y + noteHeight/4);
    context.lineTo(width, y + noteHeight/4);
    context.stroke();
    context.setLineDash([]);
    
    // Highlight C notes
    if (note.startsWith('C')) {
      context.beginPath();
      context.strokeStyle = '#3a3a3a';
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    // Add note name and cent markers
    context.font = '10px monospace';
    context.fillStyle = '#666666';
    context.fillText(note, 5, y + 15);
    context.fillText('+100¢', 45, y - noteHeight/2 + 4);
    context.fillText('0¢', 45, y + 4);
    context.fillText('-100¢', 45, y + noteHeight/2 + 4);
  });
  
  // Draw vertical time markers
  const timeMarkerWidth = 100;
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
  context.font = '12px monospace';
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
  // Draw curve
  if (points.length > 1) {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    if (points.length === 2) {
      context.lineTo(points[1].x, points[1].y);
    } else {
      for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        
        if (i === 0) {
          const afterNext = points[i + 2];
          const controlX = next.x - (afterNext.x - curr.x) * 0.2;
          const controlY = next.y - (afterNext.y - curr.y) * 0.2;
          context.quadraticCurveTo(controlX, controlY, next.x, next.y);
        } else if (i === points.length - 2) {
          const prev = points[i - 1];
          const controlX = curr.x + (next.x - prev.x) * 0.2;
          const controlY = curr.y + (next.y - prev.y) * 0.2;
          context.quadraticCurveTo(controlX, controlY, next.x, next.y);
        } else {
          const prev = points[i - 1];
          const afterNext = points[i + 2];
          
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

    // Add relative cent values near control points
    points.forEach((point) => {
      // Find the closest note line
      const noteIndex = Math.floor(point.y / 25);
      const baseY = noteIndex * 25;
      const cents = Math.round(pixelsToCents(point.y, baseY));
      
      context.font = '10px monospace';
      context.fillStyle = '#00ff88';
      context.fillText(`${cents > 0 ? '+' : ''}${cents}¢`, point.x + 10, point.y);
    });
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

export const drawNotes = (
  context: CanvasRenderingContext2D,
  notes: Note[]
) => {
  notes.forEach(note => {
    const noteHeight = 25;
    const y = context.canvas.height - (note.pitch * noteHeight);
    
    // Draw note rectangle
    context.fillStyle = 'rgba(0, 255, 136, 0.5)';
    context.fillRect(note.startTime, y - (noteHeight / 2), note.duration, noteHeight);
    
    // Draw note border
    context.strokeStyle = 'rgba(0, 255, 136, 0.8)';
    context.lineWidth = 2;
    context.strokeRect(note.startTime, y - (noteHeight / 2), note.duration, noteHeight);
    
    // Draw lyric
    context.fillStyle = '#ffffff';
    context.font = '12px monospace';
    context.fillText(note.lyric, note.startTime + 5, y + 5);
  });
};
