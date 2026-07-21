
import { PrismaClient } from '../../generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import envConfig from '../config/envConfig'

const adapter = new PrismaNeon({
  connectionString: envConfig.database_url!,
})

export const prisma = new PrismaClient({ adapter })