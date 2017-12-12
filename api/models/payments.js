const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  payerId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  beneficiaryId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  amountPayer: { type: Number, required: true },
  payed: { type: Boolean, required: false, default: false },
  amountBeneficiary: { type: Number, required: true },
  refounded: { type: Boolean, required: false, default: false },
  date: { type: Date, default: Date.now },
  description: { type: String, default: '' },
  idPayment: { type: String, default: null },
  idRefound: { type: String, default: null },
  idVisit: { type: String, required: true },
}).index({ payerId: 1, beneficiaryId: 1, date: 1 }, { unique: true });

exports.Payments = mongoose.model('Payments', paymentSchema);
