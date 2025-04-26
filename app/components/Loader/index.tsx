"use client";
import React from "react";

const Loader = () => {
  return (
    <div className="absolute inset-0 flex justify-center items-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#C40600] border-solid"></div>
    </div>
  );
};

export default Loader;
