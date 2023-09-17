import { adminUserModel } from "../../models/adminUserModel.js"
import bycrypt from 'bcryptjs'
import jwt from "jsonwebtoken"



export const adminLogin = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await adminUserModel.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "user does not exists" })
    }
    console.log(user)

    const isPasswordCorrect = await bycrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({
      email: user.email,
      id: user._id
    }, "test", { expiresIn: '1h' })

    res.status(200).json({ message: "login success", user, token })

  } catch (error) {
    console.log(error)
    res.status(401).json({ message: "login failed", error })
  }
}



export const adminLogout = async (req, res) => {
  const { userId } = req.query
  try {
    if (!userId) throw new Error('unAuthenticated')
    res.status(200).json({ message: "logout success" })
  } catch (error) {
    res.status(401).json({ message: "logout failed", error })
  }
}


