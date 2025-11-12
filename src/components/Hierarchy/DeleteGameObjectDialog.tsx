import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { GameObjectData } from "@/types";

interface DeleteGameObjectDialogProps {
  open: boolean;
  gameObject?: GameObjectData | null;
  onClose: () => void;
  onConfirm: (deleteChildren: boolean) => void;
}

export function DeleteGameObjectDialog({
  open,
  gameObject,
  onClose,
  onConfirm,
}: DeleteGameObjectDialogProps) {
  const [deleteChildren, setDeleteChildren] = useState(true);

  if (!gameObject) return null;

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete "{gameObject.name}"?</DialogTitle>
          <DialogDescription>
            This GameObject has {gameObject.children?.length || 0} child(ren).
            What would you like to do with them?
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="deleteOption"
              checked={deleteChildren}
              onChange={() => setDeleteChildren(true)}
            />
            <span>Delete this GameObject and all its children</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="deleteOption"
              checked={!deleteChildren}
              onChange={() => setDeleteChildren(false)}
            />
            <span>
              Delete this GameObject and promote children to root level
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} className="mt-4">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm(deleteChildren);
              onClose();
            }}
            className="mt-4"
          >
            Delete
          </Button>
        </DialogFooter>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
