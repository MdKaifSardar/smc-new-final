"use server";

import { connectToDatabase } from "@/lib/database/connect";
import CustomerDetail from "../models/customerDetail.model";

// Create a new customer detail
export const createCustomerDetail = async (data: {
  prefix: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  mobile: string;
}) => {
  try {
    await connectToDatabase();
    const customer = new CustomerDetail(data);
    await customer.save();
    return {
      message: "Customer created successfully",
      success: true,
      data: customer,
    };
  } catch (error: any) {
    console.error(error);
    return { message: "Error creating customer", success: false };
  }
};

// Fetch a customer detail by ID
export const fetchCustomerDetail = async (id: string) => {
  try {
    await connectToDatabase();
    const customer = await CustomerDetail.findById(id);
    if (!customer) {
      return { message: "Customer not found", success: false };
    }
    return {
      message: "Customer fetched successfully",
      success: true,
      data: customer,
    };
  } catch (error: any) {
    console.error(error);
    return { message: "Failed to fetch customer", success: false };
  }
};

// Update a customer detail by ID
export const updateCustomerDetail = async (
  id: string,
  updateData: Partial<{
    prefix: string;
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    mobile: string;
  }>
) => {
  try {
    await connectToDatabase();
    const customer = await CustomerDetail.findById(id);
    if (!customer) {
      return { message: "Customer not found", success: false };
    }
    Object.assign(customer, updateData);
    await customer.save();
    return {
      message: "Customer updated successfully",
      success: true,
      data: customer,
    };
  } catch (error: any) {
    console.error(error);
    return { message: "Error updating customer", success: false };
  }
};

// Get all customer details sorted by updated date
export const getAllCustomerDetails = async () => {
  try {
    await connectToDatabase();
    const customers = await CustomerDetail.find()
      .sort({ updatedAt: -1 })
      .lean();
    return customers;
  } catch (error: any) {
    console.error(error);
    return [];
  }
};

// Delete a customer detail by ID
export const deleteCustomerDetail = async (id: string) => {
  try {
    await connectToDatabase();
    const customer = await CustomerDetail.findByIdAndDelete(id);
    if (!customer) {
      return { message: "Customer not found", success: false };
    }
    return {
      message: "Customer deleted successfully",
      success: true,
      data: customer,
    };
  } catch (error: any) {
    console.error(error);
    return { message: "Error deleting customer", success: false };
  }
};
