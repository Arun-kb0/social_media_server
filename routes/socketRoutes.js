import express from "express";
import { joinRoom, sendMessage } from "../controllers/chatSocket.js";
import { likePost, sendNotification } from "../controllers/postSocket.js";

const router = express.Router()

router.onConnection = (socket) => {
    console.log("socketio user connected", socket.id)

    const token = socket.decoded_token
    console.log(" userId from socketauth", socket.userId)


    socket.on("join_room", (data) => joinRoom(socket, data))
    socket.on("send_message", (data) => sendMessage(socket, data))


    socket.on("likePost", (data) => likePost(socket, data))
    socket.on("sendNotification", (data) => sendNotification({ socket, data }))


    socket.on("disconnect", () => {
        console.log('socketio user disconnected', socket.id)
    })
}


export default router