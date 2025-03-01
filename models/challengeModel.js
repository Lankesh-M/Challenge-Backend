const mongoose = require('mongoose')

const ChallengeSchema = new mongoose.Schema({
  createdBy : {type : mongoose.Schema.Types.ObjectId, ref:"User"},
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ["Once", "Track"], default:"Once" },
  target : {type : Number, require : true},
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  scope: { type: String, enum: ["Public", "Private"], required: true, default : "Private" },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Challenge = mongoose.model("Challenge", ChallengeSchema);

module.exports = Challenge;