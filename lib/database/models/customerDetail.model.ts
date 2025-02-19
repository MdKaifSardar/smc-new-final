import mongoose from "mongoose";

const CustomerDetailSchema = new mongoose.Schema(
  {
    prefix: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true }, // removed unique: true
    country: { type: String, required: true },
    mobile: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent model overwrite upon hot-reloading
export default mongoose.models.CustomerDetail ||
  mongoose.model("CustomerDetail", CustomerDetailSchema);
