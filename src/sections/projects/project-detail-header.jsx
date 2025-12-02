import { useCallback, useEffect, useState } from "react";

import Iconify from "@/components/iconify";
import { TypographyH4 } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { useFormContext } from "react-hook-form";
import { fDate } from "@/utils/format-time";
import { LIST_PROJECT_STATUS, LIST_STRATEGIC_OBJECTIVE } from "./variable";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBoolean } from "@/hooks/useBoolean";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

const ProjectDetailHeader = ({ onChangeTab, tab }) => {
  // hooks
  const loadingChangeStatus = useBoolean();
  const openAddStrategicObjective = useBoolean();
  const isEditProjectName = useBoolean();
  const isEditProjectId = useBoolean();
  const isEditDate = useBoolean();
  const isEditDescription = useBoolean();
  const { watch, setValue } = useFormContext();

  const id = watch("id");
  const project_name = watch("project_name");
  const project_status = watch("project_status");
  const projectId = watch("project_id");
  const startDate = watch("start_date");
  const expectedDueDate = watch("expected_due_date");
  const strategicObjective = watch("strategic_objective");
  const description = watch("description");

  // state
  const [projectNameInput, setProjectNameInput] = useState(project_name || "");
  const [projectIdInput, setProjectIdInput] = useState(projectId || "");
  const [projectDescInput, setProjectDescInput] = useState(description || "");

  const handleChangeProjectName = useCallback(async () => {
    try {
      setValue("project_name", projectNameInput);
    } catch (error) {
      console.error("Error updating project name:", error);
      toast.error("Failed to update project name");
    } finally {
      isEditProjectName.onFalse();
    }
  }, [id, projectNameInput, setValue]);

  const handleChangeProjectId = useCallback(async () => {
    try {
      setValue("project_id", projectIdInput);
    } catch (error) {
      console.error("Error updating project ID:", error);

      if (error?.response?.data?.project_id?.code === "validation_not_unique") {
        toast.error("Failed to update project ID: ID already exists");
        return;
      }

      toast.error("Failed to update project ID");
    } finally {
      isEditProjectId.onFalse();
    }
  }, [id, projectIdInput, setValue]);

  const handleChangeDateRange = useCallback(
    async (range) => {
      try {
        setValue("start_date", range.from);
        setValue("expected_due_date", range.to);
      } catch (error) {
        console.error("Error updating date range:", error);
        toast.error("Failed to update date range");
      } finally {
        isEditDate.onFalse();
      }
    },
    [id, setValue]
  );

  const handleChangeStatus = useCallback(
    async (value) => {
      loadingChangeStatus.onTrue();
      try {
        setValue("project_status", value);
      } catch (error) {
        console.error("Error updating status:", error);
        toast.error("Failed to update status");
      } finally {
        loadingChangeStatus.onFalse();
      }
    },
    [id]
  );

  const handleChangeDescription = useCallback(async () => {
    try {
      setValue("description", projectDescInput);
    } catch (error) {
      console.error("Error updating description:", error);
      toast.error("Failed to update description");
    } finally {
      isEditDescription.onFalse();
    }
  }, [id, projectDescInput, setValue]);

  const handleAddStrategicObjective = useCallback(
    async (value) => {
      // Cek apakah sudah ada di daftar
      const alreadyExists = strategicObjective.some((item) =>
        typeof item === "object" && item.id
          ? item.id === value.id
          : item === value
      );

      if (alreadyExists) {
        // Bisa tambahkan notifikasi (opsional)
        // toast.warning("This strategic objective already exists.");
        return;
      }

      try {
        // Jika belum ada, tambahkan
        const newObjectives = [...strategicObjective, value];
        setValue("strategic_objective", newObjectives);
      } catch (error) {
        console.error("Error adding strategic objective:", error);
        toast.error("Failed to add strategic objective");
      } finally {
        openAddStrategicObjective.onFalse();
      }
    },
    [strategicObjective, setValue, openAddStrategicObjective]
  );

  const handleRemoveStrategicObjective = useCallback(
    async (value) => {
      const newObjectives = strategicObjective.filter((item) =>
        typeof item === "object" && item.id
          ? item.id !== value.id
          : item !== value
      );

      try {
        setValue("strategic_objective", newObjectives);
      } catch (error) {
        console.error("Error removing strategic objective:", error);
        toast.error("Failed to remove strategic objective");
      }
    },
    [strategicObjective, setValue]
  );

  const listStrategicObjectiveOptions = LIST_STRATEGIC_OBJECTIVE.filter(
    (f) => !strategicObjective?.includes(f.value)
  );

  useEffect(() => {
    setProjectNameInput(project_name || "");
    setProjectIdInput(projectId || "");
    setProjectDescInput(description || "");
  }, [project_name, projectId, description]);

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div onDoubleClick={isEditProjectName.onTrue}>
            {isEditProjectName.value ? (
              <input
                type="text"
                className="text-base font-semibold bg-transparent border-b border-gray-300 focus:outline-none focus:ring-0"
                value={projectNameInput}
                onChange={(e) => setProjectNameInput(e.target.value)}
                onBlur={(e) => {
                  if (projectNameInput.trim() === "") {
                    toast.error("Project name cannot be empty."); // optional pakai sonner/toast
                    setProjectNameInput(projectNameInput); // reset ke nilai awal
                    isEditProjectName.onFalse();
                    return;
                  }
                  handleChangeProjectName(e);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (projectNameInput.trim() === "") {
                      toast.error("Project name cannot be empty.");
                      setProjectNameInput(projectNameInput);
                      isEditProjectName.onFalse();
                      return;
                    }
                    handleChangeProjectName(e);
                  } else if (e.key === "Escape") {
                    isEditProjectName.onFalse();
                    setProjectNameInput(projectNameInput); // reset ke nama awal
                  }
                }}
                autoFocus
              />
            ) : (
              <TypographyH4
                className="text-base font-semibold cursor-pointer hover:underline"
                onClick={isEditProjectName.onTrue}
              >
                {projectNameInput}
              </TypographyH4>
            )}
          </div>
          <StatusProject
            status={project_status}
            onChange={handleChangeStatus}
            options={LIST_PROJECT_STATUS}
            loading={loadingChangeStatus.value}
          />
        </div>

        <Tabs value={tab} onValueChange={onChangeTab}>
          <TabsList>
            <TabsTrigger value="list">
              <Iconify icon="material-symbols:list-rounded" />
              List
            </TabsTrigger>
            <TabsTrigger value="dashboard">
              <Iconify icon="material-symbols:bar-chart-rounded" />
              Dashboard
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* project desc */}
      <div className="flex items-center text-xs text-muted-foreground gap-2">
        <div
          className="flex items-center gap-1"
          onDoubleClick={isEditProjectId.onTrue}
        >
          <Iconify icon="solar:user-bold" className="w-4 h-4" />
          {isEditProjectId.value ? (
            <input
              type="text"
              className="text-xs bg-transparent border-b border-gray-300 focus:outline-none focus:ring-0"
              value={projectIdInput}
              onChange={(e) => setProjectIdInput(e.target.value)}
              onBlur={isEditProjectId.onFalse}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                  handleChangeProjectId();
                }
              }}
              autoFocus
            />
          ) : (
            <span
              className="text-xs cursor-pointer hover:underline"
              onClick={isEditProjectId.onTrue}
            >
              {projectId}
            </span>
          )}
        </div>
        <div className="flex items-center">
          <RangeDatePicker
            from={startDate || new Date()}
            to={expectedDueDate || new Date()}
            onChange={handleChangeDateRange}
          />
        </div>
      </div>

      {/* strategic objective */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">Strategic Objective:</p>
        <div
          className={`flex items-center text-xs text-muted-foreground gap-2`}
        >
          {strategicObjective?.length ? (
            <div className="flex items-center gap-2 flex-wrap">
              {strategicObjective?.map((objective) => (
                <div
                  key={objective}
                  className="bg-primary rounded-full px-3 py-1 inline-flex items-center gap-2 text-white"
                >
                  <span>{objective}</span>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-4 w-4 p-0"
                    onClick={() => handleRemoveStrategicObjective(objective)}
                  >
                    <Iconify icon="mdi:close" className="size-3" />
                    <span className="sr-only">Remove strategic objective</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : null}

          {openAddStrategicObjective.value ? (
            <Select onValueChange={handleAddStrategicObjective}>
              <SelectTrigger className="!h-7 w-[180px] text-sm">
                <SelectValue placeholder="Select Strategic Objective" />
              </SelectTrigger>
              <SelectContent className="text-sm">
                <SelectGroup>
                  {listStrategicObjectiveOptions.map((objective) => (
                    <SelectItem
                      key={objective.value}
                      value={objective.value}
                      className="h-8 text-sm"
                    >
                      {objective.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : null}

          {listStrategicObjectiveOptions.length > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                {openAddStrategicObjective.value ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0"
                    onClick={openAddStrategicObjective.onFalse}
                  >
                    <Iconify icon="mdi:close" className="w-4 h-4" />
                    <span className="sr-only">Close strategic objective</span>
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0"
                    onClick={openAddStrategicObjective.onTrue}
                  >
                    <Iconify icon="mdi:plus" className="w-4 h-4" />
                    <span className="sr-only">Add strategic objective</span>
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {openAddStrategicObjective.value ? "Close" : "Add"} strategic
                  objective
                </p>
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </div>

      {/* description */}
      <div
        className="flex items-center text-xs text-muted-foreground gap-2 max-w-2xl text-ellipsis overflow-hidden"
        onDoubleClick={isEditDescription.onTrue}
      >
        {isEditDescription.value ? (
          <div className="w-full relative">
            <Textarea
              placeholder="Type your description here."
              className="!text-xs pr-20 placeholder:text-muted-foreground placeholder:text-xs focus:text-xs !min-h-24"
              value={projectDescInput}
              onChange={(e) => setProjectDescInput(e.target.value)}
            />
            <div className="absolute bottom-2 right-3 flex gap-1">
              <Button
                size="sm"
                className="!text-[10px] !px-3 py-2 h-6 shadow"
                variant="outline"
                onClick={() => {
                  isEditDescription.onFalse();
                  setProjectDescInput(description || "");
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="!text-[10px] !px-3 py-2 h-6 shadow"
                onClick={handleChangeDescription}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <span className="text-xs cursor-pointer hover:underline">
            {description || "No description provided. Double click to add."}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailHeader;

const StatusProject = ({ status, onChange, options, loading }) => {
  if (!status) return "-";

  let color = null;

  switch (status) {
    case "Proposed and Requested":
      color = "bg-indigo-300";
      break;
    case "Approved":
      color = "bg-blue-300";
      break;
    case "Planning In Progress":
      color = "bg-green-400";
      break;
    case "In Progress":
      color = "bg-green-500";
      break;
    case "Complete":
      color = "bg-emerald-500";
      break;
    case "On Hold":
      color = "bg-yellow-500";
      break;
    case "Monitor":
      color = "bg-yellow-500";
      break;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {loading ? (
          <Skeleton className="h-4 w-[200px]" />
        ) : (
          <Badge
            variant="secondary"
            className={`bg-yellow-100  text-white cursor-pointer ${color}`}
          >
            {status} <Iconify icon="mdi:chevron-down" className="w-4 h-4" />
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Status Project</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={status} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const RangeDatePicker = ({ from, to, onChange }) => {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: from ? new Date(from) : new Date(),
    to: to ? new Date(to) : new Date(),
  });

  const handleSelect = (range) => {
    setDateRange(range);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // if closed, send the selected range
          if (dateRange?.from && dateRange?.to) {
            onChange?.(dateRange);
          }
        }
        setOpen(isOpen);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-[230px] justify-start text-left font-normal",
            !dateRange?.from && "text-muted-foreground"
          )}
        >
          <Iconify icon="solar:calendar-bold" className="w-4 h-4" />
          {dateRange?.from ? (
            dateRange?.to ? (
              <span className="text-xs">
                {fDate(dateRange.from)} - {fDate(dateRange.to)}
              </span>
            ) : (
              <span className="text-xs">{fDate(dateRange.from)}</span>
            )
          ) : (
            <span className="text-xs cursor-pointer hover:underline">
              Pick a date range
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2 w-auto" align="start">
        <Calendar
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};
