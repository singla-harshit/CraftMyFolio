import { User } from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js"; // Adjust the path
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudUpload.js";
import { saveUserAndRespond } from "../utils/controllerUtils.js";
import { Folio } from "../models/folioModel.js";
import redisClient from "../config/redisClient.js";

export const registerUser = asyncHandler(async (req, res) => {
  // 1. Extract all required fields from the request body
  const { name, email, password, dob, address, phone } = req.body;

  // 2. Validate that all required fields are present
  const requiredFields = { name, email, password, dob, address, phone };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(400).json({
        success: false,
        message: `${key} is a required field.`,
      });
    }
  }

  // 3. Check if a user with the given email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      // 409 Conflict
      success: false,
      message: "A user with this email already exists.",
    });
  }
  //4 Handle avatar upload if file is provided
  const avatarLocalPath = req.file?.path;
  console.log("Avatar local Path ", avatarLocalPath);
  let avatar = undefined;
  if (!avatarLocalPath) {
    avatar = "";
  } else {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("Succesful upload of Avatar ", avatar);
    if (avatar == undefined) {
      return res.status(500).json({ message: "Cloudinary error" });
    }
  }

  // 5. Hash the password for security
  const hashedPassword = await bcrypt.hash(password, 10);

  // 6. Create the new user in the database
  const newUser = await User.create({
    ...req.body, // extra optional fields first
    name,
    email,
    password: hashedPassword,
    dob,
    address,
    phone,
    avatar,
  });

  // Exclude the password from the response
  const userResponse = newUser.toObject();
  delete userResponse.password;

  return res.status(201).json({
    // 201 Created
    success: true,
    message: "User registered successfully.",
    data: userResponse,
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password." });
  }

  // Compare passwords
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password." });
  }

  // Generate JWT
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  const userResponse = user.toObject();
  delete userResponse.password;

  // Set cookie and send response
  // const options = {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === 'production',
  // };

  return res.status(200).json({
    success: true,
    message: "Logged in successfully.",
    data: { ...userResponse, token },
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  // 1. Get the user from the database.
  // We trust `req.user._id` because it comes from your secure authMiddleware.
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  // 2. Create a "whitelist" of fields that are safe to update.
  // We will manually pull data from `req.body` instead of just
  // passing the whole body. This prevents a user from maliciously
  // sending `{"isAdmin": true}` and elevating their privileges.

  // Update basic information (from your BasicDetailsForm)
  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;
  user.address = req.body.address || user.address;
  user.dob = req.body.dob || user.dob;
  user.bio = req.body.bio || user.bio;
  if (req.file) {
    const avatarLocalPath = req.file.path;
    const cloudinaryResponse = await uploadOnCloudinary(avatarLocalPath);
    if (!cloudinaryResponse) {
      return res
        .status(500)
        .json({ message: "Error uploading new avatar to Cloudinary" });
    }
    user.avatar = cloudinaryResponse.url;
  }
  user.resume = req.body.resume || user.resume;

  // Update arrays (for your other forms, if they are sent)
  // This assumes the front end sends the *entire* new array for the section being edited.
  if (req.body.education) {
    user.education = req.body.education;
  }
  if (req.body.experience) {
    user.experience = req.body.experience;
  }
  if (req.body.projects) {
    user.projects = req.body.projects;
  }
  if (req.body.skills) {
    // Assuming skills are sent as an array, as per your schema
    user.skills = req.body.skills;
  }
  if (req.body.social) {
    user.social = req.body.social;
  }
  if (req.body.testimonials) {
    user.testimonials = req.body.testimonials;
  }

  // NOTE: We deliberately DO NOT update:
  // - user.password (must go through a separate "change password" flow)
  // - user.email (usually requires a re-verification process)
  // - user.isAdmin (can only be set by an admin)

  const updatedUser = await user.save();

  try {
    const folio = await Folio.findOne({ user_id: user._id });

    if (folio) {
      const cacheKey = `folio:${folio.slug}`;
      await redisClient.del(cacheKey);
    }
    console.log("redis deleted");
  } catch (err) {
    console.error("Redis Error:", err);
  }
  // 4. Send the updated user back to the front end.
  // We wrap it in a 'data' object to match what your
  // useMutation's `onSuccess` callback expects.
  res.status(200).json({
    data: updatedUser,
  });
});

export const updateUserAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  // 1. Check if the 'upload' middleware attached a file
  if (!req.file) {
    res.status(400);
    throw new Error("No image file provided.");
  }

  // 2. Upload the file buffer to your cloud service (S3, Cloudinary, etc.)
  // req.file.buffer contains the image data
  const imageUrl = await uploadOnCloudinary(req.file?.path);

  // 3. Save the *new URL* to the user's avatar field
  user.avatar = imageUrl;

  const folio = await Folio.findOne({ user_id: user._id });
  if (folio) {
    const cacheKey = `folio:${folio.slug}`;
    await redisClient.del(cacheKey);
  }

  // 4. Save the user and send back the updated data
  await saveUserAndRespond(user, res);
});

export const getMe = (req, res) => {
  return res.status(200).json({
    message: "User verified",
    data: req.user,
  });
};
