import React, { useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCanvas } from '@/hooks/useCanvas';
import { drawCurve, drawGrid, drawNotes, snapToGrid, getMinNoteWidth } from '@/utils/curveUtils';
import UndoButton from './UndoButton';
import { usePointsHistory } from '@/hooks/usePointsHistory';
import { usePointInteractions } from '@/hooks/usePointInteractions';
import { useNotes } from '@/hooks/useNotes';
import { Note, Point } from '@/types/canvas';

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
    isResizing,
    resizingNote,
    resizeStartX,
    historyIndex: notesHistoryIndex,
    setDrawStart,
    setIsDrawing,
    addNote,
    updateNote,
    selectNote,
    startDragging,
    stopDragging,
    startResizing,
    stopResizing,
    handleUndo: handleNotesUndo
  } = useNotes();

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isPointNearCurve,
  } = usePointInteractions({
    points,
    setPoints,
    addToHistory,
    canvasRef,
  });

  const isNoteResizeHandle = (x: number, note: Note) => {
    const handleWidth = 10;
    return x >= (note.startTime + note.duration - handleWidth) && 
           x <= (note.startTime + note.duration);
  };

  const handleNoteMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const pos: Point = { x, y };
    const { isNear } = isPointNearCurve(pos);

    if (isNear) {
      // If clicking near a curve, handle it with the point interactions
      handleMouseDown(e.nativeEvent);
      return;
    }
    
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
      if (isNoteResizeHandle(x, clickedNote)) {
        startResizing(clickedNote.id, x);
      } else {
        const offsetX = x - clickedNote.startTime;
        const offsetY = y - (canvasRef.current.height - (clickedNote.pitch * 25));
        startDragging(clickedNote.id, offsetX, offsetY);
      }
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

    if (isResizing && resizingNote && resizeStartX !== null) {
      const note = notes.find(n => n.id === resizingNote);
      if (note) {
        const newDuration = Math.max(30, x - note.startTime); // Changed from 50 to 30
        updateNote(resizingNote, { duration: newDuration });
      }
    } else if (isDragging && draggedNote) {
      const noteHeight = 25;
      const newX = x - dragOffset.x;
      const newPitch = Math.floor((canvasRef.current.height - (y - dragOffset.y)) / noteHeight);
      
      updateNote(draggedNote, {
        startTime: newX,
        pitch: Math.max(0, Math.min(43, newPitch))
      });
    } else if (isDrawing && drawStart) {
      const currentX = x;
      
      // Clear and redraw
      drawGrid(context, canvasRef.current.width, canvasRef.current.height);
      drawCurve(context, points, canvasRef.current.width, canvasRef.current.height);
      drawNotes(context, notes);
      
      // Draw preview rectangle
      const width = currentX - drawStart.x;
      const height = 25;
      
      context.fillStyle = 'rgba(0, 255, 136, 0.5)';
      context.fillRect(drawStart.x, drawStart.y - (height / 2), width, height);
    }

    // Update cursor based on hover state
    const hoveredNote = notes.find(note => {
      const noteHeight = 25;
      const noteY = canvasRef.current!.height - (note.pitch * noteHeight);
      return (
        x >= note.startTime &&
        x <= note.startTime + note.duration &&
        y >= noteY - (noteHeight / 2) &&
        y <= noteY + (noteHeight / 2)
      );
    });

    if (hoveredNote && isNoteResizeHandle(x, hoveredNote)) {
      canvasRef.current.style.cursor = 'ew-resize';
    } else if (hoveredNote) {
      canvasRef.current.style.cursor = 'move';
    } else {
      canvasRef.current.style.cursor = 'default';
    }
  };

  const handleNoteMouseUp = (e: React.MouseEvent) => {
    if (isResizing) {
      stopResizing();
    } else if (isDragging) {
      stopDragging();
    } else if (isDrawing && drawStart && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      
      const noteHeight = 25;
      const snapY = Math.round(drawStart.y / noteHeight) * noteHeight;
      const pitch = Math.floor((canvasRef.current.height - snapY) / noteHeight);
      
      // Snap note width to grid and ensure minimum width
      const width = Math.max(
        getMinNoteWidth(),
        snapToGrid(endX - drawStart.x)
      );

      const newNote: Note = {
        id: Date.now().toString(),
        startTime: snapToGrid(drawStart.x),
        duration: width,
        pitch,
        lyric: 'a',
        controlPoints: [
          { x: 0, y: 0, connected: false },  // Start point
          { x: width, y: 0, connected: false }  // End point
        ]
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
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
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