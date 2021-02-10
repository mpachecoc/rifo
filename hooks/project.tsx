import React, { createContext, useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'

interface ActiveProjectState {
  id: number
  name: string
  slug: string
}

interface ProjectContextData {
  activeProjectId: number
  activeProjectName: string
  activeProjectSlug: string
  setActiveProject(data: ActiveProjectState): void
}

const ProjectContext = createContext<ProjectContextData>(
  {} as ProjectContextData
)

export const ProjectProvider: React.FC = ({ children }) => {
  const [activeProject, setActiveProject] = useState<ActiveProjectState>(
    {} as ActiveProjectState
  )

  useEffect(() => {
    const id = Number(localStorage.getItem('@Rifo:projectId'))
    const name = localStorage.getItem('@Rifo:projectName')
    const slug = localStorage.getItem('@Rifo:projectSlug')

    if (id && name && slug) {
      setActiveProject({ id, name, slug })
    }
  }, [])

  return (
    <ProjectContext.Provider
      value={{
        activeProjectId: activeProject.id,
        activeProjectName: activeProject.name,
        activeProjectSlug: activeProject.slug,
        setActiveProject
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

ProjectProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export function useProject(): ProjectContextData {
  return useContext(ProjectContext)
}
