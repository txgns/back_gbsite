
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

interface PolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: React.ReactNode;
}

const PolicyModal = ({ open, onOpenChange, title, content }: PolicyModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-robotics-black-lighter border-robotics-black-light text-white max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gradient">{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-4 max-h-[60vh] pr-4">
          <div className="text-white/80 space-y-4">
            {content}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyModal;
