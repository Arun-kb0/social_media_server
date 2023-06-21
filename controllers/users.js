import { userModel } from "../models/usersModel.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


export const signIn = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: 'user does not exists' })
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect)
            return res.status(400).json({ message: 'Invaild Credentials' })

        const token = jwt.sign({
            email: user.email,
            id: user._id
        }, 'test', { expiresIn: '1h' })
        res.status(200).json({result:user, token})

    } catch (error) {
        console.log(error)
    }

}

export const signUp = async (req, res) => {
    const { email, password, firstName, lastName } = req.body
    try {
        const exisitingUser = await userModel.findOne({ email })
        if (exisitingUser) {
            return res.status(400).json({ message: 'user already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const result = await userModel.create({
            email,
            password: hashedPassword,
            name: `${firstName} ${lastName}`
        })

        const token = jwt.sign({
            email: result.email, id: result._id
        }, 'test', { expiresIn: '1h' })

        res.status(200).json({ result, token })
    } catch (error) {
        console.error(error);
    }
}