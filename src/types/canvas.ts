export interface Point {
  x: number;
  y: number;
}

export interface ControlPoint {
  x: number;      // Position relative to note start
  y: number;      // Pitch offset in cents
  connected: boolean;  // Whether this point is connected to another note
}

export interface Note {
  id: string;
  startTime: number;  // X position in pixels
  duration: number;   // Width in pixels
  pitch: number;      // Y position (note number)
  lyric: string;
  controlPoints?: ControlPoint[];  // Optional array of control points
}

export interface CanvasContextProps {
  context: CanvasRenderingContext2D | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}