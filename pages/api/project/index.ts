import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Project } from '@prisma/client'

const prisma = new PrismaClient()

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'POST') {
    const {
      name,
      description,
      price,
      drawDate,
      ownerId,
      imageNames
    } = request.body

    // Generate 'slug', check if unique, add subfix accordingly
    let slug = name.replace(/\s+/g, '-').toLowerCase()

    const projectExist = await prisma.project.findUnique({
      where: { slug }
    })

    if (projectExist) {
      const numOfProjects = await prisma.project.count({
        where: {
          slug: {
            contains: slug
          }
        }
      })

      slug = `${slug}-${numOfProjects + 1}`
    }

    const newProject: Project = await prisma.project.create({
      data: {
        name,
        description,
        price: Number(price),
        drawDate: new Date(drawDate),
        ownerId,
        slug,
        Images: {
          create: imageNames
        }
      }
    })

    response.statusCode = 201
    response.json(newProject)
  } else {
    throw new Error(
      `The HTTP ${request.method} is not available for this route.`
    )
  }
}
