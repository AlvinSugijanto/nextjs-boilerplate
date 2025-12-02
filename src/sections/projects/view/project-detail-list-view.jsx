"use client";

import { use, useCallback, useState, useMemo, useEffect } from "react";

// packages
import * as Yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import ProjectDetailHeader from "../project-detail-header";
import ProjectDetailTableList from "../project-detail-table-list";
import { generateDummyDataListProject } from "../dummy-data";
import { faker } from "@faker-js/faker";

// schema validation
const schemaValidation = Yup.object().shape({
  data: Yup.array(),
  addSubtask: Yup.object().shape({
    name: Yup.string().required("Name must be filled"),
    healthLevel: Yup.string(),
    priority: Yup.string(),
    taskId: Yup.string(),
    department: Yup.string(),
    assignee: Yup.array().of(Yup.string()),
    budget: Yup.number(),
    actual: Yup.number(),
    budgetLessActual: Yup.number(),
    startDate: Yup.date().required("Start Date must be filled"),
    expectedCompletion: Yup.date()
      .required("Expected Completion Date must be filled")
      .typeError("Expected Completion Date must be a valid date")
      .min(
        Yup.ref("startDate"),
        "Expected Completion Date cannot be before Start Date"
      ),
    timeframe: Yup.string(),
    progress: Yup.number(),
    riskLevel: Yup.string(),
    associatedRisk: Yup.string(),
    costBenefit: Yup.string(),
    comment: Yup.string(),
    attachments: Yup.array().of(Yup.mixed()),
  }),
});

export const defaultAddSubtaskValues = {
  name: "Example Subtask",
  healthLevel: "",
  priority: "",
  taskId: "",
  department: "",
  assignee: [],
  budget: 0,
  actual: 0,
  budgetLessActual: 0,
  projectId: "",
  abbreviation: "",
  startDate: null,
  expectedCompletion: null,
  timeframe: "",
  progress: 0,
  riskLevel: "",
  associatedRisk: "",
  costBenefit: "",
  comment: "",
  attachments: [],
};

export function ProjectDetailListView({ params }) {
  const paramsId = params ? use(params) : null;
  const id = paramsId ? decodeURIComponent(paramsId.id).trim() : null;

  const { data } = generateDummyDataListProject(20);

  // state
  const [tab, setTab] = useState("list");

  const defaultValues = useMemo(() => {
    return {
      id: "",
      project_name: "",
      project_status: "",
      project_id: "",
      start_date: "",
      expected_due_date: "",
      strategic_objective: [],
      description: "",
      abbreviation: "",
      tasks: data || [],
      addSubtask: defaultAddSubtaskValues,
    };
  }, []);

  const methods = useForm({
    resolver: yupResolver(schemaValidation),
    defaultValues,
  });

  const fetchProject = useCallback(async () => {
    if (!id) return;

    try {
      methods.reset({
        id,
        project_name: faker.company.name(),
        project_status: "Active",
        project_id: "PRJ-" + faker.number.int({ min: 1000, max: 9999 }),
        start_date: faker.date.past().toISOString().split("T")[0],
        expected_due_date: faker.date.future().toISOString().split("T")[0],
        strategic_objective: [],
        description: "",
        abbreviation: "",
        tasks: data || [],
        addSubtask: defaultAddSubtaskValues,
      });
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return (
    <div>
      <FormProvider {...methods}>
        <ProjectDetailHeader tab={tab} onChangeTab={setTab} />

        <div className="mt-6 ">
          <ProjectDetailTableList />
        </div>
      </FormProvider>
    </div>
  );
}
