import express from "express";
import  { joinRoom, sendMessage } from "../controllers/socketControllers.js";

const router = express.Router()

router.onConnection = (socket) => {
    console.log("socketio user connected", socket.id)
    
    socket.on("join_room",(data)=>{
        joinRoom(socket,data)
    })

    socket.on("send_message" , (data)=> {
        sendMessage(socket ,data)
    })

    socket.on("disconnect", () => {
        console.log('socketio user disconnected', socket.id)
    })
}


export default router