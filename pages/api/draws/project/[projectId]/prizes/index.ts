import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

import uploadConfig from '../../../../../../config/upload'

const prisma = new PrismaClient()

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async (request: NextApiRequest, response: NextApiResponse) => {
  const { projectId } = request.query

  const { awsUrl } = uploadConfig.config

  if (request.method === 'GET') {
    const dbPrizes = await prisma.prize.findMany({
      where: {
        projectId: Number(projectId)
      },
      include: {
        Ticket: true
      }
    })

    const prizes = dbPrizes.map(prize => {
      return {
        ...prize,
        imageUrl: prize.image ? `${awsUrl}/${prize.image}` : null
      }
    })

    response.statusCode = 200
    response.json(prizes)
  } else {
    throw new Error(
      `The HTTP ${request.method} is not available for this route.`
    )
  }
}
