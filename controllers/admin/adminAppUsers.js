import { allUsersModel } from "../../models/allUsersModel.js"
import { postModel } from "../../models/postsModel.js"


export const getAllUsers = async (req, res) => {
  const { page } = req.query

  try {
    const LIMIT = 8
    const startIndex = (Number(page) - 1) * LIMIT
    const total = await allUsersModel.countDocuments({})
    const users = await allUsersModel.find().limit(LIMIT).skip(startIndex)
    res.status(200).json({
      message: "getUsers success",
      users,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT)
    })
  } catch (error) {
    // console.log(error)
    res.status(404).json({ message: 'users not found', error })
  }
}


export const getAllCounts = async (req, res) => {
  const yesterday = new Date()
  yesterday.setUTCHours(0, 0, 0, 0)
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.toISOString()

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  today.toISOString()

  console.log(today, yesterday)


  try {
    const userCount = await allUsersModel.countDocuments()
    const postCount = await postModel.countDocuments()


    const todaysPostCountResult = await postModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: today,
          }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ])

    const yesterdaysPostCountResult = await postModel.aggregate([
      {
        $match: {
          createdAt: {
            $lt: today,
            $gte: yesterday
          }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ])

    const todaysPostCount = todaysPostCountResult[0] ? todaysPostCountResult[0].count : 0
    const yesterdaysPostCount = yesterdaysPostCountResult[0] ? yesterdaysPostCountResult[0].count : 0
    const growthPercentage = ((todaysPostCount - yesterdaysPostCount) / yesterdaysPostCount) * 100


    res.status(200).json({
      message: "getAllcounts success",
      userCount,
      postCount,
      todaysPostCount,
      yesterdaysPostCount,
      growthPercentage
    })



  } catch (error) {
    res.status(501).json({ message: "getAllCount failed ", error })
  }
}


// * last 6 months post count
export const getHomeChartData = async (req, res) => {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  sixMonthsAgo.toISOString()

  console.log(sixMonthsAgo)
  try {


    const posts = await postModel.aggregate([
      {
        $match: { createdAt: { $gte: sixMonthsAgo } }
      },
      {
        $project: {
          _id: 1,
          createdAt: 1
        }
      }
    ])


    let postData = {}
    posts.map((post) => {
      const date = post.createdAt
      const month = date.toLocaleString('default', { month: "long" })

      if (!postData[month]) {
        postData[month] = []
      }
      postData[month].push(post._id)
    })


    const data = Object.keys(postData).map((month) => {
        return {name: month , Total: postData[month].length}
    })
    
    res.status(200).json({ message: "getHomeChartData success", data })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "getHomeChartData faild", error })
  }
}

