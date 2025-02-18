import mongoose from "mongoose";

const TopbarSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["sticky", "marquee"],
      required: true,
    },
  },
  { timestamps: true }
);

const TopbarModel = mongoose.models.Topbar || mongoose.model("Topbar", TopbarSchema);

export default TopbarModel;
