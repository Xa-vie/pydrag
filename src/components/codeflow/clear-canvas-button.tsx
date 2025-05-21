'use client';

import { useState, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Panel } from '@xyflow/react';

interface ClearCanvasButtonProps {
  clearCanvas: () => void;
}

export default function ClearCanvasButton({ clearCanvas }: ClearCanvasButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClearCanvas = useCallback(() => {
    clearCanvas();
    setIsDialogOpen(false);
  }, [clearCanvas]);

  return (
    <Panel position="top-left" className="mt-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>  
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="bg-destructive text-destructive-foreground font-medium backdrop-blur-sm rounded-md shadow-lg border-2 border-destructive/30 flex items-center gap-2 hover:bg-destructive/90 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear Canvas</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-2">
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Canvas</AlertDialogTitle>
                  <AlertDialogDescription className="text-foreground/80">
                    Are you sure you want to clear the canvas? This will remove all nodes and edges. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-2">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearCanvas} className="bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 border-2 border-destructive/30">
                    Clear Canvas
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="border-2">
            <p className="font-medium">Clear all nodes and edges from the canvas</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Panel>
  );
} 