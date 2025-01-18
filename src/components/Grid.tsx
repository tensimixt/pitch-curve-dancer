import React from 'react';
import { drawGrid } from '@/utils/curveUtils';

interface GridProps {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
}

const Grid: React.FC<GridProps> = ({ context, width, height }) => {
  React.useEffect(() => {
    drawGrid(context, width, height);
  }, [context, width, height]);

  return null;
};

export default Grid;