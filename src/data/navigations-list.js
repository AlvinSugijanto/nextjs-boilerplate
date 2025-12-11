import {
  Map,
  LayoutDashboard,
  TableProperties,
  ClipboardMinus,
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
      name: "Report",
      url: "/report",
      icon: ClipboardMinus,
    },
  ];
};

export default NavigationsList;
