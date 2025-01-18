import { useState } from 'react';
import { Note } from '@/types/canvas';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const addNote = (note: Note) => {
    setNotes(prev => [...prev, note]);
  };

  const updateNote = (noteId: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, ...updates } : note
    ));
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
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
    setDrawStart,
    setIsDrawing,
    addNote,
    updateNote,
    deleteNote,
    selectNote,
    startDragging,
    stopDragging
  };
};