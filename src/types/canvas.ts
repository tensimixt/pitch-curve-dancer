export interface Point {
  x: number;
  y: number;
}

export interface ControlPoint {
  x: number;      // Position relative to note start (in pixels)
  y: number;      // Pitch offset in cents
  connected: boolean;  // Whether this point is connected to another note
}

export interface Note {
  id: string;
  startTime: number;  // X position in pixels
  duration: number;   // Width in pixels
  pitch: number;      // Y position (note number)
  lyric: string;
  controlPoints: ControlPoint[];  // Array of control points relative to note
}