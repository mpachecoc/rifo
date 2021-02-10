import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'POST') {
    const { name, description, image, projectId } = request.body

    const newPrize = await prisma.prize.create({
      data: {
        name,
        description,
        image,
        projectId
      }
    })

    response.statusCode = 201
    response.json(newPrize)
  } else {
    throw new Error(
      `The HTTP ${request.method} is not available for this route.`
    )
  }
}
