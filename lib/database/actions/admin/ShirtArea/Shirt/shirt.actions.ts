"use server";

import ShirtModel from "@/lib/database/models/shirtModel/ShirtModel";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/database/connect";
import { addShirtToCart } from "../../../cart.actions";
import { getColorById } from "../Color/color.actions";
import { getFabricById } from "../Fabric/fabric.actions";
import { getMonogramById } from "../Monogram/monogram.actions";
import { getMeasurementById } from "../../../measurement.actions";
// import { watch } from "fs";

interface ProductItem {
  name: string;
  image: string;
  price: string;
}

interface Color {
  _id: string;
  name: string;
}

interface Fabric {
  _id: string;
  fabricName: string;
}

interface Monogram {
  _id: string;
  [key: string]: any; // Handle dynamic monogram properties
}

interface Measurement {
  _id: string;
  [key: string]: any; // Handle dynamic measurement properties
}

// Define the type of a populated shirt document
interface PopulatedShirt {
  price: number;
  collarStyle?: ProductItem;
  collarButton?: ProductItem;
  collarHeight?: ProductItem;
  cuffStyle?: ProductItem;
  cuffLinks?: ProductItem;
  watchCompatible?: boolean;
  bottom?: ProductItem;
  back?: ProductItem;
  pocket?: ProductItem;
  placket?: ProductItem;
  sleeves?: ProductItem;
  fit?: ProductItem;
  colorId?: Color;
  fabricId?: Fabric;
  monogramId?: Monogram;
  measurementId?: Measurement;
}

export const createShirt = async (
  price: number,
  bottom: object,
  back: object,
  sleeves: object,
  cuffStyle: object,
  cuffLinks: object,
  collarStyle: object,
  collarHeight: object,
  collarButton: object,
  placket: object,
  pocket: object,
  fit: object,
  watchCompatible: string,
  colorId: string,
  fabricId: string,
  clerkId: string
) => {
  try {
    await connectToDatabase();

    // Convert price to a number if it's not already a number
    const numericPrice = Number(price);

    if (isNaN(numericPrice)) {
      throw new Error("Invalid price value.");
    }

    const fabricObjectId = new mongoose.Types.ObjectId(fabricId);
    const colorObjectId = new mongoose.Types.ObjectId(colorId);

    const newShirt = new ShirtModel({
      price: numericPrice,
      bottom,
      back,
      sleeves,
      cuffStyle,
      cuffLinks,
      collarStyle,
      collarHeight,
      collarButton,
      placket,
      pocket,
      fit,
      watchCompatible,
      colorId: colorObjectId,
      fabricId: fabricObjectId,
    });

    await newShirt.save();

    const plainShirt = newShirt.toObject();

    console.log("Shirt created successfully:", plainShirt);

    return {
      message: "Shirt created successfully.",
      success: true,
      shirt: plainShirt,
    };
  } catch (error: any) {
    console.log(error);
    return {
      message: "Error creating shirt.",
      success: false,
    };
  }
};

export const updateShirtIds = async (
  shirtId: string,
  monogramId?: string,
  measurementId?: string
) => {
  try {
    await connectToDatabase();

    // Prepare the update object dynamically
    const updateFields: Partial<{
      monogramId: mongoose.Types.ObjectId;
      measurementId: mongoose.Types.ObjectId;
    }> = {};

    // Only update the monogramId if it is provided
    if (monogramId) {
      updateFields.monogramId = new mongoose.Types.ObjectId(monogramId);
    }

    // Only update the measurementId if it is provided (do not overwrite if not passed)
    if (measurementId) {
      updateFields.measurementId = new mongoose.Types.ObjectId(measurementId);
    }

    // Update only the provided fields, leaving others unchanged
    const updatedShirt = await ShirtModel.findByIdAndUpdate(
      shirtId,
      { $set: updateFields },
      { new: true }
    ).lean(); // Convert Mongoose document to a plain object

    if (!updatedShirt) {
      return { message: "Shirt not found.", success: false };
    }

    return {
      message: "Shirt updated successfully.",
      success: true,
      shirt: JSON.parse(JSON.stringify(updatedShirt)),
    };
  } catch (error: any) {
    console.error(error);
    return { message: "Error updating shirt.", success: false };
  }
};

export const getShirtById = async (shirtId: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(shirtId)) {
      return { message: "Invalid shirt ID.", success: false };
    }

    const objectId = new mongoose.Types.ObjectId(shirtId);
    // Fetch the shirt and populate the necessary fields
    const shirt = (await ShirtModel.findById(objectId)
      .populate<{ colorId: Color | null }>("colorId")
      .populate<{ fabricId: Fabric | null }>("fabricId")
      .populate<{ monogramId: Monogram | null }>("monogramId")
      .populate<{ measurementId: Measurement | null }>("measurementId")
      .lean()) as PopulatedShirt | null;

    if (!shirt) {
      return { message: "Shirt not found.", success: false };
    }

    // Fetch additional details only if the IDs exist
    const color = shirt.colorId
      ? await getColorById(shirt.colorId.toString())
      : null;
    const fabric = shirt.fabricId
      ? await getFabricById(shirt.fabricId.toString())
      : null;
    const monogram = shirt.monogramId
      ? await getMonogramById(shirt.monogramId.toString())
      : null;
    const measurement = shirt.measurementId
      ? await getMeasurementById(shirt.measurementId.toString())
      : null;

    // Formatting the response with structured data
    const formattedShirt = {
      price: shirt.price,
      collarStyle: shirt.collarStyle?.name || null,
      collarButton: shirt.collarButton?.name || null,
      collarHeight: shirt.collarHeight?.name || null,
      cuffStyle: shirt.cuffStyle?.name || null,
      cuffLinks: shirt.cuffLinks?.name || null,
      watchCompatible: shirt.watchCompatible ?? null,
      bottom: shirt.bottom?.name || null,
      back: shirt.back?.name || null,
      pocket: shirt.pocket?.name || null,
      placket: shirt.placket?.name || null,
      sleeves: shirt.sleeves?.name || null,
      fit: shirt.fit?.name || null,
      color: color?.success ? color.color : null, // Return full color details
      fabric: fabric?.success ? fabric.fabric : null, // Return full fabric details
      monogram: monogram?.success ? monogram.monogram : null, // Return full monogram details
      measurement: measurement || null, // Return full measurement details
    };

    return {
      message: "Shirt fetched successfully.",
      success: true,
      shirt: formattedShirt,
    };
  } catch (error) {
    console.error(error);
    return { message: "Error fetching shirt.", success: false };
  }
};

export const updateShirtPrice = async (shirtId: string, price: number) => {
  try {
    await connectToDatabase();

    // Find the current shirt to get its existing price
    const shirt = await ShirtModel.findById(shirtId);

    if (!shirt) {
      return { message: "Shirt not found.", success: false };
    }

    // Calculate the updated price
    const updatedPrice = (shirt.price || 0) + price;

    // Update the shirt's price
    const updatedShirt = await ShirtModel.findByIdAndUpdate(
      shirtId,
      { $set: { price: updatedPrice } },
      { new: true }
    ).lean(); // Convert Mongoose document to a plain object

    return {
      message: "Shirt price updated successfully.",
      success: true,
      shirt: JSON.parse(JSON.stringify(updatedShirt)),
    };
  } catch (error: any) {
    console.error(error);
    return { message: "Error updating shirt price.", success: false };
  }
};

export const getShirtByIdInDetails = async (shirtId: string) => {
  try {
    const shirt = await ShirtModel.findById(shirtId);
    // console.log(shirt);
    const colorId = shirt?.colorId ? shirt.colorId.toString() : null;
    const fabricId = shirt?.fabricId ? shirt.fabricId.toString() : null;
    const measurementId = shirt?.measurementId ? shirt.measurementId.toString() : null;
    const color = colorId ? await getColorById(colorId) : null;
    const fabric = fabricId ? await getFabricById(fabricId) : null;
    const measurement = measurementId ? await getMeasurementById(measurementId) : null;
    // console.log(measurement);
    // console.log(fabric);
    // console.log(color);
    // console.log(colorId);
    const shirtDetails = {
      price: shirt?.price,
      collarName: shirt?.collarStyle?.name,
      collarImage: shirt?.collarStyle?.image,
      collarPrice: shirt?.collarStyle?.price,
      collarButtonName: shirt?.collarButton?.name,
      collarButtonImage: shirt?.collarButton?.image,
      collarButtonPrice: shirt?.collarButton?.price,
      collarHeightName: shirt?.collarHeight?.name,
      collarHeightImage: shirt?.collarHeight?.image,
      collarHeightPrice: shirt?.collarHeight?.price,
      watchCompatible: shirt?.watchCompatible,
      bottomName: shirt?.bottom?.name,
      bottomImage: shirt?.bottom?.image,
      bottomPrice: shirt?.bottom?.price,
      backName: shirt?.back?.name,
      backImage: shirt?.back?.image,
      backPrice: shirt?.back?.price,
      pocketName: shirt?.pocket?.name,
      pocketImage: shirt?.pocket?.image,
      pocketPrice: shirt?.pocket?.price,
      placketName: shirt?.placket?.name,
      placketImage: shirt?.placket?.image,
      placketPrice: shirt?.placket?.price,
      sleevesName: shirt?.sleeves?.name,
      sleevesImage: shirt?.sleeves?.image,
      sleevesPrice: shirt?.sleeves?.price,
      fitName: shirt?.fit?.name,
      fitImage: shirt?.fit?.image,
      fitPrice: shirt?.fit?.price,
      colorName: color?.color?.name,
      colorHexCode: color?.color?.hexCode,
      fabricName: fabric?.fabric?.fabricName,
      fabricImage: fabric?.fabric?.image?.url,
      // Shirt measurements:
      measurementCollar: measurement?.collar,
      measurementHalfChest: measurement?.halfChest,
      measurementHalfWaist: measurement?.halfWaist,
      measurementHalfHips: measurement?.halfHips,
      measurementYoke: measurement?.yoke,
      measurementHalfArmhole: measurement?.halfArmhole,
      measurementHalfBicep: measurement?.halfBicep,
      measurementCuff: measurement?.cuff,
      measurementSleeveLength: measurement?.sleevesLength,
      measurementShirtLength: measurement?.shirtLength,
      // Body measurements:
      measurementNeck: measurement?.neck,
      measurementChest: measurement?.chest,
      measurementWaist: measurement?.waist,
      measurementHips: measurement?.hips,
      measurementShoulder: measurement?.shoulder,
      measurementArmhole: measurement?.armhole,
      measurementBicep: measurement?.bicep,
      measurementWrist: measurement?.wrist,
      measurementBreastPoint: measurement?.breastPoint,
      measurementWaistPoint: measurement?.waistPoint,
    };
    return {
      success: true,
      shirt: shirtDetails,
    };
  } catch (error: any) {
    console.log(error);
  }
};
