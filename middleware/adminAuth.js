  import jwt from 'jsonwebtoken'


const adminAuth = async (req, res, next) => {

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
      console.log('admin token expiered')
      res.status(401).json({ message: `token expiered` })
      return
    }

    console.log('admin token is valid')
    next()
  } catch (error) {
    console.log(error)
    if (error.message === 'jwt expired') {
      res.status(401).json({ message: `token expiered` })
      return
    }
    res.status(401).json({ message: `adminAuth failed `, error })
  }
}

export default adminAuth 