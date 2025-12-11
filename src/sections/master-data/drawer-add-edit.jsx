import { useCallback, useEffect, useMemo, useRef } from "react";

import { FormProvider, useForm, useFormContext } from "react-hook-form";
import * as Yup from "yup";
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
import { toast } from "sonner";
import { useBoolean } from "@/hooks/use-boolean";

const DrawerAddEdit = ({
  titleButton = "Add Data",
  onOpen,
  openDrawer,
  onCloseDrawer,
  loadingSubmit,
  title,
  subTitle,
  resolver,
  defaultValues = {},
  children,
  onSubmit: onSubmitProp,
}) => {
  // hooks

  const methods = useForm({
    resolver: yupResolver(resolver),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onSubmitProp?.(values);
      toast.success("Data saved successfully");
    } catch (error) {
      toast.error("Failed to save data");
    }
  });

  return (
    <Sheet
      className="overflow-auto absolute"
      open={openDrawer}
      onOpenChange={(open) => {
        if (open) {
          onOpen?.();
        } else {
          onCloseDrawer?.();
        }
      }}
    >
      <SheetTrigger asChild>
        <Button size="sm" onClick={onOpen}>
          <Iconify icon="ic:round-plus" className="size-5" /> {titleButton}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{subTitle}</SheetDescription>
        </SheetHeader>
        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className="overflow-auto h-full">
            <div className="flex-1 overflow-auto py-4">
              <div className="grid gap-6 px-4">{children}</div>
            </div>
          </form>
        </FormProvider>
        <SheetFooter>
          <Button
            type="button" // penting: jangan "submit"
            onClick={onSubmit} // panggil submit form
            disabled={loadingSubmit}
          >
            {loadingSubmit ? "Saving..." : "Save"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" onClick={onCloseDrawer}>
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default DrawerAddEdit;
