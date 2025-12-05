import { Trash2Icon } from "lucide-react";
import React, { FC, useState } from "react";
import { Button } from "@/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AlertIcon = () => {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center -top-1">
      {/* Outer rings */}
      <div className="absolute w-32 h-32 rounded-full border border-Gray-200 animate-ping"></div>
      <div className="absolute w-24 h-24 rounded-full border border-Gray-200 animate-ping"></div>
      <div className="absolute w-16 h-16 rounded-full border border-Gray-200 animate-ping"></div>

      {/* Icon */}
      <div className="absolute w-14 h-14 bg-Error-100 border-8 border-Error-50 rounded-full flex items-center justify-center text-white">
        <Trash2Icon className="h-6 w-6 text-red-500" />
      </div>
    </div>
  );
};

interface DeleteAssetProps {
  children: React.ReactElement<any>;
  onDelete: () => void;
  heading?: string;
  description?: string;
}

const DeleteAsset: FC<DeleteAssetProps> = ({
  children,
  onDelete,
  heading,
  description,
}) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => setOpen(!open);
  const closeOpen = () => {
    setOpen(false);
  };

  const deleteAsset = () => {
    onDelete();
    closeOpen();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={closeOpen}>
        {React.cloneElement(children, { onClick: toggleOpen })}

        <DialogContent className="overflow-clip min-w-[544px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex gap-4 z-10">
                <AlertIcon />
                <div>
                  <div className="text-Gray-900 text-lg font-semibold max-w-[450px] mr-10">
                    {heading}
                  </div>
                  <div className="text-Gray-600 text-sm font-normal max-w-[350px] mt-1">
                    {description}
                  </div>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              <div className="flex w-full justify-end gap-3 mt-8">
                <Button
                  className="px-4 py-2 rounded-lg bg-white text-Gray-500 text-[16px] hover:text-Gray-800 border transition-all duration-300 ease-in-out border-Gray-300 hover:bg-transparent shadow-xs focus:text-Gray-800 "
                  onClick={closeOpen}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-Error-600 shadow-shadow-xs border-brand-600-orange-p-1 rounded-lg py-2 px-3 text-white text-base font-semibold hover:bg-Error-700 transition-all duration-300 ease-in-out "
                  onClick={deleteAsset}
                >
                  Delete
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteAsset;
