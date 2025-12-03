"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileIcon, Download, Trash2, CloudUpload } from "lucide-react";
import { fDateTime } from "@/utils/format-time";
import Iconify from "@/components/iconify";
import { useBoolean } from "@/hooks/use-boolean";
import { ConfirmDialog } from "@/components/dialog";

const DUMMY_ATTACHMENTS = [
  {
    id: "1",
    name: "UI_Design_Review.pdf",
    size: "2.3 MB",
    uploadedAt: new Date("2024-10-19T09:20:00"),
    uploader: {
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    url: "#",
  },
  {
    id: "2",
    name: "Bug_Report_Sprint_12.xlsx",
    size: "534 KB",
    uploadedAt: new Date("2024-10-20T14:40:00"),
    uploader: {
      name: "Mike Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    },
    url: "#",
  },
  {
    id: "3",
    name: "FormValidationFix.zip",
    size: "1.1 MB",
    uploadedAt: new Date("2024-10-21T08:05:00"),
    uploader: {
      name: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
    },
    url: "#",
  },
];

export default function DrawerAttachment({ task }) {
  const { name } = task;

  // hooks
  const openConfirmDelete = useBoolean();

  // state
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [attachments, setAttachments] = useState(DUMMY_ATTACHMENTS);

  const handleDeleteFile = (id) => {
    setAttachments((prev) => prev.filter((file) => file.id !== id));

    openConfirmDelete.onFalse();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className="relative flex items-center justify-center w-8 h-8 cursor-pointer group">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
            <Iconify
              icon="ion:attach"
              className="w-3.5 h-3.5 text-foreground group-hover:text-primary"
            />
          </div>

          {/* 🔵 Badge count */}
          {attachments.length > 0 && (
            <div className="absolute -top-1 -right-2 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary text-[6px] text-background font-medium shadow-sm">
              {attachments.length}
            </div>
          )}
        </div>
      </SheetTrigger>

      <SheetContent className="flex flex-col p-0 w-full sm:max-w-md">
        <SheetHeader className="px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SheetTitle className="text-base font-semibold">
            Attachments — {name}
          </SheetTitle>
          <SheetDescription>
            {attachments.length} {attachments.length === 1 ? "file" : "files"}{" "}
            attached
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-3">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between border rounded-xl p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-background border">
                    <FileIcon className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {file.size} · {fDateTime(file.uploadedAt)}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <Avatar className="w-5 h-5 border border-background">
                        <AvatarImage
                          src={file.uploader.avatar}
                          alt={file.uploader.name}
                        />
                        <AvatarFallback>
                          {file.uploader.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] text-muted-foreground">
                        {file.uploader.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => window.open(file.url, "_blank")}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => {
                      setSelectedFile(file);
                      openConfirmDelete.onTrue();
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <SheetFooter className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 px-4">
          <Button className="w-full" variant="outline">
            <CloudUpload className="mr-2" />
            Upload New File
          </Button>
        </SheetFooter>
      </SheetContent>

      <ConfirmDialog
        open={openConfirmDelete.value}
        onClose={openConfirmDelete.onFalse}
        title={`Delete File ${selectedFile?.name}`}
        confirmText="Delete"
        onConfirm={() => handleDeleteFile(selectedFile?.id)}
      />
    </Sheet>
  );
}
