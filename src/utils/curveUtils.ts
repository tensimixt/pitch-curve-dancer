import { Point, Note, ControlPoint } from '@/types/canvas';

const GRID_UNIT = 50; // Basic grid unit in pixels
const NOTE_HEIGHT = 25; // Consistent note height matching piano keys
const TICKS_PER_BEAT = 480; // Standard MIDI resolution
const PIXELS_PER_TICK = GRID_UNIT / TICKS_PER_BEAT;

// Common musical divisions (in ticks)
const DIVISIONS = {
  WHOLE: TICKS_PER_BEAT * 4,    // Whole note
  HALF: TICKS_PER_BEAT * 2,     // Half note
  QUARTER: TICKS_PER_BEAT,      // Quarter note (1 beat)
  EIGHTH: TICKS_PER_BEAT / 2,   // Eighth note
  SIXTEENTH: TICKS_PER_BEAT / 4 // Sixteenth note
};

const pixelsToCents = (pixelY: number, baseY: number): number => {
  // Calculate cents based on pixel distance from base note
  // 25 pixels = 100 cents (one semitone)
  const pixelDistance = baseY - pixelY;
  return Math.round((pixelDistance / NOTE_HEIGHT) * 100);
};

export const generateControlPoints = (notes: Note[]): Point[] => {
  const points: Point[] = [];
  
  // Sort notes by startTime to ensure proper connection order
  const sortedNotes = [...notes].sort((a, b) => a.startTime - b.startTime);
  
  sortedNotes.forEach((note, index) => {
    // Add control point for each note
    const controlPoint: Point = {
      x: note.startTime,
      y: note.pitch * NOTE_HEIGHT
    };
    points.push(controlPoint);

    // Add end point for each note
    const endPoint: Point = {
      x: note.startTime + note.duration,
      y: note.pitch * NOTE_HEIGHT
    };
    points.push(endPoint);

    // Connect to next note if it exists and is vertically aligned
    if (index < sortedNotes.length - 1) {
      const nextNote = sortedNotes[index + 1];
      const isVerticallyAligned = Math.abs(note.startTime + note.duration - nextNote.startTime) < GRID_UNIT / 4;
      
      if (isVerticallyAligned) {
        // Add control points for smooth transition
        const midPoint: Point = {
          x: (note.startTime + note.duration + nextNote.startTime) / 2,
          y: (note.pitch * NOTE_HEIGHT + nextNote.pitch * NOTE_HEIGHT) / 2
        };
        points.push(midPoint);
      }
    }
  });

  return points;
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

export const drawCurve = (
  context: CanvasRenderingContext2D,
  points: Point[],
  width: number,
  height: number
) => {
  if (points.length < 2) return;

  // Draw curve
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);

  // Snap points to grid
  const snappedPoints = points.map(point => ({
    x: Math.round(point.x / (GRID_UNIT / 4)) * (GRID_UNIT / 4),
    y: point.y
  }));

  if (snappedPoints.length === 2) {
    context.lineTo(snappedPoints[1].x, snappedPoints[1].y);
  } else {
    for (let i = 0; i < snappedPoints.length - 1; i++) {
      const curr = snappedPoints[i];
      const next = snappedPoints[i + 1];
      
      if (i === 0) {
        const afterNext = snappedPoints[i + 2];
        const controlX = next.x - (afterNext.x - curr.x) * 0.2;
        const controlY = next.y - (afterNext.y - curr.y) * 0.2;
        context.quadraticCurveTo(controlX, controlY, next.x, next.y);
      } else if (i === snappedPoints.length - 2) {
        const prev = snappedPoints[i - 1];
        const controlX = curr.x + (next.x - prev.x) * 0.2;
        const controlY = curr.y + (next.y - prev.y) * 0.2;
        context.quadraticCurveTo(controlX, controlY, next.x, next.y);
      } else {
        const prev = snappedPoints[i - 1];
        const afterNext = snappedPoints[i + 2];
        
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

  // Draw control points
  snappedPoints.forEach((point) => {
    context.beginPath();
    context.arc(point.x, point.y, 5, 0, Math.PI * 2);
    context.fillStyle = '#ff0000'; // Red control points
    context.fill();
    context.strokeStyle = '#800000'; // Darker red border
    context.lineWidth = 2;
    context.stroke();

    // Add relative cent values near control points
    const noteIndex = Math.floor(point.y / NOTE_HEIGHT);
    const baseY = noteIndex * NOTE_HEIGHT;
    const cents = pixelsToCents(point.y, baseY);
    
    context.font = '10px monospace';
    context.fillStyle = '#ff0000';
    context.fillText(`${cents > 0 ? '+' : ''}${cents}¢`, point.x + 10, point.y);
  });
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
