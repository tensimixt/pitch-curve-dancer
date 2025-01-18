interface PianoKey {
  note: string;
  isBlackKey: boolean;
}

export const usePianoKeys = () => {
  const generateNoteNames = (): PianoKey[] => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const startOctave = 6;
    const totalKeys = 44;
    
    let currentOctave = startOctave;
    let noteIndex = 0;
    const pianoKeys: PianoKey[] = [];
    
    for (let i = 0; i < totalKeys; i++) {
      const noteName = notes[noteIndex];
      const fullNoteName = `${noteName}${currentOctave}`;
      const isBlackKey = noteName.includes('#');
      
      pianoKeys.push({ note: fullNoteName, isBlackKey });
      
      noteIndex = (noteIndex + 1) % 12;
      if (noteIndex === 0) {
        currentOctave--;
      }
    }
    
    return pianoKeys;
  };

  return generateNoteNames();
};