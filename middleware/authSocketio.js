import jwt from "jsonwebtoken"
import { allUsersModel } from "../models/allUsersModel.js"

export const authSocketio = async (socket, next) => {
    try {
        const token = socket.handshake?.headers?.authorization.split(' ')[1]
        const isCustomeAuth = token.length < 500
        let decodedData
        if (token && isCustomeAuth) {
            decodedData = jwt.verify(token, process.env.SECRECT_KEY)
            socket.decoded_token = decodedData
            socket.userId = decodedData.id

        } else {
            decodedData = jwt.decode(token)
            socket.decoded_token = decodedData
            socket.userId = decodedData?.sub
        }

        const data = await allUsersModel.updateOne(
            { id: socket.userId },
            { socketId: socket.id }
        )
        console.log("socketio authenticated")
        console.log(data)
        
        next()

    } catch (error) {
        console.log("not authenticated")
        next(new Error("login required"))
    }
}



