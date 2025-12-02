import * as Yup from "yup";

import { useCallback, useMemo, useRef } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Iconify from "@/components/iconify";
import {
  RHFDatePicker,
  RhfMultiSelect,
  RHFSelect,
  RHFTextArea,
  RHFTextField,
} from "@/components/hook-form";
import { healthLevels, priorities } from "./dummy-data";
import { defaultAddSubtaskValues } from "./view/project-detail-list-view";
import { toast } from "sonner";
import { useBoolean } from "@/hooks/useBoolean";
import {
  LIST_DEPARTMENTS,
  LIST_PRIORITY_LEVELS,
  LIST_RISK_LEVEL,
} from "./variable";

const OPTIONS = [
  {
    heading: "Users",
    options: [
      { label: "Yusuf", value: "yusuf" },
      { label: "Alice", value: "alice" },
      { label: "Bob", value: "bob" },
      { label: "Charlie", value: "charlie" },
      { label: "Dave", value: "dave" },
      { label: "Eve", value: "eve" },
      { label: "Frank", value: "frank" },
      { label: "Grace", value: "grace" },
      { label: "Heidi", value: "heidi" },
    ],
  },
];

// Helper recursive for added subtask
const addSubtaskRecursive = (tasks, parentId, newSubtask) => {
  return tasks.map((task) => {
    if (task.id === parentId) {
      return {
        ...task,
        subtasks: [...(task.subtasks || []), newSubtask],
      };
    }

    if (task.subtasks?.length) {
      return {
        ...task,
        subtasks: addSubtaskRecursive(task.subtasks, parentId, newSubtask),
      };
    }

    return task;
  });
};

export function DrawerAddSubtask({ parentId }) {
  // hooks
  const counterRef = useRef(0);
  const loadingSubmit = useBoolean();
  const openSheet = useBoolean();
  const { handleSubmit, reset, getValues, watch } = useFormContext();

  const abbreviation = watch("abbreviation");

  const taskIdIncrement = useCallback(() => {
    counterRef.current += 1;
    return `${abbreviation}${counterRef.current.toString().padStart(4, "0")}`;
  }, [abbreviation]);

  const onSubmit = handleSubmit(async (values) => {
    loadingSubmit.onTrue();

    try {
      const newSubtask = {
        id: uuidv4(),
        subtasks: [],
        ...values.addSubtask,
        taskId: taskIdIncrement(),
      };

      // Ambil data task utama dari form context
      const allTasks = values.tasks || [];

      // Update langsung ke form context
      const updated = addSubtaskRecursive(allTasks, parentId, newSubtask);

      console.log({ updated });

      const data = getValues();

      reset({
        ...data,
        tasks: updated,
        addSubtask: defaultAddSubtaskValues,
      });

      toast.success("Subtask added successfully!");
      openSheet.onFalse();

      // console.log("Updated Tasks:", updated);
      // setValue("data", updated);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add subtask");
    } finally {
      loadingSubmit.onFalse();
    }
  });

  return (
    <Sheet
      className="overflow-auto absolute"
      open={openSheet.value}
      onOpenChange={(open) => {
        open ? openSheet.onTrue() : openSheet.onFalse();
      }}
    >
      <SheetTrigger asChild>
        <button
          size="sm"
          className="text-primary text-[10px] px-2 py-1 border border-primary rounded-2xl hover:bg-primary/10 flex items-center gap-1 tracking-tighter font-medium"
          onClick={openSheet.onTrue}
        >
          <Iconify icon="ic:round-plus" className="size-3" /> Add Subtask
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Subtask</SheetTitle>
          <SheetDescription>Add a new subtask to the project.</SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} className="overflow-auto h-full">
          <div className="flex-1 overflow-auto py-4">
            <div className="grid gap-6 px-4">
              <div className="grid gap-3">
                <RHFTextField
                  name="addSubtask.name"
                  label="Task Name"
                  placeholder="Enter task name"
                />
                <RHFSelect
                  name="addSubtask.healthLevel"
                  label="Health Level"
                  placeholder="Select Health Level"
                  options={healthLevels.map((status) => ({
                    label: status,
                    value: status,
                  }))}
                />
                <RHFSelect
                  name="addSubtask.priority"
                  label="Priority"
                  placeholder="Select Priority"
                  options={LIST_PRIORITY_LEVELS}
                />

                {/* <RHFTextField
                  name="addSubtask.taskId"
                  label="Task ID"
                  placeholder="Enter Task ID"
                /> */}

                <RHFSelect
                  name="addSubtask.department"
                  label="Department"
                  placeholder="Select Department"
                  options={LIST_DEPARTMENTS}
                />

                {/* MultiSelect dengan container khusus */}
                {/* <RhfMultiSelect
                  name="addSubtask.assignee"
                  label="Select Users"
                  placeholder="Choose Assignees users"
                  options={OPTIONS}
                  searchable
                  hideSelectAll={false}
                /> */}

                <RHFTextField
                  name="addSubtask.budget"
                  label="Budget"
                  type="number"
                  placeholder="Enter budget amount"
                />

                <RHFTextField
                  name="addSubtask.actual"
                  label="Actual"
                  type="number"
                  placeholder="Enter actual amount"
                />

                {/* <RHFTextField
                  name="addSubtask.budgetLessActual"
                  label="Budget Less Actual"
                  type="number"
                  placeholder="Enter budget less actual amount"
                /> */}

                <RHFDatePicker name="addSubtask.startDate" label="Start Date" />
                <RHFDatePicker
                  name="addSubtask.expectedCompletion"
                  label="Expected Completion"
                />
                {/* <RHFTextField
                  name="addSubtask.timeframe"
                  label="Timeframe"
                  placeholder="Enter timeframe"
                /> */}
                <RHFTextField
                  name="addSubtask.progress"
                  label="Progress (%)"
                  type="number"
                  placeholder="Enter progress percentage"
                />
                <RHFSelect
                  name="addSubtask.riskLevel"
                  label="Risk Level"
                  placeholder="Select Risk Level"
                  options={LIST_RISK_LEVEL}
                />
                <RHFTextField
                  name="addSubtask.associatedRisk"
                  label="Associated Risk"
                  placeholder="Enter associated risk"
                />
                <RHFTextField
                  name="addSubtask.costBenefit"
                  label="Cost Benefit Analysis"
                  placeholder="Enter cost benefit analysis"
                />
                <RHFTextArea
                  name="addSubtask.comment"
                  label="Comment"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </form>
        <SheetFooter>
          <Button
            type="button" // penting: jangan "submit"
            onClick={onSubmit} // panggil submit form
            disabled={loadingSubmit.value}
          >
            {loadingSubmit.value ? "Adding..." : "Add Subtask"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" onClick={openSheet.onFalse}>
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
