import { Point, Note, ControlPoint } from '@/types/canvas';

const GRID_UNIT = 50;
const NOTE_HEIGHT = 25;
const TICKS_PER_BEAT = 480;
const PIXELS_PER_TICK = GRID_UNIT / TICKS_PER_BEAT;

const DIVISIONS = {
  WHOLE: TICKS_PER_BEAT * 4,    // Whole note
  HALF: TICKS_PER_BEAT * 2,     // Half note
  QUARTER: TICKS_PER_BEAT,      // Quarter note (1 beat)
  EIGHTH: TICKS_PER_BEAT / 2,   // Eighth note
  SIXTEENTH: TICKS_PER_BEAT / 4 // Sixteenth note
};

const pixelsToCents = (pixelY: number, baseY: number): number => {
  const pixelDistance = baseY - pixelY;
  return Math.round((pixelDistance / NOTE_HEIGHT) * 100);
};

export const generateControlPoints = (notes: Note[]): Point[] => {
  const points: Point[] = [];
  const sortedNotes = [...notes].sort((a, b) => a.startTime - b.startTime);
  
  sortedNotes.forEach(note => {
    // Calculate base Y position for this note
    const noteY = note.pitch * NOTE_HEIGHT;
    
    // Convert note's relative control points to absolute positions
    note.controlPoints.forEach(cp => {
      points.push({
        x: note.startTime + cp.x,
        y: noteY + (cp.y * NOTE_HEIGHT / 100)  // Convert cents to pixels
      });
    });
  });

  return points;
};

export const drawCurve = (
  context: CanvasRenderingContext2D,
  points: Point[],
  width: number,
  height: number
) => {
  if (points.length < 2) return;

  // Draw curves for each note
  for (let i = 0; i < points.length - 1; i += 2) {
    const startPoint = points[i];
    const endPoint = points[i + 1];
    
    // Draw the curve segment
    context.beginPath();
    context.moveTo(startPoint.x, height - startPoint.y);
    context.lineTo(endPoint.x, height - endPoint.y);
    context.strokeStyle = '#00ff88';
    context.lineWidth = 2;
    context.stroke();

    // Draw control points
    [startPoint, endPoint].forEach(point => {
      context.beginPath();
      context.arc(point.x, height - point.y, 5, 0, Math.PI * 2);
      context.fillStyle = '#ff0000';
      context.fill();
      context.strokeStyle = '#800000';
      context.lineWidth = 2;
      context.stroke();

      // Add relative cent values near control points
      const noteIndex = Math.floor(point.y / NOTE_HEIGHT);
      const baseY = noteIndex * NOTE_HEIGHT;
      const cents = pixelsToCents(point.y, baseY);
      
      context.font = '10px monospace';
      context.fillStyle = '#ff0000';
      context.fillText(`${cents > 0 ? '+' : ''}${cents}¢`, point.x + 10, height - point.y);
    });
  }
};

export const drawGrid = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  // Clear canvas
  context.clearRect(0, 0, width, height);
  
  // Draw horizontal note lines
  for (let y = 0; y <= height; y += NOTE_HEIGHT) {
    context.beginPath();
    context.strokeStyle = '#2a2a2a';
    context.lineWidth = 1;
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  
  const sixteenthWidth = GRID_UNIT / 4; // Width of a sixteenth note
  const measureWidth = GRID_UNIT * 4; // Width of a full measure (4 beats)
  
  // Draw vertical beat lines and subdivisions
  for (let x = 0; x <= width; x += sixteenthWidth) {
    const isMeasureLine = x % measureWidth === 0;
    const isBeatLine = x % GRID_UNIT === 0;
    const isHalfBeatLine = x % (GRID_UNIT / 2) === 0;
    
    context.beginPath();
    context.strokeStyle = isMeasureLine ? '#4a4a4a' : (isBeatLine ? '#3a3a3a' : (isHalfBeatLine ? '#2d2d2d' : '#2a2a2a'));
    context.lineWidth = isMeasureLine ? 2.5 : (isBeatLine ? 2 : (isHalfBeatLine ? 1.5 : 1));
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
    
    // Add measure numbers (1,2,3,4,...)
    if (isMeasureLine) {
      context.font = '12px monospace';
      context.fillStyle = '#666666';
      const measureNumber = (x / measureWidth) + 1;
      context.fillText(`${measureNumber}`, x + 5, 15);
    }
  }
};

export const drawNotes = (
  context: CanvasRenderingContext2D,
  notes: Note[]
) => {
  notes.forEach(note => {
    // Calculate Y position to align perfectly with grid lines
    const y = context.canvas.height - ((note.pitch + 0.5) * NOTE_HEIGHT);
    
    // Draw note rectangle with exact height matching piano keys
    context.fillStyle = 'rgba(0, 255, 136, 0.5)';
    context.fillRect(note.startTime, y - (NOTE_HEIGHT / 2), note.duration, NOTE_HEIGHT);
    
    // Draw note border
    context.strokeStyle = 'rgba(0, 255, 136, 0.8)';
    context.lineWidth = 2;
    context.strokeRect(note.startTime, y - (NOTE_HEIGHT / 2), note.duration, NOTE_HEIGHT);
    
    // Draw lyric
    context.fillStyle = '#ffffff';
    context.font = '12px monospace';
    context.fillText(note.lyric, note.startTime + 5, y + 5);
  });
};

export const snapToGrid = (value: number): number => {
  // Snap to the nearest sixteenth note
  const snapUnit = GRID_UNIT / 4; // Sixteenth note division
  return Math.round(value / snapUnit) * snapUnit;
};

export const getMinNoteWidth = (): number => {
  // Minimum note width is one sixteenth note
  return GRID_UNIT / 4;
};
