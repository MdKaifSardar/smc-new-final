"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useAtom } from "jotai";
import ShirtMeasurementsForm from "../components/shirtMeasurement/ShirtMeasurementsForm";
import BodyMeasurementsForm from "../components/bodyMeasurement/BodyMeasurementsForm";
import FemaleBodyMeasurement from "../components/femaleBodyMeasurement/FemaleBodyMeasurement";
import {
  ShirtMeasurements,
  BodyMeasurements,
  FemaleMeasurements,
} from "@/app/utils/data/measurement";
import { createMeasurement } from "@/lib/database/actions/measurement.actions";
import { updateShirtIds } from "@/lib/database/actions/admin/ShirtArea/Shirt/shirt.actions";
import { addShirtToCart } from "@/lib/database/actions/cart.actions";
import { savedShirtMeasurementsState, savedBodyMeasurementsState } from "@/app/utils/data/store";

const Page = () => {
  const router = useRouter();
  const { user } = useUser();
  const [shirtMeasurements, setShirtMeasurements] = useAtom(savedShirtMeasurementsState);
  const [bodyMeasurements, setBodyMeasurements] = useAtom(savedBodyMeasurementsState);
  const [femaleBodyMeasurements, setFemalBodyMeasurements] = useAtom(savedBodyMeasurementsState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gender, setGender] = useState("male"); // new state for gender

  // Get gender from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedGender = localStorage.getItem("gender");
      setGender(storedGender === "female" ? "female" : "male");
    }
  }, []);

  const handleShirtMeasurementsChange = (measurements: ShirtMeasurements) => {
    setShirtMeasurements(measurements);
  };

  const handleBodyMeasurementsChange = (measurements: BodyMeasurements) => {
    setBodyMeasurements(measurements);
  };

  const handleFemaleBodyMeasurementsChange = (measurements: FemaleMeasurements) => {
    setFemalBodyMeasurements(measurements);
  };

  const handleSubmit = async () => {
    if (isSubmitting || !user) return;
    setIsSubmitting(true);

    try {
      // 1. Create measurement
      const measurementResponse = await createMeasurement({
        shirt: shirtMeasurements,
        body: bodyMeasurements,
      });

      if (!measurementResponse.success) {
        throw new Error(measurementResponse.message);
      }

      // 2. Get shirtId from localStorage
      const shirtId = localStorage.getItem("shirtId");
      if (!shirtId) throw new Error("Shirt ID not found");

      // 3. Update shirt with measurement ID
      const updateResponse = await updateShirtIds(
        shirtId,
        undefined,
        measurementResponse.id as string
      );

      if (!updateResponse.success) {
        throw new Error(updateResponse.message);
      }

      // 4. Add shirt to cart with quantity 1
      const cartResponse = await addShirtToCart(shirtId, user.id, 1);
      if (!cartResponse.success) {
        throw new Error(cartResponse.message);
      }

      // 5. Success - clean up and redirect
      toast.success("Measurements saved and shirt added to cart!");
      localStorage.removeItem("shirtId");
      router.push("/cart");
    } catch (error: any) {
      toast.error(error.message || "Failed to process request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="pt-28 px-4 py-2 text-center">
        <p>Please sign in to continue</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-16 sm:pt-20 px-3 sm:px-6 lg:px-8 pb-6 sm:pb-10">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-12">
        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-10 text-gray-800">
          Custom Measurements
        </h1>
        
        {/* Shirt Measurements Section */}
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
            Shirt Measurements
          </h2>
          <ShirtMeasurementsForm
            initialMeasurements={shirtMeasurements || undefined}
            onChange={handleShirtMeasurementsChange}
          />
        </div>

        {/* Conditional Body Measurements Section */}
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
            {gender === "female" ? "Female Body Measurements" : "Male Body Measurements"}
          </h2>
          {gender === "female" ? (
            <FemaleBodyMeasurement
              initialMeasurements={femaleBodyMeasurements || undefined}
              onChange={handleFemaleBodyMeasurementsChange}
            />
          ) : (
            <BodyMeasurementsForm
              initialMeasurements={bodyMeasurements || undefined}
              onChange={handleBodyMeasurementsChange}
            />
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4 sm:pt-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg 
                     font-semibold hover:bg-red-700 transition-colors disabled:opacity-50
                     disabled:cursor-not-allowed text-base sm:text-lg w-full sm:w-auto 
                     min-w-[200px] shadow-sm"
          >
            {isSubmitting ? "Saving..." : "Save Measurements"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;