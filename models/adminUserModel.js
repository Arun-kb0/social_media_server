import mongoose from "mongoose";

const adminUserSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  password: { type: String, required: true },
  id: { type: String }
})



export const adminUserModel = mongoose.model("adminUsers",adminUserSchema)