import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async (request: NextApiRequest, response: NextApiResponse) => {
  const { projectId } = request.query

  if (request.method === 'GET') {
    // Remove previous assigned prizes
    await prisma.ticket.updateMany({
      where: {
        projectId: Number(projectId)
      },
      data: {
        prizeId: null
      }
    })

    // Get Prizes
    const prizes = await prisma.prize.findMany({
      select: {
        id: true
      },
      where: {
        projectId: Number(projectId)
      },
      orderBy: {
        id: 'asc'
      }
    })

    // Get All tickets
    let tickets = await prisma.ticket.findMany({
      select: {
        id: true,
        ticketId: true
      },
      where: {
        projectId: Number(projectId)
      }
    })

    // Iterate prizes
    for (const prize of prizes) {
      // Pick winner
      const index = Math.floor(Math.random() * tickets.length)

      // Update ticket with corrsponding prize
      await prisma.ticket.update({
        where: {
          id: tickets[index].id
        },
        data: {
          prizeId: prize.id
        }
      })

      // Remove winner ticket from list
      tickets = tickets.filter(ticket => ticket.id !== tickets[index].id)
    }

    response.statusCode = 200
    response.json({ message: `${prizes.length} prizes assigned correctly.` })
  } else {
    throw new Error(
      `The HTTP ${request.method} is not available for this route.`
    )
  }
}
