import {
  Map,
  LayoutDashboard,
  TableProperties,
  Grid2x2Plus,
  BetweenHorizontalStart,
} from "lucide-react";

const NavigationsList = () => {
  return [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Table",
      url: "/example-table",
      icon: TableProperties,
    },
    {
      name: "Map",
      url: "/example-map",
      icon: Map,
    },
    {
      name: "Master Data",
      url: "/master-data",
      icon: BetweenHorizontalStart,
    },
  ];
};

export default NavigationsList;
