import React from "react";

// components
import SectionCards from "../section-cards";
import { BarChartComponents, ChartPieDonutText } from "@/components/chart";
import { TypographyH3, TypographyH4 } from "@/components/typography";

const chartDataProjectHealth = [
  {
    name: "Project 1",
    value: 186,
    color: "var(--primary-100)",
  },
  {
    name: "Project 2",
    value: 145,
    color: "var(--primary-200)",
  },
  {
    name: "Project 3",
    value: 120,
    color: "var(--primary-300)",
  },
  {
    name: "Project 4",
    value: 160,
    color: "var(--primary-400)",
  },
  {
    name: "Project 5",
    value: 120,
    color: "var(--primary-500)",
  },
  {
    name: "Membangun Jalan Tol",
    value: 170,
    color: "var(--primary-600)",
  },
  {
    name: "Membajak Sawah",
    value: 90,
  },
];

const chartDataRiskRadial = [
  { name: "Low", value: 275, color: "var(--chart-risk-low)" },
  { name: "Medium", value: 200, color: "var(--chart-risk-medium)" },
  { name: "High", value: 287, color: "var(--chart-risk-high)" },
  {
    name: "Critical/Very High",
    value: 173,
    color: "var(--chart-risk-critical)",
  },
];

const chartDataProjectTimeframe = [
  {
    name: "Open",
    value: 10,
  },
  {
    name: "On Going",
    value: 11,
    color: "var(--chart-timeframe-ongoing)",
  },
  {
    name: "Done",
    value: 8,
    color: "var(--chart-timeframe-done)",
  },
  {
    name: "Delay",
    value: 4,
    color: "var(--chart-timeframe-delay)",
  },
];

const chartDataProjectStatus = [
  {
    name: "Proposed & Requested",
    value: 4,
    color: "var(--chart-status-pnr)",
  },
  {
    name: "Approved",
    value: 10,
    color: "var(--chart-status-approved)",
  },
  {
    name: "On Hold",
    value: 4,
    color: "var(--chart-status-hold)",
  },
  {
    name: "Monitor",
    value: 5,
    color: "var(--chart-status-monitor)",
  },
  {
    name: "Planning",
    value: 6,
    color: "var(--chart-status-planning)",
  },
  {
    name: "In Progress",
    value: 2,
    color: "var(--chart-status-inprogress)",
  },
  {
    name: "Completed",
    value: 10,
    color: "var(--chart-status-complete)",
  },
];

const chartDataProjectStrategic = [
  {
    name: "Improve Customer Loyalty",
    value: 4,
    color: "var(--primary-100)",
  },
  {
    name: "Modernize Technology",
    value: 10,
    color: "var(--primary-200)",
  },
  {
    name: "Expand Through M&A",
    value: 4,
    color: "var(--primary-300)",
  },
  {
    name: "Grow & Innovate",
    value: 5,
    color: "var(--primary-400)",
  },
  {
    name: "Generate Leads",
    value: 6,
    color: "var(--primary-500)",
  },
  {
    name: "Increase Sales",
    value: 2,
    color: "var(--primary-600)",
  },
];

const DashboardView = () => {
  return (
    <>
      <TypographyH4 className="mb-4">Dashboard CEO</TypographyH4>

      <SectionCards />

      <BarChartComponents
        title="Project Health"
        data={chartDataProjectHealth}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPieDonutText title="Risk Radial" data={chartDataRiskRadial} />

        <BarChartComponents
          title="Timeframe"
          data={chartDataProjectTimeframe}
        />

        <BarChartComponents
          title="Project Status"
          data={chartDataProjectStatus}
        />
        <BarChartComponents
          title="Project Strategic Objectives"
          data={chartDataProjectStrategic}
        />
      </div>
    </>
  );
};

export default DashboardView;
