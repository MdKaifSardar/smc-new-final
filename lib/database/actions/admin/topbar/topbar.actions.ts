"use server";
import { connectToDatabase } from "@/lib/database/connect";
import TopbarModel from "@/lib/database/models/topbar.model";

// Create a new topbar entry
export const createTopbar = async (topbar: { text: string; type: "sticky" | "marquee" }) => {
  try {
    await connectToDatabase();
    const newTopbar = new TopbarModel(topbar);
    await newTopbar.save();
    return {
      message: "Topbar created successfully",
      success: true,
      topbar: JSON.parse(JSON.stringify(newTopbar)),
    };
  } catch (error: any) {
    console.log(error);
    return { message: "Error creating topbar", success: false };
  }
};

// Delete a topbar entry by ID
export const deleteTopbar = async (topbarId: string) => {
  try {
    await connectToDatabase();
    await TopbarModel.findByIdAndDelete(topbarId);
    return { message: "Topbar deleted successfully", success: true };
  } catch (error: any) {
    console.log(error);
    return { message: "Error deleting topbar", success: false };
  }
};

// Update a topbar entry by ID
export const updateTopbar = async (
  topbarId: string,
  updatedData: { text?: string; type?: "sticky" | "marquee" }
) => {
  try {
    await connectToDatabase();
    const updatedTopbar = await TopbarModel.findByIdAndUpdate(topbarId, updatedData, { new: true });
    if (!updatedTopbar) {
      return { message: "Topbar not found", success: false };
    }
    return {
      message: "Topbar updated successfully",
      success: true,
      topbar: JSON.parse(JSON.stringify(updatedTopbar)),
    };
  } catch (error: any) {
    console.log(error);
    return { message: "Error updating topbar", success: false };
  }
};

// Fetch and display all topbar entries
export const getAllTopbars = async () => {
  try {
    await connectToDatabase();
    const topbars = await TopbarModel.find().sort({ updatedAt: -1 }).lean();
    return { success: true, topbars: JSON.parse(JSON.stringify(topbars)) };
  } catch (error: any) {
    console.log(error);
    return { message: "Error fetching topbars", success: false };
  }
};
