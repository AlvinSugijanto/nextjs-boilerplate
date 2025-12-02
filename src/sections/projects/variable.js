import { faker } from "@faker-js/faker";

export const LIST_HEALTH_LEVEL = [
  {
    value: 1,
    label: 1,
  },
  {
    value: 2,
    label: 2,
  },
  {
    value: 3,
    label: 3,
  },
  {
    value: 4,
    label: 4,
  },
  {
    value: 5,
    label: 5,
  },
];

export const LIST_PRIORITY_LEVELS = [
  {
    value: "Low",
    label: "Low",
  },
  {
    value: "Medium",
    label: "Medium",
  },
  {
    value: "High",
    label: "High",
  },
  {
    value: "Critical",
    label: "Critical/Very High",
  },
];

export const LIST_PROJECT_STATUS = [
  {
    value: "Proposed and Requested",
    label: "Proposed and Requested",
  },
  {
    value: "Approved",
    label: "Approved",
  },
  {
    value: "Planning In Progress",
    label: "Planning In Progress",
  },
  {
    value: "Complete",
    label: "Complete",
  },
  {
    value: "On Hold",
    label: "On Hold",
  },
  {
    value: "Monitor",
    label: "Monitor",
  },
];

export const LIST_RISK_LEVEL = [
  {
    value: "Low",
    label: "Low",
  },
  {
    value: "Medium",
    label: "Medium",
  },
  {
    value: "High",
    label: "High",
  },
  {
    value: "Critical",
    label: "Critical/Very High",
  },
];

export const LIST_STRATEGIC_OBJECTIVE = [
  {
    value: "Financial Performance",
    label: "Financial Performance",
  },
  {
    value: "Operational Effiency",
    label: "Operational Effiency",
  },
  {
    value: "Sustainability & Compliance",
    label: "Sustainability & Compliance",
  },
  {
    value: "Innovation & Digital Transformation",
    label: "Innovation & Digital Transformation",
  },
  {
    value: "Stakeholder & Customer Value",
    label: "Stakeholder & Customer Value",
  },
];

export const LIST_TIMEFRAME = [
  {
    value: "Delay",
    label: "Delay",
  },
  {
    value: "On Going",
    label: "On Going",
  },
  {
    value: "Done",
    label: "Done",
  },
  {
    value: "Open",
    label: "Open",
  },
];

export const LIST_DEPARTMENTS = [
  {
    value: "Legal",
    label: "Legal",
  },
  {
    value: "Operations",
    label: "Operations",
  },
  {
    value: "FAT",
    label: "FAT",
  },
  {
    value: "Procurement",
    label: "Procurement",
  },
  {
    value: "HCGA",
    label: "HCGA",
  },
  {
    value: "Corporate Strategy",
    label: "Corporate Strategy",
  },
];

export const LIST_USERS = [...new Array(20)].map((_, i) => ({
  value: `user-${i + 1}`,
  label: faker.person.fullName(),
  email: faker.internet.email(),
  avatar: faker.image.avatar(),
}));
