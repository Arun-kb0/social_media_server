import express from "express";
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { corsOptions } from './config/corsOptions.js'
import userRoutes from './routes/users.js'
import postRoutes from './routes/posts.js'
import socketRoutes from './routes/socketRoutes.js'
import chatMessage from './routes/chatReq.js'
import { Server } from "socket.io";
import http from 'http'
import { allowedOrigins } from "./config/allowedOrigins.js";
import { authSocketio } from "./middleware/authSocketio.js";

import compression from "compression";

const app = express()
dotenv.config()

const PORT = process.env.PORT || 3001
const CONNECTION_URL = process.env.CONNECTION_URL

app.use(logger)


const server = http.createServer(app)
export const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
    }
})



app.use(cors(corsOptions))
app.use(express.json())

app.use(compression({
    level:6,
    threshold:10*1000,
}))


app.use('/user', userRoutes)
app.use('/posts', postRoutes)
app.use('/chatreq', chatMessage)

io.use((socket, next) => authSocketio(socket, next))

io.on("connection", socketRoutes.onConnection)

app.get('/', (req, res) => {
    res.status(200).send('server running ')
})



app.use(errorHandler)

mongoose.connect(CONNECTION_URL)
    .then(() => server.listen(PORT, () => console.log(`server running at port : ${PORT}`)))
    .catch((err) => console.error(err))


