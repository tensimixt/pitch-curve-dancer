export interface Point {
  x: number;
  y: number;
}

export interface CanvasContextProps {
  context: CanvasRenderingContext2D | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}