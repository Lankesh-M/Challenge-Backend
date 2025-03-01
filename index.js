const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const user_schema = require("./models/userDet");
const challenge_schema = require("./models/challengeModel");

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

const PORT = 3010;

console.log("MONGODB_URL:", process.env.MONGODB_URL);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB Connection Failed:", err));

app.post("/createChallenge", (req, res) => {
  try {
    const {
      createdBy,
      title,
      description,
      type,
      target,
      startDate,
      endDate,
      scope,
      participants,
    } = req.body;
    const newChallenge = new challenge_schema({
      createdBy: createdBy,
      title: title,
      description: description,
      type: type,
      target: target,
      startDate: startDate,
      endDate: endDate,
      scope: scope,
      participants: participants,
    });
    newChallenge.save();
    res.status(201).json(newChallenge);
  } catch (err) {
    console.log("Error", err);
    res.status(400);
  }
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    const hashedPassword = await bcrypt.hash(password, 11);
    const newUser = new user_schema({
      name: name,
      email: email,
      password: hashedPassword, //Use hashpassword using bcrypt js
    });

    newUser.save();
    // console.log(newUser);
    res
      .status(201)
      .json({ message: "User SignedIn Successfully", isSignup: true, newUser });
  } catch (err) {
    console.log("Error", err);
    res
      .status(400)
      .json({ message: "User SignedIn Unsuccessfully", isSignup: false });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const isExistingUser = await user_schema.findOne({ email: email });
    // console.log(isExistingUser);
    if (isExistingUser) {
      const isValidPass = await bcrypt.compare(
        password,
        isExistingUser.password
      );
      // const isValidPass = isExistingUser.password == password;
      // console.log(isValidPass);
      if (isValidPass) {
        res
          .status(200)
          .json({
            message: "Login is Successful",
            isLoggedIn: true,
            isExistingUser,
          });
      } else {
        res
          .status(400)
          .json({ message: "Incorrect Password", isLoggedIn: false });
      }
    } else {
      res
        .status(200)
        .json({
          message: "User not found, Please Signin first",
          isLoggedIn: false,
        });
    }
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error occurred in Login", err, isLoggedIn: false });
  }
});

app.post("/user/join-challenge", async (req, res) => {
  const { userId, challengeId } = req.body;

  try {
    const user = await user_schema.findById(userId);
    // console.log(user);
    if (!user) return res.status(404).json({ message: "User not found" }); //Not an user

    // Check if user is already in the challenge
    const isAlreadyJoined = user.challengesIn.some(
      (c) => c.challengeId.toString() === challengeId
    );

    if (isAlreadyJoined) {
      return res.status(400).json({ message: "Already joined this challenge" });
    }

    // Add challenge with initial progress 0
    user.challengesIn.push({ challengeId });
    await user.save();

    res.status(200).json({ message: "Challenge joined successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error joining challenge", error });
  }
});

app.put("/user/update-progress", async (req, res) => {
  const { userId, challengeId, progressToAdd } = req.body;

  try {
    const user = await user_schema.findById(userId);
    const challenge = await challenge_schema.findById(challengeId);

    if (!user || !challenge) {
      return res.status(404).json({ message: "User or Challenge not found" });
    }

    // Find the challenge in user's challengesIn
    const challengeProgress = user.challengesIn.find(
      (c) => c.challengeId.toString() === challengeId
    );

    if (!challengeProgress) {
      return res
        .status(400)
        .json({ message: "User has not joined this challenge" });
    }

    // Update progress
    challengeProgress.progress += progressToAdd;
    challengeProgress.updatedAt = new Date();

    // Check if completed
    if (challengeProgress.progress >= challenge.target) {
      challengeProgress.progress = challenge.target; // Ensure it doesn't exceed target
      challengeProgress.completed = true;
    }

    await user.save();
    res.status(200).json({ message: "Progress updated", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating progress", error });
  }
});

app.get("/get-users", async (req, res) => {
  const allUsers = await user_schema.find();
  res.status(200).json({message : "All Users Details are Fetched", allUsers});
});

app.get("/get-challenges", async (req, res) => {
  const allChallenges = await challenge_schema.find();
  res.status(200).json({message : "All Challenges are Fetched", allChallenges});
  
})

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
