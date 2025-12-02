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
}) {
  const [selectedValues, setSelectedValues] = React.useState(defaultValue);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const isGrouped = options.length > 0 && "heading" in options[0];

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
          className={cn("w-full justify-between h-auto min-h-10", className)}
        >
          <div className="flex flex-wrap items-center gap-1">
            {selectedValues.length > 0 ? (
              selectedValues.map((value) => {
                const label =
                  allOptions.find((opt) => opt.value === value)?.label || value;
                return (
                  <Badge
                    key={value}
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(value);
                    }}
                  >
                    {label}
                    <XCircle className="w-3 h-3" />
                  </Badge>
                );
              })
            ) : (
              <span className="text-muted-foreground text-sm">
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
