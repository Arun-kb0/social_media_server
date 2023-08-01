import { chatModel } from "../models/chatModel.js"
import { userChatModel } from "../models/userChatsModel.js"


export const joinRoom = async (socket, data) => {
    const { currentUserId, currentUsername, currentUserPhoto, roomId, chatUserId, chatUserName, chatUserPhoto } = data

    try {
        socket?.join(roomId)

        const createChatUserDoc = async () => {
            const chatUseRroomIdValue = {
                lastMessage: '',
                user: {
                    userId: currentUserId,
                    name: currentUsername,
                    photo: currentUserPhoto,
                }
            }

            const isChatUserExists = await userChatModel.findOne({ id: chatUserId })
            if (isChatUserExists) {
                const data = await userChatModel.updateOne(
                    { id: chatUserId },
                    { $set: { [`chatIds.${roomId}`]: chatUseRroomIdValue } }
                )
            } else {
                const newChatUserDoc = {
                    id: chatUserId,
                    updatedAt: new Date(),
                    chatIds: { [roomId]: chatUseRroomIdValue }
                }
                const data = await userChatModel.create(newChatUserDoc)
            }

        }

        const roomIdValue = {
            lastMessage: '',
            user: {
                userId: chatUserId,
                name: chatUserName,
                photo: chatUserPhoto,
            }
        }
        const isUserChatExists = await userChatModel.findOne({ id: currentUserId })
        if (isUserChatExists) {
            const data = await userChatModel.updateOne(
                { id: currentUserId },
                { $set: { [`chatIds.${roomId}`]: roomIdValue } }
            )
            // console.log(data)
            await createChatUserDoc()
        } else {
            const newDoc = {
                id: currentUserId,
                updatedAt: new Date(),
                chatIds: { [roomId]: roomIdValue }
            }
            const data = await userChatModel.create(newDoc)
            await createChatUserDoc()
            // console.log(data)
        }
        socket && console.log(`users with id ${socket.id} joined room ${data.roomId}`)
    } catch (error) {
        console.log(error)
    }

}


export const sendMessage = async (socket, data) => {
    const { authorName, roomId, authorId, message, createdAt } = data


    const messageData = {
        message,
        authorId,
        authorName,
        createdAt
    }

    try {
        socket.to(roomId).emit("recive_message", data)
        console.log("recive_message")
        console.log(data)

        const isRoomExists = await chatModel.findOne({ roomId })
        const updateLastMessage = async () => {
            const data = await userChatModel.updateMany(
                { [`chatIds.${roomId}`]: { $exists: true } },
                { $set: { [`chatIds.${roomId}.lastMessage`]: message } }
            )
            // console.log(data)
        }
        let result
        if (isRoomExists) {
            result = await chatModel.updateOne(
                { roomId },
                { $push: { messages: messageData } },
                { new: true }
            )
            await updateLastMessage()
        } else {
            result = await chatModel.create({
                roomId,
                messages: [messageData]
            })
            await updateLastMessage()
        }
        // console.log(result)
    } catch (error) {
        console.error(error)
    }
}





