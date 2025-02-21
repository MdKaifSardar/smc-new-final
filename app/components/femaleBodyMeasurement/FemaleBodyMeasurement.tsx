"use client";
import React, { useState, useEffect } from "react";
import {
  FemaleBodyMeasurements,
  MeasurementField,
} from "@/app/utils/data/measurement";
import Image from "next/image";

interface FemaleBodyMeasurementFormProps {
  initialMeasurements?: FemaleBodyMeasurements;
  onChange: (measurements: FemaleBodyMeasurements) => void;
}

const createDefaultMeasurementField = (): MeasurementField => ({
  value: { value: null, unit: "inch" },
  description: "",
});

const FemaleBodyMeasurement: React.FC<FemaleBodyMeasurementFormProps> = ({
  initialMeasurements,
  onChange,
}) => {
  const initial: FemaleBodyMeasurements = initialMeasurements || {
    neck: createDefaultMeasurementField(),
    chest: createDefaultMeasurementField(),
    waist: createDefaultMeasurementField(),
    breastPoint: createDefaultMeasurementField(),
    waistPoint: createDefaultMeasurementField(),
    hips: createDefaultMeasurementField(),
    shoulder: createDefaultMeasurementField(),
    wrist: createDefaultMeasurementField(),
    // sleeveLength: createDefaultMeasurementField(),
    // shirtLength: createDefaultMeasurementField(),
  };

  const [measurements, setMeasurements] =
    useState<FemaleBodyMeasurements>(initial);
  const [activeField, setActiveField] =
    useState<keyof FemaleBodyMeasurements>("neck");

  const imageMapping: Record<keyof FemaleBodyMeasurements, string> = {
    neck: "https://res.cloudinary.com/dlxpcyiin/image/upload/v1738778881/cloud1_wqszqi.png",
    chest:
      "https://res.cloudinary.com/dlxpcyiin/image/upload/v1738778882/cloud3_wlv17l.png",
    waist:
      "https://res.cloudinary.com/dlxpcyiin/image/upload/v1738778881/cloud1_wqszqi.png",
    breastPoint:
      "https://res.cloudinary.com/dlxpcyiin/image/upload/v1738778883/cloud2_rbgkik.png",
    waistPoint:
      "https://res.cloudinary.com/dlxpcyiin/image/upload/v1738778881/cloud1_wqszqi.png",
    hips: "https://res.cloudinary.com/dlxpcyiin/image/upload/v1738778881/cloud1_wqszqi.png",
    shoulder:
      "https://res.cloudinary.com/dlxpcyiin/image/upload/v1738778881/cloud1_wqszqi.png",
    wrist:
      "https://res.cloudinary.com/dlxpcyiin/image/upload/v1738778883/cloud2_rbgkik.png",
    // sleeveLength:
    //   "https://res.cloudinary.com/dlxpcyiin/image/upload/v1738778882/cloud3_wlv17l.png",
    // shirtLength:
    //   "https://res.cloudinary.com/dlxpcyiin/image/upload/v1738778883/cloud2_rbgkik.png",
  };

  useEffect(() => {
    onChange(measurements);
  }, [measurements, onChange]);

  const handleChange = (
    field: keyof FemaleBodyMeasurements,
    key: string,
    value: string
  ) => {
    const updated = {
      ...measurements,
      [field]: {
        ...measurements[field],
        value: {
          ...measurements[field].value,
          [key]: value,
        },
      },
    };
    setMeasurements(updated);
  };

  return (
    <div className="w-full p-2 sm:p-4">
      {/* <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">
        Female Body Measurements
      </h2> */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="space-y-2 sm:space-y-4">
            {Object.keys(measurements).map((field) => {
              const typedField = field as keyof FemaleBodyMeasurements;
              const measurementField = measurements[typedField];
              return (
                <div
                  key={field}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 py-2"
                >
                  <label className="block text-gray-700 text-sm font-medium w-full sm:w-1/3 capitalize">
                    {field.replace(/([A-Z])/g, " $1")}
                  </label>
                  <div className="flex gap-2 w-full sm:w-2/3">
                    <input
                      type="number"
                      placeholder="Enter measurement"
                      value={measurementField?.value?.value ?? ""}
                      onChange={(e) =>
                        handleChange(typedField, "value", e.target.value)
                      }
                      onFocus={() => setActiveField(typedField)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm sm:text-base"
                    />
                    <select
                      value={measurementField?.value?.unit || "inch"}
                      onChange={(e) =>
                        handleChange(typedField, "unit", e.target.value)
                      }
                      onFocus={() => setActiveField(typedField)}
                      className="w-20 sm:w-24 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-sm sm:text-base"
                    >
                      <option value="inch">inches</option>
                      <option value="cm">cm</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Right side - Image */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200">
          <div className="relative w-full h-48 sm:h-64 lg:h-96">
            <Image
              src={imageMapping[activeField]}
              alt="Measurement guide"
              fill
              className="object-contain"
            />
          </div>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 text-center max-w-md px-2">
            Click on any measurement field to see the corresponding guide image
          </p>
        </div>
      </div>
    </div>
  );
};

export default FemaleBodyMeasurement;
