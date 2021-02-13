import React, { useEffect, useState, useMemo } from 'react'
import { FiRefreshCw, FiHelpCircle } from 'react-icons/fi'
import { FaGift } from 'react-icons/fa'
import axios from 'axios'
import Confetti from 'react-dom-confetti'

import { useAuth } from '../hooks/auth'
import { useProject } from '../hooks/project'
import Header from '../components/Header'
import styles from '../styles/Draw.module.css'
import SEO from '../components/SEO'
import { Confirm } from '../config/toast'

interface PrizeProps {
  id: number
  name: string
  description: string
  image?: string
  imageUrl?: string
  Ticket: {
    id: number
    ci: number
    name: string
    phone: number
    ticketId: number
    paid: boolean
  } | null
}

const Draw: React.FC = () => {
  const [prizes, setPrizes] = useState<PrizeProps[]>([])
  const [projectAcronym, setProjectAcronym] = useState('')
  const [loadingDraw, setLoadingDraw] = useState(false)
  const [loadingDrawByPrize, setLoadingDrawByPrize] = useState(false)
  const [loadingPrizeId, setLoadingPrizeId] = useState(0)
  const [triggerConfetti, setTriggerConfetti] = useState(false)

  const { setVerifyToken } = useAuth()
  const { activeProjectId, activeProjectName } = useProject()

  useEffect(() => {
    setVerifyToken(true)
  }, [])

  const confettiConfig = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 150,
    dragFriction: 0.11,
    duration: 5000,
    stagger: 3,
    width: '13px',
    height: '13px',
    perspective: '700px'
  }

  function getProjectAcronym(projectName: string) {
    return projectName
      .split(/\s/)
      .reduce((response, word) => (response += word.slice(0, 1)), '')
      .toUpperCase()
  }

  useEffect(() => {
    if (activeProjectId) {
      axios
        .get(`/api/draws/project/${activeProjectId}/prizes`)
        .then(response => {
          setPrizes(response.data)
          setProjectAcronym(getProjectAcronym(activeProjectName))
        })
        .catch(error => console.log(error))
    }
  }, [activeProjectId])

  // Format prizes[] (add complete ticket ID)
  const prizesFormatted = useMemo(() => {
    return prizes.map(prize => ({
      ...prize,
      ticketIdFormatted: prize.Ticket
        ? `${projectAcronym}-${String(prize.Ticket.ticketId).padStart(4, '0')}`
        : ''
    }))
  }, [prizes, projectAcronym])

  // Draw All Prizes at once
  async function handleDrawAllPrizes() {
    Confirm.fire({
      text: '¿Está seguro(a) que desea sortear los premios?'
    }).then(async result => {
      if (result.isConfirmed) {
        setLoadingDraw(true)
        setTriggerConfetti(false)

        // Call draw winners
        await axios.get(`/api/draws/project/${activeProjectId}/winners`)

        // Get again prizes with corresponding winners
        axios
          .get(`/api/draws/project/${activeProjectId}/prizes`)
          .then(response => {
            setTimeout(() => {
              setPrizes(response.data)
              setTriggerConfetti(true)
              setLoadingDraw(false)
            }, 3000)
          })
          .catch(error => console.log(error))
      }
    })
  }

  // Draw 1 Prize
  async function handleDrawOnePrize(prizeId: number) {
    Confirm.fire({
      text: '¿Está seguro(a) que desea sortear este premio?'
    }).then(async result => {
      if (result.isConfirmed) {
        setLoadingDrawByPrize(true)
        setLoadingPrizeId(prizeId)
        setTriggerConfetti(false)

        // Call draw winner
        await axios.get(
          `/api/draws/project/${activeProjectId}/prizes/${prizeId}/winner`
        )

        // Get again prizes with corresponding winners
        axios
          .get(`/api/draws/project/${activeProjectId}/prizes`)
          .then(response => {
            setTimeout(() => {
              setPrizes(response.data)
              setTriggerConfetti(true)
              setLoadingDrawByPrize(false)
            }, 3000)
          })
          .catch(error => console.log(error))
      }
    })
  }

  return (
    <>
      <SEO
        title={`Sorteo | ${activeProjectName}`}
        description="Rifo App es una plataforma que te ayuda en la organización de rifas, registro de tickets y sorteo de premios."
        image="open-graph-rifo-image.png"
        shouldIndexPage={false}
      />

      <Header />
      <div className={styles.container}>
        <h1>Sorteo de Premios - {activeProjectName}</h1>
        <div className={styles.tableContainer}>
          {
            // eslint-disable-next-line multiline-ternary
            !loadingDraw ? (
              <button
                className={styles.drawAllButton}
                onClick={handleDrawAllPrizes}
              >
                <FiRefreshCw size={20} />
                Sortear Todos los Premios
              </button>
            ) : (
              <button className={styles.drawAllButton}>
                <FiRefreshCw size={20} />
                Sorteando...
              </button>
            )
          }

          <div className={styles.confettiContainer}>
            <Confetti active={triggerConfetti} config={confettiConfig} />
          </div>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Premio</th>
                <th>Descripción</th>
                <th>Sortear</th>
                <th>Ganador</th>
              </tr>
            </thead>

            <tbody>
              {prizesFormatted.map(prize => (
                <tr key={prize.id}>
                  <td className={styles.tableImage}>
                    {prize.imageUrl && (
                      <img src={prize.imageUrl} alt={prize.name} />
                    )}
                  </td>
                  <td className={styles.tableTitle}>{prize.name}</td>
                  <td>{prize.description}</td>
                  <td className={styles.drawIcon}>
                    {
                      // eslint-disable-next-line multiline-ternary
                      loadingDrawByPrize && prize.id === loadingPrizeId ? (
                        <p>Sorteando...</p>
                      ) : (
                        <FiRefreshCw
                          size={24}
                          onClick={() => handleDrawOnePrize(prize.id)}
                        />
                      )
                    }
                  </td>
                  <td className={styles.winner}>
                    {
                      // eslint-disable-next-line multiline-ternary
                      prize.Ticket ? (
                        <>
                          <span className={styles.riffleNum}>
                            <FaGift size={16} color="#12a454" />
                            Nro: {prize.ticketIdFormatted}
                            <br />
                          </span>
                          <span className={styles.riffleWinner}>
                            CI. {prize.Ticket.ci}
                            <br />
                            {prize.Ticket.name}
                          </span>
                        </>
                      ) : (
                        <FiHelpCircle size={30} color="#f88a8a" />
                      )
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default Draw
