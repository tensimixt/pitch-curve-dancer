import { useState } from 'react';
import { Point } from '@/types/canvas';

export const usePointsHistory = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [pointsHistory, setPointsHistory] = useState<Point[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const addToHistory = (newPoints: Point[]) => {
    const newHistory = pointsHistory.slice(0, historyIndex + 1);
    newHistory.push([...newPoints]);
    setPointsHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPoints([...pointsHistory[historyIndex - 1]]);
    }
  };

  return {
    points,
    setPoints,
    pointsHistory,
    historyIndex,
    addToHistory,
    handleUndo,
  };
};