import jwt from 'jsonwebtoken'
import { setIsOnline } from '../controllers/users.js'


const auth = async (req, res, next) => {

    const isTokenExpiered = (decodedData) => {
        if (decodedData?.exp) {
            const currentTime = Math.floor(Date.now() / 1000)
            return currentTime >= decodedData.exp
        } else {
            return true
        }
    }

    try {
        const token = req.headers?.authorization?.split(" ")[1]
        const isCustomeAuth = token?.length < 500

        let decodedData
        if (token && isCustomeAuth) {
            console.log("user token")
            decodedData = jwt.verify(token, process.env.SECRECT_KEY)
            req.userId = decodedData.id
        } else {
            console.log("google token")
            decodedData = jwt.decode(token)
            req.userId = decodedData?.sub
        }

        if (isTokenExpiered(decodedData)) {
            console.log('token expiered')
            const result = await setIsOnline({ userId: req.userId, state: false })
            console.log(result)
            res.status(401).json({ message: `token expiereded` })
            return
        }

        console.log('token is valid')
        next()
    } catch (error) {
        console.log(error)
        if (error.message === 'jwt expired') {
            res.status(401).json({ message: `token expiereded` })
            return
        }
        res.status(401).json({ message: `auth failed `, error })
    }
}

export default auth 