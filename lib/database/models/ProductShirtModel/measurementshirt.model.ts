import mongoose, { Schema, Document, Model } from "mongoose";

// Define an interface for Measurement
export interface IMeasurement extends Document {
  collar?: number;
  halfChest?: number;
  halfWaist?: number;
  halfHips?: number;
  sleevesLength?: number;
  elbow?: number;
  forearm?: number;
  cuff?: number;
  // Shirt measurements
  neck?: number;
  shoulder?: number;
  armhole?: number;
  bicep?: number;
  wrist?: number;
  shirtLength?: number;
  // New fields
  yoke?: number;
  halfArmhole?: number;
  halfBicep?: number;
  // Body measurements
  chest?: number;
  waist?: number;
  hips?: number;
  elbowWidth?: number;
  upperArm?: number;
  breastPoint?: number;
  waistPoint?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define Mongoose Schema
const MeasurementSchema: Schema = new Schema(
  {
    collar: { type: Number, required: false },
    halfChest: { type: Number, required: false },
    halfWaist: { type: Number, required: false },
    halfHips: { type: Number, required: false },
    sleevesLength: { type: Number, required: false },
    elbow: { type: Number, required: false },
    forearm: { type: Number, required: false },
    cuff: { type: Number, required: false },
    // Shirt measurements
    neck: { type: Number, required: false },
    shoulder: { type: Number, required: false },
    armhole: { type: Number, required: false },
    bicep: { type: Number, required: false },
    wrist: { type: Number, required: false },
    shirtLength: { type: Number, required: false },
    // New fields
    yoke: { type: Number, required: false },
    halfArmhole: { type: Number, required: false },
    halfBicep: { type: Number, required: false },
    // Body measurements
    chest: { type: Number, required: false },
    waist: { type: Number, required: false },
    hips: { type: Number, required: false },
    elbowWidth: { type: Number, required: false },
    upperArm: { type: Number, required: false },
    breastPoint: { type: Number, required: false },
    waistPoint: { type: Number, required: false },
  },
  { timestamps: true }
);

// Define the Mongoose Model
const MeasurementModel: Model<IMeasurement> =
  mongoose.models.Measurement ||
  mongoose.model<IMeasurement>("Measurement", MeasurementSchema);

export default MeasurementModel;
