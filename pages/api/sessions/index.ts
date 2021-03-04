import type { NextApiRequest, NextApiResponse } from 'next'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'

import prisma from '../../../config/prismaClient'
import authConfig from '../../../config/auth'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'POST') {
    const { email, password } = request.body

    // Check User
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (!user) {
      response.statusCode = 401
      response.json({ message: 'Incorrect email/password combination' })
      return
    }

    // Check Password
    const passwordMatched = await compare(password, user.password)

    if (!passwordMatched) {
      response.statusCode = 401
      response.json({ message: 'Incorrect email/password combination' })
      return
    }

    delete user.password

    // Generate JWT Token
    const { secret, expiresIn } = authConfig.jwt

    const token = sign({}, secret, {
      subject: String(user.id),
      expiresIn
    })

    response.statusCode = 201
    response.json({ user, token })
  } else {
    throw new Error(
      `The HTTP ${request.method} is not available for this route.`
    )
  }
}
