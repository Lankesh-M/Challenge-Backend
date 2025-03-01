const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  challengesIn: [ {challengeId: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge" }, // Reference to Challenge
    progress: { type: Number, default: 0 }, // User's progress in the challenge
    status: { type: String, enum: ["Pending", "Ongoing", "Completed"], default: "Pending" },
    updatedAt: { type: Date, default: Date.now }, // Last updated timestamp
    }
    ],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const User = mongoose.model("User", UserSchema);

module.exports = User;