import React, { useState, FormEvent, useEffect } from 'react'
import axios from 'axios'

import { useAuth } from '../hooks/auth'
import { useProject } from '../hooks/project'
import Header from '../components/Header'
import styles from '../styles/RegisterTicket.module.css'
import SEO from '../components/SEO'

const RegisterTicket: React.FC = () => {
  const [ci, setCi] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isPaid, setIsPaid] = useState(true)
  const [numberOfTickets, setNumberOfTickets] = useState('1')

  const [loading, setLoading] = useState(false)

  const { setVerifyToken } = useAuth()
  const { activeProjectId } = useProject()

  useEffect(() => {
    setVerifyToken(true)
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    setLoading(true)

    if (!ci || !name || !phone) {
      alert('Campos vacios')
      setLoading(false)
      return
    }

    const data = {
      ci,
      name,
      phone,
      isPaid,
      projectId: activeProjectId,
      numberOfTickets
    }

    await axios.post('/api/tickets', data)

    setCi('')
    setName('')
    setPhone('')
    setIsPaid(true)
    setNumberOfTickets('1')

    setLoading(false)

    alert('Ticket(s) registrados correctamente.')
  }

  return (
    <>
      <SEO
        title="Registrar Ticket(s)"
        description="Rifo App es una plataforma que te ayuda en la organización de rifas, registro de tickets y sorteo de premios."
        image="open-graph-rifo-image.png"
        shouldIndexPage={false}
      />

      <Header />
      <div className={styles.container}>
        <h1>Registrar Ticket(s)</h1>
        <div className={styles.formContainer}>
          <form className={styles.registerTicketForm} onSubmit={handleSubmit}>
            <fieldset>
              <div className={styles.inputBlock}>
                <label htmlFor="ci">Cédula de Identidad *</label>
                <input
                  id="ci"
                  type="text"
                  value={ci}
                  onChange={e => setCi(e.target.value)}
                />
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="name">Nombres y Apellidos *</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="phone">Teléfono/Celular *</label>
                <input
                  id="phone"
                  type="number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="numTickets">Num. de Tickets *</label>
                <input
                  id="numTickets"
                  type="number"
                  value={numberOfTickets}
                  onChange={e => setNumberOfTickets(e.target.value)}
                />
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="isPaid">¿Pagado?</label>
                <div className={styles.buttonSelect}>
                  <button
                    type="button"
                    className={isPaid ? styles.active : ''}
                    onClick={() => setIsPaid(true)}
                  >
                    SÍ
                  </button>
                  <button
                    type="button"
                    className={!isPaid ? styles.activeFalse : ''}
                    onClick={() => setIsPaid(false)}
                  >
                    NO
                  </button>
                </div>
              </div>
            </fieldset>

            {
              // eslint-disable-next-line multiline-ternary
              loading ? (
                <button className={styles.saveButtonLoading} disabled>
                  Guardando...
                </button>
              ) : (
                <button className={styles.saveButton} type="submit">
                  Guardar
                </button>
              )
            }
          </form>
        </div>
      </div>
    </>
  )
}

export default RegisterTicket
