// prisma/prisma.js
import { PrismaClient } from '@prisma/client'

let prisma: any

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  prisma = prisma
}

export default prisma