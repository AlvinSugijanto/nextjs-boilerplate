import React, { useMemo } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  ChevronRight,
  ChevronDown,
  SearchIcon,
  MessageSquare,
} from "lucide-react";
import Iconify from "@/components/iconify";
import { useBoolean } from "@/hooks/useBoolean";
import { DrawerAddSubtask } from "./drawer-add-subtask";
import { dateRemaining, fDate } from "@/utils/format-time";
import {
  EditableCellDate,
  EditableCellMultiSelectUsers,
  EditableCellSelect,
  EditableCellText,
} from "./editable-cell";
import { useFormContext } from "react-hook-form";
import {
  LIST_DEPARTMENTS,
  LIST_HEALTH_LEVEL,
  LIST_PRIORITY_LEVELS,
  LIST_RISK_LEVEL,
  LIST_USERS,
} from "./variable";
import { formatRupiah } from "@/utils/format-number";
import { toast } from "sonner";
import {
  differenceInDays,
  isAfter,
  isBefore,
  isWithinInterval,
} from "date-fns";
import { cn } from "@/lib/utils";
import { RowProjectActions } from "./row-project-action";
import {
  averageSubtaskField,
  sumSubtaskField,
  findTaskIndexPath,
  getTimeFrame,
} from "./helper";
import DrawerComment from "./drawer-comment";
import DrawerAttachment from "./drawer-attachment";

const ProjectDetailTableRowList = ({
  task,
  level = 0,
  index = 0,
  prefix = "",
  style,
  ...props
}) => {
  // hooks
  const openConfirmDelete = useBoolean();
  const loadingDelete = useBoolean();
  const { getValues, setValue } = useFormContext();

  // state
  const [expanded, setExpanded] = React.useState(false);

  const hasChildren = task.subtasks && task.subtasks.length > 0;

  // generate nomor seperti "1", "1.2", "1.2.3"
  const rowNumber = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;

  const {
    transform,
    transition,
    setNodeRef,
    attributes,
    listeners,
    isDragging,
  } = useSortable({
    id: task.id,
    animateLayoutChanges: (args) =>
      defaultAnimateLayoutChanges({
        ...args,
        wasDragging: true,
      }),
  });

  const styleTableRow = {
    transform: CSS.Transform.toString(transform),
    transition: transform
      ? "transform 250ms cubic-bezier(0.25, 1, 0.5, 1)"
      : undefined,
    ...style,
  };

  const daysRemaining = task.expectedCompletion
    ? dateRemaining(new Date(), task.expectedCompletion)
    : 0;

  // 💰 Budget
  const totalBudget = hasChildren
    ? sumSubtaskField(task.subtasks, "budget")
    : parseFloat(task.budget) || 0;

  // 📊 Actual
  const totalActual = hasChildren
    ? sumSubtaskField(task.subtasks, "actual")
    : parseFloat(task.actual) || 0;

  const budgetLessActual = totalBudget - totalActual;

  const totalProgress = hasChildren
    ? averageSubtaskField(task.subtasks, "progress")
    : parseFloat(task.progress) || 0;

  // ⏳ Status Timeframe
  const timeFrame = getTimeFrame(daysRemaining, totalProgress, task.startDate);

  const updateTaskField = (id, updatedFields) => {
    const data = getValues("tasks");
    const path = findTaskIndexPath(data, id);

    if (!path) {
      console.warn("Task not found:", id);
      return;
    }

    // buat prefix string misalnya "data.0.subtasks.2.subtasks.1"
    const basePath = path.join(".");

    for (const [key, val] of Object.entries(updatedFields)) {
      setValue(`tasks.${basePath}.${key}`, val, { shouldDirty: true });
    }
  };

  const handleDeleteTask = () => {
    try {
      const data = getValues("tasks");
      const path = findTaskIndexPath(data, task.id);

      if (!path) {
        console.warn("Task not found:", task.id);
        return;
      }

      // hapus task dari data
      const newData = [...data];
      let current = newData;

      for (let i = 0; i < path.length - 1; i++) {
        const segment = path[i];
        current = current[segment];
      }

      current.splice(path[path.length - 1], 1);

      setValue("tasks", newData, { shouldDirty: true });
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      loadingDelete.onFalse();
      openConfirmDelete.onFalse();
    }
  };

  return (
    <>
      <TableRow
        ref={setNodeRef}
        style={styleTableRow}
        data-dragging={isDragging ? "true" : "false"}
        className="transition-all duration-300 data-[dragging=true]:opacity-70 data-[dragging=true]:shadow-lg data-[dragging=true]:scale-[1.02] !text-xs"
        {...props}
      >
        {/* ▸ Expand button (sticky kiri pertama) */}
        <TableCell
          className={cn("min-w-[40px] text-center z-[1]")}
          style={{ paddingLeft: `${level * 24}px` }}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
              className="hover:bg-transparent text-muted-foreground"
            >
              {expanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </Button>
          )}
        </TableCell>

        {/* 🧾 Row number + drag handle (sticky kiri ke-2) */}
        <TableCell
          className={cn("font-mono", "min-w-[80px] p-0 m-0 z-[1]")}
          style={{ paddingLeft: `${level * 24}px` }}
        >
          <div className="flex items-center justify-start gap-2">
            <Button
              {...attributes}
              {...listeners}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-transparent cursor-grab active:cursor-grabbing"
            >
              <Iconify icon="mdi:drag" className="size-3" />
            </Button>
            <span className="text-xs font-medium">{rowNumber}</span>
          </div>
        </TableCell>

        {/* 🏷️ Task name (sticky kiri ke-3) */}
        <TableCell
          className={cn(
            "sticky left-0",
            "min-w-[200px] max-w-[300px] overflow-hidden text-ellipsis truncate font-medium text-foreground bg-card z-[1]"
          )}
        >
          <EditableCellText
            value={task.name}
            required
            onSave={(newName) => {
              updateTaskField(task.id, { name: newName });
            }}
          />
        </TableCell>

        {/* ➕ Add subtask (sticky kiri ke-4) */}
        <TableCell>
          <DrawerAddSubtask parentId={task.id} />
        </TableCell>

        {/* ❤️ Health Level */}
        <TableCell>
          <EditableCellSelect
            value={task.healthLevel}
            options={LIST_HEALTH_LEVEL}
            onSave={(newLevel) => {
              updateTaskField(task.id, { healthLevel: newLevel });
            }}
          />
        </TableCell>

        {/* ⚡ Priority */}
        <TableCell>
          <EditableCellSelect
            value={task.priority}
            options={LIST_PRIORITY_LEVELS}
            onSave={(newLevel) => {
              updateTaskField(task.id, { priority: newLevel });
            }}
          >
            <Badge
              variant="outline"
              className={`
          ${task.priority === "Critical" ? "border-red-700 text-red-700" : ""}
          ${task.priority === "High" ? "border-red-400 text-red-400" : ""}
          ${task.priority === "Medium" ? "border-amber-500 text-amber-500" : ""}
          ${task.priority === "Low" ? "border-green-500 text-green-500" : ""}
        `}
            >
              {task.priority}
            </Badge>
          </EditableCellSelect>
        </TableCell>

        {/* 🆔 TASK ID */}
        <TableCell className="text-muted-foreground">
          {/* <EditableCellText
            value={task.taskId}
            onSave={(newTaskId) => {
              updateTaskField(task.id, { taskId: newTaskId });
            }}
          /> */}
          <span className="text-xs truncate block">{task.taskId}</span>
        </TableCell>

        {/* 🧩 Department */}
        <TableCell>
          <EditableCellSelect
            value={task.department}
            options={LIST_DEPARTMENTS}
            onSave={(newDepartment) => {
              updateTaskField(task.id, { department: newDepartment });
            }}
          />
        </TableCell>

        {/* 👤 Assignee */}
        {/* <TableCell>
          <EditableCellMultiSelectUsers
            value={task.assignee}
            onSave={(newAssignee) => {
              updateTaskField(task.id, { assignee: newAssignee });
            }}
            options={LIST_USERS}
            placeholder="Select users"
          />
        </TableCell> */}

        {/* 💰 Budget */}
        <TableCell className="font-mono">
          {hasChildren ? (
            <span className="font-semibold text-muted-foreground">
              {formatRupiah(totalBudget)}
            </span>
          ) : (
            <EditableCellText
              value={task.budget}
              onSave={(newBudget) => {
                updateTaskField(task.id, { budget: newBudget });
              }}
              type="number"
            >
              {formatRupiah(task.budget || 0)}
            </EditableCellText>
          )}
        </TableCell>

        {/* 📊 Actual */}
        <TableCell className="font-mono">
          {hasChildren ? (
            <span className="font-semibold text-muted-foreground">
              {formatRupiah(totalActual)}
            </span>
          ) : (
            <EditableCellText
              value={task.actual}
              onSave={(newActual) => {
                updateTaskField(task.id, { actual: newActual });
              }}
              type="number"
            >
              {formatRupiah(task.actual || 0)}
            </EditableCellText>
          )}
        </TableCell>

        {/* 💸 Budget - Actual */}
        <TableCell
          className={`font-mono font-medium ${
            budgetLessActual < 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          {formatRupiah(budgetLessActual || 0)}
        </TableCell>

        {/* 📅 Start date */}
        <TableCell>
          <EditableCellDate
            value={task.startDate}
            onSave={(newDate) => {
              updateTaskField(task.id, { startDate: newDate });
            }}
            maxDate={task.expectedCompletion}
          />
        </TableCell>

        {/* 📆 Expected completion */}
        <TableCell>
          <EditableCellDate
            value={task.expectedCompletion}
            onSave={(newDate) => {
              updateTaskField(task.id, { expectedCompletion: newDate });
            }}
            minDate={task.startDate}
          />
        </TableCell>

        {/* ⏳ Days remaining */}
        <TableCell
          className={`font-medium ${daysRemaining < 0 ? "text-red-600" : ""}`}
        >
          {daysRemaining}
        </TableCell>

        {/* 🕒 Timeframe */}
        <TableCell>
          <Badge
            variant="outline"
            className={`
          ${timeFrame === "Delay" ? "border-red-400 text-red-400" : ""}
          ${timeFrame === "On Going" ? "border-yellow-400 text-yellow-400" : ""}
          ${timeFrame === "Open" ? "border-blue-400 text-blue-400" : ""}
          ${timeFrame === "Done" ? "border-green-400 text-green-400" : ""}
        `}
          >
            {timeFrame}
          </Badge>
        </TableCell>

        {/* 📈 Progress */}
        <TableCell>
          {hasChildren ? (
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min(totalProgress || 0, 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono">
                {Math.min(totalProgress || 0, 100)}%
              </span>
            </div>
          ) : (
            <EditableCellText
              value={task.progress}
              type="number"
              onSave={(newProgress) => {
                // Make sure progress is between 0 and 100
                const progressValue = Math.max(
                  0,
                  Math.min(Number(newProgress), 100)
                );

                updateTaskField(task.id, { progress: progressValue });
              }}
              inputProps={{
                min: 0,
                max: 100,
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${Math.min(task.progress || 0, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono">
                  {Math.min(task.progress || 0, 100)}%
                </span>
              </div>
            </EditableCellText>
          )}
        </TableCell>

        {/* ⚠️ Risk Level */}
        <TableCell>
          <EditableCellSelect
            value={task.riskLevel}
            options={LIST_RISK_LEVEL}
            onSave={(newLevel) => {
              updateTaskField(task.id, { riskLevel: newLevel });
            }}
          >
            <Badge
              variant="outline"
              className={`
          ${task.riskLevel === "Critical" ? "border-red-700 text-red-700" : ""}
          ${task.riskLevel === "High" ? "border-red-400 text-red-400" : ""}
          ${
            task.riskLevel === "Medium" ? "border-amber-500 text-amber-500" : ""
          }
          ${task.riskLevel === "Low" ? "border-green-500 text-green-500" : ""}
        `}
            >
              {task.riskLevel}
            </Badge>
          </EditableCellSelect>
        </TableCell>

        {/* 🧠 Associated Risk */}
        <TableCell className="text-muted-foreground truncate max-w-[250px]">
          <EditableCellText
            value={task.associatedRisk}
            onSave={(newAssociatedRisk) => {
              updateTaskField(task.id, { associatedRisk: newAssociatedRisk });
            }}
          >
            <p className="text-xs truncate ">{task.associatedRisk || "-"}</p>
          </EditableCellText>
        </TableCell>

        {/* 📉 Cost-benefit */}
        <TableCell>
          <EditableCellText
            value={task.costBenefit}
            onSave={(value) => {
              updateTaskField(task.id, { costBenefit: value });
            }}
          />
        </TableCell>

        {/* 💬 Comment */}
        <TableCell className="text-muted-foreground truncate max-w-[200px]">
          <DrawerComment task={task} />
        </TableCell>

        {/* 📎 Attachment */}
        <TableCell>
          <DrawerAttachment task={task} />
        </TableCell>

        {/* 🔄 Status */}
        <TableCell className="text-center">
          {/* <Badge
            variant="outline"
            className="flex items-center gap-1 text-muted-foreground px-1.5"
          >
            {task.status === "Done" ? (
              <Iconify
                icon="lets-icons:done-duotone-line"
                className="text-green-500"
              />
            ) : (
              <Iconify icon="streamline-ultimate:loading-bold" />
            )}
            {task.status}
          </Badge> */}

          <RowProjectActions
            id={task.id}
            onDelete={handleDeleteTask}
            confirmDialog={{
              open: openConfirmDelete.value,
              onOpen: openConfirmDelete.onTrue,
              onClose: openConfirmDelete.onFalse,
              loading: loadingDelete.value,
              title: "Delete this task?",
            }}
          />
        </TableCell>
      </TableRow>

      {/* ─────────────── SUBTASKS (recursive) ─────────────── */}
      {expanded && hasChildren && (
        <SortableContext
          items={task.subtasks.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {task.subtasks.map((sub, subIndex) => (
            <ProjectDetailTableRowList
              key={sub.id}
              task={sub}
              level={level + 1}
              index={subIndex}
              prefix={rowNumber}
            />
          ))}
        </SortableContext>
      )}
    </>
  );
};

export default ProjectDetailTableRowList;
