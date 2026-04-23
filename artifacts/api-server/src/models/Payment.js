import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    month: { type: String, required: true }, // YYYY-MM
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    paidOn: { type: String, default: null }, // YYYY-MM-DD
    method: { type: String, default: null }, // cash, bkash, nagad, rocket, bank
    note: { type: String, default: null },
  },
  { timestamps: true }
);

PaymentSchema.index({ shopId: 1, month: 1 }, { unique: true });

export const Payment = mongoose.model("Payment", PaymentSchema);
