import 'dotenv/config'
import { initSchema } from './db'
import { seedIfEmpty } from './seed'
import { createApp } from './app'

const PORT = Number(process.env.PORT || 4000)
const app = createApp()

async function bootstrap() {
  await initSchema()
  await seedIfEmpty()

  app.listen(PORT, () => {
    console.log(`[server] 车辆管理后端已启动: http://localhost:${PORT}`)
    console.log('[server] 数据库: PostgreSQL（Prisma Client）')
    if (!process.env.FEISHU_APP_ID || !process.env.FEISHU_APP_SECRET) {
      console.log('[server] 提示：未配置飞书 App 凭证，可使用 /api/auth/dev-login 进行本地测试登录')
    }
  })
}

bootstrap().catch((err) => {
  console.error('[server] 启动失败:', err)
  process.exit(1)
})
