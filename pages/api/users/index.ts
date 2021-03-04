import type { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcryptjs'

import prisma from '../../../config/prismaClient'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'POST') {
    const { name, email, password, phone } = request.body

    // Check User Email
    const checkUserExists = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (checkUserExists) {
      response.statusCode = 400
      response.json({ message: 'Email address already used' })
      return
    }

    // Create User
    const hashedPassword = await hash(password, 8)

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: Number(phone)
      },
      select: {
        name: true,
        email: true,
        phone: true
      }
    })

    response.statusCode = 201
    response.json(newUser)
  } else {
    throw new Error(
      `The HTTP ${request.method} is not available for this route.`
    )
  }
}
