import { useState, useRef, useEffect, useMemo } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { fDate } from "@/utils/format-time";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export function EditableCellText({
  value,
  onSave,
  type = "text",
  required,
  children,
  inputProps = {},
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isError, setIsError] = useState(false);
  const inputRef = useRef(null);

  // auto focus saat edit dimulai
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (draft !== value) {
      onSave(draft); // kirim nilai baru ke parent
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (required && draft.trim() === "") {
        setIsError(true);
        return;
      }

      setIsEditing(false);
      setIsError(false);

      if (draft !== value) {
        onSave(draft);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setDraft(value);
      setIsEditing(false);
      setIsError(false);
    }
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="w-full cursor-pointer hover:bg-primary/10 py-1 rounded transition-colors"
    >
      {isEditing ? (
        <div className="px-1">
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (required) setIsError(e.target.value.trim() === "");
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`h-6 text-xs focus:text-xs min-w-40`}
            required
            type={type}
            {...inputProps}
          />
          {isError && (
            <p className="text-[10px] text-red-600 mt-1">
              This field is required.
            </p>
          )}
        </div>
      ) : children ? (
        children
      ) : (
        <span className="text-xs truncate block">{value || "-"}</span>
      )}
    </div>
  );
}

export function EditableCellSelect({ value, onSave, options = [], children }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isEditing && triggerRef.current) {
      // auto-focus pakai timeout kecil agar UI sempat render
      setTimeout(() => {
        triggerRef.current?.focus();
      }, 50);
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (newValue) => {
    setDraft(newValue);
    setIsEditing(false);
    if (newValue !== value) {
      onSave(newValue);
    }
  };

  const currentLabel =
    options.find((opt) => opt.value === value)?.label || value || "-";

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="w-full cursor-pointer hover:bg-primary/10 py-1 rounded transition-colors"
    >
      {isEditing ? (
        <Select value={draft} onValueChange={handleChange}>
          <SelectTrigger
            ref={triggerRef}
            className="max-h-[25px] w-full text-xs px-2 border border-primary/40 rounded focus:ring-1 focus:ring-primary"
          >
            <SelectValue placeholder="Select..." className="text-xs" />
          </SelectTrigger>
          <SelectContent className="text-xs max-h-[200px] overflow-y-auto selection:text-xs">
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : children ? (
        children
      ) : (
        <span className="text-xs truncate">{currentLabel}</span>
      )}
    </div>
  );
}

export function EditableCellMultiSelectUsers({
  value = [],
  onSave,
  options = [],
  placeholder = "Select users",
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draft, setDraft] = useState(value || []);
  const [search, setSearch] = useState("");

  // buka dialog (copy value ke draft)
  const handleDoubleClick = () => {
    setDraft(value || []);
    setIsDialogOpen(true);
  };

  const toggleUser = (val) => {
    setDraft((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const handleSave = () => {
    onSave(draft);
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setDraft(value);
  };

  // 🔍 Filter user by search
  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return options
      .filter(({ label, email }) =>
        [label, email].some((v) => v.toLowerCase().includes(normalized))
      )
      .sort((a, b) => a.label.localeCompare(b.label)); // 🔤 sort by label A–Z
  }, [search, options]);

  // 🧍‍♀️ Selected users display
  const selectedUsers = value
    .map((v) => options.find((opt) => opt.value === v))
    .filter(Boolean);

  const visibleUsers = selectedUsers.slice(0, 3);
  const extraCount = selectedUsers.length - visibleUsers.length;

  return (
    <>
      {/* 📋 Display mode */}
      <div
        onDoubleClick={handleDoubleClick}
        className="w-full cursor-pointer hover:bg-primary/10  py-1 rounded transition-colors"
      >
        {selectedUsers.length > 0 ? (
          <div className="flex items-center -space-x-2">
            {visibleUsers.map(({ label, avatar, value }) => (
              <Avatar
                key={value}
                className="size-6 border-2 border-background"
                data-slot="avatar"
              >
                {avatar ? (
                  <AvatarImage src={avatar} alt={label} />
                ) : (
                  <AvatarFallback>{label.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
            ))}

            {extraCount > 0 && (
              <div className="size-6 flex items-center justify-center text-[10px] rounded-full bg-primary/10 text-primary border border-primary/20">
                +{extraCount}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{placeholder}</span>
        )}
      </div>

      {/* 🧑‍💼 Dialog selector */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-2 gap-2">
            <DialogTitle className="text-base font-semibold">
              Assign Users
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Choose one or more users to assign to this task.
            </DialogDescription>
          </DialogHeader>

          {/* 🔍 Search */}
          <div className="border-b border-t flex items-center pl-6">
            <Search className="size-4 text-muted-foreground" />
            <Input
              placeholder="Search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:border-none"
            />
          </div>

          {/* 👥 User list */}
          <div className="max-h-[300px] overflow-y-auto px-2 py-1">
            {filtered.map((user) => (
              <label
                key={user.value}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors",
                  draft.includes(user.value) ? "bg-muted" : "hover:bg-muted/60"
                )}
              >
                <Checkbox
                  checked={draft.includes(user.value)}
                  onCheckedChange={() => toggleUser(user.value)}
                />
                <Avatar className="size-7">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.label} />
                  ) : (
                    <AvatarFallback>{user.label.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col text-xs">
                  <span className="font-medium text-foreground">
                    {user.label}
                  </span>
                  {user.email && (
                    <span className="text-muted-foreground text-[11px]">
                      {user.email}
                    </span>
                  )}
                </div>
              </label>
            ))}

            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No users found.
              </p>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="flex items-center !justify-between px-6 border-t py-3 w-full">
            <p className="text-xs text-muted-foreground text-start">
              {draft.length} user{draft.length !== 1 && "s"} selected
            </p>
            <Button
              onClick={handleSave}
              size="sm"
              // disabled={draft.length === 0}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EditableCellDate({
  value,
  onSave,
  placeholder = "Select date",
  maxDate,
  minDate,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState(value ? new Date(value) : null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isEditing && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSelect = (selectedDate) => {
    if (!selectedDate) return;

    // ✅ Validation min & max date
    if (minDate && new Date(selectedDate) < new Date(minDate)) {
      toast.error("Selected date cannot be earlier than start date!");
      return;
    }
    if (maxDate && new Date(selectedDate) > new Date(maxDate)) {
      toast.error("Selected date cannot be later than expected completion!");
      return;
    }

    setDate(selectedDate);
    setIsEditing(false);
    onSave(selectedDate.toISOString());
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="w-full cursor-pointer hover:bg-primary/10 py-1 rounded transition-colors"
    >
      {isEditing ? (
        <Popover open={isEditing} onOpenChange={setIsEditing}>
          <PopoverTrigger asChild>
            <Button
              ref={triggerRef}
              variant="outline"
              size="sm"
              className={cn(
                "w-full justify-start text-left font-normal h-[30px] text-xs",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-3 w-3" />
              {date ? fDate(date) : <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="p-0 w-auto">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              initialFocus
            />
            <div className="flex justify-end gap-2 p-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <span className="text-xs truncate">{date ? fDate(date) : "-"}</span>
      )}
    </div>
  );
}
