import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { FiPlus } from 'react-icons/fi'

import { useAuth } from '../hooks/auth'
import Header from '../components/Header'
import styles from '../styles/RegisterProject.module.css'
import SEO from '../components/SEO'
import { Toast } from '../config/toast'

const RegisterProject: React.FC = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('0')
  const [drawDate, setDrawDate] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const { user, setVerifyToken } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setVerifyToken(true)
  }, [])

  function handleSelectedImages(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) {
      return
    }

    const selectedImages = Array.from(event.target.files)

    const storedPlusSelectedImages = [...images, ...selectedImages]

    setImages(storedPlusSelectedImages)

    const selectedImagesPreview = storedPlusSelectedImages.map(image => {
      return URL.createObjectURL(image)
    })

    setPreviewImages(selectedImagesPreview)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    setLoading(true)

    if (!name || !price || !drawDate) {
      Toast.fire({
        icon: 'warning',
        title: 'Alerta',
        text: '¡Campos Vacios!'
      })

      setLoading(false)
      return
    }

    const imagesFile = []
    const imageNames = []
    const urls = []

    // Get URL to upload to AWS S3
    if (images[0]) {
      images.map(async image => {
        imagesFile.push(image)
        imageNames.push({ name: image.name })

        const response = await axios.post('/api/aws-s3-upload', {
          filename: image.name,
          type: image.type
        })

        urls.push(await response.data.url)
      })
    }

    const data = {
      name,
      description,
      price,
      drawDate,
      ownerId: user.id,
      imageNames
    }

    try {
      if (imagesFile[0]) {
        await Promise.all([
          await axios.post('/api/project', data),
          // Upload to AWS S3
          urls.forEach(async (url, index) => {
            await axios.put(url, imagesFile[index], {
              headers: {
                'Content-type': imagesFile[index].type
              }
            })
          })
        ])
      } else {
        await axios.post('/api/project', data)
      }

      setLoading(false)

      Toast.fire({
        icon: 'success',
        title: 'Ok',
        text: '¡Proyecto creado correctamente!'
      })

      router.replace('/projects')
    } catch (err) {
      setLoading(false)

      Toast.fire({
        icon: 'error',
        title: 'Error',
        text: '¡No se creó el proyecto, por favor intente de nuevo!'
      })

      console.log(err)
    }
  }

  return (
    <>
      <SEO
        title="Nueva Rifa"
        description="Rifo App es una plataforma que te ayuda en la organización de rifas, registro de tickets y sorteo de premios."
        image="open-graph-rifo-image.png"
        shouldIndexPage={false}
      />

      <Header />
      <div className={styles.container}>
        <h1>Registrar Proyecto (Rifa)</h1>
        <div className={styles.formContainer}>
          <form className={styles.registerProjectForm} onSubmit={handleSubmit}>
            <fieldset>
              <div className={styles.inputBlock}>
                <label htmlFor="images">Foto(s) (Max. 5 fotos)</label>

                <div className={styles.imageContainer}>
                  {previewImages.map(image => (
                    <img key={image} src={image} alt={name} />
                  ))}

                  <label htmlFor="image[]" className={styles.newImage}>
                    <FiPlus size={24} color="#15b6d6" />
                  </label>
                </div>

                <input
                  multiple
                  onChange={handleSelectedImages}
                  type="file"
                  id="image[]"
                />
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="name">Nombre del proyecto *</label>
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
              <div className={styles.inputBlock}>
                <label htmlFor="price">Precio de cada rifa (Bs.) *</label>
                <input
                  id="price"
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="drawDate">Fecha del sorteo *</label>
                <input
                  id="drawDate"
                  type="date"
                  value={drawDate}
                  onChange={e => setDrawDate(e.target.value)}
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

export default RegisterProject
