import React from "react";
import FabricsWithColors from "../components/ShirtCustomise/FabricColorSelect";
import { ToastContainer } from "react-toastify";

const page = () => {
  return (
    <div className="flex flex-col w-full justify-center items-center pb-4 sm:pb-0 font-play h-fit">
      <ToastContainer/>
      <FabricsWithColors />
    </div>
  );
};

export default page;
