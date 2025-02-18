import mongoose, { Schema, Document } from "mongoose";

export interface Collar extends Document {
  style?: {
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
  };
  height?: {
    name: string;
    icon: {
      url: string;
      public_id: string;
    };
    price: number;
  };
  collar_button?: {
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
  };
  fabricId: mongoose.Types.ObjectId;
  colorId: mongoose.Types.ObjectId;
  gender: string;
}

export const CollarSchema = new Schema<Collar>({
  style: {
    type: {
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
    },
    required: false,
    default: undefined,
  },
  height: {
    type: {
      name: { type: String, required: true },
      icon: {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
      price: { type: Number, required: true },
    },
    required: false,
    default: undefined,
  },
  collar_button: {
    type: {
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
    },
    required: false,
    default: undefined,
  },
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

const CollarModel =
  mongoose.models.Collar || mongoose.model<Collar>("Collar", CollarSchema);

export default CollarModel;
