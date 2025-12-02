import { useState, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MessageSquare, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fDateTime } from "@/utils/format-time";

const CURRENT_USER_ID = "user-1";

const DUMMY_COMMENTS = [
  {
    id: "1",
    content: "Hey, apakah task ini sudah selesai?",
    created: new Date("2024-10-21T08:00:00"),
    user: {
      id: "user-2",
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
  },
  {
    id: "2",
    content: "Belum nih, masih ada beberapa yang perlu di review",
    created: new Date("2024-10-21T08:05:00"),
    user: {
      id: CURRENT_USER_ID,
      name: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
    },
  },
  {
    id: "3",
    content: "Ada beberapa bug yang perlu diperbaiki dulu",
    created: new Date("2024-10-21T08:06:00"),
    user: {
      id: CURRENT_USER_ID,
      name: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
    },
  },
  {
    id: "4",
    content: "Oke, kalo gitu aku bantu review ya",
    created: new Date("2024-10-21T08:10:00"),
    user: {
      id: "user-2",
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
  },
  {
    id: "5",
    content: "Thanks! 🙏",
    created: new Date("2024-10-21T08:11:00"),
    user: {
      id: "user-2",
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
  },
  {
    id: "6",
    content: "Aku lihat ada issue di bagian form validation",
    created: new Date("2024-10-21T09:00:00"),
    user: {
      id: "user-3",
      name: "Mike Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    },
  },
  {
    id: "7",
    content: "Bisa dijelaskan lebih detail?",
    created: new Date("2024-10-21T09:05:00"),
    user: {
      id: CURRENT_USER_ID,
      name: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
    },
  },
  {
    id: "8",
    content: "Email validation nya belum handle special characters",
    created: new Date("2024-10-21T09:06:00"),
    user: {
      id: "user-3",
      name: "Mike Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    },
  },
  {
    id: "9",
    content: "Dan juga phone number format masih hardcoded untuk ID",
    created: new Date("2024-10-21T09:07:00"),
    user: {
      id: "user-3",
      name: "Mike Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    },
  },
  {
    id: "10",
    content: "Oke noted, akan aku fix hari ini",
    created: new Date("2024-10-21T09:15:00"),
    user: {
      id: CURRENT_USER_ID,
      name: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
    },
  },
];

const groupComments = (comments) => {
  const groups = [];
  let currentGroup = null;

  comments.forEach((comment) => {
    if (!currentGroup || currentGroup.userId !== comment.user.id) {
      currentGroup = {
        userId: comment.user.id,
        user: comment.user,
        comments: [comment],
      };
      groups.push(currentGroup);
    } else {
      currentGroup.comments.push(comment);
    }
  });

  return groups;
};

export default function DrawerComment({ task }) {
  const { name } = task;

  // state
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState(DUMMY_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const scrollRef = useRef(null);

  const groupedComments = groupComments(comments);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments, open]);

  const handleSendComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      content: newComment,
      created: new Date(),
      user: {
        id: CURRENT_USER_ID,
        name: "You",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      },
    };

    setComments([...comments, comment]);
    setNewComment("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className="relative flex items-center justify-center w-8 h-8 cursor-pointer group">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
            <MessageSquare className="w-3.5 h-3.5 text-foreground group-hover:text-primary" />
          </div>

          {/* 🔵 Badge notification */}
          <div className="absolute -top-1 -right-2 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary text-[6px] text-background font-medium shadow-sm">
            {DUMMY_COMMENTS.length < 10 ? DUMMY_COMMENTS.length : "9+"}
          </div>
        </div>
      </SheetTrigger>

      <SheetContent className="flex flex-col p-0 w-full sm:max-w-md">
        <SheetHeader className="px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SheetTitle className="text-base font-semibold">{name}</SheetTitle>
          <SheetDescription>
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea ref={scrollRef} className="px-4 flex-1 overflow-y-auto">
          <div className="space-y-4">
            {groupedComments.map((group, groupIndex) => {
              const isCurrentUser = group.userId === CURRENT_USER_ID;

              return (
                <div
                  key={groupIndex}
                  className={`flex gap-2 ${
                    isCurrentUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div className="flex-shrink-0 self-end">
                    <Avatar className="w-7 h-7 border-2 border-background">
                      <AvatarImage
                        src={group.user.avatar}
                        alt={group.user.name}
                      />
                      <AvatarFallback className="text-xs">
                        {group.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div
                    className={`flex flex-col gap-0.5 ${
                      isCurrentUser ? "items-end" : "items-start"
                    } max-w-[75%]`}
                  >
                    <span className="text-[11px] font-medium text-muted-foreground px-2 mb-0.5">
                      {group.user.name}
                    </span>

                    {group.comments.map((comment, commentIndex) => (
                      <div key={comment.id} className="group/msg">
                        <div
                          className={`px-3 py-2 rounded-2xl shadow-sm ${
                            isCurrentUser
                              ? "bg-blue-600 text-white rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          } ${
                            commentIndex === 0 && isCurrentUser
                              ? "rounded-tr-md"
                              : ""
                          } ${
                            commentIndex === 0 && !isCurrentUser
                              ? "rounded-tl-md"
                              : ""
                          }`}
                        >
                          <p className="text-[13px] leading-relaxed break-words">
                            {comment.content}
                          </p>
                        </div>

                        {commentIndex === group.comments.length - 1 && (
                          <span
                            className={`text-[9px] text-muted-foreground mt-0.5 block ${
                              isCurrentUser ? "text-right" : "text-left"
                            }`}
                          >
                            {fDateTime(comment.created)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <SheetFooter className="p-0 m-0">
          <div className="py-3 px-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Type a message..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[42px] max-h-32 resize-none pr-3 py-2.5 text-sm rounded-xl border-muted-foreground/20 focus-visible:ring-1"
                  rows={1}
                />
              </div>
              <Button
                size="icon"
                onClick={handleSendComment}
                disabled={!newComment.trim()}
                className="rounded-xl h-[42px] w-[42px] flex-shrink-0 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
