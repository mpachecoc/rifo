import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'POST') {
    const { ci, name, phone, isPaid, projectId, numberOfTickets } = request.body

    // Get last Ticket number registered
    const aggregations = await prisma.ticket.aggregate({
      max: {
        ticketId: true
      },
      where: {
        projectId
      }
    })

    const lastTicketNumber = aggregations.max.ticketId

    // Create Tickets
    let newTicket = {}

    for (let num = 1; num <= Number(numberOfTickets); num += 1) {
      newTicket = await prisma.ticket.create({
        data: {
          ci,
          name,
          phone: Number(phone),
          paid: isPaid,
          projectId,
          ticketId: lastTicketNumber + num
        }
      })
    }

    response.statusCode = 201
    response.json(newTicket)
  } else {
    throw new Error(
      `The HTTP ${request.method} is not available for this route.`
    )
  }
}
