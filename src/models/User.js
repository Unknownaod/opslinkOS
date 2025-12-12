import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    minlength: 3,
    maxlength: 32
  },

  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  },

  passwordHash: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", UserSchema);
