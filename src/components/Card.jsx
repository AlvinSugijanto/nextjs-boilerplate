import React from "react";

const Card = ({ item, index }) => {
  return (
    <div className="h-full rounded-3xl bg-[#EAF4FF] p-6 sm:p-8 xs:p-10 border flex flex-col">
      <div className="h-10 w-10 rounded-full border border-[#354C64] flex items-center justify-center text-lg font-medium">
        {index + 1}
      </div>

      <div className="flex flex-col flex-1 mt-8 md:mt-12 lg:mt-20 gap-4">
        {/* Fixed title height */}
        <h3 className="text-xl font-semibold min-h-8 sm:min-h-14">
          {item.title}
        </h3>

        {/* Description always aligned */}
        <p className="text-sm leading-relaxed ">{item.description}</p>
      </div>
    </div>
  );
};

export default Card;
