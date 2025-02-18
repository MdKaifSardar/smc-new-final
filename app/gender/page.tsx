"use client";
import React, { useState } from "react";
import GenderSelect from "@/app/components/ShirtCustomise/GenderSelect";
import { useRouter } from "next/navigation";

const GenderPage = () => {
  const [selectedGender, setSelectedGender] = useState("male");
  const router = useRouter();

  const handleNext = () => {
    localStorage.setItem("gender", selectedGender);
    router.push("/form-new");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-8">
      <GenderSelect selectedGender={selectedGender} onChange={setSelectedGender} />
      <button
        onClick={handleNext}
        className="bg-[#C40600] text-white py-3 px-6 rounded-lg transition duration-300 hover:bg-[#a30500]"
      >
        Next
      </button>
    </div>
  );
};

export default GenderPage;
