import express from "express"
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { connect } from './db.js'
import fileRoutes from './routes/files.js'

dotenv.config()
const app = express()

app.use(morgan("tiny"))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

connect()

app.use('/api/files', fileRoutes)

app.use((err, req, res, next) => {
    const status = err.status || 500
    const message = err.message || "Internal server error"
    const stack = process.env.NODE_ENV === "dev" ? err.stack : null

    res.status(status).json({
        message,
        stack
    })
})

const port = process.env.PORT || 4001

app.listen(port, () => {
    console.log(`app is running on port ${port}`)
})