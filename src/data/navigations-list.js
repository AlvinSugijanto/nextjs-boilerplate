import { Map, LayoutDashboard, TableProperties } from "lucide-react";

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
      url: "/map",
      icon: Map,
    },
  ];
};

export default NavigationsList;
