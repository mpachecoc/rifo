import React, { useRef, useState } from 'react'
import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import { FiUsers, FiDownload } from 'react-icons/fi'
import { FaTicketAlt, FaGift } from 'react-icons/fa'
import { useReactToPrint } from 'react-to-print'

import prisma from '../../config/prismaClient'
import Header from '../../components/Header'
import styles from '../../styles/Tickets.module.css'
import SEO from '../../components/SEO'
import uploadConfig from '../../config/upload'
import PrizeInfoModal from '../../components/PrizeInfoModal'

interface PrizeProps {
  id: number
  name: string
  description: string
  image?: string
}

interface TicketProps {
  projectName: string
  projectImageUrl?: string
  tickets: Array<{
    id: number
    name: string
    ticketId: number
    ticketNumber: string
    prizeImageUrl?: string
    prizeId?: number
    Prize?: PrizeProps
  }>
}

const Tickets: React.FC<TicketProps> = ({
  projectName,
  projectImageUrl,
  tickets
}: TicketProps) => {
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false)
  const [prizeIdModalOpened, setPrizeIdModalOpened] = useState(0)

  const componentRefToPrint = useRef()
  const handlePrint = useReactToPrint({
    content: () => componentRefToPrint.current
  })

  const { isFallback } = useRouter()

  if (isFallback) {
    return <p>Cargando...</p>
  }

  function handleOpenPrizeModal(prizeId: number) {
    setIsPrizeModalOpen(true)
    setPrizeIdModalOpened(prizeId)
  }

  return (
    <>
      <SEO
        title="Tus Tickets"
        description="Rifo App es una plataforma que te ayuda en la organización de rifas, registro de tickets y sorteo de premios."
        image="open-graph-rifo-image.png"
        shouldIndexPage={false}
      />

      <Header />

      <div className={styles.container}>
        <h1>Tus Tickets</h1>
        <div className={styles.downloadContainer}>
          <button className={styles.downloadButton} onClick={handlePrint}>
            <FiDownload size={20} />
            Descargar
          </button>
        </div>
        <div className={styles.ticketsContainer} ref={componentRefToPrint}>
          {tickets.map(ticket => {
            if (ticket.prizeId) {
              return (
                <div className={styles.winner} key={ticket.ticketId}>
                  <div className={styles.left}>
                    {
                      // eslint-disable-next-line multiline-ternary
                      projectImageUrl ? (
                        <img src={projectImageUrl} alt={projectName} />
                      ) : (
                        <FaTicketAlt size={32} color="#15B6D6" />
                      )
                    }
                    {projectName} <br />
                    {ticket.ticketNumber}
                  </div>
                  <div className={styles.right}>
                    <FaGift size={20} color="#37C77F" />
                    <p>
                      <span
                        onClick={() => handleOpenPrizeModal(ticket.Prize.id)}
                      >
                        GANADOR
                      </span>{' '}
                      <br />
                      {ticket.name} <br />
                      {ticket.ticketNumber}
                    </p>
                  </div>

                  {isPrizeModalOpen && ticket.Prize.id === prizeIdModalOpened && (
                    <PrizeInfoModal
                      name={ticket.Prize.name}
                      description={ticket.Prize.description}
                      imageUrl={ticket.prizeImageUrl}
                      displayModal={setIsPrizeModalOpen}
                    />
                    // eslint-disable-next-line prettier/prettier
                  )}
                </div>
              )
            } else {
              return (
                <div className={styles.ticket} key={ticket.ticketId}>
                  <div className={styles.left}>
                    {
                      // eslint-disable-next-line multiline-ternary
                      projectImageUrl ? (
                        <img src={projectImageUrl} alt={projectName} />
                      ) : (
                        <FaTicketAlt size={32} color="#15B6D6" />
                      )
                    }
                    {projectName} <br />
                    {ticket.ticketNumber}
                  </div>
                  <div className={styles.right}>
                    <FiUsers size={32} color="#15B6D6" />
                    <p>
                      {ticket.name} <br />
                      {ticket.ticketNumber}
                    </p>
                  </div>
                </div>
              )
            }
          })}
        </div>
      </div>
    </>
  )
}

export default Tickets

export const getStaticPaths: GetStaticPaths = async () => {
  // Return ticket IDs (on demand) according to buyers
  return {
    paths: [],
    fallback: true
  }
}

export const getStaticProps: GetStaticProps = async context => {
  const { projectId: projectSlug, ci } = context.params

  // Get ProjectId
  const project = await prisma.project.findUnique({
    where: { slug: String(projectSlug) },
    include: {
      Images: true
    }
  })

  if (!project) {
    return {
      notFound: true
    }
  }

  // Get Tickets
  const dbTickets = await prisma.ticket.findMany({
    where: {
      ci: String(ci),
      projectId: Number(project.id)
    },
    orderBy: {
      ticketId: 'asc'
    },
    include: {
      Prize: true
    }
  })

  // Build Ticket response
  const projectAcronym = project.name
    .split(/\s/)
    .reduce((response, word) => (response += word.slice(0, 1)), '')
    .toUpperCase()

  const { awsUrl } = uploadConfig.config

  const tickets = dbTickets.map(ticket => {
    delete ticket.ci
    delete ticket.phone
    delete ticket.paid
    delete ticket.projectId
    delete ticket.createdAt
    delete ticket.updatedAt

    if (ticket.Prize) {
      delete ticket.Prize.projectId
      delete ticket.Prize.createdAt
      delete ticket.Prize.updatedAt
    }

    return {
      ...ticket,
      ticketNumber: `${projectAcronym}-${String(ticket.ticketId).padStart(
        4,
        '0'
      )}`,
      prizeImageUrl:
        ticket.Prize && ticket.Prize.image
          ? `${awsUrl}/${ticket.Prize.image}`
          : null
    }
  })

  return {
    props: {
      projectName: project.name,
      projectImageUrl:
        project.Images.length > 0
          ? `${awsUrl}/${project.Images[0].name}`
          : null,
      tickets
    },
    revalidate: 5
  }
}
