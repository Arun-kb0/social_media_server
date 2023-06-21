import jwt from 'jsonwebtoken'


const auth = async (req, res, next) => {

    try {
        const token = req.headers.authorization.split(" ")[1]
        const isCustomeAuth = token.length < 500
        // console.log(token)

        let decodeData
        if (token && isCustomeAuth) {
            console.log("user token")
            decodeData = jwt.verify(token, 'test')
            req.userId = decodeData.id
        } else {
            console.log("google token")
            decodeData = jwt.decode(token)
            req.userId = decodeData?.sub
        }
        console.log(decodeData)
        next()
    } catch (error) {
        console.error(error)

    }
}

export default auth