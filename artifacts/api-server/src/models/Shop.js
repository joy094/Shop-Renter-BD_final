import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    location: { type: String, default: null },
    sizeSqft: { type: Number, default: null },
    monthlyRent: { type: Number, required: true },
    depositAmount: { type: Number, default: 0 },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", default: null },
    leaseStart: { type: String, default: null }, // YYYY-MM-DD
    notes: { type: String, default: null },
  },
  { timestamps: true }
);

export const Shop = mongoose.model("Shop", ShopSchema);
