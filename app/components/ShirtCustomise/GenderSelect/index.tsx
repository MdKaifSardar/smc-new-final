"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

interface GenderSelectProps {
  selectedGender: string;
  onChange: (gender: string) => void;
}

const GenderSelect: React.FC<GenderSelectProps> = ({ selectedGender, onChange }) => {
  const [genders, setGenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenders = async () => {
      try {
        const fabricId = localStorage.getItem("fabricId");
        const colorId = localStorage.getItem("colorId");
        if (!fabricId || !colorId) {
          throw new Error("Fabric or Color ID missing in localStorage.");
        }
        // Dynamically import the server-side function
        const { getGendersByColorAndFabric } = await import(
          "@/lib/database/actions/admin/ShirtArea/Gender/gender.actions"
        );
        const gendersData = await getGendersByColorAndFabric(fabricId, colorId);
        setGenders(gendersData);
      } catch (error: any) {
        toast.error(error.message || "Error fetching genders.");
      } finally {
        setLoading(false);
      }
    };

    fetchGenders();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold mb-4 text-center">Gender</h2>
      <div className="flex-col justify-center items-center md:flex-row flex gap-4">
        {loading ? (
          <p>Loading...</p>
        ) : genders.length === 0 ? (
          <p>No Genders Found</p>
        ) : (
          genders.map((gender) => (
            <div
              key={gender._id}
              className={`cursor-pointer p-2 rounded-lg border ${
                selectedGender === gender.name ? "border-blue-500" : "border-transparent"
              }`}
              onClick={() => {
                onChange(gender.name);
                localStorage.setItem("gender", gender.name);
              }}
            >
              <Image
                src={gender.image.url}
                alt={gender.name}
                width={150}
                height={150}
                className="w-[15rem] md:w-[20rem] object-cover h-[20rem] rounded-lg"
              />
              <p className="mt-2 text-center font-medium">{gender.name}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GenderSelect;
