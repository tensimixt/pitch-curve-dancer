import React, { useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCanvas } from '@/hooks/useCanvas';
import { drawCurve, drawGrid, drawNotes } from '@/utils/curveUtils';
import UndoButton from './UndoButton';
import { usePointsHistory } from '@/hooks/usePointsHistory';
import { usePointInteractions } from '@/hooks/usePointInteractions';
import { useNotes } from '@/hooks/useNotes';
import { Note } from '@/types/canvas';

const PitchBend = () => {
  const { canvasRef, context } = useCanvas();
  const {
    points,
    setPoints,
    historyIndex: pointsHistoryIndex,
    handleUndo: handlePointsUndo,
    addToHistory,
  } = usePointsHistory();

  const {
    notes,
    selectedNote,
    isDrawing,
    drawStart,
    isDragging,
    draggedNote,
    dragOffset,
    historyIndex: notesHistoryIndex,
    setDrawStart,
    setIsDrawing,
    addNote,
    updateNote,
    selectNote,
    startDragging,
    stopDragging,
    handleUndo: handleNotesUndo
  } = useNotes();

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = usePointInteractions({
    points,
    setPoints,
    addToHistory,
    canvasRef,
  });

  const handleNoteMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on an existing note
    const clickedNote = notes.find(note => {
      const noteHeight = 25;
      const noteY = canvasRef.current!.height - (note.pitch * noteHeight);
      return (
        x >= note.startTime &&
        x <= note.startTime + note.duration &&
        y >= noteY - (noteHeight / 2) &&
        y <= noteY + (noteHeight / 2)
      );
    });

    if (clickedNote) {
      const offsetX = x - clickedNote.startTime;
      const offsetY = y - (canvasRef.current.height - (clickedNote.pitch * 25));
      startDragging(clickedNote.id, offsetX, offsetY);
      selectNote(clickedNote.id);
    } else {
      setDrawStart({ x, y });
      setIsDrawing(true);
    }
  };

  const handleNoteMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current || !context) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && draggedNote) {
      const noteHeight = 25;
      const newX = x - dragOffset.x;
      const newPitch = Math.floor((canvasRef.current.height - (y - dragOffset.y)) / noteHeight);
      
      updateNote(draggedNote, {
        startTime: newX,
        pitch: Math.max(0, Math.min(43, newPitch)) // Clamp pitch between 0 and 43
      });
    } else if (isDrawing && drawStart) {
      const currentX = x;
      
      // Clear and redraw
      drawGrid(context, canvasRef.current.width, canvasRef.current.height);
      drawCurve(context, points, canvasRef.current.width, canvasRef.current.height);
      drawNotes(context, notes);
      
      // Draw preview rectangle
      const width = currentX - drawStart.x;
      const height = 25; // One note height
      
      context.fillStyle = 'rgba(0, 255, 136, 0.5)';
      context.fillRect(drawStart.x, drawStart.y - (height / 2), width, height);
    }
  };

  const handleNoteMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      stopDragging();
    } else if (isDrawing && drawStart && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      
      // Calculate note properties
      const noteHeight = 25;
      const snapY = Math.round(drawStart.y / noteHeight) * noteHeight;
      const pitch = Math.floor((canvasRef.current.height - snapY) / noteHeight);
      
      // Set a larger default note duration (200 pixels instead of endX - drawStart.x)
      const defaultDuration = 200;
      const duration = Math.max(defaultDuration, endX - drawStart.x);

      const newNote: Note = {
        id: Date.now().toString(),
        startTime: drawStart.x,
        duration,
        pitch,
        lyric: 'a'
      };

      addNote(newNote);
      setIsDrawing(false);
      setDrawStart(null);
    }
  };

  useEffect(() => {
    if (!context || !canvasRef.current) return;
    
    drawGrid(context, canvasRef.current.width, canvasRef.current.height);
    drawCurve(context, points, canvasRef.current.width, canvasRef.current.height);
    drawNotes(context, notes);
  }, [points, notes, context]);

  const handleUndoClick = () => {
    if (notesHistoryIndex > 0) {
      handleNotesUndo();
    } else {
      handlePointsUndo();
    }
  };

  // Generate piano keys with note names
  const generateNoteNames = () => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const startOctave = 6;
    const totalKeys = 44;
    
    let currentOctave = startOctave;
    let noteIndex = 0;
    const pianoKeys = [];
    
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

  const pianoKeys = generateNoteNames();

  return (
    <div className="relative h-[550px] w-full rounded-md border">
      <ScrollArea className="h-full" orientation="horizontal">
        <div className="flex h-[1100px] w-[10000px] relative">
          {/* Fixed piano keys column */}
          <div className="sticky left-0 w-16 flex-shrink-0 bg-gray-800 z-50">
            {pianoKeys.map(({ note, isBlackKey }, i) => (
              <div 
                key={i} 
                className={`relative h-[25px] border-b border-gray-700 flex items-center ${
                  isBlackKey ? 'bg-gray-900' : 'bg-gray-100'
                }`}
              >
                <div className={`w-full h-full flex items-center justify-center text-xs ${
                  isBlackKey ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {note}
                </div>
                {isBlackKey && (
                  <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gray-900 border-l border-gray-700" />
                )}
              </div>
            ))}
          </div>

          {/* Canvas area */}
          <div className="relative flex-grow">
            <canvas 
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full rounded-lg bg-gray-900"
              onMouseDown={handleNoteMouseDown}
              onMouseMove={handleNoteMouseMove}
              onMouseUp={handleNoteMouseUp}
              onMouseLeave={handleNoteMouseUp}
            />
          </div>
        </div>
      </ScrollArea>
      <UndoButton 
        onUndo={handleUndoClick} 
        disabled={pointsHistoryIndex === 0 && notesHistoryIndex === 0} 
      />
    </div>
  );
};

export default PitchBend;
