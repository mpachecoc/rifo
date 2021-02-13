import React, { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

import Header from '../components/Header'
import styles from '../styles/CreateUser.module.css'
import SEO from '../components/SEO'
import { Toast } from '../config/toast'

const CreateUser: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')

  const [loading, setLoading] = useState(false)

  const router = useRouter()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    setLoading(true)

    if (!email || !password) {
      Toast.fire({
        icon: 'warning',
        title: 'Alerta',
        text: '¡Debe llenar el Correo y la Contraseña!'
      })

      setLoading(false)
      return
    }

    const data = {
      name,
      email,
      password,
      phone
    }

    await axios.post('/api/users', data)

    setLoading(false)

    Toast.fire({
      icon: 'success',
      title: 'Ok',
      text: '¡Usuario Creado Correctamente!'
    })

    router.push('/')
  }

  return (
    <>
      <SEO
        title="Registrarme"
        description="Rifo App es una plataforma que te ayuda en la organización de rifas, registro de tickets y sorteo de premios."
        image="open-graph-rifo-image.png"
      />

      <Header />
      <div className={styles.container}>
        <h1>Registrarme</h1>
        <div className={styles.formContainer}>
          <form className={styles.registerUserForm} onSubmit={handleSubmit}>
            <fieldset>
              <div className={styles.inputBlock}>
                <label htmlFor="name">Nombre y Apellido</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="email">Correo Electrónico *</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="password">Contraseña *</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="phone">Celular</label>
                <input
                  id="phone"
                  type="number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </fieldset>

            {
              // eslint-disable-next-line multiline-ternary
              loading ? (
                <button className={styles.saveButtonLoading} disabled>
                  Registrando...
                </button>
              ) : (
                <button className={styles.saveButton} type="submit">
                  Registrar
                </button>
              )
            }
          </form>
        </div>
      </div>
    </>
  )
}

export default CreateUser
