import React from 'react'
import type { AppProps } from 'next/app'

import { AuthProvider } from '../hooks/auth'
import { ProjectProvider } from '../hooks/project'

import '../styles/globals.css'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Component {...pageProps} />
      </ProjectProvider>
    </AuthProvider>
  )
}

export default MyApp
