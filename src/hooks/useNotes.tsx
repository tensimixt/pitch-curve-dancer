import { useState } from 'react';
import { Note } from '@/types/canvas';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesHistory, setNotesHistory] = useState<Note[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizingNote, setResizingNote] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState<number | null>(null);

  const addToHistory = (newNotes: Note[]) => {
    // Remove any future history if we're not at the latest state
    const newHistory = notesHistory.slice(0, historyIndex + 1);
    // Add the new state
    newHistory.push([...newNotes]);
    setNotesHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    console.log('Added to history:', newHistory);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      console.log('Undoing to history index:', newIndex);
      console.log('History state at index:', notesHistory[newIndex]);
      
      // Clear any active interactions first
      setSelectedNote(null);
      setIsDragging(false);
      setDraggedNote(null);
      setIsResizing(false);
      setResizingNote(null);
      setResizeStartX(null);
      setIsDrawing(false);
      setDrawStart(null);
      
      // Update the history index and notes
      setHistoryIndex(newIndex);
      setNotes([...notesHistory[newIndex]]);
    }
  };

  const addNote = (note: Note) => {
    const newNotes = [...notes, note];
    setNotes(newNotes);
    addToHistory(newNotes);
  };

  const updateNote = (noteId: string, updates: Partial<Note>) => {
    const newNotes = notes.map(note => 
      note.id === noteId ? { ...note, ...updates } : note
    );
    setNotes(newNotes);
    addToHistory(newNotes);
  };

  const deleteNote = (noteId: string) => {
    const newNotes = notes.filter(note => note.id !== noteId);
    setNotes(newNotes);
    addToHistory(newNotes);
  };

  const selectNote = (noteId: string | null) => {
    setSelectedNote(noteId);
  };

  const startDragging = (noteId: string, offsetX: number, offsetY: number) => {
    setIsDragging(true);
    setDraggedNote(noteId);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const stopDragging = () => {
    setIsDragging(false);
    setDraggedNote(null);
  };

  const startResizing = (noteId: string, startX: number) => {
    setIsResizing(true);
    setResizingNote(noteId);
    setResizeStartX(startX);
  };

  const stopResizing = () => {
    setIsResizing(false);
    setResizingNote(null);
    setResizeStartX(null);
  };

  return {
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
    historyIndex,
    setDrawStart,
    setIsDrawing,
    addNote,
    updateNote,
    deleteNote,
    selectNote,
    startDragging,
    stopDragging,
    startResizing,
    stopResizing,
    handleUndo
  };
};