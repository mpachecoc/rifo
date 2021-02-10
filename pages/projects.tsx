import React, { useCallback, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FiPlusCircle } from 'react-icons/fi'
import axios from 'axios'

import { useAuth } from '../hooks/auth'
import { useProject } from '../hooks/project'
import Header from '../components/Header'
import styles from '../styles/Project.module.css'
import SEO from '../components/SEO'

interface ProjectProps {
  id: number
  name: string
  price: number
  drawDate: Date
  drawDateFormatted: string
  imageUrl: string
  slug: string
  numOfTickets: number
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectProps[]>([])

  const router = useRouter()

  const { user, setVerifyToken } = useAuth()
  const { setActiveProject } = useProject()

  useEffect(() => {
    setVerifyToken(true)
  }, [])

  useEffect(() => {
    if (user) {
      axios
        .get(`/api/project/user/${user.id}`)
        .then(response => {
          setProjects(response.data)
        })
        .catch(error => console.log(error))
    }
  }, [user])

  const handleClickProject = useCallback(
    (id: number, name: string, slug: string) => {
      setActiveProject({ id, name, slug })
      localStorage.setItem('@Rifo:projectId', String(id))
      localStorage.setItem('@Rifo:projectName', name)
      localStorage.setItem('@Rifo:projectSlug', slug)

      router.push('/project-dashboard')
    },
    []
  )

  if (!projects) {
    return <p>Cargando...</p>
  }

  return (
    <>
      <SEO
        title="Mis Rifas"
        description="Rifo App es una plataforma que te ayuda en la organización de rifas, registro de tickets y sorteo de premios."
        image="open-graph-rifo-image.png"
        shouldIndexPage={false}
      />

      <Header />
      <div className={styles.container}>
        <h1>Mis Rifas Organizadas</h1>
        <div className={styles.tableContainer}>
          <Link href="/register-project">
            <a className={styles.newIcon}>
              <FiPlusCircle size={18} />
              Nuevo Proyecto
            </a>
          </Link>
          <table>
            <thead>
              <tr>
                <th></th>
                <th className={styles.centerxs}>Nombre</th>
                <th className={styles.center}>Rifas Vendidas</th>
                <th className={styles.center}>Precio</th>
                <th className={styles.center}>Sorteo</th>
              </tr>
            </thead>

            <tbody>
              {projects.map(project => (
                <tr
                  onClick={() =>
                    handleClickProject(project.id, project.name, project.slug)
                  }
                  key={project.id}
                >
                  <td className={styles.tableImage}>
                    {project.imageUrl && (
                      <img src={project.imageUrl} alt={project.name} />
                    )}
                  </td>
                  <td className={styles.tableTitle}>{project.name}</td>
                  <td className={styles.tableSoldTickets}>
                    {project.numOfTickets}
                  </td>
                  <td className={styles.center}>Bs.- {project.price}</td>
                  <td className={styles.center}>{project.drawDateFormatted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default Projects
