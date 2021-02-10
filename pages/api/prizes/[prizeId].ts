import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async (request: NextApiRequest, response: NextApiResponse) => {
  const { prizeId } = request.query

  if (request.method === 'GET') {
    const prize = await prisma.prize.findUnique({
      select: {
        id: true,
        name: true,
        description: true,
        image: true
      },
      where: {
        id: Number(prizeId)
      }
    })

    response.statusCode = 200
    response.json(prize)
  } else if (request.method === 'DELETE') {
    const prize = await prisma.prize.findUnique({
      select: { id: true },
      where: { id: Number(prizeId) }
    })

    if (!prize) {
      response.statusCode = 401
      response.json({ message: 'Prize Id not found' })
    }

    await prisma.prize.delete({
      where: {
        id: Number(prizeId)
      }
    })

    response.statusCode = 200
    response.json({ message: 'Prize deleted sucessfully' })
  } else {
    throw new Error(
      `The HTTP ${request.method} is not available for this route.`
    )
  }
}
