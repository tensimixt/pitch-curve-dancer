export interface Point {
  x: number;
  y: number;
}

export interface Vibrato {
  length: number;      // Vibrato length in milliseconds
  period: number;      // Vibrato period in milliseconds
  depth: number;       // Vibrato depth in cents
  fadeIn: number;      // Fade in time in milliseconds
  fadeOut: number;     // Fade out time in milliseconds
  phase: number;       // Initial phase (0-1)
  autoPhase: boolean;  // Auto phase adjustment
}

export interface ControlPoint {
  x: number;           // Position relative to note start (0-1)
  y: number;          // Pitch offset in cents
  shape: 'linear' | 'hermite' | 'exponential';  // Curve shape to next point
  connected: boolean;  // Whether this point is connected to another note
}

export interface Note {
  id: string;
  startTime: number;   // Start time in milliseconds
  duration: number;    // Duration in milliseconds
  pitch: number;       // Base pitch (MIDI note number)
  lyric: string;
  vibrato?: Vibrato;  // Optional vibrato settings
  controlPoints: ControlPoint[];
}