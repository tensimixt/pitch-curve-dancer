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

  const addToHistory = (newNotes: Note[]) => {
    const newHistory = notesHistory.slice(0, historyIndex + 1);
    newHistory.push([...newNotes]);
    setNotesHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setNotes([...notesHistory[historyIndex - 1]]);
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

  return {
    notes,
    selectedNote,
    isDrawing,
    drawStart,
    isDragging,
    draggedNote,
    dragOffset,
    historyIndex,
    setDrawStart,
    setIsDrawing,
    addNote,
    updateNote,
    deleteNote,
    selectNote,
    startDragging,
    stopDragging,
    handleUndo
  };
};