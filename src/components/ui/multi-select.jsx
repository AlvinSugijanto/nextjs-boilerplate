"use client";

import * as React from "react";
import { CheckIcon, ChevronDown, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const sizeStyles = {
  xs: {
    button: "h-7 min-h-7 px-2 text-[10px]",
    badge: "text-[10px] px-1.5 py-0",
    icon: "w-3 h-3",
  },
  sm: {
    button: "h-8 min-h-8 px-2 text-xs",
    badge: "text-xs px-2 py-0.5",
    icon: "w-3.5 h-3.5",
  },
  md: {
    button: "h-10 min-h-10 px-3 text-sm",
    badge: "text-sm px-2.5 py-0.5",
    icon: "w-4 h-4",
  },
  lg: {
    button: "h-12 min-h-12 px-4 text-base",
    badge: "text-base px-3 py-1",
    icon: "w-5 h-5",
  },
};

export function MultiSelect({
  options,
  onValueChange,
  defaultValue = [],
  placeholder = "Select options",
  searchable = true,
  emptyText = "No results found",
  className,
  closeOnSelect = false,
  hideSelectAll = false,
  maxViewSelected = 1,
  size = "sm",
}) {
  const [selectedValues, setSelectedValues] = React.useState(defaultValue);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const isGrouped = options.length > 0 && "heading" in options[0];

  const s = sizeStyles[size] ?? sizeStyles["md"];

  const toggleOption = (value) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];

    setSelectedValues(newValues);
    onValueChange?.(newValues);
    if (closeOnSelect) setIsPopoverOpen(false);
  };

  const clearAll = () => {
    setSelectedValues([]);
    onValueChange?.([]);
  };

  const allOptions = React.useMemo(() => {
    if (isGrouped) return options.flatMap((g) => g.options);
    return options;
  }, [options]);

  const toggleAll = () => {
    if (selectedValues.length === allOptions.length) {
      clearAll();
    } else {
      const all = allOptions.map((o) => o.value);
      setSelectedValues(all);
      onValueChange?.(all);
    }
  };

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options;
    const filterFn = (opt) =>
      opt.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      opt.value.toLowerCase().includes(searchValue.toLowerCase());
    if (isGrouped) {
      return options
        .map((g) => ({
          ...g,
          options: g.options.filter(filterFn),
        }))
        .filter((g) => g.options.length > 0);
    }
    return options.filter(filterFn);
  }, [options, searchValue]);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-between",
            s.button, // ⭐ apply size
            className
          )}
        >
          <div className="flex flex-wrap items-center gap-1">
            {selectedValues.length > 0 ? (
              <div className="flex items-center flex-wrap gap-1">
                {/* Ambil hanya maxViewSelected pertama */}
                {selectedValues.slice(0, maxViewSelected).map((value) => {
                  const label =
                    allOptions.find((o) => o.value === value)?.label || value;
                  return (
                    <Badge
                      key={value}
                      className={cn(
                        "flex items-center gap-1 cursor-pointer",
                        s.badge
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(value);
                      }}
                    >
                      {label}
                      <XCircle className="w-3 h-3" />
                    </Badge>
                  );
                })}

                {/* Jika masih ada sisa selected */}
                {selectedValues.length > maxViewSelected && (
                  <Badge variant="outline" className={s.badge}>
                    +{selectedValues.length - maxViewSelected}
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground text-xs">
                {placeholder}
              </span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={4}
        className="min-w-[280px] p-0"
        style={{
          zIndex: 9999,
        }}
      >
        <Command className="rounded-lg border shadow-md">
          {searchable && (
            <CommandInput
              placeholder="Search..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="h-9"
            />
          )}

          <CommandList className="max-h-64 overflow-auto thin-scrollbar">
            <CommandEmpty className="py-6 text-center text-sm">
              {emptyText}
            </CommandEmpty>

            {!hideSelectAll && (
              <CommandGroup>
                <CommandItem
                  onSelect={toggleAll}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedValues.length === allOptions.length
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50"
                    )}
                  >
                    <CheckIcon className="h-3 w-3 " />
                  </div>
                  <span>Select All</span>
                </CommandItem>
              </CommandGroup>
            )}

            {isGrouped
              ? filteredOptions.map((group) => (
                  <CommandGroup
                    key={group.heading}
                    heading={group.heading}
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
                  >
                    {group.options.map((opt) => {
                      const isSelected = selectedValues.includes(opt.value);
                      return (
                        <CommandItem
                          key={opt.value}
                          disabled={opt.disabled}
                          onSelect={() => toggleOption(opt.value)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <div
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50"
                            )}
                          >
                            <CheckIcon className="h-3 w-3" />
                          </div>
                          {opt.label}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                ))
              : filteredOptions.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                  return (
                    <CommandItem
                      key={opt.value}
                      disabled={opt.disabled}
                      onSelect={() => toggleOption(opt.value)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50"
                        )}
                      >
                        <CheckIcon className="h-3 w-3" />
                      </div>
                      {opt.label}
                    </CommandItem>
                  );
                })}

            {selectedValues.length > 0 && (
              <CommandGroup>
                <CommandItem
                  onSelect={clearAll}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  Clear All
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
