import express from "express"
import { defaultErrorHandler } from "./middlewares/error.middlewares"
import userRouter from "./routes/users.routes"
import databaseService from "./services/database.serivces"
const app = express()
const port = 4000
app.use(express.json())
app.use("/users", userRouter)
databaseService.connect()
app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`Server is running on port:${port}`)
})
