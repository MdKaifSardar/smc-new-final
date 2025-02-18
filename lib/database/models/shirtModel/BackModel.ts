import mongoose, { Schema, Document } from "mongoose";

export interface Back extends Document {
  name: string;
  image: {
    url: string;
    public_id: string;
  };
  icon: {
    url: string;
    public_id: string;
  };
  price: number;
  fabricId: mongoose.Types.ObjectId; // Reference to the Fabric model
  colorId: mongoose.Types.ObjectId; // Reference to the Fabric model
  gender: string;
}

export const BackSchema = new Schema<Back>({
  name: { type: String, required: true },
  image: {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  icon: {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  price: { type: Number, required: true },
  gender: { type: String, required: true },
  fabricId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fabric",
    required: true,
  },
  colorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Color",
    required: true,
  },
});

const BackModel =
  mongoose.models.Back || mongoose.model<Back>("Back", BackSchema);

export default BackModel;
