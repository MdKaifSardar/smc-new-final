"use client";
import React from "react";
import Image from "next/image";

interface GenderSelectProps {
  selectedGender: string;
  onChange: (gender: string) => void;
}

const maleImage = "https://via.placeholder.com/150?text=Male";
const femaleImage = "https://via.placeholder.com/150?text=Female";

const GenderSelect: React.FC<GenderSelectProps> = ({
  selectedGender,
  onChange,
}) => {
  return (
    <div className="flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold mt-[7rem] lg:mt-[8rem] xl:mt-[4rem] mb-4 text-center">Gender</h2>
      <div className="flex-col justify-center items-center md:flex-row flex gap-4">
        <div
          className={`cursor-pointer p-2 rounded-lg border ${
            selectedGender === "male" ? "border-blue-500" : "border-transparent"
          }`}
          onClick={() => {
            onChange("male");
            localStorage.setItem("gender", "male");
          }}
        >
          <Image
            src="/c1.webp"
            alt="Male"
            width={150}
            height={150}
            className="w-[15rem] md:w-[20rem] object-cover h-[20rem] rounded-lg"
          />
          <p className="mt-2 text-center font-medium">Male</p>
        </div>
        <div
          className={`cursor-pointer p-2 rounded-lg border ${
            selectedGender === "female" ? "border-blue-500" : "border-transparent"
          }`}
          onClick={() => {
            onChange("female");
            localStorage.setItem("gender", "female");
          }}
        >
          <Image
            src="/femalenew.webp"
            alt="Female"
            width={150}
            height={150}
            className="w-[15rem] md:w-[20rem] object-cover h-[20rem] rounded-lg"
          />
          <p className="mt-2 text-center font-medium">Female</p>
        </div>
      </div>
    </div>
  );
};

export default GenderSelect;
