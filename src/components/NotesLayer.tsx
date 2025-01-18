import React from 'react';
import { Note } from '@/types/canvas';
import { drawNotes } from '@/utils/curveUtils';
import { useNotes } from '@/hooks/useNotes';

interface NotesLayerProps {
  context: CanvasRenderingContext2D;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const NotesLayer: React.FC<NotesLayerProps> = ({ context, canvasRef }) => {
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
    setDrawStart,
    setIsDrawing,
    addNote,
    updateNote,
    selectNote,
    startDragging,
    stopDragging,
    startResizing,
    stopResizing,
  } = useNotes();

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
        const newDuration = Math.max(30, x - note.startTime);
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
      context.fillStyle = 'rgba(0, 255, 136, 0.5)';
      const width = currentX - drawStart.x;
      const height = 25;
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
      
      const defaultDuration = 100;
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

  React.useEffect(() => {
    if (!context || !canvasRef.current) return;
    drawNotes(context, notes);
  }, [context, notes]);

  return {
    handleNoteMouseDown,
    handleNoteMouseMove,
    handleNoteMouseUp,
  };
};

export default NotesLayer;