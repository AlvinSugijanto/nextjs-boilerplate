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

const ColumnActions = ({ onEdit, onDelete }) => {
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
          {onEdit && <DropdownMenuSeparator />}
          <DropdownMenuItem
            variant="destructive"
            onClick={onDelete}
            className="text-destructive"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ColumnActions;
