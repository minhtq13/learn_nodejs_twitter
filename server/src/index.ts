import express from "express"
import { defaultErrorHandler } from "./middlewares/error.middlewares"
import userRouter from "./routes/users.routes"
import databaseService from "./services/database.serivces"
import mediasRouter from "./routes/medias.routes"
import { initFolder } from "./utils/file"
const app = express()
const port = 4000

// Tạo folder upload

initFolder()

app.use(express.json())
app.use("/users", userRouter)
app.use("/medias", mediasRouter)
databaseService.connect()
app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`Server is running on port:${port}`)
})
