import React, { useState } from 'react'
import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import { FiDollarSign, FiCalendar } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { format } from 'date-fns'
import es from 'date-fns/locale/es'

import prisma from '../../config/prismaClient'
import uploadConfig from '../../config/upload'
import Header from '../../components/Header'
import styles from '../../styles/ProjectInfo.module.css'
import SEO from '../../components/SEO'

import placeholderImage from '../../assets/placeholder-image.png'

interface UserProps {
  id: number
  name: string
  phone: number
}

interface ImagesProps {
  id: number
  url: string
}

interface ProjectProps {
  project: {
    name: string
    description: string
    price: number
    drawDate: Date
    drawDateFormatted: string
    images: Array<ImagesProps>
    User: UserProps
  }
  prizes: Array<{
    id: number
    name: string
    description: string
    image?: string
  }>
}

const ProjectInfo: React.FC<ProjectProps> = ({
  project,
  prizes
}: ProjectProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const { isFallback, push } = useRouter()

  if (isFallback) {
    return <p>Cargando...</p>
  }

  function handleLinkToWapp({ name, phone }: UserProps) {
    const message = `Hola ${
      name.split(' ')[0]
    }! Vi el proyecto online y me gustaria comprar rifas :)`

    push(`https://api.whatsapp.com/send?phone=591${phone}&text=${message}`)
  }

  return (
    <>
      <SEO
        title={project.name}
        description={`Rifo App es una plataforma que te ayuda en la organización de rifas.
          ${project.description}`}
        image="open-graph-rifo-image.png"
      />

      <Header extended={true} />
      <div className={styles.container}>
        <div className={styles.infoContainer}>
          {
            // eslint-disable-next-line multiline-ternary
            project.images.length > 0 ? (
              <img
                src={project.images[activeImageIndex].url}
                alt={project.name}
              />
            ) : (
              <img src={placeholderImage} alt={project.name} />
            )
          }

          <div className={styles.otherImages}>
            {project.images.length > 0 &&
              project.images.map((image, index) => (
                <button
                  key={image.id}
                  className={activeImageIndex === index ? styles.active : ''}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={image.url} alt={project.name} />
                </button>
              ))}
          </div>

          <div className={styles.riffleDetailsContent}>
            <h1>{project.name}</h1>
            <p>{project.description}</p>

            <h2>Informaciones</h2>
            <p>Conozca los detalles de la Rifa.</p>

            <div className={styles.riffleDetails}>
              <div className={styles.price}>
                <FiDollarSign size={32} color="#15B6D6" />
                Precio de la rifa <br />
                Bs.- {project.price}
              </div>
              <div className={styles.drawDate}>
                <FiCalendar size={32} color="#39CC83" />
                Fecha del sorteo <br />
                {project.drawDateFormatted}
              </div>
            </div>

            <button
              type="button"
              className={styles.contactButton}
              onClick={() => handleLinkToWapp(project.User)}
            >
              <FaWhatsapp size={20} color="#FFF" />
              Entrar en contacto
            </button>

            <h2>Premios y Ganadores</h2>
            <div className={styles.tableContainer}>
              <table>
                <thead>
                  <tr>
                    <th className={styles.hideColumn}></th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {prizes.map(prize => (
                    <tr key={prize.id}>
                      <td className={styles.hideColumn}>{prize.name}</td>
                      <td>{prize.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProjectInfo

export const getStaticPaths: GetStaticPaths = async () => {
  // Get last 20 created projects to generate statically at build time

  return {
    paths: [],
    fallback: true
  }
}

export const getStaticProps: GetStaticProps = async context => {
  const { projectId: projectSlug } = context.params

  // Call API using 'projectSlug' to fetch Project data
  const dbProject = await prisma.project.findUnique({
    where: { slug: String(projectSlug) },
    include: {
      User: true,
      Images: true
    }
  })

  if (!dbProject) {
    return {
      notFound: true
    }
  }

  const { awsUrl } = uploadConfig.config

  const project = {
    ...dbProject,
    createdAt: JSON.parse(JSON.stringify(dbProject.createdAt)),
    updatedAt: JSON.parse(JSON.stringify(dbProject.updatedAt)),
    drawDate: JSON.parse(JSON.stringify(dbProject.drawDate)),
    drawDateFormatted: format(dbProject.drawDate, "cccc dd'/'MM'/'yyyy", {
      locale: es
    }),
    images: dbProject.Images.map(image => {
      return {
        id: image.id,
        url: `${awsUrl}/${image.name}`
      }
    })
  }

  delete project.User.email
  delete project.User.password
  delete project.Images

  // Get Prizes
  const prizes = await prisma.prize.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      image: true
    },
    where: {
      projectId: project.id
    },
    take: 15
  })

  return {
    props: {
      project,
      prizes
    },
    revalidate: 60
  }
}
