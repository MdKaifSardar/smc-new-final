import mongoose, { Schema } from "mongoose";

const GenderSchema = new Schema(
  {
    name: { type: String, required: true },
    image: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    fabricId: { type: mongoose.Types.ObjectId, required: true },
    colorId: { type: mongoose.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Gender || mongoose.model("Gender", GenderSchema);
