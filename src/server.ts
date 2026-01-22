import app from "./app"
import connectDB from "./config/db"
import dotenv from "dotenv"

dotenv.config()

let isConnected = false

export default async function handler(req: any, res: any) {
  try {
    if (!isConnected) {
      await connectDB()
      isConnected = true
    }
    return app(req, res)
  } catch (error) {
    console.error("Serverless error:", error)
    res.status(500).json({ message: "Internal Server Error" })
  }
}
