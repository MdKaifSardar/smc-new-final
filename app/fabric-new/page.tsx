"use client"
import React, { useState } from "react";
import FabricsWithColors from "../components/ShirtCustomise/FabricColorSelect";
import { FaSpinner } from "react-icons/fa";

const page = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [reload, setReload] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [loading, setLoading] = useState(false);

  const handleReload = () => {
    setLoading(true);
    setReload(!reload);
    setTimeout(() => setLoading(false), 1000); // Simulate loading time
  };

  return (
    <div className="flex flex-col justify-center items-center pb-4 sm:pb-0 font-play w-full h-fit">
      <button onClick={handleReload} className="mb-4 p-2 bg-blue-500 text-white rounded">
        Reload
      </button>
      {loading ? (
        <div className="flex justify-center">
          <FaSpinner className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className={`transition-transform duration-500 ${reload ? "transform rotate-180" : ""}`}>
          <FabricsWithColors key={reload.toString()} />
        </div>
      )}
    </div>
  );
};

export default page;
