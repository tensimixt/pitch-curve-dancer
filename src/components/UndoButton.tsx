import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo } from 'lucide-react';

interface UndoButtonProps {
  onUndo: () => void;
  disabled: boolean;
}

const UndoButton: React.FC<UndoButtonProps> = ({ onUndo, disabled }) => {
  return (
    <Button
      onClick={onUndo}
      className="fixed top-4 right-4 z-50"
      variant="secondary"
      disabled={disabled}
    >
      <Undo className="w-4 h-4 mr-2" />
      Undo
    </Button>
  );
};

export default UndoButton;