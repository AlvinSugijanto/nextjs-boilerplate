import { faker } from "@faker-js/faker";
import { LIST_DEPARTMENTS, LIST_RISK_LEVEL, LIST_USERS } from "./variable";

export const statuses = ["In Progress", "Done", "Planning", "Pending"];
export const healthLevels = [1, 2, 3, 4, 5];
export const priorities = ["Critical", "High", "Medium", "Low"];

function generateProjectData(totalProjects = 100) {
  const types = [
    "Web Application",
    "Mobile Development",
    "Data Infrastructure",
    "Enterprise Software",
    "Artificial Intelligence",
    "Infrastructure",
    "FinTech",
    "UI/UX",
    "Database",
    "Security",
    "Backend Development",
    "Marketing Tech",
    "API Development",
    "Analytics",
    "Content Management",
  ];

  const projects = [];

  for (let i = 1; i <= totalProjects; i++) {
    const budget = faker.number.int({ min: 10000, max: 200000 });
    const actual = faker.number.int({
      min: Math.floor(budget * 0.1),
      max: Math.floor(budget * 0.9),
    });
    const progress = faker.number.int({ min: 0, max: 100 });
    const startDate = faker.date.future({ years: 0.1 }).toISOString();
    const expectedCompletion = faker.date.future({ years: 0.5 }).toISOString();

    const project = {
      id: i.toString(),
      name: faker.company.catchPhrase(),
      type: faker.helpers.arrayElement(types),
      status: faker.helpers.arrayElement(statuses),
      healthLevel: faker.helpers.arrayElement(healthLevels),
      priority: faker.helpers.arrayElement(priorities),
      taskId: `${faker.string.alpha({
        length: 3,
        casing: "upper",
      })}-${faker.string.numeric(3)}`,
      department: faker.helpers.arrayElement(
        LIST_DEPARTMENTS.map((d) => d.value)
      ),
      assignee: [
        faker.helpers.arrayElement(LIST_USERS.map((user) => user.value)),
      ],
      budget: budget,
      actual: actual,
      budgetLessActual: budget - actual,
      startDate: startDate,
      expectedCompletion: expectedCompletion,
      daysRemaining: faker.number.int({ min: 0, max: 100 }),
      timeframe: `Q${faker.number.int({ min: 1, max: 4 })} ${faker.number.int({
        min: 2024,
        max: 2026,
      })}`,
      progress: progress,
      riskLevel: faker.helpers.arrayElement(
        LIST_RISK_LEVEL.map((r) => r.value)
      ),
      associatedRisk: faker.hacker.phrase(),
      costBenefit: faker.helpers.arrayElement([
        "High benefit / low cost",
        "High benefit / moderate cost",
        "High value",
        "Medium benefit / medium cost",
        "Critical",
      ]),
      comment: faker.lorem.sentence(),
      attachment: faker.datatype.boolean()
        ? `${faker.system.commonFileName("pdf")}`
        : "",
    };

    // 70% chance untuk memiliki subtasks
    if (faker.datatype.boolean({ probability: 0.7 })) {
      project.subtasks = generateSubtasks(
        i,
        faker.number.int({ min: 1, max: 7 })
      );
    }

    projects.push(project);
  }

  return projects;
}

function generateSubtasks(parentId, count) {
  const subtasks = [];

  for (let i = 1; i <= count; i++) {
    const budget = faker.number.int({ min: 1000, max: 30000 });
    const actual = faker.number.int({
      min: Math.floor(budget * 0.1),
      max: Math.floor(budget * 0.9),
    });
    const progress = faker.number.int({ min: 0, max: 100 });
    const startDate = faker.date.future({ years: 0.1 }).toISOString();
    const expectedCompletion = faker.date.future({ years: 0.3 }).toISOString();

    const subtask = {
      id: `${parentId}.${i}`,
      name: faker.commerce.productName() + " " + faker.company.buzzNoun(),
      type: faker.helpers.arrayElement([
        "Feature",
        "Bug Fix",
        "Enhancement",
        "Research",
        "Documentation",
      ]),
      status: faker.helpers.arrayElement([
        "In Progress",
        "Done",
        "Planning",
        "Pending",
      ]),
      healthLevel: faker.helpers.arrayElement([
        "Excellent",
        "Good",
        "Fair",
        "Average",
        "Poor",
      ]),
      priority: faker.helpers.arrayElement([
        "Critical",
        "High",
        "Medium",
        "Low",
      ]),
      taskId: `${faker.string.alpha({
        length: 3,
        casing: "upper",
      })}-${faker.string.numeric(3)}-${faker.string.alpha({
        length: 1,
        casing: "upper",
      })}`,
      department: faker.helpers.arrayElement([
        "Web Development",
        "Mobile Team",
        "Data Engineering",
        "Design Team",
      ]),
      assignee: [
        faker.helpers.arrayElement(LIST_USERS.map((user) => user.value)),
      ],
      budget: budget,
      actual: actual,
      budgetLessActual: budget - actual,
      startDate: startDate,
      expectedCompletion: expectedCompletion,
      daysRemaining: faker.number.int({ min: 0, max: 60 }),
      timeframe: `${faker.number.int({
        min: 1,
        max: 4,
      })} ${faker.helpers.arrayElement(["Days", "Weeks", "Months"])}`,
      progress: progress,
      riskLevel: faker.helpers.arrayElement(
        LIST_RISK_LEVEL.map((r) => r.value)
      ),
      associatedRisk: faker.hacker.phrase(),
      costBenefit: faker.helpers.arrayElement(["High", "Medium", "Low"]),
      comment: faker.lorem.sentence(),
      attachment: faker.datatype.boolean()
        ? `${faker.system.commonFileName("pdf")}`
        : "",
    };

    // 50% chance untuk memiliki nested subtasks (hingga 3 level maksimal)
    if (
      faker.datatype.boolean({ probability: 0.5 }) &&
      subtask.id.split(".").length < 4
    ) {
      subtask.subtasks = generateSubtasks(
        subtask.id,
        faker.number.int({ min: 1, max: 3 })
      );
    }

    subtasks.push(subtask);
  }

  return subtasks;
}

export function generateDummyDataListProject(totalData = 100) {
  const projectsData = generateProjectData(totalData);

  // Hitung statistik
  const withSubtasks = projectsData.filter(
    (p) => p.subtasks && p.subtasks.length > 0
  ).length;

  const totalSubtasks = projectsData.reduce((total, project) => {
    return total + (project.subtasks ? project.subtasks.length : 0);
  }, 0);

  // console.log(`Generated ${projectsData.length} projects`);
  // console.log(`Projects dengan subtasks: ${withSubtasks}`);
  // console.log(`Total subtasks: ${totalSubtasks}`);

  return {
    data: projectsData,
    withSubtasks,
    totalSubtasks,
    totalProjects: projectsData.length,
  };
}

// Contoh penggunaan:
// const result = generateDummyDataListProject(50); // Generate 50 data
// const result = generateDummyDataListProject(); // Generate 100 data (default)
