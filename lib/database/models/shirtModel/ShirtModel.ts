import mongoose, { Schema } from "mongoose";

// Define the interfaces for each object field (e.g., CollarStyle, CuffStyle, etc.)
interface ProductItem {
  name: string;
  image: string;
  price: string;
}

interface Shirt {
  price: number;
  collarStyle?: ProductItem;
  collarButton?: ProductItem;
  collarHeight?: ProductItem;
  cuffStyle?: ProductItem;
  cuffLinks?: ProductItem;
  watchCompatible?: string; // Changed from boolean to string
  bottom?: ProductItem;
  back?: ProductItem;
  pocket?: ProductItem;
  placket?: ProductItem;
  sleeves?: ProductItem;
  fit?: ProductItem;
  colorId?: mongoose.Schema.Types.ObjectId;
  fabricId?: mongoose.Schema.Types.ObjectId;
  monogramId?: mongoose.Schema.Types.ObjectId;
  measurementId?: mongoose.Schema.Types.ObjectId;
}

const ShirtSchema = new Schema<Shirt>(
  {
    price: {
      type: Number,
      required: true,
    },
    collarStyle: {
      type: Object,
      required: false,
    },
    collarButton: {
      type: Object,
      required: false,
    },
    collarHeight: {
      type: Object,
      required: false,
    },
    cuffStyle: {
      type: Object,
      required: false,
    },
    cuffLinks: {
      type: Object,
      required: false,
    },
    watchCompatible: {
      type: String, // Changed from Boolean to String
      required: false,
    },
    bottom: {
      type: Object,
      required: false,
    },
    back: {
      type: Object,
      required: false,
    },
    pocket: {
      type: Object,
      required: false,
    },
    placket: {
      type: Object,
      required: false,
    },
    sleeves: {
      type: Object,
      required: false,
    },
    fit: {
      type: Object,
      required: false,
    },
    colorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    fabricId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    monogramId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    measurementId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        if (ret.colorId) ret.colorId = ret.colorId.toString();
        if (ret.fabricId) ret.fabricId = ret.fabricId.toString();
        if (ret.monogramId) ret.monogramId = ret.monogramId.toString();
        if (ret.measurementId) ret.measurementId = ret.measurementId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Create the model using the schema
const ShirtModel =
  mongoose.models.Shirt || mongoose.model<Shirt>("Shirt", ShirtSchema);

export default ShirtModel;
