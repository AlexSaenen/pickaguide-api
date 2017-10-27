const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  payerId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  beneficiaryId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  amountPayer: { type: Number, required: true},
  amountBeneficiary: { type: Number, required: true},
  date: { type: Date, default: Date.now},
}).index({ payerId: 1, beneficiaryId: 1, date: 1 }, { unique: true });

exports.Payments = mongoose.model('Payments', paymentSchema);
