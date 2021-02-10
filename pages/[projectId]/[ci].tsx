import React, { useRef } from 'react'
import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import { PrismaClient } from '@prisma/client'
import { FiUsers, FiDownload } from 'react-icons/fi'
import { FaTicketAlt, FaGift } from 'react-icons/fa'
import { useReactToPrint } from 'react-to-print'

import Header from '../../components/Header'
import styles from '../../styles/Tickets.module.css'
import SEO from '../../components/SEO'

interface TicketProps {
  projectName: string
  tickets: Array<{
    name: string
    ticketId: number
    ticketNumber: string
    prizeId?: number
  }>
}

const Tickets: React.FC<TicketProps> = ({
  projectName,
  tickets
}: TicketProps) => {
  const componentRefToPrint = useRef()
  const handlePrint = useReactToPrint({
    content: () => componentRefToPrint.current
  })

  const { isFallback } = useRouter()

  if (isFallback) {
    return <p>Cargando...</p>
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
                    <FaTicketAlt size={32} color="#37C77F" />
                    {projectName} <br />
                    {ticket.ticketNumber}
                  </div>
                  <div className={styles.right}>
                    <FaGift size={20} color="#37C77F" />
                    <p>
                      <span>GANADOR</span> <br />
                      {ticket.name} <br />
                      {ticket.ticketNumber}
                    </p>
                  </div>
                </div>
              )
            } else {
              return (
                <div className={styles.ticket} key={ticket.ticketId}>
                  <div className={styles.left}>
                    <FaTicketAlt size={32} color="#15B6D6" />
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

const prisma = new PrismaClient()

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
    where: { slug: String(projectSlug) }
  })

  if (!project) {
    return {
      notFound: true
    }
  }

  // Get Tickets
  const dbTickets = await prisma.ticket.findMany({
    select: {
      name: true,
      ticketId: true,
      prizeId: true
    },
    where: {
      ci: String(ci),
      projectId: Number(project.id)
    },
    orderBy: {
      ticketId: 'asc'
    }
  })

  // Build Ticket response
  const projectAcronym = project.name
    .split(/\s/)
    .reduce((response, word) => (response += word.slice(0, 1)), '')
    .toUpperCase()

  const tickets = dbTickets.map(ticket => ({
    ...ticket,
    ticketNumber: `${projectAcronym}-${String(ticket.ticketId).padStart(
      4,
      '0'
    )}`
  }))

  return {
    props: {
      projectName: project.name,
      tickets
    },
    revalidate: 10
  }
}
