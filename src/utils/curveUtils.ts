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

const calculateHermiteCurve = (
  p0: Point,
  p1: Point,
  t: number,
  tension: number = 0.5
): Point => {
  const t2 = t * t;
  const t3 = t2 * t;
  const h1 = 2 * t3 - 3 * t2 + 1;
  const h2 = -2 * t3 + 3 * t2;
  const h3 = t3 - 2 * t2 + t;
  const h4 = t3 - t2;
  
  const tx = (p1.x - p0.x) * tension;
  const ty = (p1.y - p0.y) * tension;
  
  return {
    x: h1 * p0.x + h2 * p1.x + h3 * tx + h4 * tx,
    y: h1 * p0.y + h2 * p1.y + h3 * ty + h4 * ty
  };
};

const calculateExponentialCurve = (
  start: Point,
  end: Point,
  t: number,
  exponent: number = 2
): Point => {
  const tExp = Math.pow(t, exponent);
  return {
    x: start.x + (end.x - start.x) * t,
    y: start.y + (end.y - start.y) * tExp
  };
};

export const generateControlPoints = (notes: Note[]): Point[] => {
  const points: Point[] = [];
  
  notes.forEach(note => {
    // Convert each note's control points to absolute coordinates
    note.controlPoints.forEach(cp => {
      const absoluteX = note.startTime + (cp.x);
      const absoluteY = (note.pitch * 25) + cp.y;
      points.push({
        x: absoluteX,
        y: absoluteY
      });
    });
  });
  
  return points;
};

const drawVibratoWave = (
  context: CanvasRenderingContext2D,
  note: Note,
  height: number
) => {
  if (!note.vibrato) return;
  
  const {
    length,
    period,
    depth,
    fadeIn,
    fadeOut,
    phase
  } = note.vibrato;
  
  const startX = note.startTime + note.duration - length;
  const endX = note.startTime + note.duration;
  
  context.beginPath();
  context.moveTo(startX, height - note.pitch * NOTE_HEIGHT);
  
  for (let x = startX; x <= endX; x += 1) {
    const progress = (x - startX) / length;
    const fadeMultiplier = Math.min(
      progress * length / fadeIn,
      (1 - progress) * length / fadeOut,
      1
    );
    
    const wave = Math.sin(
      (progress * length * 2 * Math.PI / period) + (phase * 2 * Math.PI)
    );
    
    const y = height - (
      note.pitch * NOTE_HEIGHT +
      wave * depth * fadeMultiplier * (NOTE_HEIGHT / 100)
    );
    
    context.lineTo(x, y);
  }
  
  context.stroke();
};

export const drawCurve = (
  context: CanvasRenderingContext2D,
  points: Point[],
  width: number,
  height: number
) => {
  if (points.length < 2) return;

  let currentPath: Point[] = [];
  
  points.forEach((point, index) => {
    if (index === 0 || Math.abs(point.x - points[index - 1].x) > GRID_UNIT / 2) {
      if (currentPath.length > 1) {
        context.beginPath();
        context.moveTo(currentPath[0].x, height - currentPath[0].y);
        
        for (let i = 1; i < currentPath.length; i++) {
          const start = currentPath[i - 1];
          const end = currentPath[i];
          const shape = (points[i] as any).shape || 'linear';
          
          const steps = 20;
          for (let step = 1; step <= steps; step++) {
            const t = step / steps;
            let curvePoint: Point;
            
            switch (shape) {
              case 'hermite':
                curvePoint = calculateHermiteCurve(start, end, t);
                break;
              case 'exponential':
                curvePoint = calculateExponentialCurve(start, end, t);
                break;
              default:
                curvePoint = {
                  x: start.x + (end.x - start.x) * t,
                  y: start.y + (end.y - start.y) * t
                };
            }
            
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
  
  if (currentPath.length > 1) {
    context.beginPath();
    context.moveTo(currentPath[0].x, height - currentPath[0].y);
    
    for (let i = 1; i < currentPath.length; i++) {
      const start = currentPath[i - 1];
      const end = currentPath[i];
      const shape = (points[i] as any).shape || 'linear';
      
      const steps = 20;
      for (let step = 1; step <= steps; step++) {
        const t = step / steps;
        let curvePoint: Point;
        
        switch (shape) {
          case 'hermite':
            curvePoint = calculateHermiteCurve(start, end, t);
            break;
          case 'exponential':
            curvePoint = calculateExponentialCurve(start, end, t);
            break;
          default:
            curvePoint = {
              x: start.x + (end.x - start.x) * t,
              y: start.y + (end.y - start.y) * t
            };
        }
        
        context.lineTo(curvePoint.x, height - curvePoint.y);
      }
    }
    
    context.strokeStyle = '#00ff88';
    context.lineWidth = 2;
    context.stroke();
  }

  points.forEach((point) => {
    context.beginPath();
    context.arc(point.x, height - point.y, 5, 0, Math.PI * 2);
    context.fillStyle = '#ff0000';
    context.fill();
    context.strokeStyle = '#800000';
    context.lineWidth = 2;
    context.stroke();

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
  context.clearRect(0, 0, width, height);
  
  for (let y = 0; y <= height; y += NOTE_HEIGHT) {
    context.beginPath();
    context.strokeStyle = '#2a2a2a';
    context.lineWidth = 1;
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  
  const sixteenthWidth = GRID_UNIT / 4;
  const measureWidth = GRID_UNIT * 4;
  
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
    const y = context.canvas.height - ((note.pitch + 0.5) * NOTE_HEIGHT);
    
    context.fillStyle = 'rgba(0, 255, 136, 0.5)';
    context.fillRect(note.startTime, y - (NOTE_HEIGHT / 2), note.duration, NOTE_HEIGHT);
    
    context.strokeStyle = 'rgba(0, 255, 136, 0.8)';
    context.lineWidth = 2;
    context.strokeRect(note.startTime, y - (NOTE_HEIGHT / 2), note.duration, NOTE_HEIGHT);
    
    context.fillStyle = '#ffffff';
    context.font = '12px monospace';
    context.fillText(note.lyric, note.startTime + 5, y + 5);
  });
};

export const snapToGrid = (value: number): number => {
  const snapUnit = GRID_UNIT / 4;
  return Math.round(value / snapUnit) * snapUnit;
};

export const getMinNoteWidth = (): number => {
  return GRID_UNIT / 4;
};