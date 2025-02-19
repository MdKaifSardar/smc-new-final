"use server";

import { connectToDatabase } from "@/lib/database/connect";
import GenderModel from "@/lib/database/models/shirtModel/GenderModel";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUNDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Helper function to convert base64 string to buffer
const base64ToBuffer = (base: string) => {
  const base64String = base.split(";base64,").pop();
  return Buffer.from(base64String || "", "base64");
};

export const createGender = async (
  name: string,
  image: string, // Base64 string for image upload
  fabricId: string,
  colorId: string
) => {
  try {
    await connectToDatabase();

    if (!name || !image || !fabricId || !colorId) {
      return { message: "All fields are required.", success: false };
    }

    // Upload image to Cloudinary
    const imageBuffer = base64ToBuffer(image);
    const imageFormData = new FormData();
    imageFormData.append(
      "file",
      new Blob([imageBuffer], { type: "image/jpeg" })
    );
    imageFormData.append("upload_preset", "gender_images");

    const imageResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
      { method: "POST", body: imageFormData }
    );
    const uploadedImage = await imageResponse.json();

    // Convert fabricId and colorId to ObjectIds
    const fabricObjectId = new mongoose.Types.ObjectId(fabricId);
    const colorObjectId = new mongoose.Types.ObjectId(colorId);

    // Create new Gender entry
    await new GenderModel({
      name,
      image: {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      },
      fabricId: fabricObjectId,
      colorId: colorObjectId,
    }).save();

    return { message: `Gender ${name} created successfully.`, success: true };
  } catch (error: any) {
    console.log(error);
    return { message: "Error creating gender.", success: false };
  }
};

export const getGendersByColorAndFabric = async (
  fabricId: string,
  colorId: string
) => {
  try {
    await connectToDatabase();

    const fabricObjectId = new mongoose.Types.ObjectId(fabricId);
    const colorObjectId = new mongoose.Types.ObjectId(colorId);

    const genders = await GenderModel.find({
      fabricId: fabricObjectId,
      colorId: colorObjectId,
    })
      .sort({ updatedAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(genders));
  } catch (error: any) {
    console.log(error);
    return [];
  }
};

export const deleteGender = async (genderId: string) => {
  try {
    await connectToDatabase();

    const gender = await GenderModel.findById(genderId);
    if (!gender) {
      return { message: "Gender not found.", success: false };
    }

    // Delete image from Cloudinary
    await cloudinary.v2.uploader.destroy(gender.image.public_id);

    // Delete gender document from MongoDB
    await GenderModel.findByIdAndDelete(genderId);

    return {
      message: "Gender and its image deleted successfully.",
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return { message: "Error deleting gender.", success: false };
  }
};

export const updateGender = async (
  genderId: string,
  newName: string,
  newImage: string // Base64 string for image upload if updated
) => {
  try {
    await connectToDatabase();

    const gender = await GenderModel.findById(genderId);
    if (!gender) {
      return { message: "Gender not found.", success: false };
    }

    if (newName) {
      gender.name = newName;
    }

    if (newImage) {
      // Upload new image to Cloudinary
      const imageBuffer = base64ToBuffer(newImage);
      const imageFormData = new FormData();
      imageFormData.append(
        "file",
        new Blob([imageBuffer], { type: "image/jpeg" })
      );
      imageFormData.append("upload_preset", "gender_images");

      const imageResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
        { method: "POST", body: imageFormData }
      );
      const uploadedImage = await imageResponse.json();
      gender.image = {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      };
    }

    await gender.save();

    return { message: "Gender updated successfully.", success: true };
  } catch (error: any) {
    console.log(error);
    return { message: "Error updating gender.", success: false };
  }
};
