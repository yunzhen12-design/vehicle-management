import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { apiRouter } from './routes'

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const allowedOrigins = FRONTEND_URL.split(',').map((item) => item.trim()).filter(Boolean)

export function createApp(options: { mountApiPrefix?: boolean } = {}) {
  const app = express()
  app.set('trust proxy', 1)
  app.use(express.json())
  app.use(cookieParser())
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
          return
        }
        callback(new Error(`CORS 不允许的来源: ${origin}`))
      },
      credentials: true,
    }),
  )

  if (options.mountApiPrefix !== false) {
    app.use('/api', apiRouter)
  }
  app.use('/.netlify/functions/api', apiRouter)
  app.use('/', apiRouter)

  return app
}
