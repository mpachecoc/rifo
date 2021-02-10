import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiTrash2, FiEdit, FiPlusCircle } from 'react-icons/fi'
import axios from 'axios'

import { useAuth } from '../hooks/auth'
import { useProject } from '../hooks/project'
import Header from '../components/Header'
import styles from '../styles/Prizes.module.css'
import SEO from '../components/SEO'

interface PrizeProps {
  id: number
  name: string
  description: string
  image?: string
  imageUrl?: string
}

const Prizes: React.FC = () => {
  const [prizes, setPrizes] = useState<PrizeProps[]>([])

  const { setVerifyToken } = useAuth()
  const { activeProjectId } = useProject()

  useEffect(() => {
    setVerifyToken(true)
  }, [])

  useEffect(() => {
    if (activeProjectId) {
      axios
        .get(`/api/project/${activeProjectId}/prizes`)
        .then(response => {
          setPrizes(response.data)
        })
        .catch(error => console.log(error))
    }
  }, [activeProjectId])

  // Delete Prize
  async function handlePrizeDelete(prizeId: number) {
    await axios.delete(`api/prizes/${prizeId}`)

    const prizesUpdated = prizes.filter(prize => prize.id !== prizeId)

    setPrizes(prizesUpdated)
  }

  if (!prizes) {
    return <p>Cargando...</p>
  }

  return (
    <>
      <SEO
        title="Premios"
        description="Rifo App es una plataforma que te ayuda en la organización de rifas, registro de tickets y sorteo de premios."
        image="open-graph-rifo-image.png"
        shouldIndexPage={false}
      />

      <Header />
      <div className={styles.container}>
        <h1>Premios</h1>
        <div className={styles.tableContainer}>
          <Link href="/register-prize">
            <a className={styles.newIcon}>
              <FiPlusCircle size={18} />
              Nuevo Premio
            </a>
          </Link>
          <table>
            <thead>
              <tr>
                <th></th>
                <th className={styles.centerxs}>Premio</th>
                <th className={styles.centerxs}>Descripción</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {prizes.map(prize => (
                <tr key={prize.id}>
                  <td className={styles.tableImage}>
                    {prize.imageUrl && (
                      <img src={prize.imageUrl} alt={prize.image} />
                    )}
                  </td>
                  <td className={styles.tableTitle}>{prize.name}</td>
                  <td>{prize.description}</td>
                  <td className={styles.actionIcons}>
                    <Link href="/project-dashboard">
                      <a>
                        <FiEdit size={18} color="#6b52da" />
                      </a>
                    </Link>
                    <FiTrash2
                      size={18}
                      color="#da5252"
                      onClick={() => handlePrizeDelete(prize.id)}
                    />
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

export default Prizes
