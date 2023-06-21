import express from "express";
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import {corsOptions} from './config/corsOptions.js'
import userRoutes from './routes/users.js'
import postRoutes from './routes/posts.js'


const app = express()
dotenv.config()

const PORT = process.env.PORT || 3001
const CONNECTION_URL = process.env.CONNECTION_URL

app.use(logger)

app.use(cors(corsOptions))
app.use(express.json())


app.use('/user',userRoutes)
app.use('/posts', postRoutes)

app.get('/', (req, res) => {
    res.status(200).send('server running ')
})


app.use(errorHandler)
mongoose.connect(CONNECTION_URL)
    .then(() => app.listen(PORT, () => console.log(`server running at port : ${PORT}`)))
    .catch((err) => console.error(err))


