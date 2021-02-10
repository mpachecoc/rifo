import React, { useEffect } from 'react'
import Link from 'next/link'
import { FiFileText, FiShoppingCart, FiGift, FiRefreshCw } from 'react-icons/fi'

import { useAuth } from '../hooks/auth'
import { useProject } from '../hooks/project'
import Header from '../components/Header'
import styles from '../styles/ProjectDashboard.module.css'
import SEO from '../components/SEO'

const projectDashboard: React.FC = () => {
  const { setVerifyToken } = useAuth()
  const { activeProjectName, activeProjectSlug } = useProject()

  useEffect(() => {
    setVerifyToken(true)
  }, [])

  return (
    <>
      <SEO
        title="Panel de Control"
        description="Rifo App es una plataforma que te ayuda en la organización de rifas, registro de tickets y sorteo de premios."
        image="open-graph-rifo-image.png"
        shouldIndexPage={false}
      />

      <Header />
      <div className={styles.container}>
        <h1>{activeProjectName}</h1>
        <div className={styles.sectionContainer}>
          <Link href={`${activeProjectSlug}`}>
            <div className={styles.section}>
              <FiFileText size={32} />
              <h3>Ir a Página Pública</h3>
            </div>
          </Link>
          <Link href="/register-ticket">
            <div className={styles.section}>
              <FiShoppingCart size={32} />
              <h3>Registrar Compra</h3>
            </div>
          </Link>
          <Link href="/prizes">
            <div className={styles.section}>
              <FiGift size={32} />
              <h3>Administrar Premios</h3>
            </div>
          </Link>
          <Link href="/draw">
            <div className={styles.section}>
              <FiRefreshCw size={32} />
              <h3>Sortear</h3>
            </div>
          </Link>
        </div>
      </div>
    </>
  )
}

export default projectDashboard
