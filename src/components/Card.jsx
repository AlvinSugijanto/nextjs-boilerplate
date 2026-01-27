import React from "react";

const Card = ({ item, index }) => {
  return (
    <div className="h-full rounded-3xl bg-[#EAF4FF] p-10 border">
      <div className=" h-10 w-10 rounded-full border border-[#354C64] flex items-center justify-center text-lg font-medium">
        {index + 1}
      </div>

      <h3 className=" mt-8 sm:mt-20 text-xl font-semibold">{item.title}</h3>

      <p className="mt-4 text-sm leading-relaxed text-justify">
        {item.description}
      </p>
    </div>
  );
};

export default Card;
