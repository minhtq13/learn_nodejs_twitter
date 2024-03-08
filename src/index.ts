import express, { NextFunction, Request, Response } from "express"
import userRouter from "./routes/users.routes"
import databaseService from "./services/database.serivces"
const app = express()
const port = 4000
app.use(express.json())
app.use("/users", userRouter)
databaseService.connect()
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({ error: err.message });
})
app.listen(port, () => {
  console.log(`Server is running on port:${port}`)
})
