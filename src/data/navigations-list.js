import {
  Map,
  LayoutDashboard,
  TableProperties,
  Grid2x2Plus,
  BetweenHorizontalStart,
  ClipboardMinus,
} from "lucide-react";

const NavigationsList = () => {
  return [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    // {
    //   name: "Table",
    //   url: "/example-table",
    //   icon: TableProperties,
    // },
    // {
    //   name: "Map",
    //   url: "/example-map",
    //   icon: Map,
    // },
    {
      name: "Report",
      url: "/report",
      icon: ClipboardMinus,
    },
    {
      name: "Master Data",
      url: "/master-data/project",
      icon: BetweenHorizontalStart,
    },
  ];
};

export default NavigationsList;
