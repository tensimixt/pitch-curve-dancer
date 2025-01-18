export interface Point {
  x: number;
  y: number;
}

export interface Note {
  id: string;
  startTime: number;  // X position in pixels
  duration: number;   // Width in pixels
  pitch: number;      // Y position (note number)
  lyric: string;
}

export interface CanvasContextProps {
  context: CanvasRenderingContext2D | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}