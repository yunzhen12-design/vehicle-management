import 'dotenv/config'
import serverless from 'serverless-http'
import { createApp } from '../../server/app'
import { initSchema } from '../../server/db'
import { seedIfEmpty } from '../../server/seed'

const app = createApp()
const expressHandler = serverless(app)

let bootPromise: Promise<void> | null = null

async function ensureBooted() {
  if (!bootPromise) {
    bootPromise = initSchema().then(() => seedIfEmpty())
  }
  await bootPromise
}

export async function handler(event: any, context: any) {
  await ensureBooted()
  return expressHandler(event, context)
}
