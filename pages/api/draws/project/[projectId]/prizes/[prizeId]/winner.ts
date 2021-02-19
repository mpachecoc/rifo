import type { NextApiRequest, NextApiResponse } from 'next'

import prisma from '../../../../../../../config/prismaClient'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async (request: NextApiRequest, response: NextApiResponse) => {
  const { projectId, prizeId } = request.query

  if (request.method === 'GET') {
    // Remove previous assigned prize if exist
    const numberOfTickets = await prisma.ticket.count({
      where: {
        prizeId: Number(prizeId)
      }
    })

    if (numberOfTickets > 0) {
      await prisma.ticket.update({
        where: {
          prizeId: Number(prizeId)
        },
        data: {
          prizeId: null
        }
      })
    }

    // Get All tickets (without prize)
    const tickets = await prisma.ticket.findMany({
      select: {
        id: true,
        ticketId: true
      },
      where: {
        projectId: Number(projectId),
        prizeId: null
      }
    })

    // Pick winner
    const index = Math.floor(Math.random() * tickets.length)

    // Update ticket with corrsponding prize
    await prisma.ticket
      .update({
        where: {
          id: tickets[index].id
        },
        data: {
          prizeId: Number(prizeId)
        }
      })
      .finally(async () => {
        await prisma.$disconnect()
      })

    response.statusCode = 200
    response.json(tickets[index])
  } else {
    throw new Error(
      `The HTTP ${request.method} is not available for this route.`
    )
  }
}
