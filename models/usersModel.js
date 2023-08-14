import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
    name: { type: String, required: true  },
    email: { type: String, required: true , index:true },
    password: { type: String, required: true },
    id: { type: String }
})


export const userModel = mongoose.model("Users", userSchema)