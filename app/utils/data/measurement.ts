// measurement.ts

// All interfaces are declared WITHOUT the 'export' keyword initially
interface MeasurementImage {
  src: string;
  alt?: string;
}

interface MeasurementValue {
  value: number | null;
  unit: "cm" | "inch";
}

interface MeasurementField {
  image?: MeasurementImage;
  value?: MeasurementValue | null;
  description?: string;
}

interface ShirtMeasurements {
  collar: MeasurementField;
  halfChest: MeasurementField;
  halfWaist: MeasurementField;
  halfHips: MeasurementField;
  yoke: MeasurementField;
  halfArmhole: MeasurementField;
  halfBicep: MeasurementField;
  cuff: MeasurementField;
  sleeveLength: MeasurementField;
  shirtLength: MeasurementField;
}

interface BodyMeasurements {
  neck: MeasurementField;
  chest: MeasurementField;
  waist: MeasurementField;
  hips: MeasurementField;
  shoulder: MeasurementField;
  sleeveLength: MeasurementField;
  elbowWidth: MeasurementField;
  upperArm: MeasurementField;
  armhole: MeasurementField; // <-- added the missing armhole field
  bicep: MeasurementField; // <-- added missing property
  wrist: MeasurementField; // <-- added missing property
}

// Append new interface for Female Body Measurements
interface FemaleBodyMeasurements {
  neck: MeasurementField;
  chest: MeasurementField;
  waist: MeasurementField;
  breastPoint: MeasurementField;
  waistPoint: MeasurementField;
  hips: MeasurementField;
  shoulder: MeasurementField;
  wrist: MeasurementField;
  // sleeveLength: MeasurementField;
  // shirtLength: MeasurementField;
}

// New interface for femaleMeasurements with selected fields
interface FemaleMeasurements {
  neck: MeasurementField;
  chest: MeasurementField;
  waist: MeasurementField;
  breastPoint: MeasurementField;
  waistPoint: MeasurementField;
  hips: MeasurementField;
  shoulder: MeasurementField;
  wrist: MeasurementField;
}

interface Measurement {
  shirt?: ShirtMeasurements;
  body?: BodyMeasurements;
}

// ONLY use export type to export the interfaces
export type {
  MeasurementImage,
  MeasurementValue,
  MeasurementField,
  ShirtMeasurements,
  BodyMeasurements,
  FemaleBodyMeasurements,
  FemaleMeasurements,
  Measurement,
};

// If you need a default export (often useful), you can do this:
// export default Measurement;  // Uncomment if needed

// Example usage (optional - for testing in this file)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const exampleMeasurement: Measurement = {
  // Enclosing curly braces are essential
  shirt: {
    collar: {
      image: { src: "/images/collar.jpg", alt: "Collar Measurement" },
      value: { value: 15.5, unit: "inch" },
      description:
        "Measured around the base of the neck where the collar sits.",
    },
    halfChest: {
      image: { src: "/images/halfChest.jpg", alt: "Half Chest Measurement" },
      value: { value: 21, unit: "inch" },
      description: "Measured across the chest from armpit to armpit.",
    },
    halfWaist: {
      image: { src: "/images/halfWaist.jpg", alt: "Half Waist Measurement" },
      value: { value: 19, unit: "inch" },
      description: "Measured around the narrowest part of the waist.",
    },
    halfHips: {
      image: { src: "/images/halfHips.jpg", alt: "Half Hips Measurement" },
      value: { value: 22, unit: "inch" },
      description: "Measured around the fullest part of the hips.",
    },
    yoke: {
      image: { src: "/images/yoke.jpg", alt: "Yoke Measurement" },
      value: { value: 18, unit: "inch" },
      description: "Measured across the shoulders from one edge to the other.",
    },
    halfArmhole: {
      image: {
        src: "/images/halfArmhole.jpg",
        alt: "Half Armhole Measurement",
      },
      value: { value: 10, unit: "inch" },
      description: "Measured around the armhole.",
    },
    halfBicep: {
      image: { src: "/images/halfBicep.jpg", alt: "Half Bicep Measurement" },
      value: { value: 14, unit: "inch" },
      description: "Measured around the fullest part of the bicep.",
    },
    cuff: {
      image: { src: "/images/cuff.jpg", alt: "Cuff Circumference" },
      value: { value: 8, unit: "inch" },
      description: "Measured around the wrist.",
    },
    sleeveLength: {
      image: {
        src: "/images/sleevesLength.jpg",
        alt: "Sleeves Length Measurement",
      },
      value: { value: 32, unit: "inch" },
      description: "Measured from the shoulder seam to the cuff.",
    },
    shirtLength: {
      image: {
        src: "/images/shirtLength.jpg",
        alt: "Shirt Length Measurement",
      },
      value: { value: 32, unit: "inch" },
      description:
        "Measured from the shoulder seam to the bottom of the shirt.",
    },
  },
  body: {
    neck: {
      image: { src: "/images/neck.jpg", alt: "Neck Measurement" },
      value: { value: 16, unit: "inch" },
      description: "Measured around the base of the neck.",
    },
    chest: {
      image: { src: "/images/chest.jpg", alt: "Chest Measurement" },
      value: { value: 40, unit: "inch" },
      description: "Measured around the fullest part of the chest.",
    },
    waist: {
      image: { src: "/images/waist.jpg", alt: "Waist Measurement" },
      value: { value: 34, unit: "inch" },
      description: "Measured around the narrowest part of the waist.",
    },
    hips: {
      image: { src: "/images/hips.jpg", alt: "Hips Measurement" },
      value: { value: 42, unit: "inch" },
      description: "Measured around the fullest part of the hips.",
    },
    shoulder: {
      image: { src: "/images/shoulder.jpg", alt: "Shoulder Measurement" },
      value: { value: 18, unit: "inch" },
      description: "Measured across the shoulders from one edge to the other.",
    },
    sleeveLength: {
      image: {
        src: "/images/sleeveLength.jpg",
        alt: "Sleeve Length Measurement",
      },
      value: { value: 25, unit: "inch" },
      description: "Measured from the shoulder point to the wrist.",
    },
    elbowWidth: {
      image: { src: "/images/elbowWidth.jpg", alt: "Elbow Width" },
      value: { value: 10, unit: "inch" },
      description: "Measured around the elbow.",
    },
    upperArm: {
      image: { src: "/images/upperArm.jpg", alt: "Upper Arm Circumference" },
      value: { value: 13, unit: "inch" },
      description: "Measured around the fullest part of the upper arm.",
    },
    armhole: {
      image: { src: "/images/armhole.jpg", alt: "Armhole Measurement" },
      value: { value: 20, unit: "inch" },
      description: "Measured around the armhole.",
    },
    bicep: {
      image: { src: "/images/bicep.jpg", alt: "Bicep Measurement" },
      value: { value: 14, unit: "inch" },
      description: "Measured around the fullest part of the bicep.",
    },
    wrist: {
      image: { src: "/images/wrist.jpg", alt: "Wrist Measurement" },
      value: { value: 7, unit: "inch" },
      description: "Measured around the wrist.",
    },
  },
};
