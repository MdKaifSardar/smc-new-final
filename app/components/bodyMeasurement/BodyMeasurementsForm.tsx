"use client";
import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { BodyMeasurements, MeasurementField } from "@/app/utils/data/measurement";
import { savedBodyMeasurementsState } from "@/app/utils/data/store";
import Image from "next/image";

interface BodyMeasurementsFormProps {
  initialMeasurements?: BodyMeasurements;
  onChange: (measurements: BodyMeasurements) => void;
}

const createDefaultMeasurementField = (): MeasurementField => ({
  value: { value: null, unit: "inch" },
  description: "",
});

const BodyMeasurementsForm: React.FC<BodyMeasurementsFormProps> = ({ initialMeasurements, onChange }) => {
  const [savedMeasurements, setSavedMeasurements] = useAtom(savedBodyMeasurementsState);
  const initialBodyMeasurements = initialMeasurements || savedMeasurements || {
    neck: createDefaultMeasurementField(),
    chest: createDefaultMeasurementField(),
    waist: createDefaultMeasurementField(),
    hips: createDefaultMeasurementField(),
    sleeveLength: createDefaultMeasurementField(),
    elbowWidth: createDefaultMeasurementField(),
    upperArm: createDefaultMeasurementField(),
    shoulder: createDefaultMeasurementField(),
  };

  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurements>(initialBodyMeasurements);
  const [activeField, setActiveField] = useState<keyof BodyMeasurements>("neck");

  const imageMapping: Record<keyof BodyMeasurements, string> = {
    neck: 'https://res.cloudinary.com/dlxpcyiin/image/upload/v1738778881/cloud1_wqszqi.png',
    chest: 'https://res.cloudinary.com/dlxpcyiin/image/upload/v1738778882/cloud3_wlv17l.png',
    waist: 'https://res.cloudinary.com/dlxpcyiin/image/upload/v1738778881/cloud1_wqszqi.png',
    hips: 'https://res.cloudinary.com/dlxpcyiin/image/upload/v1738778881/cloud1_wqszqi.png',
    sleeveLength: 'https://res.cloudinary.com/dlxpcyiin/image/upload/v1738778882/cloud3_wlv17l.png',
    elbowWidth: 'https://res.cloudinary.com/dlxpcyiin/image/upload/v1738778883/cloud2_rbgkik.png',
    upperArm: 'https://res.cloudinary.com/dlxpcyiin/image/upload/v1738778882/cloud3_wlv17l.png',
    shoulder: 'https://res.cloudinary.com/dlxpcyiin/image/upload/v1738778881/cloud1_wqszqi.png',
  };

  useEffect(() => {
    setSavedMeasurements(bodyMeasurements);
  }, [bodyMeasurements, setSavedMeasurements]);

  const handleChange = (typedField: keyof BodyMeasurements, key: string, value: string) => {
    const updatedMeasurements = {
      ...bodyMeasurements,
      [typedField]: {
        ...bodyMeasurements[typedField],
        value: {
          ...bodyMeasurements[typedField].value,
          [key]: value,
        },
      },
    };
    setBodyMeasurements(updatedMeasurements);
    onChange(updatedMeasurements);
  };

  const renderMeasurementFields = () => {
    return Object.keys(bodyMeasurements).map((field) => {
      const typedField = field as keyof BodyMeasurements;
      const measurementField = bodyMeasurements[typedField];
      return (
        <div key={field} className="flex flex-col md:flex-row items-center gap-4 mb-6">
          {/* Label */}
          <label className="block text-gray-700 text-sm font-bold md:w-1/3 capitalize">
            {field.replace(/([A-Z])/g, " $1")}
          </label>

          {/* Input and Dropdown */}
          <div className="flex gap-2 w-full md:w-2/3">
            <input
              type="number"
              placeholder="Enter measurement"
              value={measurementField?.value?.value ?? ""}
              onChange={(e) => handleChange(typedField, "value", e.target.value)}
              onFocus={() => setActiveField(typedField)}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            />
            <select
              value={measurementField?.value?.unit || "inch"}
              onChange={(e) => handleChange(typedField, "unit", e.target.value)}
              onFocus={() => setActiveField(typedField)}
              className="w-24 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
            >
              <option value="inch">inches</option>
              <option value="cm">cm</option>
            </select>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800">
        Body Measurements
      </h2>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="space-y-4">
            {renderMeasurementFields()}
          </div>
        </div>
        
        {/* Right side - Image */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="relative w-full h-64 sm:h-80 md:h-96">
            <Image
              src={imageMapping[activeField]}
              alt="Measurement Guide"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="mt-4 text-sm text-gray-600 text-center max-w-md">
            Click on any measurement field to see the corresponding guide image
          </p>
        </div>
      </div>
    </div>
  );
};

export default BodyMeasurementsForm;