import express from "express";
import { joinRoom, sendMessage } from "../controllers/chatSocket.js";
import { commentPost, likePost, sendNotification } from "../controllers/postSocket.js";

const router = express.Router()

router.onConnection = async (socket) => {
    console.log("socketio user connected", socket.id)
    console.log(" userId from socketauth", socket.userId)
    const token = socket.decoded_token

    socket.on("join_room", (data) => joinRoom(socket, data))
    socket.on("send_message", (data) => sendMessage(socket, data))


    socket.on("likePost", (data) => likePost(socket, data))
    socket.on("sendNotification", (data) => sendNotification({ socket, data }))

    socket.on("commentPost", (data) => commentPost({ socket, data }))


    socket.on("disconnect", async () => {
        console.log('socketio user disconnected', socket.id)
    })
}


export default router