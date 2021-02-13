import React, { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { useAuth } from '../hooks/auth'
import styles from '../styles/Home.module.css'
import SEO from '../components/SEO'

import RifoLogo from '../assets/logo-rifo.svg'
import RifoLanding from '../assets/landing-md.svg'

const Home: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)

  const { signIn } = useAuth()
  const router = useRouter()

  async function handleLogin(event: FormEvent) {
    event.preventDefault()

    setLoading(true)

    if (!email && !password) {
      alert('Campos vacios')
      setLoading(false)
      return
    }

    try {
      await signIn({
        email,
        password
      })

      setLoading(false)

      router.push('/projects')
    } catch (error) {
      console.log(error)

      setLoading(false)
      alert('Credenciales Invalidas')
    }
  }

  return (
    <div>
      <SEO
        title="Rifo App, una plataforma que te ayuda en la organización de tus rifas"
        description="Rifo App es una plataforma que te ayuda en la organización de rifas, registro de tickets y sorteo de premios."
        image="open-graph-rifo-image.png"
        shouldExcludeTitleSuffix
      />

      <main className={styles.container}>
        <div className={styles.left}>
          <RifoLogo />
          <h1>Organiza tus rifas y ayuda a buenas causas</h1>
          <form className={styles.loginForm} onSubmit={handleLogin}>
            <fieldset>
              <div className={styles.inputBlock}>
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              {
                // eslint-disable-next-line multiline-ternary
                loading ? (
                  <button className={styles.loginButtonLoading} disabled>
                    Cargando...
                  </button>
                ) : (
                  <button className={styles.loginButton} type="submit">
                    Ingresar
                  </button>
                )
              }
            </fieldset>
          </form>
          <Link href="/create-user">
            <a className={styles.register}>Soy nuevo, registrarme</a>
          </Link>
        </div>
        <div className={styles.right}>
          <RifoLanding />
        </div>
      </main>
    </div>
  )
}

export default Home
