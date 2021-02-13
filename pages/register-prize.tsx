import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { FiPlus } from 'react-icons/fi'

import { useAuth } from '../hooks/auth'
import { useProject } from '../hooks/project'
import Header from '../components/Header'
import styles from '../styles/RegisterPrize.module.css'
import SEO from '../components/SEO'

const RegisterPrize: React.FC = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { setVerifyToken } = useAuth()
  const { activeProjectId } = useProject()

  useEffect(() => {
    setVerifyToken(true)
  }, [])

  function handleSelectedImages(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) {
      return
    }

    const selectedImages = Array.from(event.target.files)

    setImages(selectedImages)

    const selectedImagesPreview = selectedImages.map(image => {
      return URL.createObjectURL(image)
    })

    setPreviewImages(selectedImagesPreview)
  }

  async function handleRegisterPrize(event: FormEvent) {
    event.preventDefault()

    setLoading(true)

    if (!name) {
      alert('Debe llenar el nombre')
      setLoading(false)
      return
    }

    let prizeImageFile = null
    let url = ''

    // Get URL to upload to AWS S3
    if (images[0]) {
      prizeImageFile = images[0]
      const response = await axios.post('/api/aws-s3-upload', {
        filename: prizeImageFile.name,
        type: prizeImageFile.type
      })

      url = await response.data.url
    }

    const data = {
      name,
      description,
      image: prizeImageFile ? prizeImageFile.name : null,
      projectId: activeProjectId
    }

    try {
      if (prizeImageFile) {
        await Promise.all([
          await axios.post('/api/prizes', data),
          await axios.put(url, prizeImageFile, {
            headers: {
              'Content-type': prizeImageFile.type
            }
          })
        ])
      } else {
        await axios.post('/api/prizes', data)
      }

      setLoading(false)

      alert('Se creó el premio correctamente.')

      router.replace('/prizes')
    } catch (err) {
      setLoading(false)

      alert('No se pudo crear el premio, por favor intente de nuevo.')

      console.log(err)
    }
  }

  return (
    <>
      <SEO
        title="Registrar Premio"
        description="Rifo App es una plataforma que te ayuda en la organización de rifas, registro de tickets y sorteo de premios."
        image="open-graph-rifo-image.png"
        shouldIndexPage={false}
      />

      <Header />
      <div className={styles.container}>
        <h1>Registrar Premio</h1>
        <div className={styles.formContainer}>
          <form
            className={styles.registerTicketForm}
            onSubmit={handleRegisterPrize}
          >
            <fieldset>
              <div className={styles.inputBlock}>
                <label htmlFor="images">Foto (1 Max.)</label>

                <div className={styles.imageContainer}>
                  {previewImages.map(image => (
                    <img key={image} src={image} alt={name} />
                  ))}

                  <label htmlFor="image[]" className={styles.newImage}>
                    <FiPlus size={24} color="#15b6d6" />
                  </label>
                </div>

                <input
                  onChange={handleSelectedImages}
                  type="file"
                  id="image[]"
                />
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="name">Nombre del premio *</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
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

export default RegisterPrize
