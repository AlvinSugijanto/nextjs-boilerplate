"use client";

import React, { useEffect, useState } from "react";
import ProductHero from "../products/ProductHero";
import DownloadModal from "./DownloadModal";
import { useGetDataDb, useUpdateData } from "@/utils/collection";
import { useSearchParams } from "next/navigation";

export default function ResourcesView() {
  const searchParams = useSearchParams();
  const brochureId = searchParams.get("id");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brochureType, setBrochureType] = useState("");
  const { data: brochureData } = useGetDataDb(
    `/api/collection/listCustomer/${brochureId}`,
    {},
    !brochureId,
  );

  const { updateData } = useUpdateData();

  const handleDownloadClick = (type) => {
    setBrochureType(type);
    setIsModalOpen(true);
  };

  const downloadBrochure = (type) => {
    const isBrochure = type === "Nawadhya Big Data Brochure";

    const file = {
      path: isBrochure
        ? "/Nawadhya Big Data Brochure.pdf"
        : "/Nawadhya Product Line 2026.pdf",
      name: isBrochure
        ? "Nawadhya Big Data Brochure.pdf"
        : "Nawadhya Product Line 2026.pdf",
    };

    const link = document.createElement("a");
    link.href = file.path;
    link.download = file.name;
    link.target = "_blank";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const submitSheets = async (data) => {
    try {
      const res = await fetch("/api/sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          brochureType: data.type,
        }),
      });

      return true;
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
      return false;
    }
  };

  const updateDataPb = async () => {
    try {
      await updateData(`/api/collection/listCustomer/${brochureId}`, {
        status: "verified",
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!searchParams || !brochureData) return;

    if (!brochureId) return;

    const handleFlow = async () => {
      if (brochureData.status === "unverified") {
        downloadBrochure(brochureData.type);
        await submitSheets(brochureData);
        await updateDataPb();
      }

      setTimeout(() => {
        window.history.replaceState({}, "", "/resources");
      }, 1000);
    };

    handleFlow();
  }, [brochureData]);

  return (
    <div
      className={`min-h-screen text-sm transition-colors duration-300 overflow-hidden`}
    >
      <ProductHero
        src="/assets/products/consultation/1.jpg"
        header="Resources"
        title="Data Sheets"
        description={
          <div className="flex flex-col gap-4">
            <p>Download our data sheet through the button below</p>
            <div className="flex flex-col xs:flex-row gap-3 items-start xs:items-center">
              <button
                onClick={() =>
                  handleDownloadClick("Nawadhya Big Data Brochure")
                }
                className="bg-gray-500 hover:bg-gray-600 px-6 py-3 rounded-3xl border transition-colors"
              >
                Nawadhya Brocure
              </button>

              <button
                onClick={() =>
                  handleDownloadClick("Nawadhya Product Line 2026")
                }
                className="bg-gray-500 hover:bg-gray-600 px-6 py-3 rounded-3xl border transition-colors"
              >
                Nawadhya Product Line 2026
              </button>
            </div>
          </div>
        }
        lightningType="horizontal"
      />

      {/* Download Modal */}
      <DownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        brochureType={brochureType}
      />
    </div>
  );
}
