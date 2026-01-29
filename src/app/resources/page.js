import ResourcesView from "@/sections/resources/view";
import { Suspense } from "react";

export const metadata = {
  title: "Bodha Padma Nawadhya: Resources",
};

const ResourcesPage = () => {
  return (
    <Suspense fallback={<div></div>}>
      <ResourcesView />
    </Suspense>
  );
};

export default ResourcesPage;
