import { chatModel } from "../models/chatModel.js"
import { userChatModel } from "../models/userChatsModel.js"


export const getChatUsers = async (req, res) => {
    const { userId } = req
    // console.log(userId)
    try {

        const result = await userChatModel.aggregate([
            { $match: { id: userId } },
            {
                $project:
                    { chatUsers: { $objectToArray: "$chatIds" } }
            }
        ])
        // console.log('result', result[0])
        res.status(200).json({
            message: "getChatUsers success",
            chatUsers:result[0] ? result[0].chatUsers : null
        })

    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "getChatUsers faild", error })
    }
}

export const getMessages = async (req, res) => {
    const { roomId } = req.query
    console.log('roomId ', roomId)
    try {
        const data = await chatModel.findOne({ roomId }).limit(20)
        res.status(200).json({ message: "getMessages success", data })
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: "getMessages failed", error })
    }
}