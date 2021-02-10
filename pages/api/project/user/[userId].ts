import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { format } from 'date-fns'
import es from 'date-fns/locale/es'

import uploadConfig from '../../../../config/upload'

const prisma = new PrismaClient()

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async (request: NextApiRequest, response: NextApiResponse) => {
  const { userId } = request.query

  const { awsUrl } = uploadConfig.config

  if (request.method === 'GET') {
    const dbProjects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        drawDate: true,
        slug: true
      },
      where: {
        ownerId: Number(userId)
      },
      orderBy: {
        id: 'desc'
      }
    })

    // Count tickets by project
    const projects = await Promise.all(
      dbProjects.map(async project => {
        const numOfTickets = await prisma.ticket.count({
          where: {
            projectId: project.id
          }
        })

        const firstImage = await prisma.projectImages.findFirst({
          select: {
            name: true
          },
          where: {
            projectId: project.id
          }
        })

        return {
          ...project,
          imageUrl: firstImage ? `${awsUrl}/${firstImage.name}` : null,
          drawDateFormatted: format(project.drawDate, "cccc dd'/'MM'/'yyyy", {
            locale: es
          }),
          numOfTickets
        }
      })
    )

    response.statusCode = 200
    response.json(projects)
  } else {
    throw new Error(
      `The HTTP ${request.method} is not available for this route.`
    )
  }
}
