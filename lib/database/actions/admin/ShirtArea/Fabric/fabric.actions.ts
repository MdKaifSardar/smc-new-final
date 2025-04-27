"use server";

import { connectToDatabase } from "@/lib/database/connect";
import FabricModel from "@/lib/database/models/shirtModel/FabricModel";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUNDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Helper function to convert base64 string to buffer
const base64ToBuffer = (base: any) => {
  const base64String = base.split(";base64,").pop();
  return Buffer.from(base64String, "base64");
};

// Create new Fabric entry
export const createFabric = async (
  fabricName: string,
  image: string, // Base64 string for image upload
  price: number, // New field
  discount: number // New field
) => {
  try {
    await connectToDatabase();

    if (!fabricName || !image || price <= 0) {
      return {
        message: "Fabric name, image, and valid price are required.",
        success: false,
      };
    }

    // Check if fabric already exists
    const existingFabric = await FabricModel.findOne({ fabricName });
    if (existingFabric) {
      return {
        message: "Fabric with this name already exists.",
        success: false,
      };
    }

    // Upload image to Cloudinary
    const buffer = base64ToBuffer(image);
    const formData = new FormData();
    formData.append("file", new Blob([buffer], { type: "image/jpeg" }));
    formData.append("upload_preset", "fabric_images");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const uploadedImage = await response.json();

    // Create a new fabric in the database
    const newFabric = new FabricModel({
      fabricName,
      image: {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      },
      price, // Save price
      discount, // Save discount
    });

    await newFabric.save();

    return {
      message: `Fabric ${fabricName} has been successfully created.`,
      success: true,
    };
  } catch (error: any) {
    console.log("Error creating fabric:", error);
    return {
      message: "Error creating fabric.",
      success: false,
    };
  }
};

// Delete Fabric entry and its image from Cloudinary
export const deleteFabric = async (fabricId: string) => {
  try {
    await connectToDatabase();

    const fabric = await FabricModel.findById(fabricId);

    if (!fabric) {
      return {
        message: "Fabric not found with this Id!",
        success: false,
      };
    }

    // Delete image from Cloudinary
    const imagePublicId = fabric.image.public_id; // Get public_id directly from the fabric document
    await cloudinary.v2.uploader.destroy(imagePublicId);

    // Delete fabric document from MongoDB
    await FabricModel.findByIdAndDelete(fabricId);

    return {
      message:
        "Successfully deleted fabric and its associated image from Cloudinary.",
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      message: "Error deleting fabric.",
      success: false,
    };
  }
};

// Update the fabric's name, image, price, or discount by its ID
export const updateFabric = async (
  fabricId: string,
  newFabricName: string,
  newImage: string, // Base64 string for image upload (if updated)
  newPrice: number, // New field
  newDiscount: number // New field
) => {
  try {
    await connectToDatabase();

    const fabric = await FabricModel.findById(fabricId);

    if (!fabric) {
      return {
        message: "Fabric not found with this Id!",
        success: false,
      };
    }

    if (newFabricName) {
      fabric.fabricName = newFabricName;
    }

    if (newPrice > 0) {
      fabric.price = newPrice; // Update price
    }

    if (newDiscount >= 0 && newDiscount <= 100) {
      fabric.discount = newDiscount; // Update discount
    }

    if (newImage) {
      // Upload new image to Cloudinary
      const buffer = base64ToBuffer(newImage);
      const formData = new FormData();
      formData.append("file", new Blob([buffer], { type: "image/jpeg" }));
      formData.append("upload_preset", "fabric_images");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const uploadedImage = await response.json();
      if (!uploadedImage.secure_url || !uploadedImage.public_id) {
        return {
          message: `Error uploading new image: ${JSON.stringify(uploadedImage)}`,
          success: false,
        };
      }
      fabric.image = {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      };
    }

    // Save the updated fabric
    await fabric.save();

    return {
      message: "Successfully updated the fabric!",
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      message: "Error updating fabric.",
      success: false,
    };
  }
};

// Get all fabrics
export const getAllFabrics = async () => {
  try {
    await connectToDatabase();

    const fabrics = await FabricModel.find().sort({ updatedAt: -1 });

    return JSON.parse(JSON.stringify(fabrics));
  } catch (error: any) {
    console.log(error);
    return [];
  }
};

export const getFabricById = async (fabricId: string) => {
  try {
    await connectToDatabase(); // Ensure DB connection

    if (!mongoose.Types.ObjectId.isValid(fabricId)) {
      return { message: "Invalid fabric ID.", success: false };
    }

    const fabric = await FabricModel.findById(fabricId).lean();

    if (!fabric) {
      return { message: "Fabric not found.", success: false };
    }

    return {
      message: "Fabric fetched successfully.",
      success: true,
      fabric: JSON.parse(JSON.stringify(fabric)),
    };
  } catch (error: any) {
    console.log(error);
    return { message: "Error fetching fabric.", success: false };
  }
};
