import mongoose from "mongoose";

const TenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    nidNumber: { type: String, default: null },
    address: { type: String, default: null },
    email: { type: String, default: null },
    notes: { type: String, default: null },
  },
  { timestamps: true }
);

export const Tenant = mongoose.model("Tenant", TenantSchema);
