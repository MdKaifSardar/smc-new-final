"use server";

import { connectToDatabase } from "../connect";
import MeasurementModel from "../models/ProductShirtModel/measurementshirt.model";

export async function createMeasurement(measurements: any) {
  try {
    await connectToDatabase();
    console.log("measurements : \n", measurements);

    const measurementData: any = {
      // Body measurements:
      neck: measurements.body?.neck?.value?.value,
      chest: measurements.body?.chest?.value?.value,
      waist: measurements.body?.waist?.value?.value,
      hips: measurements.body?.hips?.value?.value,
      shoulder: measurements.body?.shoulder?.value?.value,
      armhole: measurements.body?.armhole?.value?.value,
      bicep: measurements.body?.bicep?.value?.value,
      wrist: measurements.body?.wrist?.value?.value,
      elbow: measurements.body?.elbow?.value?.value,
      forearm: measurements.body?.forearm?.value?.value,
      elbowWidth: measurements.body?.elbowWidth?.value?.value,
      upperArm: measurements.body?.upperArm?.value?.value,
      // New measurements:
      breastPoint: measurements.body?.breastPoint?.value?.value,
      waistPoint: measurements.body?.waistPoint?.value?.value,
      // Shirt measurements:
      sleevesLength: measurements.shirt?.sleeveLength?.value?.value,
      shirtLength: measurements.shirt?.shirtLength?.value?.value,
      collar: measurements.shirt?.collar?.value?.value,
      halfChest: measurements.shirt?.halfChest?.value?.value,
      halfWaist: measurements.shirt?.halfWaist?.value?.value,
      halfHips: measurements.shirt?.halfHips?.value?.value,
      yoke: measurements.shirt?.yoke?.value?.value,
      halfArmhole: measurements.shirt?.halfArmhole?.value?.value,
      halfBicep: measurements.shirt?.halfBicep?.value?.value,
      cuff: measurements.shirt?.cuff?.value?.value,
    };

    const measurement = new MeasurementModel(measurementData);
    await measurement.save();

    return {
      id: measurement._id,
      message: "Measurements created successfully",
      success: true,
    };
  } catch (error: any) {
    console.error("Error creating measurement:", error);
    throw new Error(error.message || "Failed to create measurement");
  }
}

export async function getMeasurementById(id: string) {
  try {
    await connectToDatabase();
    const measurement = await MeasurementModel.findById(id);
    // console.log(measurement);
    if (!measurement) {
      throw new Error("Measurement not found");
    }
    return measurement;
  } catch (error: any) {
    console.error("Error fetching measurement:", error);
    throw new Error(error.message || "Failed to fetch measurement");
  }
}
