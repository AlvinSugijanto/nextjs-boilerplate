import ResourcesView from "@/sections/resources/view";
import { Suspense } from "react";

export const metadata = {
  title: "Nawadhya: Resources",
};

const ResourcesPage = () => {
  return (
    <Suspense fallback={<></>}>
      <ResourcesView />
    </Suspense>
  );
};

export default ResourcesPage;
