import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/iconify";
import { ConfirmDialog } from "@/components/dialog";

export function RowProjectActions({ id, onDelete, onEdit, confirmDialog }) {
  const {
    title = "Delete this project?",
    open = false,
    onClose = () => {},
    onOpen = () => {},
    loading,
  } = confirmDialog;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-muted"
          >
            <Iconify icon="ant-design:more-outlined" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-32">
          {onEdit && <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>}
          {onEdit && onOpen && <DropdownMenuSeparator />}
          <DropdownMenuItem
            variant="destructive"
            onClick={onOpen}
            className="text-destructive"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={open}
        onClose={onClose}
        onConfirm={onDelete}
        title={title}
        description="This action will permanently remove this record. You can't undo it."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loading}
      />
    </>
  );
}
