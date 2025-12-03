import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRight, ChevronDown, SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import ProjectDetailTableRowList from "./project-detail-table-row-list";
import { generateDummyDataListProject } from "./dummy-data";
import { useDebounce } from "react-use";
import { Spinner } from "@/components/ui/spinner";
import { useBoolean } from "@/hooks/use-boolean";
import { useFormContext } from "react-hook-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const COLUMNS = [
  {
    key: "drag",
    minWidth: "20px",
    title: "",
  },
  {
    key: "no",
    title: "No",
    minWidth: "20px",
  },
  {
    key: "taskName",
    title: "Task Name",
    className: "sticky left-0 top-0 z-50 text-xs bg-muted/60  backdrop-blur",
  },
  { key: "addSubtask", title: "" },
  {
    key: "healthLevel",
    title: "Health Level",
  },
  {
    key: "priority",
    title: "Priority",
  },
  {
    key: "taskId",
    title: "TASK ID",
  },
  {
    key: "department",
    title: "Department",
  },
  // {
  //   key: "assignee",
  //   title: "Assignee",
  // },
  {
    key: "budget",
    title: "Budget",
  },
  {
    key: "actual",
    title: "Actual",
  },
  {
    key: "budgetLessActual",
    title: "Budget less actual",
  },
  {
    key: "startDate",
    title: "Start date",
  },
  {
    key: "expectedCompletion",
    title: "Expected Date of completion",
  },
  {
    key: "daysRemaining",
    title: "Number of days remaining",
  },
  { key: "timeframe", title: "Timeframe" },
  {
    key: "progress",
    title: "Progress",
    minWidth: "150px",
  },
  {
    key: "riskLevel",
    title: "Risk Level",
    minWidth: "110px",
  },
  {
    key: "associatedRisk",
    title: "Associated risk",
  },
  {
    key: "costBenefit",
    title: "Cost-benefit analysis",
  },
  {
    key: "comment",
    title: "Comment",
  },
  {
    key: "attachment",
    title: "Attachment",
  },
  { key: "action", title: "" },
];

// 🧠 Helper: find task & its parent recursively
function findTaskAndParent(tasks, id, parent = null) {
  for (const task of tasks) {
    if (task.id === id) return { task, parent };
    if (task.subtasks?.length) {
      const found = findTaskAndParent(task.subtasks, id, task);
      if (found) return found;
    }
  }
  return null;
}

// 🔁 Helper: reorder items within same parent
function reorderInSameParent(tasks, activeId, overId) {
  const clone = JSON.parse(JSON.stringify(tasks));
  const from = findTaskAndParent(clone, activeId);
  const to = findTaskAndParent(clone, overId);
  if (!from || !to) return tasks;

  const parent = from.parent ?? null;
  const list = parent ? parent.subtasks : clone;

  const oldIndex = list.findIndex((t) => t.id === activeId);
  const newIndex = list.findIndex((t) => t.id === overId);
  if (oldIndex === -1 || newIndex === -1) return tasks;

  const newList = arrayMove(list, oldIndex, newIndex);
  if (parent) parent.subtasks = newList;
  else return newList;

  return clone;
}

// 🔍 Recursive search helper
function searchTasks(tasks, query) {
  if (!query.trim()) return tasks; // kosong → tampilkan semua
  const lowerQuery = query.toLowerCase();

  const filterRecursively = (list) => {
    return list
      .map((task) => {
        const matches = task.name.toLowerCase().includes(lowerQuery);

        const filteredSubtasks = task.subtasks
          ? filterRecursively(task.subtasks)
          : [];

        // tampilkan parent kalau cocok atau punya child yg cocok
        if (matches || filteredSubtasks.length > 0) {
          return { ...task, subtasks: filteredSubtasks };
        }
        return null;
      })
      .filter(Boolean);
  };

  return filterRecursively(tasks);
}

// ────────────────────────────────
// ⚙️ Main Table Component
// ────────────────────────────────
export default function ProjectDetailTableList() {
  const { watch, setValue } = useFormContext();
  const data = watch("tasks") || [];

  // hooks

  // state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  // Flatten semua id untuk context global
  const flattenTasks = (list) => {
    let ids = [];
    list.forEach((task) => {
      ids.push(task.id);
      if (task.subtasks?.length) ids = ids.concat(flattenTasks(task.subtasks));
    });
    return ids;
  };

  useDebounce(
    () => {
      setDebouncedSearch(search);
    },
    400, // delay
    [search] // dependencies
  );

  // ⚡ Handle drag end
  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const tasks = reorderInSameParent(data, active.id, over.id);
    setValue("tasks", tasks);
  }

  // 🔍 Apply recursive search
  const filtered = useMemo(() => {
    return searchTasks(data, debouncedSearch);
  }, [debouncedSearch, data]);

  return (
    <Card className="gap-2 w-full max-h-[800px] overflow-hidden">
      <div className="flex flex-col md:flex-row items-start justify-between px-4 pt-4">
        <InputGroup className="w-full sm:w-1/3 mb-4">
          <InputGroupInput
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              aria-label="Open menu"
              size="sm"
              className="text-xs"
            >
              Create Task <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-fit" align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => {}}>
                Parent Task
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>Sub Task</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <Table className="relative overflow-auto max-h-[70vh]">
          <TableHeader className="bg-muted/60 sticky top-0 z-10 backdrop-blur [&>tr>th]:py-2">
            <TableRow>
              {COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  style={{ minWidth: col.minWidth || "80px" }}
                  className={`text-xs ${col.className || ""}`}
                >
                  {col.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            <SortableContext
              items={filtered.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {filtered.length > 0 ? (
                filtered.map((task, index) => (
                  <ProjectDetailTableRowList
                    key={task.id}
                    task={task}
                    index={index} // tampil index global
                  />
                ))
              ) : (
                <TableRow className="h-[300px]">
                  <TableCell colSpan={COLUMNS.length} className="text-center">
                    No tasks found
                  </TableCell>
                </TableRow>
              )}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>
    </Card>
  );
}
