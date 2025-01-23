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
  
  sortedNotes.forEach((note, index) => {
    // Calculate base Y position for this note
    const noteY = note.pitch * NOTE_HEIGHT;
    
    // Ensure note has control points
    if (!note.controlPoints || note.controlPoints.length === 0) {
      note.controlPoints = [
        { x: 0, y: 0, connected: false },  // Start point
        { x: note.duration, y: 0, connected: false }  // End point
      ];
    }
    
    // Check if this note connects to the next note
    if (index < sortedNotes.length - 1) {
      const nextNote = sortedNotes[index + 1];
      const isAdjacent = Math.abs(note.startTime + note.duration - nextNote.startTime) < GRID_UNIT / 4;
      
      if (isAdjacent) {
        // Mark end point of current note and start point of next note as connected
        note.controlPoints[note.controlPoints.length - 1].connected = true;
        if (!nextNote.controlPoints || nextNote.controlPoints.length === 0) {
          nextNote.controlPoints = [
            { x: 0, y: 0, connected: true },
            { x: nextNote.duration, y: 0, connected: false }
          ];
        } else {
          nextNote.controlPoints[0].connected = true;
        }
      }
    }
    
    // Only add points if they're connected to another note or if they're the first/last points of a note
    note.controlPoints.forEach((cp, cpIndex) => {
      const isFirstPoint = cpIndex === 0;
      const isLastPoint = cpIndex === note.controlPoints.length - 1;
      
      if (isFirstPoint || isLastPoint || cp.connected) {
        points.push({
          x: note.startTime + cp.x,
          y: noteY + (cp.y * NOTE_HEIGHT / 100)  // Convert cents to pixels
        });
      }
    });
  });

  return points;
};

const calculateSCurvePoint = (
  start: Point,
  end: Point,
  t: number
): Point => {
  // Use a sigmoid function to create the S-curve
  // This creates a smooth transition that starts slow, accelerates in the middle, and slows down at the end
  const sigmoid = (x: number) => 1 / (1 + Math.exp(-10 * (x - 0.5)));
  
  // Apply sigmoid to t to get the curved interpolation factor
  const curvedT = sigmoid(t);
  
  return {
    x: start.x + (end.x - start.x) * t, // Keep x linear for timing
    y: start.y + (end.y - start.y) * curvedT // Apply S-curve to y (pitch)
  };
};

export const drawCurve = (
  context: CanvasRenderingContext2D,
  points: Point[],
  width: number,
  height: number
) => {
  if (points.length < 2) return;

  // Draw curves between points
  let currentPath: Point[] = [];
  
  points.forEach((point, index) => {
    if (index === 0 || Math.abs(point.x - points[index - 1].x) > GRID_UNIT / 2) {
      // Start a new path if this is the first point or if there's a gap
      if (currentPath.length > 1) {
        // Draw the previous path with S-curves
        context.beginPath();
        context.moveTo(currentPath[0].x, height - currentPath[0].y);
        
        // Draw S-curves between each pair of points
        for (let i = 1; i < currentPath.length; i++) {
          const start = currentPath[i - 1];
          const end = currentPath[i];
          
          // Use multiple points to create a smooth S-curve
          const steps = 20;
          for (let step = 1; step <= steps; step++) {
            const t = step / steps;
            const curvePoint = calculateSCurvePoint(start, end, t);
            context.lineTo(curvePoint.x, height - curvePoint.y);
          }
        }
        
        context.strokeStyle = '#00ff88';
        context.lineWidth = 2;
        context.stroke();
      }
      currentPath = [point];
    } else {
      currentPath.push(point);
    }
  });
  
  // Draw the last path if it exists
  if (currentPath.length > 1) {
    context.beginPath();
    context.moveTo(currentPath[0].x, height - currentPath[0].y);
    
    // Draw S-curves for the last path
    for (let i = 1; i < currentPath.length; i++) {
      const start = currentPath[i - 1];
      const end = currentPath[i];
      
      const steps = 20;
      for (let step = 1; step <= steps; step++) {
        const t = step / steps;
        const curvePoint = calculateSCurvePoint(start, end, t);
        context.lineTo(curvePoint.x, height - curvePoint.y);
      }
    }
    
    context.strokeStyle = '#00ff88';
    context.lineWidth = 2;
    context.stroke();
  }

  // Draw control points
  points.forEach((point) => {
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
