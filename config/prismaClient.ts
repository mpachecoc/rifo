import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      prisma: PrismaClient
    }
  }
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma
