import React from 'react'
import Link from 'next/link'
import { FaLaughSquint } from 'react-icons/fa'

import Header from '../components/Header'
import styles from '../styles/NotFound.module.css'
import SEO from '../components/SEO'

const NotFound: React.FC = () => {
  return (
    <>
      <SEO
        title="Página o proyecto no encontrados"
        description="Rifo App es una plataforma que te ayuda en la organización de rifas, registro de tickets y sorteo de premios."
        image="open-graph-rifo-image.png"
        shouldIndexPage={false}
      />

      <Header />
      <div className={styles.container}>
        <div className={styles.layout}>
          <h2>
            ¡Ops! la página o proyecto no fueron encontrados
            <FaLaughSquint size={42} />
          </h2>
          <Link href="/create-user">
            <a className={styles.register}>
              Pero puedes crear tus propios proyectos, haz click aquí para
              registrarte
            </a>
          </Link>
        </div>
      </div>
    </>
  )
}

export default NotFound
